import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeCostUsd } from './pricing';
import { LlmCallResult, TraceMeta, TraceOutcome } from './types';
import { ProviderAdapter } from './adapters/provider-adapter';

@Injectable()
export class SamuraiService {
  constructor(private readonly prisma: PrismaService) {}

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

      try {
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
        (err as any).samuraiTraceId = row.id;
      } catch (dbErr) {
        console.error('[samurai] Failed to write failure trace:', dbErr);
      }

      throw err;
    }
  }

  async traceRaw<RawResponse>(
    callFn: () => Promise<RawResponse>,
    adapter: ProviderAdapter<RawResponse>,
    meta: TraceMeta,
  ): Promise<TraceOutcome<LlmCallResult>> {
    return this.trace(async () => {
      const raw = await callFn();
      return adapter(raw);
    }, meta);
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
