# AutoEnroll.ie - Production Deployment Guide

## Overview

This guide covers deploying AutoEnroll.ie to production infrastructure. The recommended stack:

- **Frontend**: Vercel (Next.js optimized, global CDN)
- **Backend**: Railway (Node.js, PostgreSQL)
- **Database**: Supabase PostgreSQL (managed, backups)
- **Payments**: Stripe (already configured)
- **DNS/CDN**: Cloudflare (optional but recommended)

**Estimated Monthly Cost**: €30-50 for <1000 users/month

---

## Prerequisites

Before deployment, ensure you have:

- [x] Domain name: `autoenroll.ie` (DNS access required)
- [x] GitHub repository with latest code
- [x] Stripe account (live keys)
- [x] Vercel account
- [x] Railway account
- [x] Supabase account (or Railway PostgreSQL)

---

## 1. Database Deployment (Supabase)

### Step 1.1: Create Supabase Project

```bash
# Go to: https://supabase.com/dashboard
# Click "New Project"
# Name: autoenroll-ie-production
# Region: Europe (Ireland) - eu-west-1
# Database Password: <STRONG_PASSWORD>
```

### Step 1.2: Get Connection String

```bash
# In Supabase Dashboard → Settings → Database
# Copy "Connection string" under "Connection pooling"
# Format: postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### Step 1.3: Run Prisma Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

# Run migrations
cd /workspaces/autoenroll.ie/packages/backend
pnpm prisma migrate deploy

# Verify
pnpm prisma db push
```

### Step 1.4: Enable Row Level Security (RLS)

```sql
-- In Supabase SQL Editor, run:

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Upload" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ValidationResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can view own uploads" ON "Upload"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own validations" ON "ValidationResult"
  FOR SELECT
  USING (auth.uid()::text IN (SELECT "userId" FROM "Upload" WHERE id = "uploadId"));
```

---

## 2. Backend Deployment (Railway)

### Step 2.1: Create Railway Project

```bash
# Go to: https://railway.app/new
# Click "Deploy from GitHub repo"
# Select: autoenroll-ie repository
# Choose: packages/backend directory
```

### Step 2.2: Configure Environment Variables

In Railway Dashboard → Variables:

```env
# Node Environment
NODE_ENV=production
PORT=3001

# Database (from Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# JWT Authentication
JWT_SECRET=<GENERATE_STRONG_SECRET_64_CHARS>
JWT_REFRESH_SECRET=<GENERATE_STRONG_SECRET_64_CHARS>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Stripe (LIVE KEYS - not test!)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# CORS (Frontend URL)
CORS_ORIGIN=https://autoenroll.ie,https://www.autoenroll.ie

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

**Generate Secrets**:
```bash
# JWT secrets (64 chars)
openssl rand -base64 48

# Stripe webhook secret: Get from Stripe Dashboard → Webhooks
```

### Step 2.3: Configure Railway Settings

In Railway → Settings:

- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `node dist/index.js`
- **Health Check Path**: `/health`
- **Region**: Europe West (GCP europe-west1)

### Step 2.4: Deploy

```bash
# Railway auto-deploys on git push
git push origin main

# Check logs
railway logs
```

### Step 2.5: Get Backend URL

```bash
# In Railway Dashboard → Settings → Domains
# Generate domain: autoenroll-ie-backend.up.railway.app
# OR add custom domain: api.autoenroll.ie
```

---

## 3. Frontend Deployment (Vercel)

### Step 3.1: Create Vercel Project

```bash
# Go to: https://vercel.com/new
# Import Git Repository: autoenroll-ie
# Framework Preset: Next.js
# Root Directory: packages/frontend
```

### Step 3.2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Backend API URL (Railway URL)
NEXT_PUBLIC_API_URL=https://api.autoenroll.ie

# Stripe Publishable Key (LIVE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Environment
NEXT_PUBLIC_ENV=production
```

### Step 3.3: Configure Build Settings

In Vercel → Settings → Build & Development:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Development Command**: `pnpm dev`

### Step 3.4: Deploy

```bash
# Vercel auto-deploys on git push
git push origin main

# Or manual deploy
cd packages/frontend
vercel --prod
```

### Step 3.5: Custom Domain

In Vercel → Settings → Domains:

1. Add domain: `autoenroll.ie`
2. Add domain: `www.autoenroll.ie`
3. Set `autoenroll.ie` as primary
4. Add DNS records (see Section 5)

---

## 4. Stripe Configuration

### Step 4.1: Switch to Live Mode

In Stripe Dashboard:
1. Toggle "Test mode" → OFF
2. Copy live keys to Railway/Vercel env vars

### Step 4.2: Configure Webhooks

```bash
# Stripe Dashboard → Developers → Webhooks
# Click "Add endpoint"
# Endpoint URL: https://api.autoenroll.ie/api/billing/webhook
# Events to send:
#   - checkout.session.completed
#   - customer.subscription.created
#   - customer.subscription.updated
#   - customer.subscription.deleted
#   - invoice.payment_succeeded
#   - invoice.payment_failed

# Copy webhook signing secret → Railway env: STRIPE_WEBHOOK_SECRET
```

### Step 4.3: Configure Payment Settings

```bash
# Stripe Dashboard → Settings → Payments
# Accept: Card payments
# Statement descriptor: "AUTOENROLL.IE"
# Customer emails: "Send receipt emails"
```

### Step 4.4: Create Product & Price

```bash
# Stripe Dashboard → Products → Add product
# Name: "Auto-Enrolment Report"
# Description: "Comprehensive auto-enrolment compliance report"
# Price: €49.00 one-time

# Copy Price ID → Update backend code if needed
```

---

## 5. DNS Configuration (Cloudflare)

### Step 5.1: Add Domain to Cloudflare

```bash
# Go to: https://dash.cloudflare.com
# Add a Site → autoenroll.ie
# Copy Cloudflare nameservers
# Update nameservers at domain registrar
```

### Step 5.2: Configure DNS Records

In Cloudflare DNS:

```dns
# Frontend (Vercel)
CNAME  autoenroll.ie      cname.vercel-dns.com  (Proxied ✓)
CNAME  www                cname.vercel-dns.com  (Proxied ✓)

# Backend (Railway)
CNAME  api                autoenroll-ie-backend.up.railway.app  (Proxied ✓)

# Email (if needed)
MX     @                  mail.autoenroll.ie    Priority: 10
```

### Step 5.3: Enable SSL/TLS

In Cloudflare → SSL/TLS:

- **Encryption mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Minimum TLS Version**: 1.2
- **Automatic HTTPS Rewrites**: ON
- **Certificate**: Let's Encrypt (auto-issued)

### Step 5.4: Configure Firewall Rules

In Cloudflare → Security → WAF:

```javascript
// Block non-European traffic (optional)
(ip.geoip.continent ne "EU" and ip.geoip.country ne "IE" and ip.geoip.country ne "GB")

// Block known bad bots
(cf.bot_management.score lt 30)

// Rate limit aggressive crawlers
(cf.threat_score gt 10 and http.request.uri.path contains "/api/")
```

---

## 6. Post-Deployment Verification

### Step 6.1: Health Checks

```bash
# Backend health
curl https://api.autoenroll.ie/health
# Expected: {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}

# Frontend health
curl https://autoenroll.ie
# Expected: HTTP 200, HTML response
```

### Step 6.2: Test Upload Flow

1. Register account: `https://autoenroll.ie/register`
2. Login: `https://autoenroll.ie/login`
3. Upload test file (100 rows)
4. Verify instant preview (3 samples)
5. Test €49 payment (use Stripe test card: 4242 4242 4242 4242)
6. Download full report
7. Verify zero retention (no files on disk)

### Step 6.3: Security Audit

```bash
# Test CSP headers
curl -I https://api.autoenroll.ie | grep -i "content-security-policy"
# Expected: content-security-policy: default-src 'self'; ...

# Test HSTS
curl -I https://autoenroll.ie | grep -i "strict-transport-security"
# Expected: strict-transport-security: max-age=31536000; includeSubDomains; preload

# Test rate limiting
for i in {1..10}; do curl -X POST https://api.autoenroll.ie/api/auth/login; done
# Expected: 429 Too Many Requests after 5 attempts

# Test CORS
curl -H "Origin: https://evil.com" https://api.autoenroll.ie/api/auth/login
# Expected: No Access-Control-Allow-Origin header
```

### Step 6.4: Performance Testing

```bash
# Install k6
brew install k6  # macOS
# OR
sudo apt install k6  # Linux

# Run load test (see /docs/load-test.js)
k6 run docs/load-test.js

# Expected:
# - P95 response time < 2s
# - 0 errors for valid requests
# - Rate limiting working (429s expected)
```

---

## 7. Monitoring & Logging

### Step 7.1: Railway Logging

```bash
# View backend logs
railway logs --follow

# Filter errors
railway logs --filter "error"

# Export logs
railway logs --json > logs.json
```

### Step 7.2: Vercel Analytics

In Vercel Dashboard → Analytics:
- Enable "Web Analytics"
- Enable "Speed Insights"
- Monitor Core Web Vitals

### Step 7.3: Uptime Monitoring (UptimeRobot)

```bash
# Go to: https://uptimerobot.com
# Add Monitor:
#   - URL: https://api.autoenroll.ie/health
#   - Interval: 5 minutes
#   - Alert: Email on failure

# Add Monitor:
#   - URL: https://autoenroll.ie
#   - Interval: 5 minutes
```

### Step 7.4: Error Tracking (Sentry - Optional)

```bash
# Install Sentry
cd packages/backend
pnpm add @sentry/node

# Configure in backend
# See: /docs/sentry-setup.md
```

---

## 8. Backup & Disaster Recovery

### Step 8.1: Database Backups

Supabase auto-backups:
- **Frequency**: Daily (7 days retention)
- **Location**: EU region
- **Recovery**: Point-in-time restore

Manual backup:
```bash
# Export database
pg_dump -h aws-0-eu-west-1.pooler.supabase.com -U postgres -d postgres > backup.sql

# Import (if needed)
psql -h aws-0-eu-west-1.pooler.supabase.com -U postgres -d postgres < backup.sql
```

### Step 8.2: Code Backups

- **Primary**: GitHub repository
- **Branches**: `main` (production), `staging`, `dev`
- **Tags**: Tag each production release: `v1.0.0`, `v1.1.0`

```bash
# Tag release
git tag -a v1.0.0 -m "Production launch"
git push origin v1.0.0
```

### Step 8.3: Disaster Recovery Plan

**Scenario: Backend Failure**
1. Check Railway logs: `railway logs`
2. Rollback to previous deployment: Railway → Deployments → Rollback
3. If database issue: Restore from Supabase backup
4. ETA: 5-10 minutes

**Scenario: Frontend Failure**
1. Check Vercel logs
2. Rollback: Vercel → Deployments → Rollback
3. ETA: 2-5 minutes

**Scenario: Complete Infrastructure Loss**
1. Restore database from Supabase backup
2. Redeploy backend to Railway (auto-build from GitHub)
3. Redeploy frontend to Vercel (auto-build from GitHub)
4. Update DNS if needed
5. ETA: 30-60 minutes

---

## 9. Scaling Considerations

### Current Capacity (Estimated)

- **Backend**: 100 req/sec (Railway Starter)
- **Frontend**: Unlimited (Vercel CDN)
- **Database**: 100 connections (Supabase Free)
- **File Processing**: 10 concurrent uploads

### Scaling Thresholds

**Upgrade Backend (Railway Pro - €20/month) when:**
- > 1000 uploads/day
- Response time P95 > 2s
- CPU > 80% sustained

**Upgrade Database (Supabase Pro - €25/month) when:**
- > 10GB data
- > 100 concurrent connections
- Need point-in-time recovery > 7 days

**Add Backend Replicas when:**
- > 5000 uploads/day
- Need 99.9% uptime SLA

### Performance Optimization

```bash
# Enable Redis caching (Railway add-on)
railway add redis

# Configure in backend
REDIS_URL=redis://default:password@redis.railway.internal:6379
```

---

## 10. Cost Breakdown

### Monthly Costs (Estimated)

| Service        | Tier          | Cost    | Notes                     |
|----------------|---------------|---------|---------------------------|
| Vercel         | Hobby         | €0      | Free for personal projects|
| Railway        | Starter       | €5      | Includes PostgreSQL       |
| Supabase       | Free          | €0      | < 500MB, < 2GB bandwidth  |
| Stripe         | Pay-as-you-go | €0.25   | €0.25 + 1.4% per €49 sale |
| Cloudflare     | Free          | €0      | Unlimited bandwidth       |
| Domain         | Annual        | €10/yr  | autoenroll.ie             |
| **TOTAL**      |               | **€5-10/month** | < 1000 users    |

### Scaling Costs (1000-10000 uploads/month)

| Service        | Tier          | Cost    | Notes                     |
|----------------|---------------|---------|---------------------------|
| Vercel         | Pro           | €20     | Better performance        |
| Railway        | Pro           | €20     | 8GB RAM, more CPU         |
| Supabase       | Pro           | €25     | 8GB database, backups     |
| Stripe         | Pay-as-you-go | €50     | €0.25 per €49 sale        |
| Cloudflare     | Free          | €0      | Still free                |
| **TOTAL**      |               | **€115/month** | 1000-10000 users |

---

## 11. Rollback Procedure

### Quick Rollback (< 5 minutes)

```bash
# Backend (Railway)
# Go to: Railway Dashboard → Deployments
# Click previous successful deployment → "Redeploy"

# Frontend (Vercel)
# Go to: Vercel Dashboard → Deployments
# Click previous deployment → "Promote to Production"

# Database (if needed)
# Go to: Supabase Dashboard → Database → Backups
# Click "Restore" on last working backup
```

### Code Rollback (git)

```bash
# Find last working commit
git log --oneline

# Revert to commit
git revert <commit-hash>
git push origin main

# Railway/Vercel auto-deploys
```

---

## 12. Support & Troubleshooting

### Common Issues

**Issue: 502 Bad Gateway on API**
```bash
# Check Railway logs
railway logs --filter "error"

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Restart backend
railway up
```

**Issue: CORS Errors**
```bash
# Verify CORS_ORIGIN in Railway env vars
railway variables

# Should include: https://autoenroll.ie,https://www.autoenroll.ie
```

**Issue: Stripe Webhook Failures**
```bash
# Verify webhook secret in Railway
railway variables | grep STRIPE_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST https://api.autoenroll.ie/api/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'
```

### Emergency Contacts

- **Railway Support**: https://railway.app/help
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com

---

## 13. Security Checklist

Before going live, verify:

- [x] All environment variables set (no test/dev keys)
- [x] HTTPS enforced (HSTS enabled)
- [x] CSP headers configured
- [x] Rate limiting active on all endpoints
- [x] Stripe webhook secret configured
- [x] Database RLS enabled
- [x] CORS whitelist configured (no wildcard *)
- [x] JWT secrets rotated from defaults
- [x] Zero-retention verified (no disk writes)
- [x] Audit logging enabled
- [x] Error messages sanitized (no stack traces to users)
- [x] File upload limits enforced (10MB)
- [x] SQL injection tests passed
- [x] XSS tests passed
- [x] CSRF protection enabled (sameSite cookies)

---

## Next Steps

1. ✅ Complete this deployment guide
2. ✅ Deploy to staging environment first
3. ✅ Run full security audit
4. ✅ Load test with k6
5. ✅ Set up monitoring (UptimeRobot)
6. ✅ Configure DNS & SSL
7. ✅ Deploy to production
8. ✅ Smoke test all features
9. ✅ Announce launch 🚀

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainer**: AutoEnroll.ie Team
