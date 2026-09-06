# @samurai/langchain

Drop-in LangChain callback handler. Any project using LangChain can install
this and get every LLM/agent call traced to a Samurai backend — no changes
to the project's own LLM-calling code, just a `callbacks: [...]` entry.

## Install

```bash
npm install @samurai/langchain @langchain/core
```

## Get an API key first

Dashboard → API Keys → create one for your project. Shown once, copy it.

## Use

```ts
import { SamuraiCallbackHandler } from "@samurai/langchain";
import { ChatOpenAI } from "@langchain/openai";

const handler = new SamuraiCallbackHandler({
  apiUrl: "http://localhost:4000",
  apiKey: process.env.SAMURAI_API_KEY,
});

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
await model.invoke("Hello", { callbacks: [handler] });
```

## Why HTTP + an API key, not a direct DB import

Talks to Samurai over `/api/traces/ingest`, authenticated by key — not by
importing Samurai's Prisma client directly. That's what makes it
installable by any external project, and what stops a caller from
spoofing traces into a project that isn't theirs. A Samurai outage
degrades to "tracing silently skipped," never breaks the caller's actual
LLM call.
