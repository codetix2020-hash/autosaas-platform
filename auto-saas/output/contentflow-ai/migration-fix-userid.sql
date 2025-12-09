-- FIX: ContentFlow agencies table
-- Este script elimina y recrea la tabla agencies sin problemas

-- 1. Eliminar tabla existente (y sus dependencias)
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS agency_clients CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;

-- 2. Crear tabla agencies (sin foreign key constraint para evitar problemas)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand_voice JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla agency_clients
CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  approval_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla content_calendar
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES agency_clients(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  platform TEXT NOT NULL,
  content_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX idx_agencies_user_id ON agencies(user_id);
CREATE INDEX idx_agency_clients_agency_id ON agency_clients(agency_id);
CREATE INDEX idx_content_calendar_client_id ON content_calendar(client_id);
CREATE INDEX idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);

-- 6. Habilitar RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- 7. Policies (usando auth.uid() que ya está disponible en Supabase)
CREATE POLICY "Users manage own agencies" ON agencies
  FOR ALL 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users manage agency clients" ON agency_clients
  FOR ALL 
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()::text
    )
  );

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

-- 8. Verificar
SELECT 
  table_name,
  (SELECT column_name || ' ' || data_type 
   FROM information_schema.columns 
   WHERE table_name = t.table_name AND column_name = 'user_id') as user_id_type
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'agency_clients', 'content_calendar');

