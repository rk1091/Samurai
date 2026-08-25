import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SamuraiService } from './samurai.service';
import { IngestService, IngestTracePayload } from './ingest.service';

@Controller('api/traces')
export class SamuraiController {
  constructor(
    private readonly samurai: SamuraiService,
    private readonly ingest: IngestService,
  ) {}

  @Get()
  async list(@Query('project') project?: string) {
    return this.samurai.listTraces(project);
  }

  @Get('summary')
  async summary(@Query('project') project?: string) {
    return this.samurai.costSummary(project);
  }

  /**
   * External services POST here — the integration point for anything
   * that can't import Samurai's NestJS code directly (Kitna-kharcha,
   * or any other language/service).
   */
  @Post('ingest')
  async ingestTrace(@Body() payload: IngestTracePayload) {
    return this.ingest.ingest(payload);
  }
}
