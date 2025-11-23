# GDPR Operating Model

## Retention Design
- **Zero-Retention (default)**: Files are streamed through validators; buffers wiped after processing. Derived analytics keep only hashed IDs and aggregated metrics. PDF reports generated on-demand and returned to client without storage.
- **Encrypted Short-Retention (opt-in)**: Customer may enable short retention (e.g., 30 days). Artifacts encrypted with per-organisation keys stored in KMS; deletion via key revocation. Background janitor enforces retention policy.

## Pseudonymisation & Minimisation
- Immediately hash `ppsNumber` and `employeeId` using salted SHA-256.
- Derive age from DOB, then drop DOB unless retention is enabled.
- Store only eligibility flags, contribution outputs, risk counts, and timestamps.
- Redact or ignore columns such as address, phone, bank details, or notes.

## Access Control
- Role-based access: owner, admin, analyst roles; upload/report access limited to organisation.
- JWT sessions include organisation scope; API guards prevent cross-org access.
- Admin tools require MFA; actions logged with hashed user IDs.

## Security Controls (GDPR Art. 32)
- TLS for all endpoints; HSTS on web.
- At-rest encryption for any retained data; S3 buckets with SSE-KMS.
- Secrets handled via environment variables; no secrets in code or logs.
- Rate limiting and audit logging for uploads and downloads.
- Dependency scanning and CI security checks.

## Forbidden Actions
- Logging PII or raw payroll contents.
- Writing uploaded files to disk without encryption and explicit consent.
- Sharing data across organisations or for profiling.
- Using data for training models or marketing without consent.
