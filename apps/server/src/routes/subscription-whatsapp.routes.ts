import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { sendSubscriptionWhatsappReminder } from '../controllers/subscription-whatsapp.controller'

const router = Router()

router.post(
  '/subscription/whatsapp-reminder',
  protect,
  sendSubscriptionWhatsappReminder
)

export default router
