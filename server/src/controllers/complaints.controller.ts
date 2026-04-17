import { Request, Response } from 'express'
import pool from '../config/database'
import { generateAutoResponse } from '../services/autoResponse.service'
import { ComplaintCategory } from '../types'

const generateTicketId = (): string => {
  const datePart = Date.now().toString().slice(-6)
  const randPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `IQ-${datePart}-${randPart}`
}

export const submitComplaint = async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, category, priority, description } = req.body

  const ticket_id = generateTicketId()

  const complaint = await pool.query(
    `INSERT INTO complaints (ticket_id, name, email, subject, category, priority, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [ticket_id, name, email, subject, category, priority, description]
  )

  const autoContent = generateAutoResponse(category as ComplaintCategory)

  await pool.query(
    `INSERT INTO responses (complaint_id, content, type)
     VALUES ($1, $2, 'auto')`,
    [complaint.rows[0].id, autoContent]
  )

  res.status(201).json({
    ticket_id,
    auto_response: autoContent,
  })
}

export const getComplaints = async (req: Request, res: Response): Promise<void> => {
  const { status, category, search } = req.query

  let query = `
    SELECT c.*, r.content AS latest_response, r.type AS response_type
    FROM complaints c
    LEFT JOIN LATERAL (
      SELECT content, type FROM responses
      WHERE complaint_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) r ON true
    WHERE 1=1
  `
  const params: unknown[] = []
  let idx = 1

  if (status) {
    query += ` AND c.status = $${idx++}`
    params.push(status)
  }

  if (category) {
    query += ` AND c.category = $${idx++}`
    params.push(category)
  }

  if (search) {
    query += ` AND (c.name ILIKE $${idx} OR c.subject ILIKE $${idx} OR c.ticket_id ILIKE $${idx})`
    params.push(`%${search}%`)
    idx++
  }

  query += ' ORDER BY c.created_at DESC'

  const result = await pool.query(query, params)
  res.json(result.rows)
}

export const getComplaintById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  const complaint = await pool.query('SELECT * FROM complaints WHERE id = $1', [id])

  if (complaint.rows.length === 0) {
    res.status(404).json({ message: 'Complaint not found' })
    return
  }

  const responses = await pool.query(
    'SELECT * FROM responses WHERE complaint_id = $1 ORDER BY created_at ASC',
    [id]
  )

  res.json({ ...complaint.rows[0], responses: responses.rows })
}

export const updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { status } = req.body

  const result = await pool.query(
    'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  )

  if (result.rows.length === 0) {
    res.status(404).json({ message: 'Complaint not found' })
    return
  }

  res.json(result.rows[0])
}