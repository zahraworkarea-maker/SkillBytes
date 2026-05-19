# Question Image Implementation - Backend Setup

## Status Frontend ✅
- ✅ Frontend siap menampilkan gambar soal
- ✅ Komponen `QuizQuestion` sudah bisa render gambar dengan validasi
- ✅ URL gambar akan dibangun dari: `${NEXT_PUBLIC_IMAGE_URL}${image_path}`
- ✅ Environment: `NEXT_PUBLIC_IMAGE_URL=http://localhost:8000/storage`

## Apa yang Backend Perlu Lakukan

### 1. Update Database Schema
Pastikan tabel `questions` memiliki column `image_path`:
```sql
ALTER TABLE questions ADD COLUMN image_path VARCHAR(255) NULL;
```

### 2. Update Assessment API Response
Backend harus mengirimkan `image_path` dalam response `/api/assessments/{slug}`:

#### Current Response (❌ Tidak ada `image_path`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Basic Math Quiz",
    "questions": [
      {
        "id": 49,
        "question": "okqwdwijda awijd",
        "options": [
          {"id": "d80fcd9c", "label": "A", "text": "awkdlm"}
        ]
      }
    ]
  }
}
```

#### Expected Response (✅ Dengan `image_path`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Basic Math Quiz",
    "questions": [
      {
        "id": 49,
        "question": "okqwdwijda awijd",
        "image_path": "/uploads/questions/q49.png",
        "options": [
          {"id": "d80fcd9c", "label": "A", "text": "awkdlm"}
        ]
      },
      {
        "id": 50,
        "question": "Another question without image",
        "image_path": null,
        "options": [...]
      }
    ]
  }
}
```

### 3. Path Format Requirements
- **Relative path**: `/uploads/questions/image.png` → akan menjadi `http://localhost:8000/storage/uploads/questions/image.png`
- **Null/empty**: Gambar tidak akan ditampilkan
- **Invalid format** (seperti "question"): Akan diabaikan, gambar tidak ditampilkan

### 4. Laravel Implementation Example

#### Update Question Model
```php
// app/Models/Question.php
class Question extends Model {
    protected $fillable = ['question', 'image_path', 'assessment_id'];
}
```

#### Update Assessment Resource
```php
// app/Http/Resources/AssessmentDetailResource.php
class AssessmentDetailResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'questions' => $this->questions->map(function($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question,
                    'image_path' => $question->image_path, // ✅ Add this
                    'options' => $question->options->map(function($option) {
                        return [
                            'id' => $option->id,
                            'label' => $option->label,
                            'text' => $option->text
                        ];
                    })
                ];
            })
        ];
    }
}
```

## Frontend Behavior

### Kondisi Menampilkan Gambar:
```javascript
// Gambar akan ditampilkan HANYA jika:
1. image_path tidak null/empty
2. image_path dimulai dengan "/" (relative path) 
   OR mengandung "://" (full URL)
3. Gambar berhasil dimuat (no 404 error)

// Contoh valid:
- "/uploads/questions/math-q1.png" ✅
- "http://example.com/images/q1.png" ✅
- "/storage/questions/problem.jpg" ✅

// Contoh invalid (tidak akan ditampilkan):
- "question" ❌
- "null" ❌
- "" ❌
- "uploads/questions/image.png" ❌ (tanpa / di depan)
```

## Testing

### Cara Test Frontend:
1. Buka DevTools > Network Tab
2. Cari request ke `/api/assessments/ajibwdia` (atau slug yang digunakan)
3. Lihat response apakah ada field `image_path` di setiap question
4. Jika ada path valid, gambar akan langsung ditampilkan tanpa request tambahan

### Expected Network Flow:
```
✅ Request: /api/assessments/ajibwdia
✅ Response: {...questions dengan image_path...}
✅ Browser: Render <img> dengan src dari image_path
❌ No extra HTTP request ke backend untuk image (langsung dari response)
```

## File yang Sudah Diupdate (Frontend)

### 1. Type Definition
- **File**: [lib/types/assessment.types.ts](lib/types/assessment.types.ts#L18)
- **Added**: `image_path?: string | null` ke `AssessmentQuestion`

### 2. Component
- **File**: [components/assesmen/quiz-question.tsx](components/assesmen/quiz-question.tsx)
- **Added**: 
  - `isValidImagePath()` - helper untuk validasi path
  - Image rendering section dengan error handling
  - State tracking untuk image errors

## Environment Configuration
```
# .env (sudah ada)
NEXT_PUBLIC_IMAGE_URL=http://localhost:8000/storage
```

## Next Steps
1. ✅ Frontend ready
2. ⏳ **Backend**: Tambahkan `image_path` ke response Assessment API
3. ⏳ **Backend**: Implementasi upload/management image untuk soal
4. ✅ Testing: Verifikasi gambar muncul di quiz page
