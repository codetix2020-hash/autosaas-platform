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

