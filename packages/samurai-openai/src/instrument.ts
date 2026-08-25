import type OpenAI from 'openai';

export interface InstrumentOptions {
  /** Base URL of a running Samurai backend, e.g. "http://localhost:4000" */
  apiUrl: string;
  /** Tag to group these traces under in the Samurai dashboard */
  project: string;
}

/**
 * Patches `client.chat.completions.create` ONCE, in place. Every call made
 * through this client instance afterward — anywhere in the codebase, at
 * any call site, present or future — is automatically traced. No call
 * site needs to know Samurai exists.
 *
 * This is the same technique real auto-instrumentation tools (OpenTelemetry's
 * instrumentation packages, Traceloop, OpenInference) use: wrap the method
 * once at the boundary, not the call sites.
 *
 * Usage — call this ONCE, right after creating your OpenAI client:
 *
 *   const openai = new OpenAI({ apiKey: ... });
 *   instrumentOpenAI(openai, { apiUrl: "http://localhost:4000", project: "kitna-kharcha" });
 *
 *   // Every call below, anywhere in the codebase, is now traced automatically:
 *   await openai.chat.completions.create({ ... });
 */
export function instrumentOpenAI(client: OpenAI, options: InstrumentOptions): void {
  const original = client.chat.completions.create.bind(client.chat.completions);

  // @ts-expect-error - intentionally overwriting the SDK method at runtime
  client.chat.completions.create = async function (...args: any[]) {
    const start = Date.now();
    const promptText = JSON.stringify(args[0]?.messages ?? args[0]);

    try {
      const response = await original(...(args as [any]));
      const latencyMs = Date.now() - start;

      sendTrace(options, {
        project: options.project,
        prompt: promptText,
        response: (response as any).choices?.[0]?.message?.content ?? '',
        model: (response as any).model,
        tokensIn: (response as any).usage?.prompt_tokens,
        tokensOut: (response as any).usage?.completion_tokens,
        latencyMs,
        status: 'success',
      });

      return response;
    } catch (err: any) {
      const latencyMs = Date.now() - start;

      sendTrace(options, {
        project: options.project,
        prompt: promptText,
        model: args[0]?.model ?? 'unknown',
        latencyMs,
        status: 'fail',
        errorMessage: String(err?.message ?? err),
      });

      // The original error always propagates — instrumentation observes,
      // it never changes the caller's actual behavior.
      throw err;
    }
  };
}

function sendTrace(options: InstrumentOptions, payload: Record<string, any>) {
  // Fire-and-forget on purpose: a slow or down Samurai backend must never
  // add latency to, or break, the real LLM call the app cares about.
  fetch(`${options.apiUrl}/api/traces/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error('[samurai-openai] Failed to send trace:', err);
  });
}
