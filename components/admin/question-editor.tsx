'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader, Trash2, Plus, ChevronUp, ChevronDown, X, Image as ImageIcon, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { assessmentService, optionService, questionService } from '@/lib/api-services'

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
  image?: File | null
  imagePreview?: string
  image_path?: string | null
}

interface QuestionEditorProps {
  assessmentId: number | string
  initialQuestions: any[]
}

export default function QuestionEditor({ assessmentId, initialQuestions }: QuestionEditorProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [questions, setQuestions] = useState<Question[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // To track deleted items so we can call the delete API
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Array<number | string>>([])
  const [deletedOptionIds, setDeletedOptionIds] = useState<Array<number | string>>([])

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const formatted = initialQuestions.map((q: any) => ({
        id: q.id,
        question: q.question || q.text || '',
        image_path: q.image_path,
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          label: o.label || '',
          text: o.text || '',
          is_correct: !!o.is_correct
        })),
        imagePreview: q.image_path ? (q.image_path.startsWith('http') ? q.image_path : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}/${q.image_path}`) : ''
      }))
      setQuestions(formatted)
      // Expand first question by default
      setExpandedQuestions(new Set([0]))
    } else {
      setQuestions([
        {
          question: '',
          options: [
            { label: 'A', text: '', is_correct: false },
            { label: 'B', text: '', is_correct: false },
          ],
        }
      ])
      setExpandedQuestions(new Set([0]))
    }
  }, [initialQuestions])

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].question = value
    setQuestions(updated)
  }

  const handleOptionChange = (qIndex: number, oIndex: number, field: string, value: string | boolean) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = {
      ...updated[qIndex].options[oIndex],
      [field]: value,
    }
    setQuestions(updated)
  }

  const addOption = (qIndex: number) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const currentOptions = questions[qIndex].options
    const nextLabel = labels[currentOptions.length] || `${currentOptions.length + 1}`

    const updated = [...questions]
    updated[qIndex].options.push({
      label: nextLabel,
      text: '',
      is_correct: false,
    })
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    const option = updated[qIndex].options[oIndex]
    
    if (updated[qIndex].options.length > 1) {
      if (option.id) {
        setDeletedOptionIds(prev => [...prev, option.id!])
      }
      updated[qIndex].options.splice(oIndex, 1)
      setQuestions(updated)
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
      },
    ])
    setExpandedQuestions(new Set([...expandedQuestions, questions.length]))
  }

  const removeQuestion = (qIndex: number) => {
    const question = questions[qIndex]
    if (questions.length > 1) {
      if (question.id) {
        setDeletedQuestionIds(prev => [...prev, question.id!])
      }
      setQuestions(questions.filter((_, i) => i !== qIndex))
      setExpandedQuestions(new Set([...expandedQuestions].filter(i => i !== qIndex)))
    } else {
      toast.error('Minimal harus ada 1 soal')
    }
  }

  const handleImageChange = (qIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Harap pilih file gambar yang valid')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file gambar tidak boleh lebih dari 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const updated = [...questions]
        updated[qIndex] = {
          ...updated[qIndex],
          image: file,
          imagePreview: reader.result as string,
        }
        setQuestions(updated)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (qIndex: number) => {
    const updated = [...questions]
    updated[qIndex] = {
      ...updated[qIndex],
      image: null,
      imagePreview: '',
      image_path: null // Mark as removed for backend if needed
    }
    setQuestions(updated)
    if (fileInputRefs.current[qIndex]) {
      fileInputRefs.current[qIndex]!.value = ''
    }
  }

  const toggleQuestionExpanded = (qIndex: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(qIndex)) {
      newExpanded.delete(qIndex)
    } else {
      newExpanded.add(qIndex)
    }
    setExpandedQuestions(newExpanded)
  }

  const validateForm = () => {
    const newErrors: string[] = []
    const newExpanded = new Set(expandedQuestions)

    questions.forEach((q, qIndex) => {
      let hasError = false;

      if (!q.question.trim() && !q.image && !q.imagePreview) {
        newErrors.push(`Soal ${qIndex + 1}: Pertanyaan atau foto tidak boleh kosong`)
        hasError = true;
      }

      q.options.forEach((opt) => {
        if (!opt.text.trim()) {
          newErrors.push(`Soal ${qIndex + 1}, Jawaban ${opt.label}: Teks jawaban tidak boleh kosong`)
          hasError = true;
        }
      })

      if (!q.options.some((opt) => opt.is_correct)) {
        newErrors.push(`Soal ${qIndex + 1}: Pilih minimal satu jawaban yang benar`)
        hasError = true;
      }

      if (hasError) {
        newExpanded.add(qIndex)
      }
    })

    if (newExpanded.size !== expandedQuestions.size) {
      setExpandedQuestions(newExpanded)
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Gagal menyimpan: terdapat error pada form')
      // Scroll ke atas agar user bisa melihat error
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSaving(true)
    try {
      // 1. Process deletions
      for (const optId of deletedOptionIds) {
        try { await optionService.deleteOption(optId) } catch (e) { console.error('Failed to delete option', optId) }
      }
      for (const qId of deletedQuestionIds) {
        try { await questionService.deleteQuestion(qId) } catch (e) { console.error('Failed to delete question', qId) }
      }

      // 2. Process saves
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        let questionId = q.id

        // Data for question
        let qData: any = {
          text: q.question, // Backend might expect text
          question: q.question, // Or question
        }
        
        let formData: FormData | null = null;
        if (q.image) {
          formData = new FormData()
          formData.append('text', q.question)
          formData.append('image', q.image)
        }

        if (questionId) {
          // Update existing question
          await questionService.updateQuestion(questionId, formData || qData)
        } else {
          // Create new question
          const res = await questionService.createQuestion(assessmentId, formData || qData)
          questionId = res.data?.id || res.id
        }

        // 3. Process options for this question
        if (questionId) {
          for (let o of q.options) {
            const optData = {
              label: o.label,
              text: o.text,
              is_correct: o.is_correct
            }
            if (o.id) {
              await optionService.updateOption(o.id, optData)
            } else {
              await optionService.createOption(questionId, optData)
            }
          }
        }
      }

      toast.success('Semua soal berhasil disimpan!')
      // Reset deleted trackers
      setDeletedOptionIds([])
      setDeletedQuestionIds([])
      
      // Reload page to get fresh data after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Error saving questions:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Gagal menyimpan soal')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Terdapat {errors.length} error:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="overflow-hidden">
            <CardHeader className="cursor-pointer bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 transition-colors"
              onClick={() => toggleQuestionExpanded(qIndex)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Soal {qIndex + 1}
                    {question.question && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        - {question.question.substring(0, 50)}
                        {question.question.length > 50 ? '...' : ''}
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {expandedQuestions.has(qIndex) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedQuestions.has(qIndex) && (
              <CardContent className="pt-6 space-y-4">
                {/* Question Text */}
                <div>
                  <Label className="font-semibold mb-2 block">Pertanyaan</Label>
                  <Textarea
                    placeholder="Masukkan pertanyaan..."
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" /> Foto Soal (Opsional)
                  </Label>
                  
                  {!question.imagePreview ? (
                    <div
                      className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => fileInputRefs.current[qIndex]?.click()}
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
                          onClick={() => removeImage(qIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[qIndex]?.click()}
                        className="border-blue-300 text-blue-600 block mt-2"
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  )}
                  <input
                    ref={(el) => { if (el) fileInputRefs.current[qIndex] = el }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(qIndex, e)}
                    className="hidden"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label className="font-semibold">Jawaban</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 min-w-6">{option.label}.</span>
                          <Input
                            placeholder={`Jawaban ${option.label}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={option.is_correct}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-600">Jawaban Benar</span>
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => addOption(qIndex)} className="w-full mt-2">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Jawaban
                  </Button>
                </div>

                <Button variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)} className="w-full mt-4" disabled={questions.length === 1}>
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Soal Ini
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        <Button onClick={addQuestion} variant="outline" className="w-full bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 border-blue-200">
          <Plus className="w-4 h-4 mr-2" /> Tambah Soal Baru
        </Button>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving || questions.length === 0}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all py-6 text-lg"
      >
        {isSaving ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" /> Menyimpan Perubahan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" /> Simpan Semua Perubahan Soal
          </>
        )}
      </Button>
    </div>
  )
}
