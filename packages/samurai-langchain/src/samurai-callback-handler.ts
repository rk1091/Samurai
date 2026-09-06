import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { Serialized } from '@langchain/core/load/serializable';
import { LLMResult } from '@langchain/core/outputs';

export interface SamuraiHandlerOptions {
  apiUrl: string;
  project: string;
}

export class SamuraiCallbackHandler extends BaseCallbackHandler {
  name = 'samurai_callback_handler';
  private runStartTimes = new Map<string, number>();
  private runPrompts = new Map<string, string>();
  private runIdToTraceId = new Map<string, string>();

  constructor(private readonly options: SamuraiHandlerOptions) {
    super();
  }

  async handleLLMStart(_llm: Serialized, prompts: string[], runId: string): Promise<void> {
    this.runStartTimes.set(runId, Date.now());
    this.runPrompts.set(runId, prompts.join('\n'));
  }

  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string): Promise<void> {
    const latencyMs = Date.now() - (this.runStartTimes.get(runId) ?? Date.now());
    const promptText = this.runPrompts.get(runId) ?? '';
    const generation = output.generations?.[0]?.[0];

    const payload = {
      project: this.options.project,
      prompt: promptText,
      response: (generation as any)?.text ?? '',
      model: (output.llmOutput?.model as string) ?? 'unknown',
      tokensIn: output.llmOutput?.tokenUsage?.promptTokens ?? 0,
      tokensOut: output.llmOutput?.tokenUsage?.completionTokens ?? 0,
      latencyMs,
      status: 'success' as const,
      parentTraceId: parentRunId ? this.runIdToTraceId.get(parentRunId) : undefined,
    };

    try {
      const res = await fetch(`${this.options.apiUrl}/api/traces/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const trace = await res.json();
      this.runIdToTraceId.set(runId, trace.id);
    } catch (err) {
      console.error('[samurai-langchain] Failed to send trace:', err);
    }

    this.runStartTimes.delete(runId);
    this.runPrompts.delete(runId);
  }

  async handleLLMError(err: any, runId: string, parentRunId?: string): Promise<void> {
    const latencyMs = Date.now() - (this.runStartTimes.get(runId) ?? Date.now());
    const promptText = this.runPrompts.get(runId) ?? '';

    const payload = {
      project: this.options.project,
      prompt: promptText,
      model: 'unknown',
      latencyMs,
      status: 'fail' as const,
      errorMessage: String(err?.message ?? err),
      parentTraceId: parentRunId ? this.runIdToTraceId.get(parentRunId) : undefined,
    };

    try {
      await fetch(`${this.options.apiUrl}/api/traces/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (sendErr) {
      console.error('[samurai-langchain] Failed to send failure trace:', sendErr);
    }

    this.runStartTimes.delete(runId);
    this.runPrompts.delete(runId);
  }
}
