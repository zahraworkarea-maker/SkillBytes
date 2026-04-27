'use client'

import { useEffect, useState } from 'react'
import { MateriHeader } from '@/components/materi/materi-header'
import { LevelSection } from '@/components/materi/level-section'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { materiData, type Course } from '@/lib/materi-data'
import { materiService } from '@/lib/api-services'
import { transformBackendMateriToFrontend } from '@/lib/materi-transform'

export default function MateriPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data dari backend
        const response = await materiService.getAllLevels()
        
        // Transform backend response ke format frontend
        const transformedCourse = transformBackendMateriToFrontend(
          response,
          'oop',
          'Pemrograman Berorientasi Objek'
        )
        
        // Set courses dengan data dari backend
        setCourses([transformedCourse])
      } catch (err) {
        console.error('Failed to fetch materi:', err)
        setError('Gagal memuat data materi.')
        // Don't fall back to static data - show empty state instead
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchMateri()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data materi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum Ada Materi</EmptyTitle>
                <EmptyDescription>Belum ada materi yang tersedia</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          /* Courses */
          <div className="space-y-12">
            {courses.map((course) => (
              <div key={course.id}>
                {/* Course Header */}
                <MateriHeader title={course.title} description={course.description} progress={course.progress} />

                {/* Levels */}
                <div className="space-y-8">
                  {course.levels.map((level, levelIndex) => {
                    // Check if previous level is complete
                    const previousLevel = levelIndex > 0 ? course.levels[levelIndex - 1] : null
                    const previousLevelComplete = previousLevel ? previousLevel.lessons.every(lesson => lesson.completed) : true
                    
                    return (
                      <LevelSection 
                        key={`${course.id}-level-${level.levelNumber}`} 
                        level={level} 
                        courseId={course.id}
                        previousLevelComplete={previousLevelComplete}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
