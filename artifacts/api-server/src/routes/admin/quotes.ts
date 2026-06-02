import { Router } from "express";
import { db, quotesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const quotes = await db
    .select()
    .from(quotesTable)
    .orderBy(asc(quotesTable.displayOrder));
  res.json(quotes);
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { text, author, title } = req.body as { text?: string; author?: string; title?: string };
  if (!text || !author) {
    res.status(400).json({ error: "Alıntı metni ve yazar zorunludur." });
    return;
  }
  const existing = await db.select().from(quotesTable).orderBy(asc(quotesTable.displayOrder));
  const maxOrder = existing.length > 0 ? Math.max(...existing.map(q => q.displayOrder)) : 0;
  const [created] = await db
    .insert(quotesTable)
    .values({ text, author, title: title ?? "", displayOrder: maxOrder + 1, isActive: true })
    .returning();
  res.json(created);
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  const { text, author, title, displayOrder, isActive } = req.body as {
    text?: string;
    author?: string;
    title?: string;
    displayOrder?: number;
    isActive?: boolean;
  };
  const updates: Partial<{ text: string; author: string; title: string; displayOrder: number; isActive: boolean }> = {};
  if (text !== undefined) updates.text = text;
  if (author !== undefined) updates.author = author;
  if (title !== undefined) updates.title = title;
  if (displayOrder !== undefined) updates.displayOrder = displayOrder;
  if (isActive !== undefined) updates.isActive = isActive;

  const [updated] = await db
    .update(quotesTable)
    .set(updates)
    .where(eq(quotesTable.id, id))
    .returning();
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  await db.delete(quotesTable).where(eq(quotesTable.id, id));
  res.json({ ok: true });
});

export default router;
