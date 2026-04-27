import {
  BookOpen,
  Code,
  Database,
  Package,
  Shield,
  Zap,
  LayoutTemplate,
  Layers,
  FileCode,
} from 'lucide-react'
import type { Course, Lesson, CourseLevel } from './materi-data'

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

// Icon mapping untuk lessons berdasarkan index
const iconMapping: IconType[] = [
  BookOpen,
  LayoutTemplate,
  Code,
  Package,
  Shield,
  Zap,
  Layers,
  FileCode,
  Database,
]

// Difficulty mapping berdasarkan level
const difficultyMap: Record<number, '1' | '2' | '3'> = {
  1: '1',
  2: '2',
  3: '3',
}

export interface BackendLessonResponse {
  id: number | string
  slug: string
  level_id: number
  title: string
  description: string
  duration: string
  pdf_url: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface BackendLevelResponse {
  id: number
  level_number: 1 | 2 | 3
  lessons: BackendLessonResponse[]
  created_at: string
  updated_at: string
}

export interface BackendMateriResponse {
  success: boolean
  message: string
  data: BackendLevelResponse[]
}

/**
 * Transform backend response ke format frontend
 */
export function transformBackendMateriToFrontend(
  backendData: BackendMateriResponse,
  courseId: string = 'default-course',
  courseTitle: string = 'Materi Pembelajaran'
): Course {
  const lessons: Lesson[] = []

  // Flatten semua lessons dari semua level untuk mendapatkan daftar global
  backendData.data.forEach((level) => {
    level.lessons.forEach((lesson, index) => {
      lessons.push({
        id: lesson.slug || String(lesson.id), // Use slug if available, fallback to id
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        pdfUrl: lesson.pdf_url,
        completed: lesson.completed,
        icon: iconMapping[index % iconMapping.length],
        difficulty: difficultyMap[level.level_number],
      })
    })
  })

  // Transform levels
  const levels: CourseLevel[] = backendData.data.map((level) => ({
    levelNumber: level.level_number,
    lessons: level.lessons.map((lesson, index) => ({
      id: lesson.slug || String(lesson.id), // Use slug if available, fallback to id
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      pdfUrl: lesson.pdf_url,
      completed: lesson.completed,
      icon: iconMapping[index % iconMapping.length],
      difficulty: difficultyMap[level.level_number],
    })),
  }))

  // Calculate progress based on completed lessons
  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => l.completed).length
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return {
    id: courseId,
    title: courseTitle,
    category: 'Materi Pembelajaran',
    description: `Pelajari ${courseTitle} dengan struktur berjenjang dari level 1 hingga level 3`,
    progress,
    levels,
  }
}
