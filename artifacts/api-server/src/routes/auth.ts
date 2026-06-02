import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, adminCredentialsTable } from "@workspace/db";
import { signToken, verifyToken, requireAuth } from "../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir." });
    return;
  }

  const [admin] = await db.select().from(adminCredentialsTable).limit(1);
  if (!admin) {
    res.status(401).json({ error: "Yönetici hesabı bulunamadı." });
    return;
  }

  const valid = admin.username === username && await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı." });
    return;
  }

  const token = signToken(username);
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ username });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("admin_token");
  res.json({ ok: true });
});

router.get("/me", (req: Request, res: Response) => {
  const token = req.cookies?.["admin_token"] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Giriş yapılmamış." });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Oturum süresi doldu." });
    return;
  }
  res.json({ username: payload.username });
});

export default router;
