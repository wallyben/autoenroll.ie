# Quick Start Guide for Codespaces/Remote Environments

## Problem
You were seeing the Codespaces URL but pages weren't loading properly. This was due to CORS and URL configuration issues.

## Solution
The app now uses Next.js API proxy, so it works automatically in any environment.

## How to Use

### 1. Start the Application

**Option A: Easy Start (Recommended)**
```bash
./start.sh
```

**Option B: Manual Start**
```bash
# Terminal 1
npm run dev

# Terminal 2  
cd apps/web
npm run dev
```

### 2. Access in Codespaces

1. Look for the **PORTS** panel at the bottom of VS Code
2. You'll see:
   - Port 3000 (Web Interface)
   - Port 4000 (API Server)
3. Click the **🌐 Open in Browser** icon next to port 3000
4. The app will open in your browser

### 3. Test It's Working

Visit these URLs (using your Codespaces domain):
- Landing page: `https://your-codespace-url-3000.app.github.dev/`
- Dashboard: `https://your-codespace-url-3000.app.github.dev/dashboard`
- API health: `https://your-codespace-url-3000.app.github.dev/api/health`

All API calls automatically proxy through the web server, so no CORS issues!

### 4. Using the Application

1. **Landing Page**: Shows features and pricing
2. **Dashboard**: 
   - Enter email → Request code
   - Code appears immediately (dev mode)
   - Enter code → Verify
   - Upload CSV file to test validation

## What Was Fixed

- ✅ Next.js now proxies `/api/*` requests to the backend
- ✅ CORS set to allow all origins in development
- ✅ Environment variables updated for relative URLs
- ✅ Works in local, Codespaces, and any cloud IDE

## Troubleshooting

**Servers not running?**
```bash
# Check if they're running
ps aux | grep -E "(ts-node-dev|next dev)"

# Kill and restart
pkill -f "ts-node-dev"
pkill -f "next dev"
./start.sh
```

**Port already in use?**
```bash
# Kill processes on ports
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
./start.sh
```

**Can't access in browser?**
- Make sure the Ports panel shows ports 3000 and 4000
- Port visibility should be "Public" or "Private" (either works)
- Use the Open in Browser icon, don't try to access localhost URLs

## Key Files Changed

- `next.config.mjs` - Added API proxy configuration
- `.env` - Changed API URL to `/api` (relative)
- `apps/web/app/dashboard/page.tsx` - Updated to use proxied API
- `start.sh` - New convenience script
- `TESTING.md` - Added Codespaces instructions

## Need Help?

See full documentation in:
- `TESTING.md` - Comprehensive testing guide
- `README.md` - Setup and architecture
- `SUMMARY.md` - System overview
