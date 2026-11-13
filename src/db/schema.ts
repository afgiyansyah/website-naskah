import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export type SceneRow = {
  label: string;
  time: string;
  visual: string;
  voiceover: string;
  text: string;
};

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  niche: text("niche").notNull().default(""),
  tone: varchar("tone", { length: 30 }).notNull().default("santai"),
  formula: varchar("formula", { length: 30 }).notNull().default("tips"),
  duration: integer("duration").notNull().default(30),
  scenes: jsonb("scenes").$type<SceneRow[]>().notNull().default([]),
  caption: text("caption").notNull().default(""),
  hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
  status: varchar("status", { length: 20 }).notNull().default("ide"),
  scheduledDate: varchar("scheduled_date", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ScriptRow = typeof scripts.$inferSelect;
