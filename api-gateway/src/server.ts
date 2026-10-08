import express, { Request, Response } from "express";
import { performance } from "node:perf_hooks";

import { matchRoute } from "./routing/router";
import { authenticate } from "./middleware/auth";
import { checkRateLimit } from "./middleware/rateLimiter";
import { transformRequest } from "./transforms/request";
import { transformResponse } from "./transforms/response";
import { logRequest } from "./logging/logger";

const app = express();

app.use(express.json());

app.all("*", async (req: Request, res: Response) => {
  const start = performance.now();

  // 1. Find which microservice should handle this request
  const route = matchRoute(req.path);

  if (!route) {
    return res.status(404).send("Not Found");
  }

  try {
    // 2. Authenticate the request
    const claims = await authenticate(req, route.auth);

    // 3. Identify the client
    const clientId =
      (claims?.sub as string) ||
      req.headers["x-api-key"]?.toString() ||
      "anon";

    // 4. Check rate limit
    let rateInfo = {
      allowed: true,
      remaining: 0,
      resetAt: 0,
    };

    if (route.rateLimit) {
      rateInfo = checkRateLimit(
        `${clientId}:${route.prefix}`,
        route.rateLimit
      );

      if (!rateInfo.allowed) {
        return res.status(429).send("Rate limit exceeded");
      }
    }

    // 5. Prepare the request for the microservice
    const proxyReq = transformRequest(req, route, claims);

    // 6. Send request to the microservice
    const proxyRes = await fetch(proxyReq);

    // 7. Transform the microservice response
    const response = transformResponse(proxyRes, rateInfo);

    // 8. Log the request
    logRequest({
      requestId: req.headers["x-request-id"]?.toString() || "",
      method: req.method,
      path: req.path,
      route: route.prefix,
      clientId,
      status: proxyRes.status,
      durationMs: Math.round(performance.now() - start),
    });

    // 9. Send response back to client
    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();

    return res.send(body);

  } catch (err) {
    // Authentication errors
    if (err instanceof AuthError) {
      return res.status(401).send(err.message);
    }

    // Unexpected gateway errors
    console.error(err);

    return res.status(502).send("Internal Gateway Error");
  }
});

app.listen(8080, () => {
  console.log("API Gateway running on http://localhost:8080");
});
