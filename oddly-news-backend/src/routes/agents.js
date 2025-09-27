const express = require("express");
const router = express.Router();
const {
  getAgent,
  getAllAgents,
  saveBriefing,
  uploadAudio,
} = require("../services/supabase");
const { getPolymarketData } = require("../services/polymarket");
const { getNewsContext } = require("../services/perplexity");
const { extractMarketInsights, generateScript } = require("../services/openai");
const { generateAudio } = require("../services/elevenlabs");
const TAG_MAPPING = require("../utils/tagMapping");

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

// Generate briefing - FULL PIPELINE
router.get("/:topic/generate", async (req, res) => {
  try {
    console.log(`Starting briefing generation for: ${req.params.topic}`);

    // 1. Get agent config
    const agent = await getAgent(req.params.topic);

    // 2. Get Polymarket data
    const polymarketData = await getPolymarketData(agent.tag_id);
    if (!polymarketData || polymarketData.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No market data found for this topic",
      });
    }

    // 3. Extract insights and generate search queries
    const analysis = await extractMarketInsights(polymarketData);

    // 4. Get news context
    const newsData = await getNewsContext(analysis.searchQueries);

    // 5. Generate script
    const script = await generateScript(req.params.topic, analysis, newsData);

    // 6. Generate audio
    const audioResult = await generateAudio(script, agent.voice_id);

    // 7. Upload to Supabase Storage
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `${req.params.topic}-briefing-${timestamp}.mp3`;
    const audioUrl = await uploadAudio(audioResult.audioBuffer, filename);

    // 8. Save briefing to database
    const briefingData = {
      agent_id: agent.id,
      script: script,
      audio_url: audioUrl,
      audio_duration: audioResult.estimatedDuration,
      market_count: polymarketData.length,
      news_query_count: analysis.searchQueries.length,
      polymarket_data: polymarketData,
      news_data: newsData,
      metadata: {
        timestamp,
        filename,
        audioSize: audioResult.size,
      },
    };

    const savedBriefing = await saveBriefing(briefingData);

    res.json({
      success: true,
      briefing: {
        id: savedBriefing.id,
        script: savedBriefing.script,
        audioUrl: savedBriefing.audio_url,
        duration: savedBriefing.audio_duration,
        marketCount: savedBriefing.market_count,
        createdAt: savedBriefing.created_at,
      },
      agent: {
        topic: agent.topic,
        displayName: agent.display_name,
        ensSubdomain: agent.ens_subdomain,
      },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
