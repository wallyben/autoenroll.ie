import express from 'express';
import { config } from './config';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { applySecurityMiddleware } from './middleware/security.middleware';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import validationRoutes from './routes/validation.routes';
import billingRoutes from './routes/billing.routes';
import userRoutes from './routes/user.routes';
import stagingDatesRoutes from './routes/staging-dates.routes';
import enrolmentRoutes from './routes/enrolment.routes';
import bundleRoutes from './routes/bundle.routes';
import { logger } from './utils/logger';

const app = express();

// Apply comprehensive security middleware (CSP, CORS, HSTS, etc.)
applySecurityMiddleware(app);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(loggingMiddleware);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (rate limiting applied within route files)
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/staging-dates', stagingDatesRoutes);
app.use('/api/enrolment', enrolmentRoutes);
app.use('/api/bundles', bundleRoutes);

// Error handling (must be last)
app.use(errorMiddleware);

export default app;
