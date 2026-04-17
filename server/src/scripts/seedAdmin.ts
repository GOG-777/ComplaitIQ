import bcrypt from 'bcryptjs'
import pool from '../config/database'
import dotenv from 'dotenv'

dotenv.config()

const seed = async () => {
  const username = 'admin'
  const password = 'Admin1234!'

  const exists = await pool.query('SELECT id FROM admins WHERE username = $1', [username])
  if (exists.rows.length > 0) {
    console.log('Admin already exists')
    process.exit(0)
  }

  const hash = await bcrypt.hash(password, 12)
  await pool.query(
    'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
    [username, hash]
  )

  console.log('Admin created successfully')
  console.log('Username: admin')
  console.log('Password: Admin1234!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})