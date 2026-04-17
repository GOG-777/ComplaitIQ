import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'
import pool from './config/database'
import authRoutes from './routes/auth.routes'
import complaintRoutes from './routes/complaints.routes'
import responseRoutes from './routes/responses.routes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 5000

app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter, authRoutes)
app.post('/api/complaints', submitLimiter)
app.use('/api/complaints', complaintRoutes)
app.use('/api/complaints', responseRoutes)

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(500).json({ status: 'error', database: 'unreachable' })
  }
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app