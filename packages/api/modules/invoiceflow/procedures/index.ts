// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - oRPC Procedures
// Blueprint: InvoiceFlow (invoiceflow)
// Generated: 2025-12-07T23:57:21.039Z
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════════════════
// Invoices Procedures
// ═══════════════════════════════════════════════════════════════

export const listInvoices = protectedProcedure
  .route({ method: "GET", path: "/invoiceflow/invoices/list" })
  .handler(async ({ context }) => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { data };
  });

export const createInvoices = protectedProcedure
  .route({ method: "POST", path: "/invoiceflow/invoices/create" })
  .input(z.object({ /* TODO: define input schema */ }))
  .handler(async ({ input, context }) => {
    const { data, error } = await supabase
      .from("invoices")
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  });

// ═══════════════════════════════════════════════════════════════
// UPDATE INVOICE
// ═══════════════════════════════════════════════════════════════

export const updateInvoices = protectedProcedure
  .route({ method: "PUT", path: "/invoiceflow/invoices/:id" })
  .input(
    z.object({
      id: z.string().uuid(),
      client_name: z.string().optional(),
      client_email: z.string().email().optional().nullable(),
      invoice_number: z.string().optional(),
      issue_date: z.string().optional(),
      due_date: z.string().optional().nullable(),
      status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
      subtotal: z.number().optional(),
      tax_rate: z.number().optional(),
      tax_amount: z.number().optional(),
      total: z.number().optional(),
      notes: z.string().optional().nullable(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, ...updateData } = input;
    const organizationId = context.session?.activeOrganizationId;

    if (!organizationId) {
      throw new Error("No active organization");
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      throw new Error(error.message);
    }

    return { data };
  });

// ═══════════════════════════════════════════════════════════════
// DELETE INVOICE
// ═══════════════════════════════════════════════════════════════

export const deleteInvoices = protectedProcedure
  .route({ method: "DELETE", path: "/invoiceflow/invoices/:id" })
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const organizationId = context.session?.activeOrganizationId;

    if (!organizationId) {
      throw new Error("No active organization");
    }

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", input.id)
      .eq("organization_id", organizationId);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw new Error(error.message);
    }

    return { success: true };
  });

// ═══════════════════════════════════════════════════════════════
// InvoiceItems Procedures
// ═══════════════════════════════════════════════════════════════

export const listInvoiceItems = protectedProcedure
  .route({ method: "GET", path: "/invoiceflow/invoice_items/list" })
  .handler(async ({ context }) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { data };
  });

export const createInvoiceItems = protectedProcedure
  .route({ method: "POST", path: "/invoiceflow/invoice_items/create" })
  .input(z.object({ /* TODO: define input schema */ }))
  .handler(async ({ input, context }) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  });

// ═══════════════════════════════════════════════════════════════
// InvoiceClients Procedures
// ═══════════════════════════════════════════════════════════════

export const listInvoiceClients = protectedProcedure
  .route({ method: "GET", path: "/invoiceflow/invoice_clients/list" })
  .handler(async ({ context }) => {
    const { data, error } = await supabase
      .from("invoice_clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { data };
  });

export const createInvoiceClients = protectedProcedure
  .route({ method: "POST", path: "/invoiceflow/invoice_clients/create" })
  .input(z.object({ /* TODO: define input schema */ }))
  .handler(async ({ input, context }) => {
    const { data, error } = await supabase
      .from("invoice_clients")
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  });

