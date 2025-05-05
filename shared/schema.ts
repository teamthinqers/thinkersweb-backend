import { pgTable, text, serial, timestamp, integer, boolean, unique, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enhanced users table with profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
  sentConnections: many(connections, { relationName: "userConnections" }),
  receivedConnections: many(connections, { relationName: "userConnectionRequests" }),
  sharedWithMe: many(sharedEntries),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must be a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  fullName: (schema) => schema.optional(),
  bio: (schema) => schema.optional(),
  avatarUrl: (schema) => schema.optional(),
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
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  visibility: text("visibility").default("private").notNull(), // private, shared, or public
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [entries.categoryId],
    references: [categories.id],
  }),
  tags: many(entryTags),
  relatedTo: many(entryRelations, { relationName: "originEntry" }),
  relatedFrom: many(entryRelations, { relationName: "relatedEntry" }),
  sharedWith: many(sharedEntries),
}));

export const insertEntrySchema = createInsertSchema(entries, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  userId: (schema) => schema.optional(),
  categoryId: (schema) => schema.optional(),
  isFavorite: (schema) => schema.optional(),
  visibility: (schema) => schema.optional(),
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

// User connections (Barter Learn)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  connectedUserId: integer("connected_user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userConnectionUnique: unique().on(table.userId, table.connectedUserId),
  }
});

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
    relationName: "userConnections",
  }),
  connectedUser: one(users, {
    fields: [connections.connectedUserId],
    references: [users.id],
    relationName: "userConnectionRequests",
  }),
}));

export const insertConnectionSchema = createInsertSchema(connections, {
  userId: (schema) => schema.positive("User ID must be positive"),
  connectedUserId: (schema) => schema.positive("Connected user ID must be positive"),
  status: (schema) => schema.optional(),
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Shared entries
export const sharedEntries = pgTable("shared_entries", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => entries.id).notNull(),
  sharedWithUserId: integer("shared_with_user_id").references(() => users.id).notNull(),
  permissions: text("permissions").notNull().default("read"), // read, comment, edit
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    entryUserUnique: unique().on(table.entryId, table.sharedWithUserId),
  }
});

export const sharedEntriesRelations = relations(sharedEntries, ({ one }) => ({
  entry: one(entries, {
    fields: [sharedEntries.entryId],
    references: [entries.id],
  }),
  sharedWithUser: one(users, {
    fields: [sharedEntries.sharedWithUserId],
    references: [users.id],
  }),
}));

export const insertSharedEntrySchema = createInsertSchema(sharedEntries, {
  entryId: (schema) => schema.positive("Entry ID must be positive"),
  sharedWithUserId: (schema) => schema.positive("User ID must be positive"),
  permissions: (schema) => schema.optional(),
});

export type InsertSharedEntry = z.infer<typeof insertSharedEntrySchema>;
export type SharedEntry = typeof sharedEntries.$inferSelect;
