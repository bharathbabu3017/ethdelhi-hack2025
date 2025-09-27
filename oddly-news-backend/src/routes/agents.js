const express = require("express");
const router = express.Router();
const { getAgent, getAllAgents } = require("../services/supabase");

// Get all agents
router.get("/", async (req, res) => {
  try {
    const agents = await getAllAgents();
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific agent info
router.get("/:topic", async (req, res) => {
  try {
    const agent = await getAgent(req.params.topic);
    res.json({ success: true, agent });
  } catch (error) {
    res.status(404).json({ success: false, error: "Agent not found" });
  }
});

// Generate briefing (placeholder for now)
router.get("/:topic/generate", async (req, res) => {
  try {
    const agent = await getAgent(req.params.topic);

    // For now, just return agent info
    // We'll add the full pipeline next
    res.json({
      success: true,
      message: "Pipeline not implemented yet",
      agent,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
