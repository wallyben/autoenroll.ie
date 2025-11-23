# Irish Auto-Enrolment Research Summary

## Irish Auto-Enrolment System Overview
Auto-enrolment (AE) in Ireland, governed by the National Automatic Enrolment Retirement Savings Authority (NAERSA) framework, automatically enrolls eligible employees into a workplace retirement savings plan. Employers must facilitate enrollment, contributions, and communications while allowing defined opt-out and opt-in windows.

## Eligibility Logic
- **Age**: Employees aged 23 to 60 are automatically enrolled. Outside this band, they may opt in voluntarily.
- **Income**: Qualifying earnings threshold typically aligns with the lower earnings limit; for practicality we use €20,000 annualised gross earnings (configurable per deployment) as the default enrollment trigger.
- **Employment Status**: Must be an active employee (not contractor) with payable earnings in period.
- **Exemptions**: Existing occupational pension with qualifying benefits, recent opt-out (within re-enrolment buffer), or statutory exclusions.
- **Re-enrolment**: Opt-outs are re-invited after a cooling-off period (commonly 2 years) or at statutory re-enrolment cycles.

## Contribution Model
- **Default Rates** (escalating):
  - Employer: 1.5% year 1, 2.5% year 2, 3.5% year 3, 6% steady-state (configurable).
  - Employee: Mirrors employer escalation (1.5% → 6%).
  - State: Flat top-up (e.g., 0.5% of earnings) when applicable.
- **Earnings Basis**: Qualifying earnings between lower/upper bands (default: €20,000 – €80,000). Contributions only apply to qualifying slice.
- **Proration**: For weekly/monthly payroll, thresholds are pro-rated by period length.

## Opt-Out / Opt-In Timelines
- **Opt-Out Window**: Employees can opt out between weeks 7–8 after initial enrollment and request refund of contributions.
- **Opt-In / Rejoin**: Employees previously opted out can rejoin at any time; re-enrolment campaigns target them automatically at statutory intervals (e.g., every 2–3 years).
- **Suspension**: Temporary suspension allowed for certain statutory leaves; contributions pause but eligibility persists when pay resumes.

## Employer Obligations
- Assess eligibility each pay period using age and income.
- Enrol eligible employees and remit contributions on time.
- Provide mandatory communications (welcome, opt-out rights, contribution notices).
- Maintain records demonstrating compliance and opt-out decisions.
- Secure handling of employee data under GDPR; avoid unnecessary retention.

## Payroll Structures (BrightPay, Thesaurus, Sage)
Typical payroll exports include:
- **Employee Identifiers**: Employee number, PPSN, name fields.
- **Demographics**: Date of birth, employment start date, PRSI class.
- **Earnings**: Gross pay, pensionable pay, taxable pay, deductions, PRSI contributions.
- **Periods**: Pay frequency, period start/end, payment date.
- **Status Flags**: Leaver indicator, AE opt-out status, existing scheme membership.

### Field Expectations
- Required: Employee number, PPSN, date of birth (or age), pay period end date, gross pay, pay frequency, PRSI class.
- Optional but recommended: Employment start date, department, existing pension flag, AE opt-out flag, address (should be stripped prior to upload), email (should not be uploaded).

### Typical Errors
- Missing or invalid PPSN format; duplicates across rows.
- DOB missing/implausible (age < 16 or > 75).
- PRSI class mismatched with earnings or employment type.
- Negative or zero gross pay outside corrections.
- Pay frequency inconsistent with period dates.
- Duplicate employees across payroll runs.
- Opt-out flags set for employees who were never enrolled.

## Validation Coverage
- **Structural**: Header presence, data types, date formats, numeric ranges, required field completion.
- **Logical**: Age calculation, pay-frequency alignment, PRSI-class vs employment type, opt-out timing relative to join date, duplicate PPSN/employee IDs.
- **Eligibility Determination**: Age + income thresholds with configurable bands; opt-out recency check; existing scheme exclusion.
- **Risk Scoring**: Severity mapped to compliance impact (critical/high/warning/info) based on validation outcome.
