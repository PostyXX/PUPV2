-- Add supabase_uid column and remove password_hash
ALTER TABLE "User" ADD COLUMN "supabase_uid" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_supabase_uid_key" UNIQUE ("supabase_uid");
ALTER TABLE "User" DROP COLUMN IF EXISTS "password_hash";
