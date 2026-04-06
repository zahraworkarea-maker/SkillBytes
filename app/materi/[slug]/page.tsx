'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { materiData } from '@/lib/materi-data'
import { PDFViewer } from '@/components/materi/pdf-viewer'
import { TimerCountdown } from '@/components/materi/timer-countdown'
import { Button } from '@/components/ui/button'

export default function MateriDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [isTimerComplete, setIsTimerComplete] = useState(false)

  // Find the lesson from all courses
  let lesson = null
  let course = null
  let level = null

  for (const courseData of materiData) {
    for (const levelData of courseData.levels) {
      const found = levelData.lessons.find(lesson => lesson.id === slug)
      if (found) {
        lesson = found
        course = courseData
        level = levelData
        break
      }
    }
    if (lesson) break
  }

  // Check timer status
  useEffect(() => {
    const checkTimer = () => {
      const saved = localStorage.getItem(`timer_${slug}`)
      if (saved) {
        const { time } = JSON.parse(saved)
        setIsTimerComplete(time === 0)
      }
    }

    checkTimer()
    const interval = setInterval(checkTimer, 1000)
    return () => clearInterval(interval)
  }, [slug])

  const handleMarkComplete = () => {
    // Mark lesson as completed in localStorage
    localStorage.setItem(`lesson_completed_${slug}`, JSON.stringify({
      completed: true,
      completedAt: new Date().toISOString()
    }))
    
    // Redirect to materi page
    router.push('/materi')
  }

  if (!lesson || !course || !level) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Materi Tidak Ditemukan</h1>
            <p className="text-slate-600 mb-6">Materi yang Anda cari tidak tersedia</p>
            <Link href="/materi">
              <Button>Kembali ke Materi</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    'Pemula': 'bg-blue-100 text-blue-700',
    'Menengah': 'bg-amber-100 text-amber-700',
    'Advanced': 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link href="/materi" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Materi
          </Link>
        </div>

        {/* Timer Countdown */}
        <TimerCountdown lessonId={slug} />

        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {course.title.split(' ').length > 3 
                ? `Level ${level.levelNumber}: ${lesson.title}` 
                : lesson.title}
            </h1>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${difficultyColors[lesson.difficulty]}`}>
              {lesson.difficulty}
            </span>
            {lesson.duration && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-700 font-medium">{lesson.duration}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
          {/* PDF Viewer */}
          <div className="p-6 md:p-8">
            <PDFViewer pdfUrl={lesson.pdfUrl} fileName={lesson.title} />
          </div>
        </div>

        {/* Summary Section */}
        {lesson.summary && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">📝</span>
              Ringkasan Materi
            </h2>
            <p className="text-blue-800 leading-relaxed">
              {lesson.summary}
            </p>
          </div>
        )}

        {/* Chapter Content */}
        {lesson.chapters && lesson.chapters.length > 0 && (
          <div className="space-y-6">
            {lesson.chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-lg border border-slate-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{chapter.title}</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {chapter.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between items-center">
          <Link href="/materi">
            <Button variant="outline">← Kembali ke Daftar Materi</Button>
          </Link>
          <div className="flex items-center gap-4">
            {lesson.completed && (
              <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Sudah Diselesaikan
              </div>
            )}
            <Button 
              disabled={!isTimerComplete}
              onClick={handleMarkComplete}
              className={!isTimerComplete ? 'opacity-50 cursor-not-allowed' : ''}
              title={!isTimerComplete ? 'Selesaikan membaca materi selama 25 menit terlebih dahulu' : ''}
            >
              {isTimerComplete ? '✓ Tandai Selesai' : 'Lanjutkan Membaca'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
