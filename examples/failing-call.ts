/**
 * Example 2: a call that fails (bad model name) — proves Samurai
 * still writes a trace row on failure, with the error captured.
 * Run: npm run example:fail
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { PrismaService } from '../src/prisma/prisma.service';
import { SamuraiService } from '../src/samurai/samurai.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const samurai = new SamuraiService(prisma);

  const promptText = 'This call intentionally uses a bad model name.';

  try {
    await samurai.trace(
      async () => {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini-DOES-NOT-EXIST', // intentional bad value
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
