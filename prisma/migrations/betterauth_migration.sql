-- BetterAuth Migration Script
-- This script safely migrates from NextAuth schema to BetterAuth schema
-- while preserving existing data

-- ============================================================================
-- PART 1: Migrate Account table
-- ============================================================================

-- Step 1: Add new columns (nullable first)
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "id" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountId" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "providerId" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessToken" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshToken" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "idToken" text;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "password" text;

-- Step 2: Populate new columns from old data
UPDATE "Account" SET
  "id" = COALESCE("id", gen_random_uuid()::text),
  "accountId" = COALESCE("accountId", "providerAccountId"),
  "providerId" = COALESCE("providerId", "provider"),
  "accessToken" = COALESCE("accessToken", "access_token"),
  "refreshToken" = COALESCE("refreshToken", "refresh_token"),
  "idToken" = COALESCE("idToken", "id_token"),
  "accessTokenExpiresAt" = COALESCE(
    "accessTokenExpiresAt",
    CASE
      WHEN "expires_at" IS NOT NULL THEN to_timestamp("expires_at"::bigint)
      ELSE NULL
    END
  );

-- Step 3: Make new columns NOT NULL where required
ALTER TABLE "Account" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "providerId" SET NOT NULL;

-- Step 4: Add default for id column
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Step 5: Drop old primary key constraint (might have different names)
DO $$
BEGIN
  -- Try to drop common constraint names
  ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
  ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_provider_providerAccountId_key";
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Step 6: Add new primary key
ALTER TABLE "Account" ADD PRIMARY KEY ("id");

-- Step 7: Drop old columns (only after data is migrated)
ALTER TABLE "Account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "providerAccountId";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "refresh_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "access_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "expires_at";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "token_type";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "id_token";
ALTER TABLE "Account" DROP COLUMN IF EXISTS "session_state";

-- ============================================================================
-- PART 2: Migrate Session table
-- ============================================================================

-- Step 1: Add new columns (nullable first)
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "id" text;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "token" text;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" text;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" text;

-- Step 2: Populate new columns from old data
UPDATE "Session" SET
  "id" = COALESCE("id", gen_random_uuid()::text),
  "token" = COALESCE("token", "sessionToken"),
  "expiresAt" = COALESCE("expiresAt", "expires");

-- Step 3: Make new columns NOT NULL where required
ALTER TABLE "Session" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET NOT NULL;

-- Step 4: Add default for id column
ALTER TABLE "Session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Step 5: Drop old primary key
DO $$
BEGIN
  ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
  ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_sessionToken_key";
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Step 6: Add new primary key and unique constraint
ALTER TABLE "Session" ADD PRIMARY KEY ("id");
ALTER TABLE "Session" ADD CONSTRAINT "Session_token_key" UNIQUE ("token");

-- Step 7: Drop old columns
ALTER TABLE "Session" DROP COLUMN IF EXISTS "sessionToken";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "expires";

-- ============================================================================
-- PART 3: Create Verification table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Verification" (
  "id" text NOT NULL DEFAULT gen_random_uuid()::text,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  PRIMARY KEY ("id")
);

-- ============================================================================
-- CLEANUP & VERIFICATION
-- ============================================================================
