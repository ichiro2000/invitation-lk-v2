-- Add PAYHERE to the PaymentMethod enum in prod.
-- Root cause: prisma/schema.prisma now includes PAYHERE in enum PaymentMethod,
-- but the Postgres "PaymentMethod" enum type was created before that change
-- and only contains STRIPE, BANK_TRANSFER. The INSERT therefore fails with:
--   invalid input value for enum "PaymentMethod": "PAYHERE"
--
-- ALTER TYPE ... ADD VALUE is idempotent with IF NOT EXISTS and safe to rerun.
-- Not wrapped in BEGIN/COMMIT because ADD VALUE has historical transaction
-- restrictions and does not need transactional atomicity here — it's a single
-- catalog-level change.

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'PAYHERE';

-- Verify:
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = '"PaymentMethod"'::regtype
-- ORDER BY enumsortorder;
