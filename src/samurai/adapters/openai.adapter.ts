import { ProviderAdapter } from './provider-adapter';

/**
 * Converts an OpenAI chat.completions.create() response into
 * Samurai's normalized LlmCallResult.
 */
export const openaiAdapter: ProviderAdapter = (raw) => ({
  model: raw.model,
  content: raw.choices?.[0]?.message?.content ?? '',
  usage: {
    prompt_tokens: raw.usage?.prompt_tokens,
    completion_tokens: raw.usage?.completion_tokens,
  },
});
