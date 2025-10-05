import { pgTable, serial, text, integer, timestamp, decimal, boolean, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table with DotSpark activation tracking
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  linkedinId: text("linkedin_id").unique(), // LinkedIn user ID
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
  linkedinHeadline: text("linkedin_headline"), // Professional headline from LinkedIn
  linkedinProfileUrl: text("linkedin_profile_url"), // Link to LinkedIn profile
  linkedinPhotoUrl: text("linkedin_photo_url"), // LinkedIn profile picture URL
  hashedPassword: text("hashed_password"),
  bio: text("bio"),
  avatar: text("avatar"),
  dotSparkActivated: boolean("dotspark_activated").default(false).notNull(),
  dotSparkActivatedAt: timestamp("dotspark_activated_at"),
  subscriptionTier: text("subscription_tier").default("free"), // 'free', 'pro', 'premium'
  // Neural Strength Milestones
  cognitiveIdentityCompleted: boolean("cognitive_identity_completed").default(false).notNull(),
  cognitiveIdentityCompletedAt: timestamp("cognitive_identity_completed_at"),
  learningEngineCompleted: boolean("learning_engine_completed").default(false).notNull(),
  learningEngineCompletedAt: timestamp("learning_engine_completed_at"),
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

// === NEW SIMPLIFIED THOUGHT SYSTEM ===

// Thoughts table - Unified personal and social thoughts
export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heading: text("heading").notNull(),
  summary: text("summary").notNull(),
  emotion: text("emotion"), // Optional: joy, curiosity, frustration, etc.
  imageUrl: text("image_url"), // Optional: image attachment
  visibility: text("visibility").notNull().default("personal"), // 'personal' or 'social'
  channel: text("channel").notNull().default("write"), // 'write', 'linkedin', 'whatsapp', 'chatgpt', etc.
  positionX: integer("position_x"),
  positionY: integer("position_y"),
  keywords: text("keywords"), // Optional: keywords for search
  anchor: text("anchor"), // Optional: context to recall thought
  analogies: text("analogies"), // Optional: analogies for thought
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Saved thoughts - Junction table for users saving others' social thoughts to their MyNeura
export const savedThoughts = pgTable("saved_thoughts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Who saved it
  thoughtId: integer("thought_id").references(() => thoughts.id).notNull(), // What they saved
  savedAt: timestamp("saved_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate saves
  uniqueUserThought: unique().on(table.userId, table.thoughtId),
}));

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
  chakraId: integer("chakra_id").references(() => chakras.id), // Optional: direct mapping to chakra (long-term vision)
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

// Vector embeddings for semantic search and intelligent retrieval
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // 'dot', 'wheel', 'chakra', 'conversation', 'user_behavior'
  contentId: integer("content_id").notNull(), // ID of the content item
  userId: integer("user_id").references(() => users.id).notNull(),
  vectorId: text("vector_id").notNull().unique(), // Pinecone vector ID
  content: text("content").notNull(), // Original text content
  embedding: text("embedding"), // JSON array of embedding values for local storage
  metadata: text("metadata"), // JSON metadata for filtering and context
  relevanceScore: decimal("relevance_score", { precision: 10, scale: 8 }), // For ranking results
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User behavior tracking for intelligent insights
export const userBehavior = pgTable("user_behavior", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  actionType: text("action_type").notNull(), // 'dot_created', 'wheel_created', 'chakra_created', 'chat_interaction', 'search_query'
  entityType: text("entity_type"), // 'dot', 'wheel', 'chakra', 'chat', 'search'
  entityId: integer("entity_id"), // ID of the related entity
  actionData: text("action_data"), // JSON data about the action
  sessionId: text("session_id"), // For grouping related actions
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// === RELATIONS ===

// New thought system relations
export const thoughtsRelations = relations(thoughts, ({ one, many }) => ({
  user: one(users, {
    fields: [thoughts.userId],
    references: [users.id],
  }),
  saves: many(savedThoughts),
}));

export const savedThoughtsRelations = relations(savedThoughts, ({ one }) => ({
  user: one(users, {
    fields: [savedThoughts.userId],
    references: [users.id],
  }),
  thought: one(thoughts, {
    fields: [savedThoughts.thoughtId],
    references: [thoughts.id],
  }),
}));

// Old system relations (legacy)
export const dotsRelations = relations(dots, ({ one }) => ({
  user: one(users, {
    fields: [dots.userId],
    references: [users.id],
  }),
  wheel: one(wheels, {
    fields: [dots.wheelId],
    references: [wheels.id],
  }),
  chakra: one(chakras, {
    fields: [dots.chakraId],
    references: [chakras.id],
  }),
}));

export const chakrasRelations = relations(chakras, ({ one, many }) => ({
  user: one(users, {
    fields: [chakras.userId],
    references: [users.id],
  }),
  wheels: many(wheels),
  dots: many(dots), // Direct chakra-to-dot relationship for long-term vision alignment
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

export const userBehaviorRelations = relations(userBehavior, ({ one }) => ({
  user: one(users, {
    fields: [userBehavior.userId],
    references: [users.id],
  }),
}));

// === VALIDATION SCHEMAS ===

// New thought system schemas
export const insertThoughtSchema = createInsertSchema(thoughts, {
  heading: (schema) => schema.min(1, "Heading is required").max(100, "Heading too long"),
  summary: (schema) => schema.min(1, "Your thought cannot be empty").max(1000, "Thought is too long (max 1000 characters)"),
  emotion: (schema) => schema.optional(),
  visibility: (schema) => schema.refine(val => ['personal', 'social'].includes(val), "Visibility must be personal or social"),
});

export const selectThoughtSchema = createSelectSchema(thoughts);
export type Thought = z.infer<typeof selectThoughtSchema>;
export type InsertThought = z.infer<typeof insertThoughtSchema>;

export const insertSavedThoughtSchema = createInsertSchema(savedThoughts, {
  userId: (schema) => schema.positive("User ID must be positive"),
  thoughtId: (schema) => schema.positive("Thought ID must be positive"),
});

export const selectSavedThoughtSchema = createSelectSchema(savedThoughts);
export type SavedThought = z.infer<typeof selectSavedThoughtSchema>;
export type InsertSavedThought = z.infer<typeof insertSavedThoughtSchema>;

// Old system schemas (legacy)
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
  contentType: (schema) => schema.refine(val => ['dot', 'wheel', 'chakra', 'conversation', 'user_behavior'].includes(val), "Invalid content type"),
  contentId: (schema) => schema.positive("Content ID must be positive"),
  vectorId: (schema) => schema.min(1, "Vector ID is required"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
});

export const insertUserBehaviorSchema = createInsertSchema(userBehavior, {
  actionType: (schema) => schema.refine(val => ['dot_created', 'wheel_created', 'chakra_created', 'chat_interaction', 'search_query'].includes(val), "Invalid action type"),
  entityType: (schema) => schema.refine(val => !val || ['dot', 'wheel', 'chakra', 'chat', 'search'].includes(val), "Invalid entity type").optional(),
  actionData: (schema) => schema.optional(),
});

// Legacy tables for backward compatibility (keeping minimal structure)
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  categoryId: integer("category_id").references(() => categories.id),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  visibility: text("visibility").default("private"),
});

export const conversationSessions = pgTable("conversation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull().unique(),
  conversationData: text("conversation_data"),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Note: Session table is managed by connect-pg-simple middleware, not by Drizzle

export const whatsappUsers = pgTable("whatsapp_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  lastMessageSentAt: timestamp("last_message_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappOtpVerifications = pgTable("whatsapp_otp_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Legacy relations
export const entriesRelations = relations(entries, ({ one }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
  category: one(categories, { fields: [entries.categoryId], references: [categories.id] }),
}));

export const conversationSessionsRelations = relations(conversationSessions, ({ one }) => ({
  user: one(users, { fields: [conversationSessions.userId], references: [users.id] }),
}));

export const whatsappUsersRelations = relations(whatsappUsers, ({ one }) => ({
  user: one(users, { fields: [whatsappUsers.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  dots: many(dots),
  wheels: many(wheels),
  chakras: many(chakras),
  vectorEmbeddings: many(vectorEmbeddings),
  userBehavior: many(userBehavior),
  conversationSessions: many(conversationSessions),
  whatsappUsers: many(whatsappUsers),
  entries: many(entries),
}));

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

// Legacy types
export type Entry = typeof entries.$inferSelect;
export type ConversationSession = typeof conversationSessions.$inferSelect;