const { createClient } = require("@supabase/supabase-js");
const { generateWalletFromSeed, getNextWalletIndex } = require("./wallet");
const { registerSubdomain, isSubdomainAvailable } = require("./ens");

// Regular client for reads
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for uploads (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadAudio(audioBuffer, filename) {
  // Use admin client for upload
  const { data, error } = await supabaseAdmin.storage
    .from("briefing-audio")
    .upload(filename, audioBuffer, {
      contentType: "audio/mpeg",
    });

  if (error) throw error;

  // Get public URL using regular client
  const { data: publicData } = supabase.storage
    .from("briefing-audio")
    .getPublicUrl(filename);

  return publicData.publicUrl;
}

async function saveBriefing(briefingData) {
  // Use admin client for database writes too
  const { data, error } = await supabaseAdmin
    .from("briefings")
    .insert(briefingData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Keep these using regular client
async function getAgent(topic) {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("topic", topic)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
}

async function getAllAgents() {
  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  if (error) throw error;

  // Get the latest briefing for each agent
  const agentsWithLastGenerated = await Promise.all(
    agents.map(async (agent) => {
      const { data: latestBriefing } = await supabase
        .from("briefings")
        .select("created_at")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...agent,
        lastGenerated: latestBriefing?.created_at || null,
      };
    })
  );

  return agentsWithLastGenerated;
}

/**
 * Creates a new agent with wallet and ENS subdomain
 * @param {object} agentData - Agent data (topic, display_name, description, etc.)
 * @returns {Promise<object>} Created agent with wallet and ENS info
 */
async function createAgentWithWallet(agentData) {
  const { topic, display_name, description, tag_id, voice_id } = agentData;

  try {
    // 1. Get master seed phrase from environment
    const masterSeed = process.env.MASTER_SEED_PHRASE;
    if (!masterSeed) {
      throw new Error("MASTER_SEED_PHRASE not found in environment variables");
    }

    // 2. Get all existing agents to determine next wallet index
    const existingAgents = await supabaseAdmin
      .from("agents")
      .select("wallet_index")
      .order("wallet_index", { ascending: false });

    const nextIndex = getNextWalletIndex(existingAgents.data);

    // 3. Generate wallet for this agent
    const walletInfo = generateWalletFromSeed(masterSeed, nextIndex);

    // 4. Check if ENS subdomain is available
    const ensSubdomain = `${topic}.oddly.eth`;
    const isAvailable = await isSubdomainAvailable(topic);
    if (!isAvailable) {
      throw new Error(`ENS subdomain ${ensSubdomain} is already taken`);
    }

    // 5. Create agent in database first
    const { data: newAgent, error: dbError } = await supabaseAdmin
      .from("agents")
      .insert({
        topic,
        display_name,
        description,
        tag_id,
        voice_id,
        wallet_address: walletInfo.address,
        wallet_index: nextIndex,
        ens_subdomain: ensSubdomain,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 6. Register ENS subdomain on blockchain
    try {
      const ensResult = await registerSubdomain(topic, walletInfo.address);

      // 7. Update agent with ENS registration info
      const { data: updatedAgent, error: updateError } = await supabaseAdmin
        .from("agents")
        .update({
          ens_registered_at: new Date().toISOString(),
          ens_transaction_hash: ensResult.transactionHash,
        })
        .eq("id", newAgent.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log(`✅ Agent created successfully:`, {
        id: updatedAgent.id,
        topic: updatedAgent.topic,
        wallet: walletInfo.address,
        subdomain: ensSubdomain,
        txHash: ensResult.transactionHash,
      });

      return {
        ...updatedAgent,
        walletInfo: {
          address: walletInfo.address,
          derivationPath: walletInfo.derivationPath,
        },
        ensInfo: ensResult,
      };
    } catch (ensError) {
      console.error("ENS registration failed:", ensError);

      // Mark agent as having failed ENS registration but keep the agent
      await supabaseAdmin
        .from("agents")
        .update({
          ens_registered_at: null,
          ens_transaction_hash: null,
        })
        .eq("id", newAgent.id);

      throw new Error(
        `Agent created but ENS registration failed: ${ensError.message}`
      );
    }
  } catch (error) {
    console.error("Error creating agent with wallet:", error);
    throw error;
  }
}

/**
 * Updates an existing agent's ENS registration
 * @param {number} agentId - Agent ID
 * @returns {Promise<object>} Updated agent with ENS info
 */
async function retryEnsRegistration(agentId) {
  try {
    // Get agent info
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (error) throw error;

    if (!agent.wallet_address) {
      throw new Error("Agent does not have a wallet address");
    }

    // Extract topic from subdomain
    const topic = agent.ens_subdomain.replace(".oddly.eth", "");

    // Register ENS subdomain
    const ensResult = await registerSubdomain(topic, agent.wallet_address);

    // Update agent with ENS registration info
    const { data: updatedAgent, error: updateError } = await supabaseAdmin
      .from("agents")
      .update({
        ens_registered_at: new Date().toISOString(),
        ens_transaction_hash: ensResult.transactionHash,
      })
      .eq("id", agentId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      ...updatedAgent,
      ensInfo: ensResult,
    };
  } catch (error) {
    console.error("Error retrying ENS registration:", error);
    throw error;
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  uploadAudio,
  saveBriefing,
  getAgent,
  getAllAgents,
  createAgentWithWallet,
  retryEnsRegistration,
};
