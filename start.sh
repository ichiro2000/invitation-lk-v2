#!/bin/bash
echo "=== Running database migration ==="
node -e "
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  // Step 1: Add enum values (must be separate transaction)
  try {
    await pool.query(\"ALTER TYPE \\\"Plan\\\" ADD VALUE IF NOT EXISTS 'FREE'\");
  } catch(e) { /* already exists or enum doesn't exist yet */ }
  try {
    await pool.query(\"ALTER TYPE \\\"RsvpStatus\\\" ADD VALUE IF NOT EXISTS 'MAYBE'\");
  } catch(e) {}
  try {
    await pool.query(\"ALTER TYPE \\\"PaymentMethod\\\" ADD VALUE IF NOT EXISTS 'PAYHERE'\");
  } catch(e) {}

  // Step 2: Create enums if they don't exist
  const enums = [
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN CREATE TYPE \\\"Role\\\" AS ENUM ('ADMIN', 'CUSTOMER'); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Plan') THEN CREATE TYPE \\\"Plan\\\" AS ENUM ('FREE', 'BASIC', 'STANDARD', 'PREMIUM'); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InviteType') THEN CREATE TYPE \\\"InviteType\\\" AS ENUM ('TO_YOU', 'TO_YOU_BOTH', 'TO_YOUR_FAMILY'); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RsvpStatus') THEN CREATE TYPE \\\"RsvpStatus\\\" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE'); END IF; END \\$\\$\",
  ];
  for (const sql of enums) { try { await pool.query(sql); } catch(e) {} }

  // Step 2b: Convert legacy text columns to the proper enum types.
  // Some early prod rows were created before the enum types existed, so
  // Order.paymentMethod / paymentStatus / plan came up as plain text. Prisma
  // now generates casts like \`\"paymentMethod\" = \$1::\"PaymentMethod\"\`,
  // which fail with \"operator does not exist: text = PaymentMethod\" until
  // the column itself becomes the enum. Idempotent via data_type guard.
  const columnConversions = [
    \"DO \\$\\$ BEGIN IF (SELECT data_type FROM information_schema.columns WHERE table_name='Order' AND column_name='paymentMethod') = 'text' THEN ALTER TABLE \\\"Order\\\" ALTER COLUMN \\\"paymentMethod\\\" TYPE \\\"PaymentMethod\\\" USING \\\"paymentMethod\\\"::\\\"PaymentMethod\\\"; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF (SELECT data_type FROM information_schema.columns WHERE table_name='Order' AND column_name='paymentStatus') = 'text' THEN ALTER TABLE \\\"Order\\\" ALTER COLUMN \\\"paymentStatus\\\" TYPE \\\"PaymentStatus\\\" USING \\\"paymentStatus\\\"::\\\"PaymentStatus\\\"; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF (SELECT data_type FROM information_schema.columns WHERE table_name='Order' AND column_name='plan') = 'text' THEN ALTER TABLE \\\"Order\\\" ALTER COLUMN \\\"plan\\\" TYPE \\\"Plan\\\" USING \\\"plan\\\"::\\\"Plan\\\"; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF (SELECT data_type FROM information_schema.columns WHERE table_name='BankTransfer' AND column_name='status') = 'text' THEN ALTER TABLE \\\"BankTransfer\\\" ALTER COLUMN \\\"status\\\" TYPE \\\"BankTransferStatus\\\" USING \\\"status\\\"::\\\"BankTransferStatus\\\"; END IF; END \\$\\$\",
  ];
  for (const sql of columnConversions) {
    try { await pool.query(sql); }
    catch(e) { console.log('Column conversion error:', e.message.substring(0, 120)); }
  }

  // Step 3: Create tables and alter columns
  const tables = [
    \"CREATE TABLE IF NOT EXISTS \\\"User\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, email TEXT NOT NULL UNIQUE, \\\"passwordHash\\\" TEXT, \\\"yourName\\\" TEXT DEFAULT '', \\\"partnerName\\\" TEXT DEFAULT '', \\\"weddingDate\\\" TIMESTAMP, venue TEXT, phone TEXT, role \\\"Role\\\" DEFAULT 'CUSTOMER', plan \\\"Plan\\\" DEFAULT 'FREE', image TEXT, \\\"emailVerified\\\" TIMESTAMP, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"ALTER TABLE \\\"User\\\" ADD COLUMN IF NOT EXISTS \\\"yourName\\\" TEXT DEFAULT ''\",
    \"ALTER TABLE \\\"User\\\" ADD COLUMN IF NOT EXISTS \\\"partnerName\\\" TEXT DEFAULT ''\",
    \"ALTER TABLE \\\"User\\\" ADD COLUMN IF NOT EXISTS plan \\\"Plan\\\" DEFAULT 'FREE'\",
    \"ALTER TABLE \\\"User\\\" ADD COLUMN IF NOT EXISTS venue TEXT\",
    \"CREATE TABLE IF NOT EXISTS \\\"Account\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL REFERENCES \\\"User\\\"(id) ON DELETE CASCADE, type TEXT NOT NULL, provider TEXT NOT NULL, \\\"providerAccountId\\\" TEXT NOT NULL, refresh_token TEXT, access_token TEXT, expires_at INT, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT, UNIQUE(provider, \\\"providerAccountId\\\"))\",
    \"CREATE TABLE IF NOT EXISTS \\\"Session\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"sessionToken\\\" TEXT NOT NULL UNIQUE, \\\"userId\\\" TEXT NOT NULL REFERENCES \\\"User\\\"(id) ON DELETE CASCADE, expires TIMESTAMP NOT NULL)\",
    \"CREATE TABLE IF NOT EXISTS \\\"VerificationToken\\\" (identifier TEXT NOT NULL, token TEXT NOT NULL UNIQUE, expires TIMESTAMP NOT NULL, UNIQUE(identifier, token))\",
    \"CREATE TABLE IF NOT EXISTS \\\"Invitation\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL UNIQUE REFERENCES \\\"User\\\"(id) ON DELETE CASCADE, \\\"templateSlug\\\" TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, \\\"groomName\\\" TEXT NOT NULL, \\\"brideName\\\" TEXT NOT NULL, \\\"weddingDate\\\" TIMESTAMP NOT NULL, venue TEXT NOT NULL, \\\"venueAddress\\\" TEXT, \\\"isPublished\\\" BOOLEAN DEFAULT false, \\\"isPaid\\\" BOOLEAN DEFAULT false, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"CREATE TABLE IF NOT EXISTS \\\"Event\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"invitationId\\\" TEXT NOT NULL REFERENCES \\\"Invitation\\\"(id) ON DELETE CASCADE, title TEXT NOT NULL, time TEXT NOT NULL, venue TEXT, description TEXT, \\\"sortOrder\\\" INT DEFAULT 0)\",
    \"CREATE TABLE IF NOT EXISTS \\\"PageView\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"invitationId\\\" TEXT NOT NULL REFERENCES \\\"Invitation\\\"(id) ON DELETE CASCADE, \\\"viewedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"CREATE TABLE IF NOT EXISTS \\\"Guest\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL, name TEXT NOT NULL, whatsapp TEXT, email TEXT, \\\"inviteType\\\" \\\"InviteType\\\" DEFAULT 'TO_YOU', \\\"headCount\\\" INT DEFAULT 1, \\\"rsvpStatus\\\" \\\"RsvpStatus\\\" DEFAULT 'PENDING', \\\"confirmedCount\\\" INT DEFAULT 0, message TEXT, \\\"personalLink\\\" TEXT UNIQUE, \\\"linkOpened\\\" BOOLEAN DEFAULT false, \\\"linkOpenedAt\\\" TIMESTAMP, \\\"inviteSent\\\" BOOLEAN DEFAULT false, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"personalLink\\\" TEXT UNIQUE\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"linkOpened\\\" BOOLEAN DEFAULT false\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"linkOpenedAt\\\" TIMESTAMP\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"inviteSent\\\" BOOLEAN DEFAULT false\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"confirmedCount\\\" INT DEFAULT 0\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS \\\"userId\\\" TEXT\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'FRIENDS'\",
    \"ALTER TABLE \\\"Guest\\\" ADD COLUMN IF NOT EXISTS side TEXT DEFAULT 'BOTH'\",
    \"CREATE TABLE IF NOT EXISTS \\\"Task\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL, title TEXT NOT NULL, status TEXT DEFAULT 'TODO', priority TEXT DEFAULT 'MEDIUM', \\\"dueDate\\\" TIMESTAMP, category TEXT, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"CREATE TABLE IF NOT EXISTS \\\"Vendor\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, phone TEXT, email TEXT, cost DECIMAL(10,2), \\\"isPaid\\\" BOOLEAN DEFAULT false, notes TEXT, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"CREATE TABLE IF NOT EXISTS \\\"BudgetItem\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, estimated DECIMAL(10,2) NOT NULL, actual DECIMAL(10,2), \\\"isPaid\\\" BOOLEAN DEFAULT false, notes TEXT, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='userId') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"userId\\\" TEXT UNIQUE REFERENCES \\\"User\\\"(id) ON DELETE CASCADE; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='templateSlug') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"templateSlug\\\" TEXT NOT NULL DEFAULT 'royal-elegance'; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='slug') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN slug TEXT UNIQUE; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='groomName') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"groomName\\\" TEXT NOT NULL DEFAULT 'Groom'; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='brideName') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"brideName\\\" TEXT NOT NULL DEFAULT 'Bride'; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='weddingDate') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"weddingDate\\\" TIMESTAMP NOT NULL DEFAULT NOW(); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='venue') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN venue TEXT NOT NULL DEFAULT 'Wedding Venue'; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='venueAddress') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"venueAddress\\\" TEXT; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='isPublished') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"isPublished\\\" BOOLEAN DEFAULT false; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='isPaid') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"isPaid\\\" BOOLEAN DEFAULT false; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='updatedAt') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW(); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='createdAt') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='config') THEN ALTER TABLE \\\"Invitation\\\" ADD COLUMN config JSONB; END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN ALTER TABLE \\\"Invitation\\\" DROP COLUMN IF EXISTS \\\"orderId\\\"; EXCEPTION WHEN OTHERS THEN NULL; END \\$\\$\",
    \"DO \\$\\$ BEGIN ALTER TABLE \\\"Invitation\\\" DROP COLUMN IF EXISTS \\\"templateId\\\"; EXCEPTION WHEN OTHERS THEN NULL; END \\$\\$\",
    \"DO \\$\\$ BEGIN ALTER TABLE \\\"Invitation\\\" DROP COLUMN IF EXISTS \\\"invitationId\\\"; EXCEPTION WHEN OTHERS THEN NULL; END \\$\\$\",
    \"ALTER TABLE \\\"Invitation\\\" DROP CONSTRAINT IF EXISTS \\\"Invitation_userId_key\\\"\",
    \"CREATE INDEX IF NOT EXISTS \\\"Invitation_userId_idx\\\" ON \\\"Invitation\\\"(\\\"userId\\\")\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN CREATE TYPE \\\"PaymentMethod\\\" AS ENUM ('STRIPE', 'PAYHERE', 'BANK_TRANSFER'); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN CREATE TYPE \\\"PaymentStatus\\\" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'); END IF; END \\$\\$\",
    \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BankTransferStatus') THEN CREATE TYPE \\\"BankTransferStatus\\\" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED'); END IF; END \\$\\$\",
    \"CREATE TABLE IF NOT EXISTS \\\"Order\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"userId\\\" TEXT NOT NULL REFERENCES \\\"User\\\"(id) ON DELETE CASCADE, plan \\\"Plan\\\" NOT NULL, amount DECIMAL(10,2) NOT NULL, currency TEXT DEFAULT 'LKR', \\\"paymentMethod\\\" \\\"PaymentMethod\\\" NOT NULL, \\\"paymentStatus\\\" \\\"PaymentStatus\\\" DEFAULT 'PENDING', \\\"paymentRef\\\" TEXT, \\\"stripeSessionId\\\" TEXT UNIQUE, \\\"stripePaymentIntentId\\\" TEXT UNIQUE, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"ALTER TABLE \\\"Order\\\" ADD COLUMN IF NOT EXISTS \\\"paymentRef\\\" TEXT\",
    \"CREATE UNIQUE INDEX IF NOT EXISTS \\\"Order_paymentRef_key\\\" ON \\\"Order\\\"(\\\"paymentRef\\\") WHERE \\\"paymentRef\\\" IS NOT NULL\",
    \"CREATE TABLE IF NOT EXISTS \\\"BankTransfer\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \\\"orderId\\\" TEXT NOT NULL UNIQUE REFERENCES \\\"Order\\\"(id) ON DELETE CASCADE, \\\"receiptImage\\\" TEXT NOT NULL, \\\"bankReference\\\" TEXT, status \\\"BankTransferStatus\\\" DEFAULT 'PENDING_REVIEW', \\\"adminNotes\\\" TEXT, \\\"reviewedBy\\\" TEXT, \\\"reviewedAt\\\" TIMESTAMP, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), \\\"updatedAt\\\" TIMESTAMP DEFAULT NOW())\",
    \"CREATE TABLE IF NOT EXISTS \\\"PasswordResetToken\\\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, email TEXT NOT NULL, token TEXT NOT NULL UNIQUE, expires TIMESTAMP NOT NULL, \\\"createdAt\\\" TIMESTAMP DEFAULT NOW(), UNIQUE(email, token))\",
  ];
  for (const sql of tables) { try { await pool.query(sql); } catch(e) { console.log('Table error:', e.message.substring(0, 80)); } }

  console.log('Migration OK');
  pool.end();
}

migrate().catch(e => { console.log('Migration failed:', e.message); pool.end(); });
" 2>&1
echo "=== Starting server ==="
node server.js
