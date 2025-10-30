# Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Run Migrations (2 minutes)
```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Or on Windows:
# set DATABASE_URL=postgresql://user:password@host:port/database

# Run both migrations
psql $DATABASE_URL -f migrations/003_replace_nse_symbol_with_logo.sql
psql $DATABASE_URL -f migrations/004_create_scratch_pad_newsletters_table.sql
```

### Step 2: Restart Servers (1 minute)
```bash
# Backend (Terminal 1)
cd apps/server
npm run dev

# Frontend (Terminal 2)
cd apps/web
npm run dev
```

### Step 3: Test (2 minutes)

**Test Logo Field:**
1. Go to `http://localhost:5173/admin/content/recommendations`
2. Click "Edit" on any recommendation
3. Upload a logo image
4. Save

**Test Scratch Pad (Admin):**
1. Go to `http://localhost:5173/admin/content/scratch-pad`
2. Click "Create Newsletter"
3. Fill in title (slug auto-generates)
4. Add some HTML content:
   ```html
   <h2>Welcome</h2>
   <p>This is my first newsletter!</p>
   ```
5. Toggle "Published" on
6. Click "Save"

**Test Scratch Pad (User):**
1. Go to `http://localhost:5173/user/app/scratch-pad`
2. See your newsletter card
3. Click to view full content

### Step 4: Update Dashboard Link
Find the "Scratch Pad Newsletter" button in your user dashboard and change its link from:
```
/newsletters-archive
```
to:
```
/user/app/scratch-pad
```

---

## 📋 What Was Added?

### 1. Logo Field (Recommendations)
- Replaced NSE symbol with logo URL
- Upload logos via admin panel
- Display logos in recommendation cards

### 2. Scratch Pad Newsletters
- Admin panel to create/edit/delete newsletters
- User-facing list and detail pages
- HTML content support
- Featured images
- Tags system
- Publish/draft status

---

## 🔗 Important URLs

**Admin:**
- Recommendations: `/admin/content/recommendations`
- Scratch Pad: `/admin/content/scratch-pad`

**User:**
- Scratch Pad List: `/user/app/scratch-pad`
- Single Newsletter: `/user/app/scratch-pad/:slug`

**API:**
- Public Settings: `GET /api/settings`
- Recommendations: `GET /api/recommendations`
- Scratch Pad: `GET /api/scratch-pad-newsletters?published_only=true`

---

## 🐛 Troubleshooting

**Migration fails?**
- Check DATABASE_URL is correct
- Ensure you have permissions
- Check if tables already exist

**Server won't start?**
- Check `node_modules` are installed
- Look at terminal error messages
- Ensure ports 3002 (backend) and 5173 (frontend) are free

**Can't see Scratch Pad in sidebar?**
- Hard refresh browser (Ctrl+Shift+R)
- Check AdminSidebar.tsx was updated

**Logo upload fails?**
- Check Supabase storage is configured
- Verify file size is under 20MB
- Ensure file is an image type

---

## 📚 Documentation

- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `LOGO_AND_SCRATCHPAD_CHANGES.md` - Detailed changes
- `IMPLEMENTATION_GUIDE.md` - Original settings guide

---

## ✅ Success Checklist

- [ ] Migrations ran without errors
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Can edit recommendations and add logos
- [ ] Can create scratch pad newsletters in admin
- [ ] Can view scratch pad list as user
- [ ] Can view single newsletter as user
- [ ] Scratch Pad appears in admin sidebar

---

**All done! You're ready to go!** 🎉

For questions, refer to the detailed documentation files.
