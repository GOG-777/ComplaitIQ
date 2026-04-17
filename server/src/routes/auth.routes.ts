import { Router } from 'express'
import { login, createAdmin } from '../controllers/auth.controller'
import { protect } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.post('/create', protect, createAdmin)

export default router