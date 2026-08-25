# @samurai/openai

Auto-instrument the OpenAI SDK. Call once at startup, every call anywhere
in your codebase gets traced to Samurai automatically — no changes at any
call site.

## Install

```bash
npm install @samurai/openai openai
```

## Use

```ts
import OpenAI from "openai";
import { instrumentOpenAI } from "@samurai/openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Once, at startup:
instrumentOpenAI(openai, {
  apiUrl: "http://localhost:4000",
  project: "kitna-kharcha",
});

// Every call below, anywhere in your codebase, present or future,
// is now traced automatically — nothing here changes:
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "..." }],
});
```

## How it works

Patches `client.chat.completions.create` once, in place, at the client
instance level. This is the same technique OpenTelemetry's own
auto-instrumentation packages use — wrap the method at the boundary once,
not every call site.

## What this trades off

- **Pro:** genuinely zero-touch at call sites, including future code you
  haven't written yet
- **Con:** it's "magic" — someone reading a call site has no visual cue
  that tracing is happening, they'd need to know instrumentation was set
  up elsewhere. Worth documenting clearly wherever `instrumentOpenAI()` is
  called.
- **Con:** monkey-patching is inherently a little fragile — if the OpenAI
  SDK changes its internal shape in a future major version, this patch
  point may need updating. A production system would pin the SDK version
  or watch for breaking changes.
- Tracing failures never break the real LLM call — sending the trace is
  fire-and-forget, on purpose.
