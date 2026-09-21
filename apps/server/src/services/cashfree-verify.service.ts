import axios from "axios";
import {
  getVerificationBaseUrl,
  getVerificationHeaders,
} from "./cashfree-config";

export const normalizePanResponse = (data: any = {}) => ({
  referenceId: data.reference_id ?? data.referenceId,
  valid: data.valid ?? false,
  status:
    data.valid === true
      ? "VALID"
      : data.valid === false
        ? "INVALID"
        : "PENDING",
  registeredName: data.registered_name,
  nameProvided: data.name_provided,
  nameMatchScore: data.name_match_score,
  nameMatchResult: data.name_match_result,
  message: data.message,
  fatherName: data.father_name,
  panHolderType: data.type,
  raw: data,
});

export const verifyPanRequest = async (pan: string, name: string) => {
  const payload = { pan: pan.trim().toUpperCase(), name: name.trim() };
  const url = `${getVerificationBaseUrl()}/pan`;
  const headers = getVerificationHeaders();
  try {
    const response = await axios.post(url, payload, { headers });
    return normalizePanResponse(response?.data);
  } catch (error) {
    console.error("Error verifying PAN:", error);
    throw error;
  }
};

export const getPanVerificationStatusRequest = async (referenceId: string) => {
  const url = `${getVerificationBaseUrl()}/pan/${referenceId}`;
  const headers = getVerificationHeaders();
  const response = await axios.get(url, { headers });
  return normalizePanResponse(response?.data);
};
