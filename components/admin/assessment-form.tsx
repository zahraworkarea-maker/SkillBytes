'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader } from 'lucide-react'
import { CreateAssessmentPayload, UpdateAssessmentPayload, AssessmentFormPayload } from '@/lib/types/assessment.types'
import { assessmentLevelService } from '@/lib/api-services'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    assessment_level_id: initialData?.assessment_level_id || '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [levels, setLevels] = useState<any[]>([])
  const [isLoadingLevels, setIsLoadingLevels] = useState(false)

  // Konstanta untuk toleransi waktu (5 menit)
  const TIME_TOLERANCE_MINUTES = 5

  // Fetch assessment levels on component mount
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setIsLoadingLevels(true)
        const response = await assessmentLevelService.getAllAssessmentLevels(1, 100)
        if (response.success && response.data) {
          setLevels(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        console.error('Error fetching assessment levels:', error)
      } finally {
        setIsLoadingLevels(false)
      }
    }

    fetchLevels()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'time_limit') {
      const numValue = parseInt(value) || 0
      setFormData(prev => ({
        ...prev,
        time_limit: numValue
      }))
    } else if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setError('')
  }

  const handleLevelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      assessment_level_id: value ? parseInt(value) : '',
    }))
    setError('')
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
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
      let submitData: any;
      
      // Tambahkan +5 menit untuk toleransi internet delay
      const timeLimitWithTolerance = formData.time_limit + TIME_TOLERANCE_MINUTES;
      
      if (mode === 'edit') {
        submitData = {
          id: formData.id!,
          title: formData.title,
          description: formData.description,
          time_limit: timeLimitWithTolerance,
          slug: formData.slug,
        }
      } else {
        submitData = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          time_limit: timeLimitWithTolerance,
        }
      }

      // Add assessment_level_id if selected
      if (formData.assessment_level_id) {
        submitData.assessment_level_id = formData.assessment_level_id
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
          assessment_level_id: '',
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
            <p className="text-sm text-gray-500">
              Berapa menit waktu yang disediakan untuk mengerjakan (akan ditambah {TIME_TOLERANCE_MINUTES} menit untuk toleransi internet)
            </p>
          </div>

          {/* Assessment Level Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="assessment_level_id" className="font-semibold text-gray-700">
              Level Assessment
            </Label>
            <Select
              value={formData.assessment_level_id ? String(formData.assessment_level_id) : ''}
              onValueChange={handleLevelChange}
              disabled={isLoading || isLoadingLevels}
            >
              <SelectTrigger id="assessment_level_id" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Pilih level assessment" />
              </SelectTrigger>
              <SelectContent>
                {levels.length === 0 ? (
                  <SelectItem value="_disabled" disabled>
                    {isLoadingLevels ? 'Memuat levels...' : 'Tidak ada level tersedia'}
                  </SelectItem>
                ) : (
                  levels.map((level: any) => (
                    <SelectItem key={level.id} value={String(level.id)}>
                      Level {level.level_number} - {level.description}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Pilih level untuk mengkategorikan assessment (opsional)</p>
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