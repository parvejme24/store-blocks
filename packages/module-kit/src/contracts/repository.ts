import { TxContext } from "./unit-of-work.js";

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Repository<T, TCreateInput, TUpdateInput, TQuery = PaginationParams> {
  findMany(query: TQuery): Promise<Paginated<T>>;
  findById(id: string, tx?: TxContext): Promise<T | null>;
  create(input: TCreateInput, tx?: TxContext): Promise<T>;
  update(id: string, input: TUpdateInput, tx?: TxContext): Promise<T | null>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

