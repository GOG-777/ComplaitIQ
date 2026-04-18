import { Router } from 'express'
import { login, createAdmin, changePassword } from '../controllers/auth.controller'
import { protect } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.post('/create', protect, createAdmin)
router.post('/change-password', protect, changePassword)

export default router