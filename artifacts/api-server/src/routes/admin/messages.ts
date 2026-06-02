import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const messages = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));
  res.json(messages);
});

router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  await db
    .update(contactMessagesTable)
    .set({ isRead: true })
    .where(eq(contactMessagesTable.id, id));
  res.json({ ok: true });
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.json({ ok: true });
});

export default router;
