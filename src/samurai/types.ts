export interface TraceMeta {
  project: string;
  promptText: string;
  parentTraceId?: string;
}

// Minimal shape Samurai expects back from any LLM call it wraps.
// Matches OpenAI's chat completion response closely enough to work out of the box;
// adapt the extraction in samurai.service.ts if you wrap a different provider.
export interface LlmCallResult {
  model: string;
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export interface TraceOutcome<T> {
  result: T;
  traceId: string;
}
