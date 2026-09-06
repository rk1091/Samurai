import { LlmCallResult } from '../types';

export type ProviderAdapter<RawResponse = any> = (
  raw: RawResponse,
) => LlmCallResult;
