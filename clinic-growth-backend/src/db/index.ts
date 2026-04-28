import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tinahosseinpour@localhost:5432/clinic_growth',
});

export const db = drizzle(pool, { schema });
export { schema };