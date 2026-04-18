import { Router } from 'express'
import {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintByTicketId,
  submitFollowUp,
  getAnalytics,
  exportComplaints,
} from '../controllers/complaints.controller'

import { protect } from '../middleware/auth'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest'
import { rateLimit } from 'express-rate-limit'

const router = Router()

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post(
  '/',
  submitLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('category').isIn(['billing', 'technical', 'service', 'delivery', 'other']).withMessage('Invalid category'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  ],
  validateRequest,
  submitComplaint
)

router.get('/track/:ticket_id', getComplaintByTicketId)
router.post(
  '/track/:ticket_id/followup',
  [
    body('content').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.'),
  ],
  validateRequest,
  submitFollowUp
)
router.get('/', protect, getComplaints)
router.get('/:id', protect, getComplaintById)
router.patch('/:id/status', protect, updateComplaintStatus)
router.get('/analytics/summary', protect, getAnalytics)
router.get('/export/csv', protect, exportComplaints)

export default router