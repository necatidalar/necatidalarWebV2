import { Router } from "express";
import { db, quotesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const quotes = await db
    .select()
    .from(quotesTable)
    .where(eq(quotesTable.isActive, true))
    .orderBy(asc(quotesTable.displayOrder));
  res.json(quotes);
});

export default router;
