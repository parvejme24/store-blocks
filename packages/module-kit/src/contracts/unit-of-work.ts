export type TxContext = unknown;

export interface UnitOfWork {
  /**
   * Runs the given callback inside a database transaction.
   * If the callback throws an error, the transaction is automatically rolled back.
   * If it succeeds, the transaction is committed.
   */
  run<T>(fn: (tx: TxContext) => Promise<T>): Promise<T>;
}

