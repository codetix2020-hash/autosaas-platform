// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Zod Validation Schemas
// Blueprint: ReservasPro (reservas)
// Generated: 2025-12-08
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Bookings Schemas
// ═══════════════════════════════════════════════════════════════

export const BookingsSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  client_name: z.string().min(1),
  client_email: z.string().nullable().optional(),
  client_phone: z.string().nullable().optional(),
  date: z.string().optional(),
  status: z.string().min(1),
  notes: z.string().nullable().optional(),
  price: z.number().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateBookingsSchema = BookingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateBookingsSchema = BookingsSchema.partial().required({ id: true });

export type Bookings = z.infer<typeof BookingsSchema>;
export type CreateBookings = z.infer<typeof CreateBookingsSchema>;
export type UpdateBookings = z.infer<typeof UpdateBookingsSchema>;

// ═══════════════════════════════════════════════════════════════
// Services Schemas
// ═══════════════════════════════════════════════════════════════

export const ServicesSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  duration: z.number().int().optional(),
  price: z.number().optional(),
  is_active: z.boolean().optional(),
  color: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateServicesSchema = ServicesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateServicesSchema = ServicesSchema.partial().required({ id: true });

export type Services = z.infer<typeof ServicesSchema>;
export type CreateServices = z.infer<typeof CreateServicesSchema>;
export type UpdateServices = z.infer<typeof UpdateServicesSchema>;

// ═══════════════════════════════════════════════════════════════
// Professionals Schemas
// ═══════════════════════════════════════════════════════════════

export const ProfessionalsSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  name: z.string().min(1),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateProfessionalsSchema = ProfessionalsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateProfessionalsSchema = ProfessionalsSchema.partial().required({ id: true });

export type Professionals = z.infer<typeof ProfessionalsSchema>;
export type CreateProfessionals = z.infer<typeof CreateProfessionalsSchema>;
export type UpdateProfessionals = z.infer<typeof UpdateProfessionalsSchema>;

// ═══════════════════════════════════════════════════════════════
// WorkingHours Schemas
// ═══════════════════════════════════════════════════════════════

export const WorkingHoursSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  day_of_week: z.number().int().optional(),
  is_working: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
});

export const CreateWorkingHoursSchema = WorkingHoursSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateWorkingHoursSchema = WorkingHoursSchema.partial().required({ id: true });

export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type CreateWorkingHours = z.infer<typeof CreateWorkingHoursSchema>;
export type UpdateWorkingHours = z.infer<typeof UpdateWorkingHoursSchema>;

// ═══════════════════════════════════════════════════════════════
// Clients Schemas
// ═══════════════════════════════════════════════════════════════

export const ClientsSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string(),
  name: z.string().min(1),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  total_visits: z.number().int().optional(),
  last_visit: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateClientsSchema = ClientsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  organization_id: true,
});

export const UpdateClientsSchema = ClientsSchema.partial().required({ id: true });

export type Clients = z.infer<typeof ClientsSchema>;
export type CreateClients = z.infer<typeof CreateClientsSchema>;
export type UpdateClients = z.infer<typeof UpdateClientsSchema>;

