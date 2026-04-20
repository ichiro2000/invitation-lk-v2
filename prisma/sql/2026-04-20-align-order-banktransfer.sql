-- Align production DB with prisma/schema.prisma for Order + BankTransfer.
-- Root cause: `prisma/migrations/` is empty, so prod drifted from schema.
-- Evidence (from DO logs): `The column Order.paymentStatus does not exist…`
-- Everything here is idempotent — safe to rerun, safe if columns already exist.
-- Does NOT touch: User, Invitation, Event, Guest, Task, Vendor, BudgetItem, PageView.

BEGIN;

-- ── Enum types ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
    CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'BANK_TRANSFER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BankTransferStatus') THEN
    CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
  END IF;
END $$;

-- ── Order columns ─────────────────────────────────────────────────────────────
-- Defaults are chosen so any pre-existing rows backfill to a sane value.
-- BANK_TRANSFER is the only plausible existing payment method, since the Stripe
-- flow would have been equally broken by the missing columns.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod"         "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus"         "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currency"              TEXT            NOT NULL DEFAULT 'LKR';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId"       TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key"       ON "Order"("stripeSessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
CREATE        INDEX IF NOT EXISTS "Order_userId_idx"                ON "Order"("userId");

-- ── BankTransfer columns ──────────────────────────────────────────────────────
ALTER TABLE "BankTransfer" ADD COLUMN IF NOT EXISTS "bankReference" TEXT;
ALTER TABLE "BankTransfer" ADD COLUMN IF NOT EXISTS "status"        "BankTransferStatus" NOT NULL DEFAULT 'PENDING_REVIEW';
ALTER TABLE "BankTransfer" ADD COLUMN IF NOT EXISTS "adminNotes"    TEXT;
ALTER TABLE "BankTransfer" ADD COLUMN IF NOT EXISTS "reviewedBy"    TEXT;
ALTER TABLE "BankTransfer" ADD COLUMN IF NOT EXISTS "reviewedAt"    TIMESTAMP(3);

COMMIT;

-- Verify (run separately after COMMIT):
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('Order','BankTransfer')
-- ORDER BY table_name, ordinal_position;
