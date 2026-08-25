export interface TraceMeta {
  project: string;
  promptText: string;
  parentTraceId?: string;
}

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
