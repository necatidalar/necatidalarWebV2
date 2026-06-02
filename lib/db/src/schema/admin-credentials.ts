import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminCredentialsTable = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const insertAdminCredentialsSchema = createInsertSchema(adminCredentialsTable).omit({ id: true });
export type InsertAdminCredentials = z.infer<typeof insertAdminCredentialsSchema>;
export type AdminCredentials = typeof adminCredentialsTable.$inferSelect;
