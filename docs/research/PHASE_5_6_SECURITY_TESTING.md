# PHASE 5: SECURITY, GDPR & LEGAL (HARDENING)

## Threat Model

### T1: Data Breach
**Threat:** Attacker gains access to employee PII
**Mitigation (Current):** ✅ Zero-retention (no PII on disk), ✅ Memory-only processing, ✅ TLS 1.3, ✅ HSTS
**Additional:** Add encryption at rest for aggregated results, Add field-level encryption for staging date configs

### T2: SQL Injection
**Threat:** Attacker manipulates database queries
**Mitigation (Current):** ✅ Parameterized queries (Prisma), ✅ Input validation, ✅ SQL pattern detection
**Additional:** Add database firewall rules, Add query monitoring

### T3: CSV Injection
**Threat:** Malicious formula execution in downloaded CSV
**Mitigation (Current):** ✅ Formula character stripping (=, +, -, @), ✅ Control character removal
**Additional:** Add CSV export with formula prefix ('), Add warning on export

### T4: Session Hijacking
**Threat:** Attacker steals user session
**Mitigation (Current):** ✅ httpOnly cookies, ✅ SameSite=strict, ✅ 15min token expiry
**Additional:** Add session fingerprinting (IP + User-Agent), Add concurrent session limits

### T5: Rate Limit Bypass
**Threat:** Attacker bypasses rate limiting via IP rotation
**Mitigation (Current):** ✅ 6 specialized rate limiters, ✅ IP tracking
**Additional:** Add fingerprint-based limiting (beyond IP), Add CAPTCHA after 3 failures

### T6: Payment Fraud
**Threat:** Stolen cards, chargebacks
**Mitigation (Current):** ✅ Stripe Radar (built-in fraud detection), ✅ 3 req/5min payment limiter
**Additional:** Add email verification before payment, Add geo-blocking (non-EU cards)

## Risk Register

| Risk ID | Risk | Likelihood | Impact | Mitigation | Residual |
|---------|------|------------|--------|------------|----------|
| R1 | PII data breach | Very Low | Critical | Zero-retention | Low |
| R2 | Incorrect calculations | Low | High | Unit tests, manual QA | Low |
| R3 | Staging date misconfiguration | Medium | Medium | Validation, defaults | Low |
| R4 | Payment fraud | Low | Medium | Stripe Radar, rate limiting | Very Low |
| R5 | DoS attack | Medium | Low | Rate limiting, Cloudflare | Very Low |
| R6 | Insider threat | Very Low | High | Audit logging, access controls | Low |
| R7 | Supply chain attack | Low | Critical | Dependency scanning, SCA | Medium |

## GDPR Compliance Plan

### Data Processing Activities

**Activity 1: Upload Processing**
- Purpose: Parse and validate employee data
- Legal Basis: Legitimate interest (Art 6(1)(f))
- Data Processed: Name, DOB, PPSN, salary, employment dates
- Retention: <5 seconds (memory only)
- Security: TLS, zero-retention, pseudonymisation

**Activity 2: Report Generation**
- Purpose: Generate compliance report
- Legal Basis: Legitimate interest (Art 6(1)(f))
- Data Processed: Aggregated statistics, anonymized samples
- Retention: 30 days (user can delete anytime)
- Security: Encrypted storage, access controls

**Activity 3: Payment Processing**
- Purpose: Process €49 payment via Stripe
- Legal Basis: Contract performance (Art 6(1)(b))
- Data Processed: Email, payment method (tokenized)
- Retention: 7 years (Revenue requirement)
- Security: PCI-DSS compliant (Stripe)

### Data Subject Rights Implementation

**Right to Access (Art 15):**
- API: GET `/api/user/data` - Export all user data as JSON
- Timeline: Fulfilled within 30 days
- Includes: Upload history, reports, payment records

**Right to Rectification (Art 16):**
- API: PATCH `/api/user` - Update user details
- Timeline: Immediate
- Scope: Email, name (PII in reports cannot be changed - already deleted)

**Right to Erasure (Art 17):**
- API: DELETE `/api/user` - Delete account and all data
- Timeline: Immediate
- Scope: User account, upload metadata, reports (payments retained 7 years per law)

**Right to Data Portability (Art 20):**
- API: GET `/api/user/export` - JSON export of all data
- Format: JSON (machine-readable)
- Includes: Reports, calculations, metadata

**Right to Object (Art 21):**
- API: POST `/api/user/opt-out-marketing` - Stop marketing emails
- Timeline: Immediate
- Scope: Marketing only (service emails continue)

### Privacy Policy (Key Sections)

**1. Data We Collect**
- Employee data: Processed transiently (<5 sec), never stored
- User data: Email, payment info (via Stripe)
- Analytics: Anonymized usage stats

**2. How We Use Data**
- Compliance checking (primary purpose)
- Payment processing (Stripe)
- Service improvement (anonymized analytics)

**3. Data Retention**
- Employee PII: 0 days (zero-retention)
- Reports: 30 days (user-deletable)
- Payment records: 7 years (legal requirement)

**4. Data Sharing**
- Stripe: Payment processing (PCI-DSS compliant)
- No other third parties
- No data selling

**5. Your Rights**
- Access, rectify, erase, port, object
- Contact: privacy@autoenroll.ie
- Response time: 30 days

**6. Security**
- Zero-retention architecture
- TLS 1.3 encryption
- Regular security audits
- Incident response plan

**7. International Transfers**
- Data stays in EU (Ireland)
- Stripe (US): Standard Contractual Clauses

**8. Changes**
- Policy updates notified via email
- Last updated: [DATE]

### Data Processing Agreement (DPA) Template

**Parties:**
- Data Controller: Employer (customer)
- Data Processor: AutoEnroll.ie

**Subject Matter:**
- Automatic enrolment eligibility checking

**Nature of Processing:**
- Transient in-memory analysis of employee data

**Purpose:**
- Compliance with Irish automatic enrolment legislation

**Duration:**
- Per-transaction (report generation)

**Categories of Data:**
- Employee names, DOB, PPSN, salary, employment dates

**Special Categories:**
- None (DOB not considered special category for this purpose)

**Processor Obligations:**
- Process only on controller instructions
- Ensure confidentiality of personnel
- Implement appropriate security measures (zero-retention)
- Assist with DSAR responses
- Delete/return data on request (N/A - zero-retention)
- Notify breaches within 24 hours
- Allow audits

**Sub-Processors:**
- Stripe (payment processing) - approved
- Railway (hosting) - approved
- Supabase (database) - approved

**Security Measures:**
- Zero-retention architecture (no persistent storage of PII)
- TLS 1.3 encryption in transit
- Memory-only processing
- Audit logging (no PII)
- Access controls
- Regular penetration testing

### Audit Trail (What We Log)

**✅ DO LOG:**
- Upload events (timestamp, file size, row count)
- Validation results (error count, warning count)
- Payment events (amount, status, Stripe ID)
- User actions (login, report download)
- System errors (error type, timestamp)
- Security events (rate limit triggered, IP)

**❌ DON'T LOG:**
- Employee names
- Date of birth
- PPSN numbers
- Salary values
- Email addresses (employee)
- File contents
- Individual validation errors (only aggregated counts)

**Log Format:**
```json
{
  "timestamp": "2025-11-23T10:30:00Z",
  "event": "upload_processed",
  "userId": "user_abc123",
  "ip": "192.168.1.1",
  "rowsProcessed": 50,
  "rowsValid": 48,
  "rowsInvalid": 2,
  "errorCount": 5,
  "processingTimeMs": 1234
}
```

### Security Overview Document

**Encryption:**
- In Transit: TLS 1.3 (HTTPS only, HSTS enforced)
- At Rest: N/A (no PII stored)
- Database: Encrypted at rest (Supabase default)

**Access Controls:**
- Authentication: JWT (15min expiry)
- Authorization: User can only access own data
- Admin: Separate admin role (no access to user data)
- Database: Row-level security (RLS) enabled

**Incident Response:**
1. Detection: Automated monitoring (UptimeRobot, Sentry)
2. Containment: Kill affected services, rotate secrets
3. Investigation: Review logs, identify root cause
4. Notification: Email users within 24h if breach confirmed
5. Remediation: Patch vulnerability, restore service
6. Review: Post-incident review, update procedures

**Vulnerability Management:**
- Dependency scanning: Weekly (npm audit, Snyk)
- Penetration testing: Annually (external firm)
- Bug bounty: TBD (post-launch)
- Patching: Critical within 24h, High within 7 days

**Compliance:**
- GDPR: Compliant (zero-retention, DPA, privacy policy)
- PCI-DSS: Compliant via Stripe (no card data stored)
- ISO 27001: Not certified (overkill for size)
- SOC 2: Not certified (future consideration)

---

# PHASE 6: TESTING PLAN

## Unit Testing

### Backend Unit Tests (Target: 90% coverage)

**Eligibility Rules (`eligibility.service.test.ts`):**
```typescript
describe('Eligibility Calculation', () => {
  test('Age 23-60: eligible', ...)
  test('Age 22: ineligible', ...)
  test('Age 61: ineligible', ...)
  test('Salary €20k: eligible', ...)
  test('Salary €19k: ineligible', ...)
  test('6-month waiting period', ...)
  test('Staging date alignment', ...) // NEW
  test('Variable earnings projection', ...) // NEW
})
```

**Contribution Calculator (`contribution.service.test.ts`):**
```typescript
describe('Contribution Calculation', () => {
  test('Phase 1 rates: 1.5% + 1.5% + 0.5%', ...)
  test('Phase 2 rates: 3.0% + 3.0% + 0.5%', ...)
  test('Salary cap at €80k', ...)
  test('Salary below €20k: no contribution', ...)
  test('Rounding to nearest cent', ...)
})
```

**Opt-Out Validation (`opt-out.service.test.ts`):** // NEW
```typescript
describe('Opt-Out Window Validation', () => {
  test('Within 6 months: valid', ...)
  test('After 6 months: invalid', ...)
  test('Refund calculation', ...)
  test('Re-enrolment date calculation', ...)
})
```

**Staging Date Engine (`staging-dates.test.ts`):** // NEW
```typescript
describe('Staging Date Calculation', () => {
  test('Next quarterly staging date', ...)
  test('Next monthly staging date', ...)
  test('Auto-enrolment date = waiting period + staging', ...)
  test('Default staging config', ...)
})
```

**Security Module (`security.test.ts`):** ✅ COMPLETE (15/15 passing)

### Frontend Unit Tests (Target: 80% coverage)

**Components:**
- InstantPreview.test.tsx (preview modal)
- StagingDatePicker.test.tsx (NEW)
- EnrolmentTimeline.test.tsx (NEW)
- UploadForm.test.tsx
- ResultsTable.test.tsx

**Hooks:**
- useAuth.test.ts
- useUpload.test.ts
- useStagingDates.test.ts (NEW)

## Integration Testing

### API Integration Tests

**Upload Flow:**
```typescript
test('POST /api/uploads → returns uploadId', async () => {
  const file = createMockCSV(50)
  const response = await uploadFile(file)
  expect(response.uploadId).toBeDefined()
  expect(response.rowCount).toBe(50)
})
```

**Validation Flow:**
```typescript
test('GET /api/validation/:id/results → returns eligibility', async () => {
  const uploadId = await uploadTestFile()
  const results = await getValidationResults(uploadId)
  expect(results.eligibleCount).toBeGreaterThan(0)
  expect(results.autoEnrolmentDates).toBeDefined() // NEW
})
```

**Payment Flow:**
```typescript
test('POST /api/billing/checkout → Stripe redirect', async () => {
  const uploadId = await uploadTestFile()
  const checkout = await createCheckout(uploadId)
  expect(checkout.checkoutUrl).toContain('stripe.com')
})
```

**Staging Date Flow:** // NEW
```typescript
test('POST /api/staging-dates → saves config', async () => {
  const config = { frequency: 'quarterly', dates: [...] }
  const response = await saveStagingConfig(config)
  expect(response.id).toBeDefined()
})
```

## E2E Testing (Playwright)

### Critical User Journeys

**Journey 1: Happy Path**
```typescript
test('SME owner uploads, previews, pays, downloads', async ({ page }) => {
  await page.goto('/')
  await page.click('Get Started')
  await uploadFile('test-50-employees.csv')
  await page.waitForSelector('[data-testid="preview-modal"]')
  await page.click('Unlock Full Report (€49)')
  await completeStripePayment()
  await page.waitForURL(/.*reports.*/)
  await page.click('Download PDF')
  expect(downloadStarted).toBe(true)
})
```

**Journey 2: Staging Date Configuration** // NEW
```typescript
test('User configures staging dates', async ({ page }) => {
  await loginAsUser()
  await page.goto('/settings/staging-dates')
  await page.selectOption('[name="frequency"]', 'quarterly')
  await page.click('Save')
  expect(await page.textContent('.success')).toContain('Staging dates saved')
})
```

**Journey 3: Opt-Out Validation** // NEW
```typescript
test('User checks opt-out eligibility', async ({ page }) => {
  await page.goto('/reports/abc123')
  await page.click('[data-employee="emp_001"]')
  await page.click('Check Opt-Out Eligibility')
  expect(await page.textContent('.opt-out-status')).toContain('Within window')
})
```

## Load Testing (k6)

**Scenario 1: Normal Load**
```javascript
export let options = {
  stages: [
    { duration: '5m', target: 50 },  // 50 concurrent users
    { duration: '10m', target: 50 },
    { duration: '5m', target: 0 },
  ],
}
```

**Scenario 2: Peak Load**
```javascript
export let options = {
  stages: [
    { duration: '2m', target: 200 },  // Year-end rush
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
}
```

**Metrics to Monitor:**
- P95 response time < 2s
- Error rate < 1%
- Database connections < 80
- Memory usage stable
- Rate limiting effective

## Edge Case Testing

**Test Cases:**
```typescript
// Age boundary
test('Employee turns 23 on staging date: eligible')
test('Employee turns 61 before staging date: ineligible')

// Salary boundary
test('Salary exactly €20,000: eligible')
test('Salary €19,999.99: ineligible')
test('Salary €80,000: contributions on €80k')
test('Salary €80,000.01: contributions on €80k')

// Date handling
test('Leap year DOB: 29 Feb 1996')
test('Historical employment: started 1990')
test('Future employment: starts next month')

// Staging dates
test('Waiting period ends on staging date: enrolled that day')
test('Waiting period ends day after staging: enrolled next staging')
test('No staging dates configured: error')

// Opt-out
test('Opt-out on last day of window: valid')
test('Opt-out one day after window: invalid')
test('Multiple opt-outs: track all cycles')

// Variable earnings
test('6 months employed, variable pay: project forward')
test('12 months employed: use actual')
```

## Regression Testing

**Automated Regression Suite:**
- Run all unit tests before deploy
- Run critical E2E tests before deploy
- Run security tests weekly
- Run load tests monthly

**Regression Checklist:**
- Zero-retention still active (no disk writes)
- All 15 security tests passing
- Contribution calculations accurate (compare to manual)
- Staging date calculations accurate
- Payment flow unbroken
- PDF generation working

## Accessibility Testing

**WCAG 2.1 Level AA Compliance:**
- Keyboard navigation (all interactive elements)
- Screen reader support (ARIA labels)
- Color contrast (4.5:1 for text)
- Focus indicators (visible)
- Form labels (explicit)
- Error messages (descriptive)

**Tools:**
- axe DevTools (automated)
- NVDA (screen reader testing)
- Manual keyboard testing

**Critical Flows:**
- Upload form accessible
- Preview modal accessible
- Results table accessible (sortable via keyboard)
- Payment flow accessible

---

**PHASES 7-8 IN NEXT RESPONSE...**
