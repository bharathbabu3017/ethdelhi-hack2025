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
  console.log(
    "\n2. Extracting market insights and generating search queries..."
  );

  const marketCount = polymarketData.length;
  const searchQueryCount = Math.min(marketCount, 5); // Max 3 queries, 1 per market roughly

  const prompt = `Analyze this prediction market data and provide:

1. Key market insights (brief summary)
2. Generate exactly ${searchQueryCount} specific search queries for the most important/highest volume markets

Data: ${JSON.stringify(polymarketData)}

Format your response as JSON:
{
  "insights": "Brief analysis with key stats",
  "searchQueries": ["query1", "query2", "query3"]
}

Only include ${searchQueryCount} search queries for the most newsworthy markets.`;

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
    const content = data.choices?.[0]?.message?.content;

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        insights: content,
        searchQueries: [`recent ${polymarketData[0]?.title || "news"} updates`],
      };
    }

    console.log(`✅ Generated ${analysis.searchQueries.length} search queries`);

    return analysis;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    return null;
  }
}

async function getNewsContext(searchQueries) {
  console.log("\n3. Fetching news context...");

  const allNewsData = [];

  for (const query of searchQueries) {
    try {
      const response = await fetch(PERPLEXITY_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          max_results: 3, // Only 1 article per query
          max_tokens_per_page: 300, // Very short extracts
        }),
      });

      const data = await response.json();

      if (data.results && data.results[0]) {
        // Only keep essential data
        allNewsData.push({
          query: query,
          headline: data.results[0].title,
          summary: data.results[0].snippet?.substring(0, 300), // Just 100 chars
        });
      }
    } catch (error) {
      console.error(
        `Perplexity API Error for query "${query}":`,
        error.message
      );
    }
  }

  console.log(`✅ Fetched news for ${allNewsData.length} queries`);

  return allNewsData;
}

async function generateScript(topic, analysis, newsData) {
  console.log("\n4. Generating script...");

  const prompt = `You are Marcus Chen, a seasoned news anchor for oddly.news, delivering your signature "Markets vs Media" radio briefing. Your show analyzes talks about prediction markets and the mainstream news and gives a summary of the news.

TOPIC: ${topic}

PREDICTION MARKET DATA:
${analysis.insights}

MAINSTREAM NEWS COVERAGE:
${JSON.stringify(newsData)}

INSTRUCTIONS:
- Create a 60-90 second radio script that flows naturally for text-to-speech
- Lead with the most compelling angle or contradiction between markets and media
- Include 1-2 specific, interesting prediction market statistics that illustrate broader trends
- Maintain an authoritative yet conversational tone - think NPR meets financial analysis
- Focus on clarity over complexity - explain why the difference between markets and media matters
- Dont make each sentence too long, keep it short and concise.
- When dealing with numbers, generate it in text format, not numbers.
- End with a memorable insight or forward-looking perspective
- Use clean text only - no special characters, formatting, or stage directions.
- More focus on prediction markets and slightly less on mainstream news, highlighting metrics wherever needed.
- Structure as continuous prose suitable for audio delivery

Remember: Your audience tunes in because they want to understand what the smart money is really thinking versus what the headlines are saying. Make every sentence count.`;

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

    console.log(`✅ Script generated (${script.length} characters)`);

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

    const audio = await elevenlabs.textToSpeech.convert(
      "gnPxliFHTp6OK6tcoA6i", // George voice
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

    console.log(`✅ Audio generated: ${filename}`);

    const audioInfo = {
      filename: filename,
      size: audioBuffer.length,
      estimatedDuration: Math.round(script.length / 12),
      url: filename,
      format: "mp3",
      model: "eleven_flash_v2_5",
    };

    return audioInfo;
  } catch (error) {
    console.error("❌ ElevenLabs API Error:", error.message);
    console.error("Error details:", error);
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

  // Step 2: Extract insights and generate search queries
  const analysis = await extractMarketInsights(polymarketData);
  if (!analysis) {
    console.log("❌ Failed to extract insights");
    return;
  }

  // Step 3: Get targeted news using specific queries
  const newsData = await getNewsContext(analysis.searchQueries);

  // Step 4: Generate script with targeted data
  const script = await generateScript(topic, analysis, newsData);
  if (!script) {
    console.log("❌ Script generation failed");
    return;
  }

  // Step 5: Generate audio
  const audioInfo = await generateAudio(script, topic);

  // Save files
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

  if (!fs.existsSync("scripts")) {
    fs.mkdirSync("scripts");
  }

  fs.writeFileSync(`scripts/${topic}-script-${timestamp}.txt`, script);

  // Also save the analysis data
  const fullData = {
    topic,
    polymarketData,
    analysis,
    newsData,
    script,
    audioInfo,
    timestamp,
  };

  fs.writeFileSync(
    `scripts/${topic}-complete-${timestamp}.json`,
    JSON.stringify(fullData, null, 2)
  );

  console.log(`\n💾 Files saved: scripts/${topic}-script-${timestamp}.txt`);

  // Final summary
  console.log("\n" + "=".repeat(60));
  if (audioInfo) {
    console.log("🎉 COMPLETE PIPELINE SUCCESS!");
    console.log(
      `\n📊 Summary: ${polymarketData.length} markets, ${analysis.searchQueries.length} queries, ${newsData.length} news sources`
    );
    console.log(
      `🎵 Audio: ${audioInfo.filename} (${audioInfo.estimatedDuration}s)`
    );
    console.log(`\n🎧 Ready to play: open "${audioInfo.filename}"`);
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
