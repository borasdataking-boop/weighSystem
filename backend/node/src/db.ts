import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

function resolveDatabaseUrl(): string {
  // Ưu tiên đọc từ file config ngoài luồng db_config.json ở thư mục gốc
  const candidates = [
    path.resolve(process.cwd(), 'db_config.json'),
    path.resolve(__dirname, '../../../db_config.json')
  ];
  for (const cfgPath of candidates) {
    if (fs.existsSync(cfgPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
        if (raw && typeof raw.DATABASE_URL === 'string' && raw.DATABASE_URL.trim()) {
          return raw.DATABASE_URL.trim();
        }
      } catch {
        // ignore invalid json
      }
    }
  }
  return process.env.DATABASE_URL || 'postgresql://phanbach@localhost:5432/weigh_dashboard';
}

export const pool = new Pool({
  connectionString: resolveDatabaseUrl(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
