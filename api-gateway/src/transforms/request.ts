import { Request } from "express";
import { JWTPayload } from "jose";
import { Route } from "../config/routes";

export function transformRequest(
  req: Request,
  route: Route,
  claims: JWTPayload | null
) {
  // Copy the incoming headers
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(
        key,
        Array.isArray(value) ? value.join(", ") : value
      );
    }
  }

  // Remove client-supplied internal headers
  // so clients cannot impersonate users or requests.
  headers.delete("x-user-id");
  headers.delete("x-request-id");

  // Generate a trusted request ID
  const requestId = crypto.randomUUID();

  headers.set("x-request-id", requestId);

  // Add authenticated user's ID
  if (claims?.sub) {
    headers.set("x-user-id", claims.sub);
  }

  // Forward the client's IP address
  const clientIp =
    req.headers["cf-connecting-ip"] ||
    req.ip ||
    "unknown";

  headers.set(
    "x-forwarded-for",
    Array.isArray(clientIp)
      ? clientIp.join(", ")
      : clientIp
  );

  // Determine the path that should be sent to the microservice
  const targetPath = route.rewrite
    ? route.rewrite(req.path)
    : req.path;

  // Build the final microservice URL
  const targetUrl = `${route.target}${targetPath}`;

  return {
    url: targetUrl,
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD"
      ? undefined
      : JSON.stringify(req.body),
    requestId,
  };
}

