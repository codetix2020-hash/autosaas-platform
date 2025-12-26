-- Migration: Better Auth + Supastarter Tables
-- Database: Supabase PostgreSQL
-- Generated from Prisma schema

-- IMPORTANTE: Ejecutar todo esto en Supabase SQL Editor
-- Proyecto: lcfjenptlmgnmbdaamdt

-- ============================================
-- 1. ENUM TYPES
-- ============================================
CREATE TYPE "PurchaseType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME');

-- ============================================
-- 2. CORE AUTH TABLES
-- ============================================

-- User table
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "username" TEXT UNIQUE,
  "role" TEXT,
  "banned" BOOLEAN,
  "banReason" TEXT,
  "banExpires" TIMESTAMP(3),
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  "paymentsCustomerId" TEXT,
  "locale" TEXT,
  "displayUsername" TEXT,
  "twoFactorEnabled" BOOLEAN
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "impersonatedBy" TEXT,
  "activeOrganizationId" TEXT,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Account table (social + password auth)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "expiresAt" TIMESTAMP(3),
  "password" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Verification table (email verification, password reset)
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3)
);

-- Passkey table (passwordless auth)
CREATE TABLE IF NOT EXISTS "passkey" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "publicKey" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "credentialID" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "deviceType" TEXT NOT NULL,
  "backedUp" BOOLEAN NOT NULL,
  "transports" TEXT,
  "aaguid" TEXT,
  "createdAt" TIMESTAMP(3)
);

-- TwoFactor table
CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" TEXT PRIMARY KEY,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

-- ============================================
-- 3. ORGANIZATION TABLES
-- ============================================

-- Organization table
CREATE TABLE IF NOT EXISTS "organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE,
  "logo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "metadata" TEXT,
  "paymentsCustomerId" TEXT
);

-- Member table (user-organization relationship)
CREATE TABLE IF NOT EXISTS "member" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  UNIQUE("organizationId", "userId")
);

-- Invitation table
CREATE TABLE IF NOT EXISTS "invitation" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT,
  "status" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "inviterId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

-- ============================================
-- 4. PAYMENTS & FEATURES
-- ============================================

-- Purchase table (subscriptions & one-time purchases)
CREATE TABLE IF NOT EXISTS "purchase" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
  "type" "PurchaseType" NOT NULL,
  "customerId" TEXT NOT NULL,
  "subscriptionId" TEXT UNIQUE,
  "productId" TEXT NOT NULL,
  "status" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat table
CREATE TABLE IF NOT EXISTS "ai_chat" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
  "title" TEXT,
  "messages" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. INDICES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_member_organizationId" ON "member"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_member_userId" ON "member"("userId");
CREATE INDEX IF NOT EXISTS "idx_purchase_subscriptionId" ON "purchase"("subscriptionId");
CREATE INDEX IF NOT EXISTS "idx_purchase_organizationId" ON "purchase"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_purchase_userId" ON "purchase"("userId");

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================
-- NOTA: Estas tablas se gestionan desde el backend con Better Auth
-- No necesitan RLS ya que la autenticación se maneja server-side
-- Si en el futuro quieres acceder desde el cliente, habilita RLS aquí

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user', 'session', 'account', 'verification', 
    'passkey', 'twoFactor', 'organization', 'member', 
    'invitation', 'purchase', 'ai_chat'
  )
ORDER BY tablename;

-- Debería mostrar 11 tablas creadas



