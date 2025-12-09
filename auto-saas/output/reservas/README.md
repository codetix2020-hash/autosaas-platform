# ReservasPro

Sistema de gestión de reservas para peluquerías y salones de belleza

## 📋 Overview

- **ID:** `reservas`
- **Target Audience:** Peluquerías, barberías y salones de belleza
- **Pricing:** €29/mes
- **Generated:** 2025-12-08

## 🗄️ Database Schema

### bookings

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| organization_id | TEXT NOT NULL |
| client_id | UUID REFERENCES clients(id) |
| professional_id | UUID REFERENCES professionals(id) |
| service_id | UUID REFERENCES services(id) |
| client_name | TEXT NOT NULL |
| client_email | TEXT |
| client_phone | TEXT |
| date | DATE NOT NULL |
| start_time | TIME NOT NULL |
| end_time | TIME NOT NULL |
| status | TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) |
| notes | TEXT |
| price | DECIMAL(10,2) |
| created_at | TIMESTAMPTZ DEFAULT NOW() |
| updated_at | TIMESTAMPTZ DEFAULT NOW() |

### services

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| organization_id | TEXT NOT NULL |
| name | TEXT NOT NULL |
| description | TEXT |
| duration | INTEGER NOT NULL DEFAULT 30 |
| price | DECIMAL(10,2) NOT NULL DEFAULT 0 |
| is_active | BOOLEAN DEFAULT true |
| color | TEXT DEFAULT '#3B82F6' |
| created_at | TIMESTAMPTZ DEFAULT NOW() |
| updated_at | TIMESTAMPTZ DEFAULT NOW() |

### professionals

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| organization_id | TEXT NOT NULL |
| name | TEXT NOT NULL |
| email | TEXT |
| phone | TEXT |
| avatar_url | TEXT |
| specialties | TEXT |
| is_active | BOOLEAN DEFAULT true |
| created_at | TIMESTAMPTZ DEFAULT NOW() |
| updated_at | TIMESTAMPTZ DEFAULT NOW() |

### working_hours

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| organization_id | TEXT NOT NULL |
| professional_id | UUID REFERENCES professionals(id) |
| day_of_week | INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6) |
| start_time | TIME NOT NULL DEFAULT '09:00' |
| end_time | TIME NOT NULL DEFAULT '18:00' |
| is_working | BOOLEAN DEFAULT true |
| created_at | TIMESTAMPTZ DEFAULT NOW() |

### clients

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| organization_id | TEXT NOT NULL |
| name | TEXT NOT NULL |
| email | TEXT |
| phone | TEXT |
| notes | TEXT |
| total_visits | INTEGER DEFAULT 0 |
| last_visit | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ DEFAULT NOW() |
| updated_at | TIMESTAMPTZ DEFAULT NOW() |

## 🔧 API Endpoints

All endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservas/bookings` | List all bookings |
| POST | `/api/reservas/bookings` | Create booking |
| PUT | `/api/reservas/bookings/:id` | Update booking |
| DELETE | `/api/reservas/bookings/:id` | Delete booking |
| GET | `/api/reservas/services` | List all services |
| POST | `/api/reservas/services` | Create service |
| PUT | `/api/reservas/services/:id` | Update service |
| DELETE | `/api/reservas/services/:id` | Delete service |
| GET | `/api/reservas/professionals` | List all professionals |
| POST | `/api/reservas/professionals` | Create professional |
| PUT | `/api/reservas/professionals/:id` | Update professional |
| DELETE | `/api/reservas/professionals/:id` | Delete professional |
| GET | `/api/reservas/working_hours` | List all working_hours |
| POST | `/api/reservas/working_hours` | Create working_hour |
| PUT | `/api/reservas/working_hours/:id` | Update working_hour |
| DELETE | `/api/reservas/working_hours/:id` | Delete working_hour |
| GET | `/api/reservas/clients` | List all clients |
| POST | `/api/reservas/clients` | Create client |
| PUT | `/api/reservas/clients/:id` | Update client |
| DELETE | `/api/reservas/clients/:id` | Delete client |

## 🎣 React Hooks

```typescript
import {
  useBookings,
  useBooking,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useProfessionals,
  useProfessional,
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
  useWorkingHours,
  useWorkingHour,
  useCreateWorkingHour,
  useUpdateWorkingHour,
  useDeleteWorkingHour,
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '@/hooks/use-reservas';
```

## 🚀 Quick Start

1. Apply the SQL migration to your Supabase database
2. Run `pnpm dev` to start the development server
3. Navigate to `/app/[org]/reservas`

## 📁 File Structure

```
packages/api/modules/reservas/
├── procedures/index.ts    # CRUD procedures
└── router.ts              # oRPC router

apps/web/src/
├── types/reservas.ts           # TypeScript types
├── hooks/use-reservas.ts       # React Query hooks
└── components/reservas/        # React components
```

---
*Generated by Auto-SaaS God Mode*
