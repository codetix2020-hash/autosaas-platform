-- ═══════════════════════════════════════════════════════════════
-- AUTO-SAAS BUILDER - SQL Migration
-- Blueprint: ReservasPro (reservas)
-- Generated: 2025-12-08T12:08:05.228Z
-- ═══════════════════════════════════════════════════════════════
-- IMPORTANTE: Este SQL debe ejecutarse en orden para evitar errores de foreign keys
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- Table: services (sin dependencias)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_org ON services(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_created ON services(created_at DESC);

-- Row Level Security for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_org_isolation" ON services
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- Table: professionals (sin dependencias)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  specialties TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for professionals
CREATE INDEX IF NOT EXISTS idx_professionals_org ON professionals(organization_id);
CREATE INDEX IF NOT EXISTS idx_professionals_created ON professionals(created_at DESC);

-- Row Level Security for professionals
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professionals_org_isolation" ON professionals
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- Table: clients (sin dependencias)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_created ON clients(created_at DESC);

-- Row Level Security for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_org_isolation" ON clients
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- Table: working_hours (depende de professionals)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  professional_id UUID REFERENCES professionals(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  is_working BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for working_hours
CREATE INDEX IF NOT EXISTS idx_working_hours_org ON working_hours(organization_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_created ON working_hours(created_at DESC);

-- Row Level Security for working_hours
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "working_hours_org_isolation" ON working_hours
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- Table: bookings (depende de clients, professionals, services)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  professional_id UUID REFERENCES professionals(id),
  service_id UUID REFERENCES services(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Row Level Security for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_org_isolation" ON bookings
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- End of migration for reservas
-- ═══════════════════════════════════════════════════════════════
