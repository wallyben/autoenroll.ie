# Architecture Overview

## System Architecture

AutoEnroll.ie is built as a monorepo using a microservices-inspired architecture with clear separation of concerns.

### High-Level Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │◄────►│   Next.js    │◄────►│   Node.js   │
│             │      │   Frontend   │      │   Backend   │
└─────────────┘      └──────────────┘      └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │ PostgreSQL  │
                                             └─────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT
- **Payment Processing**: Stripe
- **File Processing**: csv-parser, xlsx
- **PDF Generation**: PDFKit
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks
- **HTTP Client**: Axios

### Common Package
- **Validation**: Zod
- **Business Logic**: Pure TypeScript functions
- **Date Handling**: date-fns

## Key Design Principles

### 1. GDPR-First Architecture
- Zero data retention by default
- Pseudonymisation of all personal data
- Immediate deletion after processing
- No persistent storage of employee PII

### 2. Monorepo Structure
```
autoenroll.ie/
├── packages/
│   ├── backend/     # Express API server
│   ├── frontend/    # Next.js application
│   └── common/      # Shared business logic
```

### 3. Layered Backend Architecture
```
Controllers  → Handle HTTP requests/responses
Services     → Business logic implementation
Models       → Database access layer
Utils        → Cross-cutting concerns
```

### 4. Validation Pipeline
```
Upload → Parse → Normalize → Validate → Transform → Report
```

## Data Flow

### Upload and Processing Flow
1. User uploads CSV/XLSX file
2. File stored temporarily on disk
3. Parser extracts and normalizes data
4. Validation service applies business rules
5. Eligibility engine determines qualifying employees
6. Contribution calculator computes pension amounts
7. Risk assessment evaluates compliance
8. PDF report generated
9. Temporary file deleted
10. Results returned to user

### Authentication Flow
1. User submits credentials
2. Backend validates against database
3. JWT tokens generated (access + refresh)
4. Tokens stored in localStorage
5. Subsequent requests include access token
6. Backend validates token on protected routes

## Security

### Authentication
- bcrypt password hashing (10 rounds)
- JWT with configurable expiration
- Refresh token rotation
- Rate limiting on all endpoints

### Data Protection
- HTTPS only in production
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via parameterized queries

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session data in JWT (no server-side sessions)
- File processing can be offloaded to workers

### Caching Strategy
- Frontend: Next.js static generation
- Backend: Response caching for reference data
- Database: Connection pooling

### Performance Optimizations
- Lazy loading of UI components
- Code splitting in Next.js
- Database indexes on frequent queries
- Batch processing for large uploads

## Deployment

### Production Architecture
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Vercel  │      │  Railway │      │ Supabase │
│ Frontend │◄────►│  Backend │◄────►│    DB    │
└──────────┘      └──────────┘      └──────────┘
```

### Environment Separation
- Development: Local PostgreSQL, local file storage
- Staging: Managed PostgreSQL, cloud storage
- Production: High-availability PostgreSQL, CDN

## Monitoring and Observability

### Logging
- Structured JSON logging via Winston
- Request/response logging
- Error tracking with stack traces
- Performance metrics

### Health Checks
- `/health` endpoint for uptime monitoring
- Database connection verification
- External service availability checks

## Future Enhancements

### Phase 2
- Background job processing with Bull/Redis
- Email notifications for processing completion
- Multi-company support
- Advanced reporting dashboard

### Phase 3
- Machine learning for data quality predictions
- API for third-party integrations
- Mobile application
- Real-time WebSocket updates
