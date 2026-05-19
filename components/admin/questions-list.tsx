'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react'
import { questionService, optionService } from '@/lib/api-services'
import { toast } from 'react-toastify'

interface Option {
  id?: number | string
  label: string
  text: string
  is_correct: boolean
}

interface Question {
  id?: number | string
  question: string
  options: Option[]
  assessment_id?: number | string
}

interface QuestionsListProps {
  questions: Question[]
  onQuestionDeleted?: (questionId: number | string) => void
  onQuestionsUpdate?: (questions: Question[]) => void
}

export default function QuestionsList({
  questions,
  onQuestionDeleted,
  onQuestionsUpdate,
}: QuestionsListProps) {
  const [expandedId, setExpandedId] = useState<number | string | null>(null)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)

  const handleDelete = async (questionId: number | string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      setDeletingId(questionId)
      try {
        const response = await questionService.deleteQuestion(questionId)
        if (response.success) {
          toast.success('Soal berhasil dihapus')
          if (onQuestionDeleted) {
            onQuestionDeleted(questionId)
          }
        }
      } catch (error: any) {
        console.error('Error deleting question:', error)
        toast.error('Gagal menghapus soal')
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (!questions || questions.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Belum ada soal. Silakan tambahkan soal baru di bawah.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Daftar Soal ({questions.length})
            </CardTitle>
            <CardDescription className="text-purple-100">
              Soal-soal yang telah ditambahkan
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {questions.map((question, questionIndex) => (
            <div
              key={question.id || questionIndex}
              className="transition-colors hover:bg-gray-50"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === question.id ? null : question.id
                        )
                      }
                      className="flex items-start gap-3 w-full text-left hover:opacity-70 transition-opacity"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold flex-shrink-0 text-sm">
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {question.question}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {question.options?.length || 0} pilihan jawaban
                        </p>
                      </div>
                      {expandedId === question.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingId === question.id}
                      onClick={() => handleDelete(question.id)}
                      className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Options */}
                {expandedId === question.id && (
                  <div className="mt-4 ml-11 space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Pilihan Jawaban:
                    </p>
                    {question.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                          option.is_correct
                            ? 'bg-green-50 border-l-green-500'
                            : 'bg-gray-50 border-l-gray-300'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm flex-shrink-0 ${
                            option.is_correct
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {option.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 break-words">
                            {option.text}
                          </p>
                        </div>
                        {option.is_correct && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold flex-shrink-0">
                            <CheckCircle className="h-3 w-3" />
                            Benar
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
