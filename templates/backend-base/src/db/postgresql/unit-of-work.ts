import { UnitOfWork } from "../../../../shared/src/index.js";
import { db } from "./connection.js";

export class PostgresUnitOfWork implements UnitOfWork {
  async run<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    if (!db) {
      throw new Error("PostgreSQL database connection is not initialized");
    }
    return db.transaction(async (tx) => {
      return fn(tx);
    });
  }
}

export const unitOfWork = new PostgresUnitOfWork();

