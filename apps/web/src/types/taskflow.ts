// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - TypeScript Types
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08T11:41:55.594Z
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Tasks
// ═══════════════════════════════════════════════════════════════

export interface Tasks {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: Date | null;
  assigned_to: string | null;
  created_at: Date;
  updated_at: Date;
}

export const TasksSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  due_date: z.coerce.date().nullable(),
  assigned_to: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const NewTasksSchema = TasksSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

