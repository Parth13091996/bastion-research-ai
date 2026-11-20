import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../supabase";
import {
  generateToken,
  generateRefreshToken,
  getAccessExpiresIn,
  getRefreshExpiresIn,
  getRefreshSecret,
  getAuthCookieOptions,
  parseDurationToMs,
} from "../controllers/auth.controller";
import {
  canEmployeeEditSection,
  type AdminSectionKey,
  isAdminSectionKey,
} from "../services/employeeSectionPermissions.service";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not set");
    }
    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    //   if (["inactive", "suspended", "blocked", "disabled"].includes(user.status)) return res.status(403).json({ message: "Account is not active" });
    //   req.user = user;
    //   next();
    // } catch (error) {
    req.user = user;
    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      // Access token expired: check if valid refresh token exists in cookies or headers
      const refreshCandidates = [
        req.cookies?.refreshToken,
        req.headers["x-refresh-token"] as string,
      ].filter(
        (t): t is string =>
          typeof t === "string" &&
          t.trim().length > 0 &&
          t !== "undefined" &&
          t !== "null"
      );

      const refreshSecret = getRefreshSecret();
      for (const cand of refreshCandidates) {
        try {
          const refreshDecoded = jwt.verify(cand, refreshSecret) as any;
          if (refreshDecoded && refreshDecoded.id) {
            const { data: refreshedUser, error: refError } = await supabase
              .from("users")
              .select("*")
              .eq("id", refreshDecoded.id)
              .single();

            if (!refError && refreshedUser) {
              const newAccessToken = generateToken(refreshedUser.id, refreshedUser.email, getAccessExpiresIn());
              const newRefreshToken = generateRefreshToken(refreshedUser.id, refreshedUser.email, getRefreshExpiresIn());
              const accessMaxAge = parseDurationToMs(getAccessExpiresIn(), 24 * 60 * 60 * 1000);
              const refreshMaxAge = parseDurationToMs(getRefreshExpiresIn(), 7 * 24 * 60 * 60 * 1000);

              res.cookie("token", newAccessToken, getAuthCookieOptions(accessMaxAge));
              res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(refreshMaxAge));
              res.setHeader("x-access-token", newAccessToken);
              res.setHeader("x-refresh-token", newRefreshToken);

              req.user = refreshedUser;
              return next();
            }
          }
        } catch {
          // candidate failed
        }
      }
    }
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin" && req.user.status === "active") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an administrator" });
  }
};

export const staff = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.status === "active" && (req.user.role === "admin" || req.user.role === "employee")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
};

export const requireSectionEdit =
  (sectionKey: AdminSectionKey) =>
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      if (req.user.role === "admin" && req.user.status === "active") {
        return next();
      }

      if (req.user.role !== "employee") {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!isAdminSectionKey(sectionKey)) {
        return res.status(400).json({ message: "Invalid section key" });
      }

      try {
        const ok = await canEmployeeEditSection(req.user.id, sectionKey);
        if (!ok) {
          return res.status(403).json({ message: "Edit access denied" });
        }
        return next();
      } catch (error) {
        return res.status(500).json({ message: "Failed to verify permissions" });
      }
    };

export type { AuthRequest };
