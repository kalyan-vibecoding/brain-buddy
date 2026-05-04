import { pgTable, text, integer, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const completionsTable = pgTable("activity_completions", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => childrenTable.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),
  stars: integer("stars").notNull(),
  difficulty: text("difficulty").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  correct: boolean("correct").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompletionSchema = createInsertSchema(completionsTable).omit({ id: true, completedAt: true });
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type Completion = typeof completionsTable.$inferSelect;
