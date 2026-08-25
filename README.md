# Samurai

Lightweight LLM / agent call observability. Wrap any LLM call, get structured
traces (cost, latency, tokens, failures, multi-step chains) written to Postgres.

## Setup — exact commands

```bash
npm install
docker compose up -d
cp .env.example .env
# paste your real OPENAI_API_KEY into .env

npm run prisma:generate
npm run prisma:migrate
npm run start:dev
# -> Samurai API running on http://localhost:4000
```

Second terminal:
```bash
npm run example:basic
npm run example:fail
npm run example:chain
npm run example:langchain

curl http://localhost:4000/api/traces
curl http://localhost:4000/api/traces/summary
```

## What each piece does

- `src/samurai/samurai.service.ts` — core wrapper. `trace()` measures
  latency, computes cost, writes one row per call, succeeds or fails.
  `traceRaw()` — provider-agnostic entry point, takes an adapter.
- `src/samurai/pricing.ts` — per-model $/1K token table, warns instead of
  silently guessing if a model isn't recognized.
- `src/samurai/adapters/` — `openaiAdapter`, `anthropicAdapter`. `trace()`
  never sees a provider's raw response shape, only Samurai's own
  `LlmCallResult` — adding a new provider means writing one adapter function.
- `src/samurai/ingest.service.ts` + `POST /api/traces/ingest` — lets any
  *external* service (different repo, different language even) send trace
  data without importing Samurai's code. This is how Kitna-kharcha (or
  anything) integrates.
- `prisma/schema.prisma` — the `Trace` table, `parentTraceId` self-reference
  for chain linking.
- `examples/` — basic call, failing call, 2-step chain, LangChain call.

## Provider-agnostic design

`trace()` only ever sees Samurai's own `LlmCallResult` contract (`model`,
`content`, `usage`) — never a provider's raw shape. Use `traceRaw(callFn,
adapter, meta)` to pass a raw response through an adapter automatically.

## LangChain integration — two versions, different use cases

1. **`src/samurai/langchain/samurai-callback-handler.ts`** — lives inside
   this repo, talks to Prisma directly. Use this for LangChain code that
   lives in Samurai's own examples/repo.
2. **`packages/samurai-langchain/`** — the real, standalone, installable
   plugin. Talks to Samurai over HTTP (`/api/traces/ingest`), so any
   *external* project can `npm install` it and trace LangChain calls with
   zero other code changes. This is the one to point recruiters at — see
   `packages/samurai-langchain/README.md`.

## Auto-instrumentation — for non-LangChain projects (e.g. Kitna-kharcha)

**`packages/samurai-openai/`** — patches the OpenAI SDK client once at
startup. Every call anywhere in the codebase is traced automatically after
that, with zero changes at any call site. This is the answer for projects
that call the OpenAI SDK directly rather than through LangChain — see
`packages/samurai-openai/README.md`.

```bash
npm run example:langchain
```

## Dashboard (React, separate app)

```bash
cd dashboard
npm install
npm run dev
# -> http://localhost:5173, reads from backend on :4000
```

Three widgets: summary cards, cost-over-time line chart (grouped by day
client-side), failed-calls table.

## Provider-agnostic design

`trace()` never sees a provider's raw response shape — only Samurai's own
`LlmCallResult` contract (`model`, `content`, `usage`). Each provider gets a
small adapter function that maps its response into that shape:

- `src/samurai/adapters/openai.adapter.ts`
- `src/samurai/adapters/anthropic.adapter.ts`

Use `traceRaw(callFn, adapter, meta)` instead of `trace()` to pass a raw
provider response through an adapter automatically. Adding a new provider
means writing one adapter function — nothing else changes.

## LangChain integration

`src/samurai/langchain/samurai-callback-handler.ts` — drop this into any
LangChain chain or agent's `callbacks: [...]` array and every LLM call
inside it is traced automatically, including parent/child chain linking
via LangChain's own `runId`/`parentRunId`. See `examples/langchain-call.ts`.

```bash
npm run example:langchain
```

## Dashboard (React, separate app)

```bash
cd dashboard
npm install
npm run dev
# -> opens at http://localhost:5173, reads from the backend on :4000
```

Requires the backend (`npm run start:dev` in the project root) already running.
Three widgets: summary cards (calls/cost/failures/latency), cost-over-time
line chart (grouped by day, client-side — same "don't over-engineer for 200
rows" reasoning as `costSummary()`), and a failed-calls table.

## Next steps (not built yet)

- Wire the `@samurai/langchain` package (or the ingest endpoint directly)
  into Kitna-kharcha's classification fallback for real production usage
- Helm chart for a K8s deploy
- Publish `@samurai/langchain` to the public npm registry (decision pending)
