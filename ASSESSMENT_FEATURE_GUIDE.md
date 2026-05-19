# Assessment Feature - Complete Implementation Guide

## Overview
This document describes the complete Assessment feature implementation for SkillBytes Learning Platform. The feature allows users to take assessments, manage time, review answers, and track their performance.

## Project Structure

```
app/(siswa)/assesmen/
├── page.tsx                          # Assessment List (with pagination & search)
├── [slug]/
│   ├── page.tsx                      # Assessment Detail/Preview (NEEDS TO BE CREATED)
│   ├── quiz/
│   │   └── page.tsx                  # Main Quiz Taking Page (DONE)
│   ├── hasil/
│   │   └── page.tsx                  # Result/Score Page (DONE)
│   └── page-detail.tsx              # Template for detail page (can be copied to page.tsx)
└── results/
    ├── page.tsx                      # Riwayat/History Page (DONE)
    └── [attemptId]/
        └── page.tsx                  # Detail Review Page (DONE)

lib/
├── types/assessment.types.ts         # Assessment Types (UPDATED)
├── api-services.ts                   # API Services (UPDATED)

hooks/
├── use-assessment-timer.ts           # Timer Hook (DONE)
└── use-assessment-state.ts           # State Management Hook (DONE)

components/assesmen/
├── assessment-card.tsx               # Existing assessment card
├── timer-display.tsx                 # Timer Component (DONE)
├── question-progress.tsx             # Progress Component (DONE)
├── score-display.tsx                 # Score Display Component (DONE)
├── quiz-question.tsx                 # Quiz Question Component (DONE)
└── index.ts                          # Component Exports (UPDATED)
```

## API Endpoints Used

### Assessment List & Details
- `GET /assessments` - List all assessments with pagination
- `GET /assessments/{slug}` - Get assessment detail with questions

### Assessment Attempts
- `POST /assessments/{id}/start` - Start a new attempt
- `POST /assessments/{attemptId}/answers` - Submit an answer
- `POST /assessments/{attemptId}/finish` - Finish assessment and get score

### Results
- `GET /results` - Get all user's assessment results (with pagination)
- `GET /results/{attemptId}` - Get detailed result with all answers

## Key Features Implemented

### 1. Assessment List Page (`/assesmen`)
- Display all available assessments
- Search functionality
- Pagination support
- Shows: Title, Description, Time Limit, Total Questions
- Start Assessment button for each

### 2. Assessment Preview Page (`/assesmen/[slug]`)
- Shows full assessment details before starting
- Question preview (without showing correct answers)
- Time limit and total questions display
- Start button with warning about time commitment

### 3. Quiz/Assessment Page (`/assesmen/[slug]/quiz`)
- **Timer**: Real-time countdown with status indicators (normal, warning, critical)
- **Questions**: Display one or all questions (configurable)
- **Progress Bar**: Visual progress and answered counter
- **Status**: Shows which questions are answered/unanswered
- **Submit Answer**: Auto-submit with loading state for each answer
- **Question Navigator**: Grid showing all questions with status
- **Unanswered Warning**: Before submitting with unanswered questions
- **Auto-Finish**: When time runs out

### 4. Result/Score Page (`/assesmen/[slug]/hasil`)
- Large score display
- Score breakdown (correct/incorrect/unanswered)
- Percentage visualization
- Status indicator (COMPLETED/TIMEOUT)
- Button to view detailed answers
- Back buttons for navigation

### 5. Results History Page (`/assesmen/results`)
- Table of all user's assessment attempts
- Shows: Title, Score, Percentage, Status, Date
- Pagination support
- Link to view detailed review for each attempt

### 6. Review/Detail Page (`/assesmen/results/[attemptId]`)
- Shows all questions with:
  - User's selected answer (highlighted)
  - Correct answer (highlighted in green)
  - Status indicator (✓ Benar / ✗ Salah)
  - Explanation for wrong answers
- Full score breakdown

## State Management

### Hooks Created

#### `useAssessmentTimer`
```typescript
const timer = useAssessmentTimer({
  initialTimeLimit: 15,    // in minutes
  onTimeUp: async () => {} // callback when time expires
});

// Properties & Methods:
- timeRemaining: number (in seconds)
- isRunning: boolean
- isTimeUp: boolean
- formattedTime: string (MM:SS format)
- timeStatus: 'normal' | 'warning' | 'critical'
- pauseTimer(), resumeTimer(), resetTimer()
```

#### `useAssessmentState`
```typescript
const state = useAssessmentState({
  totalQuestions: 10
});

// Methods:
- selectAnswer(questionId, optionId)
- getAnswerForQuestion(questionId)
- isQuestionAnswered(questionId)
- areAllQuestionsAnswered()
- goToNextQuestion(), goToPreviousQuestion()
- jumpToQuestion(index)
- saveDraftToLocalStorage(attemptId)
- loadDraftFromLocalStorage(attemptId)
```

## API Response Types

### StartAssessmentResponse
```json
{
  "success": true,
  "data": {
    "attempt_id": 123,
    "assessment": {
      "id": 1,
      "title": "Assessment Title",
      "total_questions": 10,
      "time_limit": 30,
      "questions": [...]
    }
  }
}
```

### FinishAssessmentResponse
```json
{
  "success": true,
  "data": {
    "attempt_id": 123,
    "score": 80,
    "correct_answers": 8,
    "total_questions": 10,
    "percentage": 80,
    "status": "COMPLETED",
    "completed_at": "2026-05-19T..."
  }
}
```

### ResultDetail (Review Page)
```json
{
  "success": true,
  "data": {
    "attempt_id": 123,
    "assessment_title": "Assessment Title",
    "score": 80,
    "percentage": 80,
    "answers": [
      {
        "question_id": 1,
        "question_text": "What is...?",
        "selected_option_id": 2,
        "correct_option_id": 3,
        "is_correct": false,
        "options": [...]
      }
    ]
  }
}
```

## Error Handling

1. **Active Attempt Detection**
   - Check if user has IN_PROGRESS attempt before starting new one
   - Option to continue or create new attempt

2. **Time Expiration**
   - Auto-submit when timer reaches 0
   - Show TIMEOUT status in results

3. **Network Errors**
   - Show toast notification for failed answer submissions
   - Auto-retry functionality (optional)

4. **Answer Validation**
   - Prevent selecting same answer twice
   - Show error if question already answered

## LocalStorage Draft System

The app automatically saves draft answers to localStorage:
```javascript
localStorage.setItem(
  `assessment_draft_${attemptId}`,
  JSON.stringify({ answers: {...}, timestamp: "..." })
);
```

This provides backup recovery if connection is lost.

## Styling & Components

All pages use:
- Tailwind CSS for styling
- Lucide React icons
- Radix UI components (Button, Card, Progress, etc.)
- Responsive design (mobile, tablet, desktop)
- Gradient backgrounds and hover effects

## Next Steps to Finalize

### 1. Replace [slug]/page.tsx
Copy content from `page-detail.tsx` to `page.tsx` to use the new detail/preview page

### 2. Environment Variables
Ensure API URL is set:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Testing
Test the following flows:
- [ ] Start assessment and complete it
- [ ] Timeout handling
- [ ] View results and history
- [ ] Review detailed answers
- [ ] Navigation between pages

### 4. Optional Enhancements
- Add keyboard shortcuts for navigation
- Implement fullscreen mode for quiz
- Add bookmark/flag functionality for difficult questions
- Performance optimization (lazy load questions)
- Keyboard navigation (arrow keys for options)

## Important Notes

- The `is_correct` field from options is NOT displayed in quiz to maintain integrity
- Timer counts down in real-time and is accurate
- All answers are submitted individually to the backend
- Score calculation is done by the backend, not frontend
- Draft answers support provides failsafe recovery

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)

## Performance Considerations

- Questions are loaded all at once but displayed one at a time
- Answer submissions are async and non-blocking
- Timer uses efficient interval management
- localStorage is used for draft backup only

---

**Created**: May 19, 2026
**Version**: 1.0
**Status**: Ready for Testing
