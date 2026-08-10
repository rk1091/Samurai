import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SamuraiModule } from './samurai/samurai.module';

@Module({
  imports: [PrismaModule, SamuraiModule],
})
export class AppModule {}
