const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function extractMarketInsights(polymarketData) {
  const marketCount = polymarketData.length;
  const searchQueryCount = Math.min(marketCount, 5);

  const prompt = `Analyze this prediction market data and provide:

1. Key market insights (brief summary with current odds and volumes)
2. Generate exactly ${searchQueryCount} simple search queries aimed at finding WHY each market has its current odds

Create short, natural search queries focused on causes and reasons:

Data: ${JSON.stringify(polymarketData)}

Format your response as JSON:
{
  "insights": "Brief analysis of current market state", 
  "searchQueries": ["shutdown risk October 2025", "Fed cut reasons December", "Trump Nobel why unlikely"]
}

Make queries 2-5 words that search for explanations, causes, or recent developments. Have like one query per market.`;
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = {
        insights: content,
        searchQueries: [`recent ${polymarketData[0]?.title || "news"} updates`],
      };
    }

    return analysis;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw error;
  }
}

async function generateScript(topic, analysis, newsData) {
  const prompt = `You are Marcus Chen, delivering an oddly.news market intelligence briefing. You analyze prediction markets to explain what smart money is thinking and why.
    
    PREDICTION MARKET DATA:
    ${analysis.insights}
    
    CONTEXT AND REASONING:
    ${JSON.stringify(newsData)}
    
    INSTRUCTIONS:
    - Create a 60-90 second radio script focusing on market intelligence with explanations
    - Start with the most compelling market position and explain WHY it exists
    - Use the context data to explain the reasoning behind market odds
    - Cover key prediction market metrics (odds, volumes, movements)
    - Explain what factors are driving the market sentiment
    - Maintain authoritative yet conversational tone - talking TO the listener
    - Keep sentences short and concise for audio delivery
    - Convert all numbers to text format (82% becomes "eighty-two percent")
    - End with what this means for listeners or forward-looking insight
    - Strictly under 90 seconds when spoken
    - Use clean text only - no special characters or formatting
    
    Focus: "Here's what the markets are saying, here's WHY they're saying it, and here's what it means for you." Use the context to explain the reasoning behind market positions.
    
    Remember: Your audience wants to understand prediction market intelligence with the context that explains why smart money is positioned this way.`;
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;

    return script;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw error;
  }
}

module.exports = { extractMarketInsights, generateScript };
