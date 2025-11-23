# GDPR Compliance Model

## Overview

AutoEnroll.ie is designed with GDPR compliance as a foundational principle. Our zero-retention architecture ensures that personal data is never permanently stored.

## Data Processing Principles

### 1. Data Minimization
We only process the minimum data necessary for auto-enrolment compliance:
- Employee identifiers
- Date of birth (for age calculations)
- Employment dates
- Salary information
- Hours worked

### 2. Purpose Limitation
Data is processed solely for:
- Eligibility determination
- Contribution calculations
- Compliance reporting
- Risk assessment

### 3. Storage Limitation
**Zero Retention Policy**: No personal data is stored after processing completes.

## Data Lifecycle

### Stage 1: Upload (Temporary)
- File stored temporarily on disk
- Unique identifier assigned
- Processing status tracked

### Stage 2: Processing (In-Memory)
- Data parsed into memory
- Validation performed
- Calculations executed
- Results generated

### Stage 3: Pseudonymisation (For Reporting)
- Personal identifiers hashed
- Names redacted
- Dates rounded to year
- Aggregated statistics only

### Stage 4: Deletion (Immediate)
- Upload file deleted from disk
- Processing results cleared from memory
- Only metadata retained (upload count, timestamp)

## Personal Data Handling

### Data We Process
- **Identity Data**: Name, PPSN (optional)
- **Employment Data**: Start date, contract type, status
- **Financial Data**: Salary, hours worked
- **Contact Data**: Email (optional)

### Data We Never Store
- Exact dates of birth (stored as year only)
- Full names in reports
- PPSN numbers
- Email addresses
- Any identifiable information

## Pseudonymisation Techniques

### Hashing
```
Original PPSN: 1234567A
Pseudonymised: 8f4e3d2a9b...
```

### Aggregation
```
Original: John Smith, €35,000, Age 28
Report: Employee Group 25-34, Salary Band €30k-40k
```

### Redaction
```
Original: John Smith
Report: [REDACTED]
```

## User Rights

### Right to Access
Users can download their processing results immediately after completion.

### Right to Erasure
- Automatic deletion after processing
- Manual deletion via account settings
- Complete removal of all user data

### Right to Data Portability
- Export results in JSON/PDF format
- Standardized data structures
- Machine-readable formats

### Right to Object
Users can opt out of processing at any time before upload.

## Technical Measures

### Encryption
- HTTPS/TLS for all data in transit
- bcrypt for password hashing
- SHA-256 for pseudonymisation

### Access Controls
- Role-based access control
- JWT authentication
- Rate limiting to prevent abuse

### Audit Trail
- All processing logged (without PII)
- Upload timestamps recorded
- User actions tracked

## Legal Basis

### Processing Basis
- **Contractual Necessity**: Required for service provision
- **Legitimate Interest**: Compliance with employment law
- **Consent**: Explicitly obtained during signup

### Data Controller
User/employer is the data controller. AutoEnroll.ie is the data processor.

### Data Protection Officer
Contact: dpo@autoenroll.ie

## Data Processing Agreement

We provide a comprehensive DPA that covers:
- Processing scope and purpose
- Data security measures
- Sub-processor disclosure
- Data breach procedures
- Audit rights

## Compliance Monitoring

### Regular Reviews
- Quarterly privacy impact assessments
- Annual third-party security audits
- Continuous compliance monitoring

### Breach Response
- Detection within 24 hours
- Notification within 72 hours
- Incident response team activation
- User notification if required

## Third-Party Processors

### Sub-Processors
1. **Stripe**: Payment processing (no employee data)
2. **Hosting Provider**: Infrastructure (encrypted data only)
3. **Email Service**: Transactional emails (no employee data)

### Data Transfer
- All processing within EU
- Standard Contractual Clauses where required
- Adequacy decisions respected

## Retention Periods

| Data Type | Retention Period | Justification |
|-----------|-----------------|---------------|
| Employee PII | 0 days | Zero retention |
| Upload metadata | 30 days | Service usage analytics |
| User accounts | Until deletion request | Contractual necessity |
| Audit logs | 1 year | Security and compliance |
| Aggregated statistics | Indefinite | No personal data |

## Privacy by Design

### Architecture
- Pseudonymisation by default
- Encryption at rest and in transit
- Secure coding practices
- Regular security testing

### Development Process
- Privacy impact assessments
- Code reviews for data handling
- Automated security scanning
- Penetration testing

## User Transparency

### Privacy Notice
Clear, accessible privacy policy explaining:
- What data we process
- Why we process it
- How long we keep it
- User rights

### Consent Management
- Clear opt-in mechanisms
- Granular consent options
- Easy withdrawal process

## International Compliance

### GDPR (EU)
✓ Full compliance with all articles

### UK GDPR
✓ Aligned with UK data protection law

### Irish Data Protection Act 2018
✓ Compliant with national legislation

## Certification and Standards

### ISO 27001
Security management system certified (planned)

### SOC 2 Type II
Third-party audit of security controls (planned)

### Privacy Shield (if applicable)
Certified for EU-US data transfers (if required)

## Contact

For GDPR-related inquiries:
- Email: privacy@autoenroll.ie
- DPO: dpo@autoenroll.ie
- Address: [Company Address]
