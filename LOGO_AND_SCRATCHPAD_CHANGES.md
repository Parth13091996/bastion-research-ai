# Logo Field & Scratch Pad Newsletter Implementation

## Overview

This document covers two major changes:
1. Replaced `nse_symbol` with `logo` field in recommendations
2. Created complete Scratch Pad Newsletter system with CRUD operations

---

## Part 1: Logo Field Implementation

### Database Changes

**Migration File:** `migrations/003_replace_nse_symbol_with_logo.sql`

**What Changed:**
- Renamed `nse_symbol` column to `logo` in recommendations table
- Changed from UNIQUE NOT NULL to TEXT NULL
- Updated unique constraint to use `company_name` instead
- Added index on `company_name` for faster lookups

**SQL Query to Run:**
```sql
-- Run this migration
psql -h <host> -U <user> -d <database> -f migrations/003_replace_nse_symbol_with_logo.sql
```

### Backend Changes

**Files Modified:**
1. `apps/server/src/controllers/recommendations.controller.ts`
   - Renamed `getRecommendationBySymbol` → `getRecommendationByCompany`
   - Renamed `upsertRecommendationBySymbol` → `upsertRecommendationByCompany`
   - Updated all functions to use `logo` and `company_name`

2. `apps/server/src/routes/recommendation.routes.ts`
   - Updated routes to use `/company/:companyName` instead of `/symbol/:symbol`
   - Updated function imports

### Frontend Changes

**Files Modified:**
1. `apps/web/src/pages/Admin/Content/RecommendationManagement.tsx`
   - Updated data merging to match by `company_name`
   - Added `logo` field to interface
   - Updated API endpoint to use company name

2. `apps/web/src/components/core/common/Modals/EditRecommendationModal.tsx`
   - Added `logo` field to schema
   - Added logo upload UI with preview
   - Supports both image URL input and file upload

### API Endpoints Changed

**Before:**
```
GET  /api/recommendations/symbol/:symbol
PUT  /api/recommendations/symbol/:symbol
```

**After:**
```
GET  /api/recommendations/company/:companyName
PUT  /api/recommendations/company/:companyName
```

### Usage Example

**Updating a recommendation with logo:**
```typescript
// Upload logo image
const formData = new FormData();
formData.append('file', logoFile);
const { data } = await axiosInstance.post('/api/files/upload', formData);

// Update recommendation
await axiosInstance.put(
  `/api/recommendations/company/${encodeURIComponent('Reliance Industries')}`,
  {
    company_name: 'Reliance Industries',
    logo: data.url,
    business_note: 'https://...',
    // ... other fields
  }
);
```

---

## Part 2: Scratch Pad Newsletter System

### Database Schema

**Migration File:** `migrations/004_create_scratch_pad_newsletters_table.sql`

**Table Structure:**
```sql
CREATE TABLE public.scratch_pad_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author VARCHAR(255),
  published_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**SQL Query to Run:**
```sql
psql -h <host> -U <user> -d <database> -f migrations/004_create_scratch_pad_newsletters_table.sql
```

**Sample Insert Query:**
```sql
INSERT INTO public.scratch_pad_newsletters (
  title,
  slug,
  description,
  content,
  author,
  published_date,
  is_published,
  tags
) VALUES (
  'Market Update - January 2024',
  'market-update-january-2024',
  'Monthly market analysis and key insights from January 2024',
  '<h2>Market Overview</h2><p>The market showed strong performance...</p>',
  'Bastion Research Team',
  '2024-01-15 10:00:00+00',
  TRUE,
  ARRAY['market-update', 'analysis', 'january-2024']
);
```

### Backend Implementation

**New Files Created:**

1. **`apps/server/src/controllers/scratchpad.controller.ts`**
   - `getScratchPadNewsletters()` - Get all newsletters (with optional published filter)
   - `getScratchPadNewsletterById()` - Get single newsletter by ID
   - `getScratchPadNewsletterBySlug()` - Get single newsletter by slug
   - `createScratchPadNewsletter()` - Create new newsletter (admin)
   - `updateScratchPadNewsletter()` - Update newsletter (admin)
   - `deleteScratchPadNewsletter()` - Delete newsletter (admin)

2. **`apps/server/src/routes/scratchpad.routes.ts`**
   - Public routes for fetching newsletters
   - Protected admin routes for CRUD operations

3. **Updated: `apps/server/src/index.ts`**
   - Added scratchpad routes import and registration

### API Endpoints

**Public Endpoints:**
```
GET  /api/scratch-pad-newsletters                # Get all (with ?published_only=true)
GET  /api/scratch-pad-newsletters/:id            # Get by ID
GET  /api/scratch-pad-newsletters/slug/:slug     # Get by slug
```

**Admin Endpoints (Protected):**
```
POST   /api/admin/scratch-pad-newsletters       # Create new
PUT    /api/admin/scratch-pad-newsletters/:id   # Update existing
DELETE /api/admin/scratch-pad-newsletters/:id   # Delete
```

### API Usage Examples

**1. Get all published newsletters (for user dashboard):**
```typescript
const response = await axiosInstance.get(
  '/api/scratch-pad-newsletters?published_only=true'
);
const newsletters = response.data;
```

**2. Get single newsletter by slug:**
```typescript
const response = await axiosInstance.get(
  '/api/scratch-pad-newsletters/slug/market-update-january-2024'
);
const newsletter = response.data;
```

**3. Create new newsletter (admin):**
```typescript
await axiosInstance.post('/api/admin/scratch-pad-newsletters', {
  title: 'Market Update - February 2024',
  slug: 'market-update-february-2024',
  description: 'Monthly market insights for February',
  content: '<h2>Overview</h2><p>Strong market performance...</p>',
  author: 'Bastion Research Team',
  published_date: new Date().toISOString(),
  is_published: true,
  tags: ['market-update', 'february-2024'],
  featured_image: 'https://storage.example.com/image.jpg'
});
```

**4. Update newsletter (admin):**
```typescript
await axiosInstance.put('/api/admin/scratch-pad-newsletters/{id}', {
  title: 'Updated Title',
  content: '<h2>Updated content...</h2>',
  is_published: true
});
```

**5. Delete newsletter (admin):**
```typescript
await axiosInstance.delete('/api/admin/scratch-pad-newsletters/{id}');
```

### Frontend Implementation (To Do)

The following components need to be created:

**1. Admin UI - Scratch Pad Management**
Location: `apps/web/src/pages/Admin/Content/ScratchPadManagement.tsx`

Similar to Webinars management, this should include:
- List view with all newsletters
- Search and filter functionality
- Create new newsletter form
- Edit newsletter modal
- Delete confirmation
- Rich text editor for content
- Image upload for featured image
- Tags input
- Publish/unpublish toggle
- Preview functionality

**2. User Dashboard - Scratch Pad List**
Location: `apps/web/src/pages/UserAdmin/app/ScratchPadList.tsx`

Similar to newsletters-archive page, this should include:
- Grid/list view of published newsletters
- Featured image display
- Title, description, date
- Author information
- Tags display
- Read more button
- Pagination or infinite scroll
- Search/filter by tags

**3. User Dashboard - Single Scratch Pad View**
Location: `apps/web/src/pages/UserAdmin/app/ScratchPadView.tsx`

Should include:
- Full newsletter content display
- Featured image
- Meta information (author, date, tags)
- Share buttons
- Related newsletters
- Back to list button

### Routing Changes Needed

**Admin Routes (`apps/web/src/routes/index.tsx`):**
```typescript
// Add to admin routes
{
  path: '/admin/content/scratch-pad',
  element: <ScratchPadManagement />
}
```

**User Routes:**
```typescript
// Add to user dashboard routes
{
  path: '/user/app/scratch-pad',
  element: <ScratchPadList />
},
{
  path: '/user/app/scratch-pad/:slug',
  element: <ScratchPadView />
}
```

### Admin Sidebar Update

**File:** `apps/web/src/components/AdminSidebar.tsx`

Add under Content section:
```typescript
{
  label: "Scratch Pad",
  href: "/admin/content/scratch-pad",
  icon: <FileText className="h-4 w-4" />
}
```

### User Dashboard Navigation Update

Update the "Scratch Pad Newsletter" link to redirect to:
```
/user/app/scratch-pad
```

Instead of:
```
/newsletters-archive
```

---

## Testing Checklist

### Logo Field Changes
- [ ] Run migration 003
- [ ] Backend server restarts without errors
- [ ] Can fetch recommendations by company name
- [ ] Can update recommendation with logo URL
- [ ] Logo upload works in admin modal
- [ ] Logo preview displays correctly
- [ ] Frontend displays logos in recommendation cards

### Scratch Pad Newsletters
- [ ] Run migration 004
- [ ] Backend server restarts without errors
- [ ] Can fetch all newsletters via API
- [ ] Can fetch single newsletter by ID and slug
- [ ] Can create newsletter (admin)
- [ ] Can update newsletter (admin)
- [ ] Can delete newsletter (admin)
- [ ] Published filter works correctly
- [ ] Tags array works correctly
- [ ] Timestamps update correctly

---

## Deployment Steps

### Step 1: Run Migrations
```bash
# Run logo migration
psql $DATABASE_URL -f migrations/003_replace_nse_symbol_with_logo.sql

# Run scratch pad migration
psql $DATABASE_URL -f migrations/004_create_scratch_pad_newsletters_table.sql

# Verify tables
psql $DATABASE_URL -c "\d recommendations"
psql $DATABASE_URL -c "\d scratch_pad_newsletters"
```

### Step 2: Restart Backend
```bash
cd apps/server
npm run dev
```

### Step 3: Test API Endpoints
```bash
# Test logo endpoint
curl http://localhost:3002/api/recommendations/company/Reliance%20Industries

# Test scratch pad endpoints
curl http://localhost:3002/api/scratch-pad-newsletters?published_only=true
```

### Step 4: Frontend Development
1. Create admin scratch pad management page
2. Create user scratch pad list page
3. Create user scratch pad view page
4. Update routing
5. Update navigation components

### Step 5: Testing
- Test all CRUD operations
- Test file uploads
- Test published/unpublished filtering
- Test user-facing pages
- Verify no breaking changes

---

## Sample Data Queries

### Insert Multiple Scratch Pad Newsletters

```sql
INSERT INTO public.scratch_pad_newsletters (
  title, slug, description, content, author, published_date, is_published, tags
) VALUES
(
  'Q4 2024 Market Review',
  'q4-2024-market-review',
  'Comprehensive analysis of Q4 2024 market performance and key trends',
  '<h2>Quarter Overview</h2><p>Q4 2024 showed remarkable growth across sectors...</p>',
  'Bastion Research Team',
  '2024-01-10 09:00:00+00',
  TRUE,
  ARRAY['quarterly-review', 'market-analysis', '2024']
),
(
  'Technology Sector Deep Dive',
  'technology-sector-deep-dive',
  'In-depth analysis of the technology sector and emerging opportunities',
  '<h2>Tech Sector Analysis</h2><p>The technology sector continues to lead...</p>',
  'Tech Analysis Team',
  '2024-01-20 10:30:00+00',
  TRUE,
  ARRAY['technology', 'sector-analysis', 'opportunities']
),
(
  'Banking Sector Outlook 2024',
  'banking-sector-outlook-2024',
  'What to expect from banking stocks in 2024',
  '<h2>Banking Sector Trends</h2><p>Banking stocks are positioned for growth...</p>',
  'Banking Analyst',
  '2024-02-01 11:00:00+00',
  TRUE,
  ARRAY['banking', 'outlook', 'financial-services']
);
```

### Query Examples

```sql
-- Get all published newsletters ordered by date
SELECT * FROM scratch_pad_newsletters
WHERE is_published = TRUE
ORDER BY published_date DESC;

-- Get newsletters by tag
SELECT * FROM scratch_pad_newsletters
WHERE 'market-analysis' = ANY(tags)
AND is_published = TRUE;

-- Search newsletters by title or description
SELECT * FROM scratch_pad_newsletters
WHERE (title ILIKE '%market%' OR description ILIKE '%market%')
AND is_published = TRUE;

-- Get newsletter count by author
SELECT author, COUNT(*) as newsletter_count
FROM scratch_pad_newsletters
WHERE is_published = TRUE
GROUP BY author;
```

---

## Summary

### What's Complete:
✅ Logo field migration SQL
✅ Updated backend controllers for logo
✅ Updated backend routes for logo
✅ Updated frontend to use logo field
✅ Scratch pad database table migration
✅ Complete scratch pad backend (controller + routes)
✅ Backend integration in main server

### What Needs Implementation:
❌ Admin UI for scratch pad management
❌ User dashboard scratch pad list page
❌ User dashboard scratch pad view page
❌ Routing updates
❌ Navigation component updates
❌ Rich text editor integration

### API Ready to Use:
- ✅ All scratch pad CRUD endpoints functional
- ✅ Logo upload endpoint functional (existing)
- ✅ Recommendations with logo support ready

---

## Support

For questions or issues:
1. Check migration SQL files for database schema
2. Review controller files for API logic
3. Test endpoints with curl or Postman
4. Check server logs for errors
