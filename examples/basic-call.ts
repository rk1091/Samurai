import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { PrismaService } from '../src/prisma/prisma.service';
import { SamuraiService } from '../src/samurai/samurai.service';

const openai = new OpenAI({ apiKey: process.env.GOOGLE_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

  console.log(
  'Google API key loaded:',
  !!process.env.GOOGLE_API_KEY,
);
async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const samurai = new SamuraiService(prisma);

  const promptText = 'Explain what an LLM observability tool does, in one sentence.';

  const { result, traceId } = await samurai.trace(
    async () => {
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
    },
    { project: 'samurai-examples', promptText },
  );

  console.log('Response:', result.content);
  console.log('Trace ID:', traceId);

  await prisma.onModuleDestroy();
}

main().catch(console.error);
