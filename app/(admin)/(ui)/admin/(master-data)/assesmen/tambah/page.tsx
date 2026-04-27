'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Trash2, Save, Copy } from 'lucide-react'
import { toast } from 'react-toastify'

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

interface AssessmentFormData {
  title: string
  description: string
  duration: string
  questions: Question[]
}

export default function AddAssessmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    duration: '',
    questions: [],
  })

  const optionLetters = ['a', 'b', 'c', 'd']

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correctAnswer: 'a',
      explanation: '',
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    })
  }

  const handleRemoveQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== questionId),
    })
    toast.info('Soal dihapus')
  }

  const handleDuplicateQuestion = (questionIndex: number) => {
    const questionToDuplicate = formData.questions[questionIndex]
    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now().toString(),
    }
    const newQuestions = [...formData.questions]
    newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion)
    setFormData({
      ...formData,
      questions: newQuestions,
    })
    toast.info('Soal diduplikasi')
  }

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text } : opt
              ),
            }
          : q
      ),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi
    if (!formData.title.trim()) {
      toast.error('Judul assesmen harus diisi')
      return
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error('Durasi harus lebih dari 0 menit')
      return
    }
    if (formData.questions.length === 0) {
      toast.error('Minimal harus ada 1 soal')
      return
    }

    // Validasi setiap soal
    for (const question of formData.questions) {
      if (!question.question.trim()) {
        toast.error('Semua soal harus terisi')
        return
      }
      if (question.options.some((opt) => !opt.text.trim())) {
        toast.error('Semua opsi jawaban harus terisi')
        return
      }
    }

    // Siapkan data untuk disimpan
    const assessmentData = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      totalQuestions: formData.questions.length,
      timeLimit: parseInt(formData.duration),
      questions: formData.questions,
    }

    // Simpan ke localStorage atau kirim ke server
    const existingAssessments = JSON.parse(localStorage.getItem('assessments') || '[]')
    existingAssessments.push(assessmentData)
    localStorage.setItem('assessments', JSON.stringify(existingAssessments))

    toast.success('Assesmen berhasil ditambahkan!')
    router.push('/admin/master-data/assesmen')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-25 p-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Tambah Assesmen Baru
            </h1>
            <p className="text-gray-600 mt-1">Buat assesmen dengan soal dan kunci jawaban</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assessment Details Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-linear-to-r from-blue-50 to-blue-25 border-b-2 border-blue-200">
              <CardTitle className="text-blue-900">Informasi Assesmen</CardTitle>
              <CardDescription>Isi detail assesmen yang akan dibuat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                  Judul Assesmen <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: Konsep Class dan Object"
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 py-2.5"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan tujuan dan isi assesmen ini..."
                  rows={3}
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base font-semibold text-gray-700">
                  Durasi <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="30"
                    className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 max-w-xs py-2.5"
                  />
                  <span className="text-gray-600 font-medium">menit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Soal-Soal Assesmen</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {formData.questions.length} Soal
              </span>
            </div>

            {formData.questions.length === 0 ? (
              <Card className="border-2 border-dashed border-blue-300 bg-blue-25">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600 mb-4 text-center">
                    Belum ada soal. Klik tombol di bawah untuk menambah soal pertama.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {formData.questions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="bg-linear-to-r from-blue-50 to-blue-25 border-b-2 border-blue-200 pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-900">
                          Soal #{index + 1}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleDuplicateQuestion(index)}
                            variant="outline"
                            size="sm"
                            className="border-green-300 hover:bg-green-50 text-green-600 hover:text-green-700"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplikasi
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleRemoveQuestion(question.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                      {/* Question Text */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">
                          Pertanyaan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          placeholder="Masukkan pertanyaan soal..."
                          rows={2}
                          className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                        />
                      </div>

                      <Separator className="my-4" />

                      {/* Options */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold text-gray-700">
                            Opsi Jawaban <span className="text-red-500">*</span>
                          </Label>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Pilih kunci jawaban dengan tombol radio
                          </span>
                        </div>

                        <RadioGroup
                          value={question.correctAnswer}
                          onValueChange={(value) =>
                            updateQuestion(question.id, {
                              correctAnswer: value,
                            })
                          }
                        >
                          <div className="space-y-3">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.id}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-25 transition-colors"
                              >
                                <RadioGroupItem
                                  value={option.id}
                                  id={`option-${question.id}-${option.id}`}
                                  className="mt-3 cursor-pointer border-2 border-gray-700"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Label
                                      htmlFor={`option-${question.id}-${option.id}`}
                                      className="font-bold text-gray-700 uppercase cursor-pointer"
                                    >
                                      {optionLetters[optIndex]}.
                                    </Label>
                                  </div>
                                  <Input
                                    value={option.text}
                                    onChange={(e) =>
                                      updateOption(
                                        question.id,
                                        option.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Masukkan opsi jawaban ${optionLetters[optIndex].toUpperCase()}...`}
                                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <Separator className="my-4" />

                      {/* Explanation */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">
                          Penjelasan Jawaban (Opsional)
                        </Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              explanation: e.target.value,
                            })
                          }
                          placeholder="Berikan penjelasan mengapa jawaban ini benar..."
                          rows={2}
                          className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Question Button */}
            <Button
              type="button"
              onClick={handleAddQuestion}
              className="w-full mt-6 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Soal
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end sticky bottom-6">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="px-8 py-2.5 border-2 border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="px-8 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Simpan Assesmen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
