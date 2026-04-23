-- Create DeliveryLog table + enums for the admin Communication Center.
-- Write path: src/lib/delivery-log.ts (called from src/lib/resend.ts).
-- Read path: /admin/communications.
--
-- Additive only: nothing existing reads or writes to this table before this
-- migration, so creating it is a pure no-op for every other code path. The
-- resend.ts wrapper swallows any logging failure so email sends are never
-- blocked by a missing table or DB outage.
--
-- Idempotent: every statement is guarded with IF NOT EXISTS / DO $$ ... $$.
-- Safe to rerun on every boot alongside the rest of start.sh.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeliveryChannel') THEN
    CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeliveryStatus') THEN
    CREATE TYPE "DeliveryStatus" AS ENUM ('SENT', 'FAILED', 'DELIVERED', 'BOUNCED', 'OPENED', 'CLICKED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "DeliveryLog" (
  "id"         TEXT PRIMARY KEY,
  "channel"    "DeliveryChannel" NOT NULL,
  "status"     "DeliveryStatus"  NOT NULL,
  "provider"   TEXT,
  "providerId" TEXT,
  "recipient"  TEXT NOT NULL,
  "subject"    TEXT,
  "template"   TEXT,
  "userId"     TEXT,
  "error"      TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "DeliveryLog_createdAt_idx"
  ON "DeliveryLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DeliveryLog_channel_status_idx"
  ON "DeliveryLog"("channel", "status");
CREATE INDEX IF NOT EXISTS "DeliveryLog_recipient_idx"
  ON "DeliveryLog"("recipient");
CREATE INDEX IF NOT EXISTS "DeliveryLog_userId_idx"
  ON "DeliveryLog"("userId");
CREATE INDEX IF NOT EXISTS "DeliveryLog_template_idx"
  ON "DeliveryLog"("template");

-- Verify:
-- SELECT channel, status, COUNT(*) FROM "DeliveryLog" GROUP BY 1,2 ORDER BY 1,2;

-- Rollback (drops all historical delivery events; email sends themselves are
-- unaffected since logging is fire-and-forget in the app layer):
-- DROP TABLE IF EXISTS "DeliveryLog";
-- DROP TYPE IF EXISTS "DeliveryStatus";
-- DROP TYPE IF EXISTS "DeliveryChannel";
