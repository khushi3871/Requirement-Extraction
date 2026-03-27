require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// --- 1. Import Route Files ---
const analyzeRoute = require('./routes/analyze');
const emailRoute = require('./email/server'); // Merged Gmail/Global Sync features
const userroute = require('./routes/userroutes'); // Merged Clerk User Sync features

const app = express();

// --- 2. Global Middleware ---
app.use(cors({
    // Combines all allowed origins from both versions
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
}));

app.use(express.json());

// Request Logger for debugging 404s and payloads
app.use((req, res, next) => {
    console.log(`📢 ${req.method} request to ${req.url}`);
    next();
});

// --- 3. Mount Routes ---
app.use('/api', userroute);    // Handles Clerk User Sync (POST/PUT /api/sync-user)
app.use('/api', analyzeRoute); // Handles AI analysis (/api/analyze)
app.use('/api', emailRoute);   // Handles Gmail login and Global Email Sync

// --- 4. JIRA OAUTH 2.0 CALLBACK ---
app.get('/api/auth/jira/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Authorization failed: No code received from Jira.");
    }

    try {
        const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.JIRA_CALLBACK_URL
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("✅ Jira OAuth Success! Token obtained.");

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #141121; color: white; height: 100vh; display: flex; align-items: center; justify-content: center;">
                <div style="background: #1c1a2e; padding: 40px; border-radius: 20px; border: 1px solid #4729e0; max-width: 400px;">
                    <h1 style="color: #4729e0; margin-bottom: 10px;">Jira Linked!</h1>
                    <p style="color: #cbd5e1;">ReqMind AI is now authorized to sync with your workspace.</p>
                    <div style="margin: 25px 0; padding: 15px; background: rgba(71, 41, 224, 0.1); border-radius: 10px; color: #4729e0; font-weight: bold;">
                        Connection Status: ACTIVE
                    </div>
                    <a href="http://localhost:3001/workplace?jira=connected" style="text-decoration: none; display: inline-block; padding: 12px 28px; background: #4729e0; color: white; border-radius: 8px; font-weight: bold;">
                        Return to Dashboard
                    </a>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("❌ Jira OAuth Error:", error.response?.data || error.message);
        res.status(500).send("Jira handshake failed.");
    }
});

// --- 5. JIRA SYNC ROUTE ---
app.post('/api/jira-sync', async (req, res) => {
    const { requirements, projectKey } = req.body;
    const domain = process.env.JIRA_DOMAIN;
    const emailAddr = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const auth = Buffer.from(`${emailAddr}:${token}`).toString('base64');

    try {
        const issuesCreated = [];
        for (const reqText of requirements) {
            let cleanSummary = reqText.replace(/[\r\n]+/gm, " ").trim();
            // Jira summaries max 255 chars
            if (cleanSummary.length > 250) cleanSummary = cleanSummary.substring(0, 247) + "...";

            const jiraIssue = {
                fields: {
                    project: { key: (projectKey || 'KAN').toUpperCase() },
                    summary: cleanSummary,
                    description: reqText,
                    issuetype: { name: 'Task' },
                    // Using accountId as required by newer Jira APIs
                    assignee: { accountId: process.env.JIRA_ACCOUNT_ID }
                }
            };

            const response = await axios.post(
                `https://${domain}/rest/api/2/issue`,
                jiraIssue,
                { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
            );
            issuesCreated.push(response.data.key);
        }
        res.status(200).json({ success: true, issues: issuesCreated });
    } catch (error) {
        console.error("❌ Jira Sync Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to sync with Jira" });
    }
});

// --- 6. MongoDB Connection ---
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';
mongoose.connect(mongoURI)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// Root route
app.get('/', (req, res) => res.send('ReqMind AI Backend Bridge Live'));

// --- 7. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔗 Jira Callback: http://localhost:${PORT}/api/auth/jira/callback`);
});