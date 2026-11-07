import { AppError, ErrorCodes, Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  BrandQuery
} from "../shared/brands.schemas.js";
import { BrandRepository } from "./brands.repository.js";

export class BrandService {
  constructor(private readonly repo: BrandRepository) {}

  async getBrands(query: BrandQuery): Promise<Paginated<Brand>> {
    return this.repo.findMany(query);
  }

  async getBrandById(id: string, tx?: TxContext): Promise<Brand> {
    const brand = await this.repo.findById(id, tx);
    if (!brand) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Brand not found with id: ${id}`, 404);
    }
    return brand;
  }

  async getBrandBySlug(slug: string, tx?: TxContext): Promise<Brand> {
    const brand = await this.repo.findBySlug(slug, tx);
    if (!brand) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Brand not found with slug: ${slug}`, 404);
    }
    return brand;
  }

  async createBrand(input: CreateBrandInput, tx?: TxContext): Promise<Brand> {
    const existing = await this.repo.findBySlug(input.slug, tx);
    if (existing) {
      throw new AppError(ErrorCodes.CONFLICT, `Brand with slug '${input.slug}' already exists`, 409);
    }
    return this.repo.create(input, tx);
  }

  async updateBrand(id: string, input: UpdateBrandInput, tx?: TxContext): Promise<Brand> {
    await this.getBrandById(id, tx);
    if (input.slug) {
      const existing = await this.repo.findBySlug(input.slug, tx);
      if (existing && existing.id !== id) {
        throw new AppError(ErrorCodes.CONFLICT, `Brand with slug '${input.slug}' already exists`, 409);
      }
    }
    const updated = await this.repo.update(id, input, tx);
    return updated!;
  }

  async deleteBrand(id: string, tx?: TxContext): Promise<void> {
    await this.getBrandById(id, tx);
    await this.repo.delete(id, tx);
  }
}

