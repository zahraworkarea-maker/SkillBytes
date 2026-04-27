'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react' // Tambah icon CheckCircle2
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

import { materiData } from '@/lib/materi-data'
import { materiService } from '@/lib/api-services'
import { TimerCountdown } from '@/components/materi/timer-countdown'
import { Button } from '@/components/ui/button'

// ✅ FIX: dynamic import (ANTI DOMMatrix ERROR)
const PDFViewer = dynamic(
  () => import('@/components/materi/pdf-viewer').then(mod => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p>Memuat PDF...</p>
      </div>
    ),
  }
)

interface LessonData {
  id: number | string
  slug: string
  title: string
  description: string
  duration: string
  pdf_url: string
  completed: boolean
}

export default function MateriDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.slug as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTimerComplete, setIsTimerComplete] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await materiService.getLessonById(lessonId)

        const lessonData = Array.isArray(response?.data)
          ? response.data[0]
          : response?.data || response

        if (!lessonData) {
          throw new Error('Data materi tidak ditemukan')
        }

        setLesson(lessonData)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat data materi.')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

  // Fungsi untuk handle klik tombol selesai
  const handleComplete = async () => {
    try {
      setIsMarkingComplete(true)
      setCompleteError(null)
      
      if (!lesson) {
        throw new Error('Data materi tidak ditemukan')
      }
      
      // ✅ Panggil API untuk menandai lesson sebagai completed menggunakan ID
      console.log('[PAGE] Calling completeLesson API for lesson ID:', lesson.id)
      const response = await materiService.completeLesson(String(lesson.id))
      
      console.log('[PAGE] Lesson completed successfully:', response)

      // Redirect kembali ke halaman materi setelah sukses
      router.push('/materi')
      
    } catch (error: any) {
      console.error('[PAGE] Error completing lesson:', error)
      
      // Extract error message dari response atau error object
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Gagal menyelesaikan materi. Silakan coba lagi.'
      
      setCompleteError(errorMessage)
      setIsMarkingComplete(false)
    }
  }

  if (loading) {
    return <p className="text-center py-10">Memuat materi...</p>
  }

  if (!lesson) {
    return <p className="text-center py-10">Materi tidak ditemukan</p>
  }

  const durationMinutes = parseInt(lesson.duration) || 25

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        <Link href="/materi" className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Materi
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 mb-4">{lesson.title}</h1>

        {/* 🔥 Tambahkan props onComplete di sini */}
        <TimerCountdown 
          lessonId={lessonId} 
          durationMinutes={durationMinutes} 
          onComplete={() => setIsTimerComplete(true)} 
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mt-6">
          <PDFViewer pdfUrl={lesson.pdf_url} fileName={lesson.title} />
        </div>

        {lesson.description && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Deskripsi Materi
            </h3>
            <div className="w-12 h-1 bg-blue-100 rounded-full mb-4"></div>
            <p className="text-slate-600 leading-relaxed text-justify">
              {lesson.description}
            </p>
          </div>
        )}

        {/* --- 🔥 TAMBAHAN: Action Button Area --- */}
        <div className="mt-8">
          {/* Error Alert */}
          {completeError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{completeError}</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleComplete}
              disabled={!isTimerComplete || isMarkingComplete}
              size="lg"
              className={`px-8 py-6 rounded-xl text-base font-semibold transition-all duration-300 ${
                !isTimerComplete 
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed' // Style saat disabled
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' // Style saat aktif
              }`}
            >
              {isMarkingComplete ? (
                'Memproses...'
              ) : !isTimerComplete ? (
                'Selesaikan Waktu Baca Dahulu'
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Selesai Membaca
                </>
              )}
            </Button>
          </div>
        </div>

      </main>
    </div>
  )
}