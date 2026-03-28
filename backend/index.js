require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// --- 1. Import Route Files ---
const analyzeRoute = require('./routes/analyze');
const emailRoute = require('./email/server'); // Your Gmail/Google Logic
const userRoute = require('./routes/userroutes'); // Your Clerk Sync Logic

const app = express();

// --- 2. Global Middleware (MUST be first) ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
}));

app.use(express.json());

// Request Logger for debugging
app.use((req, res, next) => {
    console.log(`📢 ${req.method} request to ${req.url}`);
    next();
});

// --- 3. Mount Routes ---
app.use('/api', userRoute);    // Handles /api/sync-user
app.use('/api', analyzeRoute); // Handles /api/analyze
app.use('/api', emailRoute);   // Handles /api/login, /api/global-sync, etc.

// --- 4. JIRA OAUTH CALLBACK ---
app.get('/api/auth/jira/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code received from Jira.");

    try {
        const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.JIRA_CALLBACK_URL
        });
        console.log("✅ Jira OAuth Success!");
        res.send(`<h1>Jira Linked!</h1><p>You can close this window.</p>`);
    } catch (error) {
        console.error("❌ Jira OAuth Error:", error.message);
        res.status(500).send("Jira handshake failed.");
    }
});

// --- 5. JIRA SYNC ROUTE ---
app.post('/api/jira-sync', async (req, res) => {
    const { requirements, projectKey } = req.body;
    const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

    try {
        const issuesCreated = [];
        for (const reqText of requirements) {
            let cleanSummary = reqText.replace(/[\r\n]+/gm, " ").trim().substring(0, 250);
            const response = await axios.post(
                `https://${process.env.JIRA_DOMAIN}/rest/api/2/issue`,
                {
                    fields: {
                        project: { key: projectKey || 'KAN' },
                        summary: cleanSummary,
                        description: reqText,
                        issuetype: { name: 'Task' }
                    }
                },
                { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
            );
            issuesCreated.push(response.data.key);
        }
        res.status(200).json({ success: true, issues: issuesCreated });
    } catch (error) {
        res.status(500).json({ error: "Jira sync failed" });
    }
});

// --- 6. MongoDB & Server ---
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';
mongoose.connect(mongoURI)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

app.get('/', (req, res) => res.send('ReqMind AI Backend Bridge Live'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});