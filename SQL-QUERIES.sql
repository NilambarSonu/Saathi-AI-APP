
-- Tables included:
-- 1. users - User accounts and authentication
-- 2. otps - OTP verification for registration/login
-- 3. otp_rate_limits - Rate limiting for OTP requests
-- 4. soil_tests - Soil analysis test results
-- 5. ai_recommendations - AI-generated fertilizer recommendations
-- 6. chat_messages - User chat conversations with AI
-- 7. site_visits - Website visitor tracking
-- 8. user_sessions - Session storage for authentication
--
-- ===========================================
-- ===========================================
-- 1. USERS TABLE
-- ===========================================
-- Stores user account information, authentication, and profile data
CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "username" text NOT NULL,
    "email" text NOT NULL,
    "phone" text, -- Nullable for OAuth users
    "location" text,
    "password" text, -- Legacy password field for backward compatibility
    "password_hash" text, -- New hashed password field, nullable for OAuth users
    "phone_verified" boolean DEFAULT false NOT NULL,
    "provider" text DEFAULT 'local' NOT NULL, -- local, google, facebook, x
    "provider_id" text, -- OAuth provider user ID
    "profile_picture" text,
    "preferred_language" text DEFAULT 'en',
    -- Privacy Settings
    "profile_visibility" boolean DEFAULT true,
    "data_sharing" boolean DEFAULT false,
    "analytics_enabled" boolean DEFAULT true,
    "email_notifications" boolean DEFAULT true,
    "marketing_emails" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "users_username_unique" UNIQUE("username"),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- ===========================================
-- 2. OTP VERIFICATION TABLE
-- ===========================================
-- Stores OTP codes for email/SMS verification during registration and login
CREATE TABLE IF NOT EXISTS "otps" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text,
    "phone" text, 
    "country_code" text DEFAULT '+91' NOT NULL,
    "otp_hash" text NOT NULL,
    "purpose" text NOT NULL, -- register, login, password_change
    "provider" text DEFAULT 'EMAIL' NOT NULL, 
    "webhook_status" text, 
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp NOT NULL,
    "used_at" timestamp
);

-- ===========================================
-- 3. OTP RATE LIMITING TABLE
-- ===========================================
-- Prevents abuse of OTP requests by tracking request counts
CREATE TABLE IF NOT EXISTS "otp_rate_limits" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text, -- For email rate limiting
    "phone" text, -- For phone rate limiting
    "request_count" integer DEFAULT 0 NOT NULL,
    "last_request_at" timestamp DEFAULT now() NOT NULL,
    "daily_count" integer DEFAULT 0 NOT NULL,
    "daily_reset_at" timestamp DEFAULT now() NOT NULL
);

-- ===========================================
-- 4. SOIL TESTS TABLE
-- ===========================================
-- Stores soil analysis test results from Agni devices
CREATE TABLE IF NOT EXISTS "soil_tests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar,
    "device_id" text NOT NULL,
    "ph" real NOT NULL,
    "nitrogen" real NOT NULL,
    "phosphorus" real NOT NULL,
    "potassium" real NOT NULL,
    "moisture" real NOT NULL,
    "temperature" real NOT NULL,
    "ec" real,
    "latitude" real,
    "longitude" real,
    "location" text,
    "raw_data" jsonb,
    "test_date" timestamp DEFAULT now()
);

-- ===========================================
-- 5. AI RECOMMENDATIONS TABLE
-- ===========================================
-- Stores AI-generated fertilizer recommendations based on soil tests
CREATE TABLE IF NOT EXISTS "ai_recommendations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "soil_test_id" uuid,
    "language" text DEFAULT 'en' NOT NULL,
    "natural_fertilizers" jsonb,
    "chemical_fertilizers" jsonb,
    "application_instructions" text,
    "recommendations" text,
    "created_at" timestamp DEFAULT now()
);

-- ===========================================
-- 6. CHAT MESSAGES TABLE
-- ===========================================
-- Stores user conversations with the AI chatbot
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar,
    "message" text NOT NULL,
    "response" text NOT NULL,
    "language" text DEFAULT 'en' NOT NULL,
    "created_at" timestamp DEFAULT now()
);

-- ===========================================
-- 7. SITE VISITS TABLE
-- ===========================================
-- Tracks website visitor analytics
CREATE TABLE IF NOT EXISTS "site_visits" (
    "id" serial PRIMARY KEY NOT NULL,
    "ip_address" varchar(45),
    "visit_time" timestamp DEFAULT now(),
    "user_agent" text,
    "path" text
);

-- ===========================================
-- 8. USER SESSIONS TABLE
-- ===========================================
-- Session storage for connect-pg-simple authentication
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "sid" varchar PRIMARY KEY NOT NULL,
    "sess" jsonb NOT NULL,
    "expire" timestamp(6) NOT NULL
);


CREATE TABLE "price_dispute_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid,
	"farmer_id" varchar,
	"charged_amount" integer NOT NULL,
	"expected_amount" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "recommended_price_inr" integer;--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "price_cap_reason" text;--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "price_display_text" jsonb;--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "price_locked" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "test_type" text DEFAULT 'basic_smallholder_farmer_field_test';--> statement-breakpoint
ALTER TABLE "soil_tests" ADD COLUMN "pricing_calculation_factors" jsonb;--> statement-breakpoint
ALTER TABLE "price_dispute_reports" ADD CONSTRAINT "price_dispute_reports_test_id_soil_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."soil_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_dispute_reports" ADD CONSTRAINT "price_dispute_reports_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- ===========================================
-- FOREIGN KEY CONSTRAINTS
-- ===========================================

-- Link soil tests to users
ALTER TABLE "soil_tests"
ADD CONSTRAINT "soil_tests_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- Link AI recommendations to soil tests
ALTER TABLE "ai_recommendations"
ADD CONSTRAINT "ai_recommendations_soil_test_id_soil_tests_id_fk"
FOREIGN KEY ("soil_test_id") REFERENCES "soil_tests"("id") ON DELETE no action ON UPDATE no action;

-- Link chat messages to users
ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- ===========================================
-- INDEXES
-- ===========================================

-- Index for efficient session cleanup
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" USING btree ("expire");

-- ===========================================
-- END OF SCHEMA
-- ===========================================

-- ===========================================
-- CRITICAL DATA INTEGRITY FIX
-- ===========================================

-- CORRECT APPROACH: Database constraints instead of triggers
-- (Triggers create circular dependencies between parent/child tables)

-- 1. Make soil_test_id NOT NULL in ai_recommendations
ALTER TABLE ai_recommendations
ALTER COLUMN soil_test_id SET NOT NULL;

-- 2. Add unique constraint to prevent duplicate AI recommendations per soil test
ALTER TABLE ai_recommendations
ADD CONSTRAINT unique_soil_test_ai UNIQUE (soil_test_id);

-- 3. Remove the WRONG trigger that was architecturally incorrect
DROP TRIGGER IF EXISTS soil_test_ai_recommendation_check ON soil_tests;
DROP FUNCTION IF EXISTS enforce_ai_recommendation_exists();

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================
-- Run this query to check for orphan soil tests:
-- SELECT COUNT(*) as orphan_soil_tests
-- FROM soil_tests st
-- LEFT JOIN ai_recommendations ar ON st.id = ar.soil_test_id
-- WHERE ar.id IS NULL;

-- ===========================================
-- PRODUCTION DEPLOYMENT INSTRUCTIONS
-- ===========================================

-- 🚨 CRITICAL: Run ONLY this SQL on your production database:
--
-- -- 1. Make soil_test_id NOT NULL in ai_recommendations
-- ALTER TABLE ai_recommendations
-- ALTER COLUMN soil_test_id SET NOT NULL;
--
-- -- 2. Add unique constraint to prevent duplicate AI recommendations per soil test
-- ALTER TABLE ai_recommendations
-- ADD CONSTRAINT unique_soil_test_ai UNIQUE (soil_test_id);
--
-- -- 3. Remove the WRONG trigger that was architecturally incorrect
-- DROP TRIGGER IF EXISTS soil_test_ai_recommendation_check ON soil_tests;
-- DROP FUNCTION IF EXISTS enforce_ai_recommendation_exists();
--
-- -- 4. Verify the fix works:
-- SELECT COUNT(*) as orphan_soil_tests
-- FROM soil_tests st
-- LEFT JOIN ai_recommendations ar ON st.id = ar.soil_test_id
-- WHERE ar.id IS NULL;
--
-- Expected result: 0 (zero orphan soil tests)
--
-- -- 5. Test that constraints work:
-- -- This should FAIL (duplicate soil_test_id):
-- -- INSERT INTO ai_recommendations (soil_test_id, recommendations)
-- -- VALUES ('some-uuid', 'test');
-- -- INSERT INTO ai_recommendations (soil_test_id, recommendations)
-- -- VALUES ('some-uuid', 'test2');

-- ===========================================
-- ADDED FROM ADD_PRIVACY_COLUMNS.sql
-- ===========================================
-- Add privacy settings columns to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "profile_visibility" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "data_sharing" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "analytics_enabled" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "email_notifications" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "marketing_emails" boolean DEFAULT false;

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('profile_visibility', 'data_sharing', 'analytics_enabled', 'email_notifications', 'marketing_emails')
ORDER BY column_name;

-- Optional: Update existing users to have default privacy settings
UPDATE "users" 
SET 
    "profile_visibility" = COALESCE("profile_visibility", true),
    "data_sharing" = COALESCE("data_sharing", false),
    "analytics_enabled" = COALESCE("analytics_enabled", true),
    "email_notifications" = COALESCE("email_notifications", true),
    "marketing_emails" = COALESCE("marketing_emails", false)
WHERE 
    "profile_visibility" IS NULL 
    OR "data_sharing" IS NULL 
    OR "analytics_enabled" IS NULL 
    OR "email_notifications" IS NULL 
    OR "marketing_emails" IS NULL;

-- Verify the update worked
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN profile_visibility IS NOT NULL THEN 1 END) as users_with_profile_visibility,
    COUNT(CASE WHEN data_sharing IS NOT NULL THEN 1 END) as users_with_data_sharing,
    COUNT(CASE WHEN analytics_enabled IS NOT NULL THEN 1 END) as users_with_analytics_enabled,
    COUNT(CASE WHEN email_notifications IS NOT NULL THEN 1 END) as users_with_email_notifications,
    COUNT(CASE WHEN marketing_emails IS NOT NULL THEN 1 END) as users_with_marketing_emails
FROM "users";

-- ===========================================
-- ADDED FROM CHAT_TABLES_MIGRATION.sql
-- ===========================================
-- 1. Create chat_sessions table (NEW TABLE)
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar REFERENCES "users"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "language" text DEFAULT 'en' NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- 2. Drop old chat_messages table if it exists with old schema
DROP TABLE IF EXISTS "chat_messages";

-- 3. Create new chat_messages table with correct schema
CREATE TABLE "chat_messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "session_id" uuid REFERENCES "chat_sessions"("id") ON DELETE CASCADE NOT NULL,
    "role" text NOT NULL, -- 'user' or 'ai'
    "content" text NOT NULL,
    "timestamp" timestamp DEFAULT now()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_user_id" ON "chat_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_updated_at" ON "chat_sessions"("updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_id" ON "chat_messages"("session_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_timestamp" ON "chat_messages"("timestamp");



-- Add to track which device/platform sessions come from
-- Useful for push notification token storage
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
  expo_push_token text;

-- Or better — support multiple devices per user
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token text NOT NULL,
  device_type text NOT NULL, -- 'ios' | 'android'
  device_name text,
  last_active timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  UNIQUE(expo_push_token)
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);