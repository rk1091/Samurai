import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { PrismaService } from '../src/prisma/prisma.service';
import { SamuraiCallbackHandler } from '../src/samurai/langchain/samurai-callback-handler';

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const handler = new SamuraiCallbackHandler(prisma, 'samurai-langchain-example');
  const model = new ChatOpenAI({ modelName: 'gpt-4o-mini' });

  const response = await model.invoke('Say hello in one short sentence.', {
    callbacks: [handler],
  });

  console.log('LangChain response:', response.content);
  console.log('Check traces via: curl http://localhost:4000/api/traces');

  await prisma.onModuleDestroy();
}

main().catch(console.error);
