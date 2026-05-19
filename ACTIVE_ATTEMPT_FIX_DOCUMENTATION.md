# Active Attempt Fix & Flow Optimization - Documentation

## Problems Identified

### Problem 1: Multiple `/start` API Calls
**Issue**: `POST /start` endpoint called multiple times unnecessarily
**Cause**: 
- React Strict Mode in development runs useEffect twice
- No mechanism to prevent re-initialization on page re-renders
- No abort controller to cancel previous requests

**Solution**: 
- Add `useRef` to track if initialization was already attempted
- Skip initialization if already in progress
- Add AbortController for cleanup

### Problem 2: Incorrect Results Fetch Flow
**Issue**: `GET /results` called immediately on page load instead of after assessment completion
**Correct Flow**: 
```
Load page → Try POST /start → Get assessment → User answers questions 
→ POST /finish (this returns score) → Redirect to results page
```

### Problem 3: No Logging/Debugging
**Issue**: Hard to trace what API calls are happening
**Solution**: Add console logs with emojis for easy tracking

---

## Solutions Implemented

### 1. **Prevent Multiple Initialization** ✅
Added `useRef` to track initialization state:
```typescript
const initializationAttempted = useRef(false);
const abortController = useRef<AbortController | null>(null);

useEffect(() => {
  // Prevent multiple initializations
  if (initializationAttempted.current) {
    console.log('⚠️ Initialization already attempted, skipping...');
    return;
  }
  initializationAttempted.current = true;
  
  // ... rest of initialization
  
  return () => {
    // Cleanup on unmount
    controller.abort();
  };
}, [slug]);
```

### 2. **Clear Step-by-Step Flow** ✅
Breaking down initialization into clear steps with logging:

```typescript
// Step 1: Fetch assessment detail
console.log('📖 Fetching assessment detail...');
const assessmentRes = await assessmentService.getAssessmentBySlug(slug);

// Step 2: Try to start NEW attempt
console.log('🚀 Attempting to start new assessment attempt...');
const attemptRes = await assessmentAttemptService.startAssessment(assessmentData.id);

// Step 3: If error 400, get existing attempt
if (error 400 "already has an active attempt") {
  console.log('⏸️ Active attempt already exists, retrieving it...');
  const activeAttemptRes = await assessmentAttemptService.getActiveAttempt(assessmentData.id);
}

// Step 4: Set state
setAttemptId(attemptId);
```

### 3. **Correct Answer Submission Flow** ✅
Simplified and clarified:
```typescript
// Update UI immediately
assessmentState.selectAnswer(currentQuestion.id, optionId);
console.log(`📝 Answer selected for question ${currentQuestion.id}`);

// Submit to backend asynchronously
await assessmentAttemptService.submitAnswer(...);
console.log(`✅ Answer submitted for question ${currentQuestion.id}`);
```

### 4. **Correct Finish/Results Flow** ✅
```typescript
// POST /finish - submit assessment and get score in response
const response = await assessmentAttemptService.finishAssessment(attemptId);
// Response already contains: { score, correct_answers, total_questions, ... }

// Navigate to results - NO need for GET /results
router.push(`/assesmen/${slug}/hasil?attemptId=${attemptId}`);
```

---

## API Call Sequence (Correct Flow)

### Initial Load:
```
1. ✅ GET /assessments?slug=X - Get assessment details
2. ✅ POST /assessments/X/start - Create NEW attempt
   OR
   (if 400 error) GET /assessments/X/attempt - Get EXISTING attempt
```

### User Answering Questions:
```
3. ✅ POST /assessments/{attemptId}/answers - Submit answer for Q1
4. ✅ POST /assessments/{attemptId}/answers - Submit answer for Q2
5. ✅ POST /assessments/{attemptId}/answers - Submit answer for Q3
... (repeat for each question)
```

### User Finishes Assessment:
```
N. ✅ POST /assessments/{attemptId}/finish - Submit & get score
   Response: { score, correct_answers, total_questions, percentage, ... }

M. ✅ Redirect to /assesmen/[slug]/hasil?attemptId=X
   (Results page can use attemptId to fetch detailed results if needed)
```

### What Should NOT Happen:
```
❌ Multiple POST /start calls
❌ GET /results on page load
❌ GET /results before POST /finish
```

---

## Files Modified

### 1. **app/(siswa)/assesmen/[slug]/quiz/page.tsx**

**Changes**:
- ✅ Added `useRef` for initialization tracking
- ✅ Added AbortController for cleanup
- ✅ Prevent re-initialization with `initializationAttempted.current`
- ✅ Clear step-by-step logging with emojis
- ✅ Removed unnecessary `assessmentResultService` import
- ✅ Improved error handling messages

**Key Code**:
```typescript
// Prevent multiple initializations
const initializationAttempted = useRef(false);
const abortController = useRef<AbortController | null>(null);

useEffect(() => {
  if (initializationAttempted.current) return;
  initializationAttempted.current = true;
  
  const controller = new AbortController();
  abortController.current = controller;
  
  // ... initialization logic
  
  return () => controller.abort(); // Cleanup
}, [slug]);
```

---

## Testing Flow

### Test 1: Fresh Assessment Start
```
1. Navigate to /assesmen/[slug]/quiz
2. Check console logs (should see: 📖 → 🚀 → ✅)
3. Should see ONE POST /start call
4. Assessment should load successfully
```

### Test 2: Resume After Refresh
```
1. Start assessment, answer 1-2 questions
2. Refresh page (F5)
3. Check console logs (should see: 🚀 → ⏸️ → ✅)
4. Should see POST /start attempt THEN GET /attempt (no error shown to user)
5. Previous answers should be loaded
6. Notification "Melanjutkan attempt sebelumnya" should show
```

### Test 3: Answer All and Finish
```
1. Answer all questions
2. Click "Selesaikan Assessment"
3. Check console logs (should see: 🏁 → ✅)
4. Should see ONE POST /finish call
5. Results page should load immediately
6. NO GET /results call should be made by quiz page
```

### Test 4: Network DevTools
Open DevTools → Network tab to verify:
- [ ] One-time POST /start (or fallback to GET /attempt)
- [ ] Multiple POST /answers (one per question answered)
- [ ] One POST /finish
- [ ] One or two GET requests for assessment & assessment detail
- [ ] NO multiple POST /start calls
- [ ] NO unexpected GET /results from quiz page

---

## Console Logs - What to Expect

### Fresh Start:
```
🔄 Starting initialization for slug: my-assessment-slug
📖 Fetching assessment detail...
✅ Assessment loaded: 1 My Assessment Title
🚀 Attempting to start new assessment attempt...
✅ New attempt created, ID: 123
✅ Initialization complete. Attempt ID: 123, Resumed: false
```

### Resume After Refresh:
```
⚠️ Initialization already attempted, skipping...
(or if page actually reloads:)
🔄 Starting initialization for slug: my-assessment-slug
📖 Fetching assessment detail...
✅ Assessment loaded: 1 My Assessment Title
🚀 Attempting to start new assessment attempt...
⏸️ Active attempt already exists, retrieving it...
✅ Retrieved existing attempt, ID: 123
✅ Initialization complete. Attempt ID: 123, Resumed: true
```

### Answer Selection:
```
📝 Answer selected for question 1: option 4
✅ Answer submitted for question 1
📝 Answer selected for question 2: option 2
✅ Answer submitted for question 2
...
```

### Finish Assessment:
```
🏁 Finishing assessment, attempt ID: 123
✅ Assessment finished, response: { score: 80, ... }
✅ Score received: { score: 80, correct_answers: 4, ... }
```

---

## Common Issues & Solutions

### Issue: Still seeing multiple POST /start calls
**Solution**:
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check DevTools Network tab (not just console)
- Verify AbortController is working in cleanup

### Issue: GET /results still appearing  
**Solution**:
- This should come from results page, NOT quiz page
- Check `hasil` page component
- Verify POST /finish is completing successfully

### Issue: Answers not being submitted
**Solution**:
- Check if POST /answers is actually being called
- Verify attemptId is set correctly
- Check network errors in DevTools

### Issue: Seeing "Initialization already attempted" but page not loading
**Solution**:
- First time load: page might be using cache
- Hard refresh or clear cache
- Check if slug parameter is changing

---

## Recommendations for Future

1. **Add Session Storage Recovery**
   - Save answers to localStorage during quiz
   - Recover from localStorage if page crashes
   - Show "Your draft was recovered" notification

2. **Add Timeout Handling**
   - If assessment times out, auto-submit
   - Show countdown before submission
   - Handle incomplete submissions gracefully

3. **Add Online/Offline Detection**
   - Detect when connection is lost
   - Queue answers for submission when online
   - Show connection status to user

4. **Add Request Retries**
   - Retry failed answer submissions
   - Exponential backoff for retries
   - Max 3 retries before showing error

5. **Add Analytics/Tracking**
   - Track attempt duration
   - Track answer time per question
   - Track number of revisions per answer

