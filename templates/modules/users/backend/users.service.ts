import { AppError, ErrorCodes, Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  User,
  CreateUserInput,
  UpdateUserProfileInput,
  AdminUpdateUserInput,
  UserQuery
} from "../shared/users.schemas.js";
import { UserRepository } from "./users.repository.js";

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getUsers(query: UserQuery): Promise<Paginated<User>> {
    return this.repo.findMany(query);
  }

  async getUserById(id: string, tx?: TxContext): Promise<User> {
    const user = await this.repo.findById(id, tx);
    if (!user) {
      throw new AppError(ErrorCodes.NOT_FOUND, `User not found with id: ${id}`, 404);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email.toLowerCase().trim());
  }

  async updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput,
    tx?: TxContext
  ): Promise<User> {
    const existing = await this.getUserById(userId, tx);
    const updated = await this.repo.update(userId, input, tx);
    if (!updated) {
      throw new AppError(ErrorCodes.NOT_FOUND, `User not found with id: ${userId}`, 404);
    }
    return updated;
  }

  async adminUpdateUser(
    id: string,
    input: AdminUpdateUserInput,
    tx?: TxContext
  ): Promise<User> {
    await this.getUserById(id, tx);
    const updated = await this.repo.update(id, input, tx);
    if (!updated) {
      throw new AppError(ErrorCodes.NOT_FOUND, `User not found with id: ${id}`, 404);
    }
    return updated;
  }

  async deleteUser(id: string, tx?: TxContext): Promise<void> {
    await this.getUserById(id, tx);
    const deleted = await this.repo.delete(id, tx);
    if (!deleted) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Could not delete user with id: ${id}`, 404);
    }
  }
}

