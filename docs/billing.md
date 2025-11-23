# Billing System

## Overview

AutoEnroll.ie uses Stripe for subscription management and payment processing. This document outlines the billing architecture, subscription tiers, and implementation details.

## Subscription Tiers

### Free Trial
- **Duration**: 14 days
- **Features**: Full access to all features
- **Limits**: Up to 100 employees per upload
- **Payment**: Credit card required, not charged during trial

### Professional Plan
- **Price**: €49/month or €490/year (2 months free)
- **Features**: 
  - Unlimited uploads
  - Up to 500 employees per upload
  - PDF report generation
  - Email support
  - GDPR compliance tools
  - Risk assessment

### Enterprise Plan
- **Price**: €149/month or €1,490/year (2 months free)
- **Features**:
  - All Professional features
  - Up to 5,000 employees per upload
  - Priority support
  - API access
  - Custom integrations
  - Dedicated account manager
  - SLA guarantee

## Stripe Integration

### Setup

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

### Subscription Creation

```typescript
// 1. Create Stripe customer
const customer = await stripe.customers.create({
  email: user.email,
  payment_method: paymentMethodId,
  invoice_settings: {
    default_payment_method: paymentMethodId,
  },
});

// 2. Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: priceId }],
  expand: ['latest_invoice.payment_intent'],
});
```

### Webhook Handling

```typescript
// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);

// Handle events
switch (event.type) {
  case 'customer.subscription.updated':
    await handleSubscriptionUpdated(event.data.object);
    break;
  case 'customer.subscription.deleted':
    await handleSubscriptionDeleted(event.data.object);
    break;
  case 'invoice.payment_succeeded':
    await handlePaymentSucceeded(event.data.object);
    break;
  case 'invoice.payment_failed':
    await handlePaymentFailed(event.data.object);
    break;
}
```

## Database Schema

### billing_subscriptions Table

```sql
CREATE TABLE billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  price_id VARCHAR(255) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(stripe_subscription_id)
);
```

## Subscription States

### Active States
- **trialing**: Free trial period
- **active**: Paid and current
- **past_due**: Payment failed, grace period

### Inactive States
- **canceled**: Subscription cancelled
- **unpaid**: Payment failed, no grace period
- **incomplete**: Initial payment failed
- **incomplete_expired**: Payment setup expired

## Payment Flow

### New Subscription
1. User selects plan
2. Frontend collects payment method (Stripe Elements)
3. Backend creates Stripe customer
4. Backend creates subscription
5. Webhook confirms subscription active
6. User gains access

### Renewal
1. Stripe automatically charges card
2. Webhook received: `invoice.payment_succeeded`
3. Subscription period updated in database
4. User continues access

### Failed Payment
1. Stripe attempts to charge card
2. Payment fails
3. Webhook received: `invoice.payment_failed`
4. User notified via email
5. Grace period begins (7 days)
6. Retry attempts made
7. If still failed, subscription cancelled

### Cancellation
1. User cancels via dashboard
2. Backend calls Stripe API
3. Subscription marked `cancel_at_period_end`
4. User has access until period ends
5. Webhook received: `customer.subscription.deleted`
6. Database updated

## Usage Tracking

### Uploads per Month
```typescript
interface UsageTracking {
  userId: string;
  month: string;
  uploadCount: number;
  employeeCount: number;
  lastUpload: Date;
}
```

### Limits Enforcement
```typescript
async function checkUploadLimit(userId: string): Promise<boolean> {
  const subscription = await getSubscription(userId);
  const usage = await getMonthlyUsage(userId);
  
  const limits = {
    trial: 100,
    professional: 500,
    enterprise: 5000,
  };
  
  return usage.employeeCount < limits[subscription.plan];
}
```

## Revenue Recognition

### Accrual Accounting
- Revenue recognized over subscription period
- Monthly: 1/12 per month
- Annual: 1/12 per month over 12 months

### Reporting
```sql
SELECT 
  DATE_TRUNC('month', current_period_start) as month,
  COUNT(*) as active_subscriptions,
  SUM(amount) as monthly_revenue
FROM billing_subscriptions
WHERE status = 'active'
GROUP BY month
ORDER BY month DESC;
```

## Refund Policy

### Trial Period
- No charges during trial
- Cancel anytime, no refund needed

### Paid Subscriptions
- No refunds for monthly subscriptions
- Pro-rata refunds for annual subscriptions if cancelled within 30 days
- Discretionary refunds for exceptional circumstances

### Refund Process
```typescript
async function processRefund(subscriptionId: string, reason: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const invoice = await stripe.invoices.retrieve(
    subscription.latest_invoice
  );
  
  const refund = await stripe.refunds.create({
    payment_intent: invoice.payment_intent,
    reason: reason,
  });
  
  await cancelSubscription(subscription.id);
  return refund;
}
```

## Tax Handling

### VAT/GST
- Stripe Tax automatically calculates
- Rate based on customer location
- Included in invoice amount

### Invoicing
- Automatic invoice generation
- Sent via Stripe
- Available in customer portal

## Customer Portal

### Self-Service Features
- View invoices
- Download receipts
- Update payment method
- Change subscription plan
- Cancel subscription

### Implementation
```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${FRONTEND_URL}/billing`,
});

// Redirect user to session.url
```

## Metrics and Analytics

### Key Metrics
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **Churn Rate**
- **LTV** (Lifetime Value)
- **CAC** (Customer Acquisition Cost)

### Tracking
```typescript
interface BillingMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialUsers: number;
  churnRate: number;
  avgRevenuePerUser: number;
}
```

## Failed Payment Recovery

### Dunning Strategy
1. **Day 0**: Payment fails, email sent
2. **Day 3**: Retry payment, reminder email
3. **Day 5**: Retry payment, urgent email
4. **Day 7**: Final retry, last chance email
5. **Day 8**: Subscription cancelled

### Email Templates
- Payment failed notification
- Retry reminder
- Update payment method
- Final notice
- Subscription cancelled

## Security

### PCI Compliance
- Never store card numbers
- Use Stripe Elements for card input
- Stripe handles PCI compliance

### Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints
- Validate event authenticity

## Testing

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
3D Secure: 4000 0027 6000 3184
```

### Test Mode
- Separate API keys for testing
- No real charges
- Full feature access

## Monitoring

### Alerts
- Failed payments
- Webhook failures
- Subscription cancellations
- High churn rate

### Logs
- All Stripe API calls logged
- Webhook events stored
- Payment attempts tracked

## Future Enhancements

### Phase 2
- Volume discounts
- Team/multi-user accounts
- Custom pricing for enterprises
- Partner/reseller pricing

### Phase 3
- Usage-based billing
- Add-on features
- Credits system
- Referral program
