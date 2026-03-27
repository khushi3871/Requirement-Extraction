const express = require("express");
const router = express.Router();
const axios = require("axios");
const Requirement = require("../models/Requirement");
const Project = require("../models/Project");

// --- UPDATED ROUTE: WORK VELOCITY TRACKING BY INPUT COUNT ---
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId, range } = req.query;

    let matchStage = { userId: userId };

    if (projectId && projectId !== "All Projects") {
      matchStage.project_id = projectId;
    }

    // Time-range filtering
    if (range === "Today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: start };
    } else if (range === "Monthly") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: start };
    }

    const stats = await Requirement.aggregate([
      { $match: matchStage },
      {
        $facet: {
          // Facet 1: General Totals (ROI, Stakeholders, Noise)
          totals: [
            {
              $group: {
                _id: null,
                totalRawChars: {
                  $sum: { $strLenCP: { $ifNull: ["$raw_text", ""] } },
                },
                funcCount: {
                  $sum: {
                    $size: {
                      $ifNull: [
                        "$analysis_details.functional_requirements",
                        [],
                      ],
                    },
                  },
                },
                nonFuncCount: {
                  $sum: {
                    $size: {
                      $ifNull: [
                        "$analysis_details.non_functional_requirements",
                        [],
                      ],
                    },
                  },
                },
                stakeholders: { $addToSet: "$analysis_details.stakeholders" },
              },
            },
          ],
          // Facet 2: Weekly Velocity (Counts the number of Input Events)
          weeklyVelocity: [
            {
              $group: {
                _id: { $dayOfWeek: { $ifNull: ["$createdAt", new Date()] } },
                totalInputs: { $sum: 1 }, // 🔥 Counts each document as 1 Workspace Input
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
      {
        $project: {
          totalRawChars: {
            $ifNull: [{ $arrayElemAt: ["$totals.totalRawChars", 0] }, 0],
          },
          funcCount: {
            $ifNull: [{ $arrayElemAt: ["$totals.funcCount", 0] }, 0],
          },
          nonFuncCount: {
            $ifNull: [{ $arrayElemAt: ["$totals.nonFuncCount", 0] }, 0],
          },
          uniqueStakeholders: {
            $size: {
              $reduce: {
                input: {
                  $ifNull: [{ $arrayElemAt: ["$totals.stakeholders", 0] }, []],
                },
                initialValue: [],
                in: { $setUnion: ["$$value", "$$this"] },
              },
            },
          },
          weeklyHistory: "$weeklyVelocity",
        },
      },
    ]);

    res.json(
      stats[0] || {
        totalRawChars: 0,
        funcCount: 0,
        nonFuncCount: 0,
        uniqueStakeholders: 0,
        weeklyHistory: [],
      },
    );
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ error: "Analytics failed", details: error.message });
  }
});

// --- REMAINDER OF FILE ---

router.post("/projects", async (req, res) => {
  try {
    const { name, userId, description } = req.body;
    const newProject = new Project({
      name,
      userId,
      description: description || "Requirement Analysis Workspace",
    });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: "Could not create project" });
  }
});

router.post("/save-analysis", async (req, res) => {
  try {
    const {
      project_id,
      userId,
      analysis_details,
      predicted_category,
      raw_text,
    } = req.body;
    const newRecord = new Requirement({
      project_id,
      userId,
      predicted_category,
      analysis_details,
      raw_text,
      source: req.body.source || "Manual Save",
    });
    const saved = await newRecord.save();
    res.status(200).json({ message: "Analysis saved!", id: saved._id });
  } catch (error) {
    res.status(500).json({ error: "Failed to save analysis" });
  }
});

router.get("/projects/:userId", async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch projects" });
  }
});

router.post("/analyze-requirements", async (req, res) => {
  const { text, projectId, userId } = req.body;
  if (!projectId || !userId)
    return res.status(400).json({ error: "Missing Context" });
  try {
    const mlResponse = await axios.post("http://127.0.0.1:8000/analyze", {
      text,
      project_id: projectId,
      source_type: "Manual",
    });
    const mlData = mlResponse.data;
    const newRequirement = new Requirement({
      project_id: projectId,
      userId,
      source: mlData.metadata?.source || "Manual Input",
      predicted_category: mlData.predicted_category,
      analysis_details: {
        functional_requirements:
          mlData.analysis_details["Functional Requirements"] || [],
        non_functional_requirements:
          mlData.analysis_details["Non Functional Requirements"] || [],
        stakeholders: mlData.analysis_details["Stakeholders"] || [],
        decisions: mlData.analysis_details["Decisions"] || [],
        timelines: mlData.analysis_details["Timelines"] || [],
        priority: mlData.analysis_details["Feature Priority"] || [],
      },
      raw_text: text,
    });
    const savedData = await newRequirement.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ error: "AI Extraction Failed" });
  }
});

router.get("/history/:projectId/:userId", async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const history = await Requirement.find({
      project_id: projectId,
      userId,
    }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

module.exports = router;
