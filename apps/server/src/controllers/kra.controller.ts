import { Request, Response } from "express";
import axios from "axios";
import { supabase } from "../supabase";
import {
  KraPanStatusRequest,
  KraPanStatusResponse,
  KraDownloadPanRequest,
  KraDownloadPanResponse,
  KraRegistrationRequest,
  KraRegistrationResponse,
  KraCommonRegistrationRequest,
  KraAuditLogResponse
} from "@repo/types";

const DIGIO_BASE_URL = process.env.DIGIO_BASE_URL || "https://ext.digio.in:444";
const DIGIO_CLIENT_ID = process.env.DIGIO_CLIENT_ID;
const DIGIO_CLIENT_SECRET = process.env.DIGIO_CLIENT_SECRET;

// KRA API Endpoints
const KRA_GET_PAN_STATUS = "/v3/client/kyc/kra/v2/get_pan_status";
const KRA_DOWNLOAD_PAN = "/v3/client/kyc/kra/download_pan";
const KRA_REGISTER = "/v3/client/kyc/kra/app/register";

const getAuthHeader = () => {
  if (!DIGIO_CLIENT_ID || !DIGIO_CLIENT_SECRET) {
    throw new Error("Digio credentials are not configured");
  }
  const token = Buffer.from(
    `${DIGIO_CLIENT_ID}:${DIGIO_CLIENT_SECRET}`
  ).toString("base64");
  return { Authorization: `Basic ${token}` };
};


/**
 * POST /api/kra/pan-status
 * Check KYC status for a given PAN number using Digio API format
 */
export const getPanStatus = async (req: Request, res: Response) => {
  try {
    const requestData: KraPanStatusRequest = req.body;

    // Validate required fields (only pan_no and dob are required)
    const requiredFields = ['pan_no', 'dob'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof KraPanStatusRequest]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(requestData.pan_no)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format",
        error: "INVALID_PAN_FORMAT"
      });
    }

    // Validate fetch_type if provided
    if (requestData.fetch_type && !['I', 'B'].includes(requestData.fetch_type as string)) {
      return res.status(400).json({
        success: false,
        message: "fetch_type must be 'I' (Individual) or 'B' (Business)",
        error: "INVALID_FETCH_TYPE"
      });
    }

    const url = `${DIGIO_BASE_URL}${KRA_GET_PAN_STATUS}`;

    const response = await axios.post(url, requestData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      timeout: 30000
    });

    const responseData: KraPanStatusResponse = response.data;

    // Log the request for audit purposes
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "get_pan_status",
          pan: requestData.pan_no,
          request_data: JSON.stringify(requestData),
          response_data: JSON.stringify(responseData),
          status_code: response.status,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA audit (non-critical):", dbError);
    }

    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error("KRA PAN Status Error:", error);

    const status = error?.response?.status || 500;
    const errorData = error?.response?.data || {
      success: false,
      message: "Failed to get PAN status",
      error: error?.message || "INTERNAL_ERROR"
    };

    // Log error for audit
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "get_pan_status",
          pan: req.body.pan_no || "unknown",
          request_data: JSON.stringify(req.body),
          response_data: JSON.stringify(errorData),
          status_code: status,
          error_message: error?.message,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA error audit (non-critical):", dbError);
    }

    return res.status(status).json(errorData);
  }
};

/**
 * POST /api/kra/download-pan
 * Download KYC document for a given PAN number using Digio API format
 */
export const downloadPan = async (req: Request, res: Response) => {
  try {
    const requestData: KraDownloadPanRequest = req.body;

    // Validate required fields (only pan_no and dob are required)
    const requiredFields = ['pan_no', 'dob'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof KraDownloadPanRequest]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(requestData.pan_no)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format",
        error: "INVALID_PAN_FORMAT"
      });
    }

    // Validate fetch_type if provided
    if (requestData.fetch_type && !['I', 'B'].includes(requestData.fetch_type as string)) {
      return res.status(400).json({
        success: false,
        message: "fetch_type must be 'I' (Individual) or 'B' (Business)",
        error: "INVALID_FETCH_TYPE"
      });
    }

    const url = `${DIGIO_BASE_URL}${KRA_DOWNLOAD_PAN}`;

    const response = await axios.post(url, requestData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      timeout: 30000
    });

    const responseData: KraDownloadPanResponse = response.data;

    // Log the request for audit purposes
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "download_pan",
          pan: requestData.pan_no,
          request_data: JSON.stringify(requestData),
          response_data: JSON.stringify({
            ...responseData,
            data: responseData.data ? {
              ...responseData.data,
              kyc_document: responseData.data.kyc_document ? "[BASE64_DOCUMENT]" : undefined
            } : undefined
          }),
          status_code: response.status,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA audit (non-critical):", dbError);
    }

    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error("KRA Download PAN Error:", error);

    const status = error?.response?.status || 500;
    const errorData = error?.response?.data || {
      success: false,
      message: "Failed to download PAN document",
      error: error?.message || "INTERNAL_ERROR"
    };

    // Log error for audit
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "download_pan",
          pan: req.body.pan_no || "unknown",
          request_data: JSON.stringify(req.body),
          response_data: JSON.stringify(errorData),
          status_code: status,
          error_message: error?.message,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA error audit (non-critical):", dbError);
    }

    return res.status(status).json(errorData);
  }
};

/**
 * POST /api/kra/register
 * Register/Update KYC details with KRA using Digio API format
 */
export const registerKyc = async (req: Request, res: Response) => {
  try {
    const registrationData: KraRegistrationRequest = req.body;

    // Validate required fields
    const requiredFields = [
      'common_kra_registration_request', 'unique_request_id', 'api_request_type', 'service_provider', 'kra_providers'
    ];

    const missingFields = requiredFields.filter(field => !registrationData[field as keyof KraRegistrationRequest]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: "MISSING_REQUIRED_FIELDS"
      });
    }

    const commonRequest = registrationData.common_kra_registration_request;
    
    // Validate common request required fields
    const commonRequiredFields = [
      'uid_no', 'pan_no', 'dob_date', 'gender', 'martial_status', 'occupation',
      'mob_no', 'email', 'per_add1', 'per_city', 'per_pincode', 'per_state',
      'per_country', 'per_add_proof', 'pan_copy', 'applicant_name', 'applicant_citizenship',
      'application_type', 'kyc_date', 'kyc_mode', 'kyc_type', 'app_id_proof', 'app_exmt_id_proof'
    ];

    const missingCommonFields = commonRequiredFields.filter(field => !(commonRequest as any)[field]);
    if (missingCommonFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required common fields: ${missingCommonFields.join(', ')}`,
        error: "MISSING_COMMON_FIELDS"
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(commonRequest.pan_no)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format",
        error: "INVALID_PAN_FORMAT"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commonRequest.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: "INVALID_EMAIL_FORMAT"
      });
    }

    // Validate mobile format (Indian mobile)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(commonRequest.mob_no)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
        error: "INVALID_MOBILE_FORMAT"
      });
    }

    // Validate API request type
    if (!['stateless', 'stateful'].includes(registrationData.api_request_type)) {
      return res.status(400).json({
        success: false,
        message: "api_request_type must be 'stateless' or 'stateful'",
        error: "INVALID_API_REQUEST_TYPE"
      });
    }

    // Ensure new KRA requirements are met (PAN cannot be used as POI)
    if (commonRequest.pan_copy === "Y") {
      return res.status(400).json({
        success: false,
        message: "PAN cannot be used as Proof of Identity. Use alternate POI documents.",
        error: "PAN_NOT_ALLOWED_AS_POI"
      });
    }

    if (commonRequest.app_exmt_id_proof === "01") {
      return res.status(400).json({
        success: false,
        message: "PAN (01) is not accepted as POI. Use UID (02) or other valid POI.",
        error: "PAN_POI_NOT_ALLOWED"
      });
    }

    // If using Aadhaar as POI, validate Aadhaar number
    if (commonRequest.app_exmt_id_proof === "02" && commonRequest.uid_no) {
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
      if (!aadhaarRegex.test(commonRequest.uid_no)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Aadhaar number format",
          error: "INVALID_AADHAAR_FORMAT"
        });
      }
    }

    const url = `${DIGIO_BASE_URL}${KRA_REGISTER}`;

    const response = await axios.post(url, registrationData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      timeout: 60000
    });

    const responseData: KraRegistrationResponse = response.data;

    // Log the request for audit purposes
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "register_kyc",
          pan: commonRequest.pan_no,
          request_data: JSON.stringify({
            ...registrationData,
            common_kra_registration_request: {
              ...commonRequest,
              kyc_document: commonRequest.kyc_document ? "[BASE64_DOCUMENT]" : undefined,
              aadhaar_document: commonRequest.aadhaar_document ? "[BASE64_DOCUMENT]" : undefined,
              aadhaar_xml: commonRequest.aadhaar_xml ? "[BASE64_DOCUMENT]" : undefined
            }
          }),
          response_data: JSON.stringify(responseData),
          status_code: response.status,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA audit (non-critical):", dbError);
    }

    return res.status(201).json(responseData);

  } catch (error: any) {
    console.error("KRA Registration Error:", error);

    const status = error?.response?.status || 500;
    const errorData = error?.response?.data || {
      success: false,
      message: "Failed to register KYC",
      error: error?.message || "INTERNAL_ERROR"
    };

    // Log error for audit
    try {
      await supabase.from("kra_audit_log").insert([
        {
          action: "register_kyc",
          pan: req.body.common_kra_registration_request?.pan_no || "unknown",
          request_data: JSON.stringify(req.body),
          response_data: JSON.stringify(errorData),
          status_code: status,
          error_message: error?.message,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      console.log("Failed to log KRA error audit (non-critical):", dbError);
    }

    return res.status(status).json(errorData);
  }
};

/**
 * GET /api/kra/audit-log
 * Get audit log for KRA operations (admin only)
 */
export const getKraAuditLog = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, action, pan } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("kra_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (action) {
      query = query.eq("action", action);
    }

    if (pan) {
      query = query.eq("pan", pan);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error: any) {
    console.error("KRA Audit Log Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit log",
      error: error?.message || "INTERNAL_ERROR"
    });
  }
};
