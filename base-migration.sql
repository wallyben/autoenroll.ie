-- Base Database Migration
-- Creates the foundational tables including users table

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

-- Indexes for enrolment history
CREATE INDEX IF NOT EXISTS idx_enrolment_history_employee
  ON enrolment_history(employee_id);

CREATE INDEX IF NOT EXISTS idx_enrolment_history_user
  ON enrolment_history(user_id);

CREATE INDEX IF NOT EXISTS idx_enrolment_history_event_date
  ON enrolment_history(event_date);

CREATE INDEX IF NOT EXISTS idx_enrolment_history_event_type
  ON enrolment_history(event_type);