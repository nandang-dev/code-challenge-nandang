import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../entities/Product';

// An ephemeral in-memory SQLite database standing in for Postgres in
// automated tests, so `npm test` never needs a real database running.
// `synchronize: true` is fine here (unlike the real app) because this
// database is thrown away after every test file.
export async function createTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    synchronize: true,
    entities: [Product],
  });
  await dataSource.initialize();
  return dataSource;
}
