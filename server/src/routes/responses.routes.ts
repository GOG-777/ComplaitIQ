import { Router } from 'express'
import { sendAdminResponse } from '../controllers/responses.controller'
import { protect } from '../middleware/auth'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest'

const router = Router()

router.post(
  '/:id/respond',
  protect,
  [
    body('content').trim().notEmpty().withMessage('Response content is required'),
    body('status').optional().isIn(['open', 'pending', 'resolved']).withMessage('Invalid status'),
  ],
  validateRequest,
  sendAdminResponse
)

export default router