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
  // Profile Settings
  aboutMe: text("about_me"), // Professional story/bio
  cognitiveIdentityPublic: boolean("cognitive_identity_public").default(false).notNull(), // Privacy setting for cognitive identity
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cognitive Identity configuration table
export const cognitiveIdentity = pgTable("cognitive_identity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  // Core tuning parameters
  cognitivePace: decimal("cognitive_pace", { precision: 3, scale: 2 }).default('0.50'),
  signalFocus: decimal("signal_focus", { precision: 3, scale: 2 }).default('0.50'),
  impulseControl: decimal("impulse_control", { precision: 3, scale: 2 }).default('0.50'),
  mentalEnergyFlow: decimal("mental_energy_flow", { precision: 3, scale: 2 }).default('0.50'),
  // Cognitive style parameters
  analytical: decimal("analytical", { precision: 3, scale: 2 }).default('0.80'),
  intuitive: decimal("intuitive", { precision: 3, scale: 2 }).default('0.60'),
  contextualThinking: decimal("contextual_thinking", { precision: 3, scale: 2 }).default('0.50'),
  memoryBandwidth: decimal("memory_bandwidth", { precision: 3, scale: 2 }).default('0.50'),
  thoughtComplexity: decimal("thought_complexity", { precision: 3, scale: 2 }).default('0.50'),
  mentalModelDensity: decimal("mental_model_density", { precision: 3, scale: 2 }).default('0.50'),
  patternDetectionSensitivity: decimal("pattern_detection_sensitivity", { precision: 3, scale: 2 }).default('0.50'),
  decisionMakingIndex: decimal("decision_making_index", { precision: 3, scale: 2 }).default('0.50'),
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
  emotions: text("emotions"), // Optional: JSON array of emotions like ["Joy", "Curiosity", "Hope"]
  imageUrl: text("image_url"), // Optional: image attachment
  visibility: text("visibility").notNull().default("personal"), // 'personal' or 'social'
  sharedToSocial: boolean("shared_to_social").default(false).notNull(), // Track if personal thought is shared to social
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

// === PERSPECTIVES SYSTEM (Real-time chat/reflections on thoughts) ===

// Perspectives threads - One thread per thought for discussions
export const perspectivesThreads = pgTable("perspectives_threads", {
  id: serial("id").primaryKey(),
  thoughtId: integer("thought_id").references(() => thoughts.id).notNull(),
  threadType: text("thread_type").notNull().default("social"), // 'social' or 'personal'
  userId: integer("user_id").references(() => users.id), // Only for personal threads
  socialThreadId: integer("social_thread_id").references((): any => perspectivesThreads.id), // Link to social thread for archive
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // One social thread per thought
  uniqueSocialThread: unique().on(table.thoughtId, table.threadType),
}));

// Perspectives messages - Chat messages in threads
export const perspectivesMessages = pgTable("perspectives_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => perspectivesThreads.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  messageBody: text("message_body").notNull(),
  attachments: text("attachments"), // JSON for future image/file attachments
  visibilityScope: text("visibility_scope").notNull().default("public"), // 'public' or 'personal'
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Perspectives participants - Track users in threads for notifications
export const perspectivesParticipants = pgTable("perspectives_participants", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => perspectivesThreads.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // One participant record per user per thread
  uniqueParticipant: unique().on(table.threadId, table.userId),
}));

// === SPARKS SYSTEM (Personal notes/insights on thoughts) ===

// Sparks - User's personal notes and insights saved for thoughts
export const sparks = pgTable("sparks", {
  id: serial("id").primaryKey(),
  thoughtId: integer("thought_id").references(() => thoughts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // Owner of the spark
  content: text("content").notNull(), // The spark note content
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === NOTIFICATIONS SYSTEM (LinkedIn-style activity notifications) ===

// Notifications - Track social activity, badges, and updates
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(), // Who receives the notification
  actorIds: text("actor_ids").notNull(), // JSON array of user IDs who triggered this (for grouping)
  notificationType: text("notification_type").notNull(), // 'new_thought', 'new_perspective', 'spark_saved', 'badge_unlocked', 'circle_invite'
  thoughtId: integer("thought_id").references(() => thoughts.id), // Related thought (nullable for badge notifications)
  thoughtHeading: text("thought_heading"), // Cached for display (nullable for badge notifications)
  badgeId: integer("badge_id").references(() => badges.id), // For badge unlock notifications
  circleInviteId: integer("circle_invite_id").references(() => thinqCircleInvites.id), // For circle invite notifications
  circleName: text("circle_name"), // Cached circle name for display
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // For grouping updates
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

// Perspectives system relations
export const perspectivesThreadsRelations = relations(perspectivesThreads, ({ one, many }) => ({
  thought: one(thoughts, {
    fields: [perspectivesThreads.thoughtId],
    references: [thoughts.id],
  }),
  user: one(users, {
    fields: [perspectivesThreads.userId],
    references: [users.id],
  }),
  messages: many(perspectivesMessages),
  participants: many(perspectivesParticipants),
}));

export const perspectivesMessagesRelations = relations(perspectivesMessages, ({ one }) => ({
  thread: one(perspectivesThreads, {
    fields: [perspectivesMessages.threadId],
    references: [perspectivesThreads.id],
  }),
  user: one(users, {
    fields: [perspectivesMessages.userId],
    references: [users.id],
  }),
}));

export const perspectivesParticipantsRelations = relations(perspectivesParticipants, ({ one }) => ({
  thread: one(perspectivesThreads, {
    fields: [perspectivesParticipants.threadId],
    references: [perspectivesThreads.id],
  }),
  user: one(users, {
    fields: [perspectivesParticipants.userId],
    references: [users.id],
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

export const sparksRelations = relations(sparks, ({ one }) => ({
  user: one(users, {
    fields: [sparks.userId],
    references: [users.id],
  }),
  thought: one(thoughts, {
    fields: [sparks.thoughtId],
    references: [thoughts.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
  thought: one(thoughts, {
    fields: [notifications.thoughtId],
    references: [thoughts.id],
  }),
  badge: one(badges, {
    fields: [notifications.badgeId],
    references: [badges.id],
  }),
}));

// === VALIDATION SCHEMAS ===

// New thought system schemas
export const insertThoughtSchema = createInsertSchema(thoughts, {
  heading: (schema) => schema.min(1, "Heading is required").max(200, "Heading too long"),
  summary: (schema) => schema.min(1, "Your thought cannot be empty").max(5000, "Thought is too long (max 5000 characters)"),
  emotions: (schema) => schema.optional(),
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

// Perspectives schemas
export const perspectivesMessagesInsertSchema = createInsertSchema(perspectivesMessages, {
  messageBody: (schema) => schema.min(1, "Message cannot be empty").max(2000, "Message too long"),
});

export const perspectivesMessagesSelectSchema = createSelectSchema(perspectivesMessages);

export const perspectivesThreadsInsertSchema = createInsertSchema(perspectivesThreads);
export const perspectivesThreadsSelectSchema = createSelectSchema(perspectivesThreads);

export const perspectivesParticipantsInsertSchema = createInsertSchema(perspectivesParticipants);

// Sparks schemas
export const sparksInsertSchema = createInsertSchema(sparks, {
  content: (schema) => schema.min(1, "Spark cannot be empty").max(5000, "Spark too long"),
});

export const sparksSelectSchema = createSelectSchema(sparks);
export type Spark = z.infer<typeof sparksSelectSchema>;
export type SparkInsert = z.infer<typeof sparksInsertSchema>;
export const perspectivesParticipantsSelectSchema = createSelectSchema(perspectivesParticipants);

// Notifications schemas
export const notificationsInsertSchema = createInsertSchema(notifications, {
  actorIds: (schema) => schema.min(1, "Actor IDs required"),
  thoughtHeading: (schema) => schema.min(1, "Thought heading required"),
  notificationType: (schema) => schema.refine(
    val => ['new_thought', 'new_perspective', 'spark_saved'].includes(val),
    "Invalid notification type"
  ),
});

export const notificationsSelectSchema = createSelectSchema(notifications);
export type Notification = z.infer<typeof notificationsSelectSchema>;
export type NotificationInsert = z.infer<typeof notificationsInsertSchema>;

// === BADGE SYSTEM ===

// Badges table - Defines available badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  badgeKey: text("badge_key").notNull().unique(), // e.g., 'explorer', 'thinqer', 'connector'
  name: text("name").notNull(), // Display name: 'Explorer', 'ThinQer'
  description: text("description").notNull(), // What the badge represents
  unlockMessage: text("unlock_message").notNull(), // Message shown when badge is unlocked
  lockedHint: text("locked_hint"), // Hint shown when badge is locked
  icon: text("icon"), // Icon or emoji for the badge
  category: text("category").notNull().default("achievement"), // 'achievement', 'milestone', 'social', etc.
  tier: integer("tier").notNull().default(1), // Badge importance/rarity (1-5)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges - Tracks which users have earned which badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  notified: boolean("notified").default(false).notNull(), // Whether user has seen the unlock notification
}, (table) => ({
  // Prevent duplicate badge awards
  uniqueUserBadge: unique().on(table.userId, table.badgeId),
}));

// Badge relations
export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

// Badge schemas
export const badgesInsertSchema = createInsertSchema(badges);
export const badgesSelectSchema = createSelectSchema(badges);
export type Badge = z.infer<typeof badgesSelectSchema>;
export type BadgeInsert = z.infer<typeof badgesInsertSchema>;

export const userBadgesInsertSchema = createInsertSchema(userBadges);
export const userBadgesSelectSchema = createSelectSchema(userBadges);
export type UserBadge = z.infer<typeof userBadgesSelectSchema>;
export type UserBadgeInsert = z.infer<typeof userBadgesInsertSchema>;

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
  // Onboarding tracking
  communityLinkSent: boolean("community_link_sent").default(false).notNull(),
  instructionsSent: boolean("instructions_sent").default(false).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
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

export const whatsappConversationStates = pgTable("whatsapp_conversation_states", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  state: text("state").notNull(), // 'awaiting_email', 'linked', etc.
  stateData: text("state_data"), // JSON string for additional data
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  tags: text("tags"), // Comma-separated tags like "vip,early-adopter"
  notes: text("notes"),
  addedBy: integer("added_by").references(() => users.id),
  source: text("source").default("manual"), // 'manual', 'group', 'import'
  active: boolean("active").default(true).notNull(),
  lastMessagedAt: timestamp("last_messaged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const cognitiveIdentityRelations = relations(cognitiveIdentity, ({ one }) => ({
  user: one(users, { fields: [cognitiveIdentity.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  dots: many(dots),
  wheels: many(wheels),
  chakras: many(chakras),
  vectorEmbeddings: many(vectorEmbeddings),
  userBehavior: many(userBehavior),
  conversationSessions: many(conversationSessions),
  whatsappUsers: many(whatsappUsers),
  entries: many(entries),
  cognitiveIdentity: one(cognitiveIdentity),
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

// Cognitive Identity schemas
export const insertCognitiveIdentitySchema = createInsertSchema(cognitiveIdentity);
export const selectCognitiveIdentitySchema = createSelectSchema(cognitiveIdentity);
export type InsertCognitiveIdentity = z.infer<typeof insertCognitiveIdentitySchema>;
export type CognitiveIdentity = z.infer<typeof selectCognitiveIdentitySchema>;

// Legacy types
export type Entry = typeof entries.$inferSelect;
export type ConversationSession = typeof conversationSessions.$inferSelect;

// === THINQ CIRCLES SYSTEM ===

// ThinQ Circles - Private brainstorming groups
export const thinqCircles = pgTable("thinq_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"), // 'active' or 'archived'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Circle Members - Who's in each circle
export const thinqCircleMembers = pgTable("thinq_circle_members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => thinqCircles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("member"), // 'owner' or 'member'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate membership
  uniqueMembership: unique().on(table.circleId, table.userId),
}));

// Circle Invites - Manage invitations
export const thinqCircleInvites = pgTable("thinq_circle_invites", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => thinqCircles.id).notNull(),
  inviterUserId: integer("inviter_user_id").references(() => users.id).notNull(),
  inviteeEmail: text("invitee_email").notNull(), // Can be existing or new user
  inviteeUserId: integer("invitee_user_id").references(() => users.id), // Set when existing user is invited
  token: text("token").notNull().unique(), // Hashed token for email invites
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'expired'
  claimedAt: timestamp("claimed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Circle Dots - Thoughts shared to circles
export const circleDots = pgTable("circle_dots", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => thinqCircles.id).notNull(),
  thoughtId: integer("thought_id").references(() => thoughts.id).notNull(),
  sharedBy: integer("shared_by").references(() => users.id).notNull(),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate shares
  uniqueCircleThought: unique().on(table.circleId, table.thoughtId),
}));

// Circle Sparks - Sparks shared to circles
export const circleSparks = pgTable("circle_sparks", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => thinqCircles.id).notNull(),
  sparkId: integer("spark_id").references(() => sparks.id).notNull(),
  sharedBy: integer("shared_by").references(() => users.id).notNull(),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate shares
  uniqueCircleSpark: unique().on(table.circleId, table.sparkId),
}));

// Circle Perspectives - Perspectives shared to circles
export const circlePerspectives = pgTable("circle_perspectives", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => thinqCircles.id).notNull(),
  threadId: integer("thread_id").references(() => perspectivesThreads.id).notNull(),
  sharedBy: integer("shared_by").references(() => users.id).notNull(),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate shares
  uniqueCirclePerspective: unique().on(table.circleId, table.threadId),
}));

// Relations for ThinQ Circles
export const thinqCirclesRelations = relations(thinqCircles, ({ one, many }) => ({
  creator: one(users, {
    fields: [thinqCircles.createdBy],
    references: [users.id],
  }),
  members: many(thinqCircleMembers),
  invites: many(thinqCircleInvites),
  dots: many(circleDots),
  sparks: many(circleSparks),
  perspectives: many(circlePerspectives),
}));

export const thinqCircleMembersRelations = relations(thinqCircleMembers, ({ one }) => ({
  circle: one(thinqCircles, {
    fields: [thinqCircleMembers.circleId],
    references: [thinqCircles.id],
  }),
  user: one(users, {
    fields: [thinqCircleMembers.userId],
    references: [users.id],
  }),
}));

export const thinqCircleInvitesRelations = relations(thinqCircleInvites, ({ one }) => ({
  circle: one(thinqCircles, {
    fields: [thinqCircleInvites.circleId],
    references: [thinqCircles.id],
  }),
  inviter: one(users, {
    fields: [thinqCircleInvites.inviterUserId],
    references: [users.id],
  }),
  invitee: one(users, {
    fields: [thinqCircleInvites.inviteeUserId],
    references: [users.id],
  }),
}));

export const circleDotsRelations = relations(circleDots, ({ one }) => ({
  circle: one(thinqCircles, {
    fields: [circleDots.circleId],
    references: [thinqCircles.id],
  }),
  thought: one(thoughts, {
    fields: [circleDots.thoughtId],
    references: [thoughts.id],
  }),
  sharedByUser: one(users, {
    fields: [circleDots.sharedBy],
    references: [users.id],
  }),
}));

export const circleSparksRelations = relations(circleSparks, ({ one }) => ({
  circle: one(thinqCircles, {
    fields: [circleSparks.circleId],
    references: [thinqCircles.id],
  }),
  spark: one(sparks, {
    fields: [circleSparks.sparkId],
    references: [sparks.id],
  }),
  sharedByUser: one(users, {
    fields: [circleSparks.sharedBy],
    references: [users.id],
  }),
}));

export const circlePerspectivesRelations = relations(circlePerspectives, ({ one }) => ({
  circle: one(thinqCircles, {
    fields: [circlePerspectives.circleId],
    references: [thinqCircles.id],
  }),
  thread: one(perspectivesThreads, {
    fields: [circlePerspectives.threadId],
    references: [perspectivesThreads.id],
  }),
  sharedByUser: one(users, {
    fields: [circlePerspectives.sharedBy],
    references: [users.id],
  }),
}));

// Validation schemas
export const thinqCirclesInsertSchema = createInsertSchema(thinqCircles, {
  name: (schema) => schema.min(3, "Circle name must be at least 3 characters").max(50, "Circle name too long"),
  description: (schema) => schema.max(200, "Description too long"),
});

export const thinqCirclesSelectSchema = createSelectSchema(thinqCircles);
export type ThinqCircle = z.infer<typeof thinqCirclesSelectSchema>;
export type ThinqCircleInsert = z.infer<typeof thinqCirclesInsertSchema>;

export const thinqCircleInvitesInsertSchema = createInsertSchema(thinqCircleInvites, {
  inviteeEmail: (schema) => schema.email("Invalid email address"),
});

export const thinqCircleInvitesSelectSchema = createSelectSchema(thinqCircleInvites);
export type ThinqCircleInvite = z.infer<typeof thinqCircleInvitesSelectSchema>;
export type ThinqCircleInviteInsert = z.infer<typeof thinqCircleInvitesInsertSchema>;