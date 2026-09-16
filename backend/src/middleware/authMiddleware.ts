import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/authService";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
