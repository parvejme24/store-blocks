import mongoose, { ClientSession } from "mongoose";
import { UnitOfWork } from "../../../../shared/src/index.js";

export class MongoUnitOfWork implements UnitOfWork {
  async run<T>(fn: (session: unknown) => Promise<T>): Promise<T> {
    const session: ClientSession = await mongoose.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }
}

export const unitOfWork = new MongoUnitOfWork();

