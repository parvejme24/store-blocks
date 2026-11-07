import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  BrandQuery
} from "../shared/brands.schemas.js";

export interface BrandRepository {
  findMany(query: BrandQuery): Promise<Paginated<Brand>>;
  findById(id: string, tx?: TxContext): Promise<Brand | null>;
  findBySlug(slug: string, tx?: TxContext): Promise<Brand | null>;
  create(input: CreateBrandInput, tx?: TxContext): Promise<Brand>;
  update(id: string, input: UpdateBrandInput, tx?: TxContext): Promise<Brand | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

