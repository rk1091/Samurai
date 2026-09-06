# @samurai/openai

Auto-instrument the OpenAI SDK. Call once at startup, every call anywhere
in your codebase gets traced to Samurai automatically — no changes at any
call site.

## Install

```bash
npm install @samurai/openai openai
```

## Get an API key first

Open the Samurai dashboard → API Keys → create a key for your project
(e.g. "kitna-kharcha"). Copy it now — it's shown once.

## Use

```ts
import OpenAI from "openai";
import { instrumentOpenAI } from "@samurai/openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

instrumentOpenAI(openai, {
  apiUrl: "http://localhost:4000",
  apiKey: process.env.SAMURAI_API_KEY, // the smr_... key from the dashboard
});

// Every call below, anywhere in your codebase, is now traced automatically:
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "..." }],
});
```

## How it works

Patches `client.chat.completions.create` once, at the client instance
level — same technique OpenTelemetry's auto-instrumentation packages use.
The API key determines which project traces land under server-side —
this package never self-reports a project name.

## Trade-offs

- **Pro:** zero-touch at call sites, including future code
- **Con:** "magic" — a call site gives no visual cue tracing is happening
- **Con:** monkey-patching can break if the SDK's internals change shape in a future major version
- Tracing is fire-and-forget — a Samurai outage never breaks or slows the real LLM call
