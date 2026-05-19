'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader, Trash2, Plus, Edit2 } from 'lucide-react'
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

interface QuestionFormProps {
  assessmentId?: number | string
  onQuestionAdded?: (question: Question) => void
}

export default function QuestionForm({ assessmentId, onQuestionAdded }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question: '',
  })

  const [options, setOptions] = useState<Option[]>([
    { label: 'A', text: '', is_correct: false },
  ])

  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      question: e.target.value,
    })
    setError('')
  }

  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...options]
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    }
    setOptions(updatedOptions)
  }

  const addOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const nextLabel = labels[options.length] || `${options.length + 1}`

    setOptions([
      ...options,
      {
        label: nextLabel,
        text: '',
        is_correct: false,
      },
    ])
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index))
    } else {
      toast.error('Minimal harus ada 1 jawaban')
    }
  }

  const validateForm = () => {
    if (!formData.question.trim()) {
      setError('Soal tidak boleh kosong')
      return false
    }

    if (options.some((opt) => !opt.text.trim())) {
      setError('Semua jawaban harus diisi')
      return false
    }

    if (!options.some((opt) => opt.is_correct)) {
      setError('Pilih minimal satu jawaban yang benar')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    if (!assessmentId) {
      setError('Assessment ID tidak ditemukan')
      return
    }

    setIsLoading(true)
    try {
      const response = await questionService.createQuestion(assessmentId, {
        question: formData.question,
      })

      if (response.success) {
        const questionId = response.data.id

        // Add options
        for (const option of options) {
          await optionService.createOption(questionId, {
            label: option.label,
            text: option.text,
            is_correct: option.is_correct,
          })
        }

        const newQuestion: Question = {
          id: questionId,
          question: formData.question,
          options: options,
          assessment_id: assessmentId,
        }

        setSuccess('Soal berhasil ditambahkan!')
        setFormData({ question: '' })
        setOptions([{ label: 'A', text: '', is_correct: false }])
        setEditingOptionIndex(null)

        if (onQuestionAdded) {
          onQuestionAdded(newQuestion)
        }

        setTimeout(() => {
          setSuccess('')
        }, 3000)
      }
    } catch (err: any) {
      console.error('Error adding question:', err)
      setError(
        err?.response?.data?.message || err?.message || 'Gagal menambahkan soal'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-l-4 border-l-blue-600">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Soal Baru
        </CardTitle>
        <CardDescription className="text-blue-100">
          Buat soal assessment dengan pilihan jawaban
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Soal */}
          <div className="space-y-2">
            <Label htmlFor="question" className="font-semibold text-gray-700">
              Soal
            </Label>
            <Textarea
              id="question"
              placeholder="Masukkan soal di sini"
              value={formData.question}
              onChange={handleQuestionChange}
              disabled={isLoading}
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              Jelaskan soal dengan detail dan jelas
            </p>
          </div>

          {/* Jawaban/Opsi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-gray-700">Pilihan Jawaban</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isLoading || options.length >= 6}
                className="border-blue-300 hover:bg-blue-50 text-blue-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Opsi
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full font-bold text-blue-600 flex-shrink-0">
                    {option.label}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Jawaban ${option.label}`}
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, 'text', e.target.value)
                      }
                      disabled={isLoading}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) =>
                          handleOptionChange(index, 'is_correct', e.target.checked)
                        }
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 font-medium">Benar</span>
                    </label>

                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={isLoading}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan Soal...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Simpan Soal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
