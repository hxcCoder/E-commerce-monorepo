import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import { container } from './infrastructure/config/container';
import { logger } from './infrastructure/config/logger';
import { ProcessRoutes } from './interfaces/http/ProcessRoutes';
import { getPrismaClient } from './infrastructure/persistence/prisma/PrismaClient';
import { env } from './infrastructure/config/env';

const app = express();

// Middlewares
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const requestId = req.header('x-request-id') || randomUUID();
  res.setHeader('x-request-id', requestId);
  res.locals.requestId = requestId;
  next();
});

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

// Routes
const processRoutes = container.get(ProcessRoutes);
app.use('/api/processes', processRoutes.router);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'process-compliance-saas',
    env: env.NODE_ENV,
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled express error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const prisma = getPrismaClient();

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Prisma connected');

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Startup failed', err);
    process.exit(1);
  }
}

void bootstrap();
