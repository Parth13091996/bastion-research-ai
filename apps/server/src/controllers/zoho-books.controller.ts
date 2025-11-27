import { Request, Response } from "express";
import {
  createZohoInvoiceForPayment,
  ensureZohoCustomer,
} from "../services/zoho-books.service";

export const createZohoContactHandler = async (req: Request, res: Response) => {
  try {
    const { email, full_name, company_name, phone } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const contact = await ensureZohoCustomer({
      email,
      fullName: full_name || email,
      companyName: company_name,
      phone,
    });

    return res.status(201).json({ contact });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to create Zoho contact",
      error: error?.message,
    };
    return res.status(status).json(payload);
  }
};

export const createInvoiceFromPaymentHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { transaction_id: transactionId } = req.body || {};
    if (!transactionId) {
      return res
        .status(400)
        .json({ message: "transaction_id is required in body" });
    }

    const result = await createZohoInvoiceForPayment(transactionId);

    if (result.skipped) {
      return res.status(200).json({
        message: "Invoice already created for this payment",
        zoho_invoice_id: result.zoho_invoice_id,
      });
    }

    return res.status(201).json({
      message: "Zoho invoice created and linked to payment",
      zoho_invoice_id: result.zoho_invoice_id,
      invoice: result.invoice,
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to create invoice from payment",
      error: error?.message,
    };
    return res.status(status).json(payload);
  }
};
