# Assessment CRUD API Response Format Documentation

## Overview
Dokumentasi ini menjelaskan format response dari API Assessment, Question, dan Option services.

---

## Assessment Endpoints

### 1. Get All Assessments (Paginated)

**Endpoint:** `GET /assessments?page=1&per_page=15`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "slug": "l1-sample-5q",
      "title": "Sample: Dasar Class & Object (5 soal)",
      "description": "Assessment singkat 5 soal untuk konsep dasar class dan object",
      "time_limit": 15,
      "total_questions": 5,
      "created_at": "2026-05-13T16:01:33.000000Z",
      "updated_at": "2026-05-13T16:01:33.000000Z"
    },
    {
      "id": 2,
      "slug": "general-knowledge",
      "title": "General Knowledge Test",
      "description": "Test your general knowledge about various topics",
      "time_limit": 45,
      "total_questions": 2,
      "created_at": "2026-05-13T15:32:03.000000Z",
      "updated_at": "2026-05-13T15:32:03.000000Z"
    },
    {
      "id": 1,
      "slug": "basic-math-quiz",
      "title": "Basic Math Quiz",
      "description": "A simple quiz to test your basic math skills",
      "time_limit": 30,
      "total_questions": 3,
      "created_at": "2026-05-13T15:31:59.000000Z",
      "updated_at": "2026-05-13T15:31:59.000000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "count": 3,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

**Field Descriptions:**
- `id`: Assessment ID (integer, unique)
- `slug`: URL-friendly identifier
- `title`: Assessment title
- `description`: Assessment description
- `time_limit`: Time limit in minutes
- `total_questions`: Number of questions in assessment
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update
- `pagination`: Pagination metadata

---

### 2. Get Assessment Detail by ID

**Endpoint:** `GET /assessments/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "General Knowledge Test",
    "description": "Test your general knowledge about various topics",
    "total_questions": 2,
    "time_limit": 45,
    "questions": [
      {
        "id": 4,
        "question": "What is the capital of Indonesia?",
        "options": [
          {
            "id": 13,
            "label": "a",
            "text": "Bandung"
          },
          {
            "id": 14,
            "label": "b",
            "text": "Jakarta"
          },
          {
            "id": 15,
            "label": "c",
            "text": "Surabaya"
          },
          {
            "id": 16,
            "label": "d",
            "text": "Yogyakarta"
          }
        ]
      },
      {
        "id": 5,
        "question": "In what year did Indonesia declare independence?",
        "options": [
          {
            "id": 17,
            "label": "a",
            "text": "1942"
          },
          {
            "id": 18,
            "label": "b",
            "text": "1945"
          },
          {
            "id": 19,
            "label": "c",
            "text": "1948"
          },
          {
            "id": 20,
            "label": "d",
            "text": "1950"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Get Assessment by Slug

**Endpoint:** `GET /assessments/{slug}`

**Example:** `GET /assessments/general-knowledge`

**Response:** Same as Get Assessment Detail by ID

---

### 4. Create Assessment

**Endpoint:** `POST /assessments`

**Request Body:**
```json
{
  "title": "New Assessment",
  "slug": "new-assessment",
  "description": "Description of the assessment",
  "time_limit": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "slug": "new-assessment",
    "title": "New Assessment",
    "description": "Description of the assessment",
    "time_limit": 30,
    "total_questions": 0,
    "created_at": "2026-05-18T10:30:00.000000Z",
    "updated_at": "2026-05-18T10:30:00.000000Z"
  }
}
```

---

### 5. Update Assessment

**Endpoint:** `PUT /assessments/{id}`

**Request Body:**
```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "description": "Updated description",
  "time_limit": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "slug": "updated-slug",
    "title": "Updated Title",
    "description": "Updated description",
    "time_limit": 45,
    "total_questions": 0,
    "created_at": "2026-05-18T10:30:00.000000Z",
    "updated_at": "2026-05-18T11:00:00.000000Z"
  }
}
```

---

### 6. Delete Assessment

**Endpoint:** `DELETE /assessments/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "message": "Assessment successfully deleted"
  }
}
```

---

## Question Endpoints

### 1. Create Question for Assessment

**Endpoint:** `POST /assessments/{assessmentId}/questions`

**Request Body:**
```json
{
  "question": "What is the capital of France?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "assessment_id": 2,
    "question": "What is the capital of France?",
    "created_at": "2026-05-18T10:35:00.000000Z",
    "updated_at": "2026-05-18T10:35:00.000000Z"
  }
}
```

---

### 2. Get Question by ID

**Endpoint:** `GET /questions/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "question": "What is the capital of Indonesia?",
    "assessment_id": 2,
    "options": [
      {
        "id": 13,
        "label": "a",
        "text": "Bandung"
      },
      {
        "id": 14,
        "label": "b",
        "text": "Jakarta"
      },
      {
        "id": 15,
        "label": "c",
        "text": "Surabaya"
      },
      {
        "id": 16,
        "label": "d",
        "text": "Yogyakarta"
      }
    ],
    "created_at": "2026-05-13T15:45:00.000000Z",
    "updated_at": "2026-05-13T15:45:00.000000Z"
  }
}
```

---

### 3. Update Question

**Endpoint:** `PUT /questions/{id}`

**Request Body:**
```json
{
  "question": "Updated question text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "assessment_id": 2,
    "question": "Updated question text",
    "created_at": "2026-05-18T10:35:00.000000Z",
    "updated_at": "2026-05-18T10:40:00.000000Z"
  }
}
```

---

### 4. Delete Question

**Endpoint:** `DELETE /questions/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "message": "Question successfully deleted"
  }
}
```

---

## Option Endpoints

### 1. Create Option for Question

**Endpoint:** `POST /questions/{questionId}/options`

**Request Body:**
```json
{
  "question_id": 1,
  "label": "A",
  "text": "Paris",
  "is_correct": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_id": 1,
    "label": "A",
    "text": "Paris",
    "is_correct": true,
    "created_at": "2026-05-18T10:45:00.000000Z",
    "updated_at": "2026-05-18T10:45:00.000000Z"
  }
}
```

---

### 2. Get Option by ID

**Endpoint:** `GET /options/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_id": 1,
    "label": "A",
    "text": "Paris",
    "is_correct": true,
    "created_at": "2026-05-18T10:45:00.000000Z",
    "updated_at": "2026-05-18T10:45:00.000000Z"
  }
}
```

---

### 3. Get All Options for a Question

**Endpoint:** `GET /questions/{questionId}/options`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_id": 1,
      "label": "A",
      "text": "Paris",
      "is_correct": true,
      "created_at": "2026-05-18T10:45:00.000000Z",
      "updated_at": "2026-05-18T10:45:00.000000Z"
    },
    {
      "id": 2,
      "question_id": 1,
      "label": "B",
      "text": "London",
      "is_correct": false,
      "created_at": "2026-05-18T10:45:00.000000Z",
      "updated_at": "2026-05-18T10:45:00.000000Z"
    },
    {
      "id": 3,
      "question_id": 1,
      "label": "C",
      "text": "Berlin",
      "is_correct": false,
      "created_at": "2026-05-18T10:45:00.000000Z",
      "updated_at": "2026-05-18T10:45:00.000000Z"
    },
    {
      "id": 4,
      "question_id": 1,
      "label": "D",
      "text": "Madrid",
      "is_correct": false,
      "created_at": "2026-05-18T10:45:00.000000Z",
      "updated_at": "2026-05-18T10:45:00.000000Z"
    }
  ]
}
```

---

### 4. Update Option

**Endpoint:** `PUT /options/{id}`

**Request Body:**
```json
{
  "label": "A",
  "text": "Updated text",
  "is_correct": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_id": 1,
    "label": "A",
    "text": "Updated text",
    "is_correct": true,
    "created_at": "2026-05-18T10:45:00.000000Z",
    "updated_at": "2026-05-18T10:50:00.000000Z"
  }
}
```

---

### 5. Delete Option

**Endpoint:** `DELETE /options/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Option successfully deleted"
  }
}
```

---

## Usage Examples

### Using Assessment Service

```typescript
import { assessmentService } from '@/lib/api-services'

// Get all assessments
const response = await assessmentService.getAllAssessments(1, 15, 'search term')

// Get assessment by ID
const assessment = await assessmentService.getAssessmentById(2)

// Create assessment
const newAssessment = await assessmentService.createAssessment({
  title: 'New Quiz',
  slug: 'new-quiz',
  description: 'Description',
  time_limit: 30
})

// Update assessment
const updated = await assessmentService.updateAssessment(2, {
  title: 'Updated Title',
  description: 'Updated description',
  time_limit: 45,
  slug: 'updated-slug'
})

// Delete assessment
await assessmentService.deleteAssessment(2)
```

### Using Question Service

```typescript
import { questionService } from '@/lib/api-services'

// Create question
const question = await questionService.createQuestion(2, {
  question: 'Sample question?'
})

// Get question
const q = await questionService.getQuestionById(10)

// Update question
const updated = await questionService.updateQuestion(10, {
  question: 'Updated question?'
})

// Delete question
await questionService.deleteQuestion(10)
```

### Using Option Service

```typescript
import { optionService } from '@/lib/api-services'

// Create option
const option = await optionService.createOption(4, {
  label: 'A',
  text: 'Paris',
  is_correct: true
})

// Get all options for question
const options = await optionService.getOptionsByQuestion(4)

// Update option
const updated = await optionService.updateOption(1, {
  text: 'Updated text',
  is_correct: false
})

// Delete option
await optionService.deleteOption(1)
```

---

## Error Response Format

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

**Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["Title field is required"],
    "slug": ["Slug must be unique"]
  }
}
```

---

## HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
