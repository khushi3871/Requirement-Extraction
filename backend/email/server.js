const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const User = require("../models/User");
const Project = require("../models/Project");
const Requirement = require("../models/Requirement");

const router = express.Router();

// --- 1. INITIALIZATION & HELPERS ---

/**
 * Robustly extracts the plain text body from Gmail's multi-part payload.
 */
function getEmailBody(payload) {
    let body = "";
    if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
    } else if (payload.parts) {
        for (const part of payload.parts) {
            // Priority 1: Look for plain text parts
            if (part.mimeType === 'text/plain' && part.body.data) {
                body += Buffer.from(part.body.data, 'base64').toString();
            } 
            // Priority 2: Recurse into nested parts if necessary
            else if (part.parts) {
                body += getEmailBody(part);
            }
        }
    }
    return body;
}

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌ ERROR: credentials.json not found at:", CREDENTIALS_PATH);
}

const CREDENTIALS = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
const config = CREDENTIALS.web || CREDENTIALS.installed;

console.log("🛠️ Google Client ID:", config ? config.client_id : "MISSING");

const oAuth2Client = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    "http://localhost:5000/api/oauth2callback" 
);

// --- 2. ROUTES ---

// Login Route: Generates Google Consent URL
router.get("/login", (req, res) => {
    const { userId } = req.query; 
    const url = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        state: userId, 
        scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });
    res.redirect(url);
});

// OAuth Callback: Stores Refresh Tokens in MongoDB
router.get("/oauth2callback", async (req, res) => {
    try {
        const { code, state } = req.query; 
        const { tokens } = await oAuth2Client.getToken(code);

        await User.findOneAndUpdate(
            { clerkId: state },
            { 
                $set: { 
                    googleTokens: tokens,
                    lastGlobalSync: new Date() 
                } 
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log("🔑 Google Tokens attached to User:", state);
        // Ensure this matches your frontend port (3000, 3001, or 5173)
        res.redirect("http://localhost:5173/select-project?auth=success"); 
    } catch (error) {
        console.error("❌ Token Save Error:", error);
        res.status(500).send("Auth failed");
    }
});

// GLOBAL SYNC: The Engine that pulls emails and sends them to AI
// GLOBAL SYNC: The Engine that pulls emails and sends them to AI
router.post("/global-sync", async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findOne({ clerkId: userId });

        // 1. STRICTOR AUTH CHECK
        // Check if user exists and has a refresh_token (refresh_token is what allows long-term sync)
        if (!user || !user.googleTokens || !user.googleTokens.refresh_token) {
            console.log("⚠️ No valid tokens found for user, requesting auth...");
            return res.json({ 
                status: "AUTH_REQUIRED", 
                url: `http://localhost:5000/api/login?userId=${userId}` 
            });
        }

        // 2. INITIALIZE THE CLIENT (This was missing/misplaced in your code)
        const client = new google.auth.OAuth2(
            config.client_id,
            config.client_secret,
            "http://localhost:5000/api/oauth2callback"
        );

        // 3. SET THE CREDENTIALS
        client.setCredentials(user.googleTokens);

        // 4. AUTO-SAVE REFRESHED TOKENS
        client.on('tokens', async (tokens) => {
            console.log("🔄 Saving newly refreshed tokens to DB...");
            await User.findOneAndUpdate(
                { clerkId: userId },
                { $set: { googleTokens: { ...user.googleTokens, ...tokens } } }
            );
        });

        const gmail = google.gmail({ version: "v1", auth: client });

        // 5. DEFINE TIME RANGE
        const oneWeekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
        const lastSyncUnix = user.lastGlobalSync ? Math.floor(user.lastGlobalSync.getTime() / 1000) : oneWeekAgo;
        
        const query = `after:${lastSyncUnix}`; 
        console.log("🔍 Fetching emails since:", new Date(lastSyncUnix * 1000).toLocaleString());

        const listRes = await gmail.users.messages.list({ userId: "me", q: query });

        if (!listRes.data.messages || listRes.data.messages.length === 0) {
            return res.json({ success: true, message: "Your inbox is up to date. No new requirements found." });
        }

        const projects = await Project.find({ userId });
        let syncedCount = 0;

        // 6. PROCESSING LOOP
        for (const msg of listRes.data.messages) {
            const detail = await gmail.users.messages.get({ userId: "me", id: msg.id });
            const payload = detail.data.payload;
            
            const subject = payload.headers.find(h => h.name === 'Subject')?.value || "No Subject";
            const body = getEmailBody(payload);

            if (!body.trim()) continue;

            // Matching Logic: Look for project name in Subject or Body
            const matchedProject = projects.find(p => 
                subject.toLowerCase().includes(p.name.toLowerCase()) ||
                body.toLowerCase().includes(p.name.toLowerCase())
            );

            if (matchedProject) {
                console.log(`🎯 Match! Project: ${matchedProject.name} | Subject: ${subject}`);
                
                try {
                    const mlResponse = await axios.post("http://127.0.0.1:8000/analyze", {
                        text: body,
                        project_id: matchedProject._id
                    });

                    const mlData = mlResponse.data;

                    const newReq = new Requirement({
                        project_id: matchedProject._id,
                        userId: userId,
                        source: "Gmail Sync",
                        raw_text: body,
                        predicted_category: mlData.predicted_category || "Uncategorized",
                        analysis_details: {
                            functional_requirements: mlData.analysis_details?.["Functional Requirements"] || [],
                            non_functional_requirements: mlData.analysis_details?.["Non Functional Requirements"] || [],
                            stakeholders: mlData.analysis_details?.["Stakeholders"] || [],
                            decisions: mlData.analysis_details?.["Decisions"] || [],
                            timelines: mlData.analysis_details?.["Timelines"] || [],
                            priority: mlData.analysis_details?.["Feature Priority"] || [],
                        }
                    });

                    await newReq.save();
                    syncedCount++;
                } catch (mlErr) {
                    console.error(`❌ AI Analysis failed for: ${subject}`, mlErr.message);
                }
            }
        }

        // 7. FINALIZE SYNC
        user.lastGlobalSync = new Date();
        await user.save();

        res.json({ 
            success: true, 
            message: syncedCount > 0 
                ? `Successfully imported ${syncedCount} requirements!` 
                : "Sync finished, but no emails matched your project names." 
        });

    } catch (err) {
        console.error("🔥 Critical Sync Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error during sync." });
    }
});

module.exports = router;