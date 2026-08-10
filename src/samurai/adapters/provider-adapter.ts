import { LlmCallResult } from '../types';

/**
 * A ProviderAdapter converts one provider's raw response shape into
 * Samurai's own LlmCallResult contract. This is the whole trick behind
 * being "API agnostic" — trace() never touches a provider-specific
 * response shape, only ever this normalized one.
 *
 * To support a new provider: write one function matching this signature.
 * Nothing else in the codebase changes.
 */
export type ProviderAdapter<RawResponse = any> = (
  raw: RawResponse,
) => LlmCallResult;
