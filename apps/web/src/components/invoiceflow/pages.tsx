// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Next.js Pages
// Blueprint: InvoiceFlow (invoiceflow)
// Generated: 2025-12-07T23:57:21.041Z
// ═══════════════════════════════════════════════════════════════

// These are page templates. Copy them to:
// apps/web/app/(saas)/app/(organizations)/[organizationSlug]/invoiceflow/

"use client";

// ═══════════════════════════════════════════════════════════════
// Route: /invoiceflow
// Component: InvoiceFlowDashboard
// ═══════════════════════════════════════════════════════════════

export function InvoiceFlowDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">InvoiceFlowDashboard</h1>
      <p className="text-gray-500">Dashboard principal con resumen de facturas</p>
      {/* TODO: Implement InvoiceFlowDashboard */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Route: /invoiceflow/invoices
// Component: InvoicesList
// ═══════════════════════════════════════════════════════════════

export function InvoicesListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">InvoicesList</h1>
      <p className="text-gray-500">Lista de todas las facturas</p>
      {/* TODO: Implement InvoicesList */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Route: /invoiceflow/invoices/new
// Component: CreateInvoice
// ═══════════════════════════════════════════════════════════════

export function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CreateInvoice</h1>
      <p className="text-gray-500">Crear nueva factura</p>
      {/* TODO: Implement CreateInvoice */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Route: /invoiceflow/invoices/[id]
// Component: InvoiceDetail
// ═══════════════════════════════════════════════════════════════

export function InvoiceDetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">InvoiceDetail</h1>
      <p className="text-gray-500">Ver/editar factura</p>
      {/* TODO: Implement InvoiceDetail */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Route: /invoiceflow/clients
// Component: ClientsList
// ═══════════════════════════════════════════════════════════════

export function ClientsListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ClientsList</h1>
      <p className="text-gray-500">Lista de clientes</p>
      {/* TODO: Implement ClientsList */}
    </div>
  );
}

// Default export - main page
export default InvoiceFlowDashboardPage;
