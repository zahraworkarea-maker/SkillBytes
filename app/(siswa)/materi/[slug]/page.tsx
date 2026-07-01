'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

import { materiData } from '@/lib/materi-data'
import { materiService, userResumeService } from '@/lib/api-services'
import { MediaViewer } from '@/components/materi/media-viewer'
import { Button } from '@/components/ui/button'

interface LessonData {
  id: number | string
  slug: string
  title: string
  description: string
  duration: string
  file_url: string
  completed: boolean
}

export default function MateriDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.slug as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [isSubmittingResume, setIsSubmittingResume] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [resumeSuccess, setResumeSuccess] = useState(false)
  const [existingResume, setExistingResume] = useState<any | null>(null)
  const [loadingResume, setLoadingResume] = useState(true)
  const [isEditingResume, setIsEditingResume] = useState(false)

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

        // Track lesson as in progress
        if (typeof window !== 'undefined') {
          const inProgressLessons = JSON.parse(localStorage.getItem('inProgressLessons') || '[]')
          if (!inProgressLessons.includes(lessonData.slug)) {
            inProgressLessons.push(lessonData.slug)
            localStorage.setItem('inProgressLessons', JSON.stringify(inProgressLessons))
          }
        }
      } catch (err) {
        console.error(err)
        setError('Gagal memuat data materi.')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

  // Fetch resume ketika lesson dimuat
  useEffect(() => {
    const fetchResume = async () => {
      if (!lesson?.id) return

      try {
        setLoadingResume(true)
        const response = await userResumeService.getAllResumes()
        
        // Filter resume berdasarkan lesson_id
        const allResumes = Array.isArray(response?.data) ? response.data : []
        const foundResume = allResumes.find((r: any) => r.lesson_id == lesson.id)

        if (foundResume) {
          setExistingResume(foundResume)
          setResumeText(foundResume.content)
        } else {
          setExistingResume(null)
          setResumeText('')
        }
      } catch (err) {
        console.error('[PAGE] Error fetching resume:', err)
        setExistingResume(null)
      } finally {
        setLoadingResume(false)
      }
    }

    fetchResume()
  }, [lesson?.id])

  // Fungsi untuk handle klik tombol selesai
  const handleComplete = async (redirectTo?: string) => {
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

      // Redirect sesuai parameter atau kembali ke halaman materi
      if (redirectTo === '/pbl') {
        router.push('/pbl')
      } else {
        router.push('/materi')
      }
      
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

  // Fungsi untuk menghitung jumlah kata
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Fungsi untuk handle submit resume (create atau update)
  const handleResumeSubmit = async () => {
    try {
      setResumeError(null)
      setResumeSuccess(false)

      if (!lesson) {
        throw new Error('Data materi tidak ditemukan')
      }

      const wordCount = countWords(resumeText)
      
      if (wordCount < 300) {
        setResumeError(`Resume harus minimal 300 kata. Saat ini: ${wordCount} kata`)
        return
      }

      setIsSubmittingResume(true)
      
      // Jika ada resume yang sudah ada, lakukan update, jika tidak ada, lakukan create
      if (existingResume) {
        await userResumeService.updateResume(existingResume.id, lesson.id, resumeText)
        // Refresh resume setelah update
        const response = await userResumeService.getAllResumes()
        const allResumes = Array.isArray(response?.data) ? response.data : []
        const foundResume = allResumes.find((r: any) => r.lesson_id == lesson.id)
        if (foundResume) {
          setExistingResume(foundResume)
          setResumeText(foundResume.content)
        }
      } else {
        await userResumeService.createResume(lesson.id, resumeText)
        // Refresh resume setelah create
        const response = await userResumeService.getAllResumes()
        const allResumes = Array.isArray(response?.data) ? response.data : []
        const foundResume = allResumes.find((r: any) => r.lesson_id == lesson.id)
        if (foundResume) {
          setExistingResume(foundResume)
        }
      }
      
      setResumeSuccess(true)
      setIsEditingResume(false)
      
      // Hapus pesan success setelah 3 detik
      setTimeout(() => setResumeSuccess(false), 3000)
    } catch (error: any) {
      console.error('[PAGE] Error submitting resume:', error)
      
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Gagal mengirim resume. Silakan coba lagi.'
      
      setResumeError(errorMessage)
    } finally {
      setIsSubmittingResume(false)
    }
  }

  // Fungsi untuk handle delete resume
  const handleDeleteResume = async () => {
    if (!existingResume || !window.confirm('Apakah Anda yakin ingin menghapus resume ini?')) {
      return
    }

    try {
      setResumeError(null)
      setIsSubmittingResume(true)
      
      await userResumeService.deleteResume(existingResume.id)
      
      setExistingResume(null)
      setResumeText('')
      setIsEditingResume(false)
      setResumeSuccess(true)
      
      setTimeout(() => setResumeSuccess(false), 3000)
    } catch (error: any) {
      console.error('[PAGE] Error deleting resume:', error)
      
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Gagal menghapus resume. Silakan coba lagi.'
      
      setResumeError(errorMessage)
    } finally {
      setIsSubmittingResume(false)
    }
  }

  // Fungsi untuk handle Enter key di textarea (Ctrl+Enter untuk submit)
  const handleResumeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleResumeSubmit()
    }
  }

  if (loading) {
    return <p className="text-center py-10">Memuat materi...</p>
  }

  if (!lesson) {
    return <p className="text-center py-10">Materi tidak ditemukan</p>
  }

  // Construct full file URL using explicit backend URL
  const backendImageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}`
  const fullFileUrl = lesson.file_url?.startsWith('http')
    ? lesson.file_url
    : `${backendImageUrl}${lesson.file_url}`

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        <Link href="/materi" className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Materi
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 mb-4">{lesson.title}</h1>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mt-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <MediaViewer fileUrl={fullFileUrl} fileName={lesson.title} />
          </div>
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

        {/* --- 🔥 RESUME FORM SECTION --- */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6 transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ringkasan Materi (Resume)
          </h3>
          <div className="w-12 h-1 bg-green-100 rounded-full mb-4"></div>

          {/* Loading Resume */}
          {loadingResume && (
            <div className="p-4 text-center text-slate-500">
              <p className="text-sm">Memuat resume...</p>
            </div>
          )}

          {/* Resume Existing Display */}
          {!loadingResume && existingResume && !isEditingResume && (
            <div className="mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-slate-600 text-justify leading-relaxed whitespace-pre-wrap">
                  {existingResume.content}
                </p>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-green-200">
                  Jumlah kata: {countWords(existingResume.content)}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingResume(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Resume
                </button>
                <button
                  onClick={handleDeleteResume}
                  disabled={isSubmittingResume}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Resume
                </button>
              </div>
            </div>
          )}

          {/* Resume Form (Create or Edit) */}
          {!loadingResume && (!existingResume || isEditingResume) && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                {existingResume ? 'Edit ringkasan materi dalam bentuk teks' : 'Tulis ringkasan materi dalam bentuk teks (minimal 300 kata)'}
              </p>
              
              {/* Error Alert */}
              {resumeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{resumeError}</p>
                </div>
              )}

              {/* Success Alert */}
              {resumeSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">✓ Resume berhasil {existingResume && !isEditingResume ? 'diperbarui' : 'disimpan'}!</p>
                </div>
              )}

              {/* Textarea */}
              <div className="mb-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  onKeyDown={handleResumeKeyDown}
                  placeholder="Tulis ringkasan materi di sini..."
                  className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-slate-700 text-sm"
                />
              </div>

              {/* Word Count */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500">
                  {countWords(resumeText)} / 300 kata
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  countWords(resumeText) < 300 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {countWords(resumeText) < 300 
                    ? `Kurang ${300 - countWords(resumeText)} kata` 
                    : `${countWords(resumeText)} kata (Siap dikirim)`}
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleResumeSubmit}
                  disabled={countWords(resumeText) < 300 || isSubmittingResume}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    countWords(resumeText) < 300 || isSubmittingResume
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-3m6 3l6-3" />
                  </svg>
                  {isSubmittingResume ? 'Mengirim...' : (existingResume && isEditingResume ? 'Perbarui Resume' : 'Kirim Resume')}
                </button>
                {isEditingResume && (
                  <button
                    onClick={() => {
                      setIsEditingResume(false)
                      setResumeText(existingResume?.content || '')
                      setResumeError(null)
                    }}
                    disabled={isSubmittingResume}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                )}
                <span className="text-xs text-slate-400 flex items-center">
                  (atau Ctrl+Enter)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* --- 🔥 TAMBAHAN: Action Button Area --- */}
        <div className="mt-8">
          {/* Error Alert */}
          {completeError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{completeError}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => handleComplete()}
              disabled={isMarkingComplete}
              size="lg"
              className="px-8 py-6 rounded-xl text-base font-semibold transition-all duration-300 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingComplete ? (
                'Memproses...'
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Selesai
                </>
              )}
            </Button>
            <Button
              onClick={() => handleComplete('/pbl')}
              disabled={isMarkingComplete}
              size="lg"
              className="px-8 py-6 rounded-xl text-base font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingComplete ? (
                'Memproses...'
              ) : (
                <>
                  <ChevronRight className="w-5 h-5 mr-2" />
                  Lanjut ke PBL
                </>
              )}
            </Button>
          </div>
        </div>

      </main>
    </div>
  )
}