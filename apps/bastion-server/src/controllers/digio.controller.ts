import { Request, Response } from 'express'
import axios from 'axios'
import FormData from 'form-data'
import { supabase } from '../config/supabase'

const DIGIO_BASE_URL = process.env.DIGIO_BASE_URL || 'https://ext.digio.in:444'
const DIGIO_UPLOAD_PATH = '/v2/client/document/upload%20pdf'
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
    const { data } = await axios.get(url, { headers: getAuthHeader() })
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
