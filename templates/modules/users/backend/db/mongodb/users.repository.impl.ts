import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  User,
  UserWithPassword,
  CreateUserInput,
  AdminUpdateUserInput,
  UserQuery
} from "../../../shared/users.schemas.js";
import { UserRepository } from "../../users.repository.js";
import { UserModel, IUserDocument } from "./users.model.js";

function toUser(doc: IUserDocument): User {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    phone: obj.phone,
    addresses: (obj.addresses || []).map((a: any) => ({
      id: a.id,
      label: a.label || "Home",
      street: a.street,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country || "Bangladesh",
      phone: a.phone,
      isDefault: a.isDefault || false
    })),
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

function toUserWithPassword(doc: IUserDocument): UserWithPassword {
  const user = toUser(doc);
  return {
    ...user,
    passwordHash: doc.passwordHash
  };
}

export class MongoUserRepository implements UserRepository {
  async findMany(query: UserQuery): Promise<Paginated<User>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IUserDocument> = {};
    if (query.q) {
      filter.$text = { $search: query.q };
    }
    if (query.role) {
      filter.role = query.role;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [docs, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toUser(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<User | null> {
    const session = tx as ClientSession | undefined;
    const doc = await UserModel.findById(id).session(session || null);
    if (!doc) return null;
    return toUser(doc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!doc) return null;
    return toUser(doc);
  }

  async findWithPasswordByEmail(email: string): Promise<UserWithPassword | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!doc) return null;
    return toUserWithPassword(doc);
  }

  async create(input: CreateUserInput, passwordHash: string, tx?: TxContext): Promise<User> {
    const session = tx as ClientSession | undefined;
    const [doc] = await UserModel.create(
      [
        {
          name: input.name,
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: input.role || "customer",
          phone: input.phone,
          addresses: input.addresses || [],
          isActive: input.isActive ?? true
        }
      ],
      { session: session || undefined }
    );
    return toUser(doc!);
  }

  async update(id: string, input: AdminUpdateUserInput, tx?: TxContext): Promise<User | null> {
    const session = tx as ClientSession | undefined;
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toUser(doc);
  }

  async updatePassword(id: string, passwordHash: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await UserModel.updateOne(
      { _id: id },
      { $set: { passwordHash } },
      { session: session || null }
    );
    return res.modifiedCount > 0;
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await UserModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(res);
  }
}

export const userRepository = new MongoUserRepository();

