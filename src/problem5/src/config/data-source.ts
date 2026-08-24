import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from '../entities/Product';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'problem5',
  // Schema is managed exclusively through the migrations below — never
  // auto-sync entities against the database.
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [Product],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
});
