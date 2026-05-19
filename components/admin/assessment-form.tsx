'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader } from 'lucide-react'
import { CreateAssessmentPayload, UpdateAssessmentPayload, AssessmentFormPayload } from '@/lib/types/assessment.types'

interface AssessmentFormProps {
  initialData?: UpdateAssessmentPayload & { slug?: string; title?: string; description?: string; time_limit?: number }
  isLoading?: boolean
  onSubmit: (data: AssessmentFormPayload) => Promise<void>
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export default function AssessmentForm({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
  mode = 'create',
}: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id,
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    time_limit: initialData?.time_limit || 30,
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedData = {
      ...{ [name]: name === 'time_limit' ? parseInt(value) || 0 : value },
    }

    // Auto-generate slug when title changes
    if (name === 'title') {
      updatedData.slug = generateSlug(value)
    }

    setFormData(prev => ({
      ...prev,
      ...updatedData,
    }))
    setError('')
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.title.trim()) {
      setError('Judul assessment tidak boleh kosong')
      return
    }

    if (!formData.slug.trim()) {
      setError('Slug tidak boleh kosong')
      return
    }

    if (!formData.description.trim()) {
      setError('Deskripsi tidak boleh kosong')
      return
    }

    if (formData.time_limit <= 0) {
      setError('Waktu limit harus lebih dari 0')
      return
    }

    try {
      const submitData =
        mode === 'edit'
          ? {
              id: formData.id!,
              title: formData.title,
              description: formData.description,
              time_limit: formData.time_limit,
              slug: formData.slug,
            }
          : {
              title: formData.title,
              slug: formData.slug,
              description: formData.description,
              time_limit: formData.time_limit,
            }

      await onSubmit(submitData)
      setSuccess(`Assessment berhasil ${mode === 'create' ? 'dibuat' : 'diperbarui'}!`)

      if (mode === 'create') {
        setFormData({
          id: undefined,
          title: '',
          slug: '',
          description: '',
          time_limit: 30,
        })
      }
    } catch (err: any) {
      setError(err?.message || `Gagal ${mode === 'create' ? 'membuat' : 'memperbarui'} assessment`)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
        <CardTitle>{mode === 'create' ? 'Tambah Assessment' : 'Edit Assessment'}</CardTitle>
        <CardDescription className="text-blue-100">
          {mode === 'create'
            ? 'Buat assessment baru untuk penilaian siswa'
            : 'Perbarui informasi assessment'}
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
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-gray-700">
              Judul Assessment
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Masukkan judul assessment"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">Contoh: Basic Math Quiz, General Knowledge Test</p>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-gray-700">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Masukkan deskripsi assessment"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">Jelaskan tujuan dan isi dari assessment</p>
          </div>

          {/* Waktu Limit */}
          <div className="space-y-2">
            <Label htmlFor="time_limit" className="font-semibold text-gray-700">
              Waktu Limit (Menit)
            </Label>
            <Input
              id="time_limit"
              name="time_limit"
              type="number"
              min="1"
              placeholder="30"
              value={formData.time_limit}
              onChange={handleInputChange}
              disabled={isLoading}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">Berapa menit waktu yang disediakan untuk mengerjakan</p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : mode === 'create' ? (
                'Buat Assessment'
              ) : (
                'Perbarui Assessment'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
