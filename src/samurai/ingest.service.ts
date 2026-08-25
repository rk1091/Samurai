import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeCostUsd } from './pricing';

export interface IngestTracePayload {
  project: string;
  prompt: string;
  response?: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs: number;
  status: 'success' | 'fail';
  errorMessage?: string;
  parentTraceId?: string;
}

@Injectable()
export class IngestService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(payload: IngestTracePayload) {
    const costUsd =
      payload.status === 'success'
        ? computeCostUsd(payload.model, payload.tokensIn ?? 0, payload.tokensOut ?? 0)
        : undefined;

    return this.prisma.trace.create({
      data: {
        projectTag: payload.project,
        prompt: payload.prompt,
        response: payload.response ?? null,
        model: payload.model,
        tokensIn: payload.tokensIn,
        tokensOut: payload.tokensOut,
        costUsd,
        latencyMs: payload.latencyMs,
        status: payload.status,
        errorMessage: payload.errorMessage,
        parentTraceId: payload.parentTraceId,
      },
    });
  }
}
