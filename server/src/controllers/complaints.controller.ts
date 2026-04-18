import { Request, Response } from 'express'
import pool from '../config/database'
import { generateAutoResponse } from '../services/autoResponse.service'
import { ComplaintCategory } from '../types'
import { sendConfirmationEmail } from '../services/mail.service'

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

    try {
        await sendConfirmationEmail(
            email,
            name,
            ticket_id,
            subject,
            autoContent
        )
    } catch {
        // Email failure should not block the complaint submission
    }

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

export const getComplaintByTicketId = async (req: Request, res: Response): Promise<void> => {
    const { ticket_id } = req.params

    const complaint = await pool.query(
        'SELECT * FROM complaints WHERE ticket_id = $1',
        [ticket_id]
    )

    if (complaint.rows.length === 0) {
        res.status(404).json({ message: 'No complaint found with that ticket ID.' })
        return
    }

    const responses = await pool.query(
        'SELECT * FROM responses WHERE complaint_id = $1 ORDER BY created_at ASC',
        [complaint.rows[0].id]
    )

    const { email, ...safeComplaint } = complaint.rows[0]

    res.json({ ...safeComplaint, responses: responses.rows })
}

export const submitFollowUp = async (req: Request, res: Response): Promise<void> => {
    const { ticket_id } = req.params
    const { content } = req.body

    if (!content || !content.trim()) {
        res.status(400).json({ message: 'Message content is required.' })
        return
    }

    const complaint = await pool.query(
        'SELECT * FROM complaints WHERE ticket_id = $1',
        [ticket_id]
    )

    if (complaint.rows.length === 0) {
        res.status(404).json({ message: 'No complaint found with that ticket ID.' })
        return
    }

    if (complaint.rows[0].status === 'resolved') {
        res.status(400).json({ message: 'This ticket is resolved. Please submit a new complaint if you have a different concern.' })
        return
    }

    await pool.query(
        `INSERT INTO responses (complaint_id, content, type)
     VALUES ($1, $2, 'user')`,
        [complaint.rows[0].id, content.trim()]
    )

    await pool.query(
        'UPDATE complaints SET status = $1 WHERE id = $2',
        ['pending', complaint.rows[0].id]
    )

    res.json({ message: 'Your follow-up has been submitted. The support team will respond shortly.' })
}

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    const [byCategory, byStatus, byPriority, overTime, totals] = await Promise.all([
        pool.query(`
      SELECT category, COUNT(*)::int AS count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
    `),
        pool.query(`
      SELECT status, COUNT(*)::int AS count
      FROM complaints
      GROUP BY status
    `),
        pool.query(`
      SELECT priority, COUNT(*)::int AS count
      FROM complaints
      GROUP BY priority
    `),
        pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
        pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
        COUNT(*) FILTER (WHERE status = 'open')::int AS open,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
      FROM complaints
    `),
    ])

    res.json({
        byCategory: byCategory.rows,
        byStatus: byStatus.rows,
        byPriority: byPriority.rows,
        overTime: overTime.rows,
        totals: totals.rows[0],
    })
}

export const exportComplaints = async (req: Request, res: Response): Promise<void> => {
    const result = await pool.query(`
    SELECT
      c.ticket_id,
      c.name,
      c.email,
      c.category,
      c.priority,
      c.status,
      c.subject,
      c.description,
      c.created_at,
      c.updated_at,
      COUNT(r.id) FILTER (WHERE r.type = 'admin')::int AS admin_responses
    FROM complaints c
    LEFT JOIN responses r ON r.complaint_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)

    const headers = [
        'Ticket ID', 'Name', 'Email', 'Category', 'Priority',
        'Status', 'Subject', 'Description', 'Submitted At', 'Last Updated', 'Admin Responses'
    ]

    const escape = (val: unknown): string => {
        const str = String(val ?? '')
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
    }

    const rows = result.rows.map(r => [
        r.ticket_id,
        r.name,
        r.email,
        r.category,
        r.priority,
        r.status,
        r.subject,
        r.description,
        new Date(r.created_at).toLocaleString('en-GB'),
        new Date(r.updated_at).toLocaleString('en-GB'),
        r.admin_responses,
    ].map(escape).join(','))

    const csv = [headers.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="complaints-${Date.now()}.csv"`)
    res.send(csv)
}