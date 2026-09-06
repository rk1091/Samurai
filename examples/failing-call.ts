import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { PrismaService } from '../src/prisma/prisma.service';
import { SamuraiService } from '../src/samurai/samurai.service';

const openai = new OpenAI({ apiKey: process.env.GOOGLE_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const samurai = new SamuraiService(prisma);

  const promptText = 'This call intentionally uses a bad model name.';

  try {
    await samurai.trace(
      async () => {
        const completion = await openai.chat.completions.create({
          model: 'gemini-3.7-flash-DOES-NOT-EXIST',
          messages: [{ role: 'user', content: promptText }],
        });
        return {
          model: completion.model,
          content: completion.choices[0].message.content ?? '',
          usage: completion.usage,
        };
      },
      { project: 'samurai-examples', promptText },
    );
  } catch (err: any) {
    console.log('Caught expected failure. Trace ID:', err.samuraiTraceId);
    console.log('Error message stored:', err.message);
  }

  await prisma.onModuleDestroy();
}

main().catch(console.error);
