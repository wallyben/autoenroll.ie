# PHASE 1: ARCHITECTURE BLUEPRINT

## System Architecture Improvements

### 1. Rules Engine Enhancement

**Current State:** Basic eligibility + contribution calculator
**Required State:** Complete lifecycle management

```typescript
// NEW: Staging Date Engine
class StagingDateEngine {
  calculateAutoEnrolmentDate(employmentStartDate: Date, stagingConfig: StagingConfig): Date
  calculateReEnrolmentDate(lastEnrolmentDate: Date, stagingConfig: StagingConfig): Date
  validateOptOutWindow(autoEnrolmentDate: Date, optOutDate: Date): ValidationResult
}

// NEW: Enrolment Lifecycle Manager
class EnrolmentLifecycleManager {
  trackEnrolmentHistory(employeeId: string): EnrolmentEvent[]
  calculateNextAction(employee: Employee): 'enrol' | 're-enrol' | 'none' | 'opt-out-window-closing'
  getEnrolmentStatus(employee: Employee): EnrolmentStatus
}

// ENHANCED: Contribution Calculator (add variable earnings)
class ContributionCalculator {
  calculateWithVariableEarnings(earningsHistory: number[], projectionMethod: 'average' | 'forward')
  calculateRefundAmount(autoEnrolmentDate: Date, optOutDate: Date, contributionsMade: number)
  projectMultiYear(employee: Employee, years: number): YearlyProjection[]
}
```

### 2. Data Flow Enhancement

**Add Stage:** Staging Date Resolution
```
Upload → Parse → Validate → [NEW] Resolve Staging Dates → Calculate Eligibility → Calculate Contributions → Generate Report
```

### 3. Database Schema Additions

```prisma
model StagingDateConfig {
  id          String   @id @default(cuid())
  userId      String
  frequency   String   // 'monthly' | 'quarterly' | 'bi-annually' | 'annually'
  dates       DateTime[] // Specific staging dates
  approved    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model EnrolmentHistory {
  id              String   @id @default(cuid())
  employeeId      String
  uploadId        String
  enrolmentDate   DateTime
  enrolmentType   String   // 'initial' | 're-enrolment' | 'opt-in'
  optOutDate      DateTime?
  reEnrolmentDue  DateTime?
  cycle           Int      @default(1)
  createdAt       DateTime @default(now())
}
```

### 4. API Additions

**New Endpoints:**
- POST `/api/staging-dates` - Configure staging dates
- GET `/api/staging-dates` - Get staging config
- GET `/api/enrolment-history/:employeeId` - Get enrolment lifecycle
- POST `/api/validate-opt-out` - Validate opt-out request
- GET `/api/re-enrolment-calendar` - Upcoming re-enrolments

### 5. Security Model (Already Strong)

**Current:** A+ grade
**Maintain:** All existing security (CSP, HSTS, rate limiting, zero-retention)
**Add:** Audit trail for staging date changes (compliance requirement)

### 6. Error Handling Enhancement

**Add Error Codes:**
- `AE_001`: Auto-enrolment date calculation failed
- `AE_002`: Staging date not configured
- `AE_003`: Opt-out window validation failed
- `AE_004`: Re-enrolment calculation failed
- `AE_005`: Variable earnings projection failed

---

# PHASE 2: BACKEND IMPROVEMENTS (ACTIONABLE)

## Priority 1: Critical Accuracy Fixes

### 1.1 Implement Staging Date Engine

**File:** `/packages/common/src/eligibility/staging-dates.ts` (NEW)

```typescript
export interface StagingConfig {
  frequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually' | 'custom'
  dates: Date[]
}

export function getNextStagingDate(afterDate: Date, config: StagingConfig): Date {
  return config.dates
    .filter(d => d >= afterDate)
    .sort((a, b) => a.getTime() - b.getTime())[0]
}

export function calculateAutoEnrolmentDate(
  employmentStartDate: Date,
  stagingConfig: StagingConfig
): Date {
  const waitingPeriodEnd = addMonths(employmentStartDate, 6)
  return getNextStagingDate(waitingPeriodEnd, stagingConfig)
}

export function getDefaultStagingConfig(): StagingConfig {
  // Default: Quarterly (1st Jan, Apr, Jul, Oct)
  const year = new Date().getFullYear()
  return {
    frequency: 'quarterly',
    dates: [
      new Date(year, 0, 1),
      new Date(year, 3, 1),
      new Date(year, 6, 1),
      new Date(year, 9, 1),
      new Date(year + 1, 0, 1),
    ]
  }
}
```

### 1.2 Implement Opt-Out Validation

**File:** `/packages/common/src/eligibility/opt-out.ts` (NEW)

```typescript
export interface OptOutValidation {
  valid: boolean
  withinWindow: boolean
  windowClosesDate: Date
  refundAmount?: number
  reEnrolmentDate?: Date
  reason?: string
}

export function validateOptOut(
  autoEnrolmentDate: Date,
  optOutRequestDate: Date,
  contributionsMade: number,
  stagingConfig: StagingConfig
): OptOutValidation {
  const windowCloses = addMonths(autoEnrolmentDate, 6)
  const withinWindow = optOutRequestDate <= windowCloses
  
  if (!withinWindow) {
    return {
      valid: false,
      withinWindow: false,
      windowClosesDate: windowCloses,
      reason: `Opt-out window closed on ${format(windowCloses, 'dd/MM/yyyy')}. Request received ${format(optOutRequestDate, 'dd/MM/yyyy')}.`
    }
  }
  
  const reEnrolmentDate = calculateReEnrolmentDate(autoEnrolmentDate, stagingConfig)
  
  return {
    valid: true,
    withinWindow: true,
    windowClosesDate: windowCloses,
    refundAmount: contributionsMade,
    reEnrolmentDate,
  }
}

export function calculateReEnrolmentDate(
  lastEnrolmentDate: Date,
  stagingConfig: StagingConfig
): Date {
  const threeYearsLater = addYears(lastEnrolmentDate, 3)
  return getNextStagingDate(threeYearsLater, stagingConfig)
}
```

### 1.3 Enhance Validation Service

**File:** `/packages/backend/src/services/validation.service.ts` (MODIFY)

Add staging date resolution step after parsing, before eligibility calculation.

## Priority 2: Variable Earnings Support

**File:** `/packages/common/src/eligibility/variable-earnings.ts` (NEW)

```typescript
export function projectAnnualEarnings(
  earningsHistory: number[],
  weeksWorked: number
): { projected: number; confidence: 'high' | 'medium' | 'low' } {
  if (weeksWorked >= 52) {
    return { projected: earningsHistory.reduce((a, b) => a + b, 0), confidence: 'high' }
  }
  
  const weeklyAverage = earningsHistory.reduce((a, b) => a + b, 0) / weeksWorked
  const projected = weeklyAverage * 52
  
  return {
    projected,
    confidence: weeksWorked >= 26 ? 'medium' : 'low'
  }
}
```

## Priority 3: PDF Report Enhancement

**Add Sections:**
- Auto-enrolment dates (not just eligibility)
- Opt-out window deadlines
- Re-enrolment calendar
- Staging date information

---

# PHASE 3: UI/UX IMPROVEMENTS

## Customer Journey Optimization

### Journey Map
1. **Landing** (0-15 sec): Value prop + trust signals → Upload CTA
2. **Upload** (15-30 sec): Drag-drop + format help → Processing
3. **Preview** (30-60 sec): 3 samples + top issues + €49 CTA → Payment
4. **Payment** (60-90 sec): Stripe Checkout → Success
5. **Report** (90-120 sec): Full results + download PDF → Upsell

### UI Improvements

**Landing Page:**
- Hero: "Check 50 employees in 20 seconds. €49 one-off."
- Trust bar: "Zero data retention • Revenue validated • 2,847 reports generated"
- 3-step visual: Upload → Preview free → Pay €49
- Social proof: Testimonials from Irish payroll bureaus
- FAQ: Common questions about auto-enrolment

**Upload Flow:**
- Template download: "Download example CSV"
- Format helper: "Works with BrightPay, Thesaurus, Sage, Excel"
- Progress indicator: "Parsing... Validating... Calculating..."
- Instant feedback: "50 rows found • 2 errors detected"

**Preview Modal (Existing - ENHANCE):**
- Add: "Auto-enrolment starts [DATE]"
- Add: "Opt-out deadline [DATE]"  
- Add: "Next re-enrolment check [DATE]"
- Add: Trust badge: "Revenue-validated calculations"

**Results Page:**
- Summary cards: Eligible count, contribution total, risk score
- Employee table: Sortable, filterable
- Action items: "3 employees need DOB correction"
- Timeline: Auto-enrolment dates visualization
- Download CTA: "Download PDF Report (€49)"

**Pricing Page:**
- Single plan: €49 per report
- Comparison table: vs Consultants (€500+), vs Software (€50/mo), vs Excel (hours of work)
- Money-back guarantee: "100% refund if inaccurate"
- Volume pricing: "10+ reports? Contact for discount"

### Conversion Optimizations

**Reduce Friction:**
- Remove signup requirement for upload (anonymous uploads)
- Show preview BEFORE payment (try before buy)
- Single-click Stripe Checkout (no forms)
- Guest checkout option (email only)

**Increase Trust:**
- "Zero data retention" badge everywhere
- "Revenue-validated" badge on calculations
- Real testimonials with photos
- "€50k saved in penalties" social proof
- Money-back guarantee prominent

**Urgency/Scarcity:**
- "Auto-enrolment deadline approaching" (if applicable)
- "2,847 reports generated this month"
- "Join 430+ Irish payroll bureaus"

### Component Specifications

**StagingDatePicker Component:** (NEW)
```tsx
<StagingDatePicker
  frequency="quarterly"
  onChange={handleStagingChange}
  preview={true} // Show next 4 staging dates
/>
```

**EnrolmentTimeline Component:** (NEW)
```tsx
<EnrolmentTimeline
  employees={eligibleEmployees}
  showAutoEnrolmentDates={true}
  showReEnrolmentDates={true}
  showOptOutDeadlines={true}
/>
```

**RiskScoreCard Component:** (ENHANCE)
```tsx
<RiskScoreCard
  score={riskScore}
  factors={riskFactors}
  actionable={true} // Show "Fix 3 errors to reduce risk"
/>
```

---

# PHASE 4: PRICING STRATEGY

## Optimal Pricing Model

**Primary Offering: €49 per report (one-off)**

### Rationale:
1. **Value Perception:** 10x cheaper than consultant (€500+), 1x monthly software cost
2. **Psychological:** Under €50 threshold (no budget approval needed)
3. **No Commitment:** One-off removes subscription friction
4. **Profitable:** €49 - €5 costs (Stripe+infra) = €44 margin (88%)
5. **Volume Potential:** Payroll bureaus will buy 10-100 reports/year

### Buyer Segment Pricing

**SMEs (1-50 employees):**
- €49 per report
- Occasional use (1-2x per year)
- Lifetime value: €50-100

**Accountants (5-50 clients):**
- €49 per report, or
- €39 per report (bundle 10+), or
- White-label €1,000/year (unlimited)
- Frequent use (10-50x per year)
- Lifetime value: €400-2,000

**Payroll Bureaus (15-500 clients):**
- €49 per report, or
- €29 per report (bundle 50+), or  
- €19 per report (bundle 200+), or
- White-label €5,000/year (unlimited)
- Very frequent use (50-500x per year)
- Lifetime value: €2,000-10,000

### Stripe Product Definitions

```javascript
// Product 1: Single Report
{
  name: "Auto-Enrolment Compliance Report",
  price: 4900, // €49.00
  currency: "eur",
  mode: "payment",
  description: "Instant compliance check for up to 200 employees"
}

// Product 2: Report Bundle (10 pack)
{
  name: "10 Report Bundle",
  price: 39000, // €390 (€39 each)
  currency: "eur",
  mode: "payment",
  description: "10 reports, save €100. Perfect for accountants."
}

// Product 3: White Label Annual
{
  name: "White Label Unlimited",
  price: 500000, // €5,000/year
  currency: "eur",
  mode: "subscription",
  interval: "year",
  description: "Unlimited reports, your branding, priority support"
}
```

### Billing Flow Enhancements

**Add:**
- Bundle purchase option (10, 50, 200 packs)
- Credit system (buy credits, use credits per report)
- Usage dashboard (credits remaining, reports generated)
- Auto-refill option (when credits < 5, buy 10 more)

### A/B Test Variants

**Test 1: Price Points**
- Variant A: €49 (control)
- Variant B: €39 (lower)
- Variant C: €59 (higher, include "priority")
- Hypothesis: €49 maximizes revenue (volume × price)

**Test 2: Pricing Display**
- Variant A: "€49 per report" (simple)
- Variant B: "€49 one-off (no subscription)" (highlight benefit)
- Variant C: "€49 vs €500 consultant" (comparison)
- Hypothesis: Variant C increases conversion (shows value)

**Test 3: Bundle Visibility**
- Variant A: Hide bundles (single purchase only)
- Variant B: Show bundles on pricing page
- Variant C: Show bundles after first purchase
- Hypothesis: Variant C increases bundle adoption (proven value)

### Usage Limits

**Per Report:**
- Max employees: 500 (upsell to 1000 for €79)
- Max file size: 10MB (adequate for 5000 rows)
- Processing timeout: 60 seconds

**Per User:**
- Anonymous uploads: 2 per day (require signup for more)
- Registered users: Unlimited uploads (pay per report)
- Preview: Unlimited (only pay for full report)

---

**PHASES 5-8 CONTINUING IN NEXT RESPONSE...**
