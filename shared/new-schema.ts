import { pgTable, serial, text, integer, timestamp, decimal, boolean, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password"),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6B7280"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === SEPARATE TABLES FOR VECTOR DB MIGRATION ===

// 1. DOTS table - Individual insights with three-layer structure
export const dots = pgTable("dots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  oneWordSummary: text("one_word_summary").notNull(),
  summary: text("summary").notNull(),
  anchor: text("anchor").notNull(),
  pulse: text("pulse").notNull(),
  sourceType: text("source_type").notNull().default("text"), // 'text', 'voice', 'hybrid'
  captureMode: text("capture_mode").notNull().default("natural"), // 'natural', 'ai'
  wheelId: integer("wheel_id").references(() => wheels.id), // Optional: belongs to a wheel
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  voiceData: text("voice_data"), // JSON for voice URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. CHAKRAS table - Top-level life purposes
export const chakras = pgTable("chakras", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heading: text("heading").notNull(),
  purpose: text("purpose").notNull(),
  timeline: text("timeline").notNull(),
  sourceType: text("source_type").notNull().default("text"), // 'text', 'voice', 'hybrid'
  color: text("color").notNull().default("#B45309"), // Dark amber for chakras
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  radius: integer("radius").default(420),
  voiceData: text("voice_data"), // JSON for voice URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. WHEELS table - Goal-oriented projects that can belong to chakras
export const wheels = pgTable("wheels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heading: text("heading").notNull(),
  goals: text("goals").notNull(),
  timeline: text("timeline").notNull(),
  sourceType: text("source_type").notNull().default("text"), // 'text', 'voice', 'hybrid'
  category: text("category").default("general"),
  color: text("color").notNull().default("#EA580C"), // Orange for wheels
  chakraId: integer("chakra_id").references(() => chakras.id), // References chakras table
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  radius: integer("radius").default(120),
  voiceData: text("voice_data"), // JSON for voice URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Voice recordings for all three types
export const voiceRecordings = pgTable("voice_recordings", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // 'dot', 'wheel', 'chakra'
  contentId: integer("content_id").notNull(), // ID of the content item
  layer: text("layer").notNull(), // 'summary', 'anchor', 'pulse' for dots; 'heading', 'goals', 'timeline' for wheels/chakras
  audioUrl: text("audio_url").notNull(), // URL to stored audio file
  duration: integer("duration"), // Duration in seconds
  transcript: text("transcript"), // Transcribed text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vector embeddings for semantic search
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // 'dot', 'wheel', 'chakra', 'conversation'
  contentId: integer("content_id").notNull(), // ID of the content item
  userId: integer("user_id").references(() => users.id),
  vectorId: text("vector_id").notNull().unique(), // Pinecone vector ID
  content: text("content").notNull(), // Original text content
  metadata: text("metadata"), // JSON metadata for filtering and context
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const dotsRelations = relations(dots, ({ one }) => ({
  user: one(users, {
    fields: [dots.userId],
    references: [users.id],
  }),
  wheel: one(wheels, {
    fields: [dots.wheelId],
    references: [wheels.id],
  }),
}));

export const chakrasRelations = relations(chakras, ({ one, many }) => ({
  user: one(users, {
    fields: [chakras.userId],
    references: [users.id],
  }),
  wheels: many(wheels),
}));

export const wheelsRelations = relations(wheels, ({ one, many }) => ({
  user: one(users, {
    fields: [wheels.userId],
    references: [users.id],
  }),
  chakra: one(chakras, {
    fields: [wheels.chakraId],
    references: [chakras.id],
  }),
  dots: many(dots),
}));

export const vectorEmbeddingsRelations = relations(vectorEmbeddings, ({ one }) => ({
  user: one(users, {
    fields: [vectorEmbeddings.userId],
    references: [users.id],
  }),
}));

// === VALIDATION SCHEMAS ===

export const insertDotSchema = createInsertSchema(dots, {
  oneWordSummary: (schema) => schema.min(1, "One word summary is required").max(20, "Must be one word"),
  summary: (schema) => schema.min(10, "Summary must be at least 10 characters").max(220, "Summary too long"),
  anchor: (schema) => schema.min(10, "Anchor must be at least 10 characters").max(300, "Anchor too long"),
  pulse: (schema) => schema.min(1, "Pulse is required").max(50, "Pulse too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
  captureMode: (schema) => schema.refine(val => ['natural', 'ai'].includes(val), "Invalid capture mode"),
});

export const insertChakraSchema = createInsertSchema(chakras, {
  heading: (schema) => schema.min(3, "Heading must be at least 3 characters").max(100, "Heading too long"),
  purpose: (schema) => schema.min(10, "Purpose must be at least 10 characters").max(500, "Purpose too long"),
  timeline: (schema) => schema.min(5, "Timeline must be at least 5 characters").max(200, "Timeline too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
});

export const insertWheelSchema = createInsertSchema(wheels, {
  heading: (schema) => schema.min(3, "Heading must be at least 3 characters").max(100, "Heading too long"),
  goals: (schema) => schema.min(10, "Goals must be at least 10 characters").max(500, "Goals too long"),
  timeline: (schema) => schema.min(5, "Timeline must be at least 5 characters").max(200, "Timeline too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
});

export const insertVoiceRecordingSchema = createInsertSchema(voiceRecordings, {
  contentType: (schema) => schema.refine(val => ['dot', 'wheel', 'chakra'].includes(val), "Content type must be dot, wheel, or chakra"),
  contentId: (schema) => schema.positive("Content ID must be positive"),
  layer: (schema) => schema.min(1, "Layer is required"),
  audioUrl: (schema) => schema.url("Must be a valid URL"),
});

export const insertVectorEmbeddingSchema = createInsertSchema(vectorEmbeddings, {
  contentType: (schema) => schema.refine(val => ['dot', 'wheel', 'chakra', 'conversation'].includes(val), "Content type must be dot, wheel, chakra, or conversation"),
  contentId: (schema) => schema.positive("Content ID must be positive"),
  vectorId: (schema) => schema.min(1, "Vector ID is required"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
});

// === TYPE EXPORTS ===

export type InsertDot = z.infer<typeof insertDotSchema>;
export type Dot = typeof dots.$inferSelect;

export type InsertChakra = z.infer<typeof insertChakraSchema>;
export type Chakra = typeof chakras.$inferSelect;

export type InsertWheel = z.infer<typeof insertWheelSchema>;
export type Wheel = typeof wheels.$inferSelect;

export type InsertVoiceRecording = z.infer<typeof insertVoiceRecordingSchema>;
export type VoiceRecording = typeof voiceRecordings.$inferSelect;

export type InsertVectorEmbedding = z.infer<typeof insertVectorEmbeddingSchema>;
export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;