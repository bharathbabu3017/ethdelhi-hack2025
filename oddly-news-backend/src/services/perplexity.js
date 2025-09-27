const PERPLEXITY_API_URL = "https://api.perplexity.ai/search";

async function getNewsContext(searchQueries) {
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
          max_results: 3,
          max_tokens_per_page: 300,
        }),
      });

      const data = await response.json();

      if (data.results && data.results[0]) {
        allNewsData.push({
          query: query,
          headline: data.results[0].title,
          summary: data.results[0].snippet?.substring(0, 300),
        });
      }
    } catch (error) {
      console.error(
        `Perplexity API Error for query "${query}":`,
        error.message
      );
    }
  }

  return allNewsData;
}

module.exports = { getNewsContext };
