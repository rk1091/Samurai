import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { Serialized } from '@langchain/core/load/serializable';
import { LLMResult } from '@langchain/core/outputs';
import { PrismaService } from '../../prisma/prisma.service';
import { computeCostUsd } from '../pricing';

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
