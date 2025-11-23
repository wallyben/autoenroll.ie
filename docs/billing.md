# Billing Model

## Pricing
- Starter: €19/mo — up to 20 uploads per month.
- Growth: €49/mo — up to 200 uploads per month.
- Enterprise: Custom pricing, higher limits, dedicated retention controls.

## Stripe Integration
- Checkout sessions created via `/billing/checkout` using tier IDs (`starter`, `growth`, `enterprise`).
- Billing portal available via `/billing/portal` with customer ID.
- Webhook support can be added to persist subscription state in Postgres.

## Usage Limits
- Enforced per organisation in middleware (future extension) using upload counters.
- Overage strategy: soft cap with alerts; hard block after limit for Starter.

## Data Handling
- Billing data (customer IDs, subscription status) stored as controller data; no payroll data stored.

## Customer Communication
- Email receipts handled by Stripe; app surfaces subscription status and renewal date in dashboard.
