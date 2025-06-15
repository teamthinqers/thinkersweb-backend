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
  firstName: text("first_name"),
  lastName: text("last_name"),
  mobileNumber: text("mobile_number"),
  dateOfBirth: text("date_of_birth"), // YYYY-MM-DD format
  yearsOfExperience: integer("years_of_experience"),
  linkedInProfile: text("linkedin_profile"),
  profileImage: text("profile_image"),
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
  firstName: (schema) => schema.optional(),
  lastName: (schema) => schema.optional(),
  mobileNumber: (schema) => schema.optional(),
  dateOfBirth: (schema) => schema.optional(),
  yearsOfExperience: (schema) => schema.optional(),
  linkedInProfile: (schema) => schema.union([schema.url("Must be a valid URL"), z.literal("")]).optional(),
  profileImage: (schema) => schema.optional(),
});

// Profile update schema (excluding password and authentication fields)
export const updateProfileSchema = createInsertSchema(users, {
  firstName: (schema) => schema.min(1, "First name is required").optional(),
  lastName: (schema) => schema.min(1, "Last name is required").optional(),
  mobileNumber: (schema) => schema.optional(),
  dateOfBirth: (schema) => schema.optional(),
  yearsOfExperience: (schema) => schema.min(0, "Experience cannot be negative").max(70, "Experience cannot exceed 70 years").optional(),
  linkedInProfile: (schema) => schema.url("Must be a valid URL").optional().or(schema.literal("")),
  profileImage: (schema) => schema.optional(),
}).omit({
  id: true,
  username: true,
  email: true,
  password: true,
  firebaseUid: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
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

// Wheels - collections of related dots
export const wheels = pgTable("wheels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull().default("#8B5CF6"),
  positionX: integer("position_x").default(100).notNull(),
  positionY: integer("position_y").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wheelsRelations = relations(wheels, ({ one, many }) => ({
  user: one(users, {
    fields: [wheels.userId],
    references: [users.id],
  }),
  dots: many(dots),
  sourceConnections: many(wheelConnections, { relationName: "sourceWheel" }),
  targetConnections: many(wheelConnections, { relationName: "targetWheel" }),
}));

// Dots - three-layer thought structure
export const dots = pgTable("dots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wheelId: integer("wheel_id").references(() => wheels.id),
  summary: text("summary").notNull(), // Layer 1: 220 chars max
  anchor: text("anchor").notNull(), // Layer 2: 300 chars max
  pulse: text("pulse").notNull(), // Layer 3: 1 word emotion
  sourceType: text("source_type").notNull().default("text"), // voice, text, hybrid
  originalAudioUrl: text("original_audio_url"), // For voice dots
  transcriptionConfidence: integer("transcription_confidence"), // 0-100
  processingStatus: text("processing_status").notNull().default("processed"), // raw, transcribed, processed, enhanced
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
  sourceConnections: many(dotConnections, { relationName: "sourceDot" }),
  targetConnections: many(dotConnections, { relationName: "targetDot" }),
}));

// Connections between wheels
export const wheelConnections = pgTable("wheel_connections", {
  id: serial("id").primaryKey(),
  sourceWheelId: integer("source_wheel_id").references(() => wheels.id).notNull(),
  targetWheelId: integer("target_wheel_id").references(() => wheels.id).notNull(),
  connectionType: text("connection_type").notNull().default("related"), // logical, temporal, emotional
  strength: integer("strength").default(50).notNull(), // 0-100
  reasonForConnection: text("reason_for_connection"), // AI-generated explanation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wheelConnectionsRelations = relations(wheelConnections, ({ one }) => ({
  sourceWheel: one(wheels, {
    fields: [wheelConnections.sourceWheelId],
    references: [wheels.id],
    relationName: "sourceWheel",
  }),
  targetWheel: one(wheels, {
    fields: [wheelConnections.targetWheelId],
    references: [wheels.id],
    relationName: "targetWheel",
  }),
}));

// Connections between individual dots
export const dotConnections = pgTable("dot_connections", {
  id: serial("id").primaryKey(),
  sourceDotId: integer("source_dot_id").references(() => dots.id).notNull(),
  targetDotId: integer("target_dot_id").references(() => dots.id).notNull(),
  connectionType: text("connection_type").notNull().default("related"),
  strength: integer("strength").default(50).notNull(),
  reasonForConnection: text("reason_for_connection"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dotConnectionsRelations = relations(dotConnections, ({ one }) => ({
  sourceDot: one(dots, {
    fields: [dotConnections.sourceDotId],
    references: [dots.id],
    relationName: "sourceDot",
  }),
  targetDot: one(dots, {
    fields: [dotConnections.targetDotId],
    references: [dots.id],
    relationName: "targetDot",
  }),
}));

// Validation schemas
export const insertWheelSchema = createInsertSchema(wheels, {
  name: (schema) => schema.min(2, "Wheel name must be at least 2 characters"),
  category: (schema) => schema.min(2, "Category must be at least 2 characters"),
  color: (schema) => schema.optional(),
  positionX: (schema) => schema.optional(),
  positionY: (schema) => schema.optional(),
});

export const insertDotSchema = createInsertSchema(dots, {
  summary: (schema) => schema.min(1, "Summary is required").max(220, "Summary must be 220 characters or less"),
  anchor: (schema) => schema.min(1, "Anchor text is required").max(300, "Anchor text must be 300 characters or less"),
  pulse: (schema) => schema.min(1, "Pulse emotion is required").refine(
    (val) => val.trim().split(/\s+/).length === 1,
    "Pulse must be exactly one word"
  ),
  sourceType: (schema) => schema.optional(),
  wheelId: (schema) => schema.optional(),
  originalAudioUrl: (schema) => schema.optional(),
  transcriptionConfidence: (schema) => schema.optional(),
  processingStatus: (schema) => schema.optional(),
});

export const insertWheelConnectionSchema = createInsertSchema(wheelConnections, {
  connectionType: (schema) => schema.optional(),
  strength: (schema) => schema.optional(),
  reasonForConnection: (schema) => schema.optional(),
});

export const insertDotConnectionSchema = createInsertSchema(dotConnections, {
  connectionType: (schema) => schema.optional(),
  strength: (schema) => schema.optional(),
  reasonForConnection: (schema) => schema.optional(),
});

export type InsertWheel = z.infer<typeof insertWheelSchema>;
export type Wheel = typeof wheels.$inferSelect;
export type InsertDot = z.infer<typeof insertDotSchema>;
export type Dot = typeof dots.$inferSelect;
export type InsertWheelConnection = z.infer<typeof insertWheelConnectionSchema>;
export type WheelConnection = typeof wheelConnections.$inferSelect;
export type InsertDotConnection = z.infer<typeof insertDotConnectionSchema>;
export type DotConnection = typeof dotConnections.$inferSelect;

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
