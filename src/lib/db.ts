import { Pool } from 'pg';

// Create a singleton connection pool
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tastechain';

export const pool: Pool =
  global._pgPool ||
  new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 500) {
    console.warn(`[DB Slow Query] ${duration}ms: ${text.slice(0, 100)}...`);
  }
  return res.rows;
}
