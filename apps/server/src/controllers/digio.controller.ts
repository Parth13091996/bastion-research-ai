import { Request, Response } from 'express'
import axios from 'axios'
import FormData from 'form-data'
import { supabase } from '../config/supabase'

const DIGIO_BASE_URL = process.env.DIGIO_BASE_URL || 'https://ext.digio.in:444'
const DIGIO_UPLOAD_PATH = '/v2/client/document/upload'
const DIGIO_CLIENT_ID = process.env.DIGIO_CLIENT_ID
const DIGIO_CLIENT_SECRET = process.env.DIGIO_CLIENT_SECRET

const getAuthHeader = () => {
  if (!DIGIO_CLIENT_ID || !DIGIO_CLIENT_SECRET) {
    throw new Error('Digio credentials are not configured')
  }
  const token = Buffer.from(`${DIGIO_CLIENT_ID}:${DIGIO_CLIENT_SECRET}`).toString('base64')
  return { Authorization: `Basic ${token}` }
}

// POST /api/digio/esign/upload
// form-data: file (pdf), identifier (email or phone), optional: name
export const initiateSignature = async (req: Request, res: Response) => {
  try {

    // Support either multer.single or upload.any()
    const anyReq = req as any
    const file: Express.Multer.File | undefined = anyReq.file || (Array.isArray(anyReq.files) ? anyReq.files.find((f: any) => f.fieldname === 'file' || f.fieldname === 'pdf') : undefined)
    const { identifier, name, include_authentication_url } = req.body

    if (!file) return res.status(400).json({ message: 'file (pdf) is required. Use form-data with key "file" or "pdf".' })
    if (!identifier)
      return res.status(400).json({ message: 'identifier (email or mobile) is required' })

    const form = new FormData()
    // Send as application/pdf; filename must end with .pdf
    form.append('file', file.buffer, {
      filename: file.originalname.endsWith('.pdf') ? file.originalname : `${file.originalname}.pdf`,
      contentType: 'application/pdf',
    })
    form.append('identifier', identifier)
    if (name) form.append('name', name)
    // Important: include the authentication url to redirect user
    form.append('include_authentication_url', String(include_authentication_url ?? 'true'))

    const headers = { ...form.getHeaders(), ...getAuthHeader(), Accept: 'application/json' }

    // Use exact endpoint with space encoded: "upload pdf"
    const url = `${DIGIO_BASE_URL}${DIGIO_UPLOAD_PATH}`
    let data
    try {
      // First attempt with field name 'file'
      const resp = await axios.post(url, form, { headers })
      data = resp.data
    } catch (err: any) {
      const code = err?.response?.data?.code || ''
      const message = (err?.response?.data?.message || '').toString().toLowerCase()
      // Retry once using field name 'pdf' if media type was rejected
      if (message.includes('unsupported media type') || code === 'UNSUPPORTED_MEDIA_TYPE') {
        const retryForm = new FormData()
        retryForm.append('pdf', file.buffer, {
          filename: file.originalname.endsWith('.pdf') ? file.originalname : `${file.originalname}.pdf`,
          contentType: 'application/pdf',
        })
        retryForm.append('identifier', identifier)
        if (name) retryForm.append('name', name)
        retryForm.append(
          'include_authentication_url',
          String(include_authentication_url ?? 'true')
        )
        const retryHeaders = { ...retryForm.getHeaders(), ...getAuthHeader(), Accept: 'application/json' }
        try {
          const resp2 = await axios.post(url, retryForm, { headers: retryHeaders })
          data = resp2.data
        } catch (err2: any) {
          // Final fallback: try alternate endpoint '/upload'
          const altUrl = `${DIGIO_BASE_URL}/v2/client/document/upload`
          const resp3 = await axios.post(altUrl, retryForm, { headers: retryHeaders })
          data = resp3.data
        }
      } else {
        // If not unsupported-media-type, try alternate endpoint '/upload' once
        const altUrl = `${DIGIO_BASE_URL}/v2/client/document/upload`
        const respAlt = await axios.post(altUrl, form, { headers })
        data = respAlt.data
      }
    }

    // Persist minimal mapping: user identifier -> digio document id using Supabase
    try {
      const document_id = data?.id || data?.document_id
      const status = 'created'
      const raw_response = data ? JSON.stringify(data) : null

      // Insert into digio_documents table
      const { error } = await supabase
        .from('digio_documents')
        .insert([
          {
            identifier,
            document_id,
            status,
            raw_response,
          },
        ])

      // Ignore error if table not present or insert fails
    } catch (e) {
      // best effort; ignore failures if table not present
    }

    return res.status(201).json({ message: 'Digio request created', data })
  } catch (error: any) {
    const status = error?.response?.status || 500
    const payload = error?.response?.data || { message: 'Failed to initiate signature', detail: error?.message }
    return res.status(status).json(payload)
  }
}

// NEW JSON ENDPOINT - POST /api/digio/esign/uploadjson

export const initiateSignatureJSON = async (req: Request, res: Response) => {
  console.log("=== INITIATE SIGNATURE STARTED (JSON) ===");
  console.log("Request body keys:", Object.keys(req.body));
  console.log("Request body values:", req.body);
  console.log("Request files:", req.files);

  try {
    // Accept file upload (via multer) or base64 string
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
      console.log(
        "Converted uploaded file to raw base64, length:",
        file_data.length
      );
    }

    if (!file_data) {
      return res
        .status(400)
        .json({ message: "file_data (base64 PDF) or file upload is required" });
    }

    // Digio API expects a raw base64 string.
    // We'll be lenient and strip the data URL prefix if the client sends it.
    const base64Prefix = "data:application/pdf;base64,";
    if (file_data.startsWith(base64Prefix)) {
      file_data = file_data.substring(base64Prefix.length);
      console.log("Stripped data URL prefix from file_data.");
    }

    // Basic validation for base64
    if (typeof file_data !== "string" || file_data.length < 10) {
      return res.status(400).json({
        message: "file_data appears to be invalid or empty.",
      });
    }

    // Parse signers from string to array if needed
    let signersArray = req.body.signers;
    if (typeof signersArray === "string") {
      try {
        signersArray = JSON.parse(signersArray);
      } catch (parseError) {
        console.error("Failed to parse signers:", parseError);
        signersArray = [];
      }
    }

    // Prepare the JSON payload according to Digio API specification
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

    console.log("Formatted JSON payload:", {
      ...jsonPayload,
      file_data: `${jsonPayload.file_data.substring(0, 100)}...`, // Truncate for logging
    });

    // Make the JSON request to Digio API
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

    console.log("JSON request completed successfully");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    const data = response.data;

    // Save to database
    try {
      const document_id = data?.id || data?.document_id;
      const doc_status = "created";
      const raw_response = JSON.stringify(data);
      const identifier = signersArray?.[0]?.identifier || "unknown";

      if (document_id && identifier) {
        await supabase
          .from("digio_documents")
          .insert([
            { identifier, document_id, status: doc_status, raw_response },
          ]);
        console.log("Saved to database:", { identifier, document_id });
      }
    } catch (dbError) {
      console.log("Database save failed (non-critical):", dbError);
    }

    return res.status(201).json({
      success: true,
      message: "Document uploaded for signature successfully (JSON)",
      data: data,
    });
  } catch (error: any) {
    console.error("=== JSON ENDPOINT ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (error.response) {
      // Axios error with response
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );

      return res.status(error.response.status).json({
        success: false,
        message: "Digio API error (JSON endpoint)",
        error: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response
      console.error("No response received");
      return res.status(500).json({
        success: false,
        message: "No response from Digio API (JSON endpoint)",
        error: "Network error",
      });
    } else {
      // Other error
      console.error("Setup error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error (JSON endpoint)",
        error: error.message,
      });
    }
  }
};


// GET /api/digio/esign/:documentId
export const getDocumentDetails = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params
    const url = `${DIGIO_BASE_URL}/v2/client/document/${documentId}`
    const { data } = await axios.get(url, { headers: getAuthHeader() })
    return res.status(200).json(data)
  } catch (error: any) {
    const status = error?.response?.status || 500
    const payload = error?.response?.data || { message: 'Failed to fetch document details' }
    return res.status(status).json(payload)
  }
}

// GET /api/digio/esign/:documentId/download
export const downloadSignedDocument = async (req: Request, res: Response) => {
  try {
    const documentId = (req.params as any).documentId || (req.query as any).document_id
    if (!documentId) {
      return res.status(400).json({ message: 'document_id is required' })
    }
    const url = `${DIGIO_BASE_URL}/v2/client/document/download?document_id=${encodeURIComponent(documentId)}`
    const response = await axios.get(url, { headers: getAuthHeader(), responseType: 'arraybuffer' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${documentId}.pdf"`)
    return res.status(200).send(Buffer.from(response.data))
  } catch (error: any) {
    const status = error?.response?.status || 500
    const payload = error?.response?.data || { message: 'Failed to download document' }
    return res.status(status).json(payload)
  }
}

// POST /api/digio/esign/:documentId/cancel
export const cancelSignatureRequest = async (req: Request, res: Response) => {
  try {
    const documentId = (req.params as any).documentId || (req.query as any).document_id
    if (!documentId) {
      return res.status(400).json({ message: 'document_id is required' })
    }
    const url = `${DIGIO_BASE_URL}/v2/client/document/${documentId}/cancel`
    const { data } = await axios.post(url,null, { headers: getAuthHeader() })
    return res.status(200).json(data)
  } catch (error: any) {
    const status = error?.response?.status || 500
    const payload = error?.response?.data || { message: 'Failed to cancel request' }
    return res.status(status).json(payload)
  }
}

// POST /api/digio/webhook
export const digioWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body
    // Basic upsert of status if table exists using Supabase
    try {
      const documentId = event?.document_id || event?.id
      const statusVal = event?.status || event?.event
      const raw_response = event ? JSON.stringify(event) : null

      await supabase
        .from('digio_documents')
        .upsert(
          [
            {
              identifier: 'unknown',
              document_id: documentId,
              status: statusVal,
              raw_response,
            },
          ],
          //@ts-ignore
          { onConflict: ['document_id'] }
        )
      // Ignore error if table not present or upsert fails
    } catch {}
    return res.status(200).json({ received: true })
  } catch (error) {
    return res.status(200).json({ received: true })
  }
}
