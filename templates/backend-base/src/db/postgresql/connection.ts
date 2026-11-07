import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

const { Pool } = pg;

export let pool: pg.Pool;
export let db: NodePgDatabase;

export async function connectDatabase(): Promise<void> {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required to connect to PostgreSQL");
  }

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  pool.on("error", (err) => {
    logger.error({ err }, "Unexpected error on idle PostgreSQL client");
  });

  // Verify connection
  const client = await pool.connect();
  client.release();
  logger.info("PostgreSQL connection established");

  db = drizzle(pool);
}

export async function disconnectDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info("PostgreSQL pool has ended");
  }
}

