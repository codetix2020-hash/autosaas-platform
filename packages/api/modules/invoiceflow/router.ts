// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - Module Router
// Blueprint: InvoiceFlow (invoiceflow)
// Generated: 2025-12-07T23:57:22.343Z
// ═══════════════════════════════════════════════════════════════

// Import procedures from ./procedures
import * as procedures from "./procedures";

export const invoiceflowRouter = {
	invoices: {
		list: procedures.listInvoices,
		create: procedures.createInvoices,
		update: procedures.updateInvoices,
		delete: procedures.deleteInvoices,
	},
	invoice_items: {
		list: procedures.listInvoiceItems,
		create: procedures.createInvoiceItems,
		// update: procedures.updateInvoiceItems,
		// delete: procedures.deleteInvoiceItems,
	},
	invoice_clients: {
		list: procedures.listInvoiceClients,
		create: procedures.createInvoiceClients,
		// update: procedures.updateInvoiceClients,
		// delete: procedures.deleteInvoiceClients,
	},
};
