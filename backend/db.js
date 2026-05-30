import pg from 'pg';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env file (explicit path to solve CWD monorepo issue)
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;

let connectionString = process.env.DATABASE_URL;

if (connectionString) {
  // Trim and strip wrapping quotes
  connectionString = connectionString.trim().replace(/^["']|["']$/g, '');
  
  // Strip duplicate 'DATABASE_URL=' prefix if accidentally set inside the value
  if (connectionString.startsWith('DATABASE_URL=')) {
    connectionString = connectionString.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
  }
}

if (!connectionString) {
  console.warn('\n⚠️ WARNING: DATABASE_URL is not defined! Please define your Neon connection string in backend/.env for local testing.\n');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

// Auto-initialize standard PostgreSQL tables on database startup
const initDb = async () => {
  if (!connectionString) return;
  try {
    const client = await pool.connect();
    console.log('Connected to Neon Serverless PostgreSQL database successfully.');

    // 1. Create messages table for contact submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        date VARCHAR(100) NOT NULL
      )
    `);

    // 2. Create orders table for customer orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        detail TEXT NOT NULL,
        items TEXT NOT NULL, -- Stored as JSON string representation
        total DOUBLE PRECISION NOT NULL,
        notes TEXT,
        status VARCHAR(50) NOT NULL,
        date VARCHAR(100) NOT NULL
      )
    `);

    client.release();
    console.log('PostgreSQL database schemas initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Neon PostgreSQL database schemas:', err);
  }
};

initDb();

/**
 * Automatically transforms SQLite parameter placeholders (?) into standard PostgreSQL numbered placeholders ($1, $2, $3...)
 * @param {string} sql - The SQL statement containing '?' placeholders
 * @returns {string} - The SQL statement with '$x' placeholders
 */
const convertToPgParams = (sql) => {
  let pgSql = sql;
  let paramIndex = 1;
  while (pgSql.includes('?')) {
    pgSql = pgSql.replace('?', `$${paramIndex++}`);
  }
  return pgSql;
};

// Promise adapter helper methods designed to map perfectly to previous SQLite operations
export const dbRun = async (query, params = []) => {
  const pgQuery = convertToPgParams(query);
  const result = await pool.query(pgQuery, params);
  return {
    changes: result.rowCount,
    lastID: null
  };
};

export const dbAll = async (query, params = []) => {
  const pgQuery = convertToPgParams(query);
  const result = await pool.query(pgQuery, params);
  return result.rows;
};

export const dbGet = async (query, params = []) => {
  const pgQuery = convertToPgParams(query);
  const result = await pool.query(pgQuery, params);
  return result.rows[0] || null;
};

export default pool;
