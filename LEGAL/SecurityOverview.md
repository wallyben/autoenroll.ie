# Security Overview

## Technical Controls
- TLS enforced; HSTS for web.
- JWT-based auth with organisation scoping; secure cookies recommended for web session storage.
- Hashing of identifiers on ingestion; zero-retention default.
- Encryption at rest for any retained artifacts (S3 SSE-KMS or platform equivalent).
- Secrets stored in environment variables; rotated regularly.

## Organisational Controls
- Role-based access for staff; least privilege principles.
- Background checks for operators; mandatory security training.
- Incident response playbook with 72-hour breach notification commitment.

## Monitoring
- Audit logs without PII for uploads and downloads.
- Dependency scanning via CI; automated updates for high-severity vulnerabilities.

## Business Continuity
- Infrastructure as code for reproducibility; backups of configuration only (no payroll data in backups by default).
