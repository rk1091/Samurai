# Samurai

Lightweight LLM / agent call observability. Wrap any LLM call, get structured
traces (cost, latency, tokens, failures, multi-step chains) written to Postgres,
viewable in a multi-page dashboard with filtering, search, and trend charts.

## Setup

```bash
npm install
docker compose up -d
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
# -> Samurai API running on http://localhost:4000
```

Second terminal — generate example trace data:
```bash
npm run example:basic
npm run example:fail
npm run example:chain
npm run example:langchain
```

## Dashboard

```bash
cd dashboard
npm install
npm run dev
# -> http://localhost:5173
```

**Overview page:** summary cards, cost-over-time, cost-by-model, latency
distribution histogram, error rate over time, token usage over time — all
respecting the time-range selector (24h/7d/30d/all time).

**Traces page:** searchable (by prompt text), filterable (status, model,
time range), paginated table. Click any row for full untruncated
prompt/response and, if the trace is part of a multi-step chain, a
parent/child tree you can click through.

## Architecture

- `src/samurai/samurai.service.ts` — `trace()`/`traceRaw()` for in-process
  calls, plus `listTraces()` (paginated, filterable — status/model/search/
  time-range) and `listTracesForCharts()` (unpaginated, feeds client-side
  chart aggregation — same "don't over-engineer for a few hundred rows"
  reasoning as `costSummary()`)
- `src/samurai/pricing.ts` — per-model $/1K token table, warns rather than
  silently guessing on an unrecognized model
- `src/samurai/adapters/` — `openaiAdapter`, `anthropicAdapter`
- `src/samurai/ingest.service.ts` + `POST /api/traces/ingest` — external
  services (different repo, different language) send trace data here
- `prisma/schema.prisma` — `Trace` model, `parentTraceId` self-reference
  for chain linking

## Integration paths

| Project type | How |
|---|---|
| LangChain-based | `packages/samurai-langchain` — `callbacks: [handler]` once per chain |
| Direct OpenAI SDK (e.g. Kitna-kharcha) | `packages/samurai-openai` — `instrumentOpenAI(client, opts)` once at startup |
| Anything else | `POST /api/traces/ingest` directly |

## Next steps

- Wire `@samurai/openai` into Kitna-kharcha's classification fallback for real production usage
- Helm chart for a K8s deploy
