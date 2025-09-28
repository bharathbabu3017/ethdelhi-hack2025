### oddly.news — ETHDelhi 2025 Hack

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

## API

Base URL (dev): `http://localhost:3001`

- `GET /health` — service heartbeat
- `GET /api/agents` — list active agents with last generated time
- `GET /api/agents/:topic` — fetch single agent by topic
- `GET /api/agents/:topic/generate?force=true|false` — run full pipeline; caches briefings < 30m unless `force=true`
- `GET /api/agents/:topic/history` — last 10 briefings for agent
- `POST /api/create-agent` — create agent + wallet + ENS subdomain

Example: generate briefing

```bash
curl "http://localhost:3001/api/agents/crypto/generate?force=true"
```

Create agent

```bash
curl -X POST http://localhost:3001/api/create-agent \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "crypto",
    "display_name": "Crypto Markets",
    "description": "Market intelligence for crypto",
    "tag_id": 21,
    "voice_id": "gnPxliFHTp6OK6tcoA6i"
  }'
```

---

## Data flow (briefing generation)

1. Load agent config from Supabase (`agents`)
2. Fetch markets from Polymarket by `tag_id`
3. Use OpenAI to extract insights + produce search queries
4. Query Perplexity for short context snippets per query
5. Use OpenAI to generate a 60–90s radio script
6. Generate MP3 via ElevenLabs
7. Upload MP3 to Supabase Storage (`briefing-audio`), get public URL
8. Persist briefing record in Supabase (`briefings`)

---

## Supabase schema (minimal)

You can adapt types to your policy; below is a reference.

```sql
-- agents
id uuid primary key default gen_random_uuid(),
topic text unique not null,
display_name text not null,
description text,
tag_id integer not null,
voice_id text,
wallet_address text,
wallet_index integer,
ens_subdomain text unique,
ens_registered_at timestamptz,
ens_transaction_hash text,
is_active boolean default true,
created_at timestamptz default now()

-- briefings
id uuid primary key default gen_random_uuid(),
agent_id uuid references agents(id) on delete cascade,
script text,
audio_url text,
audio_duration integer,
market_count integer,
news_query_count integer,
polymarket_data jsonb,
news_data jsonb,
market_stats jsonb,
metadata jsonb,
created_at timestamptz default now()
```

Storage:

- Bucket: `briefing-audio` (public)

---

## ENS (Base) registrar

- Contract: `0x3596e71996193D6467D9098401452937a199C200`
- Network: Base mainnet (`RPC_URL` defaults to `https://mainnet.base.org`)
- The backend signs with `REGISTRAR_PRIVATE_KEY` to call `register(label, owner)`

---

## Frontend

- CRA app with Tailwind and `axios`
- Components include `CreateAgentModal`, `Dashboard`, `LandingPage`
- Dev server: `npm start` at `http://localhost:3000`

If you need to customize the API base URL, add a CRA env:

```bash
# oddly-news-frontend/.env
REACT_APP_API_BASE=http://localhost:3001
```

Use it in the app via `process.env.REACT_APP_API_BASE`.

---

## Test scripts

Perplexity search sanity check:

```bash
cd test-scripts/perplexity-api
npm install
PERPLEXITY_API_KEY=... node perplexity-api.js
```

ENS registration helpers (ensure `REGISTRAR_PRIVATE_KEY` and `RPC_URL`):

```bash
cd oddly-news-backend
node -e "require('./src/services/ens').checkRegistrarBalance().then(console.log)"
```

Pipeline tests:

- See `test-scripts/process-pipeline` for example runners

---

## Tech stack

- Node.js, Express
- OpenAI API, Perplexity API, ElevenLabs
- Supabase (Postgres + Storage)
- Ethers.js, bip39, hdkey
- React 19, Tailwind CSS

---

## License

MIT
