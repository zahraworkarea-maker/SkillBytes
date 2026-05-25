'use client'

import { useEffect, useState } from 'react'
import { MateriHeader } from '@/components/materi/materi-header'
import { LevelSection } from '@/components/materi/level-section'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { MateriLoadingSkeleton } from '@/components/ui/loading-skeleton'
import { materiData, type Course } from '@/lib/materi-data'
import { materiService } from '@/lib/api-services'
import { transformBackendMateriToFrontend } from '@/lib/materi-transform'

export default function MateriPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inProgressLessons, setInProgressLessons] = useState<string[]>([])
  const [lessonsWithCountdown, setLessonsWithCountdown] = useState<string[]>([])

  // Load in progress lessons and countdown data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lessons = JSON.parse(localStorage.getItem('inProgressLessons') || '[]')
      setInProgressLessons(lessons)

      // Check for countdown data - look for timer_* keys in localStorage
      const countdownLessons: string[] = []
      for (let key in localStorage) {
        if (key.startsWith('timer_')) {
          // Extract lesson ID from key: timer_{lessonId}
          const lessonId = key.replace('timer_', '')
          countdownLessons.push(lessonId)
        }
      }
      setLessonsWithCountdown(countdownLessons)
    }
  }, [])

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data dari backend
        const response = await materiService.getAllLevels()
        
        // Transform backend response ke format frontend
        let transformedCourse = transformBackendMateriToFrontend(
          response,
          'oop',
          'Pemrograman Berorientasi Objek'
        )

        // Add inProgress flag to lessons and check for countdown
        transformedCourse = {
          ...transformedCourse,
          levels: transformedCourse.levels.map(level => ({
            ...level,
            lessons: level.lessons.map(lesson => ({
              ...lesson,
              inProgress: inProgressLessons.includes(lesson.id),
              hasCountdown: lessonsWithCountdown.includes(lesson.id)
            }))
          }))
        }
        
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
  }, [inProgressLessons, lessonsWithCountdown])

  if (loading) {
    return <MateriLoadingSkeleton />
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
