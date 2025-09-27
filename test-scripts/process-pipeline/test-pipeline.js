// test-pipeline-complete.js
require("dotenv").config();
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const fs = require("fs");
const path = require("path");

const POLYMARKET_BASE_URL = "https://gamma-api.polymarket.com";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/search";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Topic to tag_id mapping
const TAG_MAPPING = {
  politics: 126, // Trump
  crypto: 21, // Crypto
  economy: 159, // Fed
  congress: 514, // Congress
  breaking: 2, // Politics general
};

async function testPolymarketAPI(topic) {
  console.log(`\n1. Testing Polymarket API for ${topic}...`);

  const tagId = TAG_MAPPING[topic];
  const url = `${POLYMARKET_BASE_URL}/events?limit=5&tag_id=${tagId}&order=volume24hr`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(`✅ Polymarket API Success - Found ${data.length} markets`);

    // Extract key info
    const markets = data.slice(0, 3).map((market) => ({
      title: market.title,
      odds: market.markets?.[0]?.outcomePrices || [],
      volume24hr: market.volume24hr,
      change: market.markets?.[0]?.oneDayPriceChange || 0,
    }));

    console.log(
      "Sample markets:",
      markets.map((m) => `${m.title.substring(0, 50)}...`)
    );
    return markets;
  } catch (error) {
    console.error("❌ Polymarket API Error:", error.message);
    return null;
  }
}

async function testPerplexityAPI(markets) {
  console.log("\n2. Testing Perplexity API...");

  const marketTitles = markets.map((m) => m.title).join(", ");
  const query = `Recent news about: ${marketTitles}`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        max_results: 3,
      }),
    });

    const data = await response.json();

    console.log("✅ Perplexity API Success");

    const newsContext =
      data.results
        ?.slice(0, 2)
        .map(
          (result) => `${result.title}: ${result.snippet?.substring(0, 200)}...`
        )
        .join("\n") || "No recent news found";

    console.log("News context preview:", newsContext.substring(0, 200) + "...");
    return newsContext;
  } catch (error) {
    console.error("❌ Perplexity API Error:", error.message);
    return "Unable to fetch recent news context";
  }
}

async function testOpenAIAPI(markets, newsContext) {
  console.log("\n3. Testing OpenAI API for script generation...");

  const prompt = `You're an AI financial news agent for oddly.news. Generate a 90-second radio script comparing prediction market odds vs recent news headlines.

Markets Data:
${markets
  .map(
    (m) =>
      `- ${m.title}: ${m.odds[0] || "N/A"}% probability, Volume: $${(
        m.volume24hr / 1000
      ).toFixed(0)}K`
  )
  .join("\n")}

Recent News Context:
${newsContext}

Generate a conversational script that:
1. Starts with "This is your oddly.news market intelligence briefing"
2. Highlights what traders with real money think vs headlines
3. Mentions specific odds and volume numbers
4. Explains any surprising discrepancies
5. Ends with "For more market intelligence, visit oddly.news"
6. Keep it under 90 seconds when spoken

Script:`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const script =
      data.choices?.[0]?.message?.content || "Script generation failed";

    console.log("✅ OpenAI API Success");
    console.log("Generated script preview:", script.substring(0, 200) + "...");
    return script;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    return null;
  }
}

async function testElevenLabsAPI(script, topic) {
  console.log("\n4. Testing ElevenLabs API...");

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    console.log("Converting to audio...");
    console.log("Script length:", script.length, "characters");

    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb", // George voice - replace with preferred voice
      {
        text: script,
        model_id: "eleven_v3",
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

    // Handle different audio response types
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

    console.log("✅ ElevenLabs API Success - Audio generated");
    console.log(`🎵 Audio saved as: ${filename}`);
    console.log(`📁 File size: ${audioBuffer.length} bytes`);
    console.log(
      `⏱️  Estimated duration: ~${Math.round(script.length / 12)} seconds`
    );

    // Audio file info for UI implementation
    const audioInfo = {
      filename: filename,
      size: audioBuffer.length,
      estimatedDuration: Math.round(script.length / 12), // rough estimate
      url: filename, // In production, this would be a served URL
      format: "mp3",
      sampleRate: "44100",
      bitrate: "128",
    };

    console.log(`\n🎧 To listen:`);
    console.log(`   - Double-click: ${filename}`);
    console.log(
      `   - Command line: open "${filename}" (Mac) or start "${filename}" (Windows)`
    );
    console.log(`   - With mpv: mpv "${filename}"`);

    return audioInfo;
  } catch (error) {
    console.error("❌ ElevenLabs API Error:", error.message);

    if (
      error.message.includes("authorization") ||
      error.message.includes("invalid")
    ) {
      console.log("Debug: Check your ELEVENLABS_API_KEY in .env file");
    }

    return false;
  }
}

async function testFullPipeline(topic = "politics") {
  console.log(`🚀 Testing oddly.news pipeline for topic: ${topic}`);
  console.log("=".repeat(60));

  // Step 1: Get market data
  const markets = await testPolymarketAPI(topic);
  if (!markets) {
    console.log("❌ Pipeline failed at Polymarket API");
    return;
  }

  // Step 2: Get news context
  const newsContext = await testPerplexityAPI(markets);

  // Step 3: Generate script
  const script = await testOpenAIAPI(markets, newsContext);
  if (!script) {
    console.log("❌ Pipeline failed at OpenAI API");
    return;
  }

  // Step 4: Generate audio
  const audioInfo = await testElevenLabsAPI(script, topic);

  console.log("\n" + "=".repeat(60));
  if (audioInfo) {
    console.log("🎉 FULL PIPELINE SUCCESS!");
    console.log("\n📊 Final Output Summary:");
    console.log("Topic:", topic);
    console.log("Markets processed:", markets.length);
    console.log("Script length:", script.length, "characters");
    console.log("Audio file:", audioInfo.filename);
    console.log("Audio size:", audioInfo.size, "bytes");
    console.log("Estimated duration:", audioInfo.estimatedDuration, "seconds");

    console.log("\n🎧 Your oddly.news briefing is ready!");
    console.log("\n💡 For UI implementation:");
    console.log("- Audio URL:", audioInfo.url);
    console.log("- Use HTML5 <audio> element or Web Audio API");
    console.log("- Store audio files in /public/audio/ for web serving");

    // Show how the response would look for your UI
    const uiResponse = {
      success: true,
      topic: topic,
      script: script,
      audio: audioInfo,
      markets: markets.map((m) => ({
        title: m.title,
        odds: m.odds[0],
        volume: m.volume24hr,
      })),
      generated_at: new Date().toISOString(),
    };

    console.log("\n📡 UI Response Format:");
    console.log(JSON.stringify(uiResponse, null, 2));
  } else {
    console.log("⚠️  Pipeline mostly successful (audio generation failed)");
  }
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

// Run the test
async function main() {
  checkEnvironment();

  const topic = process.argv[2] || "politics";

  if (TAG_MAPPING[topic]) {
    await testFullPipeline(topic);
  } else {
    console.log("Available topics:", Object.keys(TAG_MAPPING).join(", "));
    console.log("Usage: node test-pipeline-complete.js [topic]");
    console.log("Example: node test-pipeline-complete.js crypto");
  }
}

main().catch(console.error);
