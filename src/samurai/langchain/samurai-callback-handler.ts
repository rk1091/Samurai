import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { Serialized } from '@langchain/core/load/serializable';
import { LLMResult } from '@langchain/core/outputs';
import { PrismaService } from '../../prisma/prisma.service';
import { computeCostUsd } from '../pricing';

/**
 * Plug this into any LangChain chain/agent's `callbacks: [...]` array and
 * every LLM call inside it gets traced automatically — no manual trace()
 * calls needed at each step. This is what makes Samurai usable on agentic
 * chains someone else built (e.g. a LangGraph agent), not just code you
 * write by hand.
 *
 * Usage:
 *   const handler = new SamuraiCallbackHandler(prisma, "my-agent-project");
 *   await chain.invoke(input, { callbacks: [handler] });
 *
 * How chain linking works here: LangChain gives each run a runId and,
 * for nested calls, a parentRunId. We map runId -> our traceId as calls
 * start, so a child run can look up its parent's Samurai traceId and
 * link parentTraceId correctly — same chain model as the manual trace().
 */
export class SamuraiCallbackHandler extends BaseCallbackHandler {
  name = 'samurai_callback_handler';

  private runStartTimes = new Map<string, number>();
  private runIdToTraceId = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectTag: string,
  ) {
    super();
  }

  async handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
  ): Promise<void> {
    this.runStartTimes.set(runId, Date.now());
    // Stash prompt text keyed by runId so handleLLMEnd can retrieve it —
    // LangChain doesn't pass the prompt back to us on completion.
    (this as any)[`__prompt_${runId}`] = prompts.join('\n');
  }

  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string): Promise<void> {
    const start = this.runStartTimes.get(runId) ?? Date.now();
    const latencyMs = Date.now() - start;
    const promptText = (this as any)[`__prompt_${runId}`] ?? '';

    const generation = output.generations?.[0]?.[0];
    const content = (generation as any)?.text ?? '';
    const model = (output.llmOutput?.model as string) ?? 'unknown';
    const tokensIn = output.llmOutput?.tokenUsage?.promptTokens ?? 0;
    const tokensOut = output.llmOutput?.tokenUsage?.completionTokens ?? 0;

    const parentTraceId = parentRunId
      ? this.runIdToTraceId.get(parentRunId)
      : undefined;

    const row = await this.prisma.trace.create({
      data: {
        projectTag: this.projectTag,
        prompt: promptText,
        response: content,
        model,
        tokensIn,
        tokensOut,
        costUsd: computeCostUsd(model, tokensIn, tokensOut),
        latencyMs,
        status: 'success',
        parentTraceId,
      },
    });

    this.runIdToTraceId.set(runId, row.id);
    this.runStartTimes.delete(runId);
    delete (this as any)[`__prompt_${runId}`];
  }

  async handleLLMError(err: any, runId: string, parentRunId?: string): Promise<void> {
    const start = this.runStartTimes.get(runId) ?? Date.now();
    const latencyMs = Date.now() - start;
    const promptText = (this as any)[`__prompt_${runId}`] ?? '';
    const parentTraceId = parentRunId
      ? this.runIdToTraceId.get(parentRunId)
      : undefined;

    try {
      await this.prisma.trace.create({
        data: {
          projectTag: this.projectTag,
          prompt: promptText,
          response: null,
          model: 'unknown',
          latencyMs,
          status: 'fail',
          errorMessage: String(err?.message ?? err),
          parentTraceId,
        },
      });
    } catch (dbErr) {
      console.error('[samurai] Failed to write LangChain failure trace:', dbErr);
    }

    this.runStartTimes.delete(runId);
    delete (this as any)[`__prompt_${runId}`];
  }
}
