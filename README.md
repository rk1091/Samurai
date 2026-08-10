# Samurai

Lightweight LLM / agent call observability. Wrap any LLM call, get structured
traces (cost, latency, tokens, failures, multi-step chains) written to Postgres.

## Setup — exact commands

```bash
# 1. Install Node deps
npm install

# 2. Start Postgres (Docker Desktop must be running)
docker compose up -d

# 3. Create your .env from the template
cp .env.example .env
# then open .env and paste in your real OPENAI_API_KEY

# 4. Generate Prisma client + create the Trace table
npm run prisma:generate
npm run prisma:migrate

# 5. Run the Samurai API server (dashboard backend)
npm run start:dev
# -> Samurai API running on http://localhost:4000

# 6. In a second terminal, generate real trace data using the examples
npm run example:basic
npm run example:fail
npm run example:chain

# 7. Check the traces landed
curl http://localhost:4000/api/traces
curl http://localhost:4000/api/traces/summary
```

Windows note: if `docker compose` isn't recognized, use `docker-compose up -d`
(older Docker Desktop installs use the hyphenated command).

## What each piece does

- `src/samurai/samurai.service.ts` — the core wrapper. `trace()` measures
  latency, computes cost, writes one row per call, succeeds or fails.
- `src/samurai/pricing.ts` — per-model $/1K token table. Edit this as pricing changes.
- `prisma/schema.prisma` — the `Trace` table, including `parentTraceId` for
  linking multi-step agent chains.
- `examples/` — three scripts that generate real trace data: a normal call,
  a deliberately failing call, and a 2-step chained call.
- `src/samurai/samurai.controller.ts` — `GET /api/traces` and
  `GET /api/traces/summary`, the API a dashboard UI would sit on top of.

## Next steps (not built yet)

- React dashboard consuming `/api/traces` and `/api/traces/summary`
  (cost-over-time chart, failed-call list, latency distribution)
- Wire into Kitna-kharcha's LLM fallback classifier for real production usage
- Optional: Helm chart for a proper K8s deploy
