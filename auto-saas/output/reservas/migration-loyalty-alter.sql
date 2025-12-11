-- Agregar XP a servicios
ALTER TABLE services ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 100;

-- Agregar referencia a perfil de cliente en bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_profile_id UUID REFERENCES client_profiles(id);

-- Actualizar servicios existentes con XP basado en precio
UPDATE services SET xp_value = GREATEST(50, ROUND(price * 2)) WHERE xp_value IS NULL OR xp_value = 100;


