import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import pino from 'pino';
import { env } from './config/env';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import goalSheetRoutes from './routes/goalSheets';
import checkInRoutes from './routes/checkIns';
import auditEventRoutes from './routes/auditEvents';
import reportRoutes from './routes/reports';
import { initJobs } from './jobs';

export const buildApp = async () => {
  const app = Fastify({
    logger: pino({
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
    }),
  });

  await app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.JWT_REFRESH_SECRET,
  });

  // Basic health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  app.get('/health/ready', async (req, reply) => {
    try {
      // Readiness check
      return { status: 'ready' };
    } catch {
      return reply.status(503).send({ status: 'not ready' });
    }
  });

  // Register routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(goalSheetRoutes, { prefix: '/api/goal-sheets' });
  app.register(checkInRoutes, { prefix: '/api/check-ins' });
  app.register(auditEventRoutes, { prefix: '/api/audit-events' });
  app.register(reportRoutes, { prefix: '/api/reports' });

  // Initialize jobs
  initJobs();

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.status(error.statusCode).send({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
    }
    app.log.error(error);
    if (env.NODE_ENV === 'production') {
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
    }
    return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message, details: error.stack } });
  });

  return app;
};

if (require.main === module) {
  buildApp()
    .then((app) => {
      app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
