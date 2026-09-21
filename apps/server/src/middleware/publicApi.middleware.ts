import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "crypto";

const getPresentedApiKey = (req: Request) => {
  const headerKey = req.get("x-api-key")?.trim();
  if (headerKey) return headerKey;

  const authorization = req.get("authorization")?.trim() ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim();
};

const keysMatch = (presented: string, configured: string) => {
  const presentedBuffer = Buffer.from(presented);
  const configuredBuffer = Buffer.from(configured);

  return (
    presentedBuffer.length === configuredBuffer.length &&
    timingSafeEqual(presentedBuffer, configuredBuffer)
  );
};

/** Authenticate read-only integrations without granting a staff login session. */
export const requirePublicApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const configuredKey = process.env.PUBLIC_MEMBERS_API_KEY?.trim();
  if (!configuredKey) {
    console.error("PUBLIC_MEMBERS_API_KEY is not configured");
    return res.status(503).json({ error: "Public members API is unavailable" });
  }

  const presentedKey = getPresentedApiKey(req);
  if (!presentedKey || !keysMatch(presentedKey, configuredKey)) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }

  return next();
};
