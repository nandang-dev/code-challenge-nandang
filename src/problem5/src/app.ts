import 'reflect-metadata';
import express, { type Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import type { Repository } from 'typeorm';
import type { Product } from './entities/Product';
import { buildProductRouter } from './routes/product.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { swaggerSpec } from './docs/swagger';

// Factory (rather than a module-level singleton) so tests can wire this up
// against an in-memory repository instead of the real Postgres database.
export function createApp(productRepo: Repository<Product>): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/products', buildProductRouter(productRepo));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
