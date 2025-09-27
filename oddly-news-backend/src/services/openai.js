const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function extractMarketInsights(polymarketData) {
  const marketCount = polymarketData.length;
  const searchQueryCount = Math.min(marketCount, 5);

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
- Make it like he is talking to the listener rather than just reading the script.

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

    return script;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw error;
  }
}

module.exports = { extractMarketInsights, generateScript };
