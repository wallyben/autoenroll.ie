# Analytics Strategy

## Overview
AutoEnroll.ie implements privacy-first analytics to understand usage patterns without compromising user data or GDPR compliance.

## Analytics Stack

### Primary: Plausible Analytics
**Why Plausible:**
- GDPR compliant by design
- No cookies or personal data tracking
- Lightweight script (< 1KB)
- EU-hosted data
- No IP address logging

**Implementation:**
```html
<!-- Add to layout.tsx -->
<script defer data-domain="autoenroll.ie" src="https://plausible.io/js/script.js"></script>
```

**Key Metrics:**
- Page views
- Unique visitors
- Traffic sources
- Bounce rate
- Device types (desktop/mobile)
- Countries (aggregated)

### Secondary: PostHog (Self-Hosted)
**Purpose:** Product analytics and feature flags

**Features:**
- Session recordings (anonymized)
- Feature flags for A/B testing
- Funnel analysis
- User journey tracking (pseudonymised)

**Configuration:**
```javascript
// lib/analytics.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://analytics.autoenroll.ie',
    autocapture: false, // Manual event tracking only
    capture_pageview: true,
    disable_session_recording: process.env.NODE_ENV !== 'production',
    anonymize_ip: true, // GDPR requirement
  })
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    posthog.capture(event, properties)
  },
  identify: (userId: string) => {
    // Use hashed user ID, never email or name
    posthog.identify(hashUserId(userId))
  }
}
```

## Key Events to Track

### Authentication Events
```typescript
// User registration
analytics.track('user_registered', {
  plan: 'pay_per_upload' | 'monthly',
  source: 'organic' | 'referral' | 'ad'
})

// User login
analytics.track('user_login')

// Subscription created
analytics.track('subscription_created', {
  plan: 'monthly',
  price: 149
})
```

### Upload Events
```typescript
// File upload started
analytics.track('upload_started', {
  file_type: 'csv' | 'xlsx',
  file_size_kb: number
})

// File upload completed
analytics.track('upload_completed', {
  employee_count: number,
  processing_time_ms: number,
  validation_errors: number,
  validation_warnings: number
})

// Validation completed
analytics.track('validation_completed', {
  total_employees: number,
  eligible_count: number,
  ineligible_count: number,
  data_quality_score: number
})
```

### PDF Generation Events
```typescript
// PDF report generated
analytics.track('pdf_generated', {
  employee_count: number,
  generation_time_ms: number,
  report_type: 'compliance' | 'employee'
})

// PDF downloaded
analytics.track('pdf_downloaded')
```

### Billing Events
```typescript
// Checkout started
analytics.track('checkout_started', {
  plan: 'pay_per_upload' | 'monthly'
})

// Payment successful
analytics.track('payment_successful', {
  plan: string,
  amount: number,
  currency: 'EUR'
})

// Subscription cancelled
analytics.track('subscription_cancelled', {
  plan: string,
  months_subscribed: number
})
```

### Error Events
```typescript
// Upload error
analytics.track('upload_error', {
  error_type: string,
  file_type: string
})

// Validation error
analytics.track('validation_error', {
  error_count: number
})

// Payment error
analytics.track('payment_error', {
  error_code: string
})
```

## Funnel Analysis

### Registration Funnel
1. Landing page view
2. Pricing page view
3. Sign up form submitted
4. Email verified
5. First upload completed
6. First PDF downloaded

**Target Conversion Rates:**
- Landing → Pricing: 40%
- Pricing → Sign up: 15%
- Sign up → Verified: 80%
- Verified → Upload: 60%
- Upload → PDF: 90%

### Upload Funnel
1. Dashboard viewed
2. Upload page viewed
3. File selected
4. File uploaded
5. Validation completed
6. Results viewed
7. PDF downloaded

**Target Conversion Rates:**
- Dashboard → Upload: 70%
- Upload → File selected: 80%
- File selected → Uploaded: 95%
- Uploaded → Results: 98%
- Results → PDF: 85%

## Key Performance Indicators (KPIs)

### Business Metrics
```typescript
interface BusinessKPIs {
  // Revenue
  mrr: number                    // Monthly Recurring Revenue
  arr: number                    // Annual Recurring Revenue
  average_revenue_per_user: number
  
  // Growth
  monthly_signup_rate: number
  churn_rate: number
  customer_lifetime_value: number
  customer_acquisition_cost: number
  
  // Engagement
  daily_active_users: number
  monthly_active_users: number
  average_uploads_per_user: number
  average_employees_per_upload: number
}
```

### Technical Metrics
```typescript
interface TechnicalKPIs {
  // Performance
  avg_upload_time_ms: number
  avg_validation_time_ms: number
  avg_pdf_generation_time_ms: number
  api_response_time_p95: number
  
  // Reliability
  uptime_percentage: number
  error_rate: number
  success_rate: number
  
  // Data Quality
  avg_validation_errors_per_upload: number
  avg_data_quality_score: number
}
```

## Dashboard Metrics

### Real-Time Dashboard
```typescript
// Admin dashboard metrics
interface DashboardMetrics {
  // Current
  active_users_now: number
  uploads_last_hour: number
  revenue_today: number
  
  // 24 Hours
  signups_24h: number
  uploads_24h: number
  revenue_24h: number
  errors_24h: number
  
  // 7 Days
  active_users_7d: number
  uploads_7d: number
  revenue_7d: number
  churn_7d: number
  
  // 30 Days
  mrr_30d: number
  new_customers_30d: number
  churned_customers_30d: number
  avg_upload_size_30d: number
}
```

### SQL Queries for Metrics
```sql
-- Monthly Recurring Revenue
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN plan_id = 'monthly' THEN 149 ELSE 0 END) as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY month
ORDER BY month DESC;

-- Average Uploads Per User
SELECT 
  AVG(upload_count) as avg_uploads
FROM (
  SELECT user_id, COUNT(*) as upload_count
  FROM uploads
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id
) user_uploads;

-- Churn Rate
SELECT 
  COUNT(*) FILTER (WHERE cancel_at_period_end = true) * 100.0 / COUNT(*) as churn_rate
FROM subscriptions
WHERE status = 'active';

-- Data Quality Score
SELECT 
  AVG(
    100 - (
      (validation_errors * 10) + 
      (validation_warnings * 2)
    )
  ) as avg_quality_score
FROM uploads
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Privacy Considerations

### Data Minimization
- **No PII in analytics**: Never track names, emails, PPSN numbers
- **Hashed IDs only**: All user identifiers are SHA-256 hashed
- **Aggregate metrics**: Report on aggregates, not individuals
- **No IP addresses**: All IP addresses anonymized immediately

### GDPR Compliance
```typescript
// analytics.ts - GDPR-compliant tracking
export const gdprCompliantTrack = (event: string, data: any) => {
  // Remove any PII before tracking
  const sanitized = {
    ...data,
    // Remove potential PII fields
    email: undefined,
    name: undefined,
    firstName: undefined,
    lastName: undefined,
    ppsn: undefined,
    dateOfBirth: undefined,
    // Hash user IDs
    userId: data.userId ? hashUserId(data.userId) : undefined,
    employeeId: data.employeeId ? hashEmployeeId(data.employeeId) : undefined
  }
  
  analytics.track(event, sanitized)
}
```

### Cookie Consent
```typescript
// Not required for Plausible (no cookies)
// PostHog respects DNT header
if (navigator.doNotTrack === '1') {
  posthog.opt_out_capturing()
}
```

## Reporting

### Weekly Report
**Recipients:** Founders, Product Team

**Contents:**
- Active users (week-over-week)
- New signups
- Revenue (week-over-week)
- Upload volume
- Average employees per upload
- Top error types
- Feature usage statistics

### Monthly Report
**Recipients:** All stakeholders

**Contents:**
- MRR and ARR
- Customer acquisition cost
- Customer lifetime value
- Churn rate
- Conversion funnel performance
- Technical performance metrics
- Top feature requests
- Competitive analysis

## A/B Testing Strategy

### Test Ideas
1. **Pricing Page**
   - Test monthly price: €149 vs €199
   - Test pay-per-upload: €49 vs €59
   - Test feature emphasis

2. **Upload Flow**
   - Single-step vs multi-step upload
   - Auto-validate vs manual trigger
   - Different progress indicators

3. **Onboarding**
   - In-app tour vs tutorial video
   - Sample data demo vs empty state

### Implementation
```typescript
// Feature flag example
const pricingVariant = posthog.getFeatureFlag('pricing_test')

if (pricingVariant === 'higher_price') {
  monthlyPrice = 199
} else {
  monthlyPrice = 149
}
```

## Tools Integration

### Stripe Analytics
- Track payment success/failure rates
- Monitor payment method distribution
- Analyze revenue by plan type

### Error Tracking (Sentry)
```typescript
Sentry.setContext('upload', {
  uploadId: upload.id,
  fileSize: file.size,
  fileType: file.type,
  employeeCount: employees.length
})
```

### Performance Monitoring
```typescript
// Custom timing marks
performance.mark('upload-start')
// ... upload logic
performance.mark('upload-end')
performance.measure('upload-duration', 'upload-start', 'upload-end')

// Send to analytics
const measure = performance.getEntriesByName('upload-duration')[0]
analytics.track('upload_performance', {
  duration_ms: measure.duration
})
```

## Analytics Review Process

### Daily Review (5 minutes)
- Check real-time metrics dashboard
- Review error logs
- Monitor uptime

### Weekly Review (30 minutes)
- Analyze weekly report
- Review funnel conversion rates
- Identify top issues
- Plan improvements

### Monthly Review (2 hours)
- Deep dive into monthly metrics
- Analyze cohort retention
- Review A/B test results
- Update roadmap based on data
- Forecast revenue

## Success Metrics

### Year 1 Targets
- 500 registered users
- 100 paying customers
- €10,000 MRR
- 5% monthly churn rate
- 10,000 uploads processed
- 95% uptime

### Year 2 Targets
- 2,000 registered users
- 500 paying customers
- €50,000 MRR
- 3% monthly churn rate
- 50,000 uploads processed
- 99% uptime
