'use client'

import { BookOpen, ClipboardList, GraduationCap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useInView } from '@/hooks/use-in-view'

const progressCards = [
  {
    id: 'materi',
    icon: <BookOpen className="w-4 h-4 text-blue-500" />,
    iconBg: 'bg-blue-50',
    label: 'Materi Pembelajaran',
    progress: 40,
    sub: '4/10 Lesson',
  },
  {
    id: 'assessment',
    icon: <ClipboardList className="w-4 h-4 text-violet-500" />,
    iconBg: 'bg-violet-50',
    label: 'Assessment',
    progress: 67,
    sub: '2/3 Exam',
  },
  {
    id: 'pbl',
    icon: <GraduationCap className="w-4 h-4 text-cyan-500" />,
    iconBg: 'bg-cyan-50',
    label: 'Problem-Based Learning',
    progress: 50,
    sub: '1/2 Task',
  },
]

interface ProgressCardsProps {
  activeCard: string
  onCardClick: (id: string) => void
}

export function ProgressCards({ activeCard, onCardClick }: ProgressCardsProps) {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {progressCards.map((card, index) => (
        <button
          key={card.id}
          onClick={() => onCardClick(card.id)}
          className={`bg-white rounded-xl p-5 text-left transition-all animate-slide-up ${
            index === 0 && 'animate-slide-up'
          } ${index === 1 && 'animate-slide-up-delay-1'} ${index === 2 && 'animate-slide-up-delay-2'} ${
            activeCard === card.id
              ? 'border-2 border-blue-500 shadow-md'
              : 'border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
          }`}
        >
          <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center mb-3`}>
            {card.icon}
          </div>
          <p className="font-semibold text-gray-700 text-base mb-3">{card.label}</p>
          <div className="h-2 mb-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${
                card.progress <= 40
                  ? 'bg-blue-500'
                  : card.progress <= 60
                    ? 'bg-violet-500'
                    : 'bg-cyan-500'
              } ${isInView ? `animate-progress-fill ${index === 1 ? 'animate-progress-fill-delay-1' : index === 2 ? 'animate-progress-fill-delay-2' : ''}` : 'w-0'}`}
              style={{ width: isInView ? `${card.progress}%` : '0%', transition: 'width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
            />
          </div>
          <p className="text-sm text-gray-400">{card.sub}</p>
        </button>
      ))}
    </div>
  )
}
