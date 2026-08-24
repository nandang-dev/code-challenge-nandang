import type { NextFunction, Request, Response } from 'express';
import type { ProductService } from '../services/product.service';
import {
  toProductResponse,
  type CreateProductDto,
  type ListProductsQueryDto,
  type UpdateProductDto,
} from '../dtos/product.dto';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateProductDto;
      const product = await this.service.create(dto);
      res.status(201).json(toProductResponse(product));
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as ListProductsQueryDto;
      const result = await this.service.list(query);
      res.status(200).json({
        data: result.data.map(toProductResponse),
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.getById(req.params.id);
      res.status(200).json(toProductResponse(product));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateProductDto;
      const product = await this.service.update(req.params.id, dto);
      res.status(200).json(toProductResponse(product));
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
