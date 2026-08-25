# @samurai/langchain

Drop-in LangChain callback handler. Any project using LangChain can install
this and get every LLM/agent call traced to a Samurai backend — no changes
to the project's own LLM-calling code, just a `callbacks: [...]` entry.

## Install

```bash
npm install @samurai/langchain @langchain/core
```

(Not yet published to the public npm registry — see note below. For now,
install locally via `npm install ../path/to/samurai/packages/samurai-langchain`
or `npm link`.)

## Use

```ts
import { SamuraiCallbackHandler } from "@samurai/langchain";
import { ChatOpenAI } from "@langchain/openai";

const handler = new SamuraiCallbackHandler({
  apiUrl: "http://localhost:4000",   // your running Samurai backend
  project: "my-project",
});

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
await model.invoke("Hello", { callbacks: [handler] });
```

Requires a Samurai backend running and reachable at `apiUrl`. That's the
whole integration surface — the target project needs zero other changes.

## Why HTTP, not a direct DB import

This package talks to Samurai over `/api/traces/ingest`, not by importing
Samurai's Prisma client directly. That's what makes it installable by any
external project — they don't share a database connection or even need to
be written in the same language. A Samurai outage degrades to "tracing
silently skipped," never breaks the caller's actual LLM call.
