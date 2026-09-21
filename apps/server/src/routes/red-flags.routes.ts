import { Router } from 'express'
import { protect, requireSectionEdit, staff } from '../middleware/auth.middleware'
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
router.get('/admin/red-flags/companies', protect, staff, listRedFlagCompanies)
router.post(
  '/admin/red-flags/companies',
  protect,
  staff,
  requireSectionEdit('content_red_flag_analytics'),
  createRedFlagCompany
)
router.delete(
  '/admin/red-flags/companies/:id',
  protect,
  staff,
  requireSectionEdit('content_red_flag_analytics'),
  deleteRedFlagCompany
)
router.patch(
  '/admin/red-flags/companies/:id',
  protect,
  staff,
  requireSectionEdit('content_red_flag_analytics'),
  updateRedFlagCompany
)
router.delete(
  '/admin/red-flags/stats/:id',
  protect,
  staff,
  requireSectionEdit('content_red_flag_analytics'),
  clearRedFlagSubmissions
)
router.get('/admin/red-flags/stats', protect, staff, getAllRedFlagCompanyStats)

export default router
