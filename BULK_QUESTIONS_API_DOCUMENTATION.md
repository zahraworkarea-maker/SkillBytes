# Bulk Questions & Options Creation API Documentation

## Overview
Documentation for the bulk creation of questions and options for assessments. This endpoint allows creating multiple questions with their options in a single API call.

---

## Endpoint: Bulk Create Questions with Options

### URL
`POST /assessments/{assessmentId}/questions/bulk`

### Request Body
```json
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": [
        {
          "label": "A",
          "text": "London",
          "is_correct": false
        },
        {
          "label": "B",
          "text": "Paris",
          "is_correct": true
        },
        {
          "label": "C",
          "text": "Berlin",
          "is_correct": false
        },
        {
          "label": "D",
          "text": "Madrid",
          "is_correct": false
        }
      ]
    },
    {
      "question": "What is 2 + 2?",
      "options": [
        {
          "label": "A",
          "text": "3",
          "is_correct": false
        },
        {
          "label": "B",
          "text": "4",
          "is_correct": true
        },
        {
          "label": "C",
          "text": "5",
          "is_correct": false
        }
      ]
    }
  ]
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Questions created successfully",
  "data": [
    {
      "id": 1,
      "assessment_id": 1,
      "question": "What is the capital of France?",
      "created_at": "2026-05-18T10:35:00.000000Z",
      "updated_at": "2026-05-18T10:35:00.000000Z",
      "options": [
        {
          "id": 1,
          "question_id": 1,
          "label": "A",
          "text": "London",
          "is_correct": false,
          "created_at": "2026-05-18T10:35:00.000000Z",
          "updated_at": "2026-05-18T10:35:00.000000Z"
        },
        {
          "id": 2,
          "question_id": 1,
          "label": "B",
          "text": "Paris",
          "is_correct": true,
          "created_at": "2026-05-18T10:35:00.000000Z",
          "updated_at": "2026-05-18T10:35:00.000000Z"
        },
        {
          "id": 3,
          "question_id": 1,
          "label": "C",
          "text": "Berlin",
          "is_correct": false,
          "created_at": "2026-05-18T10:35:00.000000Z",
          "updated_at": "2026-05-18T10:35:00.000000Z"
        },
        {
          "id": 4,
          "question_id": 1,
          "label": "D",
          "text": "Madrid",
          "is_correct": false,
          "created_at": "2026-05-18T10:35:00.000000Z",
          "updated_at": "2026-05-18T10:35:00.000000Z"
        }
      ]
    },
    {
      "id": 2,
      "assessment_id": 1,
      "question": "What is 2 + 2?",
      "created_at": "2026-05-18T10:35:01.000000Z",
      "updated_at": "2026-05-18T10:35:01.000000Z",
      "options": [
        {
          "id": 5,
          "question_id": 2,
          "label": "A",
          "text": "3",
          "is_correct": false,
          "created_at": "2026-05-18T10:35:01.000000Z",
          "updated_at": "2026-05-18T10:35:01.000000Z"
        },
        {
          "id": 6,
          "question_id": 2,
          "label": "B",
          "text": "4",
          "is_correct": true,
          "created_at": "2026-05-18T10:35:01.000000Z",
          "updated_at": "2026-05-18T10:35:01.000000Z"
        },
        {
          "id": 7,
          "question_id": 2,
          "label": "C",
          "text": "5",
          "is_correct": false,
          "created_at": "2026-05-18T10:35:01.000000Z",
          "updated_at": "2026-05-18T10:35:01.000000Z"
        }
      ]
    }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "questions.0.question": ["The question field is required"],
    "questions.0.options": ["At least 2 options are required per question"],
    "questions.0.options.0.is_correct": ["At least one option must be marked as correct"]
  }
}
```

### Field Descriptions

#### Request Fields:
- `questions` (array, required): Array of question objects
  - `question` (string, required): The question text
  - `options` (array, required): Array of option objects (minimum 2 required)
    - `label` (string, required): Option label (e.g., "A", "B", "C", "D")
    - `text` (string, required): Option text/answer
    - `is_correct` (boolean, required): Whether this is the correct answer

#### Response Fields:
- `id`: Question ID (auto-generated)
- `assessment_id`: Associated assessment ID
- `question`: Question text
- `options`: Array of created option objects
  - `id`: Option ID (auto-generated)
  - `question_id`: Associated question ID
  - `label`: Option label
  - `text`: Option text
  - `is_correct`: Whether this is the correct answer
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

---

## Validation Rules

### Question Validation:
1. **question field**: 
   - Required
   - Must be a string
   - Minimum length: 5 characters
   - Maximum length: 1000 characters

2. **options array**:
   - Required
   - Minimum 2 options per question
   - Maximum 6 options per question

### Option Validation:
1. **label field**:
   - Required
   - Must match format (A, B, C, D, E, F, etc.)
   - Must be unique within the question

2. **text field**:
   - Required
   - Must be a string
   - Minimum length: 1 character
   - Maximum length: 500 characters

3. **is_correct field**:
   - Required
   - Must be boolean
   - At least one option per question must have `is_correct: true`

---

## Implementation in Laravel

### Route Definition (routes/api.php):
```php
Route::post('/assessments/{assessment}/questions/bulk', 'AssessmentController@bulkCreateQuestions');
```

### Controller Method:
```php
public function bulkCreateQuestions(Request $request, Assessment $assessment)
{
    $validated = $request->validate([
        'questions' => 'required|array|min:1',
        'questions.*.question' => 'required|string|min:5|max:1000',
        'questions.*.options' => 'required|array|min:2|max:6',
        'questions.*.options.*.label' => 'required|string|in:A,B,C,D,E,F',
        'questions.*.options.*.text' => 'required|string|min:1|max:500',
        'questions.*.options.*.is_correct' => 'required|boolean',
    ]);

    $createdQuestions = [];

    DB::transaction(function () use ($validated, $assessment, &$createdQuestions) {
        foreach ($validated['questions'] as $questionData) {
            // Create question
            $question = $assessment->questions()->create([
                'question' => $questionData['question'],
            ]);

            // Create options
            foreach ($questionData['options'] as $optionData) {
                $question->options()->create([
                    'label' => $optionData['label'],
                    'text' => $optionData['text'],
                    'is_correct' => $optionData['is_correct'],
                ]);
            }

            $createdQuestions[] = $question->load('options');
        }
    });

    return response()->json([
        'success' => true,
        'message' => 'Questions created successfully',
        'data' => $createdQuestions,
    ], 201);
}
```

---

## Usage in Frontend

### API Call Example:
```javascript
const response = await assessmentService.bulkCreateQuestions(assessmentId, questions);
```

### JavaScript Example:
```javascript
const questions = [
  {
    question: "What is the capital of France?",
    options: [
      { label: "A", text: "London", is_correct: false },
      { label: "B", text: "Paris", is_correct: true },
      { label: "C", text: "Berlin", is_correct: false },
    ]
  }
];

try {
  const response = await assessmentService.bulkCreateQuestions(1, questions);
  console.log("Questions created:", response.data);
} catch (error) {
  console.error("Error:", error);
}
```

---

## Performance Considerations

1. **Batch Size**: Recommended maximum 50 questions per request
2. **Database Transactions**: Entire bulk operation is wrapped in a transaction to maintain data consistency
3. **Response Time**: Expected response time varies based on:
   - Number of questions
   - Number of options per question
   - Server load
   - Database performance

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid request data |
| 404 | Assessment not found | The assessment ID does not exist |
| 422 | Unprocessable Entity | Validation failed (see errors object) |
| 500 | Server error | Unexpected server error |

