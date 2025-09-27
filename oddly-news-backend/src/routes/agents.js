const express = require("express");
const router = express.Router();
const {
  getAgent,
  getAllAgents,
  saveBriefing,
  uploadAudio,
  supabase,
  supabaseAdmin,
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

router.get("/:topic/generate", async (req, res) => {
  try {
    console.log(`Checking for recent briefings for: ${req.params.topic}`);

    // Check if user is forcing a fresh generation
    const forceNew = req.query.force === "true";
    console.log(`Force new generation: ${forceNew}`);

    // 1. Get agent config
    const agent = await getAgent(req.params.topic);

    // Only check for recent briefings if not forcing new generation
    if (!forceNew) {
      const thirtyMinutesAgo = new Date(
        Date.now() - 30 * 60 * 1000
      ).toISOString();

      console.log(`Looking for briefings newer than: ${thirtyMinutesAgo}`);

      const { data: recentBriefings } = await supabaseAdmin
        .from("briefings")
        .select("*")
        .eq("agent_id", agent.id)
        .gte("created_at", thirtyMinutesAgo) // Only get briefings from last 30 min
        .order("created_at", { ascending: false })
        .limit(1);

      console.log(`Found ${recentBriefings?.length || 0} recent briefings`);

      if (recentBriefings && recentBriefings.length > 0) {
        const latestBriefing = recentBriefings[0];

        // Ensure we're comparing times in the same timezone
        // Supabase returns timestamps in UTC, but without 'Z' suffix
        const briefingTimeStr = latestBriefing.created_at.endsWith("Z")
          ? latestBriefing.created_at
          : latestBriefing.created_at + "Z";

        const briefingTime = new Date(briefingTimeStr);
        const now = new Date();
        const diffMinutes = (now - briefingTime) / (1000 * 60);

        console.log(
          `Latest briefing: ${briefingTimeStr}, diff: ${diffMinutes.toFixed(
            1
          )} minutes`
        );
        console.log(
          `Now: ${now.toISOString()}, Briefing: ${briefingTime.toISOString()}`
        );

        if (diffMinutes <= 30) {
          console.log("Found recent briefing, using cached version");
          return res.json({
            success: true,
            briefing: {
              id: latestBriefing.id,
              script: latestBriefing.script,
              audioUrl: latestBriefing.audio_url,
              duration: latestBriefing.audio_duration,
              marketCount: latestBriefing.market_count,
              marketStats: latestBriefing.market_stats,
              aiInsights: latestBriefing.ai_insights,
              createdAt: latestBriefing.created_at,
            },
            agent: {
              topic: agent.topic,
              displayName: agent.display_name,
              ensSubdomain: agent.ens_subdomain,
            },
            cached: true,
          });
        } else {
          console.log(
            `Briefing too old: ${diffMinutes.toFixed(1)} minutes > 30 minutes`
          );
        }
      }
    }

    console.log(
      `${
        forceNew ? "Force generating" : "No recent briefing found, generating"
      } new briefing...`
    );

    // 3. Generate new briefing (your existing code continues here...)
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

    // 5. Generate script and insights
    const scriptResult = await generateScript(
      req.params.topic,
      analysis,
      newsData
    );

    // 6. Generate audio
    const audioResult = await generateAudio(
      scriptResult.script,
      agent.voice_id
    );

    // 7. Upload to Supabase Storage
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `${req.params.topic}-briefing-${timestamp}.mp3`;
    const audioUrl = await uploadAudio(audioResult.audioBuffer, filename);

    // 8. Save briefing to database
    const briefingData = {
      agent_id: agent.id,
      script: scriptResult.script,
      audio_url: audioUrl,
      audio_duration: audioResult.estimatedDuration,
      market_count: polymarketData.length,
      news_query_count: analysis.searchQueries.length,
      polymarket_data: polymarketData,
      news_data: newsData,
      market_stats: analysis.marketStats,
      ai_insights: scriptResult.aiInsights,
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
        marketStats: savedBriefing.market_stats,
        aiInsights: savedBriefing.ai_insights,
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

router.get("/:topic/history", async (req, res) => {
  try {
    const agent = await getAgent(req.params.topic);

    const { data, error } = await supabaseAdmin
      .from("briefings")
      .select("*")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ success: true, briefings: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
