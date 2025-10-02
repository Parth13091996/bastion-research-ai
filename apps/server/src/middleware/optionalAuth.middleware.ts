import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../supabase";

interface AuthRequest extends Request {
  user?: any;
}

// Attaches req.user when a valid JWT cookie exists; never blocks the request
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as {
          id: string;
          email: string;
        };
        if (decoded?.id) {
          const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("id", decoded.id)
            .single();
          if (user) (req as AuthRequest).user = user;
        }
      }
    }
  } catch {
    // Intentionally ignore auth errors for optional auth
  }
  // Ensure next() is called exactly once
  next();
};

export default optionalAuth;
