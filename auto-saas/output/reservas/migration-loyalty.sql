-- ═══════════════════════════════════════════════════════════════
-- Sistema de Fidelización: Perfiles de Cliente + XP + Niveles
-- ═══════════════════════════════════════════════════════════════

-- Tabla de perfiles de cliente (autenticados)
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  
  -- Auth
  email TEXT NOT NULL,
  password_hash TEXT,
  auth_provider TEXT DEFAULT 'email',
  
  -- Info personal
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  birth_date DATE,
  
  -- Sistema de XP
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  level_name TEXT DEFAULT 'Bronce',
  
  -- Estadísticas
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit TIMESTAMPTZ,
  
  -- Preferencias
  preferred_professional_id UUID,
  notes TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, email)
);

-- Tabla de niveles configurables por negocio
CREATE TABLE IF NOT EXISTS loyalty_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  
  level_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  
  -- Colores para mostrar
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '⭐',
  
  -- Recompensa al alcanzar este nivel
  reward_type TEXT CHECK (reward_type IN ('discount_percent', 'discount_fixed', 'free_service', 'gift', 'none')),
  reward_value DECIMAL(10,2),
  reward_description TEXT,
  reward_service_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, level_number)
);

-- Tabla de historial de XP
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id),
  
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de recompensas ganadas
CREATE TABLE IF NOT EXISTS earned_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id),
  loyalty_level_id UUID REFERENCES loyalty_levels(id),
  
  reward_type TEXT NOT NULL,
  reward_value DECIMAL(10,2),
  reward_description TEXT,
  
  -- Estado
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  booking_id_used UUID REFERENCES bookings(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de fotos de cortes (historial visual)
CREATE TABLE IF NOT EXISTS cut_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id),
  booking_id UUID REFERENCES bookings(id),
  professional_id UUID REFERENCES professionals(id),
  
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Metadata
  description TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_profiles_org ON client_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_email ON client_profiles(organization_id, email);
CREATE INDEX IF NOT EXISTS idx_client_profiles_xp ON client_profiles(organization_id, total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_levels_org ON loyalty_levels(organization_id, level_number);
CREATE INDEX IF NOT EXISTS idx_xp_history_client ON xp_history(client_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earned_rewards_client ON earned_rewards(client_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_cut_photos_client ON cut_photos(client_profile_id, created_at DESC);

-- RLS
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_photos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para client_profiles (para login)
CREATE POLICY "client_profiles_public_read" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "client_profiles_org_write" ON client_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "client_profiles_org_update" ON client_profiles FOR UPDATE USING (true);

CREATE POLICY "loyalty_levels_public_read" ON loyalty_levels FOR SELECT USING (true);
CREATE POLICY "xp_history_public_read" ON xp_history FOR SELECT USING (true);
CREATE POLICY "earned_rewards_public_read" ON earned_rewards FOR SELECT USING (true);
CREATE POLICY "cut_photos_public_read" ON cut_photos FOR SELECT USING (true);

-- Insertar niveles por defecto (se ejecuta una vez por organización)
-- Esto se hará desde la API cuando se configure el negocio

-- XP por tipo de servicio (configuración sugerida)
COMMENT ON TABLE client_profiles IS 'Perfiles de clientes con sistema de XP y niveles';
COMMENT ON TABLE loyalty_levels IS 'Niveles de fidelización configurables por negocio';
COMMENT ON TABLE xp_history IS 'Historial de XP ganado por cada cliente';
COMMENT ON TABLE earned_rewards IS 'Recompensas ganadas y su estado de uso';
COMMENT ON TABLE cut_photos IS 'Fotos de cortes para historial visual del cliente';


