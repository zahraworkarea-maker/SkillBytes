# API Integration Debugging Guide

## Environment Configuration

Your `.env` file is correctly configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

This will make all API calls go to: `http://localhost:8000/api`

## How API Calls Work

### Request Flow
```
Page loads with slug: /pbl/system-login-bermasalah-ymEGQTTF
    ↓
usePBLCase hook initialized
    ↓
API Client checks: NEXT_PUBLIC_API_URL from .env
    ├── Base URL: http://localhost:8000/api
    ├── Endpoint: /pbl-cases
    └── Full URL: http://localhost:8000/api/pbl-cases
    ↓
Request sent with auth token (if available)
    ↓
Response logged and data displayed
```

## Console Logs to Check

When you navigate to a PBL case, check the browser console (F12) for these logs:

### 1. API Client Initialization
```
[API CLIENT] Initialized with baseURL: http://localhost:8000/api
```

### 2. Hook Starting
```
[USE-PBL-CASE] Starting to fetch PBL case with slug: system-login-bermasalah-ymEGQTTF
[USE-PBL-CASE] API URL: http://localhost:8000/api
```

### 3. Fetching All Cases
```
[PBL SERVICE] PBL cases fetched: {current_page: 1, data: Array(1), ...}
[AXIOS] Request config: {
  url: /pbl-cases,
  method: "get",
  hasFormData: false,
  contentType: "application/json",
  hasAuth: true
}
[AXIOS] Response success: {
  url: /pbl-cases,
  status: 200
}
[USE-PBL-CASE] Fetching all cases to find by slug...
[USE-PBL-CASE] Cases response received: {current_page: 1, data: Array(1), ...}
[USE-PBL-CASE] Case found by slug, ID: 1
```

### 4. Fetching Full Case with Sections
```
[USE-PBL-CASE] Fetching full case data with sections...
[AXIOS] Request config: {
  url: /pbl-cases/1,
  method: "get",
  hasFormData: false,
  contentType: "application/json",
  hasAuth: true
}
[AXIOS] Response success: {
  url: /pbl-cases/1,
  status: 200
}
[USE-PBL-CASE] Full case response received: {
  data: {
    id: 1,
    slug: "system-login-bermasalah-ymEGQTTF",
    ...
    sections: [...]
  }
}
[USE-PBL-CASE] Case data processed: {
  id: 1,
  title: "System Login Bermasalah",
  sectionsCount: 1
}
[USE-PBL-CASE] Data loaded successfully
```

## Testing the API

### 1. Check Backend is Running
```bash
# Terminal 1: Start Laravel backend
php artisan serve
# Should show: Server running on [http://127.0.0.1:8000]
```

### 2. Check Frontend is Running
```bash
# Terminal 2: Start Next.js frontend
npm run dev
# Should show: ▲ Next.js 16.2.4 Local: http://localhost:3000
```

### 3. Test API Endpoints Directly

Open a new terminal and test:

```bash
# Test: Get all cases
curl http://localhost:8000/api/pbl-cases

# Test: Get case by ID
curl http://localhost:8000/api/pbl-cases/1

# Test: Get case by ID with sections included
curl http://localhost:8000/api/pbl-cases/1
```

### 4. Navigate to PBL Case
1. Visit: `http://localhost:3000/pbl/system-login-bermasalah-ymEGQTTF`
2. Open DevTools (F12)
3. Go to Console tab
4. Look for `[USE-PBL-CASE]` logs
5. Check Network tab to see API requests

## Common Issues & Solutions

### Issue 1: "Case tidak ditemukan"
**Problem:** Slug doesn't match any case in database
**Solution:**
1. Check database for actual slug value
2. Use correct slug in URL
3. Verify case exists: `curl http://localhost:8000/api/pbl-cases`

### Issue 2: API Returns 401 Unauthorized
**Problem:** No authentication token
**Solution:**
1. Make sure you're logged in first
2. Check if auth token is in cookies: `document.cookie`
3. Look for `auth_token` cookie

### Issue 3: CORS Error
**Problem:** Frontend can't reach backend
**Solution:**
1. Verify backend is running on port 8000
2. Check `.env`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
3. Ensure Laravel CORS is enabled

### Issue 4: 404 Not Found
**Problem:** API endpoint doesn't exist
**Solution:**
1. Check endpoint path matches backend routes
2. Verify PBL case ID is correct
3. Check backend logs for route errors

## Network Tab Analysis

In Chrome DevTools → Network tab, you should see:

```
GET http://localhost:8000/api/pbl-cases
Status: 200
Response: {
  "current_page": 1,
  "data": [{...}],
  ...
}

GET http://localhost:8000/api/pbl-cases/1
Status: 200
Response: {
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "sections": [...],
    ...
  }
}
```

## Verify Backend Response Format

The backend should return this structure for `GET /api/pbl-cases/{id}`:

```json
{
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "case_number": 1,
    "title": "System Login Bermasalah",
    "description": "Anda diminta untuk menyelesaikan...",
    "pbl_level": {
      "id": 1,
      "name": "Beginner"
    },
    "sections": [
      {
        "id": 1,
        "title": "Tes Endpoint",
        "order": 1,
        "items": [
          {
            "id": 1,
            "type": "text",
            "content": "abcdefghijklmnopqrstuvwxyz",
            "order": 1
          }
        ]
      }
    ],
    "status": "in-progress",
    "deadline": "2026-06-07T02:28:13.000000Z"
  }
}
```

## Step-by-Step Testing

1. **Start Backend**
   ```bash
   cd /path/to/backend
   php artisan serve
   ```

2. **Start Frontend**
   ```bash
   cd /path/to/SkillBytes
   npm run dev
   ```

3. **Open Browser**
   - Visit: `http://localhost:3000/pbl/system-login-bermasalah-ymEGQTTF`
   - Open DevTools (F12)

4. **Check Console**
   - Should see `[API CLIENT] Initialized with baseURL: http://localhost:8000/api`
   - Should see `[USE-PBL-CASE] Starting to fetch...`
   - Should see success logs if API returns data

5. **Check Network**
   - Should see requests to `/api/pbl-cases`
   - Should see requests to `/api/pbl-cases/1`
   - Both should return status 200

6. **Verify UI**
   - Case title should display
   - Sections should render
   - File upload should be visible

## Troubleshooting Tips

- Clear browser cache: `Ctrl+Shift+Delete`
- Check if ports are in use: `lsof -i :3000`, `lsof -i :8000`
- Restart both servers if making changes to `.env`
- Check both backend and frontend logs
- Use `curl` to test endpoints directly
- Ensure authentication headers are being sent

## API Request Headers

Requests should include:
```
Accept: application/json
Authorization: Bearer {token}  // If authenticated
Content-Type: application/json  // For JSON requests
```

For file uploads:
```
Accept: application/json
Authorization: Bearer {token}
Content-Type: multipart/form-data  // Auto set by browser
```

---

**Status:** ✅ All API calls configured to use `NEXT_PUBLIC_API_URL` from .env
**Environment:** `http://localhost:8000/api`
