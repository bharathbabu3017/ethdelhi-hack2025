const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadAudio(audioBuffer, filename) {
  const { data, error } = await supabase.storage
    .from("briefing-audio")
    .upload(filename, audioBuffer, {
      contentType: "audio/mpeg",
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from("briefing-audio")
    .getPublicUrl(filename);

  return publicData.publicUrl;
}

async function saveBriefing(briefingData) {
  const { data, error } = await supabase
    .from("briefings")
    .insert(briefingData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

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
  uploadAudio,
  saveBriefing,
  getAgent,
  getAllAgents,
};
