import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeCostUsd } from './pricing';
import { LlmCallResult, TraceMeta, TraceOutcome } from './types';

@Injectable()
export class SamuraiService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Wrap any LLM/agent call. Pass a function that performs the call and
   * returns { model, content, usage }. Samurai measures latency, computes
   * cost, and writes one trace row — win or fail.
   *
   * For multi-step agent chains, pass the previous step's traceId as
   * meta.parentTraceId to link the chain.
   */
  async trace<T extends LlmCallResult>(
    callFn: () => Promise<T>,
    meta: TraceMeta,
  ): Promise<TraceOutcome<T>> {
    const start = Date.now();

    try {
      const result = await callFn();
      const latencyMs = Date.now() - start;
      const tokensIn = result.usage?.prompt_tokens ?? 0;
      const tokensOut = result.usage?.completion_tokens ?? 0;

      const row = await this.prisma.trace.create({
        data: {
          projectTag: meta.project,
          prompt: meta.promptText,
          response: result.content,
          model: result.model,
          tokensIn,
          tokensOut,
          costUsd: computeCostUsd(result.model, tokensIn, tokensOut),
          latencyMs,
          status: 'success',
          parentTraceId: meta.parentTraceId,
        },
      });

      return { result, traceId: row.id };
    } catch (err: any) {
      const latencyMs = Date.now() - start;

      const row = await this.prisma.trace.create({
        data: {
          projectTag: meta.project,
          prompt: meta.promptText,
          response: null,
          model: 'unknown',
          latencyMs,
          status: 'fail',
          errorMessage: String(err?.message ?? err),
          parentTraceId: meta.parentTraceId,
        },
      });

      // Re-throw so the caller's own error handling still runs —
      // Samurai observes, it doesn't swallow failures.
      (err as any).samuraiTraceId = row.id;
      throw err;
    }
  }

  async listTraces(projectTag?: string) {
    return this.prisma.trace.findMany({
      where: projectTag ? { projectTag } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 200,
    });
  }

  async costSummary(projectTag?: string) {
    const traces = await this.prisma.trace.findMany({
      where: projectTag ? { projectTag } : undefined,
    });
    const totalCost = traces.reduce((sum, t) => sum + (t.costUsd ?? 0), 0);
    const failCount = traces.filter((t) => t.status === 'fail').length;
    const avgLatency =
      traces.reduce((sum, t) => sum + t.latencyMs, 0) / (traces.length || 1);

    return {
      totalCalls: traces.length,
      totalCostUsd: Number(totalCost.toFixed(4)),
      failCount,
      avgLatencyMs: Math.round(avgLatency),
    };
  }
}
