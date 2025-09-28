const express = require("express");
const { createAgentWithWallet } = require("../services/supabase");

const router = express.Router();

/**
 * POST /api/create-agent
 * Creates a new agent with wallet and ENS subdomain from frontend
 */
router.post("/", async (req, res) => {
  try {
    const { topic, display_name, description, tag_id, voice_id } = req.body;

    // Validate required fields
    if (!topic || !display_name || !tag_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: topic, display_name, tag_id",
      });
    }

    // Validate topic format (should be lowercase, no spaces, alphanumeric + hyphens)
    const topicRegex = /^[a-z0-9-]+$/;
    if (!topicRegex.test(topic)) {
      return res.status(400).json({
        success: false,
        error:
          "Topic must be lowercase letters, numbers, and hyphens only (e.g., 'crypto-prices')",
      });
    }

    // Check topic length
    if (topic.length < 3 || topic.length > 20) {
      return res.status(400).json({
        success: false,
        error: "Topic must be between 3 and 20 characters",
      });
    }

    console.log(`Creating new agent from frontend: ${topic}`);

    // Use default voice if not provided
    const finalVoiceId = voice_id || "gnPxliFHTp6OK6tcoA6i";

    const agent = await createAgentWithWallet({
      topic,
      display_name,
      description: description || `Market intelligence for ${display_name}`,
      tag_id,
      voice_id: finalVoiceId,
    });

    console.log(`✅ Agent created successfully: ${agent.topic}`);

    res.json({
      success: true,
      message: "Agent created successfully!",
      agent: {
        id: agent.id,
        topic: agent.topic,
        display_name: agent.display_name,
        description: agent.description,
        tag_id: agent.tag_id,
        wallet_address: agent.wallet_address,
        ens_subdomain: agent.ens_subdomain,
        ens_registered_at: agent.ens_registered_at,
        ens_transaction_hash: agent.ens_transaction_hash,
        created_at: agent.created_at,
      },
      blockchain: {
        wallet_address: agent.walletInfo?.address,
        ens_subdomain: agent.ens_subdomain,
        transaction_hash: agent.ens_transaction_hash,
      },
    });
  } catch (error) {
    console.error("Error creating agent from frontend:", error);

    // Handle specific error types
    if (error.message.includes("already taken")) {
      return res.status(409).json({
        success: false,
        error: "This agent topic or ENS subdomain is already taken",
      });
    }

    if (error.message.includes("ENS registration failed")) {
      return res.status(500).json({
        success: false,
        error:
          "Agent created but ENS registration failed. Please try again or contact support.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to create agent",
    });
  }
});

module.exports = router;
