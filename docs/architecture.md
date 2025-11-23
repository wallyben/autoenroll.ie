# AutoEnroll.ie Architecture

## Monorepo Layout
- `/apps/api`: Fastify/Express-style TypeScript API for uploads, validation, eligibility, billing, and reporting.
- `/apps/web`: Next.js 14 frontend (app router) with Tailwind UI and server actions calling the API.
- `/packages/common`: Shared domain models, rules config, utilities.
- `/docs`: Product, legal, and operational documentation.
- `/LEGAL`: Customer-facing legal documents.

## API Architecture
- Layered modules: `config`, `auth`, `parser`, `validation`, `eligibility`, `contributions`, `reports`, `billing`, `analytics`, `audit`.
- Auth: magic-link style via emailed codes (development returns code), JWT sessions scoped to organisation.
- Upload pipeline: multipart upload → stream parse (CSV/XLSX) → pseudonymise → validate → eligibility → contribution calculation → risk scoring → PDF report (on demand) → optional encrypted retention.
- Billing: Stripe checkout + portal endpoints; middleware to enforce subscription tier and usage limits.
- Storage: Primarily in-memory for demo; designed to swap for Postgres + object storage with repository interfaces.

## Frontend Architecture
- App router with marketing segment and authenticated dashboard segment.
- Shared design system components in `/apps/web/components/ui` backed by Tailwind + Radix primitives.
- Client-side upload with streaming progress; server actions post to API.
- State cached client-side with SWR; minimal hydration for reports.

## Rules Engine Architecture
- Rules defined as pure functions with typed input, returning `RuleResult` objects with severity and remediation.
- Validation categories: structural, logical, compliance. Eligibility rules share domain config from `packages/common/config/rules.ts`.
- Contribution calculator uses shared escalation tables and pro-ration helpers.

## Upload → Parse → Validate → Report Lifecycle
1. Authenticated user uploads payroll file (CSV/XLSX).
2. Parser normalises headers, trims, converts dates/numbers, hashes identifiers.
3. Validation engine runs structural + logical rules; eligibility engine determines enrolment status.
4. Contribution calculator applies thresholds/bands; risk scorer aggregates severity.
5. Response includes validation summary + eligibility + contributions; PDF generator can render a downloadable report without persisting raw data.

## Security Model
- TLS everywhere; secure cookies for web session tokens.
- JWTs signed with strong secrets; org scoping prevents cross-tenant access.
- Pseudonymisation pipeline removes/ hashes PII immediately; zero-retention default.
- Rate limiting, audit logging, and strict CORS allowlist per environment.
- No PII in logs; analytics use hashed IDs.

## Data Model (Conceptual)
- **User** (id, email, organisationId, role)
- **Organisation** (id, name, subscriptionTier, retentionPreference)
- **UploadSession** (id, organisationId, createdAt, status, riskScore, retentionMode)
- **ValidationResult** (sessionId, hashedEmployeeId, eligibility, contribution, severities)
- **BillingEvent** (organisationId, stripeCustomerId, status)
- **AuditEvent** (organisationId, actorId, action, hashedSubjectId, timestamp)

## Module Boundaries
- `packages/common`: types, constants, shared rule definitions.
- `apps/api/src`: orchestrates pipelines; imports shared models.
- `apps/web`: presentation, calls API; no server-side validation logic.

## Deployment Targets
- Web on Vercel; API on Fly.io/Render with Postgres + object storage.
- Managed Stripe for billing; S3-compatible storage for encrypted retention.
