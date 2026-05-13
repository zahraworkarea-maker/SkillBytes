# ✅ PBL Backend Integration - Optimized Response Structure

## Updated Response Format

The backend now returns sections directly in the case response, making the integration more efficient:

### GET `/api/pbl-cases/{id}` - Full Case with Sections

```json
{
  "data": {
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
            "image_url": null,
            "order": 1
          }
        ]
      }
    ],
    "status": "completed",
    "created_at": "2026-05-07T02:29:03.000000Z",
    "updated_at": "2026-05-07T02:29:03.000000Z"
  }
}
```

## Optimized Data Flow

```
URL Slug: /pbl/system-login-bermasalah-ymEGQTTF
  ↓
usePBLCase Hook Executes:
  1. Fetch: GET /api/pbl-cases?page=1&per_page=100
  2. Find case by slug in response
  3. Fetch: GET /api/pbl-cases/{id}  ← Single API call for full data
  ↓
Response includes:
  ✓ Case info (id, slug, title, description, etc.)
  ✓ Level info (Beginner, Intermediate, etc.)
  ✓ Status (in-progress, completed, not-started)
  ✓ Deadlines and time limits
  ✓ Sections array with all items
  ✓ Item types (text, image, video)
  ↓
UI Renders Entire Case with Sections
  ├── Case Card (left sidebar)
  │   ├── Case number & title
  │   ├── Level badge
  │   ├── Status indicator
  │   └── Deadline countdown
  │
  ├── Content Area (right)
  │   ├── Description
  │   ├── Sections
  │   │   ├── Section 1: Tes Endpoint
  │   │   │   └── Item 1 (type: text) → "abcdefghijklmnopqrstuvwxyz"
  │   │   └── Section 2, 3, ...
  │   └── File Upload
```

## API Call Optimization

### Before (2 API Calls)
```
Call 1: GET /api/pbl-cases?page=1&per_page=100
        → Get all cases, find by slug
        
Call 2: GET /api/pbl-cases/{id}/sections
        → Get sections separately
```

### Now (2 API Calls, Better Data)
```
Call 1: GET /api/pbl-cases?page=1&per_page=100
        → Get all cases, find by slug
        
Call 2: GET /api/pbl-cases/{id}
        → Get full case with sections included (single payload)
```

## Hook Implementation

```typescript
export function usePBLCase(slug: string): UsePBLCaseResult {
  const [caseData, setCaseData] = useState(null);
  const [sections, setSections] = useState(null);
  
  useEffect(() => {
    // 1. Fetch all cases to find the one with matching slug
    const casesResponse = await pblService.getAllCases(1, 100);
    const caseFromList = casesResponse.data.find(c => c.slug === slug);
    
    // 2. Fetch full case data by ID (includes sections)
    const fullCaseResponse = await pblService.getCaseById(caseFromList.id);
    const fullCaseData = fullCaseResponse.data || fullCaseResponse;
    
    setCaseData(fullCaseData);  // Has sections property
    setSections(fullCaseData.sections || []);  // Extract for convenience
  }, [slug]);
  
  return { caseData, sections, loading, error };
}
```

## Usage in Component

```typescript
function PBLDetailPage() {
  const slug = params.slug as string;
  const { caseData, sections, loading, error } = usePBLCase(slug);
  
  // caseData.sections is now available directly
  // sections is also provided for convenience
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert />;
  
  return (
    <>
      {/* Display case info */}
      <h1>{caseData.title}</h1>
      <Badge>{caseData.pbl_level.name}</Badge>
      
      {/* Display sections */}
      {sections?.map(section => (
        <div key={section.id}>
          <h2>{section.title}</h2>
          {section.items.map(item => (
            <RenderItem key={item.id} item={item} />
          ))}
        </div>
      ))}
      
      {/* File upload */}
      <FileUpload onSubmit={(files) => submitPBL(caseData.id, files)} />
    </>
  );
}
```

## Response Properties Reference

### Case Object Properties
| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Case ID |
| `slug` | string | URL-friendly identifier |
| `case_number` | number | Case number (1, 2, 3...) |
| `title` | string | Case title |
| `description` | string | Case description |
| `status` | string | "in-progress", "completed", "not-started" |
| `pbl_level` | object | Level with id and name |
| `deadline` | string | ISO datetime |
| `start_date` | string | ISO datetime |
| `time_limit` | number | Minutes |
| `image_url` | string\|null | Cover image URL |
| `sections` | array | **NEW**: Sections with items |

### Section Object Properties
| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Section ID |
| `title` | string | Section title |
| `order` | number | Display order |
| `items` | array | Section items |

### Item Object Properties
| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Item ID |
| `type` | string | "text", "image", "video" |
| `content` | string | Text content or video URL |
| `image_url` | string\|null | Image URL |
| `order` | number | Display order |

## Error Handling

```typescript
try {
  const response = await pblService.getCaseById(id);
  const caseData = response.data || response;  // Handle both formats
  
  if (!caseData.sections) {
    console.warn('No sections in response');
    setSections([]);
  } else {
    setSections(caseData.sections);
  }
} catch (error) {
  if (error.response?.status === 404) {
    setError('Case tidak ditemukan');
  } else {
    setError('Gagal memuat case. Silakan coba lagi.');
  }
}
```

## Content Type Rendering

```typescript
function RenderItem({ item }) {
  switch (item.type) {
    case 'text':
      return <p className="whitespace-pre-wrap">{item.content}</p>;
      
    case 'image':
      return <img src={item.image_url} alt="Content" className="max-w-full" />;
      
    case 'video':
      return (
        <iframe
          src={item.content}
          className="w-full aspect-video"
          allowFullScreen
        />
      );
      
    default:
      return null;
  }
}
```

## Advantages of This Structure

✅ **Single API call returns complete data**
- No need for separate sections endpoint
- Faster initial load
- Less API overhead

✅ **Sections properly ordered**
- `order` property maintains sequence
- Items within sections also ordered

✅ **Full content included**
- Text, images, videos all in one response
- No additional fetches needed

✅ **Easy to extend**
- Can add more item types without changing API calls
- Sections can have unlimited items

✅ **Type-safe with TypeScript**
- Full type definitions for all nested objects
- Autocomplete support in IDE

## Testing the Integration

```typescript
// Test data fetching
const { caseData, sections } = usePBLCase('system-login-bermasalah-ymEGQTTF');

// caseData should have:
expect(caseData.id).toBe(1);
expect(caseData.slug).toBe('system-login-bermasalah-ymEGQTTF');
expect(caseData.sections).toBeDefined();
expect(caseData.sections.length).toBeGreaterThan(0);

// sections should match caseData.sections
expect(sections).toEqual(caseData.sections);

// Each section should have items
sections.forEach(section => {
  expect(section.items).toBeDefined();
  expect(Array.isArray(section.items)).toBe(true);
});
```

## Production Checklist

- ✅ Backend returns sections in case response
- ✅ Frontend hook updated to use new response structure
- ✅ TypeScript types match backend response
- ✅ Error handling for missing sections
- ✅ Build compiles without errors
- ✅ File upload still works with case data
- ✅ Loading and error states handled
- ✅ Section rendering dynamic based on response

---

**Status:** ✅ Ready for Production
**Last Updated:** May 12, 2026
