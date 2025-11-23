# AutoEnroll.ie

AutoEnroll.ie is a GDPR-first SaaS for validating Irish payroll files and assessing auto-enrolment eligibility. It ingests CSV/XLSX exports, checks structural and logical quality, applies Irish AE rules, calculates contributions, and produces downloadable reports without retaining payroll data by default.

## Monorepo Layout
- `apps/api`: Express + TypeScript API for uploads, validation, eligibility, PDF export, billing hooks.
- `apps/web`: Next.js 14 frontend with Tailwind for landing, dashboard, and upload experience.
- `packages/common`: Shared domain types, configuration, and rules constants.

## Getting Started
```bash
npm install
npm run dev # starts API (port 4000)
# In separate shell
cd apps/web && npm run dev # starts web (port 3000)
```
Set `NEXT_PUBLIC_API_URL` to your API origin when running the frontend.

### Developer Onboarding
- Use Node 20+.
- Copy `.env.example` to `.env` and adjust secrets.
- Run `npm install` at repo root; workspaces handle dependencies.
- Start API first, then frontend pointing to API base.

## Environment Variables
- `JWT_SECRET`: Secret for signing access tokens.
- `STRIPE_SECRET`: Stripe API key (optional; mock URLs returned if absent).
- `HASH_SALT`: Salt for hashing identifiers.
- `CORS_ORIGIN`: Allowed origins (default `*`).

## Key Endpoints
- `POST /auth/request` → request magic code (returned in dev)
- `POST /auth/verify` → exchange code for JWT
- `POST /upload` → upload CSV/XLSX (Bearer token required)
- `POST /report` → generate PDF from summary
- `POST /billing/checkout` → create Stripe checkout
- `POST /billing/portal` → create billing portal session

### API Reference (high level)
- **Auth**: request + verify to obtain JWT scoped to organisation.
- **Validation**: `/upload` responds with per-record summaries (issues, eligibility, contributions, risk score).
- **Reporting**: `/report` streams PDF using provided summary payload.
- **Billing**: Checkout and portal endpoints accept tier/customer identifiers.

## Testing & Linting
Run unit tests across workspaces:
```bash
npm test
```
Lint code with:
```bash
npm run lint
```

## Rules Engine
- Rules are pure functions in `apps/api/src/validation.ts` using shared config from `packages/common`.
- Eligibility uses age (23–60) and income (€20k–€80k) thresholds; contribution escalation defined in `packages/common/src/config.ts`.
- Risk score weighted by severity; PDF includes issues and contribution totals.

## Deployment
- Web: Vercel (set `NEXT_PUBLIC_API_URL`).
- API: Fly.io/Render with Node 20. Use managed Postgres and S3-compatible storage for optional retention.

## Project Status
- Core validation, eligibility, and contribution logic implemented with API + frontend demo.
- Billing endpoints available (mocked when Stripe key absent).
- Zero-retention default enforced; documentation completed.

## Contribution Guide
- Fork the repo, create feature branches, and submit PRs with passing CI.
- Keep code TypeScript-first with strict linting; avoid logging PII.
- Add tests for new rules and endpoints; update docs alongside code.
