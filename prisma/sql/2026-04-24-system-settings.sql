-- Create SystemSetting table for admin-editable global config.
-- Keys are defined in src/lib/settings.ts; missing keys fall back to hardcoded
-- defaults, so an empty table matches the pre-settings behavior exactly.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS is a no-op when the table already
-- exists. Safe to rerun.

CREATE TABLE IF NOT EXISTS "SystemSetting" (
  "key"        TEXT PRIMARY KEY,
  "value"      TEXT NOT NULL,
  "updatedBy"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verify:
-- SELECT * FROM "SystemSetting" ORDER BY key;

-- Rollback (drops all admin-saved config; hardcoded defaults resume):
-- DROP TABLE IF EXISTS "SystemSetting";
