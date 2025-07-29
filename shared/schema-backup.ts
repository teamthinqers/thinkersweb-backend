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
  firebaseUid: text("firebase_uid").unique(), // For Google authentication
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
  firebaseUid: (schema) => schema.optional(),
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
  voiceRecordings: many(voiceRecordings),
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

// Separate table for DOTS (individual insights)
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

export const insertDotSchema = createInsertSchema(dots, {
  oneWordSummary: (schema) => schema.min(1, "One word summary is required").max(20, "Must be one word"),
  summary: (schema) => schema.min(10, "Summary must be at least 10 characters").max(220, "Summary too long"),
  anchor: (schema) => schema.min(10, "Anchor must be at least 10 characters").max(300, "Anchor too long"),
  pulse: (schema) => schema.min(1, "Pulse is required").max(50, "Pulse too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
  captureMode: (schema) => schema.refine(val => ['natural', 'ai'].includes(val), "Invalid capture mode"),
});

export type InsertDot = z.infer<typeof insertDotSchema>;
export type Dot = typeof dots.$inferSelect;

// Separate table for CHAKRAS (top-level life purposes)
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

export const chakrasRelations = relations(chakras, ({ one, many }) => ({
  user: one(users, {
    fields: [chakras.userId],
    references: [users.id],
  }),
  wheels: many(wheels),
}));

export const insertChakraSchema = createInsertSchema(chakras, {
  heading: (schema) => schema.min(3, "Heading must be at least 3 characters").max(100, "Heading too long"),
  purpose: (schema) => schema.min(10, "Purpose must be at least 10 characters").max(500, "Purpose too long"),
  timeline: (schema) => schema.min(5, "Timeline must be at least 5 characters").max(200, "Timeline too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
});

export type InsertChakra = z.infer<typeof insertChakraSchema>;
export type Chakra = typeof chakras.$inferSelect;

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

export const voiceRecordingsRelations = relations(voiceRecordings, ({ one }) => ({
  // No direct foreign key - uses contentType + contentId for flexibility
}));

export const insertVoiceRecordingSchema = createInsertSchema(voiceRecordings, {
  contentType: (schema) => schema.refine(val => ['dot', 'wheel', 'chakra'].includes(val), "Content type must be dot, wheel, or chakra"),
  contentId: (schema) => schema.positive("Content ID must be positive"),
  layer: (schema) => schema.min(1, "Layer is required"),
  audioUrl: (schema) => schema.url("Must be a valid URL"),
  duration: (schema) => schema.optional(),
  transcript: (schema) => schema.optional(),
});

export type InsertVoiceRecording = z.infer<typeof insertVoiceRecordingSchema>;
export type VoiceRecording = typeof voiceRecordings.$inferSelect;

// Vector embeddings for semantic search and similarity matching
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // 'entry', 'wheel', 'chakra', 'conversation', 'dot'
  contentId: integer("content_id").notNull(), // ID of the content item
  userId: integer("user_id").references(() => users.id),
  vectorId: text("vector_id").notNull().unique(), // Pinecone vector ID
  content: text("content").notNull(), // Original text content
  metadata: text("metadata"), // JSON metadata for filtering and context
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vectorEmbeddingsRelations = relations(vectorEmbeddings, ({ one }) => ({
  user: one(users, {
    fields: [vectorEmbeddings.userId],
    references: [users.id],
  }),
}));

export const insertVectorEmbeddingSchema = createInsertSchema(vectorEmbeddings, {
  contentType: (schema) => schema.refine(val => ['entry', 'wheel', 'chakra', 'conversation', 'dot'].includes(val), "Content type must be entry, wheel, chakra, conversation, or dot"),
  contentId: (schema) => schema.positive("Content ID must be positive"),
  vectorId: (schema) => schema.min(1, "Vector ID is required"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  metadata: (schema) => schema.optional(),
});

export type InsertVectorEmbedding = z.infer<typeof insertVectorEmbeddingSchema>;
export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;

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

// WhatsApp integration schema
export const whatsappUsers = pgTable("whatsapp_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  lastMessageSentAt: timestamp("last_message_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappUsersRelations = relations(whatsappUsers, ({ one }) => ({
  user: one(users, { fields: [whatsappUsers.userId], references: [users.id] }),
}));

export const insertWhatsappUserSchema = createInsertSchema(whatsappUsers, {
  userId: (schema) => schema.positive("User ID must be positive"),
  phoneNumber: (schema) => schema.min(10, "Phone number must be at least 10 characters"),
  active: (schema) => schema.optional(),
  lastMessageSentAt: (schema) => schema.optional(),
});
export type InsertWhatsappUser = z.infer<typeof insertWhatsappUserSchema>;
export type WhatsappUser = typeof whatsappUsers.$inferSelect;

// Dots table for three-layer dot system
export const dots = pgTable("dots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  summary: text("summary").notNull(), // 220 chars max
  anchor: text("anchor").notNull(), // 300 chars max
  pulse: text("pulse").notNull(), // Single emotion word
  wheelId: integer("wheel_id").references(() => wheels.id), // Can be null for free dots
  sourceType: text("source_type").notNull(), // 'voice' or 'text'
  captureMode: text("capture_mode").notNull(), // 'natural' or 'ai'
  positionX: integer("position_x").default(0).notNull(),
  positionY: integer("position_y").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dotsRelations = relations(dots, ({ one, many }) => ({
  user: one(users, {
    fields: [dots.userId],
    references: [users.id],
  }),
  wheel: one(wheels, {
    fields: [dots.wheelId], 
    references: [wheels.id],
  }),
  voiceRecordings: many(dotVoiceRecordings),
}));

export const insertDotSchema = createInsertSchema(dots, {
  summary: (schema) => schema.min(1, "Summary is required").max(220, "Summary must be 220 characters or less"),
  anchor: (schema) => schema.min(1, "Anchor is required").max(300, "Anchor must be 300 characters or less"),
  pulse: (schema) => schema.min(1, "Pulse is required").max(50, "Pulse must be 50 characters or less"),
  sourceType: (schema) => schema.refine(val => ['voice', 'text'].includes(val), "Source type must be voice or text"),
  captureMode: (schema) => schema.refine(val => ['natural', 'ai'].includes(val), "Capture mode must be natural or ai"),
  wheelId: (schema) => schema.optional(),
  positionX: (schema) => schema.optional(),
  positionY: (schema) => schema.optional(),
});

export type InsertDot = z.infer<typeof insertDotSchema>;
export type Dot = typeof dots.$inferSelect;

// WHEELS table - goal-oriented projects that can belong to chakras
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

export const insertWheelSchema = createInsertSchema(wheels, {
  heading: (schema) => schema.min(3, "Heading must be at least 3 characters").max(100, "Heading too long"),
  goals: (schema) => schema.min(10, "Goals must be at least 10 characters").max(500, "Goals too long"),
  timeline: (schema) => schema.min(5, "Timeline must be at least 5 characters").max(200, "Timeline too long"),
  sourceType: (schema) => schema.refine(val => ['text', 'voice', 'hybrid'].includes(val), "Invalid source type"),
  category: (schema) => schema.optional(),
  color: (schema) => schema.optional(),
  chakraId: (schema) => schema.optional(),
});

export type InsertWheel = z.infer<typeof insertWheelSchema>;
export type Wheel = typeof wheels.$inferSelect;

// Voice recordings for dots
export const dotVoiceRecordings = pgTable("dot_voice_recordings", {
  id: serial("id").primaryKey(),
  dotId: integer("dot_id").references(() => dots.id).notNull(),
  layer: text("layer").notNull(), // 'summary', 'anchor', or 'pulse'
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration"),
  transcript: text("transcript"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dotVoiceRecordingsRelations = relations(dotVoiceRecordings, ({ one }) => ({
  dot: one(dots, {
    fields: [dotVoiceRecordings.dotId],
    references: [dots.id],
  }),
}));

export const insertDotVoiceRecordingSchema = createInsertSchema(dotVoiceRecordings, {
  dotId: (schema) => schema.positive("Dot ID must be positive"),
  layer: (schema) => schema.refine(val => ['summary', 'anchor', 'pulse'].includes(val), "Layer must be summary, anchor, or pulse"),
  audioUrl: (schema) => schema.url("Must be a valid URL"),
  duration: (schema) => schema.optional(),
  transcript: (schema) => schema.optional(),
});

export type InsertDotVoiceRecording = z.infer<typeof insertDotVoiceRecordingSchema>;
export type DotVoiceRecording = typeof dotVoiceRecordings.$inferSelect;

// User conversation memory and pattern recognition
export const userPatternMemory = pgTable("user_pattern_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  thoughtPattern: text("thought_pattern").notNull(), // 'dot', 'wheel', 'chakra'
  keywords: text("keywords").notNull(), // JSON array of frequently used keywords
  conversationStyle: text("conversation_style"), // 'brief', 'detailed', 'analytical', etc.
  preferredTopics: text("preferred_topics"), // JSON array of topics user discusses
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPatternMemoryRelations = relations(userPatternMemory, ({ one }) => ({
  user: one(users, {
    fields: [userPatternMemory.userId],
    references: [users.id],
  }),
}));

// Conversation sessions for thought organization
export const conversationSessions = pgTable("conversation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull().unique(),
  thoughtType: text("thought_type"), // 'dot', 'wheel', 'chakra', 'exploring'
  conversationData: text("conversation_data").notNull(), // JSON of conversation messages
  organizationSummary: text("organization_summary"), // AI-generated summary of organized thoughts
  status: text("status").notNull().default("active"), // 'active', 'completed', 'saved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationSessionsRelations = relations(conversationSessions, ({ one }) => ({
  user: one(users, {
    fields: [conversationSessions.userId],
    references: [users.id],
  }),
}));

export const insertUserPatternMemorySchema = createInsertSchema(userPatternMemory, {
  userId: (schema) => schema.positive("User ID must be positive"),
  thoughtPattern: (schema) => schema.refine(val => ['dot', 'wheel', 'chakra'].includes(val), "Must be dot, wheel, or chakra"),
  keywords: (schema) => schema.min(1, "Keywords required"),
  conversationStyle: (schema) => schema.optional(),
  preferredTopics: (schema) => schema.optional(),
});

export const insertConversationSessionSchema = createInsertSchema(conversationSessions, {
  sessionId: (schema) => schema.min(1, "Session ID required"),
  thoughtType: (schema) => schema.optional(),
  conversationData: (schema) => schema.min(1, "Conversation data required"),
  organizationSummary: (schema) => schema.optional(),
  status: (schema) => schema.optional(),
});

export type InsertUserPatternMemory = z.infer<typeof insertUserPatternMemorySchema>;
export type UserPatternMemory = typeof userPatternMemory.$inferSelect;
export type InsertConversationSession = z.infer<typeof insertConversationSessionSchema>;
export type ConversationSession = typeof conversationSessions.$inferSelect;

// WhatsApp OTP verification schema
export const whatsappOtpVerifications = pgTable("whatsapp_otp_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  verified: boolean("verified").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whatsappOtpVerificationsRelations = relations(whatsappOtpVerifications, ({ one }) => ({
  user: one(users, { fields: [whatsappOtpVerifications.userId], references: [users.id] }),
}));

export const insertWhatsappOtpVerificationSchema = createInsertSchema(whatsappOtpVerifications, {
  userId: (schema) => schema.positive("User ID must be positive"),
  phoneNumber: (schema) => schema.min(10, "Phone number must be at least 10 characters"),
  otpCode: (schema) => schema.length(6, "OTP code must be exactly 6 characters"),
  verified: (schema) => schema.optional(),
  expiresAt: (schema) => schema,
});

export type InsertWhatsappOtpVerification = z.infer<typeof insertWhatsappOtpVerificationSchema>;
export type WhatsappOtpVerification = typeof whatsappOtpVerifications.$inferSelect;

// Preview mode tables - identical structure to real tables but for demonstration data
// Preview dots table - locked positions for consistent demonstration experience
export const previewDots = pgTable("preview_dots", {
  id: serial("id").primaryKey(),
  summary: text("summary").notNull(), // 220 chars max
  anchor: text("anchor").notNull(), // 300 chars max
  pulse: text("pulse").notNull(), // Single emotion word
  wheelId: integer("wheel_id").references(() => previewWheels.id), // References preview wheels
  sourceType: text("source_type").notNull(), // 'voice' or 'text'
  captureMode: text("capture_mode").notNull(), // 'natural' or 'ai'
  positionX: integer("position_x").default(0).notNull(), // Locked position
  positionY: integer("position_y").default(0).notNull(), // Locked position
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Preview wheels table - identical to wheels but for demonstration
export const previewWheels: any = pgTable("preview_wheels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  heading: text("heading"),
  goals: text("goals"), // For regular wheels
  purpose: text("purpose"), // For Chakras (top-level)
  timeline: text("timeline"),
  category: text("category").notNull(),
  color: text("color").notNull().default("#EA580C"),
  chakraId: integer("chakra_id").references(() => previewWheels.id), // Self-reference for chakra hierarchy
  positionX: integer("position_x").default(0).notNull(), // Locked position
  positionY: integer("position_y").default(0).notNull(), // Locked position
  radius: integer("radius").default(120).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for preview tables
export const previewDotsRelations = relations(previewDots, ({ one, many }) => ({
  wheel: one(previewWheels, {
    fields: [previewDots.wheelId], 
    references: [previewWheels.id],
  }),
}));

export const previewWheelsRelations = relations(previewWheels, ({ one, many }): any => ({
  chakra: one(previewWheels, {
    fields: [previewWheels.chakraId],
    references: [previewWheels.id],
    relationName: "previewWheelChakra",
  }),
  childWheels: many(previewWheels, {
    relationName: "previewWheelChakra",
  }),
  dots: many(previewDots),
}));

// Schemas for preview tables
export const insertPreviewDotSchema = createInsertSchema(previewDots, {
  summary: (schema) => schema.min(1, "Summary is required").max(220, "Summary must be 220 characters or less"),
  anchor: (schema) => schema.min(1, "Anchor is required").max(300, "Anchor must be 300 characters or less"),
  pulse: (schema) => schema.min(1, "Pulse is required").max(50, "Pulse must be 50 characters or less"),
  sourceType: (schema) => schema.refine(val => ['voice', 'text'].includes(val), "Source type must be voice or text"),
  captureMode: (schema) => schema.refine(val => ['natural', 'ai'].includes(val), "Capture mode must be natural or ai"),
  wheelId: (schema) => schema.optional(),
  positionX: (schema) => schema.optional(),
  positionY: (schema) => schema.optional(),
});

export const insertPreviewWheelSchema = createInsertSchema(previewWheels, {
  name: (schema) => schema.min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  heading: (schema) => schema.optional(),
  goals: (schema) => schema.optional(),
  purpose: (schema) => schema.optional(),
  timeline: (schema) => schema.optional(),
  category: (schema) => schema.min(1, "Category is required"),
  color: (schema) => schema.optional(),
  chakraId: (schema) => schema.optional(),
  positionX: (schema) => schema.optional(),
  positionY: (schema) => schema.optional(), 
  radius: (schema) => schema.optional(),
});

export type InsertPreviewDot = z.infer<typeof insertPreviewDotSchema>;
export type PreviewDot = typeof previewDots.$inferSelect;
export type InsertPreviewWheel = z.infer<typeof insertPreviewWheelSchema>;
export type PreviewWheel = typeof previewWheels.$inferSelect;
