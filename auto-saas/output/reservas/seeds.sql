// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Database Seeds
// Blueprint: ReservasPro (reservas)
// Generated: 2025-12-08
// ═══════════════════════════════════════════════════════════════

-- Run this SQL in Supabase to insert sample data
-- Make sure to replace 'YOUR_ORGANIZATION_ID' with a real organization ID

-- Sample data for bookings
INSERT INTO bookings (organization_id, client_id, professional_id, service_id, client_name, client_email, client_phone, date, start_time, end_time, status, notes, price)
VALUES ('YOUR_ORGANIZATION_ID', NULL, NULL, NULL, 'Sample booking 1', 'sample@example.com', NULL, CURRENT_DATE, NULL, NULL, 'Sample value', NULL, 100.00);

-- Sample data for services
INSERT INTO services (organization_id, name, description, duration, price, is_active, color)
VALUES ('YOUR_ORGANIZATION_ID', 'Sample service 1', 'This is a sample description', 1, 100.00, true, NULL);

-- Sample data for professionals
INSERT INTO professionals (organization_id, name, email, phone, avatar_url, specialties, is_active)
VALUES ('YOUR_ORGANIZATION_ID', 'Sample professional 1', 'sample@example.com', NULL, NULL, NULL, true);

-- Sample data for working_hours
INSERT INTO working_hours (organization_id, professional_id, day_of_week, start_time, end_time, is_working)
VALUES ('YOUR_ORGANIZATION_ID', NULL, 1, NULL, NULL, true);

-- Sample data for clients
INSERT INTO clients (organization_id, name, email, phone, notes, total_visits, last_visit)
VALUES ('YOUR_ORGANIZATION_ID', 'Sample client 1', 'sample@example.com', NULL, NULL, 1, NULL);

