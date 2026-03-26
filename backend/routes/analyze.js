const express = require('express');
const router = express.Router();
const axios = require('axios');
const Requirement = require('../models/Requirement');
const Project = require('../models/Project');

// 1. ROUTE: Create a new project
router.post('/projects', async (req, res) => {
  try {
    const { name, userId, description } = req.body;
    const newProject = new Project({
      name,
      userId,
      description: description || "Requirement Analysis Workspace"
    });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Project Creation Error:", error);
    res.status(500).json({ error: "Could not create project" });
  }
});

// ROUTE: Confirm & Save button logic
router.post('/save-analysis', async (req, res) => {
  try {
    const { project_id, userId, analysis_details, predicted_category, raw_text } = req.body;

    const newRecord = new Requirement({
      project_id,
      userId,
      predicted_category,
      analysis_details,
      raw_text,
      source: req.body.source || 'Manual Save'
    });

    const saved = await newRecord.save();
    
    // --- CLEANED LOG ---
    console.log("✅ Analysis Saved Successfully"); 
    
    res.status(200).json({ message: "Analysis saved to project history!", id: saved._id });
  } catch (error) {
    console.error("❌ Save Error:", error.message);
    res.status(500).json({ error: "Failed to save analysis", details: error.message });
  }
});

// 2. ROUTE: Get all projects for a specific user
router.get('/projects/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch projects" });
  }
});

router.post('/analyze-requirements', async (req, res) => {
  // --- REMOVED: console.log("Incoming Data:", req.body); ---
  // This was the one causing the giant wall of text.
  
  const { text, projectId, userId } = req.body;

  if (!projectId || !userId) {
    return res.status(400).json({ error: "Missing Project ID or User ID context." });
  }

  try {
    const mlResponse = await axios.post('http://localhost:8000/analyze', { text: text , 
      project_id: projectId, // This is the missing piece!
    source_type: "Manual"
    });
    const mlData = mlResponse.data;

    const newRequirement = new Requirement({
      project_id: projectId,
      userId: userId,
      source: mlData.metadata?.source || 'Manual Input',
      predicted_category: mlData.predicted_category,
      analysis_details: {
        // We take the "Space Names" from Python and save them into the "snake_case" Mongoose fields
        functional_requirements: mlData.analysis_details["Functional Requirements"] || [],
        non_functional_requirements: mlData.analysis_details["Non Functional Requirements"] || [],
        stakeholders: mlData.analysis_details["Stakeholders"] || [],
        decisions: mlData.analysis_details["Decisions"] || [],
        timelines: mlData.analysis_details["Timelines"] || [],
        priority: mlData.analysis_details["Feature Priority"] || []
      },
      raw_text: text
    });

    const savedData = await newRequirement.save();
    
    // Simple log to know it worked without the text dump
    console.log("🚀 AI Analysis complete and saved.");

    res.status(200).json(savedData);
  } catch (error) {
    console.error("Bridge Error:", error.message);
    res.status(500).json({ 
      error: "AI Extraction Failed", 
      message: error.message
    });
  }
});

router.get('/history/:projectId/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const history = await Requirement.find({ 
      project_id: projectId, 
      userId: userId 
    }).sort({ createdAt: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
});

module.exports = router;