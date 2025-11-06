# File Upload Configuration Guide

## Issue: 413 Request Entity Too Large

If you're experiencing 413 errors during file uploads in production, follow these steps:

## 1. Express Server Configuration ✅

The Express server has been configured with the following limits:
- Body parser JSON limit: **50MB**
- Body parser URL-encoded limit: **50MB**
- Multer file size limit: **25MB** (configurable via `MAX_UPLOAD_FILE_SIZE` env var)

## 2. Reverse Proxy Configuration (Nginx/Apache)

### Nginx Configuration

If you're using Nginx as a reverse proxy, add this to your configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase client body size limit for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Increase proxy timeouts for large uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Apache Configuration

If you're using Apache, add this to your `.htaccess` or virtual host configuration:

```apache
LimitRequestBody 52428800
```

## 3. Supabase Storage Configuration

### Dashboard Configuration (IMPORTANT!)

Supabase has its own upload size limits that you MUST configure in the dashboard:

#### Global File Size Limit
1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Settings**
3. Look for **"Global file size limit"** in the top section
4. Set your desired limit:
   - **Free Plan**: Max 50 MB
   - **Pro Plan**: Up to 500 GB

#### Per-Bucket File Size Limit (Optional)
1. Go to **Storage** → **Buckets**
2. Click the three dots (⋮) next to your bucket (e.g., "files" or "resumes")
3. Select **"Edit bucket"**
4. Enable **"Restrict file size"**
5. Set the maximum file size for that bucket
   - **Note**: Cannot exceed the global limit

### Recommended Settings for Your Use Case
- **Global limit**: Set to at least **50 MB** (or higher on Pro plan)
- **Bucket limit**: Set to **25-50 MB** for each bucket

## 4. Cloud Platform Configurations

### AWS (Application Load Balancer)
- No configuration needed - ALB supports up to 1GB request body size

### Google Cloud Platform (Load Balancer)
- No configuration needed - supports large request bodies by default

### Vercel/Netlify
- These platforms have their own limits. For large file uploads, consider:
  - Using direct client-to-storage uploads (e.g., Supabase Storage direct upload)
  - Implementing presigned URLs

### Railway/Render
- Check platform-specific documentation for body size limits
- May need to contact support for higher limits

## 5. Environment Variables

Make sure to set in your `.env`:

```env
MAX_UPLOAD_FILE_SIZE=26214400  # 25MB in bytes (optional, defaults to 25MB)
```

## 6. Client-Side Considerations

Ensure your frontend sends the correct `Content-Type` header:
- For multipart uploads: `Content-Type: multipart/form-data`
- Remove any manual `Content-Type` headers when using FormData (browser sets it automatically)

## 7. Troubleshooting Checklist

When you get a **413 Request Entity Too Large** error, check these in order:

### Step 1: Supabase Storage Settings ⚠️ MOST COMMON ISSUE
- [ ] Go to Supabase Dashboard → Storage → Settings
- [ ] Check "Global file size limit" is at least **50 MB**
- [ ] If using Free plan, maximum is 50 MB
- [ ] If using Pro plan, you can set up to 500 GB

### Step 2: Express Server Configuration ✅ FIXED
- [x] Body parser limits set to 50MB ([index.ts:40-47](c:\Users\Admin\Documents\practise\turbo\apps\server\src\index.ts#L40-L47))
- [x] Multer limit set to 25MB ([multer.service.ts:6-8](c:\Users\Admin\Documents\practise\turbo\apps\server\src\services\multer.service.ts#L6-L8))

### Step 3: Reverse Proxy (Nginx/Apache)
- [ ] If using Nginx, add `client_max_body_size 50M;`
- [ ] If using Apache, add `LimitRequestBody 52428800`
- [ ] Reload the reverse proxy after changes

### Step 4: Cloud Platform/Hosting
- [ ] Check your hosting platform's documentation for upload limits
- [ ] Some platforms (Vercel, Netlify) may have stricter limits

### Error Location Guide
| Error Occurs | Likely Cause | Solution |
|--------------|--------------|----------|
| Before controller is called | Supabase/Nginx/Hosting limit | Check Supabase dashboard or reverse proxy |
| In controller (logs show) | Express body parser | Already fixed (50MB limit) |
| Multer error message | File too large for multer | Increase MAX_UPLOAD_FILE_SIZE env var |
| Supabase storage error | Bucket/global limit | Check Supabase Storage settings |

## 8. Testing

Test your upload limits:
```bash
# Create a test file
dd if=/dev/zero of=test_20mb.bin bs=1M count=20

# Upload using curl
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@test_20mb.bin" \
  http://your-domain.com/api/recommendations/company/TEST
```
