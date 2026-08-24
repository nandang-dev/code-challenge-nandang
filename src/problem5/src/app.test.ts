import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import type { Express } from 'express';
import { createTestDataSource } from './test/test-data-source';
import { Product } from './entities/Product';
import { createApp } from './app';

let dataSource: DataSource;
let app: Express;

beforeEach(async () => {
  dataSource = await createTestDataSource();
  app = createApp(dataSource.getRepository(Product));
});

afterEach(async () => {
  await dataSource.destroy();
});

describe('GET /health', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/products', () => {
  it('creates a product and returns 201 with the created resource', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Desk Lamp',
      category: 'Home',
      price: 25.5,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Desk Lamp',
      category: 'Home',
      price: 25.5,
      description: null,
    });
    expect(res.body.id).toBeTruthy();
  });

  it('returns 400 with issue details for invalid input', async () => {
    const res = await request(app).post('/api/products').send({
      name: '',
      category: 'Home',
      price: -5,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.issues.length).toBeGreaterThan(0);
  });
});

describe('GET /api/products', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/products')
      .send({ name: 'Red Mug', category: 'Kitchen', price: 12 });
    await request(app)
      .post('/api/products')
      .send({ name: 'Blue Mug', category: 'Kitchen', price: 15 });
    await request(app)
      .post('/api/products')
      .send({ name: 'Frying Pan', category: 'Kitchen', price: 40 });
  });

  it('lists all products with pagination metadata', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(1);
    expect(res.body.data).toHaveLength(3);
  });

  it('filters by search query', async () => {
    const res = await request(app).get('/api/products').query({ search: 'mug' });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it('rejects an invalid query param with 400', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ limit: 'not-a-number' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/products/:id', () => {
  it('returns the product when it exists', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Notebook', category: 'Office', price: 5 });

    const res = await request(app).get(`/api/products/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Notebook');
  });

  it('returns 404 for a well-formed but unknown id', async () => {
    const res = await request(app).get(
      '/api/products/00000000-0000-0000-0000-000000000000',
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/products/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/products/:id', () => {
  it('updates only the provided fields and returns 200', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Chair', category: 'Furniture', price: 100 });

    const res = await request(app)
      .patch(`/api/products/${created.body.id}`)
      .send({ price: 80 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(80);
    expect(res.body.name).toBe('Chair');
  });

  it('returns 400 when the body is empty', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Chair', category: 'Furniture', price: 100 });

    const res = await request(app)
      .patch(`/api/products/${created.body.id}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app)
      .patch('/api/products/00000000-0000-0000-0000-000000000000')
      .send({ price: 10 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  it('deletes the product and returns 204, then 404 on a second delete', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Cup', category: 'Kitchen', price: 3 });

    const first = await request(app).delete(`/api/products/${created.body.id}`);
    expect(first.status).toBe(204);

    const second = await request(app).delete(`/api/products/${created.body.id}`);
    expect(second.status).toBe(404);
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404 instead of an HTML error page', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
