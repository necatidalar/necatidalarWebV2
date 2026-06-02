import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { sendContactEmail } from "../lib/email";
import type { Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "Tüm alanlar zorunludur." });
    return;
  }

  if (name.length < 2 || message.length < 10) {
    res.status(400).json({ error: "Geçersiz form verisi." });
    return;
  }

  const [saved] = await db
    .insert(contactMessagesTable)
    .values({ name, email, subject, message })
    .returning();

  const emailResult = await sendContactEmail({ name, email, subject, message });

  res.json({
    ok: true,
    id: saved?.id,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.reason,
  });
});

export default router;
