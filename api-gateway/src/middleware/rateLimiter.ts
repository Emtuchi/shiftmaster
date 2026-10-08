interface RateState {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateState>();

export function checkRateLimit(
  clientId: string,
  config: { window: number; max: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = clientId;
  const now = Date.now();
  let state = limits.get(key);

  if (!state || now > state.resetAt) {
    state = { count: 0, resetAt: now + config.window };
    limits.set(key, state);
  }

  state.count++;
  const allowed = state.count <= config.max;

  return {
    allowed,
    remaining: Math.max(0, config.max - state.count),
    resetAt: state.resetAt,
  };
}
