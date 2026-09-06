import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeCostUsd } from './pricing';
import { LlmCallResult, TraceMeta, TraceOutcome } from './types';
import { ProviderAdapter } from './adapters/provider-adapter';

export interface ListTracesOptions {
  project?: string;
  status?: 'success' | 'fail';
  model?: string;
  search?: string;
  since?: Date;
  page?: number;
  pageSize?: number;
}

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

  private buildWhere(options: ListTracesOptions) {
    return {
      ...(options.project ? { projectTag: options.project } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.model ? { model: options.model } : {}),
      ...(options.search
        ? { prompt: { contains: options.search, mode: 'insensitive' as const } }
        : {}),
      ...(options.since ? { timestamp: { gte: options.since } } : {}),
    };
  }

  async listTraces(options: ListTracesOptions = {}) {
    const { page = 1, pageSize = 25 } = options;
    const where = this.buildWhere(options);

    const [rows, total] = await Promise.all([
      this.prisma.trace.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.trace.count({ where }),
    ]);

    return { rows, total, page, pageSize };
  }

  /**
   * Unpaginated fetch used for client-side chart aggregation (cost/day,
   * tokens/day, error-rate/day, latency histogram). Same "don't
   * over-engineer for a few hundred rows" reasoning as costSummary() —
   * a dedicated aggregation endpoint per chart isn't worth it at this
   * scale, but this comment is the flag for when it would be (thousands+
   * of rows, this stops being free).
   */
  async listTracesForCharts(options: ListTracesOptions = {}) {
    const where = this.buildWhere(options);
    return this.prisma.trace.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: 2000,
    });
  }

  async traceDetail(id: string) {
    return this.prisma.trace.findUnique({
      where: { id },
      include: { children: true, parent: true },
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

  async modelBreakdown(projectTag?: string) {
    const traces = await this.prisma.trace.findMany({
      where: projectTag ? { projectTag } : undefined,
    });

    const byModel = new Map<string, { calls: number; costUsd: number }>();
    for (const t of traces) {
      const entry = byModel.get(t.model) ?? { calls: 0, costUsd: 0 };
      entry.calls += 1;
      entry.costUsd += t.costUsd ?? 0;
      byModel.set(t.model, entry);
    }

    return Array.from(byModel.entries()).map(([model, stats]) => ({
      model,
      calls: stats.calls,
      costUsd: Number(stats.costUsd.toFixed(4)),
    }));
  }
}
