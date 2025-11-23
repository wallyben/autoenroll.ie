# GDPR Zero-Retention Architecture

## Overview

AutoEnroll.ie implements a **complete zero-retention architecture** that ensures GDPR compliance by design. No personally identifiable information (PII) is ever written to disk or stored beyond the minimum processing time.

## Core Principles

### 1. In-Memory Processing Only

**Implementation:**
- All file uploads use `multer.memoryStorage()` - files exist only in RAM
- CSV/XLSX parsing processes directly from `Buffer` objects
- No temporary files created
- No disk writes at any stage
- Automatic garbage collection after processing

**Code References:**
- `packages/backend/src/controllers/upload.controller.ts` - Memory-only upload
- `packages/backend/src/services/parser.service.ts` - Buffer-based parsing
- `packages/backend/src/services/validation.service.ts` - In-memory validation

### 2. Immediate Pseudonymisation

All PII is pseudonymised immediately upon receipt:

**Pseudonymised Fields:**
- PPSN (Personal Public Service Number)
- Date of Birth
- Full Names (when displayed)
- Email addresses (for reports)

**Algorithm:** PBKDF2 with SHA-256
- **Iterations:** 150,000 (OWASP recommended minimum)
- **Salt:** Unique per employee, 32 bytes cryptographically secure
- **Output:** 64-byte pseudonymised hash

**Implementation:**
```typescript
crypto.pbkdf2Sync(
  piiValue,           // Original PII
  uniqueSalt,         // 32-byte random salt
  150000,             // Iterations
  64,                 // Key length
  'sha256'            // Hash algorithm
)
```

### 3. Zero Disk Persistence

**What is NEVER stored:**
- Raw CSV/XLSX files
- Unpseudonymised employee data
- Date of birth values
- PPSN numbers
- Personal email addresses
- Salary information (except aggregated statistics)

**What IS stored (anonymised only):**
- Upload metadata (filename, size, timestamp)
- Validation results (error counts, types)
- Aggregated statistics (total eligible, average contributions)
- Pseudonymised identifiers (for matching only)
- Processing status

### 4. Secure Logging

**Log Policies:**
- NEVER log PII (names, DOB, PPSN, emails)
- NEVER log raw file contents
- NEVER log individual employee records
- Log only: error types, row counts, processing times, system events

**Example Safe Logs:**
```typescript
logger.info('Buffer validation completed', {
  rowsProcessed: 150,
  rowsValid: 145,
  rowsInvalid: 5,
  errorCount: 12
  // NO employee names, NO PPSN, NO DOB
});
```

## Data Flow

### Upload → Processing → Deletion

```
1. User uploads CSV/XLSX
   ↓
2. File loaded into Buffer (RAM only)
   ↓
3. Parsed from Buffer
   ↓
4. Validated in-memory
   ↓
5. PII pseudonymised immediately
   ↓
6. Eligibility calculated on pseudonymised data
   ↓
7. Results stored (anonymised statistics only)
   ↓
8. Buffer garbage collected
   ↓
9. Original data destroyed (automatic)
```

**Timeline:** Original PII exists for < 5 seconds

## GDPR Compliance Features

### Data Minimization (Article 5.1.c)
- Collect only essential fields for auto-enrolment compliance
- No marketing data
- No unnecessary personal information

### Storage Limitation (Article 5.1.e)
- Raw data: 0 seconds retention (never stored)
- Pseudonymised results: 30 days (user-configurable)
- Audit logs: 90 days (no PII)

### Integrity & Confidentiality (Article 5.1.f)
- TLS 1.3 for all data in transit
- Memory-only processing (no disk exposure)
- PBKDF2 pseudonymisation (industry standard)
- Secure session management (httpOnly, secure, sameSite cookies)

### Right to Erasure (Article 17)
- Users can delete their account
- All associated pseudonymised data deleted
- Audit logs anonymised (userId → "DELETED_USER")

### Data Protection by Design (Article 25)
- Zero-retention architecture from day one
- No refactoring needed for GDPR compliance
- Security hardened by default

## Security Measures

### File Upload Security
- **MIME type validation:** Only CSV and XLSX allowed
- **File size limit:** 10MB maximum
- **Content scanning:** Malicious pattern detection
- **Memory limits:** Prevents DoS attacks

### API Security
- **Rate limiting:** Per-IP and per-user
- **JWT authentication:** Short-lived tokens (15 minutes)
- **HTTPS only:** No plaintext transmission
- **CORS restrictions:** Whitelist frontend origin only

### Database Security
- **Encrypted at rest:** PostgreSQL with encryption
- **Parameterized queries:** SQL injection prevention
- **User isolation:** Row-level security
- **No PII storage:** Only pseudonymised data

## Audit Trail

### What We Track (Without PII)
- Upload events (timestamp, user ID, file size)
- Processing outcomes (success/failure, error types)
- Eligibility calculations (counts only, no names)
- Payment events (subscription status changes)
- Authentication events (login attempts, token refreshes)

### What We DON'T Track
- Individual employee names
- PPSN numbers
- Dates of birth
- Email addresses
- Salary amounts (except aggregates)

## Legal Basis

**Processing Lawful Under:**
- GDPR Article 6.1.b: Contract performance (user agreement)
- GDPR Article 6.1.c: Legal obligation (Irish auto-enrolment compliance)

**No Consent Required Because:**
- Processing is necessary for legal compliance
- No marketing or profiling
- Minimal data retained
- User controls data lifecycle

## Data Protection Impact Assessment (DPIA)

**Risk Level:** LOW

**Justification:**
- No high-risk processing
- No profiling or automated decisions affecting users
- No sensitive data categories (health, criminal, biometric)
- Strong technical measures (zero-retention)
- Limited data retention (30 days maximum)

**Mitigation:**
- Regular security audits
- Penetration testing
- Code reviews
- Third-party security assessments

## Third-Party Processors

### Stripe (Payment Processing)
- **Data Shared:** Email, company name only
- **Purpose:** Payment processing
- **Retention:** Per Stripe's DPA
- **DPA Status:** ✅ Executed

### Database Provider (PostgreSQL)
- **Data Shared:** Pseudonymised data only
- **Purpose:** Application database
- **Encryption:** At-rest encryption enabled
- **Location:** EU/EEA only

### Hosting Provider
- **Data Shared:** Encrypted application data
- **Purpose:** Infrastructure hosting
- **Location:** EU/EEA only
- **ISO 27001:** ✅ Certified

## User Rights Implementation

### Right to Access (Article 15)
**Endpoint:** `GET /api/user/data-export`
**Returns:** JSON with all user data (pseudonymised)

### Right to Rectification (Article 16)
**Endpoint:** `PUT /api/user/profile`
**Updates:** User profile information

### Right to Erasure (Article 17)
**Endpoint:** `DELETE /api/user/account`
**Effect:** Deletes all user data, anonymises audit logs

### Right to Data Portability (Article 20)
**Endpoint:** `GET /api/user/data-export`
**Format:** JSON or CSV

### Right to Object (Article 21)
**Not Applicable:** No profiling or automated decisions

## Breach Notification

**Procedure:**
1. Detect breach within 24 hours
2. Assess impact and affected data
3. Notify DPC within 72 hours (if high risk)
4. Notify affected users immediately
5. Document incident and remediation

**Contact:**
- Data Protection Officer: dpo@autoenroll.ie
- Security Team: security@autoenroll.ie

## Compliance Documentation

### Available Documents
- ✅ Privacy Policy (`/legal/privacy-policy.md`)
- ✅ Terms of Service (`/legal/terms-of-service.md`)
- ✅ Data Processing Agreement (`/legal/dpa.md`)
- ✅ Security Overview (`/legal/security-overview.md`)
- ✅ GDPR Zero-Retention Architecture (this document)

### Regular Reviews
- **Quarterly:** Security audit
- **Bi-annually:** DPIA review
- **Annually:** Full compliance assessment

## Technical Implementation Checklist

- [x] In-memory file processing (no disk writes)
- [x] PBKDF2 pseudonymisation (150k iterations)
- [x] Zero PII in logs
- [x] TLS 1.3 encryption
- [x] Secure session management
- [x] Rate limiting
- [x] SQL injection prevention
- [x] XSS prevention
- [x] CORS restrictions
- [x] Data export API
- [x] Account deletion API
- [x] 30-day data retention policy
- [x] Audit logging (no PII)

## Certification & Standards

**Aligned With:**
- ISO 27001 (Information Security)
- OWASP Top 10 (Web Security)
- NCSC Cyber Essentials (UK)
- NIST Cybersecurity Framework

**Compliance Status:** ✅ GDPR Compliant

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Next Review:** February 23, 2026
