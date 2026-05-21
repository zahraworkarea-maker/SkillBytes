'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { assessmentService } from '@/lib/api-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader, Trash2, Plus, ChevronUp, ChevronDown, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-toastify'

interface Option {
  label: string
  text: string
  is_correct: boolean
}

interface Question {
  question: string
  options: Option[]
  image?: File | null
  imagePreview?: string
}

export default function BulkQuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentSlug = params.slug as string
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const [assessment, setAssessment] = useState<any>(null)
  const [assessmentId, setAssessmentId] = useState<number | string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      options: [
        { label: 'A', text: '', is_correct: false },
        { label: 'B', text: '', is_correct: false },
      ],
      image: null,
      imagePreview: '',
    },
  ])

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0]))
  const [errors, setErrors] = useState<string[]>([])

  // Fetch assessment details
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await assessmentService.getAssessmentById(assessmentSlug)
        setAssessment(response.data || response)
        setAssessmentId(response.data?.id || response.id)
      } catch (error) {
        console.error('Error fetching assessment:', error)
        toast.error('Gagal memuat assessment')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [assessmentSlug])

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].question = value
    setQuestions(updatedQuestions)
  }

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const addOption = (questionIndex: number) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const currentOptions = questions[questionIndex].options
    const nextLabel = labels[currentOptions.length] || `${currentOptions.length + 1}`

    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.push({
      label: nextLabel,
      text: '',
      is_correct: false,
    })
    setQuestions(updatedQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    if (updatedQuestions[questionIndex].options.length > 1) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1)
      setQuestions(updatedQuestions)
    } else {
      toast.error('Minimal harus ada 1 jawaban')
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { label: 'A', text: '', is_correct: false },
          { label: 'B', text: '', is_correct: false },
        ],
        image: null,
        imagePreview: '',
      },
    ])
    setExpandedQuestions(new Set([...expandedQuestions, questions.length]))
  }

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== questionIndex))
      setExpandedQuestions(new Set([...expandedQuestions].filter(i => i !== questionIndex)))
    } else {
      toast.error('Minimal harus ada 1 soal')
    }
  }

  const handleImageChange = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Harap pilih file gambar yang valid')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file gambar tidak boleh lebih dari 5MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          image: file,
          imagePreview: reader.result as string,
        }
        setQuestions(updatedQuestions)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      image: null,
      imagePreview: '',
    }
    setQuestions(updatedQuestions)
    if (fileInputRefs.current[questionIndex]) {
      fileInputRefs.current[questionIndex]!.value = ''
    }
  }

  const toggleQuestionExpanded = (questionIndex: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex)
    } else {
      newExpanded.add(questionIndex)
    }
    setExpandedQuestions(newExpanded)
  }

  const validateForm = () => {
    const newErrors: string[] = []

    questions.forEach((q, qIndex) => {
      if (!q.question.trim()) {
        newErrors.push(`Soal ${qIndex + 1}: Pertanyaan tidak boleh kosong`)
      }

      q.options.forEach((opt, oIndex) => {
        if (!opt.text.trim()) {
          newErrors.push(`Soal ${qIndex + 1}, Jawaban ${opt.label}: Teks jawaban tidak boleh kosong`)
        }
      })

      if (!q.options.some((opt) => opt.is_correct)) {
        newErrors.push(`Soal ${qIndex + 1}: Pilih minimal satu jawaban yang benar`)
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!assessmentId) {
      toast.error('Assessment ID tidak ditemukan')
      return
    }

    setIsSaving(true)
    try {
      const response = await assessmentService.bulkCreateQuestions(assessmentId, questions)

      if (response.success) {
        toast.success(`${questions.length} soal berhasil dibuat!`)
        setTimeout(() => {
          router.push('/admin/assesmen')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error creating questions:', error)
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Gagal membuat soal'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/assesmen')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 w-8 h-8" />
          <p className="text-gray-600">Memuat assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
          Tambah Soal & Jawaban
        </h1>
        <p className="text-gray-600">Tambahkan soal dan jawaban untuk assessment ini</p>
      </div>

      {/* Assessment Summary */}
      {assessment && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-600 mb-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h2>
          <p className="text-gray-600 mb-3">{assessment.description}</p>
          <div className="flex gap-4 text-sm flex-wrap">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              Waktu Limit: {assessment.time_limit-5} Menit
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
              Jumlah Soal: {questions.length}
            </span>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6 max-w-4xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Terdapat {errors.length} error:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Questions */}
      <div className="space-y-4 max-w-4xl mb-8">
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="overflow-hidden">
            <CardHeader className="cursor-pointer bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 transition-colors"
              onClick={() => toggleQuestionExpanded(questionIndex)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Soal {questionIndex + 1}
                    {question.question && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        - {question.question.substring(0, 50)}
                        {question.question.length > 50 ? '...' : ''}
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {expandedQuestions.has(questionIndex) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedQuestions.has(questionIndex) && (
              <CardContent className="pt-6 space-y-4">
                {/* Question Text */}
                <div>
                  <Label htmlFor={`question-${questionIndex}`} className="font-semibold mb-2 block">
                    Pertanyaan
                  </Label>
                  <Textarea
                    id={`question-${questionIndex}`}
                    placeholder="Masukkan pertanyaan..."
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    Foto Soal (Opsional)
                  </Label>
                  
                  {!question.imagePreview ? (
                    <div
                      className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => fileInputRefs.current[questionIndex]?.click()}
                    >
                      <ImageIcon className="h-8 w-8 text-blue-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Klik untuk upload foto</p>
                      <p className="text-xs text-gray-500">Max: 5MB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <img
                          src={question.imagePreview}
                          alt="Preview"
                          className="max-h-40 rounded-lg border border-blue-300"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(questionIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[questionIndex]?.click()}
                        className="border-blue-300 text-blue-600"
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  )}
                  
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current[questionIndex] = el
                    }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(questionIndex, e)}
                    className="hidden"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label className="font-semibold">Jawaban</Label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 min-w-6">
                            {option.label}.
                          </span>
                          <Input
                            placeholder={`Jawaban ${option.label}`}
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={option.is_correct}
                            onChange={(e) =>
                              handleOptionChange(questionIndex, optionIndex, 'is_correct', e.target.checked)
                            }
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-600">Jawaban Benar</span>
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Option Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(questionIndex)}
                    className="w-full mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jawaban
                  </Button>
                </div>

                {/* Remove Question Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(questionIndex)}
                  className="w-full mt-4"
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Soal Ini
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Add Question Button */}
        <Button
          onClick={addQuestion}
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 border-blue-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Soal Baru
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 max-w-4xl">
        <Button
          onClick={handleSubmit}
          disabled={isSaving || questions.length === 0}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Simpan {questions.length} Soal
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          Batal
        </Button>
      </div>
    </div>
  )
}
