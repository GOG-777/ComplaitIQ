import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        idleTimeoutMillis: 30000,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
)

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message)
})

export default pool