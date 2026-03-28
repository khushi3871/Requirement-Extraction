const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true }, 
  description: { type: String, default: "Analysis workspace" },
  // Adding this field is crucial for the "Smart Sync" logic
  lastSync: { type: Date, default: Date.now }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);