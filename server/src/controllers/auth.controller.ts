import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database'

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
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
        return
    }

    if (password.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters' })
        return
    }

    const exists = await pool.query('SELECT id FROM admins WHERE username = $1', [username])
    if (exists.rows.length > 0) {
        res.status(409).json({ message: 'Username already taken' })
        return
    }

    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
        'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
        [username, hash]
    )

    res.status(201).json(result.rows[0])
}