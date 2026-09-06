import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { PrismaService } from '../src/prisma/prisma.service';
import { SamuraiService } from '../src/samurai/samurai.service';

const openai = new OpenAI({ apiKey: process.env.GOOGLE_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

async function callOpenAI(promptText: string) {
  const completion = await openai.chat.completions.create({
    model: 'gemini-3.7-flash',
    messages: [{ role: 'user', content: promptText }],
  });
  return {
    model: completion.model,
    content: completion.choices[0].message.content ?? '',
    usage: {
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
    },
  };
}

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const samurai = new SamuraiService(prisma);

  const step1Prompt = 'Name one interesting topic in distributed systems. Reply with just the topic.';
  const { result: step1, traceId: step1Id } = await samurai.trace(
    () => callOpenAI(step1Prompt),
    { project: 'samurai-examples', promptText: step1Prompt },
  );
  console.log('Step 1 output:', step1.content);

  const step2Prompt = `Explain "${step1.content}" in two sentences.`;
  const { result: step2, traceId: step2Id } = await samurai.trace(
    () => callOpenAI(step2Prompt),
    { project: 'samurai-examples', promptText: step2Prompt, parentTraceId: step1Id },
  );
  console.log('Step 2 output:', step2.content);
  console.log(`Chain: ${step1Id} -> ${step2Id}`);

  await prisma.onModuleDestroy();
}

main().catch(console.error);
