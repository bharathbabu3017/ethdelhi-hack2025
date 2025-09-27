// test-pipeline-improved.js
require("dotenv").config();
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const fs = require("fs");
const path = require("path");

const POLYMARKET_BASE_URL = "https://gamma-api.polymarket.com";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/search";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Topic to tag_id mapping
const TAG_MAPPING = {
  politics: 126,
  crypto: 21,
  economy: 159,
  congress: 514,
  breaking: 2,
};

async function getPolymarketData(topic) {
  console.log(`\n1. Fetching Polymarket data for ${topic}...`);

  const tagId = TAG_MAPPING[topic];
  const url = `${POLYMARKET_BASE_URL}/events?limit=5&tag_id=${tagId}&order=volume24hr&ascending=false&closed=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(`✅ Found ${data.length} markets`);
    return data;
  } catch (error) {
    console.error("❌ Polymarket API Error:", error.message);
    return null;
  }
}

async function extractMarketInsights(polymarketData) {
  console.log("\n2. Extracting market insights...");

  const prompt = `Extract the key insights from this prediction market data, keep like the important stats and data in a simple and easy to understand format:

${JSON.stringify(polymarketData)}
`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content;

    console.log("✅ Market insights extracted");
    return insights;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    return null;
  }
}

async function getNewsContext(topic) {
  console.log("\n3. Fetching news context...");

  const query = `recent ${topic} news headlines current events`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        max_results: 5,
      }),
    });

    const data = await response.json();
    console.log("✅ News context retrieved");
    return data;
  } catch (error) {
    console.error("❌ Perplexity API Error:", error.message);
    return null;
  }
}

async function generateScript(topic, marketInsights, newsData) {
  console.log("\n4. Generating script...");

  const prompt = `You're a news anchor for oddly.news creating a solo radio briefing that compares prediction markets vs mainstream news. give yourself a male name if needed.

Topic: ${topic}

Market insights:
${marketInsights}

Recent news:
${JSON.stringify(newsData)}

Create a radio script as a single news anchor maybe for about 60-90 seconds. Make it sound engaging and interesting  - like someone would actually want to listen to. You need to be clear in delivering the news, rather than quantity, more clear useful news delivery is more important.   also give some stats on prediction markets that sounds interesting. Just generate a script in such a way that it can be passed on to a text to speech API, so just have text, no symbols etc etc.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;

    console.log("✅ Script generated successfully");
    return script;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    return null;
  }
}

async function generateAudio(script, topic) {
  console.log("\n5. Generating audio...");

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    console.log("Converting script to audio...");
    console.log("Script length:", script.length, "characters");

    const audio = await elevenlabs.textToSpeech.convert(
      "gnPxliFHTp6OK6tcoA6i",
      {
        text: script,
        model_id: "eleven_flash_v2_5",
        output_format: "mp3_44100_128",
      }
    );

    // Create audio directory if it doesn't exist
    const audioDir = "generated-audio";
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = path.join(audioDir, `${topic}-briefing-${timestamp}.mp3`);

    // Handle audio buffer
    let audioBuffer;
    if (Buffer.isBuffer(audio)) {
      audioBuffer = audio;
    } else if (audio instanceof Uint8Array) {
      audioBuffer = Buffer.from(audio);
    } else {
      // If it's a readable stream, convert to buffer
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      audioBuffer = Buffer.concat(chunks);
    }

    fs.writeFileSync(filename, audioBuffer);

    console.log("✅ Audio generated successfully");
    console.log(`🎵 Audio saved as: ${filename}`);
    console.log(`📁 File size: ${audioBuffer.length} bytes`);
    console.log(
      `⏱️  Estimated duration: ~${Math.round(script.length / 12)} seconds`
    );

    const audioInfo = {
      filename: filename,
      size: audioBuffer.length,
      estimatedDuration: Math.round(script.length / 12),
      url: filename,
      format: "mp3",
      model: "eleven_flash_v2_5",
    };

    console.log(`\n🎧 To listen:`);
    console.log(`   - Double-click: ${filename}`);
    console.log(
      `   - Command line: open "${filename}" (Mac) or start "${filename}" (Windows)`
    );

    return audioInfo;
  } catch (error) {
    console.error("❌ ElevenLabs API Error:", error.message);
    return null;
  }
}

async function testScriptGeneration(topic = "politics") {
  console.log(`🚀 Testing oddly.news script generation for: ${topic}`);
  console.log("=".repeat(60));

  // Step 1: Get market data
  const polymarketData = await getPolymarketData(topic);
  if (!polymarketData) {
    console.log("❌ Failed to get market data");
    return;
  }

  // Step 2: Extract insights
  const marketInsights = await extractMarketInsights(polymarketData);
  if (!marketInsights) {
    console.log("❌ Failed to extract insights");
    return;
  }

  console.log("\n📊 Market Insights:");
  console.log(marketInsights);

  // Step 3: Get news
  const newsData = await getNewsContext(topic);

  // Step 4: Generate script
  const script = await generateScript(topic, marketInsights, newsData);
  if (!script) {
    console.log("❌ Script generation failed");
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎙️ Generated Script:");
  console.log("─".repeat(40));
  console.log(script);
  console.log("─".repeat(40));

  // Step 5: Generate audio
  const audioInfo = await generateAudio(script, topic);

  // Save files
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

  if (!fs.existsSync("scripts")) {
    fs.mkdirSync("scripts");
  }

  fs.writeFileSync(`scripts/${topic}-script-${timestamp}.txt`, script);
  console.log(`\n💾 Script saved to scripts/${topic}-script-${timestamp}.txt`);

  // Final summary
  console.log("\n" + "=".repeat(60));
  if (audioInfo) {
    console.log("🎉 COMPLETE PIPELINE SUCCESS!");
    console.log("\n📊 Final Output Summary:");
    console.log("Topic:", topic);
    console.log("Script length:", script.length, "characters");
    console.log("Audio file:", audioInfo.filename);
    console.log("Audio size:", audioInfo.size, "bytes");
    console.log("Estimated duration:", audioInfo.estimatedDuration, "seconds");
    console.log("Audio model: eleven_flash_v2_5");

    console.log("\n🎧 Your oddly.news briefing is ready!");

    // Show UI response format
    const uiResponse = {
      success: true,
      topic: topic,
      script: script,
      audio: audioInfo,
      generated_at: new Date().toISOString(),
    };

    console.log("\n📡 UI Response Format:");
    console.log(JSON.stringify(uiResponse, null, 2));
  } else {
    console.log("⚠️  Script generated but audio generation failed");
  }

  return script;
}

// Environment check
function checkEnvironment() {
  const required = [
    "PERPLEXITY_API_KEY",
    "OPENAI_API_KEY",
    "ELEVENLABS_API_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing);
    console.log("\nCreate a .env file with:");
    missing.forEach((key) => console.log(`${key}=your_key_here`));
    process.exit(1);
  }

  console.log("✅ Environment variables found");
}

async function main() {
  checkEnvironment();
  const topic = process.argv[2] || "politics";

  if (TAG_MAPPING[topic]) {
    await testScriptGeneration(topic);
  } else {
    console.log("Available topics:", Object.keys(TAG_MAPPING).join(", "));
    console.log("Usage: node test-pipeline-improved.js [topic]");
  }
}

main().catch(console.error);
