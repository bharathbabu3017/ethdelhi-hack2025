### oddly.news

Agents that turn prediction market intelligence into short audio briefings.

- **Markets**: Polymarket (tag-based)
- **Reasoning**: OpenAI for insights, Perplexity for context
- **Voice**: ElevenLabs TTS
- **Storage/DB**: Supabase (tables + Storage)
- **Identity**: ENS subdomains on Base (`<topic>.oddly.eth`)

---

## Monorepo layout

- `oddly-news-backend/`: Express API and processing pipeline
- `oddly-news-frontend/`: React app (Create React App + Tailwind)
- `test-scripts/`: Small scripts to verify integrations (Perplexity, pipeline, ENS)

---

## Quick start

1. Backend

```bash
cd oddly-news-backend
npm install
cp .env.example .env # if you have one; otherwise see ENV below
npm run dev
# server on http://localhost:3001
```

2. Frontend

```bash
cd oddly-news-frontend
npm install
npm start
# app on http://localhost:3000
```

---

## Environment (backend `.env`)

```bash
# Server
PORT=3001

# OpenAI
OPENAI_API_KEY=

# Perplexity
PERPLEXITY_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Wallet derivation for agent addresses (12-word mnemonic)
MASTER_SEED_PHRASE="word1 word2 ... word12"

# ENS (Base mainnet by default)
RPC_URL=https://mainnet.base.org
REGISTRAR_PRIVATE_KEY=0x...


```

Notes:

- Ensure the registrar wallet has Base ETH to register subdomains.
- Supabase Storage must contain a public bucket named `briefing-audio`.

---

