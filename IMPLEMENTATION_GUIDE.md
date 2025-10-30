# Implementation Guide: Settings & Recommendations Enhancement

## Overview

This guide documents the major changes made to the settings and recommendations system. The implementation separates Google Sheets URLs for admin recommendations and live dashboard data, adds a recommendations database table for extended fields, and provides a complete UI for managing PDF documents, videos, and updates.

---

## 1. Database Migrations

### Migration 001: Update Settings Table to JSONB

**File:** `migrations/001_update_settings_table.sql`

**Changes:**
- Converted settings table from key-value pairs to a single JSONB object
- Added `singleton` pattern to ensure only one settings row exists
- Migrated existing contact email data

**Schema:**
```sql
CREATE TABLE public.settings (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT singleton_check CHECK (singleton = TRUE)
);
```

**Default Settings:**
```json
{
  "contact_recipient_email": "connect@bastionresearch.in",
  "site_name": "Admin Dashboard",
  "maintenance_mode": false,
  "allow_user_registrations": true,
  "recommendation_sheet_url": "https://docs.google.com/spreadsheets/d/.../edit?gid=0#gid=0",
  "live_recommendation_sheet_url": "https://docs.google.com/spreadsheets/d/.../edit?gid=1899227714#gid=1899227714"
}
```

**How to Run:**
```bash
# Connect to your PostgreSQL database
psql -h <host> -U <user> -d <database> -f migrations/001_update_settings_table.sql
```

---

### Migration 002: Create Recommendations Table

**File:** `migrations/002_create_recommendations_table.sql`

**Changes:**
- Created new recommendations table with extended fields
- Added JSONB validation for quarterly_update and announcements_and_update arrays
- Created indexes on nse_symbol and company_name

**Schema:**
```sql
CREATE TABLE public.recommendations (
  id SERIAL PRIMARY KEY,
  nse_symbol VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  business_note TEXT,              -- PDF URL
  quick_bite TEXT,                 -- PDF URL
  video TEXT,                      -- Video URL
  exit_rationale TEXT,             -- PDF URL
  quarterly_update JSONB DEFAULT '[]'::jsonb,
  announcements_and_update JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**JSONB Structure:**
```json
{
  "quarterly_update": [
    {
      "date": "2024-01-15",
      "title": "Q1 2024 Update",
      "description": "Company delivered strong Q1 results...",
      "pdf_url": "https://storage.example.com/q1-2024.pdf"
    }
  ],
  "announcements_and_update": [
    {
      "date": "2024-02-20",
      "title": "New Product Launch",
      "description": "Company announced new product line...",
      "pdf_url": "https://storage.example.com/announcement.pdf"
    }
  ]
}
```

**How to Run:**
```bash
psql -h <host> -U <user> -d <database> -f migrations/002_create_recommendations_table.sql
```

---

## 2. Backend Changes

### Settings Controller Updates

**File:** `apps/server/src/controllers/settings.controller.ts`

**Changes:**
- Already supports JSONB structure
- Added `recommendation_sheet_url` and `live_recommendation_sheet_url` fields
- Public endpoint exposes these URLs for frontend consumption

**New Public Endpoint:**
- `GET /api/settings` - Returns public settings including sheet URLs

**Admin Endpoints:**
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings` - Update settings

---

### Recommendations Controller Updates

**File:** `apps/server/src/controllers/recommendations.controller.ts`

**New Functions:**
1. `getRecommendationBySymbol(req, res)` - Get recommendation by NSE symbol
2. `upsertRecommendationBySymbol(req, res)` - Create or update recommendation by symbol

**Updated Functions:**
- `createRecommendation` - Now requires `nse_symbol` and `company_name`
- `updateRecommendation` - Supports all new fields

**Example Request:**
```typescript
// Upsert recommendation
PUT /api/recommendations/symbol/RELIANCE
{
  "nse_symbol": "RELIANCE",
  "company_name": "Reliance Industries",
  "business_note": "https://storage.example.com/reliance-note.pdf",
  "quick_bite": "https://storage.example.com/reliance-quickbite.pdf",
  "video": "https://youtube.com/watch?v=...",
  "exit_rationale": "https://storage.example.com/exit.pdf",
  "quarterly_update": [
    {
      "date": "2024-01-15",
      "title": "Q4 FY24 Results",
      "description": "Strong performance...",
      "pdf_url": "https://storage.example.com/q4.pdf"
    }
  ],
  "announcements_and_update": []
}
```

---

### Routes Updates

**File:** `apps/server/src/routes/recommendation.routes.ts`

**New Routes:**
```typescript
// Public routes
GET  /api/recommendations                     // Get all recommendations
GET  /api/recommendations/symbol/:symbol      // Get by NSE symbol

// Admin routes (protected)
POST /api/recommendations                     // Create new
PUT  /api/recommendations/:id                 // Update by ID
PUT  /api/recommendations/symbol/:symbol      // Upsert by symbol
DELETE /api/recommendations/:id               // Delete
```

**File:** `apps/server/src/routes/settings.routes.ts` (NEW)

```typescript
// Public routes
GET /api/settings                             // Get public settings
```

---

## 3. Frontend Changes

### Settings Page Updates

**File:** `apps/web/src/pages/Admin/Settings/index.tsx`

**Changes:**
- Already includes fields for both spreadsheet URLs
- Saves to JSONB backend structure

**UI Fields:**
1. Site Name
2. Contact Form Recipient Email
3. **Recommendations Sheet URL (Admin)** - For admin recommendations list
4. **Live Recommendations Sheet URL (Dashboard)** - For dashboard live data
5. Maintenance Mode toggle
6. Allow User Registrations toggle

---

### Recommendations Library Updates

**File:** `apps/web/src/lib/recommendations.ts`

**Changes:**
1. Added `getSheetUrl(type)` async function that fetches URLs from settings API
2. Updated `fetchRecommendationsFromSheet()` to support type parameter
3. Added caching for settings to reduce API calls

**Usage:**
```typescript
// Fetch recommendations for admin page
const recommendations = await fetchRecommendationsFromSheet('recommendations');

// Fetch live recommendations for dashboard
const liveRecommendations = await fetchRecommendationsFromSheet('live');

// Fetch with custom URL
const customRecommendations = await fetchRecommendationsFromSheet('https://...');
```

---

### RecommendationManagement Page Updates

**File:** `apps/web/src/pages/Admin/Content/RecommendationManagement.tsx`

**Major Changes:**

1. **Data Loading:**
   - Fetches data from Google Sheets
   - Fetches extended data from database
   - Merges both data sources by NSE symbol

2. **New Interface:**
```typescript
export interface ExtendedRecommendation extends RecommendationRecord {
  id?: number;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
}
```

3. **Features:**
   - Read-only sheet data columns
   - "Edit" action button for each row
   - Opens modal for editing extended fields
   - Automatic refresh after saving

---

### EditRecommendationModal Component Updates

**File:** `apps/web/src/components/core/common/Modals/EditRecommendationModal.tsx`

**Major Enhancements:**

1. **PDF Upload Integration:**
   - Upload buttons for all PDF fields (business_note, quick_bite, exit_rationale)
   - Uses existing `/api/files/upload` endpoint
   - Real-time upload status indicators
   - Auto-populates URL after successful upload

2. **UI Sections:**
   - **Sheet Data (Read-Only):** Displays company, symbol, action, return
   - **PDF Documents:** Upload or paste URLs for business note, quick bite, exit rationale
   - **Video URL:** Input field for video link
   - **Updates & Announcements:** JSON editors with validation

3. **File Upload Flow:**
```typescript
const handleFileUpload = async (fieldName: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(
    "/api/files/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  setValue(fieldName, response.data.url);
  toast.success("File uploaded successfully");
};
```

4. **JSON Validation:**
   - Validates quarterly_update and announcements_and_update arrays
   - Shows user-friendly error messages
   - Formatted JSON display with proper indentation

---

## 4. API Endpoints Summary

### Public Endpoints

```
GET  /api/settings                           # Get public settings (sheet URLs)
GET  /api/recommendations                    # Get all recommendations
GET  /api/recommendations/symbol/:symbol     # Get recommendation by NSE symbol
```

### Admin Endpoints (Requires Authentication)

```
# Settings
GET  /api/admin/settings                     # Get all settings
PUT  /api/admin/settings                     # Update settings
GET  /api/admin/settings/contact-email       # Get contact email
PUT  /api/admin/settings/contact-email       # Update contact email

# Recommendations
POST   /api/recommendations                  # Create recommendation
PUT    /api/recommendations/:id              # Update by ID
PUT    /api/recommendations/symbol/:symbol   # Upsert by symbol
DELETE /api/recommendations/:id              # Delete recommendation
```

### File Upload

```
POST /api/files/upload                       # Upload PDF (multipart/form-data)
```

---

## 5. Step-by-Step Implementation

### Step 1: Run Database Migrations

```bash
# 1. Backup your current database
pg_dump -h <host> -U <user> -d <database> > backup.sql

# 2. Run migration 001 (settings table)
psql -h <host> -U <user> -d <database> -f migrations/001_update_settings_table.sql

# 3. Run migration 002 (recommendations table)
psql -h <host> -U <user> -d <database> -f migrations/002_create_recommendations_table.sql

# 4. Verify tables
psql -h <host> -U <user> -d <database> -c "\d settings"
psql -h <host> -U <user> -d <database> -c "\d recommendations"
```

### Step 2: Update Backend Dependencies

No new dependencies required. All changes use existing packages.

### Step 3: Restart Backend Server

```bash
cd apps/server
npm run dev
```

### Step 4: Update Frontend Dependencies

No new dependencies required. All changes use existing packages.

### Step 5: Restart Frontend Server

```bash
cd apps/web
npm run dev
```

### Step 6: Configure Settings

1. Navigate to Admin → Settings
2. Update the two spreadsheet URLs:
   - **Recommendations Sheet URL:** For admin panel recommendations list
   - **Live Recommendations Sheet URL:** For dashboard live data
3. Click "Save Settings"

### Step 7: Test Recommendations

1. Navigate to Admin → Content → Recommendations
2. Click "Refresh" to load data from sheet
3. Click "Edit" on any recommendation
4. Upload PDFs and add updates
5. Save and verify data persists

---

## 6. Environment Variables

### Required (No Changes)

```env
# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=public
MAX_DOC_FILE_SIZE=20971520

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3002
```

### Optional (Backward Compatible)

```env
# These are now optional and can be set via Settings UI
VITE_RECO_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit?gid=0#gid=0
VITE_LIVE_RECO_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit?gid=1899227714#gid=1899227714
```

---

## 7. Data Flow Diagrams

### Settings Flow

```
User Action                 Frontend                Backend                 Database
-----------                 --------                -------                 --------
Visit Settings    →    Load Settings     →    GET /api/admin/settings  →  SELECT * FROM settings
Page                   Display Form          Return JSONB data            WHERE singleton = true

Update Settings   →    Form Submit      →    PUT /api/admin/settings  →  UPDATE settings
                       Send JSON              Merge with existing          SET data = merged_data
                                             Return updated data           WHERE singleton = true
```

### Recommendations Flow

```
User Action                 Frontend                      Backend                     Database
-----------                 --------                      -------                     --------
Load Recommendations  →  Fetch Settings          →   GET /api/settings         →   SELECT data FROM settings
                         Get Sheet URL

                         Fetch Sheet Data        →   Google Sheets GViz API
                         Parse rows

                         Fetch DB Data           →   GET /api/recommendations  →   SELECT * FROM recommendations

                         Merge by nse_symbol
                         Display in table

Edit Recommendation   →  Open modal
                         Fill form with data

Upload PDF            →  Select file             →   POST /api/files/upload    →   Supabase Storage
                         FormData                    Validate PDF                  Upload to 'docs/' bucket
                                                     Upload to storage             Return public URL
                         Set URL in form             Return URL

Save Changes          →  Submit form             →   PUT /api/recommendations/  →  INSERT ... ON CONFLICT
                         Validate JSON               symbol/:symbol                (nse_symbol)
                         Send data                   Parse & validate              DO UPDATE SET ...
                                                     Upsert record                 RETURNING *

                         Reload data
                         Close modal
```

---

## 8. Troubleshooting

### Issue: Settings table doesn't exist

**Solution:**
```bash
# Run migration 001
psql -h <host> -U <user> -d <database> -f migrations/001_update_settings_table.sql
```

### Issue: Recommendations table doesn't exist

**Solution:**
```bash
# Run migration 002
psql -h <host> -U <user> -d <database> -f migrations/002_create_recommendations_table.sql
```

### Issue: PDF upload fails

**Check:**
1. Supabase storage bucket exists and is public
2. `MAX_DOC_FILE_SIZE` environment variable is set
3. File is actually a PDF (checked by mimetype)
4. Supabase credentials are correct

### Issue: Sheet URLs not loading

**Check:**
1. Settings have been saved via admin panel
2. Public settings endpoint is accessible: `GET /api/settings`
3. Fallback URLs in code are correct

### Issue: Cannot save recommendation

**Check:**
1. User is authenticated as admin
2. NSE symbol is unique in database
3. JSON fields are valid JSON arrays
4. All required fields are provided

---

## 9. Security Considerations

1. **Authentication:**
   - All admin endpoints protected by `protect` and `admin` middleware
   - Public endpoints only expose non-sensitive data

2. **File Upload:**
   - Only PDF files allowed
   - 20MB file size limit
   - Files stored in Supabase Storage with unique UUIDs
   - Public URLs generated for uploaded files

3. **Input Validation:**
   - Zod schema validation on forms
   - JSON validation for JSONB fields
   - SQL injection prevention via parameterized queries

4. **CORS:**
   - Configured to only allow requests from frontend URL
   - Credentials enabled for auth cookies

---

## 10. Future Enhancements

1. **Bulk Upload:**
   - Upload multiple PDFs at once
   - CSV import for recommendations

2. **Rich Text Editor:**
   - Replace JSON textareas with rich text editor
   - Visual builder for updates and announcements

3. **Version History:**
   - Track changes to recommendations
   - Ability to revert to previous versions

4. **Notifications:**
   - Email notifications when new updates added
   - Admin dashboard for pending updates

5. **Analytics:**
   - Track which recommendations are most viewed
   - Download statistics for PDFs

---

## 11. Support & Maintenance

### Regular Tasks

1. **Database Backups:**
   ```bash
   pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d).sql
   ```

2. **Monitor Storage:**
   - Check Supabase storage usage
   - Clean up old/unused PDFs

3. **Update Google Sheets:**
   - Ensure sheet URLs in settings are always valid
   - Test sheet data fetch regularly

### Logs to Monitor

1. Backend logs for file upload errors
2. Frontend console for sheet fetch errors
3. Database logs for constraint violations

---

## Summary

This implementation successfully:
- ✅ Separated Google Sheets URLs for admin and live data
- ✅ Created comprehensive recommendations database table
- ✅ Added PDF upload functionality with UI
- ✅ Implemented JSONB fields for quarterly updates and announcements
- ✅ Maintained backward compatibility with environment variables
- ✅ Preserved existing functionality while adding new features
- ✅ Followed existing code patterns and conventions

All changes are production-ready and have been carefully designed to avoid breaking existing functionality.
