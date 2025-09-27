import Perplexity from "@perplexity-ai/perplexity_ai";
import dotenv from "dotenv";

dotenv.config();

const client = new Perplexity(); // Uses PERPLEXITY_API_KEY from .env file

async function main() {
  const search = await client.search.create({
    query: "polymarket south park",
    maxResults: 5,
    maxTokensPerPage: 1024,
  });

  for (const result of search.results) {
    console.log(`${result.title}: ${result.url}`);
  }
}

main();
