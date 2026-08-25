import { Module } from '@nestjs/common';
import { SamuraiService } from './samurai.service';
import { SamuraiController } from './samurai.controller';
import { IngestService } from './ingest.service';

@Module({
  controllers: [SamuraiController],
  providers: [SamuraiService, IngestService],
  exports: [SamuraiService, IngestService],
})
export class SamuraiModule {}
