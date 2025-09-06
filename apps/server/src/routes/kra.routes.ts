import { Router } from 'express';
import {
  getPanStatus,
  downloadPan,
  registerKyc,
  getKraAuditLog
} from '../controllers/kra.controller';

const router = Router();

/**
 * KRA (KYC Registration Agency) Routes
 * 
 * These routes provide integration with SEBI's KRA system through Digio's API
 * for KYC compliance in the securities market.
 * 
 * All endpoints use POST method as per Digio API requirements.
 */

// POST /api/kra/pan-status
// Check KYC status for a given PAN number using Digio API format
router.post('/pan-status', getPanStatus);

// POST /api/kra/download-pan
// Download KYC document for a given PAN number using Digio API format
router.post('/download-pan', downloadPan);

// POST /api/kra/register
// Register/Update KYC details with KRA using Digio API format
router.post('/register', registerKyc);

// GET /api/kra/audit-log
// Get audit log for KRA operations (admin only)
// Query parameters: page, limit, action, pan
router.get('/audit-log', getKraAuditLog);

export default router;
