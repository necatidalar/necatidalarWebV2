import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-jwt-secret-please-change";

export function signToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string };
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.["admin_token"] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Giriş yapmanız gerekiyor." });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Oturum süresi doldu, tekrar giriş yapın." });
    return;
  }
  (req as Request & { admin: { username: string } }).admin = payload;
  next();
}
