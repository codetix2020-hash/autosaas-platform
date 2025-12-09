"use client";

import { useInvoices, useCreateInvoice, useDeleteInvoice } from "@/hooks/use-invoiceflow";
import { use } from "react";

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
}

export default function InvoiceFlowPage({ params }: PageProps) {
  use(params); // Resolve params promise
  const { data: invoices, isLoading } = useInvoices();
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async () => {
    try {
      await createInvoice.mutateAsync({
        client_name: "Nuevo Cliente",
        client_email: null,
        invoice_number: `INV-${Date.now()}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: null,
        status: "draft",
        subtotal: 0,
        tax_rate: 21,
        tax_amount: 0,
        total: 0,
        notes: null,
      } as any);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta factura?")) {
      try {
        await deleteInvoice.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Cargando facturas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📄 InvoiceFlow</h1>
          <p className="text-gray-500">Gestión de facturas</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={createInvoice.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {createInvoice.isPending ? "Creando..." : "+ Nueva Factura"}
        </button>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="grid gap-4">
          {invoices.map((invoice: any) => (
            <div
              key={invoice.id}
              className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{invoice.invoice_number}</h3>
                  <p className="text-gray-600">{invoice.client_name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(invoice.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : invoice.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                  <span className="font-bold">€{invoice.total?.toFixed(2) || "0.00"}</span>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay facturas todavía</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-blue-600 hover:underline"
          >
            Crear primera factura
          </button>
        </div>
      )}
    </div>
  );
}

