const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function processPolymarketData(polymarketData) {
  // Calculate total volume
  const totalVolume = polymarketData.reduce(
    (sum, market) => sum + (market.volume || 0),
    0
  );
  const formattedVolume =
    totalVolume > 1000000
      ? `$${(totalVolume / 1000000).toFixed(1)}M`
      : `$${(totalVolume / 1000).toFixed(0)}K`;

  // Extract key market info
  const marketEvents = polymarketData.map((market) => ({
    title: market.title,
    volume:
      market.volume > 1000000
        ? `$${(market.volume / 1000000).toFixed(1)}M`
        : `$${(market.volume / 1000).toFixed(0)}K`,
    volume24hr:
      market.volume24hr > 1000000
        ? `$${(market.volume24hr / 1000000).toFixed(1)}M`
        : `$${(market.volume24hr / 1000).toFixed(0)}K`,
    liquidity:
      market.liquidity > 1000000
        ? `$${(market.liquidity / 1000000).toFixed(1)}M`
        : `$${(market.liquidity / 1000).toFixed(0)}K`,
    endDate: market.endDate,
    active: market.active,
    featured: market.featured,
    commentCount: market.commentCount || 0,
  }));

  // Sort by volume for top events
  const topEvents = marketEvents
    .sort(
      (a, b) =>
        parseFloat(b.volume.replace(/[$MK]/g, "")) -
        parseFloat(a.volume.replace(/[$MK]/g, ""))
    )
    .slice(0, 5);

  return {
    totalVolume: formattedVolume,
    activeMarkets: polymarketData.filter((m) => m.active).length,
    totalMarkets: polymarketData.length,
    featuredMarkets: polymarketData.filter((m) => m.featured).length,
    topEvents: topEvents,
    marketEvents: marketEvents,
  };
}

async function extractMarketInsights(polymarketData) {
  const marketCount = polymarketData.length;
  const searchQueryCount = Math.min(marketCount, 5);

  // Process raw Polymarket data
  const processedData = processPolymarketData(polymarketData);

  const prompt = `Analyze this prediction market data and provide:

1. Key market insights (brief summary with current odds and volumes)
2. Generate exactly ${searchQueryCount} simple search queries aimed at finding WHY each market has its current odds

Data: ${JSON.stringify(polymarketData)}

Format your response as JSON:
{
  "insights": "Brief analysis of current market state", 
  "searchQueries": ["shutdown risk October 2025", "Fed cut reasons December", "Trump Nobel why unlikely"]
}

Make queries 2-5 words that search for explanations, causes, or recent developments.`;
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

    // Add processed market data
    analysis.marketStats = processedData;

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
    Create a JSON response with both the radio script AND AI-driven insights:
    
    {
      "script": "Your 60-90 second radio script here...",
      "aiInsights": [
        {
          "title": "Market Sentiment Analysis",
          "content": "Brief insight about overall market mood and direction",
          "source": "Prediction Markets"
        },
        {
          "title": "Key Risk Factors",
          "content": "Main risks or catalysts identified from news analysis",
          "source": "News Analysis"
        },
        {
          "title": "Smart Money Positioning",
          "content": "What institutional or informed traders are doing",
          "source": "Volume Analysis"
        }
      ]
    }
    
    SCRIPT REQUIREMENTS:
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
    
    AI INSIGHTS REQUIREMENTS:
    - Generate 2-4 concise insights based on the market and news data
    - Each insight should be 1-2 sentences maximum
    - Focus on actionable intelligence and key takeaways
    - Use varied sources (markets, news, volume, sentiment)
    
    Focus: "Here's what the markets are saying, here's WHY they're saying it, and here's what it means for you." Use the context to explain the reasoning behind market positions.`;
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

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      result = {
        script: content,
        aiInsights: [
          {
            title: "Market Analysis",
            content:
              "Markets showing mixed signals with moderate volatility expected.",
            source: "Prediction Markets",
          },
          {
            title: "Key Developments",
            content:
              "Recent news events may impact market sentiment in the short term.",
            source: "News Analysis",
          },
        ],
      };
    }

    return result;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw error;
  }
}

module.exports = { extractMarketInsights, generateScript };
