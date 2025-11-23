/**
 * Test Data Fixtures - Mock Payroll CSVs, Employees, and Test Cases
 */

export const VALID_CSV_HEADERS = [
  'employee_id',
  'first_name',
  'last_name',
  'date_of_birth',
  'ppsn',
  'email',
  'employment_start_date',
  'employment_status',
  'contract_type',
  'hours_per_week',
  'annual_salary',
  'pay_frequency',
  'prsi_class',
  'has_opted_out',
  'opt_out_date'
]

export const VALID_EMPLOYEE_ROW = {
  employee_id: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1985-03-15',
  ppsn: '1234567T',
  email: 'john.doe@example.com',
  employment_start_date: '2020-01-15',
  employment_status: 'active',
  contract_type: 'permanent',
  hours_per_week: '40',
  annual_salary: '45000',
  pay_frequency: 'monthly',
  prsi_class: 'A',
  has_opted_out: 'false',
  opt_out_date: ''
}

export const ELIGIBLE_EMPLOYEES = [
  {
    employee_id: 'EMP001',
    first_name: 'Sarah',
    last_name: 'Murphy',
    date_of_birth: '1988-05-20', // Age 37 (between 23-60)
    ppsn: '1234567T',
    email: 'sarah.murphy@test.com',
    employment_start_date: '2018-03-01', // Over 6 months
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '35000', // Above €20,000 threshold
    pay_frequency: 'monthly',
    prsi_class: 'A', // Eligible class
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP002',
    first_name: 'Michael',
    last_name: 'O\'Brien',
    date_of_birth: '1992-11-10', // Age 33
    ppsn: '2345678T',
    email: 'michael.obrien@test.com',
    employment_start_date: '2019-06-15',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '38',
    annual_salary: '42000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP003',
    first_name: 'Emma',
    last_name: 'Kelly',
    date_of_birth: '1995-07-22', // Age 30
    ppsn: '3456789T',
    email: 'emma.kelly@test.com',
    employment_start_date: '2021-01-10',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '35',
    annual_salary: '28000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  }
]

export const INELIGIBLE_EMPLOYEES = [
  {
    employee_id: 'EMP101',
    first_name: 'Young',
    last_name: 'Worker',
    date_of_birth: '2005-01-01', // Age 20 (under 23)
    ppsn: '4567890T',
    email: 'young.worker@test.com',
    employment_start_date: '2023-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '30000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP102',
    first_name: 'Elderly',
    last_name: 'Worker',
    date_of_birth: '1960-01-01', // Age 65 (over 60)
    ppsn: '5678901T',
    email: 'elderly.worker@test.com',
    employment_start_date: '2010-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '50000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP103',
    first_name: 'Low',
    last_name: 'Earner',
    date_of_birth: '1990-01-01', // Age 35
    ppsn: '6789012T',
    email: 'low.earner@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '20',
    annual_salary: '12000', // Below €20,000 threshold
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP104',
    first_name: 'Public',
    last_name: 'Servant',
    date_of_birth: '1985-01-01', // Age 40
    ppsn: '7890123T',
    email: 'public.servant@test.com',
    employment_start_date: '2015-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '55000',
    pay_frequency: 'monthly',
    prsi_class: 'D', // Ineligible PRSI class
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    employee_id: 'EMP105',
    first_name: 'Opted',
    last_name: 'Out',
    date_of_birth: '1987-06-15', // Age 38
    ppsn: '8901234T',
    email: 'opted.out@test.com',
    employment_start_date: '2019-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '40000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'true', // Has opted out
    opt_out_date: '2024-09-01'
  },
  {
    employee_id: 'EMP106',
    first_name: 'New',
    last_name: 'Starter',
    date_of_birth: '1990-03-20', // Age 35
    ppsn: '9012345T',
    email: 'new.starter@test.com',
    employment_start_date: '2024-10-01', // Less than 6 months
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '35000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  }
]

export const EDGE_CASE_EMPLOYEES = [
  {
    // Exactly 23 years old (boundary test)
    employee_id: 'EDGE001',
    first_name: 'Boundary',
    last_name: 'Age23',
    date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - 23)).toISOString().split('T')[0],
    ppsn: '0123456T',
    email: 'age23@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '25000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    // Exactly 60 years old (boundary test)
    employee_id: 'EDGE002',
    first_name: 'Boundary',
    last_name: 'Age60',
    date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - 60)).toISOString().split('T')[0],
    ppsn: '1234560T',
    email: 'age60@test.com',
    employment_start_date: '2010-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '50000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    // Exactly €20,000 salary (boundary test)
    employee_id: 'EDGE003',
    first_name: 'Boundary',
    last_name: 'Salary',
    date_of_birth: '1990-01-01',
    ppsn: '2345601T',
    email: 'salary.boundary@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '20000', // Exactly at threshold
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    // Weekly paid employee
    employee_id: 'EDGE004',
    first_name: 'Weekly',
    last_name: 'Paid',
    date_of_birth: '1988-05-15',
    ppsn: '3456012T',
    email: 'weekly.paid@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '30000',
    pay_frequency: 'weekly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    // Part-time employee (borderline hours)
    employee_id: 'EDGE005',
    first_name: 'Part',
    last_name: 'Time',
    date_of_birth: '1991-08-20',
    ppsn: '4560123T',
    email: 'part.time@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '20',
    annual_salary: '22000', // Pro-rata eligible
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  }
]

export const INVALID_DATA_ROWS = [
  {
    // Missing required fields
    employee_id: '',
    first_name: 'Missing',
    last_name: 'Data',
    date_of_birth: '',
    ppsn: '',
    email: 'invalid-email',
    employment_start_date: '',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: 'forty', // Invalid number
    annual_salary: 'not-a-number',
    pay_frequency: 'monthly',
    prsi_class: 'X', // Invalid PRSI class
    has_opted_out: 'maybe', // Invalid boolean
    opt_out_date: 'not-a-date'
  },
  {
    // Invalid date formats
    employee_id: 'INV001',
    first_name: 'Invalid',
    last_name: 'Dates',
    date_of_birth: '32/13/2000', // Invalid date
    ppsn: '1234567T',
    email: 'invalid.dates@test.com',
    employment_start_date: '2025-15-45', // Invalid date
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '40',
    annual_salary: '30000',
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  },
  {
    // Negative values
    employee_id: 'INV002',
    first_name: 'Negative',
    last_name: 'Values',
    date_of_birth: '1990-01-01',
    ppsn: '2345678T',
    email: 'negative@test.com',
    employment_start_date: '2020-01-01',
    employment_status: 'active',
    contract_type: 'permanent',
    hours_per_week: '-10', // Negative hours
    annual_salary: '-5000', // Negative salary
    pay_frequency: 'monthly',
    prsi_class: 'A',
    has_opted_out: 'false',
    opt_out_date: ''
  }
]

export const LARGE_DATASET_GENERATOR = (count: number) => {
  const employees = []
  for (let i = 1; i <= count; i++) {
    employees.push({
      employee_id: `EMP${String(i).padStart(6, '0')}`,
      first_name: `FirstName${i}`,
      last_name: `LastName${i}`,
      date_of_birth: `${1960 + (i % 40)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      ppsn: `${String(i).padStart(7, '0')}T`,
      email: `employee${i}@test.com`,
      employment_start_date: `${2015 + (i % 10)}-01-01`,
      employment_status: 'active',
      contract_type: 'permanent',
      hours_per_week: String(30 + (i % 20)),
      annual_salary: String(20000 + (i % 50000)),
      pay_frequency: i % 2 === 0 ? 'monthly' : 'weekly',
      prsi_class: i % 10 === 0 ? 'D' : 'A', // 10% ineligible PRSI class
      has_opted_out: i % 20 === 0 ? 'true' : 'false', // 5% opted out
      opt_out_date: i % 20 === 0 ? '2024-06-01' : ''
    })
  }
  return employees
}

export const MOCK_STRIPE_EVENTS = {
  paymentSucceeded: {
    id: 'evt_test_payment_succeeded',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_12345',
        amount: 4900,
        currency: 'eur',
        customer: 'cus_test_12345',
        metadata: {
          userId: 'user_123',
          reportId: 'report_456'
        }
      }
    }
  },
  paymentFailed: {
    id: 'evt_test_payment_failed',
    type: 'payment_intent.payment_failed',
    data: {
      object: {
        id: 'pi_test_67890',
        amount: 4900,
        currency: 'eur',
        customer: 'cus_test_67890',
        last_payment_error: {
          message: 'Your card was declined'
        }
      }
    }
  },
  subscriptionCreated: {
    id: 'evt_test_subscription_created',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_12345',
        customer: 'cus_test_12345',
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_test',
                unit_amount: 14900
              }
            }
          ]
        }
      }
    }
  }
}

export const MOCK_JWT_TOKENS = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiaWF0IjoxNjE2MjM5MDIyfQ.test',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZXhwIjoxNjE2MjM5MDIyfQ.expired',
  invalidToken: 'invalid.jwt.token'
}

export function generateCSVContent(rows: any[]): string {
  if (rows.length === 0) return ''
  
  const headers = Object.keys(rows[0]).join(',')
  const data = rows.map(row => 
    Object.values(row).map(val => `"${val}"`).join(',')
  ).join('\n')
  
  return `${headers}\n${data}`
}

export function generateXLSXMockData(rows: any[]) {
  return {
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: rows
    }
  }
}
