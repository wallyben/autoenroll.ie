# Data Processing Agreement (DPA)

**Effective Date**: November 23, 2025

This Data Processing Agreement ("DPA") forms part of the Terms of Service between AutoEnroll.ie ("Processor") and the customer ("Controller") for the provision of pension auto-enrolment compliance services.

## 1. Definitions

**Personal Data**: Employee information processed through the Service  
**Data Subject**: Individual employees whose data is processed  
**Processing**: Any operation performed on Personal Data  
**Sub-processor**: Third-party service providers

## 2. Scope and Roles

### 2.1 Controller's Role
Controller determines purposes and means of processing employee data.

### 2.2 Processor's Role
Processor processes Personal Data only on Controller's documented instructions.

### 2.3 Data Processed
- Employee names
- Dates of birth
- PPS numbers
- Employment information
- Salary data
- Email addresses

## 3. Processor's Obligations

### 3.1 Processing Instructions
- Process only as per Controller's instructions
- Notify Controller if instructions violate GDPR
- Do not process for own purposes

### 3.2 Confidentiality
- Ensure personnel are bound by confidentiality
- Limit access to authorized personnel only
- Maintain strict confidentiality of Personal Data

### 3.3 Security Measures
- Implement appropriate technical and organizational measures
- Encryption of data in transit (TLS/HTTPS)
- Pseudonymisation during processing
- Access controls and authentication
- Regular security assessments
- Immediate deletion post-processing

### 3.4 Sub-processors
- Maintain list of Sub-processors
- Notify Controller of changes
- Ensure Sub-processors bound by equivalent obligations
- Remain liable for Sub-processor's actions

**Current Sub-processors:**
- Stripe (payment processing - no employee data)
- Hosting provider (infrastructure - encrypted data only)

### 3.5 Data Subject Rights
- Assist Controller in responding to requests
- Provide necessary information within 7 days
- Support Controller in GDPR compliance

### 3.6 Data Breach
- Notify Controller within 24 hours of becoming aware
- Provide all relevant information
- Cooperate in breach investigation and remediation
- Document all breaches

### 3.7 Data Deletion
- Delete all Personal Data immediately after processing
- Confirm deletion upon Controller request
- No data retention except metadata

### 3.8 Audit Rights
- Allow Controller to audit compliance
- Provide information on processing activities
- Submit to third-party audits if requested

## 4. Controller's Obligations

### 4.1 Legal Basis
- Ensure lawful basis for processing
- Obtain necessary consents from Data Subjects
- Inform Data Subjects of processing

### 4.2 Instructions
- Provide clear, documented instructions
- Ensure instructions comply with GDPR
- Update instructions as needed

### 4.3 Data Quality
- Ensure accuracy of uploaded data
- Verify rights to process data
- Maintain data subject consent records

## 5. Data Transfers

### 5.1 Location
- All processing within EU/EEA
- No transfers to third countries without:
  - Controller's prior authorization
  - Appropriate safeguards (SCCs, adequacy decision)

### 5.2 Safeguards
- Standard Contractual Clauses if required
- Binding Corporate Rules where applicable
- Adequacy decisions recognized

## 6. Term and Termination

### 6.1 Duration
This DPA remains in effect while Services are provided.

### 6.2 Post-Termination
- Delete or return all Personal Data within 30 days
- Provide certification of deletion
- Delete all copies and backups

## 7. Liability and Indemnification

### 7.1 Processor Liability
Processor liable for damages caused by:
- Processing outside Controller instructions
- Failure to implement security measures
- Use of unauthorized Sub-processors

### 7.2 Limitation
- Liability limited as per Terms of Service
- Excludes liability for Controller's GDPR violations

## 8. International Compliance

This DPA complies with:
- GDPR (Regulation (EU) 2016/679)
- Irish Data Protection Act 2018
- UK GDPR (if applicable)

## 9. Specific Processing Activities

| Activity | Purpose | Legal Basis | Retention |
|----------|---------|-------------|-----------|
| Upload validation | Data quality | Contractual | 0 days |
| Eligibility calc | Compliance | Contractual | 0 days |
| Report generation | Documentation | Contractual | 0 days |
| Metadata logging | Analytics | Legitimate Interest | 30 days |

## 10. Security Measures

### 10.1 Technical Measures
- ✓ Encryption (TLS 1.3)
- ✓ Access controls (JWT)
- ✓ Pseudonymisation (SHA-256)
- ✓ Secure password storage (bcrypt)
- ✓ Rate limiting
- ✓ Input validation

### 10.2 Organizational Measures
- ✓ Staff training
- ✓ Confidentiality agreements
- ✓ Incident response plan
- ✓ Regular audits
- ✓ Vendor management
- ✓ Documentation

## 11. Data Subject Rights Support

Processor will assist Controller with:
- Right to access
- Right to rectification
- Right to erasure
- Right to restriction
- Right to data portability
- Right to object

Response time: Within 7 days of request

## 12. Notifications

### 12.1 Data Breach
- **Timeline**: Within 24 hours
- **Method**: Email to registered address
- **Content**: Nature, categories, approximate numbers, consequences, measures

### 12.2 Sub-processor Changes
- **Timeline**: 30 days prior notice
- **Method**: Email notification
- **Right to Object**: Controller may object within 14 days

## 13. Certification and Audit

### 13.1 Compliance Certification
Processor maintains:
- SOC 2 Type II certification (in progress)
- ISO 27001 certification (in progress)
- Regular penetration testing
- Annual third-party audits

### 13.2 Audit Rights
Controller may:
- Request compliance documentation
- Conduct on-site audits (reasonable notice)
- Engage third-party auditors
- Review security measures

Audit costs borne by Controller unless breach found.

## 14. Amendments

- DPA may be amended to reflect legal changes
- Material changes require Controller consent
- Minor updates with 30 days notice

## 15. Governing Law

This DPA is governed by the laws of Ireland.

## 16. Contact

**Data Protection Officer**  
Email: dpo@autoenroll.ie  
Phone: [Number]  
Address: [Address]

**Technical Support**  
Email: support@autoenroll.ie

---

## Signatures

**Processor: AutoEnroll.ie**

By using the Service, Controller acknowledges and accepts this DPA.

**Date**: November 23, 2025  
**Version**: 1.0

---

## Appendix A: Sub-processor List

| Sub-processor | Service | Location | Data Processed |
|---------------|---------|----------|----------------|
| Stripe | Payment processing | EU | None (employee data) |
| [Hosting Provider] | Infrastructure | EU | Encrypted data only |
| [Email Service] | Transactional emails | EU | Account emails only |

**Last Updated**: November 23, 2025

## Appendix B: Standard Contractual Clauses

Standard Contractual Clauses (SCCs) approved by EU Commission apply where data is transferred outside EU/EEA.
