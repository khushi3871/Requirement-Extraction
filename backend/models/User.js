const mongoose = require('mongoose'); // <--- THIS WAS MISSING

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String }, 
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },
  lastGlobalSync: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);