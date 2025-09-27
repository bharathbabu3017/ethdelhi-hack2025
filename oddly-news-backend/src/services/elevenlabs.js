const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio(script, voiceId = "gnPxliFHTp6OK6tcoA6i") {
  try {
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: script,
      model_id: "eleven_flash_v2_5",
      output_format: "mp3_44100_128",
    });

    // Handle audio buffer
    let audioBuffer;
    if (Buffer.isBuffer(audio)) {
      audioBuffer = audio;
    } else if (audio instanceof Uint8Array) {
      audioBuffer = Buffer.from(audio);
    } else {
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      audioBuffer = Buffer.concat(chunks);
    }

    const estimatedDuration = Math.round(script.length / 12);

    return {
      audioBuffer,
      estimatedDuration,
      size: audioBuffer.length,
    };
  } catch (error) {
    console.error("ElevenLabs API Error:", error.message);
    throw error;
  }
}

module.exports = { generateAudio };
