import swaggerJsdoc from 'swagger-jsdoc';
import path from 'node:path';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Problem 5 - Product CRUD API',
      version: '1.0.0',
      description:
        'CRUD service for a "Product" resource, backed by PostgreSQL via TypeORM.',
    },
    servers: [{ url: '/api' }],
  },
  apis: [path.join(__dirname, '..', 'routes', '*.{ts,js}')],
});
