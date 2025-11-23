# Security Overview

**Last Updated**: November 23, 2025

## Executive Summary

AutoEnroll.ie implements enterprise-grade security measures to protect your data. Our zero-retention architecture ensures that employee personal data is never stored, providing inherent security through data minimization.

## Security Architecture

### Defense in Depth
Multiple layers of security controls:
1. **Network Layer**: TLS/HTTPS encryption, firewall rules
2. **Application Layer**: Input validation, authentication, authorization
3. **Data Layer**: Encryption, pseudonymisation, immediate deletion
4. **Process Layer**: Security policies, incident response, audits

## Data Security

### Encryption

#### Data in Transit
- **TLS 1.3** for all communications
- **HTTPS** mandatory for all connections
- **Certificate pinning** for API communications
- **HSTS** headers enforced

#### Data at Rest
- **Bcrypt** (10 rounds) for password hashing
- **AES-256** for any temporary file storage
- **SHA-256** for pseudonymisation hashing
- **Encrypted database connections**

### Data Handling

#### Upload Processing
```
1. File received over HTTPS
2. Stored temporarily on encrypted disk
3. Parsed and loaded into memory
4. Processing completed
5. File deleted from disk
6. Memory cleared
```

#### Zero Retention
- **Personal data**: 0 seconds after processing
- **Upload files**: Deleted within minutes
- **Processing results**: Cleared from memory
- **Only metadata**: Upload count, timestamp (no PII)

## Access Control

### Authentication
- **JWT tokens** with configurable expiration
- **Refresh tokens** for session management
- **Bcrypt hashing** for password storage
- **Password complexity** requirements enforced
- **Account lockout** after failed attempts

### Authorization
- **Role-based access control** (RBAC)
- **Principle of least privilege**
- **API endpoint protection**
- **User owns their data** - no cross-user access

### Session Management
- **Secure token storage**
- **Automatic session expiration**
- **Token rotation** on refresh
- **Logout** clears all tokens

## Application Security

### Input Validation
- **Zod schema validation** on all inputs
- **File type restrictions** (CSV, XLSX only)
- **File size limits** (10MB max)
- **SQL injection prevention** via parameterized queries
- **XSS prevention** through sanitization
- **CSRF protection** via tokens

### API Security
- **Rate limiting**: 100 requests per 15 minutes
- **Request throttling** for expensive operations
- **API versioning** for stability
- **Error messages** don't leak sensitive info

### Code Security
- **TypeScript** for type safety
- **Linting** with strict rules
- **Dependency scanning** for vulnerabilities
- **Regular updates** of dependencies
- **Code reviews** before deployment

## Infrastructure Security

### Hosting
- **Cloud provider** with SOC 2 Type II certification
- **DDoS protection** enabled
- **Network isolation** between services
- **Automated backups** (excluding PII)
- **Geographic redundancy**

### Database
- **PostgreSQL** with security hardening
- **Encrypted connections** only
- **Restricted network access**
- **Connection pooling** with limits
- **Regular security patches**

### Monitoring
- **Real-time alerts** for security events
- **Failed login tracking**
- **Unusual activity detection**
- **Performance monitoring**
- **Uptime monitoring**

## Operational Security

### Development Practices
- **Secure SDLC** methodology
- **Code reviews** mandatory
- **Security testing** before release
- **Penetration testing** annually
- **Vulnerability disclosure** program

### Deployment
- **CI/CD pipeline** with security checks
- **Automated testing** including security tests
- **Staging environment** for validation
- **Blue-green deployments** for zero downtime
- **Rollback procedures** in place

### Access Management
- **SSH key authentication** only
- **2FA** for production access
- **Audit logging** of all access
- **Time-limited credentials**
- **Principle of least privilege**

## Incident Response

### Detection
- **Automated monitoring** 24/7
- **Log aggregation** and analysis
- **Anomaly detection** systems
- **Security information and event management (SIEM)**

### Response Plan
1. **Detection**: Identify potential security incident
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine scope and impact
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update procedures

### Communication
- **Users notified** within 72 hours of confirmed breach
- **Regulatory authorities** notified as required
- **Transparent communication** about incident
- **Regular updates** until resolution

## Compliance and Certifications

### Current Compliance
- ✓ **GDPR** (EU General Data Protection Regulation)
- ✓ **Irish Data Protection Act 2018**
- ✓ **UK GDPR** (where applicable)
- ✓ **PCI DSS** via Stripe for payments

### In Progress
- ⏳ **ISO 27001** Information Security Management
- ⏳ **SOC 2 Type II** Security audit
- ⏳ **Cyber Essentials Plus** (UK)

### Regular Audits
- **Internal audits**: Quarterly
- **External audits**: Annually
- **Penetration testing**: Annually
- **Vulnerability scanning**: Continuous

## Third-Party Security

### Vendor Management
- **Security assessment** before onboarding
- **Contracts** include security requirements
- **Regular reviews** of vendor security
- **Limited data sharing** (only necessary)

### Sub-processors
| Vendor | Purpose | Security Certification |
|--------|---------|------------------------|
| Stripe | Payments | PCI DSS Level 1 |
| [Hosting] | Infrastructure | SOC 2 Type II |
| [Email] | Transactional emails | ISO 27001 |

## Physical Security

### Data Centers
- **Tier III+** certified facilities
- **24/7 security** personnel
- **Biometric access** controls
- **Video surveillance**
- **Environmental controls**

## Business Continuity

### Backup and Recovery
- **Automated backups** daily
- **Geo-redundant** storage
- **Encrypted backups**
- **Regular restore testing**
- **RTO**: 4 hours
- **RPO**: 1 hour

### Disaster Recovery
- **DR plan** documented and tested
- **Failover procedures** automated
- **Alternative infrastructure** ready
- **Annual DR drills**

## Employee Security

### Training
- **Security awareness** training for all staff
- **Quarterly** refresher courses
- **Phishing simulations**
- **Secure coding** training for developers

### Policies
- **Acceptable use policy**
- **Clean desk policy**
- **Password policy**
- **BYOD policy**
- **Remote work** security guidelines

### Background Checks
- **Employment verification**
- **Criminal background checks** where applicable
- **Reference checks**
- **Confidentiality agreements** signed

## Vulnerability Management

### Scanning
- **Automated scanning** of infrastructure
- **Dependency checking** in CI/CD
- **OWASP Top 10** testing
- **API security** testing

### Patching
- **Critical patches**: Within 24 hours
- **High severity**: Within 7 days
- **Medium/Low**: Within 30 days
- **Testing** before production deployment

### Bug Bounty
- **Responsible disclosure** program
- **Security researchers** welcomed
- **Rewards** for valid vulnerabilities
- **Email**: security@autoenroll.ie

## Privacy-Enhancing Technologies

### Pseudonymisation
- **Irreversible hashing** of identifiers
- **Data aggregation** for analytics
- **Differential privacy** techniques
- **K-anonymity** for reporting

### Data Minimization
- **Only necessary** data collected
- **Immediate deletion** after processing
- **No analytics** cookies
- **Minimal metadata** retention

## Continuous Improvement

### Security Roadmap
- Q1 2026: ISO 27001 certification
- Q2 2026: SOC 2 Type II audit completion
- Q3 2026: Advanced threat protection
- Q4 2026: Security operations center (SOC)

### Regular Reviews
- **Quarterly** security assessments
- **Annual** penetration tests
- **Continuous** vulnerability scanning
- **Monthly** security metrics review

## Contact Security Team

### General Inquiries
Email: security@autoenroll.ie

### Vulnerability Reports
Email: security@autoenroll.ie  
PGP Key: [Key ID]

### Incident Reports
Email: incidents@autoenroll.ie  
Phone: [Emergency Number]

---

**Version**: 1.0  
**Last Review**: November 23, 2025  
**Next Review**: February 23, 2026
