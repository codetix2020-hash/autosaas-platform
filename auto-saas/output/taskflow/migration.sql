-- ═══════════════════════════════════════════════════════════════
-- AUTO-SAAS BUILDER - SQL Migration
-- Blueprint: TaskFlow (taskflow)
-- Generated: 2025-12-08T11:41:55.593Z
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- Table: tasks
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Row Level Security for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_org_isolation" ON tasks
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true));

-- ═══════════════════════════════════════════════════════════════
-- End of migration for taskflow
-- ═══════════════════════════════════════════════════════════════
