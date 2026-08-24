import { AppDataSource } from './config/data-source';
import { createApp } from './app';
import { Product } from './entities/Product';

const PORT = Number(process.env.PORT ?? 3000);

async function main() {
  await AppDataSource.initialize();
  console.log('Database connection established');

  const app = createApp(AppDataSource.getRepository(Product));

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
