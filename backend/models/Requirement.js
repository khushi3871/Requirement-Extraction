const mongoose = require("mongoose");

const RequirementSchema = new mongoose.Schema(
  {
    // Link to the project and the specific Clerk User
    project_id: { type: String, required: true },
    userId: { type: String, required: true },

    source: { type: String, default: "Email" },
    predicted_category: String,
    analysis_details: {
      functional_requirements: [String],
      non_functional_requirements: [String],
      stakeholders: [String],
      decisions: [String],
      timelines: [String],
      priority: [String],
    },
    raw_text: String,
    // ❌ REMOVED: manual createdAt: { type: Date, default: Date.now }
  },
  {
    // ✅ ADDED: This automatically handles createdAt and updatedAt as official BSON dates
    timestamps: true,
  },
);

module.exports = mongoose.model("Requirement", RequirementSchema);
