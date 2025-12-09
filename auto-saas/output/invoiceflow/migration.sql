-- ═══════════════════════════════════════════════════════════════
-- AUTO-SAAS BUILDER - SQL Migration
-- Blueprint: InvoiceFlow (invoiceflow)
-- Generated: 2025-12-07T23:57:21.036Z
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- Table: invoices
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 21,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for invoices
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Row Level Security for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoices" ON invoices FOR ALL USING (organization_id IN (SELECT organization_id FROM members WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- Table: invoice_items
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoice items" ON invoice_items FOR ALL USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (SELECT organization_id FROM members WHERE user_id = auth.uid())));

-- ═══════════════════════════════════════════════════════════════
-- Table: invoice_clients
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invoice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for invoice_clients
ALTER TABLE invoice_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON invoice_clients FOR ALL USING (organization_id IN (SELECT organization_id FROM members WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- End of migration for invoiceflow
-- ═══════════════════════════════════════════════════════════════
