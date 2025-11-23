# AutoEnroll.ie - Environment Variables Reference

## Overview

Complete list of environment variables required for AutoEnroll.ie deployment. Variables are categorized by service and environment.

---

## Backend Environment Variables

### Required (Production)

```env
# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=production
PORT=3001

# ============================================
# DATABASE (PostgreSQL)
# ============================================
# Supabase connection string with connection pooling
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Direct connection (for migrations only)
DATABASE_DIRECT_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate with: openssl rand -base64 48
JWT_SECRET=<64_CHAR_SECRET>
JWT_REFRESH_SECRET=<64_CHAR_SECRET>

# Token expiry times
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ============================================
# STRIPE PAYMENTS (LIVE KEYS)
# ============================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Product IDs (create in Stripe Dashboard)
STRIPE_PRICE_ID_REPORT=price_xxxxxxxxxxxxxxxxxxxxx

# ============================================
# CORS CONFIGURATION
# ============================================
# Comma-separated list of allowed origins (NO TRAILING SLASH)
CORS_ORIGIN=https://autoenroll.ie,https://www.autoenroll.ie,https://app.autoenroll.ie

# ============================================
# RATE LIMITING
# ============================================
# Time window in milliseconds (15 minutes)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window
RATE_LIMIT_MAX=100

# ============================================
# LOGGING
# ============================================
# Log level: error, warn, info, debug
LOG_LEVEL=info

# ============================================
# FILE UPLOAD
# ============================================
# Maximum file size in bytes (10MB)
MAX_FILE_SIZE=10485760

# Allowed MIME types
ALLOWED_MIME_TYPES=text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

## Frontend Environment Variables

### Required (Production)

```env
# ============================================
# API CONFIGURATION
# ============================================
# Backend API URL (NO TRAILING SLASH)
NEXT_PUBLIC_API_URL=https://api.autoenroll.ie

# ============================================
# STRIPE CONFIGURATION
# ============================================
# Stripe publishable key (LIVE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# ============================================
# ENVIRONMENT
# ============================================
NEXT_PUBLIC_ENV=production

# ============================================
# ANALYTICS (Optional)
# ============================================
# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Vercel Analytics (auto-enabled in Vercel)
# No configuration needed
```

---

## Development Environment

### Backend (.env.development)

```env
NODE_ENV=development
PORT=3001

# Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autoenroll_dev
DATABASE_DIRECT_URL=postgresql://postgres:postgres@localhost:5432/autoenroll_dev

# Test JWT secrets (NEVER use in production)
JWT_SECRET=dev_secret_key_change_in_production_minimum_64_chars_required
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production_minimum_64_chars

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Stripe TEST keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_REPORT=price_xxxxxxxxxxxxxxxxxxxxx

# Development CORS
CORS_ORIGIN=http://localhost:3000

# Development rate limiting (more lenient)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000

# Debug logging
LOG_LEVEL=debug

# File upload
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_ENV=development
```

---

## Staging Environment

### Backend (Railway - Staging)

```env
NODE_ENV=staging
PORT=3001

# Staging database (separate from production)
DATABASE_URL=postgresql://postgres.staging:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres_staging

# Staging JWT secrets (different from production)
JWT_SECRET=<DIFFERENT_64_CHAR_SECRET>
JWT_REFRESH_SECRET=<DIFFERENT_64_CHAR_SECRET>

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Stripe TEST keys (use test mode in staging)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Staging CORS
CORS_ORIGIN=https://staging.autoenroll.ie

# Production-like rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

LOG_LEVEL=debug

MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Frontend (Vercel - Staging)

```env
NEXT_PUBLIC_API_URL=https://api-staging.autoenroll.ie
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_ENV=staging
```

---

## Secret Generation Guide

### JWT Secrets

```bash
# Generate 64-character random string
openssl rand -base64 48

# Example output:
# 3xK8mN2pQ7rS9vT1wU5yA6bC8dE0fG2hI4jK6lM8nO0pQ2rS4tU6vW8xY0zA2bC4d

# Use different secrets for:
# - JWT_SECRET (access tokens)
# - JWT_REFRESH_SECRET (refresh tokens)
# - Production vs Staging vs Development
```

### Stripe Keys

```bash
# 1. Go to: https://dashboard.stripe.com/apikeys
# 2. Toggle "Test mode" OFF for production keys
# 3. Copy "Publishable key": pk_live_xxxxx
# 4. Reveal and copy "Secret key": sk_live_xxxxx

# For webhooks:
# 5. Go to: https://dashboard.stripe.com/webhooks
# 6. Add endpoint: https://api.autoenroll.ie/api/billing/webhook
# 7. Select events: checkout.session.completed, customer.subscription.*
# 8. Copy "Signing secret": whsec_xxxxx
```

### Database Password

```bash
# Generate strong database password
openssl rand -base64 32

# Example output:
# 7kL9mN4pQ2rS8vT1wU6yA3bC0dE5fG1hI8jK4lM7nO2p
```

---

## Environment Variable Validation

### Backend Validation Script

Create `/packages/backend/src/utils/validate-env.ts`:

```typescript
import { logger } from './logger';

export function validateEnvironment(): void {
  const required = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CORS_ORIGIN',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  // Validate NODE_ENV
  if (!['development', 'staging', 'production'].includes(process.env.NODE_ENV!)) {
    throw new Error('NODE_ENV must be development, staging, or production');
  }

  // Validate Stripe keys match environment
  if (process.env.NODE_ENV === 'production') {
    if (process.env.STRIPE_SECRET_KEY!.startsWith('sk_test')) {
      throw new Error('Production environment must use live Stripe keys (sk_live_)');
    }
  }

  logger.info('Environment variables validated successfully');
}
```

### Run Validation

```typescript
// In packages/backend/src/index.ts
import { validateEnvironment } from './utils/validate-env';

validateEnvironment();
// ... rest of server setup
```

---

## Security Best Practices

### 1. Secret Rotation

```bash
# Rotate secrets every 90 days
# 1. Generate new secret
# 2. Update Railway/Vercel env vars
# 3. Redeploy application
# 4. Invalidate old tokens (JWT)

# For JWT rotation:
# - Update JWT_SECRET and JWT_REFRESH_SECRET simultaneously
# - All users will need to re-login
# - Notify users in advance
```

### 2. Secret Storage

```bash
# ✅ DO:
# - Store in Railway/Vercel env vars
# - Use 1Password/LastPass for team access
# - Encrypt .env files in version control (git-crypt)

# ❌ DON'T:
# - Commit .env files to git
# - Share secrets via Slack/email
# - Use same secrets across environments
# - Use test keys in production
```

### 3. Access Control

```bash
# Railway:
# - Limit team access to production project
# - Use separate projects for staging/dev
# - Enable audit logging

# Vercel:
# - Use "Environment Variable Scopes"
# - Production variables only visible to maintainers
# - Separate preview/development variables
```

---

## Troubleshooting

### Issue: "Missing DATABASE_URL"

```bash
# Check Railway env vars
railway variables

# Verify variable name (case-sensitive)
# Should be: DATABASE_URL (not database_url)

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "CORS policy blocked"

```bash
# Verify CORS_ORIGIN format
# ✅ Correct: https://autoenroll.ie (no trailing slash)
# ❌ Wrong: https://autoenroll.ie/ (with trailing slash)

# Verify protocol
# ✅ Correct: https://autoenroll.ie
# ❌ Wrong: http://autoenroll.ie (if using HTTPS)

# Check Railway logs
railway logs --filter "CORS"
```

### Issue: "JWT token invalid"

```bash
# Verify JWT_SECRET matches between:
# - Backend Railway env vars
# - Token generation and validation

# Check token expiry
# - JWT_ACCESS_EXPIRY: 15m (short-lived)
# - JWT_REFRESH_EXPIRY: 7d (long-lived)

# Verify JWT_SECRET length
echo -n "$JWT_SECRET" | wc -c
# Should be >= 32 characters
```

---

## Environment Variable Checklist

### Production Launch

- [ ] All DATABASE_URL variables set (connection pooling + direct)
- [ ] JWT secrets generated (64+ chars, unique)
- [ ] Stripe LIVE keys configured (not test)
- [ ] Stripe webhook secret from live webhook
- [ ] CORS_ORIGIN includes all production domains
- [ ] LOG_LEVEL set to "info" (not "debug")
- [ ] NODE_ENV set to "production"
- [ ] All secrets rotated from defaults
- [ ] No test/dev secrets in production
- [ ] Secrets stored in password manager
- [ ] Team access configured (Railway/Vercel)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainer**: AutoEnroll.ie Team
