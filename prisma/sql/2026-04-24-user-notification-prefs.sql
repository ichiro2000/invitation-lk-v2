-- Add notification preference columns to User for the /dashboard/profile page.
--
-- Transactional emails (verification, password reset, payment confirmation,
-- support replies) ignore these flags since they are required for account
-- function. Only optional future sends — RSVP alerts, marketing — should
-- consult the relevant flag at send time.
--
-- Additive, idempotent: ALTER TABLE ADD COLUMN IF NOT EXISTS is a no-op
-- when the column already exists. Defaults are applied to all existing
-- rows automatically, so no backfill is needed.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyEmailUpdates"    BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyRsvpAlerts"      BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyMarketingEmails" BOOLEAN NOT NULL DEFAULT false;

-- Verify:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name LIKE 'notify%';

-- Rollback (strips preferences, all users default to the hardcoded send
-- behavior which is "send everything"):
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "notifyEmailUpdates";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "notifyRsvpAlerts";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "notifyMarketingEmails";
