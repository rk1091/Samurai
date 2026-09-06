import { ProviderAdapter } from './provider-adapter';

export const openaiAdapter: ProviderAdapter = (raw) => ({
  model: raw.model,
  content: raw.choices?.[0]?.message?.content ?? '',
  usage: {
    prompt_tokens: raw.usage?.prompt_tokens,
    completion_tokens: raw.usage?.completion_tokens,
  },
});
