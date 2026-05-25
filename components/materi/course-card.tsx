'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lock, CheckCircle2 } from 'lucide-react'
import type { Lesson } from '@/lib/materi-data'

interface CourseCardProps {
  lesson: Lesson
  courseId: string
  levelNumber: 1 | 2 | 3
  isLocked?: boolean
  index?: number
}

export function CourseCard({ lesson, courseId, levelNumber, isLocked = false, index = 0 }: CourseCardProps) {
  const animationDelay = index === 0 ? '' : index === 1 ? 'animate-slide-up-delay-1' : 'animate-slide-up-delay-2'
  const imagePath = `/level/level${levelNumber}.png`

  const cardContent = (
    <div className="flex items-stretch h-32 md:h-40">
      {/* Left Side - Level Image */}
      <div className="shrink-0 w-24 md:w-28 flex items-center justify-center bg-gray-50 relative">
        <Image
          src={imagePath}
          alt={`Level ${levelNumber}`}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Right Side - Content */}
      <div className="flex-1 flex flex-col p-4 md:p-5 relative">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-2 line-clamp-2">
          {lesson.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 line-clamp-1 mb-3">{lesson.description}</p>

        {/* Status Badge */}
        <div className="flex items-center gap-1 mt-auto">
          {lesson.completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Completed</span>
            </>
          ) : lesson.hasCountdown ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-600">Sedang Dibaca</span>
            </>
          ) : lesson.inProgress ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-500">In Progress</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              <span className="text-xs font-semibold text-gray-400">Not Started</span>
            </>
          )}
        </div>

        {/* Lock Icon - Top Right Corner */}
        {isLocked && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  )

  if (isLocked) {
    return (
      <div
        className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all animate-slide-up ${animationDelay} relative overflow-hidden opacity-60 cursor-not-allowed`}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/materi/${lesson.id}`}>
      <div
        className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all animate-slide-up ${animationDelay} relative overflow-hidden cursor-pointer hover:scale-105 duration-200`}
      >
        {cardContent}
      </div>
    </Link>
  )
}
