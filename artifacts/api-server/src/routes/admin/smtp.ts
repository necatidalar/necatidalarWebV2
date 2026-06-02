import { Router } from "express";
import { db, smtpSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const [settings] = await db.select().from(smtpSettingsTable).limit(1);
  if (!settings) {
    res.json(null);
    return;
  }
  res.json({ ...settings, password: settings.password ? "••••••••" : "" });
});

router.put("/", requireAuth, async (req: Request, res: Response) => {
  const { host, port, secure, user, password, fromEmail, toEmail } = req.body as {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    password?: string;
    fromEmail?: string;
    toEmail?: string;
  };

  const [existing] = await db.select().from(smtpSettingsTable).limit(1);

  const updates: Record<string, unknown> = {};
  if (host !== undefined) updates["host"] = host;
  if (port !== undefined) updates["port"] = Number(port);
  if (secure !== undefined) updates["secure"] = Boolean(secure);
  if (user !== undefined) updates["user"] = user;
  if (password !== undefined && password !== "••••••••") updates["password"] = password;
  if (fromEmail !== undefined) updates["fromEmail"] = fromEmail;
  if (toEmail !== undefined) updates["toEmail"] = toEmail;

  if (existing) {
    await db.update(smtpSettingsTable).set(updates).where(eq(smtpSettingsTable.id, existing.id));
  } else {
    await db.insert(smtpSettingsTable).values({
      host: String(updates["host"] ?? "smtp.gmail.com"),
      port: Number(updates["port"] ?? 587),
      secure: Boolean(updates["secure"] ?? false),
      user: String(updates["user"] ?? ""),
      password: String(updates["password"] ?? ""),
      fromEmail: String(updates["fromEmail"] ?? ""),
      toEmail: String(updates["toEmail"] ?? ""),
    });
  }

  res.json({ ok: true });
});

export default router;
