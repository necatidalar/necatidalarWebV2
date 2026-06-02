import { Router } from "express";
import { db, technologiesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const techs = await db
    .select()
    .from(technologiesTable)
    .orderBy(asc(technologiesTable.displayOrder));
  res.json(techs);
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { name, iconKey } = req.body as { name?: string; iconKey?: string };
  if (!name || !iconKey) {
    res.status(400).json({ error: "Ad ve ikon anahtarı zorunludur." });
    return;
  }
  const existing = await db.select().from(technologiesTable).orderBy(asc(technologiesTable.displayOrder));
  const maxOrder = existing.length > 0 ? Math.max(...existing.map(t => t.displayOrder)) : 0;
  const [created] = await db
    .insert(technologiesTable)
    .values({ name, iconKey, displayOrder: maxOrder + 1 })
    .returning();
  res.json(created);
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  const { name, iconKey, displayOrder } = req.body as {
    name?: string;
    iconKey?: string;
    displayOrder?: number;
  };
  const updates: Partial<{ name: string; iconKey: string; displayOrder: number }> = {};
  if (name) updates.name = name;
  if (iconKey) updates.iconKey = iconKey;
  if (displayOrder !== undefined) updates.displayOrder = displayOrder;

  const [updated] = await db
    .update(technologiesTable)
    .set(updates)
    .where(eq(technologiesTable.id, id))
    .returning();
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Geçersiz ID." });
    return;
  }
  await db.delete(technologiesTable).where(eq(technologiesTable.id, id));
  res.json({ ok: true });
});

export default router;
