// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - TypeScript Types
// Blueprint: InvoiceFlow (invoiceflow)
// Generated: 2025-12-07T23:57:21.038Z
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Invoices
// ═══════════════════════════════════════════════════════════════

export interface Invoices {
  id: string;
  organization_id: string;
  client_name: string;
  client_email: string | null;
  invoice_number: string;
  issue_date: Date;
  due_date: Date | null;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export const InvoicesSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  client_name: z.string(),
  client_email: z.string().nullable(),
  invoice_number: z.string(),
  issue_date: z.coerce.date(),
  due_date: z.coerce.date().nullable(),
  status: z.string(),
  subtotal: z.number(),
  tax_rate: z.number(),
  tax_amount: z.number(),
  total: z.number(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const NewInvoicesSchema = InvoicesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// ═══════════════════════════════════════════════════════════════
// InvoiceItems
// ═══════════════════════════════════════════════════════════════

export interface InvoiceItems {
  id: string;
  invoice_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: Date;
}

export const InvoiceItemsSchema = z.object({
  id: z.string(),
  invoice_id: z.string().nullable(),
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total: z.number(),
  created_at: z.coerce.date(),
});

export const NewInvoiceItemsSchema = InvoiceItemsSchema.omit({
  id: true,
  created_at: true,
});

// ═══════════════════════════════════════════════════════════════
// InvoiceClients
// ═══════════════════════════════════════════════════════════════

export interface InvoiceClients {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  address: string | null;
  tax_id: string | null;
  created_at: Date;
}

export const InvoiceClientsSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  tax_id: z.string().nullable(),
  created_at: z.coerce.date(),
});

export const NewInvoiceClientsSchema = InvoiceClientsSchema.omit({
  id: true,
  created_at: true,
});

