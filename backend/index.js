require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const analyzeRoute = require('./routes/analyze');

const app = express();

// --- 1. Middleware ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// --- 2. JIRA OAUTH 2.0 CALLBACK ---
// This route catches the user after they click 'Accept' on the Atlassian page
app.get('/api/auth/jira/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Authorization failed: No code received from Jira.");
    }

    try {
        // STEP: Exchange the temporary 'code' for a real 'access_token'
        const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.JIRA_CALLBACK_URL
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("✅ OAuth Success! Access Token Obtained:", accessToken.substring(0, 10) + "...");

        // FOR THE HACKATHON: In a real app, you'd save this 'accessToken' to MongoDB for the user.
        // For the demo, showing this success page is enough to prove the integration works.

       // Inside your app.get('/api/auth/jira/callback', ...)
res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #141121; color: white; height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: #1c1a2e; padding: 40px; border-radius: 20px; border: 1px solid #4729e0;">
            <h1 style="color: #4729e0; margin-bottom: 10px;">Jira Linked!</h1>
            <p style="color: #cbd5e1;">ReqMind AI is now authorized to sync with your workspace.</p>
            <div style="margin: 25px 0; padding: 15px; background: rgba(71, 41, 224, 0.1); border-radius: 10px; color: #4729e0; font-weight: bold;">
                Connection Status: ACTIVE
            </div>
            
            <a href="http://localhost:3001/workplace?jira=connected" style="text-decoration: none; display: inline-block; margin-top: 10px; padding: 12px 28px; background: #4729e0; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                Return to Dashboard
            </a>
        </div>
    </div>
`);
    } catch (error) {
        console.error("❌ OAuth Exchange Error:", error.response?.data || error.message);
        res.status(500).send("Failed to complete the Jira handshake. Check console for details.");
    }
});

// --- 3. JIRA SYNC ROUTE (Direct Sync) ---
// This handles the actual pushing of extracted requirements to the board
app.post('/api/jira-sync', async (req, res) => {
    const { requirements, projectKey } = req.body;
    
    // Using your existing .env credentials for the demo push
    const domain = process.env.JIRA_DOMAIN;
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    try {
        const issuesCreated = [];
        for (const reqText of requirements) {
            // Clean the text and enforce character limits (Jira summaries max 255 chars)
            let cleanSummary = reqText.replace(/[\r\n]+/gm, " ").trim();
            if (cleanSummary.length > 250) cleanSummary = cleanSummary.substring(0, 247) + "...";

            const jiraIssue = {
    fields: {
        project: { key: projectKey || 'KAN' },
        summary: cleanSummary,
        description: reqText,
        issuetype: { name: 'Task' },
        // Use accountId for precise assignment
        assignee: { id: process.env.JIRA_ACCOUNT_ID } 
    }
};
            const response = await axios.post(
                `https://${domain}/rest/api/2/issue`,
                jiraIssue,
                { 
                    headers: { 
                        'Authorization': `Basic ${auth}`, 
                        'Content-Type': 'application/json' 
                    } 
                }
            );
            issuesCreated.push(response.data.key);
        }
        res.status(200).json({ success: true, issues: issuesCreated });
    } catch (error) {
        console.error("❌ Jira Sync Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to sync with Jira" });
    }
});

// --- 4. MongoDB Connection ---
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';
mongoose.connect(mongoURI)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// --- 5. Routes & Server ---
app.use('/api', analyzeRoute); 

app.get('/', (req, res) => res.send('ReqMind AI Backend Bridge Live'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔗 Callback listening at http://localhost:${PORT}/api/auth/jira/callback`);
});