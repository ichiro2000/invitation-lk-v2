-- Enforce uniqueness on Order.paymentRef so the same PayHere payment_id
-- can never land on two orders (misrouted webhook, replay, merchant typo).
-- paymentRef is nullable — the partial unique-index pattern makes the NULL
-- rows coexist while still blocking duplicate non-null values.
--
-- Idempotent: CREATE UNIQUE INDEX IF NOT EXISTS is a no-op when the index
-- already exists. Safe to rerun.

CREATE UNIQUE INDEX IF NOT EXISTS "Order_paymentRef_key"
  ON "Order"("paymentRef")
  WHERE "paymentRef" IS NOT NULL;

-- Verify:
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename = 'Order' AND indexname LIKE '%paymentRef%';
