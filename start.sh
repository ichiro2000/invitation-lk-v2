#!/bin/bash
echo "=== Running database migration ==="
node -e "
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sql = \`
DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN CREATE TYPE \"Role\" AS ENUM ('ADMIN', 'CUSTOMER'); END IF; END \\$\\$;
DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Plan') THEN CREATE TYPE \"Plan\" AS ENUM ('FREE', 'BASIC', 'STANDARD', 'PREMIUM'); END IF; END \\$\\$;
DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InviteType') THEN CREATE TYPE \"InviteType\" AS ENUM ('TO_YOU', 'TO_YOU_BOTH', 'TO_YOUR_FAMILY'); END IF; END \\$\\$;
DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RsvpStatus') THEN CREATE TYPE \"RsvpStatus\" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE'); END IF; END \\$\\$;
CREATE TABLE IF NOT EXISTS \"User\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, email TEXT NOT NULL UNIQUE, \"passwordHash\" TEXT, \"yourName\" TEXT DEFAULT '', \"partnerName\" TEXT DEFAULT '', \"weddingDate\" TIMESTAMP, venue TEXT, phone TEXT, role \"Role\" DEFAULT 'CUSTOMER', plan \"Plan\" DEFAULT 'FREE', image TEXT, \"emailVerified\" TIMESTAMP, \"createdAt\" TIMESTAMP DEFAULT NOW(), \"updatedAt\" TIMESTAMP DEFAULT NOW());
ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"yourName\" TEXT DEFAULT '';
ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"partnerName\" TEXT DEFAULT '';
ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS plan \"Plan\" DEFAULT 'FREE';
ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS venue TEXT;
CREATE TABLE IF NOT EXISTS \"Account\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL REFERENCES \"User\"(id) ON DELETE CASCADE, type TEXT NOT NULL, provider TEXT NOT NULL, \"providerAccountId\" TEXT NOT NULL, refresh_token TEXT, access_token TEXT, expires_at INT, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT, UNIQUE(provider, \"providerAccountId\"));
CREATE TABLE IF NOT EXISTS \"Session\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"sessionToken\" TEXT NOT NULL UNIQUE, \"userId\" TEXT NOT NULL REFERENCES \"User\"(id) ON DELETE CASCADE, expires TIMESTAMP NOT NULL);
CREATE TABLE IF NOT EXISTS \"VerificationToken\" (identifier TEXT NOT NULL, token TEXT NOT NULL UNIQUE, expires TIMESTAMP NOT NULL, UNIQUE(identifier, token));
CREATE TABLE IF NOT EXISTS \"Invitation\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL UNIQUE REFERENCES \"User\"(id) ON DELETE CASCADE, \"templateSlug\" TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, \"groomName\" TEXT NOT NULL, \"brideName\" TEXT NOT NULL, \"weddingDate\" TIMESTAMP NOT NULL, venue TEXT NOT NULL, \"venueAddress\" TEXT, \"isPublished\" BOOLEAN DEFAULT false, \"isPaid\" BOOLEAN DEFAULT false, \"createdAt\" TIMESTAMP DEFAULT NOW(), \"updatedAt\" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS \"Event\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"invitationId\" TEXT NOT NULL REFERENCES \"Invitation\"(id) ON DELETE CASCADE, title TEXT NOT NULL, time TEXT NOT NULL, venue TEXT, description TEXT, \"sortOrder\" INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS \"PageView\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"invitationId\" TEXT NOT NULL REFERENCES \"Invitation\"(id) ON DELETE CASCADE, \"viewedAt\" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS \"Guest\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL, name TEXT NOT NULL, whatsapp TEXT, email TEXT, \"inviteType\" \"InviteType\" DEFAULT 'TO_YOU', \"headCount\" INT DEFAULT 1, \"rsvpStatus\" \"RsvpStatus\" DEFAULT 'PENDING', \"confirmedCount\" INT DEFAULT 0, message TEXT, \"personalLink\" TEXT UNIQUE, \"linkOpened\" BOOLEAN DEFAULT false, \"linkOpenedAt\" TIMESTAMP, \"inviteSent\" BOOLEAN DEFAULT false, \"createdAt\" TIMESTAMP DEFAULT NOW(), \"updatedAt\" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS \"Task\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL, title TEXT NOT NULL, status TEXT DEFAULT 'TODO', priority TEXT DEFAULT 'MEDIUM', \"dueDate\" TIMESTAMP, category TEXT, \"createdAt\" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS \"Vendor\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, phone TEXT, email TEXT, cost DECIMAL(10,2), \"isPaid\" BOOLEAN DEFAULT false, notes TEXT, \"createdAt\" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS \"BudgetItem\" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, \"userId\" TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, estimated DECIMAL(10,2) NOT NULL, actual DECIMAL(10,2), \"isPaid\" BOOLEAN DEFAULT false, notes TEXT, \"createdAt\" TIMESTAMP DEFAULT NOW());
\`;
pool.query(sql).then(() => { console.log('Migration OK'); pool.end(); }).catch(e => { console.log('Migration error:', e.message); pool.end(); });
" 2>&1
echo "=== Starting server ==="
node server.js
