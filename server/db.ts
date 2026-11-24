import Database from 'better-sqlite3';
import { Pool, type PoolClient, type QueryResultRow } from '@neondatabase/serverless';
import path from 'path';

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<{ rows: QueryResultRow[]; rowCount: number | null }>;
};

type Statement = {
  all: (...values: unknown[]) => Promise<QueryResultRow[]>;
  get: (...values: unknown[]) => Promise<QueryResultRow | undefined>;
  run: (...values: unknown[]) => Promise<{ lastInsertRowid: unknown; changes: number }>;
};

type DatabaseApi = {
  prepare: (sql: string) => Statement;
  transaction: <T>(callback: (tx: DatabaseApi) => Promise<T>) => Promise<T>;
};

const databaseUrl = process.env.DATABASE_URL || 'file:./magestic.db';
const usePostgres = /^postgres(?:ql)?:\/\//i.test(databaseUrl);
if (process.env.VERCEL && !usePostgres) {
  throw new Error('Set DATABASE_URL to a Neon PostgreSQL connection string before deploying to Vercel.');
}
const sqlite = usePostgres
  ? null
  : new Database(
      path.resolve(
        process.cwd(),
        databaseUrl.startsWith('file:') ? databaseUrl.replace(/^file:/, '') : 'magestic.db'
      )
    );
const pool = usePostgres ? new Pool({ connectionString: databaseUrl, max: 1 }) : null;

let sqliteQueue = Promise.resolve();

function withSqliteLock<T>(callback: () => T): Promise<T> {
  const previous = sqliteQueue;
  let release!: () => void;
  sqliteQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  return previous.then(() => {
    try {
      return callback();
    } finally {
      release();
    }
  });
}

function postgresParams(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function makeDatabase(query: Queryable['query']): DatabaseApi {
  return {
    prepare(sql: string) {
      return {
        all: async (...values: unknown[]) => (await query(postgresParams(sql), values)).rows,
        get: async (...values: unknown[]) => (await query(postgresParams(sql), values)).rows[0],
        run: async (...values: unknown[]) => {
          const returnsId = Boolean(pool) &&
            /^\s*INSERT\s+INTO\s+(?!settings\b)/i.test(sql) && !/\bRETURNING\b/i.test(sql);
          const result = await query(
            postgresParams(returnsId ? `${sql.trim().replace(/;$/, '')} RETURNING id` : sql),
            values
          );
          return { lastInsertRowid: result.rows[0]?.id ?? 0, changes: result.rowCount ?? 0 };
        },
      };
    },
    async transaction<T>(callback: (tx: ReturnType<typeof makeDatabase>) => Promise<T>): Promise<T> {
      if (pool) {
        const client: PoolClient = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await callback(makeDatabase(client.query.bind(client)));
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }

      return withSqliteLock(async () => {
        sqlite!.exec('BEGIN');
        try {
          const result = await callback(
            makeDatabase(async (statement, values = []) => {
              const prepared = sqlite!.prepare(statement.replace(/\$\d+/g, '?'));
              if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(statement)) {
                const rows = prepared.all(...values) as QueryResultRow[];
                return { rows, rowCount: rows.length };
              }
              const write = prepared.run(...values);
              return {
                rows: write.lastInsertRowid
                  ? ([{ id: write.lastInsertRowid }] as unknown as QueryResultRow[])
                  : [],
                rowCount: write.changes,
              };
            })
          );
          sqlite!.exec('COMMIT');
          return result;
        } catch (error) {
          sqlite!.exec('ROLLBACK');
          throw error;
        }
      });
    },
  };
}

const runQuery: Queryable['query'] = async (sql, values = []) => {
  if (pool) {
    return pool.query(sql, values);
  }
  return withSqliteLock(() => {
    const statement = sqlite!.prepare(sql.replace(/\$\d+/g, '?'));
    if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql)) {
      const rows = statement.all(...values) as QueryResultRow[];
      return { rows, rowCount: rows.length };
    }
    const write = statement.run(...values);
    return {
      rows: write.lastInsertRowid
        ? ([{ id: write.lastInsertRowid }] as unknown as QueryResultRow[])
        : [],
      rowCount: write.changes,
    };
  });
};

export const db = makeDatabase(runQuery);

export async function initDatabase() {
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        description TEXT NOT NULL, fabric TEXT NOT NULL, work TEXT NOT NULL, lining TEXT NOT NULL,
        buttons TEXT NOT NULL, sizes TEXT NOT NULL, moq INTEGER NOT NULL DEFAULT 6,
        occasion TEXT NOT NULL DEFAULT '[]', price_note TEXT NOT NULL DEFAULT 'On request',
        starting_price TEXT NOT NULL DEFAULT '', is_new INTEGER NOT NULL DEFAULT 0,
        is_best_seller INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
      );
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        colour_name TEXT NOT NULL, colour_hex TEXT NOT NULL, stock_status TEXT NOT NULL DEFAULT 'Ready Stock'
      );
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL, url TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'front', sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY, reference_code TEXT NOT NULL UNIQUE, type TEXT NOT NULL DEFAULT 'enquiry',
        shop_name TEXT NOT NULL, contact_person TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '', state TEXT NOT NULL DEFAULT '', gst_number TEXT NOT NULL DEFAULT '',
        total_quantity INTEGER NOT NULL DEFAULT 0, custom_label INTEGER NOT NULL DEFAULT 0,
        notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'New',
        created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
      );
      CREATE TABLE IF NOT EXISTS enquiry_items (
        id SERIAL PRIMARY KEY, enquiry_id INTEGER NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, product_name TEXT NOT NULL,
        colour TEXT NOT NULL DEFAULT '', size_split TEXT NOT NULL DEFAULT '{}', quantity INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY, retailer_name TEXT NOT NULL, shop TEXT NOT NULL, city TEXT NOT NULL,
        quote TEXT NOT NULL, image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'ADMIN', created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
      );
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    `);
    return;
  }

  sqlite!.pragma('journal_mode = WAL');
  sqlite!.pragma('foreign_keys = ON');
  sqlite!.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, description TEXT NOT NULL,
      fabric TEXT NOT NULL, work TEXT NOT NULL, lining TEXT NOT NULL, buttons TEXT NOT NULL, sizes TEXT NOT NULL,
      moq INTEGER NOT NULL DEFAULT 6, occasion TEXT NOT NULL DEFAULT '[]', price_note TEXT NOT NULL DEFAULT 'On request',
      starting_price TEXT NOT NULL DEFAULT '', is_new INTEGER NOT NULL DEFAULT 0, is_best_seller INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      colour_name TEXT NOT NULL, colour_hex TEXT NOT NULL, stock_status TEXT NOT NULL DEFAULT 'Ready Stock'
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL, url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'front', sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, reference_code TEXT NOT NULL UNIQUE, type TEXT NOT NULL DEFAULT 'enquiry',
      shop_name TEXT NOT NULL, contact_person TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '', state TEXT NOT NULL DEFAULT '', gst_number TEXT NOT NULL DEFAULT '',
      total_quantity INTEGER NOT NULL DEFAULT 0, custom_label INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'New', created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS enquiry_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, enquiry_id INTEGER NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, product_name TEXT NOT NULL,
      colour TEXT NOT NULL DEFAULT '', size_split TEXT NOT NULL DEFAULT '{}', quantity INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT, retailer_name TEXT NOT NULL, shop TEXT NOT NULL, city TEXT NOT NULL,
      quote TEXT NOT NULL, image TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN', created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
}
