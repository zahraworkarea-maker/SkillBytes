'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AssessmentForm from '@/components/admin/assessment-form'
import { assessmentService } from '@/lib/api-services'
import { AssessmentFormPayload } from '@/lib/types/assessment.types'
import { toast } from 'react-toastify'

export default function AddAssessmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: AssessmentFormPayload) => {
    setIsLoading(true)
    try {
      const response = await assessmentService.createAssessment(data)
      
      if (response.success) {
        const assessmentSlug = response.data.slug
        toast.success('Assessment berhasil dibuat! Redirecting to question creation...')
        setTimeout(() => {
          router.push(`/admin/assesmen/${assessmentSlug}/soal`)
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error creating assessment:', error)
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Gagal membuat assessment'
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/assesmen')
  }

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
          Tambah Assessment Baru
        </h1>
        <p className="text-gray-600">Buat assessment baru dan tambahkan soal-soal</p>
      </div>

      <div className="max-w-2xl">
        <AssessmentForm
          mode="create"
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

