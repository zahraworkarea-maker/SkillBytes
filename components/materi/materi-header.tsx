'use client'

import { Progress } from '@/components/ui/progress'
import { useInView } from '@/hooks/use-in-view'

interface MateriHeaderProps {
  title: string
  description: string
  progress: number
}

export function MateriHeader({ title, description, progress }: MateriHeaderProps) {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="mb-8 animate-slide-up">
      {/* Title and Icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className="shrink-0 text-blue-600">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h16M4 6v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6M4 6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h8" strokeLinecap="round" />
            <path d="M16 4v2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 mt-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#475569] mb-1">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8]">Progress Keseeluruhan {progress}%</span>
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: isInView ? `${progress}%` : '0%',
                  transition: 'width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 text-center shadow-sm">
        <p className="text-sm md:text-base text-[#475569]">{description}</p>
      </div>
    </div>
  )
}
