import { Router } from 'express'
import {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from '../controllers/complaints.controller'
import { protect } from '../middleware/auth'
import { body, query } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest'

const router = Router()

router.post(
  '/',
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

router.get('/', protect, getComplaints)
router.get('/:id', protect, getComplaintById)
router.patch('/:id/status', protect, updateComplaintStatus)

export default router