import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const technologiesTable = pgTable("technologies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iconKey: text("icon_key").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertTechnologySchema = createInsertSchema(technologiesTable).omit({ id: true });
export type InsertTechnology = z.infer<typeof insertTechnologySchema>;
export type Technology = typeof technologiesTable.$inferSelect;
