# Question & Option Services - Integration Guide

## Overview
Panduan lengkap untuk menggunakan Question dan Option services dalam mengembangkan fitur management untuk questions dan options di assessment.

## Services Overview

### Question Service Methods

```typescript
// Create question
questionService.createQuestion(assessmentId: number | string, data: Record<string, any>)

// Get question by ID
questionService.getQuestionById(id: number | string)

// Update question
questionService.updateQuestion(id: number | string, data: Record<string, any>)

// Delete question
questionService.deleteQuestion(id: number | string)
```

### Option Service Methods

```typescript
// Create option
optionService.createOption(questionId: number | string, data: Record<string, any>)

// Get option by ID
optionService.getOptionById(id: number | string)

// Get all options for question
optionService.getOptionsByQuestion(questionId: number | string)

// Update option
optionService.updateOption(id: number | string, data: Record<string, any>)

// Delete option
optionService.deleteOption(id: number | string)
```

## Example 1: Create Complete Assessment with Questions and Options

```typescript
import { assessmentService, questionService, optionService } from '@/lib/api-services'
import { toast } from 'react-toastify'

// Step 1: Create Assessment
const assessmentData = {
  title: 'Basic Math Quiz',
  slug: 'basic-math-quiz',
  description: 'A simple quiz to test your basic math skills',
  time_limit: 30
}

const assessmentResponse = await assessmentService.createAssessment(assessmentData)
const assessmentId = assessmentResponse.data.id

// Step 2: Create Question 1
const question1Data = {
  question: 'What is 2 + 2?'
}

const question1Response = await questionService.createQuestion(assessmentId, question1Data)
const question1Id = question1Response.data.id

// Step 3: Create Options for Question 1
const options1 = [
  { label: 'a', text: '3', is_correct: false },
  { label: 'b', text: '4', is_correct: true },
  { label: 'c', text: '5', is_correct: false },
  { label: 'd', text: '6', is_correct: false }
]

for (const optionData of options1) {
  await optionService.createOption(question1Id, optionData)
}

// Step 4: Create Question 2
const question2Data = {
  question: 'What is 5 + 3?'
}

const question2Response = await questionService.createQuestion(assessmentId, question2Data)
const question2Id = question2Response.data.id

// Step 5: Create Options for Question 2
const options2 = [
  { label: 'a', text: '7', is_correct: false },
  { label: 'b', text: '8', is_correct: true },
  { label: 'c', text: '9', is_correct: false },
  { label: 'd', text: '10', is_correct: false }
]

for (const optionData of options2) {
  await optionService.createOption(question2Id, optionData)
}

toast.success('Assessment with questions and options created successfully!')
```

## Example 2: Fetch Assessment and Display Questions

```typescript
import { assessmentService } from '@/lib/api-services'

// Get assessment with all questions and options
const response = await assessmentService.getAssessmentBySlug('basic-math-quiz')

const assessment = response.data

// Display assessment info
console.log(`Title: ${assessment.title}`)
console.log(`Time Limit: ${assessment.time_limit} minutes`)
console.log(`Total Questions: ${assessment.total_questions}`)

// Loop through questions and options
assessment.questions.forEach((question, qIndex) => {
  console.log(`\nQuestion ${qIndex + 1}: ${question.question}`)
  
  question.options.forEach(option => {
    console.log(`  ${option.label}. ${option.text}`)
  })
})
```

## Example 3: Update Question

```typescript
import { questionService } from '@/lib/api-services'
import { toast } from 'react-toastify'

try {
  const questionId = 10
  const updatedData = {
    question: 'What is 3 + 3?' // Updated question text
  }
  
  const response = await questionService.updateQuestion(questionId, updatedData)
  
  if (response.success) {
    toast.success('Question updated successfully!')
  }
} catch (error) {
  console.error('Error updating question:', error)
  toast.error('Failed to update question')
}
```

## Example 4: Update Option

```typescript
import { optionService } from '@/lib/api-services'
import { toast } from 'react-toastify'

try {
  const optionId = 14 // The "Jakarta" option
  const updatedData = {
    label: 'b',
    text: 'Jakarta (Capital of Indonesia)',
    is_correct: true
  }
  
  const response = await optionService.updateOption(optionId, updatedData)
  
  if (response.success) {
    toast.success('Option updated successfully!')
  }
} catch (error) {
  console.error('Error updating option:', error)
  toast.error('Failed to update option')
}
```

## Example 5: Delete Question and Its Options

```typescript
import { questionService, optionService } from '@/lib/api-services'
import { toast } from 'react-toastify'

try {
  const questionId = 10
  
  // Get all options for the question first (optional, for logging)
  const optionsResponse = await optionService.getOptionsByQuestion(questionId)
  
  // Delete each option
  for (const option of optionsResponse.data) {
    await optionService.deleteOption(option.id)
  }
  
  // Delete the question
  const response = await questionService.deleteQuestion(questionId)
  
  if (response.success) {
    toast.success('Question and all its options deleted successfully!')
  }
} catch (error) {
  console.error('Error deleting question:', error)
  toast.error('Failed to delete question')
}
```

## Example 6: React Component - Question Manager

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { questionService, optionService } from '@/lib/api-services'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function QuestionManager({ assessmentId }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [newQuestionText, setNewQuestionText] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [assessmentId])

  const loadQuestions = async () => {
    try {
      // Fetch assessment with questions
      const response = await assessmentService.getAssessmentById(assessmentId)
      setQuestions(response.data.questions || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      toast.error('Question text cannot be empty')
      return
    }

    try {
      const response = await questionService.createQuestion(assessmentId, {
        question: newQuestionText
      })

      if (response.success) {
        setQuestions([...questions, response.data])
        setNewQuestionText('')
        toast.success('Question added successfully!')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Failed to add question')
    }
  }

  const handleUpdateQuestion = async (questionId, updatedText) => {
    try {
      const response = await questionService.updateQuestion(questionId, {
        question: updatedText
      })

      if (response.success) {
        setQuestions(
          questions.map(q =>
            q.id === questionId ? { ...q, question: updatedText } : q
          )
        )
        setEditingQuestion(null)
        toast.success('Question updated successfully!')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Failed to update question')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    try {
      await questionService.deleteQuestion(questionId)
      setQuestions(questions.filter(q => q.id !== questionId))
      toast.success('Question deleted successfully!')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  if (loading) {
    return <div>Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Enter new question..."
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAddQuestion()
          }}
        />
        <Button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">
                Question {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {editingQuestion?.id === question.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingQuestion.text}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        text: e.target.value
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleUpdateQuestion(question.id, editingQuestion.text)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingQuestion(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4">{question.question}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingQuestion({
                          id: question.id,
                          text: question.question
                        })
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Display Options */}
              {question.options && (
                <div className="mt-4 pl-4 border-l-2 border-blue-200">
                  <p className="font-semibold mb-2">Options:</p>
                  <ul className="space-y-1">
                    {question.options.map((option) => (
                      <li key={option.id}>
                        <span className="font-medium">{option.label}.</span> {option.text}
                        {option.is_correct && (
                          <span className="ml-2 text-green-600 font-semibold">
                            ✓ Correct
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## Example 7: React Component - Option Manager

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { optionService } from '@/lib/api-services'
import { Trash2, Plus } from 'lucide-react'

export default function OptionManager({ questionId, initialOptions = [] }) {
  const [options, setOptions] = useState(initialOptions)
  const [newOption, setNewOption] = useState({
    label: '',
    text: '',
    is_correct: false
  })

  const handleAddOption = async () => {
    if (!newOption.label.trim() || !newOption.text.trim()) {
      toast.error('Label and text cannot be empty')
      return
    }

    try {
      const response = await optionService.createOption(questionId, newOption)

      if (response.success) {
        setOptions([...options, response.data])
        setNewOption({ label: '', text: '', is_correct: false })
        toast.success('Option added successfully!')
      }
    } catch (error) {
      console.error('Error adding option:', error)
      toast.error('Failed to add option')
    }
  }

  const handleUpdateOption = async (optionId, updatedData) => {
    try {
      const response = await optionService.updateOption(optionId, updatedData)

      if (response.success) {
        setOptions(
          options.map(opt =>
            opt.id === optionId ? { ...opt, ...updatedData } : opt
          )
        )
        toast.success('Option updated successfully!')
      }
    } catch (error) {
      console.error('Error updating option:', error)
      toast.error('Failed to update option')
    }
  }

  const handleDeleteOption = async (optionId) => {
    try {
      await optionService.deleteOption(optionId)
      setOptions(options.filter(opt => opt.id !== optionId))
      toast.success('Option deleted successfully!')
    } catch (error) {
      console.error('Error deleting option:', error)
      toast.error('Failed to delete option')
    }
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle>Options</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Add New Option */}
        <div className="space-y-2 p-4 bg-blue-25 rounded-lg">
          <p className="font-semibold text-sm">Add New Option</p>
          <div className="space-y-2">
            <Input
              placeholder="Label (A, B, C, D)"
              value={newOption.label}
              onChange={(e) =>
                setNewOption({ ...newOption, label: e.target.value })
              }
              maxLength="1"
            />
            <Input
              placeholder="Option text"
              value={newOption.text}
              onChange={(e) =>
                setNewOption({ ...newOption, text: e.target.value })
              }
            />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newOption.is_correct}
                onCheckedChange={(checked) =>
                  setNewOption({ ...newOption, is_correct: checked as boolean })
                }
              />
              <label className="text-sm">Mark as correct answer</label>
            </div>
            <Button
              onClick={handleAddOption}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
        </div>

        {/* List Options */}
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
            >
              <span className="font-bold min-w-8">{option.label}.</span>
              <span className="flex-1">{option.text}</span>
              {option.is_correct && (
                <span className="text-green-600 font-semibold text-sm">
                  ✓ Correct
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteOption(option.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Common Patterns

### Pattern 1: CRUD with Loading and Error States

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleOperation = async (operation) => {
  setLoading(true)
  setError('')
  try {
    const result = await operation()
    toast.success('Operation successful!')
    return result
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Operation failed'
    setError(errorMessage)
    toast.error(errorMessage)
  } finally {
    setLoading(false)
  }
}
```

### Pattern 2: Batch Operations

```typescript
// Create multiple options at once
const createOptionsInBatch = async (questionId, optionsArray) => {
  try {
    const promises = optionsArray.map(optionData =>
      optionService.createOption(questionId, optionData)
    )
    const results = await Promise.all(promises)
    toast.success(`${results.length} options created successfully!`)
    return results
  } catch (error) {
    toast.error('Failed to create some options')
    throw error
  }
}
```

### Pattern 3: Error Handling

```typescript
try {
  // Operation
} catch (error: any) {
  const message = error?.response?.data?.message || 
                  error?.response?.data?.errors || 
                  error?.message || 
                  'An unknown error occurred'
  console.error('Detailed error:', error)
  toast.error(typeof message === 'string' ? message : JSON.stringify(message))
}
```

## Best Practices

1. **Always validate before submitting**
   - Check required fields
   - Validate data format
   - Show user feedback

2. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log detailed errors for debugging
   - Provide recovery options

3. **Use TypeScript**
   - Define interfaces for data
   - Type function parameters
   - Use strict typing

4. **Optimize API calls**
   - Batch operations when possible
   - Cache data appropriately
   - Debounce search/filter operations

5. **Provide user feedback**
   - Show loading states
   - Use toast notifications
   - Confirm destructive actions
