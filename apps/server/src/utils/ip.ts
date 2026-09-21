import type { Request } from "express";

export function getClientIp(req: Request): string {
  // Trust common proxy headers; take the first IP in the list
  const xfwd = (req.headers["x-forwarded-for"] || "") as string;
  if (xfwd) {
    const ip = xfwd.split(",")[0]?.trim();
    if (ip) return ip;
  }
  // Fallbacks from Express
  const ip =
    (req.socket as any)?.remoteAddress ||
    (req as any).ip ||
    (req.connection as any)?.remoteAddress ||
    "";
  return ip || "";
}

