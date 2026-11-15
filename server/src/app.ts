import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { sessionLoader } from './middleware/session.js';
import { errorHandler } from './middleware/errorHandler.js';

// Module routers
import authRouter from './modules/auth/auth.routes.js';
import profileRouter from './modules/profile/profile.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import listingsRouter from './modules/listings/listings.routes.js';
import bookingsRouter from './modules/bookings/bookings.routes.js';
import notificationsRouter from './modules/notifications/notifications.routes.js';
import messagesRouter from './modules/messages/messages.routes.js';
import supportRouter from './modules/support/support.routes.js';
import verificationRouter from './modules/verification/verification.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import serviceRequestsRouter from './modules/service-requests/serviceRequests.routes.js';

export function createApp() {
  const app = express();

  // Trust proxy for correct IP detection behind Caddy/nginx
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vite handles frontend CSP
    })
  );

  // CORS — allow only the configured frontend origin, with credentials
  app.use(
    cors({
      origin: env.APP_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Requested-With'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));

  // Load session from tt_sid cookie → req.user
  app.use(sessionLoader);

  // CSRF guard for mutating API requests
  app.use('/api', (req, res, next) => {
    const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'];
    // Skip CSRF for the Bach webhook (uses signature verification instead)
    if (req.path.startsWith('/payments/bach/webhook')) return next();
    if (mutating.includes(req.method)) {
      if (req.headers['x-requested-with'] !== 'terratills') {
        res.status(403).json({ error: 'CSRF check failed.', code: 'CSRF_INVALID' });
        return;
      }
    }
    next();
  });

  // Health check (no auth required)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString(), env: env.NODE_ENV });
  });

  // Mount all module routers
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/services', listingsRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/service-requests', serviceRequestsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/verification', verificationRouter);
  app.use('/api/dashboard', dashboardRouter);

  // Global error handler — must be last
  app.use(errorHandler);

  return app;
}
