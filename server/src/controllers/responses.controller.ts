import type { Response } from 'express'
import pool from '../config/database'
import type { AuthRequest } from '../middleware/auth'
import { sendResponseEmail } from '../services/mail.service'

export const sendAdminResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { content, status } = req.body
  const admin_id = req.admin?.id

  if (!content || !content.trim()) {
    res.status(400).json({ message: 'Response content is required' })
    return
  }

  const complaintResult = await pool.query('SELECT * FROM complaints WHERE id = $1', [id])
  if (complaintResult.rows.length === 0) {
    res.status(404).json({ message: 'Complaint not found' })
    return
  }

  const complaint = complaintResult.rows[0]

  await pool.query(
    `INSERT INTO responses (complaint_id, content, type, admin_id)
     VALUES ($1, $2, 'admin', $3)`,
    [id, content.trim(), admin_id]
  )

  if (status) {
    await pool.query('UPDATE complaints SET status = $1 WHERE id = $2', [status, id])
  }

  try {
    await sendResponseEmail(
      complaint.email,
      complaint.name,
      complaint.ticket_id,
      complaint.subject,
      content.trim()
    )
  } catch {
    res.status(207).json({
      message: 'Response saved but email delivery failed. Check your mail configuration.',
      status: 'partial',
    })
    return
  }

  const updated = await pool.query('SELECT * FROM complaints WHERE id = $1', [id])
  res.json(updated.rows[0])
}