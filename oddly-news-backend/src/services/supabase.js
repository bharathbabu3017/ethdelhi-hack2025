const { createClient } = require("@supabase/supabase-js");

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
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  supabaseAdmin,
  uploadAudio,
  saveBriefing,
  getAgent,
  getAllAgents,
};
