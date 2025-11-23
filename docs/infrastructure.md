# Infrastructure Documentation

## System Architecture

### Overview
AutoEnroll.ie is deployed on a cloud-native infrastructure with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (HTTPS)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐        ┌──────▼──────┐
│   Next.js   │        │  Express.js │
│  Frontend   │◄───────┤   Backend   │
│  (SSR)      │        │   API       │
└─────────────┘        └──────┬──────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
             ┌──────▼──────┐    ┌──────▼──────┐
             │ PostgreSQL  │    │   Stripe    │
             │  Database   │    │   Payments  │
             └─────────────┘    └─────────────┘
```

## Hosting Platforms

### Recommended: Heroku
**Advantages:**
- Zero-config PostgreSQL addon
- Automatic SSL/TLS certificates
- Built-in CI/CD integration
- One-command deployments
- Environment variable management

**Setup:**
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create apps
heroku create autoenroll-ie-api
heroku create autoenroll-ie-web

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0 -a autoenroll-ie-api

# Set environment variables
heroku config:set NODE_ENV=production -a autoenroll-ie-api
heroku config:set JWT_SECRET=<your-secret> -a autoenroll-ie-api
heroku config:set STRIPE_SECRET_KEY=<your-key> -a autoenroll-ie-api

# Deploy
git push heroku main
```

### Alternative: DigitalOcean App Platform
**Advantages:**
- Competitive pricing
- Managed PostgreSQL
- Auto-scaling capabilities
- EU data center (Dublin)

**Setup:**
```yaml
# .do/app.yaml
name: autoenroll-ie
region: lon

databases:
  - name: autoenroll-db
    engine: PG
    version: "14"
    size: db-s-1vcpu-1gb

services:
  - name: api
    source_dir: packages/backend
    environment_slug: node-js
    instance_size_slug: basic-xxs
    instance_count: 1
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        type: SECRET
    
  - name: web
    source_dir: packages/frontend
    environment_slug: node-js
    instance_size_slug: basic-xxs
    instance_count: 1
    build_command: pnpm build
    run_command: pnpm start
```

### Alternative: Railway
**Advantages:**
- Modern developer experience
- Automatic preview environments
- Built-in metrics
- Generous free tier

## Database

### PostgreSQL Configuration
```sql
-- Recommended production settings
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '2621kB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
```

### Backup Strategy
```bash
# Daily automated backups
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://autoenroll-backups/

# Retention: 30 days
```

### Connection Pooling
```javascript
// Recommended pg-pool config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
})
```

## CDN & Assets

### Cloudflare Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['autoenroll.ie'],
    loader: 'cloudflare',
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.autoenroll.ie' 
    : '',
}
```

### Cache Headers
```javascript
// Express middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  }
  next()
})
```

## Monitoring

### Logging: LogDNA / Better Stack
```javascript
// Backend logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new LDNTransport({
      key: process.env.LOGDNA_KEY,
      hostname: 'autoenroll-api',
      app: 'backend',
    })
  ]
})
```

### Error Tracking: Sentry
```javascript
// sentry.server.config.js
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Uptime Monitoring: UptimeRobot
- Monitor `/health` endpoint every 5 minutes
- Alert via email/SMS on downtime
- Check from multiple locations

## Performance

### Response Time Targets
- `/health` endpoint: < 100ms
- File upload (10MB): < 3s
- Validation processing: < 5s per 500 employees
- PDF generation: < 2s
- API endpoints: < 500ms p95

### Optimization Strategies
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_uploads_user_created ON uploads(user_id, created_at DESC);
   CREATE INDEX idx_uploads_status ON uploads(status);
   ```

2. **Query Optimization**
   - Use EXPLAIN ANALYZE for slow queries
   - Implement pagination (limit 50 records)
   - Use database connection pooling

3. **Caching**
   - Redis for session storage
   - CloudFlare for static assets
   - Browser caching for public pages

4. **Code Splitting**
   ```javascript
   // Dynamic imports in Next.js
   const ValidationPreview = dynamic(
     () => import('@/components/upload/validation-preview'),
     { loading: () => <p>Loading...</p> }
   )
   ```

## Security

### SSL/TLS Configuration
```nginx
# Nginx config (if self-hosting)
ssl_protocols TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
```

### Firewall Rules
```bash
# Allow only HTTPS
ufw allow 443/tcp
ufw allow 80/tcp  # Redirect to HTTPS
ufw deny 5432     # PostgreSQL - internal only
```

### Environment Variables
```bash
# .env.production (NEVER commit)
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<64-char-random-string>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
LOGDNA_KEY=...
SENTRY_DSN=...
```

## Disaster Recovery

### Backup Procedures
1. **Database**: Automated daily backups via Heroku/DO
2. **Code**: GitHub repository (multiple replicas)
3. **Configs**: Stored in 1Password vault

### Recovery Time Objectives (RTO)
- Database restore: < 1 hour
- Full system recovery: < 4 hours
- Data loss (RPO): < 24 hours

### Failover Plan
1. Switch DNS to backup server
2. Restore latest database snapshot
3. Deploy latest code from GitHub
4. Update environment variables
5. Test all endpoints
6. Monitor error rates

## Scaling Strategy

### Horizontal Scaling
```yaml
# Auto-scaling config (DigitalOcean)
autoscaling:
  min_instance_count: 1
  max_instance_count: 5
  metrics:
    - type: cpu
      target: 80
```

### Database Scaling
1. **Read Replicas**: For analytics queries
2. **Connection Pooling**: pgBouncer
3. **Vertical Scaling**: Upgrade to higher tier
4. **Partitioning**: Split large tables by date

### Performance Benchmarks
- Target: 1000 req/s per backend instance
- Database: 10,000 concurrent connections
- File processing: 100 uploads/minute

## Cost Estimation

### Monthly Infrastructure Costs (EUR)

**Small Business (< 1000 employees)**
- Heroku Hobby: €7/month (dyno)
- PostgreSQL Standard 0: €50/month
- Cloudflare Pro: €20/month
- **Total: ~€77/month**

**Medium Business (1000-10000 employees)**
- Heroku Standard 1x: €25/month (dyno)
- PostgreSQL Standard 2: €200/month
- Cloudflare Business: €200/month
- **Total: ~€425/month**

**Enterprise (> 10000 employees)**
- Heroku Performance-M: €250/month
- PostgreSQL Premium 0: €500/month
- Cloudflare Enterprise: €500/month
- **Total: ~€1250/month**

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure SSL certificates
- [ ] Set up monitoring (Sentry, LogDNA)
- [ ] Configure Stripe webhooks
- [ ] Test file upload flow end-to-end
- [ ] Verify GDPR data deletion
- [ ] Load test with 10,000 records
- [ ] Set up automated backups
- [ ] Configure DNS records
- [ ] Enable auto-scaling
- [ ] Document emergency procedures
