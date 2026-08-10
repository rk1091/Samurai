import { Module } from '@nestjs/common';
import { SamuraiService } from './samurai.service';
import { SamuraiController } from './samurai.controller';

@Module({
  controllers: [SamuraiController],
  providers: [SamuraiService],
  exports: [SamuraiService],
})
export class SamuraiModule {}
