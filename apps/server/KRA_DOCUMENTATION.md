# KRA (KYC Registration Agency) Integration Documentation

## Overview

This document explains the implementation of SEBI's KRA (KYC Registration Agency) integration in the Bastion Research server. The KRA system enables digitization and centralization of KYC records in the securities industry, allowing customers to complete KYC once and use it across all SEBI-registered intermediaries.

## Why Use KRA?

### 1. **Regulatory Compliance**
- **SEBI Mandate**: All SEBI-registered intermediaries must use standard KYC as per SEBI KRA Regulations, 2011
- **Uniformity**: Ensures consistent KYC criteria across the securities market
- **Legal Requirement**: Mandatory for operating in the Indian securities market

### 2. **Operational Benefits**
- **Single KYC**: Customers complete KYC once, use everywhere
- **Reduced Duplication**: Eliminates repeated KYC processes
- **Centralized Records**: All KYC data stored in one secure location
- **Faster Onboarding**: Quick verification for new customers
- **Audit Trail**: Complete history of KYC activities

### 3. **Customer Experience**
- **Seamless Process**: No need to submit documents repeatedly
- **Faster Account Opening**: Quick verification through KRA
- **Consistent Experience**: Same process across all intermediaries

## KYC Flow and Process

### 1. **Initial KYC Registration**
```
Customer → Intermediary → KRA Database
    ↓           ↓            ↓
Documents → Verification → Storage
```

### 2. **Subsequent Interactions**
```
Customer → New Intermediary → KRA Check → Existing KYC Found
    ↓              ↓              ↓            ↓
Request → PAN Lookup → Status Check → Use Existing Data
```

### 3. **Document Requirements (Updated August 2025)**
- **PAN**: Still required as unique identifier
- **Proof of Identity (POI)**: PAN no longer accepted, must use:
  - Aadhaar (UID) - Recommended
  - Passport
  - Driving License
  - Voter ID
- **Proof of Address (POA)**: 
  - Bank Statement
  - Utility Bill
  - Rent Agreement

## API Endpoints

### 1. **Check PAN Status**
```http
POST /api/kra/pan-status
Content-Type: application/json

{
  "pan_no": "ABCDE1234F",
  "dob": "1990-01-15",
  "fetch_type": "I",
  "unique_request_id": "unique_request_123",
  "service_provider": "NDML",
  "mobile": "9876543210"
}
```

**Purpose**: Check if a PAN is already registered in KRA and get KYC status

**Parameters**:
- `pan_no`: PAN number (required)
- `dob`: Date of birth in YYYY-MM-DD format (required)
- `fetch_type`: "I" for Individual, "B" for Business (required)
- `unique_request_id`: Unique identifier for the request (required)
- `service_provider`: Service provider name (required)
- `mobile`: Mobile number (required)

**Response**:
```json
{
  "success": true,
  "data": {
    "pan_no": "ABCDE1234F",
    "status": "ACTIVE",
    "kyc_status": "VERIFIED",
    "last_updated": "2024-01-15T10:30:00Z",
    "intermediary_name": "Previous Intermediary"
  }
}
```

### 2. **Download KYC Document**
```http
POST /api/kra/download-pan
Content-Type: application/json

{
  "pan_no": "ABCDE1234F",
  "dob": "1990-01-15",
  "fetch_type": "I",
  "unique_request_id": "unique_request_123",
  "service_provider": "NDML",
  "mobile": "9876543210"
}
```

**Purpose**: Download the KYC document for a registered PAN

**Parameters**: Same as PAN Status endpoint

**Response**:
```json
{
  "success": true,
  "data": {
    "pan_no": "ABCDE1234F",
    "kyc_document": "base64_encoded_document",
    "document_type": "PDF",
    "file_name": "kyc_document.pdf"
  }
}
```

### 3. **Register/Update KYC**
```http
POST /api/kra/register
Content-Type: application/json

{
  "common_kra_registration_request": {
    "uid_no": "234567890123",
    "pan_no": "ABCDE1234F",
    "dob_date": "1990-01-15",
    "ipv_date": "2024-01-15",
    "gender": "M",
    "martial_status": "S",
    "occupation": "Software Engineer",
    "mob_no": "9876543210",
    "email": "john@example.com",
    "per_add1": "123 Main Street",
    "per_city": "Mumbai",
    "per_pincode": "400001",
    "per_state": "Maharashtra",
    "per_country": "India",
    "per_add_proof": "02",
    "pan_copy": "N",
    "applicant_name": "John Doe",
    "applicant_citizenship": "Indian",
    "application_type": "I",
    "kyc_date": "2024-01-15",
    "kyc_mode": "Online",
    "kyc_type": "Individual",
    "app_id_proof": "02",
    "app_exmt_id_proof": "02"
  },
  "unique_request_id": "unique_request_123",
  "api_request_type": "stateless",
  "service_provider": "NDML",
  "kra_providers": "NDML"
}
```

**Purpose**: Register new KYC or update existing KYC in KRA

**Key Parameters**:
- `uid_no`: Aadhaar number (12 digits, starting with 2-9)
- `pan_no`: PAN number (required)
- `dob_date`: Date of birth in YYYY-MM-DD format
- `gender`: M/F/T
- `martial_status`: S/M/D/W
- `pan_copy`: Must be "N" (PAN not allowed as POI)
- `app_exmt_id_proof`: Must be "02" (Aadhaar) or other valid POI
- `api_request_type`: "stateless" or "stateful"

**Response**:
```json
{
  "success": true,
  "data": {
    "kyc_id": "KYC123456789",
    "pan_no": "ABCDE1234F",
    "status": "REGISTERED",
    "registration_date": "2024-01-15T10:30:00Z",
    "intermediary_id": "INT123456"
  }
}
```

### 4. **Audit Log**
```http
GET /api/kra/audit-log?page=1&limit=50&action=register_kyc&pan=ABCDE1234F
```

**Purpose**: Get audit trail of all KRA operations (admin only)

## Implementation Details

### File Structure
```
apps/server/src/
├── controllers/
│   └── kra.controller.ts      # KRA API logic
├── routes/
│   └── kra.routes.ts          # Route definitions
└── index.ts                   # Updated with KRA routes

packages/types/src/
└── index.ts                   # KRA TypeScript interfaces
```

### Key Features

1. **Comprehensive Validation**
   - PAN format validation
   - Email format validation
   - Mobile number validation
   - Required field validation
   - New KRA requirements validation

2. **Audit Logging**
   - All KRA operations are logged
   - Request/response data stored
   - Error tracking
   - Admin access to audit logs

3. **Error Handling**
   - Detailed error messages
   - Proper HTTP status codes
   - Graceful failure handling

4. **Security**
   - Basic authentication with Digio
   - Sensitive data masking in logs
   - Input sanitization

## Database Schema

### KRA Audit Log Table
```sql
CREATE TABLE kra_audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL, -- 'get_pan_status', 'download_pan', 'register_kyc'
  pan VARCHAR(10) NOT NULL,
  request_data TEXT,
  response_data TEXT,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

Add these to your `.env` file:
```env
DIGIO_BASE_URL=https://ext.digio.in:444
DIGIO_CLIENT_ID=your_digio_client_id
DIGIO_CLIENT_SECRET=your_digio_client_secret
```

## Usage Examples

### 1. Check if Customer is Already KYC Verified
```javascript
const statusData = {
  pan_no: "ABCDE1234F",
  dob: "1990-01-15",
  fetch_type: "I",
  unique_request_id: "unique_request_123",
  service_provider: "NDML",
  mobile: "9876543210"
};

const response = await fetch('/api/kra/pan-status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(statusData)
});

const data = await response.json();

if (data.success && data.data.kyc_status === 'VERIFIED') {
  // Customer is already KYC verified, proceed with account opening
  console.log('Customer KYC verified by:', data.data.intermediary_name);
} else {
  // Customer needs to complete KYC
  console.log('Customer needs KYC verification');
}
```

### 2. Download KYC Document
```javascript
const downloadData = {
  pan_no: "ABCDE1234F",
  dob: "1990-01-15",
  fetch_type: "I",
  unique_request_id: "unique_request_123",
  service_provider: "NDML",
  mobile: "9876543210"
};

const response = await fetch('/api/kra/download-pan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(downloadData)
});

const result = await response.json();
if (result.success) {
  // Save the base64 document
  const document = result.data.kyc_document;
  console.log('KYC Document downloaded:', result.data.file_name);
}
```

### 3. Register New KYC
```javascript
const kycData = {
  common_kra_registration_request: {
    uid_no: "234567890123",
    pan_no: "ABCDE1234F",
    dob_date: "1990-01-15",
    ipv_date: "2024-01-15",
    gender: "M",
    martial_status: "S",
    occupation: "Software Engineer",
    mob_no: "9876543210",
    email: "john@example.com",
    per_add1: "123 Main Street",
    per_city: "Mumbai",
    per_pincode: "400001",
    per_state: "Maharashtra",
    per_country: "India",
    per_add_proof: "02",
    pan_copy: "N",
    applicant_name: "John Doe",
    applicant_citizenship: "Indian",
    application_type: "I",
    kyc_date: "2024-01-15",
    kyc_mode: "Online",
    kyc_type: "Individual",
    app_id_proof: "02",
    app_exmt_id_proof: "02"
  },
  unique_request_id: "unique_request_123",
  api_request_type: "stateless",
  service_provider: "NDML",
  kra_providers: "NDML"
};

const response = await fetch('/api/kra/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(kycData)
});

const result = await response.json();
console.log('KYC Registration Result:', result);
```

## Important Notes

### 1. **New KRA Requirements (Effective August 01, 2025)**
- PAN cannot be used as Proof of Identity (POI)
- Must use alternate POI documents (Aadhaar recommended)
- Set `pan_copy` and `app_pan_copy` to "N"
- Use `app_exmt_id_proof` as "02" for Aadhaar

### 2. **Document Upload**
- All documents must be base64 encoded
- Supported formats: PDF, JPG, PNG
- Maximum file size: 10MB per document

### 3. **Rate Limiting**
- Digio API has rate limits
- Implement appropriate delays between requests
- Monitor API usage

### 4. **Error Handling**
- Always check response status
- Handle network errors gracefully
- Log errors for debugging

## Testing

### 1. **Test PAN Status**
```bash
curl -X POST "http://localhost:3001/api/kra/pan-status" \
  -H "Content-Type: application/json" \
  -d '{
    "pan_no": "ABCDE1234F",
    "dob": "1990-01-15",
    "fetch_type": "I",
    "unique_request_id": "test123",
    "service_provider": "NDML",
    "mobile": "9876543210"
  }'
```

### 2. **Test Download PAN**
```bash
curl -X POST "http://localhost:3001/api/kra/download-pan" \
  -H "Content-Type: application/json" \
  -d '{
    "pan_no": "ABCDE1234F",
    "dob": "1990-01-15",
    "fetch_type": "I",
    "unique_request_id": "test123",
    "service_provider": "NDML",
    "mobile": "9876543210"
  }'
```

### 3. **Test KYC Registration**
```bash
curl -X POST "http://localhost:3001/api/kra/register" \
  -H "Content-Type: application/json" \
  -d '{
    "common_kra_registration_request": {
      "uid_no": "234567890123",
      "pan_no": "ABCDE1234F",
      "dob_date": "1990-01-15",
      "ipv_date": "2024-01-15",
      "gender": "M",
      "martial_status": "S",
      "occupation": "Software Engineer",
      "mob_no": "9876543210",
      "email": "test@example.com",
      "per_add1": "123 Main Street",
      "per_city": "Mumbai",
      "per_pincode": "400001",
      "per_state": "Maharashtra",
      "per_country": "India",
      "per_add_proof": "02",
      "pan_copy": "N",
      "applicant_name": "Test User",
      "applicant_citizenship": "Indian",
      "application_type": "I",
      "kyc_date": "2024-01-15",
      "kyc_mode": "Online",
      "kyc_type": "Individual",
      "app_id_proof": "02",
      "app_exmt_id_proof": "02"
    },
    "unique_request_id": "test123",
    "api_request_type": "stateless",
    "service_provider": "NDML",
    "kra_providers": "NDML"
  }'
```

## Support and Maintenance

1. **Monitoring**: Check audit logs regularly
2. **Updates**: Stay updated with SEBI/KRA regulation changes
3. **Backup**: Regular backup of audit logs
4. **Security**: Regular security audits of KRA integration

## Conclusion

The KRA integration provides a robust, compliant solution for KYC management in the securities industry. It ensures regulatory compliance while improving customer experience and operational efficiency. The implementation follows SEBI guidelines and includes comprehensive error handling, audit logging, and security measures.
