// Approximate USD cost per 1K tokens. Update these to match current provider pricing —
// they change over time, this is intentionally kept as one editable table.
export const PRICING_PER_1K_TOKENS: Record<string, { in: number; out: number }> = {
  'gpt-4o': { in: 0.0025, out: 0.01 },
  'gpt-4o-mini': { in: 0.00015, out: 0.0006 },
  'gpt-4-turbo': { in: 0.01, out: 0.03 },
  default: { in: 0.0005, out: 0.0015 },
};

export function computeCostUsd(
  model: string,
  tokensIn = 0,
  tokensOut = 0,
): number {
  const rate = PRICING_PER_1K_TOKENS[model];
  if (!rate) {
    console.warn(
      `[samurai] No pricing entry for model "${model}", using default rate. ` +
        `Cost figures for this trace may be inaccurate — add "${model}" to PRICING_PER_1K_TOKENS.`,
    );
  }
  const resolvedRate = rate ?? PRICING_PER_1K_TOKENS.default;
  return (tokensIn / 1000) * resolvedRate.in + (tokensOut / 1000) * resolvedRate.out;
}
