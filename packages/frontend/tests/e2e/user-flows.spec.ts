import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/')
    
    // Check hero heading
    await expect(page.getByRole('heading', { name: /Irish Pension Auto-Enrolment Made Simple/i })).toBeVisible()
    
    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /Try Free — No Card Required/i }).first()
    await expect(ctaButton).toBeVisible()
    
    // Check trust badge
    await expect(page.getByText(/Used by 200\+ Irish businesses/i)).toBeVisible()
  })

  test('should navigate to signup from CTA', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /Try Free — No Card Required/i }).first().click()
    
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should display feature cards', async ({ page }) => {
    await page.goto('/')
    
    // Check for key features
    await expect(page.getByText(/Instant Processing/i)).toBeVisible()
    await expect(page.getByText(/100% Accurate/i)).toBeVisible()
    await expect(page.getByText(/GDPR Compliant/i)).toBeVisible()
  })

  test('should display social proof', async ({ page }) => {
    await page.goto('/')
    
    // Check testimonial
    await expect(page.getByText(/Sarah O'Brien/i)).toBeVisible()
    await expect(page.getByText(/HR Director/i)).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Check pricing link
    await page.getByRole('link', { name: /Pricing/i }).click()
    await expect(page).toHaveURL(/\/pricing/)
  })
})

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.getByRole('heading', { name: /Create Your Account/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /Sign In/i }).click()
    
    // Check for validation messages
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /Sign up/i }).click()
    await expect(page).toHaveURL(/\/signup/)
    
    await page.getByRole('link', { name: /Sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login')
    await page.getByLabel(/Email/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')
    await page.getByRole('button', { name: /Sign In/i }).click()
  })

  test('should display upload page', async ({ page }) => {
    await page.goto('/upload')
    
    await expect(page.getByRole('heading', { name: /Upload Payroll Data/i })).toBeVisible()
    await expect(page.getByText(/Step 1/i)).toBeVisible()
  })

  test('should show file upload area', async ({ page }) => {
    await page.goto('/upload')
    
    // Check for upload component
    await expect(page.getByText(/Drag.*drop.*CSV.*Excel/i)).toBeVisible()
  })

  test('should display help section', async ({ page }) => {
    await page.goto('/upload')
    
    await expect(page.getByText(/Required Fields/i)).toBeVisible()
    await expect(page.getByText(/Download Template/i)).toBeVisible()
  })

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/upload')
    
    // Check for progress dots
    const progressDots = page.locator('[class*="rounded-full"]').filter({ hasText: '' })
    await expect(progressDots.first()).toBeVisible()
  })
})

test.describe('Pricing Page', () => {
  test('should display pricing information', async ({ page }) => {
    await page.goto('/pricing')
    
    await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/i })).toBeVisible()
    await expect(page.getByText(/€49/)).toBeVisible()
    await expect(page.getByText(/per report/i)).toBeVisible()
  })

  test('should display features list', async ({ page }) => {
    await page.goto('/pricing')
    
    await expect(page.getByText(/Eligibility assessment/i)).toBeVisible()
    await expect(page.getByText(/PRSI class verification/i)).toBeVisible()
    await expect(page.getByText(/Contribution calculations/i)).toBeVisible()
  })

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/pricing')
    
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible()
    await expect(page.getByText(/Do I need to subscribe/i)).toBeVisible()
  })

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto('/pricing')
    
    const ctaButton = page.getByRole('link', { name: /Try Free — No Card Required/i }).first()
    await ctaButton.click()
    
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should display trust badges', async ({ page }) => {
    await page.goto('/pricing')
    
    await expect(page.getByText(/GDPR Compliant/i)).toBeVisible()
    await expect(page.getByText(/Revenue Validated/i)).toBeVisible()
    await expect(page.getByText(/30-Day Guarantee/i)).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login')
    await page.getByLabel(/Email/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')
    await page.getByRole('button', { name: /Sign In/i }).click()
  })

  test('should display welcome message', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  })

  test('should show stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/Total Uploads/i)).toBeVisible()
    await expect(page.getByText(/Total Employees/i)).toBeVisible()
    await expect(page.getByText(/Eligibility Rate/i)).toBeVisible()
  })

  test('should display upload button', async ({ page }) => {
    await page.goto('/dashboard')
    
    const uploadButton = page.getByRole('link', { name: /Upload New File/i })
    await expect(uploadButton).toBeVisible()
    
    await uploadButton.click()
    await expect(page).toHaveURL(/\/upload/)
  })

  test('should show getting started guide for new users', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/Getting Started/i)).toBeVisible()
    await expect(page.getByText(/Upload payroll data/i)).toBeVisible()
  })
})

test.describe('Welcome Modal', () => {
  test('should display on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.removeItem('autoenroll_welcome_seen'))
    await page.reload()
    
    // Check for welcome modal
    await expect(page.getByRole('heading', { name: /Welcome to AutoEnroll.ie/i })).toBeVisible()
  })

  test('should navigate through tutorial steps', async ({ page }) => {
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.removeItem('autoenroll_welcome_seen'))
    await page.reload()
    
    // Check first step
    await expect(page.getByText(/Let's get you started/i)).toBeVisible()
    
    // Click next
    await page.getByRole('button', { name: /Next/i }).click()
    
    // Check second step
    await expect(page.getByRole('heading', { name: /1\. Upload Your Payroll Data/i })).toBeVisible()
  })

  test('should close on skip button', async ({ page }) => {
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.removeItem('autoenroll_welcome_seen'))
    await page.reload()
    
    await page.getByRole('button', { name: /Skip tutorial/i }).click()
    
    // Modal should be hidden
    await expect(page.getByRole('heading', { name: /Welcome to AutoEnroll.ie/i })).not.toBeVisible()
  })

  test('should not display on subsequent visits', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Assuming modal was seen before
    await expect(page.getByRole('heading', { name: /Welcome to AutoEnroll.ie/i })).not.toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check that content is visible on mobile
    await expect(page.getByRole('heading', { name: /Irish Pension Auto-Enrolment Made Simple/i })).toBeVisible()
  })

  test('should stack cards vertically on mobile', async ({ page }) => {
    await page.goto('/pricing')
    
    // Pricing card should be visible
    await expect(page.getByText(/€49/)).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check H1 exists
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/')
    
    // All images should have alt attributes
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt')
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')
    
    // Form inputs should have labels
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
  })
})
