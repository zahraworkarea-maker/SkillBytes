'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all animate-slide-up ${animationDelay} relative overflow-hidden ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
    >
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
        <div className="flex-1 flex flex-col p-4 md:p-5 relative pb-12">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-2 line-clamp-2">
            {lesson.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{lesson.description}</p>

          {/* Badge Selesai Dibaca */}
          {lesson.completed && (
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Selesai Dibaca</span>
            </div>
          )}

          {/* Button - Bottom Right Corner */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
            {isLocked ? (
              <div className="flex items-center justify-center bg-gray-300 text-white rounded-lg h-8 px-4 cursor-not-allowed">
                <Lock className="w-4 h-4" />
              </div>
            ) : (
              <Link href={`/materi/${lesson.id}`}>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm h-8 px-4 rounded-lg"
                >
                  Baca
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
