# Infrastructure & Deployment

## Services
- **Web (Next.js)**: Deploy to Vercel with environment `NEXT_PUBLIC_API_URL` pointing to API base.
- **API (Express)**: Deploy to Fly.io or Render with Node 20, expose port 4000. Configure TLS via platform. Attach managed Postgres if persistence desired.
- **Storage**: S3-compatible bucket for optional encrypted report retention.
- **Secrets**: Managed via platform secrets (JWT_SECRET, STRIPE_SECRET, HASH_SALT).

## CI/CD
- GitHub Actions workflow runs lint, test, and build for monorepo workspaces.
- Deployments can be hooked on `main` branch after CI success using platform CLIs.

## Observability
- Structured logging without PII.
- Health endpoint `/health` for uptime checks.
- Metrics/analytics exported via anonymised events (see `analytics.md`).
