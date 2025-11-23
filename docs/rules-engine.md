# Rules Engine

## Overview

The AutoEnroll.ie rules engine implements the Irish pension auto-enrolment regulations, ensuring accurate eligibility determination and contribution calculations.

## Auto-Enrolment Eligibility Rules

### Age Requirements
- **Minimum Age**: 23 years
- **Maximum Age**: 60 years
- Employees outside this range are not eligible

### Earnings Threshold
- **Minimum Annual Earnings**: €20,000
- Earnings below this threshold exclude employees from auto-enrolment

### Employment Duration
- **Waiting Period**: 6 months
- Employees must be employed for 6 continuous months before enrollment

### Employment Status
- **Eligible Statuses**: ACTIVE
- **Ineligible Statuses**: ON_LEAVE, SUSPENDED, TERMINATED

### Opt-Out Provision
- Employees can opt out after enrollment
- Opt-out must be recorded with date
- Re-enrollment after 2 years if still eligible

## Contribution Rates (Phased Implementation)

### 2024 Phase
- Employee Contribution: 1.5%
- Employer Contribution: 1.5%
- Total: 3.0%

### 2025 Phase
- Employee Contribution: 3.0%
- Employer Contribution: 3.0%
- Total: 6.0%

### 2026 Phase
- Employee Contribution: 4.5%
- Employer Contribution: 4.5%
- Total: 9.0%

### 2027+ Phase (Final)
- Employee Contribution: 6.0%
- Employer Contribution: 6.0%
- Total: 12.0%

## Pensionable Earnings

### Earnings Band
- **Lower Threshold**: €20,000
- **Upper Threshold**: €80,000
- Contributions calculated on earnings within this band

### Calculation Method
```
Pensionable Earnings = min(max(Annual Salary, €20,000), €80,000)
Employee Contribution = Pensionable Earnings × Employee Rate
Employer Contribution = Pensionable Earnings × Employer Rate
```

## Eligibility Decision Tree

```
START
  │
  ├─ Is employee 23-60 years old?
  │  ├─ NO → INELIGIBLE (Age)
  │  └─ YES → Continue
  │
  ├─ Does employee earn ≥€20,000/year?
  │  ├─ NO → INELIGIBLE (Earnings)
  │  └─ YES → Continue
  │
  ├─ Has employee worked ≥6 months?
  │  ├─ NO → INELIGIBLE (Waiting Period)
  │  └─ YES → Continue
  │
  ├─ Is employee status ACTIVE?
  │  ├─ NO → INELIGIBLE (Status)
  │  └─ YES → Continue
  │
  ├─ Has employee opted out?
  │  ├─ YES → INELIGIBLE (Opted Out)
  │  └─ NO → ELIGIBLE
  │
END
```

## Validation Rules

### Required Fields
1. Employee ID
2. First Name
3. Last Name
4. Date of Birth
5. Employment Start Date
6. Employment Status
7. Annual Salary
8. Hours Per Week
9. Pay Frequency

### Optional Fields
1. PPSN (recommended)
2. Email (recommended)
3. Opt-Out Status
4. Opt-Out Date

### Data Validation Rules

#### Employee ID
- Type: String
- Required: Yes
- Validation: Non-empty

#### Name Fields
- Type: String
- Required: Yes
- Validation: Non-empty, alphabetic characters

#### Date of Birth
- Type: Date
- Required: Yes
- Validation: Valid date, in the past

#### PPSN
- Type: String
- Required: No
- Format: 7 digits + 1-2 letters (e.g., 1234567A)
- Validation: Regex `/^\d{7}[A-Z]{1,2}$/`

#### Email
- Type: String
- Required: No
- Validation: Valid email format

#### Employment Start Date
- Type: Date
- Required: Yes
- Validation: Valid date, before current date, after date of birth

#### Annual Salary
- Type: Number
- Required: Yes
- Validation: Positive number, reasonable range (€0 - €10,000,000)

#### Hours Per Week
- Type: Number
- Required: Yes
- Validation: 0-168 hours

## Business Logic Implementation

### Eligibility Calculation
```typescript
function calculateEligibility(employee: Employee): EligibilityResult {
  const age = calculateAge(employee.dateOfBirth);
  const tenure = calculateTenure(employee.employmentStartDate);
  
  if (age < 23 || age > 60) return ineligible("Age");
  if (employee.annualSalary < 20000) return ineligible("Earnings");
  if (tenure < 6) return ineligible("Waiting Period");
  if (employee.employmentStatus !== "ACTIVE") return ineligible("Status");
  if (employee.hasOptedOut) return ineligible("Opted Out");
  
  return eligible(calculateEnrolmentDate(employee));
}
```

### Contribution Calculation
```typescript
function calculateContributions(
  salary: number,
  year: number
): Contributions {
  const rates = getRatesForYear(year);
  const pensionableEarnings = Math.min(Math.max(salary, 20000), 80000);
  
  return {
    employeeContribution: pensionableEarnings * (rates.employee / 100),
    employerContribution: pensionableEarnings * (rates.employer / 100),
  };
}
```

## Edge Cases

### Part-Time Employees
- Same rules apply regardless of hours
- Salary threshold is annual equivalent
- No minimum hours requirement

### Multiple Jobs
- Each employment assessed separately
- Earnings from single employer only
- No aggregation across employers

### Career Breaks
- Waiting period resets after break >26 weeks
- Previous service doesn't count
- New 6-month period starts on return

### Salary Changes
- Assessed on current annual salary
- Eligibility reviewed at salary change
- Contributions adjusted accordingly

### Turning 60 During Employment
- Enrolled if eligible before 60th birthday
- Contributions cease at age 60
- Can voluntarily continue if desired

## Compliance Checks

### Critical Validations
1. All mandatory fields present
2. Data types correct
3. Dates logically consistent
4. Salary within reasonable bounds
5. PPSN format valid (if provided)

### Warning Conditions
1. Missing PPSN (impacts pension setup)
2. Missing email (impacts communication)
3. Very low salary (<€20,000)
4. Very high hours (>60/week)
5. Recent employment start (<1 month)

## Risk Scoring

### High Risk (80-100)
- >20% data validation errors
- >30% missing critical fields
- >10% ineligible but should be eligible

### Medium Risk (50-79)
- 5-20% data validation errors
- 10-30% missing critical fields
- <30% eligible employees

### Low Risk (0-49)
- <5% data validation errors
- <10% missing critical fields
- >30% eligible employees

## Regulatory Updates

### Change Management
- Monitor Pensions Authority announcements
- Update rules engine when regulations change
- Version control for rule changes
- Backward compatibility maintained

### Future-Proofing
- Configurable thresholds
- Flexible rate structures
- Extensible validation framework
- Audit trail for rule changes
