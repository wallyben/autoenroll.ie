-- Volume Pricing Bundles Migration
-- P1 Feature: Bulk report purchases with credit system

-- Bundles table: Track purchased report bundles
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bundle_size INTEGER NOT NULL CHECK (bundle_size IN (1, 10, 50, 200)),
  credits_total INTEGER NOT NULL CHECK (credits_total > 0),
  credits_remaining INTEGER NOT NULL CHECK (credits_remaining >= 0 AND credits_remaining <= credits_total),
  price_per_report INTEGER NOT NULL CHECK (price_per_report > 0), -- in cents
  total_paid INTEGER NOT NULL CHECK (total_paid > 0), -- in cents
  purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP, -- Optional: credits expire after 1 year
  stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'EXHAUSTED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Credit transactions table: Audit trail for all credit movements
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'USAGE', 'EXPIRY', 'REFUND')),
  credits INTEGER NOT NULL, -- Positive for additions, negative for usage
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  description TEXT,
  reference_id UUID, -- Link to upload or report generation
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_status ON bundles(status);
CREATE INDEX idx_bundles_expiry ON bundles(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_bundles_stripe_payment ON bundles(stripe_payment_intent_id);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_bundle_id ON credit_transactions(bundle_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE bundles IS 'P1 Feature: Volume pricing bundles for bulk report purchases';
COMMENT ON COLUMN bundles.credits_total IS 'Total credits purchased (e.g., 10 for 10-pack)';
COMMENT ON COLUMN bundles.credits_remaining IS 'Credits not yet used';
COMMENT ON COLUMN bundles.price_per_report IS 'Price per report in cents (e.g., 3900 = €39)';
COMMENT ON COLUMN bundles.expiry_date IS 'Optional: credits expire after 1 year from purchase';
COMMENT ON COLUMN bundles.status IS 'ACTIVE: has credits, EXHAUSTED: no credits, EXPIRED: past expiry_date';

COMMENT ON TABLE credit_transactions IS 'Audit trail for all bundle credit movements';
COMMENT ON COLUMN credit_transactions.credits IS 'Positive for purchase/refund, negative for usage';
COMMENT ON COLUMN credit_transactions.balance_after IS 'Total user balance after this transaction';
COMMENT ON COLUMN credit_transactions.reference_id IS 'Links to upload_id for report generation usage';

-- Function to automatically update bundle status when credits exhausted
CREATE OR REPLACE FUNCTION update_bundle_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.credits_remaining = 0 AND NEW.status = 'ACTIVE' THEN
    NEW.status := 'EXHAUSTED';
  END IF;
  
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < NOW() AND NEW.status = 'ACTIVE' THEN
    NEW.status := 'EXPIRED';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bundle_status
  BEFORE UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_bundle_status();

-- Function to check for expired bundles (run daily via cron/scheduler)
CREATE OR REPLACE FUNCTION expire_old_bundles()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE bundles
  SET status = 'EXPIRED',
      updated_at = NOW()
  WHERE status = 'ACTIVE'
    AND expiry_date IS NOT NULL
    AND expiry_date < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log expiry transactions
  INSERT INTO credit_transactions (user_id, bundle_id, transaction_type, credits, balance_after, description)
  SELECT 
    user_id,
    id,
    'EXPIRY',
    -credits_remaining,
    0, -- Balance calculation would need to be done per user
    'Credits expired after 1 year'
  FROM bundles
  WHERE status = 'EXPIRED'
    AND id IN (
      SELECT id FROM bundles
      WHERE status = 'EXPIRED'
      AND updated_at >= NOW() - INTERVAL '1 minute' -- Just expired
    );
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_old_bundles IS 'Scheduled function to expire bundles past their expiry_date';
