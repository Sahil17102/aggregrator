ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarFrontUrl" text;

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarBackUrl" text;

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarFrontMime" varchar(100);

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarBackMime" varchar(100);

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarFrontStatus" "kyc_doc_status" DEFAULT 'pending' NOT NULL;

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarBackStatus" "kyc_doc_status" DEFAULT 'pending' NOT NULL;

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarFrontRejectionReason" text;

ALTER TABLE "kyc"
  ADD COLUMN IF NOT EXISTS "aadhaarBackRejectionReason" text;
