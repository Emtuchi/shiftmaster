import { checkRateLimit } from "../middleware/rateLimiter";


export async function transformResponse(
  proxyRes: globalThis.Response,
  rateInfo: ReturnType<typeof checkRateLimit>
) {
  const headers = new Headers(proxyRes.headers);

  // Remove internal headers
  headers.delete("x-powered-by");
  headers.delete("server");

  // Add rate limit headers
  headers.set(
    "x-ratelimit-remaining",
    String(rateInfo.remaining)
  );

  headers.set(
    "x-ratelimit-reset",
    String(rateInfo.resetAt)
  );

  const body = await proxyRes.text();

  return {
    status: proxyRes.status,
    headers,
    body,
  };
}