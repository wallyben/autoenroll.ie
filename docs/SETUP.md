# AutoEnroll.ie Setup Guide

## For Users in GitHub Codespaces

### Quick Start

1. **Open the repository in Codespaces**
   - Click "Code" > "Codespaces" > "Create codespace on main"

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Codespaces will automatically forward port 3000
   - Click the "Open in Browser" button that appears, or
   - Go to the "Ports" tab and click the forwarded URL for port 3000

### Testing Authentication

1. Navigate to the application URL
2. Enter `test@example.com` in the email field
3. Click "Send Magic Link"
4. The response will include a magic link that you can click
5. You'll be authenticated with a 7-day session

### Environment Configuration

Codespaces automatically configures most settings. Optional customization:

```bash
# Copy environment template (already done for you)
cp .env.example .env

# Optionally set a custom JWT secret
echo "JWT_SECRET=your-secret-here" >> .env
```

## For Local Development

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wallyben/autoenroll.ie.git
   cd autoenroll.ie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000 in your browser

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

Example:
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "AutoEnroll.ie API is running",
  "timestamp": "2025-11-23T19:00:00.000Z",
  "port": 3000,
  "endpoints": {
    "health": "/api/health",
    "magicLink": "/api/auth/magic-link (POST)",
    "verify": "/api/auth/verify (GET)"
  }
}
```

### Request Magic Link
```bash
POST /api/auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Example:
```bash
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Response (for test@example.com only):
```json
{
  "message": "Test mode: Magic link generated successfully",
  "magicLink": "http://localhost:3000/api/auth/verify?token=...",
  "token": "eyJhbGc...",
  "note": "In production, this would be sent via email."
}
```

Response (for other emails):
```json
{
  "message": "Magic link sent successfully! Check your email."
}
```

### Verify Token
```bash
GET /api/auth/verify?token=<jwt-token>
```

Example:
```bash
curl "http://localhost:3000/api/auth/verify?token=eyJhbGc..."
```

Response:
```json
{
  "success": true,
  "message": "Authentication successful",
  "email": "test@example.com"
}
```

A session cookie will be set automatically (HTTP-only, 7-day expiry).

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Codespaces Port Not Forwarding

1. Go to the "Ports" tab in Codespaces
2. Find port 3000
3. If it's not listed, click "Forward a Port" and enter 3000
4. Set visibility to "Public" if you want to share the link

### Cannot Connect to API

1. Verify the server is running: `curl http://localhost:3000/api/health`
2. Check browser console for CORS errors
3. Ensure you're using the correct URL (localhost vs Codespaces URL)

### Authentication Not Working

1. Test with `test@example.com` first
2. Check that JWT_SECRET is set (optional in dev mode)
3. Verify the token hasn't expired (15-minute expiry)
4. Check browser cookies are enabled

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Development Tips

### Hot Reload

The development server supports hot reload. Changes to files will automatically refresh the browser.

### Debugging

Add console.log statements or use browser DevTools:
- Open DevTools (F12)
- Go to Console tab to see logs
- Go to Network tab to inspect API calls
- Go to Application > Cookies to see session cookies

### Code Quality

```bash
# Lint code
npm run lint

# Build to check for type errors
npm run build
```

## Security Notes

### For Development
- Default JWT_SECRET is insecure (for dev only)
- Magic links are shown in API responses for test@example.com
- Session tokens are HTTP-only cookies

### For Production
- Set a strong random JWT_SECRET environment variable
- Configure email service to send magic links
- Use HTTPS (enforced by Next.js in production)
- Set NODE_ENV=production
- Review CORS settings in next.config.js

## Next Steps

1. ✅ Application is running
2. ✅ Test authentication works
3. 🔄 Configure email service for production
4. 🔄 Add database for user persistence
5. 🔄 Set up production deployment
6. 🔄 Configure custom domain

## Support

For issues or questions:
- Check this documentation first
- Review the main README.md
- Check browser console for errors
- Verify API endpoints with curl

## Architecture

```
autoenroll.ie/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage with login form
│   └── api/
│       ├── health/         # Health check endpoint
│       └── auth/
│           ├── magic-link/ # Generate magic link
│           └── verify/     # Verify token & create session
├── next.config.js          # Next.js configuration (CORS)
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env                    # Environment variables
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **jsonwebtoken** - JWT token generation and verification
- **HTTP-only cookies** - Secure session storage

## License

ISC
