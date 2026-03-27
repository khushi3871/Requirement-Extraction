const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Path should ONLY be '/sync-user'
// routes/userroutes.js
// routes/userroutes.js
router.post('/sync-user', async (req, res) => {
    try {
        const { clerkId, email } = req.body;

        // The filter is ONLY the clerkId. 
        // If it exists, it updates. If not, it creates.
        const user = await User.findOneAndUpdate(
            { clerkId: clerkId }, 
            { $set: { email: email } }, 
            { 
                upsert: true, 
                returnDocument: 'after', // Fixes the Mongoose warning
                runValidators: false    // Prevents old "Unique" indexes from blocking the update
            }
        );

        console.log("✅ User Updated/Synced:", user.email);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Sync Error:", error);
        res.status(500).json({ error: "Could not update user" });
    }
});
module.exports = router;