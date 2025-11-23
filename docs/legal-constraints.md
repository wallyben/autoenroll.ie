# GDPR and Legal Constraints

## Lawful Basis
- **Purpose**: Facilitate employer compliance with statutory auto-enrolment assessments.
- **Lawful Basis**: **Legitimate interest** (employer compliance) or **legal obligation** depending on client context; contract for account/billing data.
- **Data Protection Impact**: Minimise personal data processed and ensure proportionality.

## Controller vs Processor
- **AutoEnroll.ie** acts as **processor** for payroll data uploads, and **controller** for account/billing metadata.
- Customers remain controllers for employee data; they must ensure lawful basis and notices to employees.

## What AutoEnroll May Store
- Account data: email, organisation name, subscription status, audit logs without PII.
- Derived analytics: anonymised event metrics (counts, timestamps, subscription tier).
- Optional short-retention encrypted snapshots of validation reports when customer opts in.

## What AutoEnroll Must Not Store
- Raw payroll files by default (zero-retention mode).
- PPSN, names, addresses, DOB in logs or diagnostics.
- Unencrypted sensitive fields at rest; never store without explicit customer opt-in.

## Data Minimisation
- Strip/avoid unnecessary columns (addresses, phone numbers, bank details).
- Pseudonymise identifiers (hash PPSN, employee IDs) immediately after parsing.
- Store only derived fields needed for compliance decision (age, age band, salary band, eligibility result, risk counts).

## Retention Limitations
- Default **zero-retention**: dispose of files and derived personal data immediately after report generation.
- Optional **time-boxed retention**: encrypted storage with explicit duration (e.g., 30 days) configurable per organisation.
- Honor deletion requests instantly; propagate to backups via encryption key destruction.

## Need for Zero-Retention Model
- Payroll files are highly sensitive; avoiding storage reduces breach exposure and simplifies GDPR obligations.
- Supports processor role with minimal data footprint; customers can still download PDF reports and manage their own records.

## Pseudonymisation Rules
- Hash PPSN and employee IDs with salted SHA-256; never log raw values.
- Derive age from DOB then discard DOB unless retention explicitly enabled.
- Keep only hashed identifier + derived eligibility outcomes for analytics.

## Security & Access Control
- Enforce least privilege: scoped API tokens per organisation, role-based access to reports.
- Encryption in transit (TLS) and at rest for any retained artifacts.
- No PII in logs; event logs should use hashed IDs.
- Regular access reviews; MFA for admin accounts.
