import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, adminCredentialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.put("/", requireAuth, async (req: Request, res: Response) => {
  const { username, currentPassword, newPassword } = req.body as {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword) {
    res.status(400).json({ error: "Mevcut şifre zorunludur." });
    return;
  }

  const [admin] = await db.select().from(adminCredentialsTable).limit(1);
  if (!admin) {
    res.status(404).json({ error: "Yönetici hesabı bulunamadı." });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Mevcut şifre hatalı." });
    return;
  }

  const updates: Partial<{ username: string; passwordHash: string }> = {};
  if (username) updates.username = username;
  if (newPassword) {
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır." });
      return;
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await db.update(adminCredentialsTable).set(updates).where(eq(adminCredentialsTable.id, admin.id));
  res.json({ ok: true });
});

export default router;
