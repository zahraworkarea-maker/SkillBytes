'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader } from 'lucide-react'
import AssessmentForm from '@/components/admin/assessment-form'
import QuestionEditor from '@/components/admin/question-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { assessmentService } from '@/lib/api-services'
import { AssessmentFormPayload } from '@/lib/types/assessment.types'
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
      } else if (response.data) {
        // Fallback for different response structure
        setAssessmentData(response.data)
      } else {
        setAssessmentData(response)
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
        toast.success('Informasi Assessment berhasil diperbarui!')
        // Reload data just in case slug changed or metadata updated
        loadAssessment()
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
    router.push('/admin/assesmen')
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
        <p className="text-gray-600">Update informasi dan soal assessment</p>
      </div>

      <div className="max-w-4xl">
        {assessmentData ? (
          <Tabs defaultValue="informasi" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-blue-100 p-1 rounded-xl">
              <TabsTrigger value="informasi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                Informasi Assessment
              </TabsTrigger>
              <TabsTrigger value="soal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                Soal & Jawaban
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="informasi" className="mt-0">
              <AssessmentForm
                mode="edit"
                initialData={assessmentData}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </TabsContent>
            
            <TabsContent value="soal" className="mt-0">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Soal & Jawaban</h2>
                <QuestionEditor 
                  assessmentId={assessmentData.id} 
                  initialQuestions={assessmentData.questions || []} 
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-gray-600">
            <p>Data assessment tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
