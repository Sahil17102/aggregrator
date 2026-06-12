ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "passwordResetToken" varchar(8),
  ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "passwordChangedAt" timestamp with time zone;

UPDATE "users"
SET "passwordChangedAt" = COALESCE("passwordChangedAt", "createdAt")
WHERE "passwordHash" IS NOT NULL
  AND "passwordChangedAt" IS NULL;
