import { Controller, Get, Query } from '@nestjs/common';
import { SamuraiService } from './samurai.service';

@Controller('api/traces')
export class SamuraiController {
  constructor(private readonly samurai: SamuraiService) {}

  @Get()
  async list(@Query('project') project?: string) {
    return this.samurai.listTraces(project);
  }

  @Get('summary')
  async summary(@Query('project') project?: string) {
    return this.samurai.costSummary(project);
  }
}
