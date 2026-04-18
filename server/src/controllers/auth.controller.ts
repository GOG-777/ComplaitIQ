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

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body
    const adminId = req.admin?.id

    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Both current and new password are required.' })
        return
    }

    if (newPassword.length < 8) {
        res.status(400).json({ message: 'New password must be at least 8 characters.' })
        return
    }

    if (currentPassword === newPassword) {
        res.status(400).json({ message: 'New password must be different from your current password.' })
        return
    }

    const result = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId])
    const admin = result.rows[0]

    if (!admin) {
        res.status(404).json({ message: 'Admin account not found.' })
        return
    }

    const valid = await bcrypt.compare(currentPassword, admin.password_hash)
    if (!valid) {
        res.status(401).json({ message: 'Current password is incorrect.' })
        return
    }

    const hash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [hash, adminId])

    res.json({ message: 'Password updated successfully.' })
}