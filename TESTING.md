# AutoEnroll.ie - Testing Guide

## System Overview
AutoEnroll.ie is now fully set up and accessible! The system consists of:
- **API Server**: Running on port 4000
- **Web Interface**: Running on port 3000

## Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
cd /home/runner/work/autoenroll.ie/autoenroll.ie
./start.sh
```
This will start both servers automatically.

### Option 2: Start Servers Manually

#### 1. Start the API Server
```bash
cd /home/runner/work/autoenroll.ie/autoenroll.ie
npm run dev
```
The API will start on port 4000.

#### 2. Start the Web Frontend (in a separate terminal)
```bash
cd /home/runner/work/autoenroll.ie/autoenroll.ie/apps/web
npm run dev
```
The web interface will start on port 3000.

## Accessing the Application

### Local Development
- **Web Interface**: http://localhost:3000
- **API Server**: http://localhost:4000

### GitHub Codespaces / Cloud Environments
When running in Codespaces or similar environments:
1. Look for the **Ports** panel in VS Code
2. Find ports 3000 (Web) and 4000 (API)
3. Click the **Open in Browser** icon (🌐) next to port 3000
4. The application will automatically connect to the API via Next.js proxy

**Note**: The app is configured to work seamlessly in any environment. The API requests go through `/api/*` which Next.js automatically proxies to the backend, avoiding CORS issues.

## Testing the System

### Web Interface Testing

1. **Access the Landing Page**
   - Navigate to your web interface URL (localhost:3000 or Codespaces URL)
   - You'll see the marketing page with features and pricing tiers

2. **Access the Dashboard**
   - Click "Launch app" or navigate to `/dashboard`
   
3. **Login Flow**
   - Enter your email address (e.g., test@example.com)
   - Click "Request code"
   - The system will display the magic link code (in dev mode, codes are shown directly)
   - Enter the code and click "Verify"
   - You'll be authenticated!

4. **Upload Payroll File**
   - Use the sample CSV file at `/tmp/sample_payroll.csv`
   - Click "Choose File" and select the CSV
   - Click "Upload and validate"
   - View the validation results with:
     - Eligibility status
     - Risk scores
     - Contribution calculations
     - Any validation issues

### API Testing (Command Line)

1. **Health Check**
```bash
curl http://localhost:4000/health
```

2. **Request Authentication Code**
```bash
curl -X POST http://localhost:4000/auth/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

3. **Verify Code and Get Token**
```bash
curl -X POST http://localhost:4000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"YOUR_CODE_HERE"}'
```

4. **Upload Payroll File**
```bash
curl -X POST http://localhost:4000/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/tmp/sample_payroll.csv"
```

## Sample Payroll Data

The sample CSV file at `/tmp/sample_payroll.csv` contains 5 employee records with:
- Employee IDs and PPS numbers
- Date of birth information
- Monthly pay periods
- Gross pay ranging from €2,200 to €5,500
- PRSI Class A1 (eligible for auto-enrolment)

## Features Implemented

✅ Magic link authentication (passwordless)
✅ CSV and XLSX payroll file upload
✅ Payroll validation with risk scoring
✅ Auto-enrolment eligibility checking
✅ Contribution calculations (employee, employer, state)
✅ PDF report generation
✅ Stripe billing integration (mocked without API key)
✅ Zero-retention by default (GDPR compliant)
✅ Audit logging (without PII)

## Validation Rules

The system checks:
- Required fields (employee ID, PPS number, pay information)
- Age eligibility (23-60 years)
- Income thresholds (€20k-€80k annually)
- PRSI class validity
- Pay period staleness
- Opt-out status and dates

## Contribution Calculations

Based on Irish auto-enrolment rules:
- Year 4 escalation rates (default):
  - Employee: 6%
  - Employer: 6%
  - State: 2%
- Calculated on qualifying earnings between €20k-€80k

## Next Steps

For production deployment:
1. Set proper `JWT_SECRET` in `.env`
2. Add `STRIPE_SECRET` for real billing
3. Deploy API to Fly.io/Render
4. Deploy web to Vercel
5. Configure proper CORS origins

## Troubleshooting

- If API is not accessible, check it's running on port 4000
- If web interface can't connect, verify `NEXT_PUBLIC_API_URL` is set
- For authentication issues, generate a new code (they expire after 10 minutes)
- Check logs in `/home/runner/work/autoenroll.ie/autoenroll.ie/logs/audit.log`
