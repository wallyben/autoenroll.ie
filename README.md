# autoenroll.ie

Auto enrollment project for Ireland.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at:
- **Local:** http://localhost:3000
- **Codespaces:** Your Codespaces URL will be automatically configured

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `JWT_SECRET` - Secret for JWT token signing (auto-generated in dev)
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_BASE_URL` - Base URL for magic links (auto-detected)

## 📋 Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Magic link authentication
- ✅ JWT-based sessions
- ✅ API routes at `/api/*`
- ✅ CORS configured for API access
- ✅ Codespaces support

## 🔐 Authentication

### Test Login

Use `test@example.com` to test the magic link flow:

1. Visit http://localhost:3000
2. Enter `test@example.com`
3. Click "Send Magic Link"
4. The response will include a clickable magic link

### API Endpoints

#### POST /api/auth/magic-link
Generate a magic link for email login.

```bash
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### GET /api/auth/verify?token=<token>
Verify a magic link token and create a session.

#### GET /api/health
Health check endpoint.

```bash
curl http://localhost:3000/api/health
```

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🌐 Deployment

### Local Development
The app runs on port 3000 by default.

### GitHub Codespaces
The application automatically detects Codespaces and configures URLs accordingly.

### Production
Set environment variables properly:
- `JWT_SECRET` - Use a strong random secret
- `NODE_ENV=production`
- Configure email service for magic links

## 🔍 Troubleshooting

### Cannot access the site
1. Ensure `npm install` completed successfully
2. Check that port 3000 is not in use
3. In Codespaces, use the forwarded port URL

### API routes not working
1. Verify CORS headers in browser console
2. Check `/api/health` endpoint
3. Review `next.config.js` configuration

### Authentication issues
1. Test with `test@example.com` first
2. Check JWT_SECRET is set
3. Verify token hasn't expired (15 min for magic links)

## 📝 License

ISC