import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  User,
  UserWithPassword,
  CreateUserInput,
  AdminUpdateUserInput,
  UserQuery
} from "../shared/users.schemas.js";

export interface UserRepository {
  findMany(query: UserQuery): Promise<Paginated<User>>;
  findById(id: string, tx?: TxContext): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findWithPasswordByEmail(email: string): Promise<UserWithPassword | null>;
  create(input: CreateUserInput, passwordHash: string, tx?: TxContext): Promise<User>;
  update(id: string, input: AdminUpdateUserInput, tx?: TxContext): Promise<User | null>;
  updatePassword(id: string, passwordHash: string, tx?: TxContext): Promise<boolean>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

