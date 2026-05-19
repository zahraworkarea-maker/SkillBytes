'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader, Trash2, Plus, Edit2, X, Image as ImageIcon } from 'lucide-react'
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
  image_path?: string
}

interface QuestionFormProps {
  assessmentId?: number | string
  onQuestionAdded?: (question: Question) => void
}

export default function QuestionForm({ assessmentId, onQuestionAdded }: QuestionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    question: '',
    image: null as File | null,
    imagePreview: '' as string,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Harap pilih file gambar yang valid')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file gambar tidak boleh lebih dari 5MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result as string,
        })
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: '',
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      // Prepare question data with FormData if image exists
      let questionData: Record<string, any> = {
        question: formData.question,
      }

      let response
      
      if (formData.image) {
        // Use FormData for file upload
        const formDataObj = new FormData()
        formDataObj.append('question', formData.question)
        formDataObj.append('image', formData.image)
        
        response = await questionService.createQuestion(assessmentId, formDataObj)
      } else {
        // Use JSON for regular request
        response = await questionService.createQuestion(assessmentId, questionData)
      }

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
          image_path: response.data.image_path,
        }

        setSuccess('Soal berhasil ditambahkan!')
        setFormData({ question: '', image: null, imagePreview: '' })
        setOptions([{ label: 'A', text: '', is_correct: false }])
        setEditingOptionIndex(null)
        removeImage()

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

          {/* Upload Foto Soal */}
          <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="image-upload" className="font-semibold text-gray-700 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Foto Soal (Opsional)
            </Label>
            
            {!formData.imagePreview ? (
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Klik atau drag file untuk upload foto
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, WebP | Max: 5MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={formData.imagePreview}
                    alt="Preview soal"
                    className="max-h-64 max-w-full rounded-lg border border-blue-300 shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Ganti Foto
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
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
