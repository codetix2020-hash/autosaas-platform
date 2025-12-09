// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Zod Validation Schemas
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Tasks Schemas
// ═══════════════════════════════════════════════════════════════

export const TasksSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.string().min(1),
  priority: z.string().nullable().optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateTasksSchema = TasksSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateTasksSchema = TasksSchema.partial().required({ id: true });

export type Tasks = z.infer<typeof TasksSchema>;
export type CreateTasks = z.infer<typeof CreateTasksSchema>;
export type UpdateTasks = z.infer<typeof UpdateTasksSchema>;

