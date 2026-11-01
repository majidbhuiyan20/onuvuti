-- ==============================================================================
-- Migration 002: Upgrade book_orders for Production Payment Security
-- Adds invoice_id, currency, download_token, download_count, verified_at
-- Replaces non-unique index with partial unique index to prevent double spending
-- ==============================================================================

ALTER TABLE book_orders
    ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'BDT',
    ADD COLUMN IF NOT EXISTS download_token TEXT,
    ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Allow transaction_id to be nullable for PENDING orders
ALTER TABLE book_orders
    ALTER COLUMN transaction_id DROP NOT NULL;

-- Allow payment_method to be nullable or have default for PENDING orders
ALTER TABLE book_orders
    ALTER COLUMN payment_method DROP NOT NULL;

-- Index for fast lookup by invoice_id
CREATE INDEX IF NOT EXISTS idx_book_orders_invoice_id ON book_orders(invoice_id);

-- Drop old non-unique index if it exists
DROP INDEX IF EXISTS idx_book_orders_trx;

-- Create partial unique index on transaction_id:
-- Ensures no two orders can claim the same non-empty transaction ID (prevents double-spending)
CREATE UNIQUE INDEX IF NOT EXISTS uq_book_orders_transaction_id 
ON book_orders(transaction_id) 
WHERE transaction_id IS NOT NULL AND transaction_id != '';
