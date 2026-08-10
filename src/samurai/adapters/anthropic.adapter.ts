import { ProviderAdapter } from './provider-adapter';

/**
 * Converts an Anthropic messages.create() response into
 * Samurai's normalized LlmCallResult. Anthropic's shape differs from
 * OpenAI's (content is an array of blocks, token fields are named
 * differently) — that's exactly why the adapter layer exists.
 */
export const anthropicAdapter: ProviderAdapter = (raw) => ({
  model: raw.model,
  content: raw.content?.[0]?.text ?? '',
  usage: {
    prompt_tokens: raw.usage?.input_tokens,
    completion_tokens: raw.usage?.output_tokens,
  },
});
