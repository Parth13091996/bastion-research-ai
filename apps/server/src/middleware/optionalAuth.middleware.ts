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
    if (!token) return next();

    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    if (!decoded?.id) return next();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (user) (req as AuthRequest).user = user;
  } catch {}
  finally {
    next();
  }
};

export default optionalAuth;

