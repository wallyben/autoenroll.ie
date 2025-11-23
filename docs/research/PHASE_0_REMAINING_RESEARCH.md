# PHASE 0: CSV/XLSX FIELD MAPPING RESEARCH

## Payroll Provider Export Formats

### BrightPay Export Structure
**Standard Fields:**
- Employee_Number / EmployeeID
- First_Name / FirstName  
- Surname / LastName
- Date_Of_Birth / DOB (dd/MM/yyyy)
- PPS_Number / PPSN
- Employment_Start_Date (dd/MM/yyyy)
- Gross_Pay / Annual_Salary
- Payment_Frequency (Weekly/Monthly)
- Hours_Per_Week
- Employment_Type (Permanent/Fixed/Casual)

**Common Issues:**
- PPSN format variations (spaces, lowercase)
- Date format inconsistency (dd/MM vs MM/dd)
- Salary reported as weekly not annual
- Missing employment start dates

### Thesaurus Payroll Manager
**Standard Fields:**
- EmpNo / Staff_ID
- Forename / Christian_Name
- Surname / Family_Name  
- Birth_Date (yyyy-MM-dd)
- PPS_No
- Start_Date (yyyy-MM-dd)
- Annual_Earnings / Yearly_Gross
- Pay_Period (W/F/M)
- Weekly_Hours
- Contract_Type

**Common Issues:**
- Inconsistent column headers
- NULL values for optional fields
- Decimal precision errors in salary
- Date parsing failures

### Sage Business Cloud Payroll
**Standard Fields:**
- EmployeeReference
- GivenName
- FamilyName
- DateOfBirth (ISO 8601)
- NationalInsuranceNumber / TaxNumber
- HireDate
- AnnualSalary
- PaymentMethod
- ContractedHours
- EmploymentBasis

**Common Issues:**
- Uses UK NI number field for PPSN
- ISO date format (different from Irish formats)
- "EmploymentBasis" vs "EmploymentType" terminology

### Generic CSV/XLSX Patterns
**Must Support:**
- First/Last name combined OR separated
- Date formats: ISO, dd/MM/yyyy, MM/dd/yyyy, dd-MM-yyyy
- Salary: annual, monthly, weekly (with frequency flag)
- PPSN: with/without spaces, upper/lowercase
- Boolean fields: Yes/No, Y/N, True/False, 1/0

**Field Mapping Strategy:**
```typescript
const FIELD_MAPPINGS = {
  employeeId: ['Employee_Number', 'EmployeeID', 'EmpNo', 'Staff_ID', 'EmployeeReference'],
  firstName: ['First_Name', 'FirstName', 'Forename', 'Christian_Name', 'GivenName'],
  lastName: ['Surname', 'LastName', 'Family_Name', 'FamilyName'],
  dateOfBirth: ['Date_Of_Birth', 'DOB', 'Birth_Date', 'DateOfBirth'],
  ppsn: ['PPS_Number', 'PPSN', 'PPS_No', 'NationalInsuranceNumber', 'TaxNumber'],
  employmentStartDate: ['Employment_Start_Date', 'Start_Date', 'HireDate'],
  annualSalary: ['Gross_Pay', 'Annual_Salary', 'Annual_Earnings', 'Yearly_Gross', 'AnnualSalary'],
  payFrequency: ['Payment_Frequency', 'Pay_Period', 'PaymentMethod'],
  hoursPerWeek: ['Hours_Per_Week', 'Weekly_Hours', 'ContractedHours'],
  contractType: ['Employment_Type', 'Contract_Type', 'EmploymentBasis']
}
```

## Validation Requirements

**Mandatory Fields:** employeeId, firstName, lastName, dateOfBirth, ppsn, employmentStartDate, annualSalary
**Optional Fields:** payFrequency, hoursPerWeek, contractType, hasOptedOut

**Intelligent Detection:**
- Auto-detect column headers (fuzzy match)
- Warn if critical fields missing
- Suggest mappings for unmapped columns
- Allow manual column mapping in UI

---

# PHASE 0: GDPR COMPLIANCE SUMMARY

## Lawful Basis: Legitimate Interest (Art 6(1)(f))
Processing necessary for compliance checking services. Data subjects' rights do not override legitimate interest.

## Controller/Processor: Processor Role
AutoEnroll.ie acts as data processor. Employer is controller. DPA required.

## Minimal Data: Zero-Retention Achieved
✅ No disk writes, ✅ <5sec retention, ✅ Pseudonymisation, ✅ Aggregated results only

## Art 32 Security: Implemented
✅ Encryption in transit (TLS 1.3), ✅ Memory-only processing, ✅ Access controls, ✅ Audit logging (no PII)

---

# PHASE 0: SME BUYER PSYCHOLOGY

## Target Segments

**Segment 1: Payroll Bureaus (15-500 clients)**
- Pain: Manual compliance checking across dozens of clients
- Budget: €50-200 per check acceptable if saves 2+ hours
- Decision: Operational lead, evaluated on efficiency
- Friction: Must trust accuracy, needs white-label option

**Segment 2: Accountants (5-50 SME clients)**  
- Pain: Year-end compliance panic, liability risk
- Budget: €50-100 per client per year (billable to client)
- Decision: Partner/senior accountant, evaluated on risk reduction
- Friction: Needs audit trail, professional reports

**Segment 3: SMEs (1-50 employees)**
- Pain: Don't understand auto-enrolment, fear penalties
- Budget: €50 one-off acceptable vs €500 consultant
- Decision: Owner/office manager, evaluated on cost
- Friction: Needs simplicity, clear pricing, instant results

## Key Buying Triggers
1. **Fear of penalties** (Revenue fines up to €50k)
2. **Time savings** (2-4 hours manual work → 2 minutes)
3. **Accuracy guarantee** (Revenue-validated calculations)
4. **No subscription** (one-off payment preferred)
5. **Instant results** (10-20 seconds vs days)

## Friction Points to Eliminate
- Complex sign-up (reduce to 30 seconds)
- Unclear pricing (show €49 upfront)
- Data security concerns (zero-retention messaging)
- Feature overload (progressive disclosure)
- Payment commitment before seeing value (instant preview)

---

# PHASE 0: COMPETITOR ANALYSIS

## Competitor 1: Manual Consultants
**Price:** €500-2000 per engagement
**Speed:** 3-7 days turnaround
**Accuracy:** High (human expertise)
**Scalability:** Low (manual)
**Our Advantage:** 50x faster, 10x cheaper, equal accuracy

## Competitor 2: Generic Payroll Software
**Price:** €30-100/month subscription
**Speed:** Real-time (integrated)
**Accuracy:** Variable (depends on setup)
**Scalability:** High (automated)
**Our Advantage:** No long-term commitment, works with any payroll system, compliance-focused

## Competitor 3: Excel Templates (Free)
**Price:** Free
**Speed:** 1-2 hours (manual)
**Accuracy:** Low (user error prone)
**Scalability:** Very low
**Our Advantage:** Automated validation, guaranteed accuracy, professional reports, €49 is worth avoiding errors

## Market Positioning
**"The fastest auto-enrolment checker in Ireland"**
- Speed: 10-20 seconds (vs hours/days)
- Price: €49 one-off (vs subscriptions/consultants)
- Trust: Zero-retention, Revenue-validated
- Access: Instant, no signup required for preview
