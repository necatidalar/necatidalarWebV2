import { Router } from "express";
import { db, technologiesTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import type { Request, Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const technologies = await db
    .select()
    .from(technologiesTable)
    .orderBy(asc(technologiesTable.displayOrder));
  res.json(technologies);
});

export default router;
