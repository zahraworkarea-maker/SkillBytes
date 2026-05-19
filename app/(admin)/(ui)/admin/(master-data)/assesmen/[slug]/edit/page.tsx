'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader } from 'lucide-react'
import AssessmentForm from '@/components/admin/assessment-form'
import { assessmentService } from '@/lib/api-services'
import { UpdateAssessmentPayload, AssessmentFormPayload } from '@/lib/types/assessment.types'
import { toast } from 'react-toastify'

export default function EditAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentData, setAssessmentData] = useState<any>(null)

  useEffect(() => {
    if (slug) {
      loadAssessment()
    }
  }, [slug])

  const loadAssessment = async () => {
    setIsLoading(true)
    try {
      const response = await assessmentService.getAssessmentBySlug(slug)
      if (response.success && response.data) {
        setAssessmentData(response.data)
      }
    } catch (error: any) {
      console.error('Error loading assessment:', error)
      toast.error('Gagal memuat data assessment')
      setTimeout(() => {
        router.push('/admin/assesmen')
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: AssessmentFormPayload) => {
    setIsSubmitting(true)
    try {
      const response = await assessmentService.updateAssessment(assessmentData.id, data)
      
      if (response.success) {
        toast.success('Assessment berhasil diperbarui!')
        setTimeout(() => {
          router.push('/admin/assesmen')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error updating assessment:', error)
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Gagal memperbarui assessment'
      )
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/assesmen')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Memuat data assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
          Edit Assessment
        </h1>
        <p className="text-gray-600">Update informasi assessment</p>
      </div>

      <div className="max-w-2xl">
        {assessmentData ? (
          <AssessmentForm
            mode="edit"
            initialData={assessmentData}
            isLoading={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <div className="text-center text-gray-600">
            <p>Data assessment tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
