import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envFile });

console.log(`Using ${envFile} for configuration`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

if (process.env.NODE_ENV !== 'production') {
  pool.getConnection()
    .then((conn) => {
      console.log('Successfully connected to MySQL');
      conn.release()
    })
    .catch((err) => {
      console.error('Error connecting to MySQL:', err);
    });
}

export default pool;