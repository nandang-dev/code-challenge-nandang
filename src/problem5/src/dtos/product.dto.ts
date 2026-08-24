import { z } from 'zod';
import type { Product } from '../entities/Product';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1, 'category is required').max(100),
  price: z.coerce.number().positive('price must be greater than 0'),
});
export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().refine(
  (dto) => Object.keys(dto).length > 0,
  { message: 'at least one field must be provided' },
);
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;

export const productIdParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

// API responses always send `price` as a number — the DB/entity keeps it as
// a numeric-as-string internally to avoid floating point rounding.
export interface ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export function toProductResponse(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
