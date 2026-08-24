import type { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import type {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from '../dtos/product.dto';
import { ApiError } from '../middleware/api-error';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ProductService {
  constructor(private readonly repo: Repository<Product>) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category,
      price: dto.price.toFixed(2),
    });
    return this.repo.save(product);
  }

  async list(query: ListProductsQueryDto): Promise<PaginatedResult<Product>> {
    const qb = this.repo.createQueryBuilder('product');

    if (query.category) {
      qb.andWhere('LOWER(product.category) = LOWER(:category)', {
        category: query.category,
      });
    }
    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: query.page, limit: query.limit };
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw ApiError.notFound(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.getById(id);
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.getById(id);
    await this.repo.remove(product);
  }
}
