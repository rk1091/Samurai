import type OpenAI from 'openai';

export interface InstrumentOptions {
  apiUrl: string;
  project: string;
}

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
      throw err;
    }
  };
}

function sendTrace(options: InstrumentOptions, payload: Record<string, any>) {
  fetch(`${options.apiUrl}/api/traces/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('[samurai-openai] Failed to send trace:', err));
}
