import { Router } from 'express'
import { protect, admin } from '../middleware/auth.middleware'
import {
  createRedFlagCompany,
  getAllRedFlagCompanyStats,
  getRedFlagCompanyStats,
  listRedFlagCompanies,
  submitRedFlagDecision,
} from '../controllers/red-flags.controller'

const router = Router()

// Protected (member) routes
router.get('/red-flags/companies', listRedFlagCompanies)
router.post('/red-flags/submissions', protect, submitRedFlagDecision)
router.get('/red-flags/companies/:companyId/stats', getRedFlagCompanyStats)

// Admin routes
router.get('/admin/red-flags/companies', protect, admin, listRedFlagCompanies)
router.post('/admin/red-flags/companies', protect, admin, createRedFlagCompany)
router.get('/admin/red-flags/stats', protect, admin, getAllRedFlagCompanyStats)

export default router
