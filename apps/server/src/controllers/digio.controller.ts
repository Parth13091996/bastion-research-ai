import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { supabase } from "../supabase";

const DIGIO_BASE_URL = process.env.DIGIO_BASE_URL || "https://ext.digio.in:444";
const DIGIO_CLIENT_ID = process.env.DIGIO_CLIENT_ID;
const DIGIO_CLIENT_SECRET = process.env.DIGIO_CLIENT_SECRET;

const getAuthHeader = () => {
  if (!DIGIO_CLIENT_ID || !DIGIO_CLIENT_SECRET) {
    throw new Error("Digio credentials are not configured");
  }
  const token = Buffer.from(
    `${DIGIO_CLIENT_ID}:${DIGIO_CLIENT_SECRET}`
  ).toString("base64");
  return { Authorization: `Basic ${token}` };
};

export const initiateSignatureJSON = async (req: Request, res: Response) => {
  try {
    let file_data = req.body.file_data;
    const anyReq = req as any;
    const file: Express.Multer.File | undefined =
      anyReq.file ||
      (Array.isArray(anyReq.files)
        ? anyReq.files.find(
            (f: any) => f.fieldname === "file" || f.fieldname === "pdf"
          )
        : undefined);

    if (file) {
      // Convert file buffer to raw base64 string
      file_data = file.buffer.toString("base64");
    }

    if (!file_data) {
      return res
        .status(400)
        .json({ message: "file_data (base64 PDF) or file upload is required" });
    }

    const base64Prefix = "data:application/pdf;base64,";
    if (file_data.startsWith(base64Prefix)) {
      file_data = file_data.substring(base64Prefix.length);
    }

    if (typeof file_data !== "string" || file_data.length < 10) {
      return res.status(400).json({
        message: "file_data appears to be invalid or empty.",
      });
    }

    let signersArray = req.body.signers;
    if (typeof signersArray === "string") {
      try {
        signersArray = JSON.parse(signersArray);
      } catch (parseError) {
        console.error("Failed to parse signers:", parseError);
        signersArray = [];
      }
    }

    const jsonPayload = {
      file_data: file_data,
      file_name:
        req.body.file_name || (file ? file.originalname : "document.pdf"),
      will_self_sign:
        req.body.will_self_sign === "true" ||
        req.body.will_self_sign === true ||
        false,
      expire_in_days: parseInt(req.body.expire_in_days) || 10,
      generate_access_token:
        req.body.generate_access_token === "true" ||
        req.body.generate_access_token === true ||
        false,
      display_on_page: req.body.display_on_page || "first",
      notify_signers:
        req.body.notify_signers === "true" ||
        req.body.notify_signers === true ||
        false,
      send_sign_link:
        req.body.send_sign_link === "true" ||
        req.body.send_sign_link === true ||
        false,
      signers: signersArray || [],
      // Add other optional fields if provided
      ...(req.body.callback && { callback: req.body.callback }),
      ...(req.body.comment && { comment: req.body.comment }),
      ...(req.body.sign_coordinates && {
        sign_coordinates: req.body.sign_coordinates,
      }),
      ...(req.body.customer_notification_mode && {
        customer_notification_mode: req.body.customer_notification_mode,
      }),
      ...(req.body.signature_type && {
        signature_type: req.body.signature_type,
      }),
      ...(req.body.sequential && {
        sequential:
          req.body.sequential === "true" ||
          req.body.sequential === true ||
          false,
      }),
      ...(req.body.include_authentication_url && {
        include_authentication_url:
          req.body.include_authentication_url === "true" ||
          req.body.include_authentication_url === true ||
          false,
      }),
    };

    const response = await axios({
      method: "POST",
      url: `${DIGIO_BASE_URL}/v2/client/document/uploadpdf`,
      data: jsonPayload,
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 60000,
    });

    const data = response.data;

    try {
      const document_id = data?.id || data?.document_id;
      const doc_status = "created";
      const identifier = signersArray?.[0]?.identifier || "unknown";

      const user_id = anyReq?.user && anyReq.user.id ? anyReq.user.id : null;

      if (document_id && identifier) {
        await supabase
          .from("digio_documents")
          .insert([{ document_id, status: doc_status, user_id }])
          .select();
      }
    } catch (dbError) {}

    return res.status(201).json({
      success: true,
      message: "Document uploaded for signature successfully (JSON)",
      data: data,
    });
  } catch (error: any) {
    console.error("Error message:", error.message);
  }
};

export const getDocumentDetails = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const url = `${DIGIO_BASE_URL}/v2/client/document/${documentId}`;
    const { data } = await axios.get(url, { headers: getAuthHeader() });
    return res.status(200).json(data);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to fetch document details",
    };
    return res.status(status).json(payload);
  }
};

export const downloadSignedDocument = async (req: Request, res: Response) => {
  try {
    const documentId =
      (req.params as any).documentId || (req.query as any).document_id;
    if (!documentId) {
      return res.status(400).json({ message: "document_id is required" });
    }
    const url = `${DIGIO_BASE_URL}/v2/client/document/download?document_id=${encodeURIComponent(documentId)}`;
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      responseType: "arraybuffer",
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documentId}.pdf"`
    );
    return res.status(200).send(Buffer.from(response.data));
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to download document",
    };
    return res.status(status).json(payload);
  }
};

export const cancelSignatureRequest = async (req: Request, res: Response) => {
  try {
    const documentId =
      (req.params as any).documentId || (req.query as any).document_id;
    if (!documentId) {
      return res.status(400).json({ message: "document_id is required" });
    }
    const url = `${DIGIO_BASE_URL}/v2/client/document/${documentId}/cancel`;
    const { data } = await axios.post(url, null, { headers: getAuthHeader() });
    return res.status(200).json(data);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to cancel request",
    };
    return res.status(status).json(payload);
  }
};

export const digioWebhook = async (req: Request, res: Response) => {
  try {
    const rawBody = (req as any).rawBody as string | undefined;
    const body = req.body as any;

    // Optional HMAC verification (enable by setting DIGIO_WEBHOOK_SECRET)
    const secret = process.env.DIGIO_WEBHOOK_SECRET;
    const requireSig =
      (process.env.DIGIO_WEBHOOK_REQUIRE_SIGNATURE || "false")
        .toString()
        .toLowerCase() === "true";

    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v])
    ) as Record<string, string | string[]>;

    const signatureHeaderKey = [
      "x-digio-signature",
      "x-digio-signature-v2",
      "x-webhook-signature",
      "x-signature",
      "x-digio-hmac",
    ].find((k) => headers[k] !== undefined);

    const timestampHeaderKey = [
      "x-digio-timestamp",
      "x-webhook-timestamp",
    ].find((k) => headers[k] !== undefined);

    const signatureHeader = signatureHeaderKey
      ? (headers[signatureHeaderKey] as string)
      : undefined;
    const timestampHeader = timestampHeaderKey
      ? (headers[timestampHeaderKey] as string)
      : undefined;

    if (secret) {
      if (!rawBody) {
        return res.status(400).json({ message: "Missing rawBody for HMAC" });
      }
      if (!signatureHeader) {
        if (requireSig) {
          return res
            .status(401)
            .json({ message: "Missing webhook signature header" });
        }
      } else {
        // Try a few common constructions that providers use
        const candidates: string[] = [];
        const h = (data: string, enc: "hex" | "base64") =>
          crypto.createHmac("sha256", secret).update(data).digest(enc);
        candidates.push(h(rawBody, "base64"));
        candidates.push(h(rawBody, "hex"));
        if (timestampHeader) {
          candidates.push(h(`${timestampHeader}${rawBody}`, "base64"));
          candidates.push(h(`${timestampHeader}${rawBody}`, "hex"));
        }
        const matched = candidates.some((c) => {
          try {
            const a = Buffer.from(c);
            const b = Buffer.from(signatureHeader as string);
            if (a.length !== b.length) return false;
            return crypto.timingSafeEqual(a, b);
          } catch {
            return c === signatureHeader;
          }
        });
        if (!matched) {
          if (requireSig) {
            return res
              .status(401)
              .json({ message: "Invalid webhook signature" });
          }
        }
      }
    }

    const event = body;
    console.log(event, "event=====>");

    // Normalize fields from Digio style payloads
    const documentId =
      event?.document_id || event?.id || event?.data?.document_id || null;
    const eventType =
      event?.event || event?.type || event?.status || event?.data?.event;

    // Update digio_documents status if the table exists and a row is present
    try {
      if (documentId) {
        const statusMap: Record<string, string> = {
          "doc.signed": "signed",
          "doc.sign.rejected": "rejected",
          "doc.sign.failed": "failed",
          "esign.v3.sign.failed": "failed",
          "esign.v3.sign.pending": "pending",
        };
        const normalized = statusMap[eventType] || String(eventType || "");

        // Attempt to update existing row by document_id
        await supabase
          .from("digio_documents")
          .update({ status: normalized })
          .eq("document_id", documentId);
      }
    } catch {
      // Table may not exist or update may fail due to schema; ignore safely
    }

    // Always acknowledge quickly (Digio expects 200 within 10s)
    return res.status(200).json({ received: true });
  } catch (error) {
    // Acknowledge to prevent retries storm; log locally
    console.error("Digio webhook handler error:", error);
    return res.status(200).json({ received: true });
  }
};

export const testDigioWebhook = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ message: "Digio Webhook configured successfully!" });
};
