import dotenv from 'dotenv';
import { Pool } from 'pg';

// Na Vercel, as variáveis de ambiente já estão disponíveis, não precisa carregar arquivo .env
if (!process.env.VERCEL) {
  const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
  dotenv.config({ path: envFile });
  console.log(`Using ${envFile} for configuration`);
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== 'production') {
  pool.connect()
    .then((client) => {
      console.log('Successfully connected to PostgreSQL');
      client.release();
    })
    .catch((err) => {
      console.error('Error connecting to PostgreSQL:', err);
    });
}

export default pool;