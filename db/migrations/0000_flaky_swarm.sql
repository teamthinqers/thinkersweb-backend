CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chakras" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"heading" text NOT NULL,
	"purpose" text NOT NULL,
	"timeline" text NOT NULL,
	"source_type" text DEFAULT 'text' NOT NULL,
	"color" text DEFAULT '#B45309' NOT NULL,
	"position_x" integer DEFAULT 0,
	"position_y" integer DEFAULT 0,
	"radius" integer DEFAULT 420,
	"voice_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"conversation_data" text,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dots" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"one_word_summary" text NOT NULL,
	"summary" text NOT NULL,
	"anchor" text NOT NULL,
	"pulse" text NOT NULL,
	"source_type" text DEFAULT 'text' NOT NULL,
	"capture_mode" text DEFAULT 'natural' NOT NULL,
	"wheel_id" integer,
	"chakra_id" integer,
	"position_x" integer DEFAULT 0,
	"position_y" integer DEFAULT 0,
	"voice_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"content" text,
	"category_id" integer,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"visibility" text DEFAULT 'private'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "perspectives_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message_body" text NOT NULL,
	"attachments" text,
	"visibility_scope" text DEFAULT 'public' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "perspectives_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perspectives_participants_thread_id_user_id_unique" UNIQUE("thread_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "perspectives_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"thought_id" integer NOT NULL,
	"thread_type" text DEFAULT 'social' NOT NULL,
	"user_id" integer,
	"social_thread_id" integer,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perspectives_threads_thought_id_thread_type_unique" UNIQUE("thought_id","thread_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_thoughts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"thought_id" integer NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_thoughts_user_id_thought_id_unique" UNIQUE("user_id","thought_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6B7280' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thoughts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"heading" text NOT NULL,
	"summary" text NOT NULL,
	"emotion" text,
	"image_url" text,
	"visibility" text DEFAULT 'personal' NOT NULL,
	"shared_to_social" boolean DEFAULT false NOT NULL,
	"channel" text DEFAULT 'write' NOT NULL,
	"position_x" integer,
	"position_y" integer,
	"keywords" text,
	"anchor" text,
	"analogies" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_behavior" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"entity_type" text,
	"entity_id" integer,
	"action_data" text,
	"session_id" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"firebase_uid" text,
	"linkedin_id" text,
	"username" text,
	"email" text NOT NULL,
	"full_name" text,
	"linkedin_headline" text,
	"linkedin_profile_url" text,
	"linkedin_photo_url" text,
	"hashed_password" text,
	"bio" text,
	"avatar" text,
	"dotspark_activated" boolean DEFAULT false NOT NULL,
	"dotspark_activated_at" timestamp,
	"subscription_tier" text DEFAULT 'free',
	"cognitive_identity_completed" boolean DEFAULT false NOT NULL,
	"cognitive_identity_completed_at" timestamp,
	"learning_engine_completed" boolean DEFAULT false NOT NULL,
	"learning_engine_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "users_linkedin_id_unique" UNIQUE("linkedin_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vector_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vector_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" text,
	"metadata" text,
	"relevance_score" numeric(10, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vector_embeddings_vector_id_unique" UNIQUE("vector_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voice_recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" integer NOT NULL,
	"layer" text NOT NULL,
	"audio_url" text NOT NULL,
	"duration" integer,
	"transcript" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whatsapp_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"phone_number" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_message_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wheels" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"heading" text NOT NULL,
	"goals" text NOT NULL,
	"timeline" text NOT NULL,
	"source_type" text DEFAULT 'text' NOT NULL,
	"category" text DEFAULT 'general',
	"color" text DEFAULT '#EA580C' NOT NULL,
	"chakra_id" integer,
	"position_x" integer DEFAULT 0,
	"position_y" integer DEFAULT 0,
	"radius" integer DEFAULT 120,
	"voice_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chakras" ADD CONSTRAINT "chakras_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dots" ADD CONSTRAINT "dots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dots" ADD CONSTRAINT "dots_wheel_id_wheels_id_fk" FOREIGN KEY ("wheel_id") REFERENCES "public"."wheels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dots" ADD CONSTRAINT "dots_chakra_id_chakras_id_fk" FOREIGN KEY ("chakra_id") REFERENCES "public"."chakras"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entries" ADD CONSTRAINT "entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_messages" ADD CONSTRAINT "perspectives_messages_thread_id_perspectives_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."perspectives_threads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_messages" ADD CONSTRAINT "perspectives_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_participants" ADD CONSTRAINT "perspectives_participants_thread_id_perspectives_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."perspectives_threads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_participants" ADD CONSTRAINT "perspectives_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_threads" ADD CONSTRAINT "perspectives_threads_thought_id_thoughts_id_fk" FOREIGN KEY ("thought_id") REFERENCES "public"."thoughts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_threads" ADD CONSTRAINT "perspectives_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "perspectives_threads" ADD CONSTRAINT "perspectives_threads_social_thread_id_perspectives_threads_id_fk" FOREIGN KEY ("social_thread_id") REFERENCES "public"."perspectives_threads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_thoughts" ADD CONSTRAINT "saved_thoughts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_thoughts" ADD CONSTRAINT "saved_thoughts_thought_id_thoughts_id_fk" FOREIGN KEY ("thought_id") REFERENCES "public"."thoughts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_behavior" ADD CONSTRAINT "user_behavior_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vector_embeddings" ADD CONSTRAINT "vector_embeddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_users" ADD CONSTRAINT "whatsapp_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wheels" ADD CONSTRAINT "wheels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wheels" ADD CONSTRAINT "wheels_chakra_id_chakras_id_fk" FOREIGN KEY ("chakra_id") REFERENCES "public"."chakras"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
