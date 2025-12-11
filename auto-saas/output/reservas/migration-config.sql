-- ═══════════════════════════════════════════════════════════════
-- Tabla: business_config
-- Configuración personalizada para cada negocio/organización
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL UNIQUE,
  
  -- Información básica
  business_name TEXT NOT NULL DEFAULT 'Mi Salón',
  business_description TEXT DEFAULT 'Sistema de reservas online',
  slug TEXT UNIQUE,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  
  -- Contacto
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  
  -- Horarios por defecto
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '19:00',
  working_days TEXT[] DEFAULT ARRAY['1','2','3','4','5','6'],
  
  -- Redes sociales
  instagram_url TEXT,
  facebook_url TEXT,
  website_url TEXT,
  
  -- Configuración de reservas
  min_advance_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 30,
  slot_duration INTEGER DEFAULT 30,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_business_config_org ON business_config(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_config_slug ON business_config(slug) WHERE slug IS NOT NULL;

-- Row Level Security
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_config_org_isolation" ON business_config
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- Política para lectura pública (para la página de reservas)
CREATE POLICY "business_config_public_read" ON business_config
    FOR SELECT
    USING (true);


