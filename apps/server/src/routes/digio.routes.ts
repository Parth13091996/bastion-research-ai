import { Router } from 'express'
import multer from 'multer'
import {
  getDocumentDetails,
  downloadSignedDocument,
  cancelSignatureRequest,
  digioWebhook,
  initiateSignatureJSON,
  testDigioWebhook
} from '../controllers/digio.controller'
import optionalAuth from "../middleware/optionalAuth.middleware";

const router = Router()
const DIGIO_DISABLED = process.env.DIGIO_DISABLED === 'true' ? true : false
const upload = multer({ storage: multer.memoryStorage() })

// If disabled, short-circuit all Digio endpoints
if (DIGIO_DISABLED) {
  router.use((req, res) => {
    return res.status(503).json({ message: 'Digio is temporarily disabled' })
  })
} else {
  router.post("/esign/uploadjson", optionalAuth, initiateSignatureJSON);

  // Document detail/status
  router.get('/esign/:documentId', getDocumentDetails)

  // Download signed copy
  router.get('/esign/:documentId/download', downloadSignedDocument)

  // Cancel signature request
  router.post('/esign/:documentId/cancel', cancelSignatureRequest)

  // Webhook receiver (configure URL in Digio dashboard)
  router.post('/webhook', digioWebhook)
  router.get('/webhook', testDigioWebhook)
}

export default router
