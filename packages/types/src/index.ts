export interface Newsletter {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  created_at: string;
  category?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2?: string | null;
  pan_card_number: string;
  state: string;
  city: string;
  pin_code: string;
  date_of_birth: string; // Or Date, but string is safer for serialization
  company?: string | null;
  password?: string | null; // Null for OAuth users
  role?: "user" | "admin"; // Assuming possible roles
  cameFromOAuth?: boolean;
  created_at?: string;
}

// KRA (KYC Registration Agency) Types - Digio API Format
export interface KraPanStatusRequest {
  pan_no: string;
  dob: string;
  fetch_type?: "I" | "B"; // I for Individual, B for Business
  unique_request_id?: string;
  service_provider?: string;
  mobile?: string;
}

export interface KraPanStatusResponse {
  success: boolean;
  data?: {
    pan_no: string;
    status: string;
    kyc_status: string;
    last_updated: string;
    intermediary_name?: string;
  };
  message?: string;
  error?: string;
}

export interface KraDownloadPanRequest {
  pan_no: string;
  dob: string;
  fetch_type?: "I" | "E";
  unique_request_id?: string;
  service_provider?: string;
  mobile?: string;
}

export interface KraDownloadPanResponse {
  success: boolean;
  data?: {
    pan_no: string;
    kyc_document: string; // Base64 encoded document
    document_type: string;
    file_name: string;
  };
  message?: string;
  error?: string;
}

export interface KraCommonRegistrationRequest {
  uid_no: string;
  pan_no: string;
  dob_date: string;
  ipv_date: string;
  gender: string;
  martial_status: string;
  occupation: string;
  mob_no: string;
  fax_no?: string;
  email: string;
  per_add1: string;
  per_add2?: string;
  per_add3?: string;
  per_city: string;
  per_pincode: string;
  per_state: string;
  per_country: string;
  per_district?: string;
  per_add_proof: string;
  pan_copy: string;
  applicant_name: string;
  father_name?: string;
  applicant_citizenship: string;
  applicant_other_citizen?: string;
  comm_addr1?: string;
  comm_addr2?: string;
  comm_addr3?: string;
  comm_pincode?: string;
  comm_city?: string;
  comm_state?: string;
  comm_country?: string;
  comm_tell_no_off_code?: string;
  comm_tell_no_off?: string;
  comm_tell_no_res_code?: string;
  comm_tell_no_res?: string;
  comm_mobile_no_code?: string;
  comm_addr_type?: string;
  comm_addr_proof?: string;
  comm_ident_no?: string;
  per_ident_no?: string;
  fatca_place_birth?: string;
  fatca_country_birth?: string;
  fatca_tin?: string;
  application_type: string;
  ipv_emp_designation?: string;
  ipv_emp_name?: string;
  ipv_institution_name?: string;
  kyc_date: string;
  doc_esign_form?: string;
  kyc_mode: string;
  kyc_type: string;
  app_upload_type?: string;
  app_amc?: string;
  app_applicant_title?: string;
  app_relationship?: string;
  app_father_title?: string;
  app_mother_title?: string;
  app_ipv_done_by?: string;
  app_mother_name?: string;
  app_maiden_title?: string;
  app_maiden_name?: string;
  app_applicant_status?: string;
  app_id_proof: string;
  app_id_proof_identno?: string;
  app_applicant_kycno?: string;
  app_ipv_institution_code?: string;
  app_applicant_kyc_acc_type?: string;
  app_comm_district?: string;
  app_comm_fax_code?: string;
  app_comm_addr_proof_exp_date?: string;
  app_per_addr_proof_exp_date?: string;
  app_fatca_tax_jurisdiction?: string;
  app_fatca_countryof_jurisdiction?: string;
  app_fatca_addr1?: string;
  app_fatca_addr2?: string;
  app_fatca_addr3?: string;
  app_fatca_pincode?: string;
  app_fatca_city?: string;
  app_fatca_district?: string;
  app_fatca_state?: string;
  app_fatca_rel_person?: string;
  app_rel_per_kycno?: string;
  app_rel_per_title?: string;
  relative_name?: string;
  app_rel_per_type?: string;
  app_rel_per_addr_type?: string;
  app_rel_per_addr_type_exp_date?: string;
  app_rel_per_ident_no?: string;
  app_dob_declaration?: string;
  app_place_declaration?: string;
  app_doc_pan?: string;
  app_doc_addr_proof?: string;
  app_doc_photo?: string;
  app_doc_cancelled_chq?: string;
  app_doc_sign?: string;
  app_doc_per_ver_video?: string;
  app_ipv_emp_code?: string;
  app_ipv_emp_branch?: string;
  app_ipv_institution_name?: string;
  app_kyc_emp_name?: string;
  app_kyc_emp_code?: string;
  app_kyc_emp_branch?: string;
  app_kyc_emp_designation?: string;
  app_kyc_institution_code?: string;
  app_kyc_institution_name?: string;
  kra_info?: string;
  aadhaar_passcode?: string;
  aadhaar_digit?: string;
  app_source_doc?: string;
  app_auth_qc_flag?: string;
  app_ipv_emp_no?: string;
  app_fatca_country_residency1?: string;
  app_fatca_tax_identification_no1?: string;
  app_fatca_tax_exempt_flag1?: string;
  app_fatca_tax_exempt_reason1?: string;
  app_fatca_country_residency2?: string;
  app_fatca_tax_identification_no2?: string;
  app_fatca_tax_exempt_flag2?: string;
  app_fatca_tax_exempt_reason2?: string;
  app_fatca_country_residency3?: string;
  app_fatca_tax_identification_no3?: string;
  app_fatca_tax_exempt_flag3?: string;
  app_fatca_tax_exempt_reason3?: string;
  app_fatca_country_residency4?: string;
  app_fatca_tax_identification_no4?: string;
  app_fatca_tax_exempt_flag4?: string;
  app_fatca_tax_exempt_reason4?: string;
  app_req_type?: string;
  app_communication_address_doc?: string;
  app_ipv_doc_received?: string;
  app_doc_source?: string;
  app_residential_status?: string;
  app_exmt_cat?: string;
  update_flag?: string;
  kra_code?: string;
  pos_code?: string;
  app_no?: string;
  app_exmt?: string;
  app_exmt_id_proof: string;
  ipv_flag?: string;
  reg_no?: string;
  dob_incorp?: string;
  commence_date?: string;
  nationality?: string;
  other_nationality?: string;
  comp_status?: string;
  oth_comp_status?: string;
  res_status_proof?: string;
  off_isd?: string;
  off_std?: string;
  res_isd?: string;
  res_std?: string;
  res_no?: string;
  fax_isd?: string;
  fax_std?: string;
  cor_add_date?: string;
  per_add_flag?: string;
  per_add_date?: string;
  income?: string;
  other_occupation?: string;
  pol_conn?: string;
  doc_proof?: string;
  internal_ref?: string;
  branch_code?: string;
  net_worth?: string;
  net_worth_date?: string;
  incorp_plc?: string;
  other_info?: string;
  acc_open_date?: string;
  acc_active_date?: string;
  acc_update_date?: string;
  vid_no?: string;
  uid_token?: string;
  auth_name?: string;
  auth_email?: string;
  auth_email1?: string;
  auth_email2?: string;
  auth_mobile?: string;
  auth_fpi_consent?: string;
  auth_ubo_consent?: string;
  mobile_flag?: string;
  email_flag?: string;
  otp_ref_no?: string;
  corr_district?: string;
  fatca_applicable?: string;
  app_fatca_date_declaration?: string;
  fatca_additional_details?: Array<{
    app_fatca_entity_pan?: string;
    app_fatca_country_residency?: string;
    app_fatca_tax_identification_number?: string;
    app_fatca_tax_exempt_flag?: string;
    app_fatca_tax_exempt_reason?: string;
  }>;
  kyc_document?: string;
  aadhaar_document?: string;
  aadhaar_xml?: string;
  app_fatca_country?: string;
}

export interface KraRegistrationRequest {
  common_kra_registration_request: KraCommonRegistrationRequest;
  unique_request_id: string;
  api_request_type: "stateless" | "stateful";
  service_provider: string;
  kra_providers: string;
}

export interface KraRegistrationResponse {
  success: boolean;
  data?: {
    kyc_id: string;
    pan_no: string;
    status: string;
    registration_date: string;
    intermediary_id: string;
  };
  message?: string;
  error?: string;
}

export interface KraAuditLog {
  id?: string;
  action: "get_pan_status" | "download_pan" | "register_kyc";
  pan: string;
  request_data: string;
  response_data: string;
  status_code: number;
  error_message?: string;
  created_at: string;
}

export interface KraAuditLogResponse {
  success: boolean;
  data: KraAuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Testimonial {
  id: string;
  title: string;
  text: string;
  name: string;
  position: string;
  created_at: string;
}
