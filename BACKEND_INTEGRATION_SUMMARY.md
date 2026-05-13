# Backend Integration Guide - PBL Cases

## Overview
The SkillBytes frontend has been successfully integrated with the Laravel backend to fetch all PBL (Problem-Based Learning) case data dynamically.

## Components Implemented

### 1. **Type Definitions** - `lib/types/pbl.types.ts`
Added new submission-related types:
- `PBLSubmission` - Submission data structure
- `PBLSubmissionCreateRequest` - Form data for creating submissions
- `PBLSubmissionResponse` - API response for single submission
- `PBLSubmissionListResponse` - API response for multiple submissions

### 2. **API Services** - `lib/api-services.ts`
Enhanced `pblService` with new methods:

```typescript
// Get all PBL cases with pagination
pblService.getAllCases(page, perPage)

// Get PBL sections for a specific case
pblService.getSectionsByCase(caseId)

// Submit PBL solution with file upload
pblService.submitPBL(caseId, formData)

// Get all submissions
pblService.getSubmissions(params)

// Get submission by ID
pblService.getSubmissionById(id)
```

### 3. **Custom Hook** - `hooks/use-pbl-case.ts`
New hook to fetch PBL case data by slug:

```typescript
const { caseData, sections, loading, error } = usePBLCase(slug);
```

### 4. **Updated Page Component** - `app/(siswa)/pbl/[slug]/page.tsx`

#### Key Changes:
- Removed local mock data
- Integrated `usePBLCase` hook for data fetching
- Added loading states with spinner
- Added error handling with proper error messages
- Dynamic section rendering from API
- File upload with submission to backend

## Backend API Responses

### PBL Cases Response
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "slug": "system-login-bermasalah-ymEGQTTF",
      "case_number": 1,
      "title": "System Login Bermasalah",
      "pbl_level_id": 1,
      "description": "Anda diminta untuk menyelesaikan...",
      "image_url": null,
      "time_limit": 120,
      "start_date": "2026-05-07T20:28:13.000000Z",
      "deadline": "2026-06-07T02:28:13.000000Z",
      "pbl_level": {
        "id": 1,
        "name": "Beginner",
        "created_at": "2026-05-06T12:03:19.000000Z",
        "updated_at": "2026-05-06T12:03:19.000000Z"
      },
      "status": "in-progress"
    }
  ],
  "total": 1,
  "per_page": 15,
  "current_page": 1,
  "last_page": 1
}
```

### PBL Sections Response
```json
[
  {
    "id": 1,
    "title": "Tes Endpoint",
    "order": 1,
    "items": [
      {
        "id": 1,
        "type": "text",
        "content": "abcdefghijklmnopqrstuvwxyz",
        "image_url": null,
        "order": 1
      }
    ]
  }
]
```

### Submission Response
```json
{
  "message": "Answer submitted successfully",
  "data": {
    "id": 3,
    "case_id": 1,
    "user_id": 2,
    "answer": null,
    "submission_file": "/storage/submissions/pbl/1778566538_2_ltxh9IkP.pdf",
    "submission_file_path": "submissions/pbl/1778566538_2_ltxh9IkP.pdf",
    "submitted_at": "2026-05-12T06:15:38.000000Z",
    "score": null,
    "feedback": null,
    "created_at": "2026-05-12T06:15:38.000000Z",
    "updated_at": "2026-05-12T06:15:38.000000Z"
  }
}
```

## Features Implemented

### ✅ Data Fetching
- Case data fetched from `/api/pbl-cases` endpoint
- Sections fetched from `/api/pbl-cases/{id}/sections` endpoint
- Search by slug functionality
- Pagination support

### ✅ Loading States
- Spinner displayed while fetching data
- Error messages for failed requests
- "Case not found" handling

### ✅ Dynamic Content Rendering
- Sections with items display
- Support for text, image, and video content types
- Proper ordering and grouping

### ✅ File Upload
- Multiple file selection
- File validation (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP)
- File list display with file size
- Remove file functionality
- Submit to `/pbl-submissions` endpoint

### ✅ User Feedback
- Success notification after submission
- Error messages for failed submissions
- Loading indicator during submission

## Usage Example

```typescript
// In your page component
const { caseData, sections, loading, error } = usePBLCase(slug);

if (loading) {
  // Show loading state
}

if (error) {
  // Show error message
}

// Use caseData and sections to render UI
```

## File Upload Example

```typescript
// Create FormData with case_id and file(s)
const formData = new FormData();
formData.append('case_id', caseData.id.toString());
uploadedFiles.forEach((file) => {
  formData.append('submission_file', file);
});

// Submit to backend
const response = await pblService.submitPBL(caseData.id, formData);
```

## Environment Configuration

Ensure your backend URL is set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

Build the project to verify everything compiles:
```bash
npm run build
```

Start the development server:
```bash
npm run dev
```

Visit: `http://localhost:3000/pbl/[slug]`

## Notes

- The application now fetches live data from the Laravel backend
- All PBL cases are displayed dynamically
- Sections and items are rendered based on order
- File uploads are sent as multipart/form-data
- Error handling is comprehensive with user-friendly messages
- Loading states prevent UI flickering
