// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Database Seeds
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08
// ═══════════════════════════════════════════════════════════════

-- Run this SQL in Supabase to insert sample data
-- Make sure to replace 'YOUR_ORGANIZATION_ID' with a real organization ID

-- Sample data for tasks
INSERT INTO tasks (organization_id, title, description, status, priority, due_date, assigned_to)
VALUES ('YOUR_ORGANIZATION_ID', 'Sample Title', 'This is a sample description', 'Sample value', NULL, CURRENT_DATE, NULL);

