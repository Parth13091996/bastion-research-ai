import { Router } from "express";
import {
  getDocumentDetails,
  downloadSignedDocument,
  cancelSignatureRequest,
  digioWebhook,
  initiateSignatureJSON,
  testDigioWebhook,
} from "../controllers/digio.controller";
import optionalAuth from "../middleware/optionalAuth.middleware";

const router = Router();

router.post("/esign/uploadjson", optionalAuth, initiateSignatureJSON);

// Document detail/status
router.get("/esign/:documentId", getDocumentDetails);

// Download signed copy
router.get("/esign/:documentId/download", downloadSignedDocument);

// Cancel signature request
router.post("/esign/:documentId/cancel", cancelSignatureRequest);

// Webhook receiver (configure URL in Digio dashboard)
router.post("/webhook", digioWebhook);
router.get("/webhook", testDigioWebhook);

export default router;
