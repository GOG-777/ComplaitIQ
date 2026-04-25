import { Request } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
        return
    }

    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username])
    const admin = result.rows[0]

    if (!admin) {
        res.status(401).json({ message: 'Invalid credentials' })
        return
    }

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
        res.status(401).json({ message: 'Invalid credentials' })
        return
    }

    const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as `${number}${'s' | 'm' | 'h' | 'd'}` }
    )

    res.json({ token, username: admin.username })
}

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    res.status(403).json({ message: 'Admin creation is disabled in this demo project.' })
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(403).json({ message: 'Password changing has been disabled by the developer as this is a public demo project.' })
}