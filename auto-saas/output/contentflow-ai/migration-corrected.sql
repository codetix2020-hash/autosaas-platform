-- Migration: contentflow-ai
-- Generated: 2025-11-30 (Corrected for Supastarter)
-- Compatible with Supabase + Supastarter schema

-- IMPORTANTE: Ejecutar esto en el SQL Editor de Supabase
-- Proyecto: lcfjenptlmgnmbdaamdt

-- Tabla: agencies
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_voice JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: agency_clients
CREATE TABLE IF NOT EXISTS agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  approval_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: content_calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  platform TEXT NOT NULL,
  content_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_clients_agency_id ON agency_clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);

-- RLS Policies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own agencies
DROP POLICY IF EXISTS "Users manage own agencies" ON agencies;
CREATE POLICY "Users manage own agencies" ON agencies
  FOR ALL 
  USING (user_id = auth.uid()::text);

-- Policy: Users can see clients of their agencies
DROP POLICY IF EXISTS "Users manage agency clients" ON agency_clients;
CREATE POLICY "Users manage agency clients" ON agency_clients
  FOR ALL 
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Users can see content of their clients
DROP POLICY IF EXISTS "Users manage content calendar" ON content_calendar;
CREATE POLICY "Users manage content calendar" ON content_calendar
  FOR ALL 
  USING (
    client_id IN (
      SELECT ac.id 
      FROM agency_clients ac
      JOIN agencies a ON ac.agency_id = a.id
      WHERE a.user_id = auth.uid()::text
    )
  );

-- Verificación: Mostrar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'agency_clients', 'content_calendar');



