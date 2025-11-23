# Testing Strategy

## Testing Philosophy

### Pyramid Structure
```
        /\
       /  \  E2E Tests (5%)
      /____\
     /      \
    /  Inte- \ Integration Tests (15%)
   /  gration \
  /____________\
 /              \
/   Unit Tests   \ Unit Tests (80%)
/__________________\
```

**Rationale:**
- Unit tests are fast, cheap, and catch most bugs
- Integration tests verify component interactions
- E2E tests ensure critical user flows work

## Unit Testing

### Backend Unit Tests

#### Parser Service Tests
```typescript
// packages/backend/src/services/__tests__/parser.service.test.ts
import { ParserService } from '../parser.service'
import { promises as fs } from 'fs'
import path from 'path'

describe('ParserService', () => {
  let parserService: ParserService

  beforeEach(() => {
    parserService = new ParserService()
  })

  describe('parseCSV', () => {
    it('should parse valid CSV file', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid.csv')
      const result = await parserService.parseCSV(filePath)
      
      expect(result).toHaveLength(10)
      expect(result[0]).toHaveProperty('employeeId')
      expect(result[0]).toHaveProperty('firstName')
      expect(result[0]).toHaveProperty('lastName')
    })

    it('should normalize header names', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'variant-headers.csv')
      const result = await parserService.parseCSV(filePath)
      
      // File has "Emp ID" but should normalize to "employeeId"
      expect(result[0]).toHaveProperty('employeeId')
      expect(result[0]).not.toHaveProperty('Emp ID')
    })

    it('should handle UTF-8 BOM', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'bom.csv')
      const result = await parserService.parseCSV(filePath)
      
      expect(result).toHaveLength(5)
    })

    it('should throw error for invalid CSV', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'invalid.csv')
      
      await expect(parserService.parseCSV(filePath))
        .rejects
        .toThrow('Failed to parse CSV')
    })
  })

  describe('parseXLSX', () => {
    it('should parse valid XLSX file', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid.xlsx')
      const result = await parserService.parseXLSX(filePath)
      
      expect(result).toHaveLength(20)
    })

    it('should use first sheet by default', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'multiple-sheets.xlsx')
      const result = await parserService.parseXLSX(filePath)
      
      expect(result[0].employeeId).toBe('E001') // First sheet data
    })

    it('should handle date columns correctly', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'dates.xlsx')
      const result = await parserService.parseXLSX(filePath)
      
      expect(result[0].startDate).toBeInstanceOf(Date)
      expect(result[0].dateOfBirth).toBeInstanceOf(Date)
    })
  })

  describe('normalizeHeaders', () => {
    it('should normalize common variations', () => {
      const headers = ['Emp ID', 'First Name', 'Sur Name', 'Gross Pay']
      const normalized = parserService.normalizeHeaders(headers)
      
      expect(normalized).toEqual(['employeeId', 'firstName', 'lastName', 'grossPay'])
    })

    it('should handle case insensitivity', () => {
      const headers = ['EMPLOYEE_ID', 'first_name', 'LastName']
      const normalized = parserService.normalizeHeaders(headers)
      
      expect(normalized).toEqual(['employeeId', 'firstName', 'lastName'])
    })

    it('should preserve unknown headers', () => {
      const headers = ['employeeId', 'customField123']
      const normalized = parserService.normalizeHeaders(headers)
      
      expect(normalized).toEqual(['employeeId', 'customField123'])
    })
  })
})
```

#### Validation Service Tests
```typescript
// packages/backend/src/services/__tests__/validation.service.test.ts
import { ValidationService } from '../validation.service'

describe('ValidationService', () => {
  let validationService: ValidationService

  beforeEach(() => {
    validationService = new ValidationService()
  })

  describe('validateEmployeeData', () => {
    it('should validate correct employee data', () => {
      const employees = [
        {
          employeeId: 'E001',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          startDate: new Date('2020-01-01'),
          employmentStatus: 'full-time',
          grossPay: 3000,
          payFrequency: 'monthly',
        },
      ]

      const result = validationService.validateEmployeeData(employees)

      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.validEmployees).toHaveLength(1)
    })

    it('should detect missing required fields', () => {
      const employees = [
        {
          employeeId: 'E001',
          // Missing firstName, lastName, etc.
        },
      ]

      const result = validationService.validateEmployeeData(employees)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'firstName',
          message: expect.stringContaining('required'),
        })
      )
    })

    it('should validate date formats', () => {
      const employees = [
        {
          employeeId: 'E001',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: 'invalid-date',
          startDate: new Date('2020-01-01'),
          employmentStatus: 'full-time',
          grossPay: 3000,
          payFrequency: 'monthly',
        },
      ]

      const result = validationService.validateEmployeeData(employees)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'dateOfBirth',
          message: expect.stringContaining('Invalid date'),
        })
      )
    })

    it('should validate employment status enum', () => {
      const employees = [
        {
          employeeId: 'E001',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          startDate: new Date('2020-01-01'),
          employmentStatus: 'invalid-status',
          grossPay: 3000,
          payFrequency: 'monthly',
        },
      ]

      const result = validationService.validateEmployeeData(employees)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'employmentStatus',
          message: expect.stringContaining('Invalid employment status'),
        })
      )
    })

    it('should generate warnings for optional fields', () => {
      const employees = [
        {
          employeeId: 'E001',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          startDate: new Date('2020-01-01'),
          employmentStatus: 'full-time',
          grossPay: 3000,
          payFrequency: 'monthly',
          // Missing email, ppsn
        },
      ]

      const result = validationService.validateEmployeeData(employees)

      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })
})
```

#### Eligibility Service Tests
```typescript
// packages/backend/src/services/__tests__/eligibility.service.test.ts
import { EligibilityService } from '../eligibility.service'
import { sub, add } from 'date-fns'

describe('EligibilityService', () => {
  let eligibilityService: EligibilityService

  beforeEach(() => {
    eligibilityService = new EligibilityService()
  })

  describe('calculateEligibility', () => {
    it('should mark eligible employee as eligible', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 30 }), // 30 years old
        startDate: sub(new Date(), { months: 12 }), // 12 months employed
        employmentStatus: 'full-time',
        grossPay: 3000,
        payFrequency: 'monthly', // €36k annual
        optedOut: false,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(true)
      expect(result[0].reason).toContain('eligible')
      expect(result[0].enrolmentDate).toBeDefined()
    })

    it('should mark too young employee as ineligible', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 22 }), // 22 years old
        startDate: sub(new Date(), { months: 12 }),
        employmentStatus: 'full-time',
        grossPay: 3000,
        payFrequency: 'monthly',
        optedOut: false,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(false)
      expect(result[0].reason).toContain('age')
    })

    it('should mark too old employee as ineligible', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 65 }), // 65 years old
        startDate: sub(new Date(), { months: 12 }),
        employmentStatus: 'full-time',
        grossPay: 3000,
        payFrequency: 'monthly',
        optedOut: false,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(false)
      expect(result[0].reason).toContain('age')
    })

    it('should mark low earnings employee as ineligible', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 30 }),
        startDate: sub(new Date(), { months: 12 }),
        employmentStatus: 'full-time',
        grossPay: 1500, // €18k annual (below €20k threshold)
        payFrequency: 'monthly',
        optedOut: false,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(false)
      expect(result[0].reason).toContain('earnings')
    })

    it('should respect waiting period', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 30 }),
        startDate: sub(new Date(), { months: 3 }), // Only 3 months employed
        employmentStatus: 'full-time',
        grossPay: 3000,
        payFrequency: 'monthly',
        optedOut: false,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(false)
      expect(result[0].reason).toContain('waiting period')
      expect(result[0].waitingPeriodEnd).toBeDefined()
    })

    it('should respect opt-out status', () => {
      const employee = {
        employeeId: 'E001',
        dateOfBirth: sub(new Date(), { years: 30 }),
        startDate: sub(new Date(), { months: 12 }),
        employmentStatus: 'full-time',
        grossPay: 3000,
        payFrequency: 'monthly',
        optedOut: true,
      }

      const result = eligibilityService.calculateEligibility([employee])

      expect(result[0].eligible).toBe(false)
      expect(result[0].reason).toContain('opted out')
    })
  })
})
```

#### Contribution Service Tests
```typescript
// packages/backend/src/services/__tests__/contribution.service.test.ts
import { ContributionService } from '../contribution.service'

describe('ContributionService', () => {
  let contributionService: ContributionService

  beforeEach(() => {
    contributionService = new ContributionService()
  })

  describe('calculateContributions', () => {
    it('should calculate Year 1-3 contributions correctly', () => {
      const employee = {
        employeeId: 'E001',
        grossPay: 3000,
        payFrequency: 'monthly',
      }

      const result = contributionService.calculateContributions([employee])

      // Year 1-3: 1.5% employee, 1.5% employer, 0.5% state
      expect(result[0].phase1.employeeMonthly).toBe(45) // 3000 * 0.015
      expect(result[0].phase1.employerMonthly).toBe(45)
      expect(result[0].phase1.stateMonthly).toBe(15)
      expect(result[0].phase1.totalMonthly).toBe(105)
    })

    it('should calculate all phases correctly', () => {
      const employee = {
        employeeId: 'E001',
        grossPay: 3000,
        payFrequency: 'monthly',
      }

      const result = contributionService.calculateContributions([employee])

      expect(result[0].phase2.employeeMonthly).toBe(90) // 3%
      expect(result[0].phase3.employeeMonthly).toBe(135) // 4.5%
      expect(result[0].phase4.employeeMonthly).toBe(180) // 6%
    })

    it('should handle weekly pay frequency', () => {
      const employee = {
        employeeId: 'E001',
        grossPay: 750,
        payFrequency: 'weekly',
      }

      const result = contributionService.calculateContributions([employee])

      // Annual: 750 * 52 = 39,000
      // Phase 1 monthly: 39000 / 12 * 0.015 = 48.75
      expect(result[0].phase1.employeeMonthly).toBeCloseTo(48.75, 2)
    })
  })
})
```

### Frontend Unit Tests (Component Testing)

```typescript
// packages/frontend/src/components/upload/__tests__/file-upload.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUpload } from '../file-upload'

describe('FileUpload', () => {
  it('should render dropzone', () => {
    const onFileSelect = jest.fn()
    render(<FileUpload onFileSelect={onFileSelect} />)
    
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
  })

  it('should call onFileSelect when file is dropped', async () => {
    const onFileSelect = jest.fn()
    render(<FileUpload onFileSelect={onFileSelect} />)
    
    const file = new File(['test'], 'test.csv', { type: 'text/csv' })
    const dropzone = screen.getByText(/drag and drop/i).parentElement
    
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file)
    })
  })

  it('should show error for invalid file type', async () => {
    const onFileSelect = jest.fn()
    render(<FileUpload onFileSelect={onFileSelect} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const dropzone = screen.getByText(/drag and drop/i).parentElement
    
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
    })
  })
})
```

## Integration Testing

### API Integration Tests

```typescript
// packages/backend/src/__tests__/integration/upload.test.ts
import request from 'supertest'
import app from '../../app'
import { createTestUser, getAuthToken } from '../helpers'

describe('Upload Integration Tests', () => {
  let authToken: string

  beforeAll(async () => {
    const user = await createTestUser()
    authToken = await getAuthToken(user.id)
  })

  describe('POST /api/upload', () => {
    it('should upload and process CSV file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'src/__tests__/fixtures/valid.csv')
        .expect(201)

      expect(response.body).toHaveProperty('uploadId')
      expect(response.body).toHaveProperty('employeeCount')
    })

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .post('/api/upload')
        .attach('file', 'src/__tests__/fixtures/valid.csv')
        .expect(401)
    })

    it('should reject files over 10MB', async () => {
      await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'src/__tests__/fixtures/large.csv')
        .expect(400)
    })
  })

  describe('POST /api/validation/validate/:uploadId', () => {
    it('should validate uploaded file', async () => {
      // First upload
      const uploadResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'src/__tests__/fixtures/valid.csv')

      const { uploadId } = uploadResponse.body

      // Then validate
      const response = await request(app)
        .post(`/api/validation/validate/${uploadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('validation')
      expect(response.body.validation).toHaveProperty('errors')
      expect(response.body.validation).toHaveProperty('warnings')
    })
  })
})
```

## End-to-End Testing

### Playwright E2E Tests

```typescript
// packages/frontend/e2e/upload-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should complete full upload and validation flow', async ({ page }) => {
    // Navigate to upload
    await page.click('text=Upload')
    await expect(page).toHaveURL('/upload')

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('e2e/fixtures/sample-payroll.csv')

    // Continue to validation
    await page.click('text=Continue to Validation')
    await page.click('text=Start Validation')

    // Wait for validation to complete
    await expect(page.locator('text=Valid Records')).toBeVisible({
      timeout: 10000,
    })

    // Process eligibility
    await page.click('text=Process Eligibility')
    await expect(page).toHaveURL(/\/results/)

    // Verify results table
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('text=Eligible')).toBeVisible()
  })

  test('should download PDF report', async ({ page }) => {
    // Navigate to results (assume data exists)
    await page.goto('/results')

    // Start download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download PDF'),
    ])

    expect(download.suggestedFilename()).toMatch(/compliance-report.*\.pdf/)
  })
})
```

## Test Coverage Targets

**Minimum Coverage Requirements:**
- Overall: 80%
- Unit Tests: 90%
- Integration Tests: 70%
- Critical paths (eligibility, validation): 95%

**Run coverage:**
```bash
# Backend
cd packages/backend
pnpm test -- --coverage

# Frontend
cd packages/frontend
pnpm test -- --coverage
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Performance Testing

### Load Testing with k6
```javascript
// tests/load/upload.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
  },
}

export default function () {
  const url = 'https://api.autoenroll.ie/upload'
  const payload = open('./fixtures/sample.csv', 'b')
  
  const response = http.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
      'Content-Type': 'text/csv',
    },
  })

  check(response, {
    'status is 201': (r) => r.status === 201,
    'upload successful': (r) => r.json('uploadId') !== undefined,
  })

  sleep(1)
}
```

**Run load tests:**
```bash
k6 run tests/load/upload.js
```

## Test Data Management

### Fixtures
```
tests/
  fixtures/
    valid.csv              # Perfect valid data
    invalid.csv            # Malformed CSV
    variant-headers.csv    # Different header names
    missing-fields.csv     # Missing required fields
    large.csv              # 10,000+ employees
    edge-cases.csv         # Boundary conditions
```

### Factories
```typescript
// tests/factories/employee.factory.ts
import { faker } from '@faker-js/faker'

export const createEmployee = (overrides = {}) => ({
  employeeId: faker.string.alphanumeric(6),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  dateOfBirth: faker.date.birthdate({ min: 23, max: 60, mode: 'age' }),
  startDate: faker.date.past({ years: 2 }),
  employmentStatus: faker.helpers.arrayElement(['full-time', 'part-time']),
  grossPay: faker.number.int({ min: 2000, max: 5000 }),
  payFrequency: 'monthly',
  ...overrides,
})
```

## Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Specific file
pnpm test parser.service.test.ts
```
