import { Router } from "express";
import {
  createZohoContactHandler,
  createInvoiceFromPaymentHandler,
} from "../controllers/zoho-books.controller";
import optionalAuth from "../middleware/optionalAuth.middleware";

const router = Router();

router.post("/zoho/contacts", optionalAuth, createZohoContactHandler);
router.post(
  "/zoho/invoices/from-payment",
  optionalAuth,
  createInvoiceFromPaymentHandler
);

export default router;

