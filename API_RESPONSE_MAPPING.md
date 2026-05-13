# API Response to UI Mapping Guide

## Field Mappings

### Backend Response → Frontend Display

#### PBL Case Data
| Backend Field | Frontend Display | UI Component |
|---|---|---|
| `case_number` | Case #1, #2, etc. | Breadcrumb & Card Header |
| `slug` | Used for routing | URL parameter |
| `title` | Case title | Page heading |
| `description` | Case description | Subtitle text |
| `pbl_level.name` | "Beginner", "Intermediate", etc. | Colored badge |
| `status` | "in-progress", "completed", "not-started" | Status icon + text |
| `deadline` | Formatted date & countdown | Deadline section |
| `start_date` | Start date | Metadata (optional) |
| `time_limit` | Time limit in minutes | Metadata (optional) |
| `image_url` | Case image | Card image (placeholder if null) |

#### PBL Sections & Items
| Backend Field | Frontend Display | UI Component |
|---|---|---|
| `section.title` | Section heading | Section header |
| `section.order` | Sort order | (automatic ordering) |
| `item.type` | Content type handling | Conditional rendering |
| `item.content` | Text/HTML content | Text display or iframe |
| `item.image_url` | Image display | `<img>` tag |
| `item.order` | Item sequence | (automatic ordering) |

#### Item Types & Rendering
```
type: "text" → Display as <p> with whitespace preserved
type: "image" → Display as <img> with alt text
type: "video" → Display as iframe with src from content
type: "file" → Display as link or download button
```

#### Submission Data
| Backend Field | Frontend Display | UI Component |
|---|---|---|
| `submission_file_path` | File download link | Download button |
| `submitted_at` | Submission timestamp | Metadata display |
| `score` | Grade (if available) | Score display |
| `feedback` | Teacher feedback | Feedback section |
| `status` | Submission status | Status indicator |

## Component Structure

```
PBLDetailPage
├── Loading Spinner (during data fetch)
├── Error Alert (if API fails)
└── Success Notification (after submission)
│
└── Main Grid (2 columns on desktop)
    ├── Left Sidebar (sticky)
    │   └── Case Card
    │       ├── Image
    │       ├── Case Number & Title
    │       ├── Level Badge
    │       ├── Start Button
    │       └── Status & Deadline Info
    │
    └── Right Content Area
        ├── Title & Description Card
        ├── Sections & Content Card
        │   └── For each Section
        │       ├── Section Title
        │       └── For each Item
        │           ├── Text content
        │           ├── Images
        │           └── Videos
        │
        └── Upload Card
            ├── Dropzone Area
            ├── File List
            └── Action Buttons
                ├── Submit Button (with loader)
                └── Save Draft Button
```

## Color Mappings

### Level Colors
```javascript
'Beginner': 'bg-cyan-100 text-cyan-700'
'Intermediate': 'bg-green-100 text-green-700'
'Advanced': 'bg-amber-100 text-amber-700'
'Expert': 'bg-purple-100 text-purple-700'
'Master': 'bg-pink-100 text-pink-700'
```

### Status Icons & Colors
```javascript
'completed': CheckCircle2 (green)
'in-progress': AlertCircle (blue)
'not-started': Clock (gray)
```

## Data Transformation Examples

### Example 1: Case from API
```json
{
  "id": 1,
  "case_number": 1,
  "title": "System Login Bermasalah",
  "pbl_level": {
    "id": 1,
    "name": "Beginner"
  },
  "deadline": "2026-06-07T02:28:13.000000Z",
  "status": "in-progress"
}
```

Transforms to UI display:
- Breadcrumb: `Case #1`
- Badge: `Beginner` (with cyan color)
- Title: `System Login Bermasalah`
- Status: Blue AlertCircle icon + "Sedang Berlangsung"
- Deadline: "7 Juni 2026"

### Example 2: Section from API
```json
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
```

Transforms to UI display:
- Section heading: "Tes Endpoint"
- Item content: "abcdefghijklmnopqrstuvwxyz" (wrapped in `<p>` with `whitespace-pre-wrap`)

## API Error Responses

### Case Not Found
```json
// If slug doesn't match any case
→ Display: "Case tidak ditemukan - Case yang Anda cari tidak tersedia"
```

### Section Fetch Failed
```json
// If sections endpoint returns 404/500
→ Display: "Tidak ada konten untuk case ini"
```

### Submission Failed
```json
{
  "message": "Error message from backend",
  "errors": { "submission_file": ["File size exceeds maximum"] }
}
→ Display: Error message in red alert box
```

## State Management Flow

```
Initial Load:
loading: true
caseData: null
sections: null
error: null
    ↓
Data Fetched:
loading: false
caseData: {...}
sections: [...]
error: null
    ↓
Error State:
loading: false
caseData: null
sections: null
error: Error object
    ↓
File Upload:
uploadedFiles: [File, File, ...]
isSubmitting: true
    ↓
Submission Complete:
uploadedFiles: []
isSubmitting: false
submitSuccess: true
    ↓ (after 3 seconds)
submitSuccess: false
```
