# AutoEnroll.ie - Quick Start Guide

## Prerequisites

- **Node.js**: v18.0.0 or higher (v22.x recommended)
- **pnpm**: v8.0.0 or higher
- **PostgreSQL**: v14 or higher
- **Git**: For cloning the repository

Check your versions:
```bash
node --version  # Should be v18+ (v22.21.1 confirmed working)
pnpm --version  # Should be 8.0+ (8.12.0 confirmed working)
psql --version  # Should be 14+ (16.11 confirmed working)
```

## Installation (5 Minutes)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/wallyben/autoenroll.ie.git
cd autoenroll.ie

# Install all dependencies (monorepo)
pnpm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb autoenroll

# Or using psql:
psql -U postgres -c "CREATE DATABASE autoenroll;"

# Run migrations
psql -U postgres -d autoenroll -f base-migration.sql

# Create uploads table (if not exists)
psql -U postgres -d autoenroll -c "
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  validation_result JSONB,
  processing_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
"
```

### 3. Configure Environment Variables

The root `.env` file is already configured for local development with sensible defaults.

**Optional**: Customize if needed:
```bash
# View current configuration
cat .env

# Edit if necessary
nano .env
```

**Key environment variables:**
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/autoenroll`)
- `JWT_SECRET`: JWT signing key (default provided for dev)
- `FRONTEND_URL`: Frontend URL (default: `http://localhost:3000`)
- `BACKEND_URL`: Backend URL (default: `http://localhost:3001`)

## Running the Application

### Option 1: Start Everything (Recommended)

```bash
# From project root - starts both backend and frontend
pnpm dev
```

This command uses Turbo to start:
- **Backend API** on http://localhost:3001
- **Frontend** on http://localhost:3000
- **Common package** in watch mode

### Option 2: Start Services Individually

If you need more control:

```bash
# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: Frontend  
cd packages/frontend
pnpm dev

# Terminal 3: Common (watch mode)
cd packages/common
pnpm dev
```

### Verify Services

```bash
# Check backend health
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# Check frontend
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK

# Or open in browser:
open http://localhost:3000
```

## Testing the Application (End-to-End)

### 1. Register a Test User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "DemoPass123!",
    "companyName": "Demo Company Ltd",
    "contactName": "Demo User"
  }'
```

Save the `accessToken` from the response.

### 2. Test File Upload (API)

```bash
# Set your token
export TOKEN="your_access_token_here"

# Upload sample CSV
curl -X POST http://localhost:3001/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@samples/sample_payroll.csv;type=text/csv"
```

### 3. Test File Upload (Browser)

1. Open http://localhost:3000
2. Click "Try Free — No Card Required"
3. Register or login with your demo account
4. Navigate to the upload page
5. Upload `samples/sample_payroll.csv`
6. View validation results and eligibility preview

## Sample Data

The `samples/` directory contains test files:

- **`sample_payroll.csv`**: Valid employee data (10 employees)
- **`invalid_payroll.csv`**: Invalid data for testing error handling

### Sample CSV Format

```csv
employee_id,first_name,last_name,email,pps_number,date_of_birth,annual_salary,employment_start_date,prsi_class
EMP001,John,Doe,john.doe@example.com,1234567T,1985-03-15,35000,2023-01-15,A1
```

**Required fields:**
- `employee_id`: Unique identifier
- `first_name`, `last_name`: Employee names
- `email`: Valid email address
- `pps_number`: Irish PPS number format
- `date_of_birth`: YYYY-MM-DD format
- `annual_salary`: Numeric value
- `employment_start_date`: YYYY-MM-DD format
- `prsi_class`: Usually A1 for standard employees

## Running Tests

```bash
# Run all tests (root)
pnpm test

# Backend tests only
pnpm test:backend

# Frontend tests only  
pnpm test:frontend

# Watch mode
cd packages/backend && pnpm test:watch

# Coverage report
pnpm test:coverage
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Check what's using port 3000/3001
lsof -i :3000
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
pg_isready

# Check connection
psql -U postgres -d autoenroll -c "SELECT 1;"

# Reset database if needed
dropdb autoenroll && createdb autoenroll
psql -U postgres -d autoenroll -f base-migration.sql
```

### Dependencies Not Found

```bash
# Clean install
pnpm clean
rm -rf node_modules packages/*/node_modules
pnpm install
```

### Frontend Not Building

```bash
# Clear Next.js cache
cd packages/frontend
rm -rf .next
pnpm dev
```

## Project Structure

```
autoenroll.ie/
├── packages/
│   ├── backend/          # Express API server (port 3001)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.ts
│   │   └── package.json
│   ├── frontend/         # Next.js app (port 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── common/           # Shared code
│       ├── src/
│       │   ├── types/
│       │   ├── validation/
│       │   └── eligibility/
│       └── package.json
├── samples/              # Test data files
├── docs/                 # Documentation
├── .env                  # Environment config (root)
└── package.json          # Monorepo root
```

## Next Steps

After getting the system running:

1. **Explore the Documentation**: Check `docs/` for detailed guides
2. **Review the Rules Engine**: See `docs/rules-engine.md` for auto-enrolment logic
3. **Understand GDPR Compliance**: Read `docs/gdpr-model.md`
4. **Test the API**: Use the Postman collection (if available) or curl commands
5. **Customize Branding**: Update frontend components in `packages/frontend/src/components`

## Support

- **Documentation**: See `docs/` directory
- **Issues**: Open an issue on GitHub
- **Email**: support@autoenroll.ie

## Quick Reference Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all code

# Backend specific
pnpm --filter @autoenroll/backend dev
pnpm --filter @autoenroll/backend test

# Frontend specific
pnpm --filter @autoenroll/frontend dev
pnpm --filter @autoenroll/frontend build

# Database
psql -U postgres -d autoenroll              # Connect to database
psql -U postgres -d autoenroll -f base-migration.sql  # Run migrations
```

## System Requirements Verified

✅ **Node.js**: v22.21.1 (confirmed working)  
✅ **pnpm**: 8.12.0 (confirmed working)  
✅ **PostgreSQL**: 16.11 (confirmed working)  
✅ **Backend**: Express + TypeScript running on port 3001  
✅ **Frontend**: Next.js 14 running on port 3000  
✅ **Health Check**: http://localhost:3001/health returns `{"status":"ok"}`  
✅ **Authentication**: Registration, login, JWT tokens working  
✅ **File Upload**: CSV upload and validation working  
✅ **Tests**: Security tests passing (26 tests)  
✅ **Sample Data**: Valid CSV files in `samples/` directory
