import express from "express";
import type { Request, Response } from "express";
import { performance } from "node:perf_hooks";

import { matchRoute } from "./routing/router.js";
import { authenticate } from "./middleware/auth.js";
import { checkRateLimit } from "./middleware/rateLimiter.js";
import { transformRequest } from "./transforms/request.js";
import { transformResponse } from "./transforms/response.js";
import { logRequest } from "./logging/logger.js";

const app = express();

app.use(express.json());

app.all("*", async (req: Request, res: Response) => {
  const start = performance.now();

  // 1. Find the microservice that should handle this request
  const route = matchRoute(req.path);

  if (!route) {
    return res.status(404).send("Not Found");
  }

  try {
    // 2. Authenticate the request
    // Returns JWT claims if authentication succeeds.
    const claims = await authenticate(req, route.auth);

    // 3. Identify the client
    // For JWT requests, use the user's ID.
    // For API-key requests, use the API key.
    // Otherwise, treat the client as anonymous.
    const clientId =
      (claims?.sub as string) ||
      req.headers["x-api-key"]?.toString() ||
      "anon";

    // 4. Check the rate limit
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

    // 5. Build the request that will be sent to the downstream microservice.
    const proxyReq = transformRequest(
      req,
      route,
      claims
    );

    // 6. Forward the request to the microservice.
    //
    // transformRequest() returns an object containing the URL, method, headers and body that fetch needs.
    const proxyRes = await fetch(proxyReq.url, {
      method: proxyReq.method,
      headers: proxyReq.headers,
      ...(proxyReq.body !== undefined &&
        proxyReq.method !== "GET" &&
        proxyReq.method !== "HEAD"
        ? { body: proxyReq.body }
        : {}),
      });

    // 7. Transform the microservice response.
    //
    // proxyRes is a Fetch API Response.
    // transformResponse() prepares it for Express.
    const response = await transformResponse(
      proxyRes,
      rateInfo
    );

    // 8. Copy the downstream response headers to the Express response.
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 9. Log the request
    logRequest({
      requestId: proxyReq.requestId,
      method: req.method,
      path: req.path,
      route: route.prefix,
      clientId,
      status: response.status,
      durationMs: Math.round(
        performance.now() - start
      ),
    });

    // 10. Send the microservice response
    // back to the original client.
    return res
      .status(response.status)
      .send(response.body);

  } catch (err) {
    // Authentication failures
    if (
      err instanceof Error &&
      (
        err.message === "Missing token" ||
        err.message === "Invalid token" ||
        err.message === "Invalid API key"
      )
    ) {
      return res.status(401).send(err.message);
    }

    // Unexpected gateway/downstream error
    console.error(err);

    return res
      .status(502)
      .send("Internal Gateway Error");
  }
});

app.listen(8080, () => {
  console.log(
    "API Gateway running on http://localhost:8080"
  );
});

