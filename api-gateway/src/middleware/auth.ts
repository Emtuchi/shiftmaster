import { jwtVerify} from "jose";
import type { JWTPayload } from "jose";
import type { Request } from "express";
import type { Route } from "../config/routes.js";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const API_KEYS = new Set(
  process.env.API_KEYS?.split(",") ?? []
);

export async function authenticate(
  req: Request,
  mode: Route["auth"]
): Promise<JWTPayload | null> {

  if (mode === "none") {
    return null;
  }

  // API key authentication
  if (mode === "apikey") {
    const key = req.headers["x-api-key"];

    if (!key || typeof key !== "string" || !API_KEYS.has(key)) {
      throw new Error("Invalid API key");
    }

    return null;
  }

  // JWT authentication
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing token");
  }

  try {
    const token = header.slice(7);

    const { payload } = await jwtVerify(
      token,
      JWT_SECRET
    );

    return payload;

  } catch {
    throw new Error("Invalid token");
  }
}