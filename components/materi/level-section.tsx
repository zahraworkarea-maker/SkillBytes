'use client'

import { CourseCard } from './course-card'
import type { CourseLevel } from '@/lib/materi-data'

interface LevelSectionProps {
  level: CourseLevel
  courseId: string
  previousLevelComplete?: boolean
}

// Grid column configuration based on level
const gridColsMap: Record<number, string> = {
  1: 'md:grid-cols-2 lg:grid-cols-2',
  2: 'md:grid-cols-2 lg:grid-cols-3',
  3: 'md:grid-cols-2 lg:grid-cols-4',
}

export function LevelSection({ level, courseId, previousLevelComplete }: LevelSectionProps) {
  const gridCols = gridColsMap[level.levelNumber] || gridColsMap[1]
  
  // Level 1 is always unlocked, level 2+ are locked if previous level is not complete
  const isLocked = level.levelNumber > 1 && !previousLevelComplete

  const levelLabels: Record<number, string> = {
    1: 'LEVEL1 Pemahaman Dasar',
    2: 'LEVEL2 Konsep Lanjutan',
    3: 'LEVEL3 Implementasi',
  }

  const levelBgColors: Record<number, string> = {
    1: 'bg-blue-100',
    2: 'bg-green-100',
    3: 'bg-red-100',
  }

  const levelTextColors: Record<number, string> = {
    1: 'text-blue-700',
    2: 'text-green-700',
    3: 'text-red-700',
  }

  return (
    <div className="mb-8">
      {/* Level Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${levelBgColors[level.levelNumber]} ${levelTextColors[level.levelNumber]}`}
        >
          {levelLabels[level.levelNumber]}
        </span>
      </div>

      {/* Lessons Grid */}
      <div className={`grid grid-cols-1 ${gridCols} gap-4 md:gap-5`}>
        {level.lessons.map((lesson, index) => (
          <CourseCard key={lesson.id} lesson={lesson} courseId={courseId} levelNumber={level.levelNumber} isLocked={isLocked} index={index} />
        ))}
      </div>
    </div>
  )
}
