# AutoEnroll.ie - Production Launch Checklist

## Pre-Launch Checklist

Complete this checklist before launching AutoEnroll.ie to production. Check off each item as you complete it.

---

## 1. Infrastructure Setup

### Database (Supabase)

- [ ] Production database created in EU region (eu-west-1)
- [ ] Strong database password generated (32+ chars)
- [ ] Connection pooling enabled
- [ ] Prisma migrations deployed successfully
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Database backups configured (daily)
- [ ] Point-in-time recovery enabled
- [ ] Database size < 80% of plan limit

**Verification**:
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\""
# Should return: 0 (or existing test users)
```

### Backend (Railway)

- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] Build command configured: `pnpm install && pnpm build`
- [ ] Start command configured: `node dist/index.js`
- [ ] Health check endpoint configured: `/health`
- [ ] Custom domain configured: `api.autoenroll.ie`
- [ ] SSL certificate issued and active
- [ ] Environment variables set (see checklist below)
- [ ] Deployment successful (no errors in logs)
- [ ] Health check passing

**Verification**:
```bash
curl https://api.autoenroll.ie/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Frontend (Vercel)

- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Build command configured: `pnpm build`
- [ ] Framework preset: Next.js
- [ ] Custom domains configured: `autoenroll.ie`, `www.autoenroll.ie`
- [ ] SSL certificates issued and active
- [ ] Environment variables set (see checklist below)
- [ ] Deployment successful
- [ ] Homepage loading correctly

**Verification**:
```bash
curl -I https://autoenroll.ie
# Expected: HTTP/2 200
```

---

## 2. Environment Variables

### Backend (Railway) - ALL REQUIRED

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DATABASE_URL` (Supabase connection string with pooling)
- [ ] `DATABASE_DIRECT_URL` (Supabase direct connection)
- [ ] `JWT_SECRET` (64+ chars, generated with openssl)
- [ ] `JWT_REFRESH_SECRET` (64+ chars, different from JWT_SECRET)
- [ ] `JWT_ACCESS_EXPIRY=15m`
- [ ] `JWT_REFRESH_EXPIRY=7d`
- [ ] `STRIPE_SECRET_KEY` (sk_live_*, NOT sk_test_*)
- [ ] `STRIPE_PUBLISHABLE_KEY` (pk_live_*, NOT pk_test_*)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_*, from live webhook)
- [ ] `CORS_ORIGIN=https://autoenroll.ie,https://www.autoenroll.ie`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX=100`
- [ ] `LOG_LEVEL=info` (NOT debug)
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `ALLOWED_MIME_TYPES=text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Verification**:
```bash
railway variables | grep "NODE_ENV"
# Expected: production
```

### Frontend (Vercel) - ALL REQUIRED

- [ ] `NEXT_PUBLIC_API_URL=https://api.autoenroll.ie` (NO trailing slash)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_*, matches backend)
- [ ] `NEXT_PUBLIC_ENV=production`

**Verification**:
```bash
# Check frontend source for correct API URL
curl https://autoenroll.ie | grep "api.autoenroll.ie"
```

---

## 3. Stripe Configuration

### Stripe Account Setup

- [ ] Stripe account activated (not in test mode)
- [ ] Business details completed
- [ ] Bank account connected for payouts
- [ ] Statement descriptor set: "AUTOENROLL.IE"
- [ ] Customer email receipts enabled
- [ ] Live API keys generated (pk_live_*, sk_live_*)
- [ ] Live keys copied to Railway/Vercel

**Verification**:
```bash
# Test mode should be OFF
# Go to: https://dashboard.stripe.com
# Top-right toggle: "Test mode" should be OFF
```

### Stripe Products & Prices

- [ ] Product created: "Auto-Enrolment Report"
- [ ] Price created: €49.00 one-time
- [ ] Price ID copied to backend code (if needed)
- [ ] Product description set
- [ ] Product images uploaded (optional)

**Verification**:
```bash
# Go to: https://dashboard.stripe.com/products
# Should see: "Auto-Enrolment Report" - €49.00
```

### Stripe Webhooks

- [ ] Webhook endpoint added: `https://api.autoenroll.ie/api/billing/webhook`
- [ ] Events configured:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Webhook signing secret copied to Railway: `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook endpoint status: Active (not failing)

**Verification**:
```bash
# Send test webhook from Stripe Dashboard
# Check Railway logs: railway logs --filter "webhook"
# Should see: "Webhook received: checkout.session.completed"
```

---

## 4. DNS & SSL Configuration

### DNS (Cloudflare)

- [ ] Domain added to Cloudflare: `autoenroll.ie`
- [ ] Nameservers updated at registrar
- [ ] DNS propagation complete (24-48 hours)
- [ ] CNAME records configured:
  - [ ] `autoenroll.ie` → `cname.vercel-dns.com` (Proxied)
  - [ ] `www.autoenroll.ie` → `cname.vercel-dns.com` (Proxied)
  - [ ] `api.autoenroll.ie` → `autoenroll-ie-backend.up.railway.app` (Proxied)
- [ ] MX records configured (if using email)

**Verification**:
```bash
# Check DNS resolution
dig autoenroll.ie
dig www.autoenroll.ie
dig api.autoenroll.ie

# All should resolve to Cloudflare IPs
```

### SSL/TLS (Cloudflare)

- [ ] SSL/TLS encryption mode: Full (strict)
- [ ] Always Use HTTPS: ON
- [ ] Minimum TLS Version: 1.2
- [ ] Automatic HTTPS Rewrites: ON
- [ ] SSL certificates issued by Cloudflare
- [ ] Edge certificates active (check Cloudflare dashboard)

**Verification**:
```bash
# Test SSL
curl -I https://autoenroll.ie
# Expected: HTTP/2 200, no certificate errors

# Test HSTS header
curl -I https://api.autoenroll.ie | grep -i "strict-transport-security"
# Expected: strict-transport-security: max-age=31536000; includeSubDomains; preload
```

---

## 5. Security Hardening

### Security Headers

- [ ] CSP headers configured (Content-Security-Policy)
- [ ] HSTS enabled (Strict-Transport-Security)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin

**Verification**:
```bash
# Test all security headers
curl -I https://api.autoenroll.ie

# Expected headers:
# content-security-policy: default-src 'self'; script-src 'self' https://js.stripe.com; ...
# strict-transport-security: max-age=31536000; includeSubDomains; preload
# x-frame-options: DENY
# x-content-type-options: nosniff
# x-xss-protection: 1; mode=block
```

### Rate Limiting

- [ ] Rate limiting middleware active
- [ ] Auth routes: 5 req/min
- [ ] Upload routes: 10 req/min
- [ ] Validation routes: 20 req/min
- [ ] Payment routes: 3 req/5min
- [ ] Standard routes: 100 req/15min
- [ ] Expensive operations: 5 req/min

**Verification**:
```bash
# Test rate limiting (login endpoint - 5 req/min)
for i in {1..10}; do
  curl -X POST https://api.autoenroll.ie/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done

# Expected: First 5 requests → 401 Unauthorized (wrong credentials)
#           Requests 6-10 → 429 Too Many Requests
```

### CORS Configuration

- [ ] CORS whitelist configured (no wildcards)
- [ ] Allowed origins: `https://autoenroll.ie`, `https://www.autoenroll.ie`
- [ ] Credentials enabled: `Access-Control-Allow-Credentials: true`
- [ ] Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- [ ] Preflight requests handled

**Verification**:
```bash
# Test CORS from allowed origin
curl -H "Origin: https://autoenroll.ie" https://api.autoenroll.ie/health
# Expected: Access-Control-Allow-Origin: https://autoenroll.ie

# Test CORS from disallowed origin
curl -H "Origin: https://evil.com" https://api.autoenroll.ie/health
# Expected: No Access-Control-Allow-Origin header
```

### Database Security

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Users can only access their own data
- [ ] SQL injection tests passed
- [ ] Prepared statements used for all queries
- [ ] No raw SQL with user input

**Verification**:
```sql
-- Test RLS policies
-- In Supabase SQL Editor:
SELECT * FROM "User" WHERE id != auth.uid()::text;
-- Expected: 0 rows (users can't see other users' data)
```

---

## 6. Zero-Retention Architecture Verification

### No Disk Writes

- [ ] Multer configured with `memoryStorage` (not `diskStorage`)
- [ ] No `fs.writeFile` calls in upload pipeline
- [ ] No `fs.createWriteStream` calls in parser
- [ ] All processing from `req.file.buffer`
- [ ] Parsed data from `Buffer`, not file path

**Verification**:
```bash
# Check upload controller
grep -r "diskStorage" packages/backend/src/controllers/upload.controller.ts
# Expected: No matches

# Check parser service
grep -r "fs.writeFile\|fs.createWriteStream" packages/backend/src/services/parser.service.ts
# Expected: No matches
```

### Buffer-Based Processing

- [ ] CSV parsing: `Readable.from(buffer)`
- [ ] XLSX parsing: `XLSX.read(buffer, {type: 'buffer'})`
- [ ] Validation: `processAndValidateBuffer(fileBuffer)`
- [ ] No file paths passed to processing functions

**Verification**:
```bash
# Test upload flow (10 rows)
# Upload should complete without creating any files
# Check Railway logs: railway logs --filter "in-memory"
# Should see: "Processing file in-memory", "Parsed X rows from buffer"
```

### Automatic Cleanup

- [ ] No manual cleanup required (garbage collection handles it)
- [ ] Buffer references released after processing
- [ ] No lingering file handles
- [ ] Memory usage returns to baseline after upload

**Verification**:
```bash
# Monitor memory usage during upload
# Railway Dashboard → Metrics → Memory
# Should see: Spike during upload, return to baseline after
```

---

## 7. Functional Testing

### Authentication Flow

- [ ] User registration works
  - [ ] Email validation
  - [ ] Password strength validation
  - [ ] JWT token issued
  - [ ] Refresh token issued
- [ ] User login works
  - [ ] Correct credentials accepted
  - [ ] Wrong credentials rejected
  - [ ] Rate limiting works (5 attempts/min)
- [ ] Token refresh works
  - [ ] Valid refresh token accepted
  - [ ] Expired token rejected
  - [ ] New access token issued
- [ ] Password reset works
  - [ ] Reset email sent
  - [ ] Reset link valid
  - [ ] Password updated successfully

**Test Script**:
```bash
# Register new user
curl -X POST https://api.autoenroll.ie/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@autoenroll.ie","password":"Test123!@#","name":"Test User"}'

# Expected: {"token":"...","refreshToken":"...","user":{...}}
```

### Upload Flow

- [ ] File upload works (CSV)
- [ ] File upload works (XLSX)
- [ ] File size limit enforced (10MB)
- [ ] MIME type validation works
- [ ] Malformed files rejected
- [ ] Large files processed (5000 rows < 2 seconds)

**Test Script**:
```bash
# Upload test file (use test-data/sample-100-employees.csv)
curl -X POST https://api.autoenroll.ie/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-data/sample-100-employees.csv"

# Expected: {"uploadId":"...","fileName":"...","rowCount":100,"status":"uploaded"}
```

### Validation Flow

- [ ] Validation completes successfully
- [ ] Errors detected correctly (PPSN format, email, dates)
- [ ] Warnings generated (missing data)
- [ ] Security validation works (CSV injection, SQL injection, XSS)
- [ ] Results stored in database
- [ ] Results retrievable via API

**Test Script**:
```bash
# Get validation results
curl https://api.autoenroll.ie/api/validation/UPLOAD_ID/results \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: {"errors":[...],"warnings":[...],"validRowCount":...}
```

### Preview Flow

- [ ] Instant preview generates (3 samples)
- [ ] Employee names anonymised ([REDACTED])
- [ ] Salary bands displayed (€20k-€30k, etc.)
- [ ] Top 5 issues aggregated
- [ ] Preview modal displays correctly
- [ ] €49 unlock CTA visible

**Test Script**:
```bash
# Get instant preview
curl https://api.autoenroll.ie/api/validation/UPLOAD_ID/preview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: {"summary":{...},"employeeSamples":[3 items],"topIssues":[5 items]}
```

### Payment Flow

- [ ] Stripe checkout creates successfully
- [ ] Redirect to Stripe Checkout works
- [ ] Test payment completes (test card: 4242 4242 4242 4242)
- [ ] Webhook received (checkout.session.completed)
- [ ] Payment status updated in database
- [ ] User redirected to report page
- [ ] Full report unlocked

**Test Script**:
```bash
# Create checkout session
curl -X POST https://api.autoenroll.ie/api/billing/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uploadId":"UPLOAD_ID"}'

# Expected: {"checkoutUrl":"https://checkout.stripe.com/c/pay/...","sessionId":"..."}
```

### Report Generation

- [ ] Full report generates successfully
- [ ] PDF format valid
- [ ] All sections included:
  - [ ] Summary statistics
  - [ ] Employee list with eligibility
  - [ ] Contribution calculations
  - [ ] Risk assessment
  - [ ] Recommendations
- [ ] Report downloads correctly
- [ ] Report generation < 10 seconds (100 rows)

**Test Script**:
```bash
# Generate report
curl https://api.autoenroll.ie/api/validation/UPLOAD_ID/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o report.pdf

# Verify PDF
file report.pdf
# Expected: report.pdf: PDF document, version 1.4
```

---

## 8. Security Testing

### SQL Injection Tests

- [ ] Test injection in email: `' OR '1'='1`
- [ ] Test injection in PPSN: `1234567A'; DROP TABLE "User"; --`
- [ ] Test injection in name: `Robert'; DELETE FROM "Upload" WHERE '1'='1`
- [ ] All injection attempts blocked
- [ ] Security errors logged (not exposed to user)

**Test Script**:
```bash
# Test SQL injection in login
curl -X POST https://api.autoenroll.ie/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR '\''1'\''='\''1","password":"anything"}'

# Expected: 401 Unauthorized (not 500 Internal Server Error)
```

### XSS Tests

- [ ] Test script injection: `<script>alert('XSS')</script>`
- [ ] Test javascript: handler: `<img src=x onerror=alert('XSS')>`
- [ ] Test javascript: URL: `javascript:alert('XSS')`
- [ ] All XSS attempts sanitized
- [ ] No script execution in browser

**Test Script**:
```bash
# Test XSS in name field
curl -X POST https://api.autoenroll.ie/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"<script>alert(\"XSS\")</script>"}'

# Expected: Name should be sanitized (script tags removed)
```

### CSV Injection Tests

- [ ] Test formula injection: `=SUM(A1:A10)`
- [ ] Test command injection: `+cmd|' /C calc'!A1`
- [ ] Test DDE injection: `@SUM(A1:A10)`
- [ ] All CSV injection attempts blocked
- [ ] Formula characters stripped: `=`, `+`, `-`, `@`

**Test Script**:
```bash
# Create CSV with injection attempt
echo 'name,email,ppsn,salary
=1+1,test@test.com,1234567A,50000' > injection-test.csv

# Upload file
curl -X POST https://api.autoenroll.ie/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@injection-test.csv"

# Get validation results
# Expected: Formula character stripped from name field
```

### Rate Limiting Tests

- [ ] Auth rate limit: 5 req/min enforced
- [ ] Upload rate limit: 10 req/min enforced
- [ ] Payment rate limit: 3 req/5min enforced
- [ ] 429 status code returned
- [ ] Rate limit headers present (RateLimit-*)
- [ ] Rate limit resets after window

**Test Script**:
```bash
# Test auth rate limit (should fail on 6th request)
for i in {1..10}; do
  curl -w "\n%{http_code}\n" -X POST https://api.autoenroll.ie/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Expected:
# Requests 1-5: 401 Unauthorized
# Requests 6-10: 429 Too Many Requests
```

### CSRF Tests

- [ ] Cross-site requests blocked
- [ ] SameSite cookies: `strict`
- [ ] CSRF token validation (if implemented)
- [ ] Origin header validation

**Test Script**:
```bash
# Test cross-site request
curl -X POST https://api.autoenroll.ie/api/uploads \
  -H "Origin: https://evil.com" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.csv"

# Expected: CORS error (no Access-Control-Allow-Origin)
```

---

## 9. Performance Testing

### Load Testing

- [ ] Load test script created (`docs/load-test.js`)
- [ ] 100 concurrent users tested
- [ ] P95 response time < 2 seconds
- [ ] No errors under normal load
- [ ] Rate limiting works under load
- [ ] Database connections stable

**Test Script** (`docs/load-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Less than 10% failures
  },
};

export default function () {
  // Test health endpoint
  let res = http.get('https://api.autoenroll.ie/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```

**Run Test**:
```bash
# Install k6
brew install k6  # macOS

# Run load test
k6 run docs/load-test.js

# Expected output:
# ✓ status is 200
# ✓ response time < 2s
# http_req_duration.............: avg=250ms p(95)=500ms
# http_req_failed...............: 0.00%
```

### Upload Performance

- [ ] 100 rows: < 1 second
- [ ] 1000 rows: < 2 seconds
- [ ] 5000 rows: < 5 seconds
- [ ] No memory leaks
- [ ] No file system writes (zero-retention verified)

**Test Script**:
```bash
# Generate large test file (5000 rows)
cd test-data
node generate-test-data.js 5000

# Upload and time
time curl -X POST https://api.autoenroll.ie/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-data/sample-5000-employees.csv"

# Expected: < 5 seconds total
```

---

## 10. Monitoring & Observability

### Logging

- [ ] Backend logs visible in Railway
- [ ] Log level set to "info" (not "debug")
- [ ] No PII in logs (no PPSN, names, emails)
- [ ] Error stack traces logged (but not exposed to users)
- [ ] Security events logged (failed logins, injection attempts)
- [ ] Performance metrics logged (response times)

**Verification**:
```bash
# View logs
railway logs --filter "error"

# Check for PII leakage
railway logs | grep -i "ppsn\|@\|password"
# Expected: No matches (or only sanitized references)
```

### Uptime Monitoring

- [ ] UptimeRobot account created
- [ ] Backend health check: `https://api.autoenroll.ie/health` (5 min interval)
- [ ] Frontend health check: `https://autoenroll.ie` (5 min interval)
- [ ] Alert email configured
- [ ] Alert SMS configured (optional)

**Verification**:
```bash
# Go to: https://uptimerobot.com/dashboard
# Should see: 2 monitors (backend + frontend) - both UP
```

### Performance Monitoring

- [ ] Vercel Analytics enabled
- [ ] Vercel Speed Insights enabled
- [ ] Core Web Vitals monitored
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

**Verification**:
```bash
# Go to: Vercel Dashboard → Analytics
# Should see: Real-time page views, Core Web Vitals scores
```

### Error Tracking (Optional)

- [ ] Sentry account created
- [ ] Sentry SDK installed (backend)
- [ ] Sentry SDK installed (frontend)
- [ ] Source maps uploaded
- [ ] Error alerts configured

---

## 11. Documentation

### Internal Documentation

- [ ] `/docs/deployment.md` complete
- [ ] `/docs/environment-variables.md` complete
- [ ] `/docs/gdpr-zero-retention.md` complete
- [ ] `/docs/load-test.js` created
- [ ] `/PRODUCTION_CHECKLIST.md` complete (this file)
- [ ] README.md updated with production info
- [ ] API documentation complete
- [ ] Runbook for common issues

### User Documentation

- [ ] Help/FAQ page on website
- [ ] Upload guide (CSV/XLSX format)
- [ ] Pricing page clear (€49 one-off)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR data processing addendum
- [ ] Contact/support page

---

## 12. Legal & Compliance

### GDPR Compliance

- [ ] Privacy policy published
- [ ] Data processing agreement available
- [ ] Cookie consent banner (if using cookies)
- [ ] User data export function
- [ ] User data deletion function
- [ ] Data retention policy documented (zero retention!)
- [ ] DPA (Data Protection Authority) registration (if required in Ireland)

### Business Compliance

- [ ] Business registered in Ireland
- [ ] VAT registered (if applicable)
- [ ] Insurance (professional indemnity, cyber liability)
- [ ] Terms of service legally reviewed
- [ ] Refund policy clear
- [ ] Stripe account compliant (business verification)

---

## 13. Final Pre-Launch Checks

### Smoke Tests

- [ ] Register new account
- [ ] Login with new account
- [ ] Upload test file (100 rows)
- [ ] View instant preview (3 samples)
- [ ] Complete test payment (Stripe test card)
- [ ] Download full report
- [ ] Logout
- [ ] Password reset flow

**Full Flow Test** (10 minutes):
1. Open `https://autoenroll.ie` in incognito browser
2. Click "Get Started" → Register
3. Verify email (if email verification enabled)
4. Login → Upload → Preview → Pay → Report
5. Download report → Verify PDF
6. Logout → Close browser

### Go/No-Go Decision

**GO** if ALL of these are ✅:
- [ ] Backend health check passing
- [ ] Frontend loading correctly
- [ ] Database accessible
- [ ] Stripe payments working (test mode)
- [ ] Zero-retention verified (no disk writes)
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] SSL certificates valid
- [ ] DNS resolving correctly
- [ ] Full smoke test passed

**NO-GO** if ANY of these are ❌:
- [ ] Any critical security vulnerability
- [ ] Stripe live keys not working
- [ ] Database connection failing
- [ ] Files being written to disk (GDPR violation!)
- [ ] SSL certificate invalid
- [ ] Payment flow broken
- [ ] Critical functionality broken

---

## 14. Launch Day Tasks

### Pre-Launch (1 hour before)

- [ ] Final smoke test on production
- [ ] Backup database (even if empty)
- [ ] Screenshot all dashboard metrics (baseline)
- [ ] Alert team: "Launching in 1 hour"
- [ ] Disable maintenance mode (if any)

### Launch (T=0)

- [ ] Announce on social media (LinkedIn, Twitter)
- [ ] Email existing waitlist (if any)
- [ ] Update website with "Now Live" banner
- [ ] Monitor Railway logs (live view)
- [ ] Monitor UptimeRobot (should stay UP)
- [ ] Monitor Stripe Dashboard (for first payments)

### Post-Launch (first 24 hours)

- [ ] Monitor for errors (every 2 hours)
- [ ] Check uptime (should be 100%)
- [ ] Respond to user feedback/issues
- [ ] Monitor payment success rate
- [ ] Check database size growth
- [ ] Verify zero-retention (no files on disk)
- [ ] Check rate limiting logs (any DoS attempts?)

---

## 15. Post-Launch Optimization

### Week 1

- [ ] Analyze user behavior (Vercel Analytics)
- [ ] Optimize slow endpoints (if any)
- [ ] Address user feedback
- [ ] Fix any bugs discovered
- [ ] Tune rate limiting (if too strict/loose)
- [ ] Monitor costs (Railway/Supabase)

### Week 2-4

- [ ] Implement user feature requests
- [ ] A/B test pricing/copy (if traffic allows)
- [ ] SEO optimization
- [ ] Content marketing (blog posts)
- [ ] Reach out for testimonials
- [ ] Plan feature roadmap

---

## Emergency Contacts

| Service       | Support URL                      | Priority |
|---------------|----------------------------------|----------|
| Railway       | https://railway.app/help         | Critical |
| Vercel        | https://vercel.com/support       | Critical |
| Supabase      | https://supabase.com/support     | Critical |
| Stripe        | https://support.stripe.com       | High     |
| Cloudflare    | https://cloudflare.com/support   | Medium   |

---

## Rollback Plan

If critical issues occur post-launch:

1. **Immediate** (< 5 min):
   - Enable maintenance mode (Vercel custom 503 page)
   - Stop accepting new payments (pause Stripe products)

2. **Short-term** (< 30 min):
   - Rollback backend: Railway → Deployments → Previous version
   - Rollback frontend: Vercel → Deployments → Promote previous
   - Investigate issue in logs

3. **Long-term** (< 2 hours):
   - Fix issue in development
   - Test fix in staging
   - Deploy fix to production
   - Resume normal operations

---

## Success Criteria

**Launch is successful if:**
- ✅ Zero downtime in first 24 hours
- ✅ All smoke tests passing
- ✅ No critical security issues reported
- ✅ First payment processed successfully
- ✅ User feedback positive
- ✅ Core Web Vitals: Green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- ✅ P95 response time < 2 seconds
- ✅ Zero data retention verified (no files on disk)

---

## Sign-Off

Complete this section when ready to launch:

**Deployment Completed By**: _______________  
**Date**: _______________  
**Time**: _______________  

**Sign-offs**:
- [ ] Technical Lead: _______________
- [ ] Security Review: _______________
- [ ] Product Owner: _______________

**Production URL**: https://autoenroll.ie  
**Launch Version**: v1.0.0

---

**Status**: 🚀 READY FOR LAUNCH

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainer**: AutoEnroll.ie Team
