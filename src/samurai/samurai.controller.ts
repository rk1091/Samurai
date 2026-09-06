import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SamuraiService } from './samurai.service';
import { IngestService, IngestTracePayload } from './ingest.service';

function parseSince(range?: string): Date | undefined {
  if (!range) return undefined;
  const now = Date.now();
  const hours = range === '24h' ? 24 : range === '7d' ? 24 * 7 : range === '30d' ? 24 * 30 : undefined;
  return hours ? new Date(now - hours * 60 * 60 * 1000) : undefined;
}

@Controller('api/traces')
export class SamuraiController {
  constructor(
    private readonly samurai: SamuraiService,
    private readonly ingest: IngestService,
  ) {}

  @Get()
  async list(
    @Query('project') project?: string,
    @Query('status') status?: 'success' | 'fail',
    @Query('model') model?: string,
    @Query('search') search?: string,
    @Query('range') range?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.samurai.listTraces({
      project,
      status,
      model,
      search,
      since: parseSince(range),
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  /** Unpaginated, for client-side chart aggregation. */
  @Get('chart-data')
  async chartData(
    @Query('project') project?: string,
    @Query('range') range?: string,
  ) {
    return this.samurai.listTracesForCharts({ project, since: parseSince(range) });
  }

  @Get('summary')
  async summary(@Query('project') project?: string) {
    return this.samurai.costSummary(project);
  }

  @Get('model-breakdown')
  async modelBreakdown(@Query('project') project?: string) {
    return this.samurai.modelBreakdown(project);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.samurai.traceDetail(id);
  }

  @Post('ingest')
  async ingestTrace(@Body() payload: IngestTracePayload) {
    return this.ingest.ingest(payload);
  }
}
