# Analytics & Metrics

## Events Tracked
- `account_created`
- `file_uploaded`
- `validation_completed`
- `report_downloaded`
- `subscription_created`
- `subscription_cancelled`

## Principles
- No PII captured; only hashed IDs and organisation scopes.
- Aggregated counts and timestamps only.
- Opt-out available via organisation settings.

## Storage
- In-memory events in demo; production to send to privacy-safe warehouse (e.g., PostHog self-hosted) with IP anonymisation.
