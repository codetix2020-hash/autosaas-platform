-- Migration: Add email field to agency_clients
-- This allows sending brief links to clients via email

-- Add email column
ALTER TABLE agency_clients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_agency_clients_email ON agency_clients(email);

-- Add comment
COMMENT ON COLUMN agency_clients.email IS 'Client email for sending brief links and notifications';


