import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DataSource } from 'typeorm';
import { createTestDataSource } from '../test/test-data-source';
import { Product } from '../entities/Product';
import { ProductService } from './product.service';

let dataSource: DataSource;
let service: ProductService;

beforeEach(async () => {
  dataSource = await createTestDataSource();
  service = new ProductService(dataSource.getRepository(Product));
});

afterEach(async () => {
  await dataSource.destroy();
});

describe('ProductService.create', () => {
  it('creates a product with the given fields', async () => {
    const product = await service.create({
      name: 'Keyboard',
      category: 'Electronics',
      price: 49.9,
    });

    expect(product.id).toBeTruthy();
    expect(product.name).toBe('Keyboard');
    expect(product.category).toBe('Electronics');
    expect(Number(product.price)).toBe(49.9);
    expect(product.description).toBeNull();
  });
});

describe('ProductService.getById', () => {
  it('returns the matching product', async () => {
    const created = await service.create({
      name: 'Mouse',
      category: 'Electronics',
      price: 19.99,
    });
    const found = await service.getById(created.id);
    expect(found.id).toBe(created.id);
  });

  it('throws a 404 ApiError when the product does not exist', async () => {
    await expect(
      service.getById('00000000-0000-0000-0000-000000000000'),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});

describe('ProductService.update', () => {
  it('updates only the provided fields', async () => {
    const created = await service.create({
      name: 'Monitor',
      description: 'Old description',
      category: 'Electronics',
      price: 199,
    });

    const updated = await service.update(created.id, { price: 149 });

    expect(updated.name).toBe('Monitor'); // unchanged
    expect(updated.description).toBe('Old description'); // unchanged
    expect(Number(updated.price)).toBe(149);
  });

  it('throws a 404 ApiError when updating a missing product', async () => {
    await expect(
      service.update('00000000-0000-0000-0000-000000000000', { price: 1 }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('ProductService.remove', () => {
  it('deletes the product so it can no longer be found', async () => {
    const created = await service.create({
      name: 'Webcam',
      category: 'Electronics',
      price: 59,
    });
    await service.remove(created.id);
    await expect(service.getById(created.id)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('throws a 404 ApiError when deleting a missing product', async () => {
    await expect(
      service.remove('00000000-0000-0000-0000-000000000000'),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('ProductService.list filters', () => {
  beforeEach(async () => {
    await service.create({ name: 'Red Chair', category: 'Furniture', price: 80 });
    await service.create({ name: 'Blue Chair', category: 'Furniture', price: 120 });
    await service.create({ name: 'Laptop Stand', category: 'Electronics', price: 30 });
  });

  it('filters by category (case-insensitive)', async () => {
    const result = await service.list({
      category: 'furniture',
      page: 1,
      limit: 20,
    });
    expect(result.total).toBe(2);
    expect(result.data.every((p) => p.category === 'Furniture')).toBe(true);
  });

  it('filters by case-insensitive name search', async () => {
    const result = await service.list({ search: 'chair', page: 1, limit: 20 });
    expect(result.total).toBe(2);
  });

  it('filters by min/max price range', async () => {
    const result = await service.list({
      minPrice: 50,
      maxPrice: 100,
      page: 1,
      limit: 20,
    });
    expect(result.data.map((p) => p.name)).toEqual(['Red Chair']);
  });

  it('paginates results', async () => {
    const page1 = await service.list({ page: 1, limit: 2 });
    const page2 = await service.list({ page: 2, limit: 2 });

    expect(page1.data).toHaveLength(2);
    expect(page1.total).toBe(3);
    expect(page2.data).toHaveLength(1);
  });
});
