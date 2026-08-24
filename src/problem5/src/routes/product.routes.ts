import { Router } from 'express';
import type { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import { ProductService } from '../services/product.service';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from '../dtos/product.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         category: { type: string }
 *         price: { type: number, format: float }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     ProductInput:
 *       type: object
 *       required: [name, category, price]
 *       properties:
 *         name: { type: string }
 *         description: { type: string }
 *         category: { type: string }
 *         price: { type: number }
 *     ValidationError:
 *       type: object
 *       properties:
 *         error: { type: string, example: VALIDATION_ERROR }
 *         message: { type: string }
 *         issues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path: { type: string }
 *               message: { type: string }
 *     NotFoundError:
 *       type: object
 *       properties:
 *         error: { type: string, example: NOT_FOUND }
 *         message: { type: string }
 */
export function buildProductRouter(repo: Repository<Product>): Router {
  const router = Router();
  const controller = new ProductController(new ProductService(repo));

  /**
   * @openapi
   * /products:
   *   post:
   *     summary: Create a product
   *     tags: [Products]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/ProductInput' }
   *     responses:
   *       201:
   *         description: Product created successfully
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Product' }
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/ValidationError' }
   */
  router.post('/', validate(createProductSchema, 'body'), controller.create);

  /**
   * @openapi
   * /products:
   *   get:
   *     summary: List products with optional filters
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema: { type: string }
   *         description: Exact category match (case-insensitive)
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Case-insensitive substring match on product name
   *       - in: query
   *         name: minPrice
   *         schema: { type: number }
   *       - in: query
   *         name: maxPrice
   *         schema: { type: number }
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20, maximum: 100 }
   *     responses:
   *       200:
   *         description: Paginated list of products
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items: { $ref: '#/components/schemas/Product' }
   *                 total: { type: integer }
   *                 page: { type: integer }
   *                 limit: { type: integer }
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/ValidationError' }
   */
  router.get(
    '/',
    validate(listProductsQuerySchema, 'query'),
    controller.list,
  );

  /**
   * @openapi
   * /products/{id}:
   *   get:
   *     summary: Get a product by id
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: The requested product
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Product' }
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/NotFoundError' }
   */
  router.get(
    '/:id',
    validate(productIdParamSchema, 'params'),
    controller.getById,
  );

  /**
   * @openapi
   * /products/{id}:
   *   patch:
   *     summary: Update a product (partial update)
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               description: { type: string }
   *               category: { type: string }
   *               price: { type: number }
   *     responses:
   *       200:
   *         description: Product updated successfully
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Product' }
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/ValidationError' }
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/NotFoundError' }
   */
  router.patch(
    '/:id',
    validate(productIdParamSchema, 'params'),
    validate(updateProductSchema, 'body'),
    controller.update,
  );

  /**
   * @openapi
   * /products/{id}:
   *   delete:
   *     summary: Delete a product
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       204:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/NotFoundError' }
   */
  router.delete(
    '/:id',
    validate(productIdParamSchema, 'params'),
    controller.remove,
  );

  return router;
}
