import { ProviderAdapter } from './provider-adapter';

export const anthropicAdapter: ProviderAdapter = (raw) => ({
  model: raw.model,
  content: raw.content?.[0]?.text ?? '',
  usage: {
    prompt_tokens: raw.usage?.input_tokens,
    completion_tokens: raw.usage?.output_tokens,
  },
});
