# AutoEnroll.ie - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd /workspaces/autoenroll.ie
pnpm install
```

### 2. Run Development Server
```bash
# Start all services (frontend + backend)
pnpm dev

# Or run individually:
pnpm --filter @autoenroll/frontend dev  # Frontend on http://localhost:3000
pnpm --filter @autoenroll/backend dev   # Backend on http://localhost:5000
```

### 3. Run Tests
```bash
# E2E tests (requires dev server running)
cd packages/frontend
pnpm playwright test

# Unit tests
pnpm test

# With coverage
pnpm test:coverage
```

---

## 📁 Project Structure

```
autoenroll.ie/
├── packages/
│   ├── frontend/              # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/          # Pages and routes
│   │   │   │   ├── page.tsx                  # Landing page (redesigned)
│   │   │   │   ├── pricing/page.tsx          # Pricing page (redesigned)
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx        # Login form
│   │   │   │   │   └── signup/page.tsx       # Signup form
│   │   │   │   └── (dashboard)/
│   │   │   │       ├── dashboard/page.tsx    # Dashboard (redesigned)
│   │   │   │       ├── upload/page.tsx       # Upload flow (redesigned)
│   │   │   │       └── results/page.tsx      # Results preview
│   │   │   ├── components/
│   │   │   │   ├── ui/                       # ShadCN components
│   │   │   │   │   └── states.tsx            # State components (NEW)
│   │   │   │   ├── onboarding/               
│   │   │   │   │   └── welcome-modal.tsx     # Welcome modal (NEW)
│   │   │   │   └── layout/
│   │   │   │       └── sidebar.tsx           # Dashboard sidebar
│   │   │   ├── lib/
│   │   │   │   ├── design-system.ts          # Design tokens (NEW)
│   │   │   │   ├── animations.ts             # CSS animations (NEW)
│   │   │   │   └── api.ts                    # API client
│   │   │   └── hooks/
│   │   │       └── useAuth.ts                # Authentication hook
│   │   ├── tests/
│   │   │   └── e2e/
│   │   │       └── user-flows.spec.ts        # E2E tests (NEW)
│   │   ├── playwright.config.ts              # Playwright config (NEW)
│   │   ├── CUSTOMER_JOURNEY.md               # UX documentation (NEW)
│   │   └── package.json
│   │
│   ├── backend/               # Express + TypeScript
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Auth, validation
│   │   │   └── services/     # Business logic
│   │   └── package.json
│   │
│   └── common/                # Shared business logic
│       ├── src/
│       │   ├── eligibility/  # Precision modules (Phase 2)
│       │   │   ├── prsi.ts                   # PRSI classification
│       │   │   ├── earnings.ts               # Earnings annualization
│       │   │   ├── contributions.ts          # Contribution calculator
│       │   │   ├── optout.ts                 # Opt-out windows
│       │   │   └── exclusions.ts             # Director exclusions
│       │   └── utils/
│       │       └── pseudonymisation.ts       # PBKDF2 encryption
│       └── package.json
│
├── PHASE3_COMPLETE.md         # UX transformation summary (NEW)
└── package.json               # Root workspace config
```

---

## 🎨 Key Components

### State Components (`/components/ui/states.tsx`)
```tsx
import { EmptyUploadState, LoadingState, ErrorState } from '@/components/ui/states'

// Empty state
<EmptyUploadState onUpload={() => router.push('/upload')} />

// Loading state
<LoadingState message="Processing your data..." estimatedTime={30} />

// Error state
<ErrorState 
  severity="error" 
  title="Validation Failed"
  message="3 errors found in your data"
  onRetry={handleRetry}
/>
```

### Welcome Modal (`/components/onboarding/welcome-modal.tsx`)
```tsx
import { WelcomeModal, useFirstTimeUser } from '@/components/onboarding/welcome-modal'

function Dashboard() {
  const { showWelcome, markWelcomeSeen } = useFirstTimeUser()
  
  return (
    <>
      {showWelcome && (
        <WelcomeModal 
          onClose={markWelcomeSeen} 
          onGetStarted={() => router.push('/upload')} 
        />
      )}
      {/* Dashboard content */}
    </>
  )
}
```

### Design System (`/lib/design-system.ts`)
```tsx
import { colors, typography, spacing, transitions, hoverEffects } from '@/lib/design-system'

// Use design tokens
<button className={`bg-[${colors.primary.default}] ${transitions.default} ${hoverEffects.lift}`}>
  Click Me
</button>
```

### Animations (`/lib/animations.ts`)
```tsx
import { animationClasses, getStaggerDelay } from '@/lib/animations'

// Fade in animation
<div className={animationClasses.fadeIn}>Content</div>

// Staggered list
{items.map((item, i) => (
  <div 
    key={i}
    className={animationClasses.slideUp}
    style={{ animationDelay: getStaggerDelay(i) }}
  >
    {item}
  </div>
))}
```

---

## 🧪 Testing

### Run E2E Tests
```bash
cd packages/frontend

# Install Playwright (first time only)
pnpm add -D @playwright/test
pnpm playwright install

# Run tests
pnpm playwright test

# Interactive UI mode
pnpm playwright test --ui

# Debug mode
pnpm playwright test --debug

# Run specific test
pnpm playwright test tests/e2e/user-flows.spec.ts -g "Landing Page"
```

### Test Coverage
- Landing page load and navigation
- Authentication (login/signup)
- Upload flow (file upload, validation)
- Pricing page display and CTAs
- Dashboard stats and navigation
- Welcome modal tutorial
- Mobile responsiveness
- Accessibility (ARIA, keyboard nav)

---

## 🎯 User Flows

### 1. **First-Time User Journey**
```
Landing Page → Signup → Dashboard (Welcome Modal) → Upload → Validate → Preview → Payment
```

### 2. **Returning User Journey**
```
Login → Dashboard → Upload → Validate → Calculate Eligibility → Download PDF
```

### 3. **Pricing Exploration**
```
Landing Page → Pricing → FAQ → Signup → Dashboard
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
PBKDF2_SALT=your-salt
```

### Database Setup
```bash
cd packages/backend

# Run migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

---

## 📦 Build & Deploy

### Production Build
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @autoenroll/frontend build
pnpm --filter @autoenroll/backend build
```

### Deploy Frontend (Vercel)
```bash
cd packages/frontend
vercel deploy --prod
```

### Deploy Backend (Railway/Heroku)
```bash
cd packages/backend
# Configure DATABASE_URL and environment variables
railway up  # or git push heroku main
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**2. Module not found errors**
```bash
# Clear node_modules and reinstall
pnpm clean
pnpm install
```

**3. TypeScript errors**
```bash
# Regenerate types
pnpm --filter @autoenroll/frontend build
```

**4. Playwright tests fail**
```bash
# Make sure dev server is running
pnpm dev

# In another terminal:
cd packages/frontend
pnpm playwright test
```

---

## 📚 Additional Resources

- **Customer Journey**: `/packages/frontend/CUSTOMER_JOURNEY.md`
- **Design System**: `/packages/frontend/src/lib/design-system.ts`
- **Phase 3 Summary**: `/PHASE3_COMPLETE.md`
- **Playwright Docs**: https://playwright.dev
- **Next.js Docs**: https://nextjs.org/docs
- **ShadCN UI**: https://ui.shadcn.com

---

## 🎉 What's Next?

### Immediate (Ready to Use)
- ✅ Run dev server and explore redesigned UI
- ✅ Test welcome modal on first dashboard visit
- ✅ Upload sample CSV and see new upload flow
- ✅ Run Playwright tests to validate critical flows

### Short Term (Optional Enhancements)
- 🔄 Add Framer Motion for advanced animations
- 🔄 Integrate Stripe for payment processing
- 🔄 Add analytics (Google Analytics/Plausible)
- 🔄 Implement PDF report generation
- 🔄 Add email notifications

### Long Term (Scale)
- 📈 API for bulk processing
- 📈 Multi-tenant support (agencies)
- 📈 Historical reporting and trends
- 📈 Integration with Irish payroll providers
- 📈 Mobile app (React Native)

---

**Built with ❤️ for Irish businesses navigating auto-enrolment compliance**
