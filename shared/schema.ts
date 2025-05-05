import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (keeping it from the original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories for learning entries
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6366f1"), // Primary color as default
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  entries: many(entries),
}));

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  color: (schema) => schema.optional(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Tags for entries
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  entryTags: many(entryTags),
}));

export const insertTagSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Learning entries
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entriesRelations = relations(entries, ({ one, many }) => ({
  category: one(categories, {
    fields: [entries.categoryId],
    references: [categories.id],
  }),
  tags: many(entryTags),
  relatedTo: many(entryRelations, { relationName: "originEntry" }),
  relatedFrom: many(entryRelations, { relationName: "relatedEntry" }),
}));

export const insertEntrySchema = createInsertSchema(entries, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  categoryId: (schema) => schema.optional(),
  isFavorite: (schema) => schema.optional(),
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;

// Junction table for entries and tags (many-to-many)
export const entryTags = pgTable("entry_tags", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => entries.id).notNull(),
  tagId: integer("tag_id").references(() => tags.id).notNull(),
});

export const entryTagsRelations = relations(entryTags, ({ one }) => ({
  entry: one(entries, {
    fields: [entryTags.entryId],
    references: [entries.id],
  }),
  tag: one(tags, {
    fields: [entryTags.tagId],
    references: [tags.id],
  }),
}));

// Relationships between entries
export const entryRelations = pgTable("entry_relations", {
  id: serial("id").primaryKey(),
  originEntryId: integer("origin_entry_id").references(() => entries.id).notNull(),
  relatedEntryId: integer("related_entry_id").references(() => entries.id).notNull(),
});

export const entryRelationsRelations = relations(entryRelations, ({ one }) => ({
  originEntry: one(entries, {
    fields: [entryRelations.originEntryId],
    references: [entries.id],
    relationName: "originEntry",
  }),
  relatedEntry: one(entries, {
    fields: [entryRelations.relatedEntryId],
    references: [entries.id],
    relationName: "relatedEntry",
  }),
}));
