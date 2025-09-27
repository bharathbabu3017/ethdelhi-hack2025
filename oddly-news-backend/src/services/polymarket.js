const POLYMARKET_BASE_URL = "https://gamma-api.polymarket.com";

async function getPolymarketData(tagId) {
  const url = `${POLYMARKET_BASE_URL}/events?limit=5&tag_id=${tagId}&order=volume24hr&ascending=false&closed=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Polymarket API Error:", error.message);
    throw error;
  }
}

module.exports = { getPolymarketData };
