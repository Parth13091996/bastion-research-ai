import { Router } from 'express'
import { protect, admin } from '../middleware/auth.middleware'
import {
  createRedFlagCompany,
  deleteRedFlagCompany,
  getAllRedFlagCompanyStats,
  getRedFlagCompanyStats,
  listRedFlagCompanies,
  submitRedFlagDecision,
  updateRedFlagCompany,
  clearRedFlagSubmissions,
} from '../controllers/red-flags.controller'

const router = Router()

// Protected (member) routes
router.get('/red-flags/companies', listRedFlagCompanies)
router.post('/red-flags/companies', createRedFlagCompany)
router.post('/red-flags/submissions', submitRedFlagDecision)
router.get('/red-flags/companies/:companyId/stats', getRedFlagCompanyStats)

// Admin routes
router.get('/admin/red-flags/companies', protect, admin, listRedFlagCompanies)
router.post('/admin/red-flags/companies', protect, admin, createRedFlagCompany)
router.delete(
  '/admin/red-flags/companies/:id',
  protect,
  admin,
  deleteRedFlagCompany
)
router.patch(
  '/admin/red-flags/companies/:id',
  protect,
  admin,
  updateRedFlagCompany
)
router.delete(
  '/admin/red-flags/stats/:id',
  protect,
  admin,
  clearRedFlagSubmissions
)
router.get('/admin/red-flags/stats', protect, admin, getAllRedFlagCompanyStats)

export default router
