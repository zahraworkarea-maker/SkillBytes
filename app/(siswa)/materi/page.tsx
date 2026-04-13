'use client'

import { MateriHeader } from '@/components/materi/materi-header'
import { LevelSection } from '@/components/materi/level-section'
import { materiData } from '@/lib/materi-data'

export default function MateriPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Courses */}
        <div className="space-y-12">
          {materiData.map((course) => (
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
      </main>
    </div>
  )
}
