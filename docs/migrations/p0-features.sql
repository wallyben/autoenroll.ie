-- P0 Features Database Migration
-- Creates tables for staging dates and enrolment history tracking

-- Staging Date Configurations Table
CREATE TABLE IF NOT EXISTS staging_date_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'BI_ANNUALLY', 'ANNUALLY')),
  dates JSONB NOT NULL, -- Array of day-of-month values (1-31)
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one active config per user at a time
  CONSTRAINT unique_active_config EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(effective_from, COALESCE(effective_to, 'infinity'::timestamp)) WITH &&
  )
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staging_config_user 
  ON staging_date_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_staging_config_effective 
  ON staging_date_configs(user_id, effective_from, effective_to);

-- Enrolment History Table
CREATE TABLE IF NOT EXISTS enrolment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'AUTO_ENROLLED',
    'OPTED_OUT',
    'RE_ENROLLED',
    'MANUALLY_ENROLLED',
    'EMPLOYMENT_ENDED',
    'BECAME_INELIGIBLE'
  )),
  event_date TIMESTAMP NOT NULL,
  contribution_phase INTEGER CHECK (contribution_phase BETWEEN 1 AND 4),
  contribution_rate DECIMAL(5,2) CHECK (contribution_rate >= 0 AND contribution_rate <= 100),
  opt_out_window_end TIMESTAMP,
  next_re_enrolment_date TIMESTAMP,
  refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enrolment_employee 
  ON enrolment_history(employee_id, user_id);

CREATE INDEX IF NOT EXISTS idx_enrolment_user 
  ON enrolment_history(user_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_enrolment_event_type 
  ON enrolment_history(user_id, event_type);

CREATE INDEX IF NOT EXISTS idx_enrolment_re_enrolment_due 
  ON enrolment_history(user_id, next_re_enrolment_date) 
  WHERE event_type = 'OPTED_OUT' AND next_re_enrolment_date IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE staging_date_configs IS 'Employer-specific staging date configurations for auto-enrolment alignment';
COMMENT ON COLUMN staging_date_configs.frequency IS 'How often staging dates occur: MONTHLY, QUARTERLY, BI_ANNUALLY, ANNUALLY';
COMMENT ON COLUMN staging_date_configs.dates IS 'Array of day-of-month values when staging dates occur (JSON array)';
COMMENT ON COLUMN staging_date_configs.effective_from IS 'When this configuration becomes active';
COMMENT ON COLUMN staging_date_configs.effective_to IS 'Optional end date for temporary configurations';

COMMENT ON TABLE enrolment_history IS 'Complete audit trail of employee enrolment lifecycle events';
COMMENT ON COLUMN enrolment_history.event_type IS 'Type of enrolment event: AUTO_ENROLLED, OPTED_OUT, RE_ENROLLED, etc.';
COMMENT ON COLUMN enrolment_history.opt_out_window_end IS 'Date when 6-month opt-out window closes (for OPTED_OUT events)';
COMMENT ON COLUMN enrolment_history.next_re_enrolment_date IS 'Date when employee should be re-enrolled (3 years after opt-out)';
COMMENT ON COLUMN enrolment_history.refund_amount IS 'Total refund amount for opt-outs (employee + employer contributions)';
