'use client'

import { MoreVertical, Trophy, BookOpen, BookMarked } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const activities = [
  {
    id: 1,
    type: 'trophy',
    title: '1st place in "Assesmen Class"',
    desc: 'Zahra got 1st place in "Assesmen Class"',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'book',
    title: 'Participated in "PBL 1"',
    desc: 'Zahra participated in "PBL 1"',
    time: '1 Day ago',
  },
  {
    id: 3,
    type: 'check',
    title: 'Completing Learning "Class"',
    desc: 'Zahra completing learning "Class"',
    time: '6 Day ago',
  },
  {
    id: 4,
    type: 'trophy',
    title: '1st place in "Assesmen OOP"',
    desc: 'Zahra got 1st place in "Assesmen Class"',
    time: '2 Week ago',
  },
  {
    id: 5,
    type: 'book',
    title: 'Participated in "Pre-test PBL 1"',
    desc: 'Zahra participated in "Pre-Test PBL 1"',
    time: '1 Month ago',
  },
]

export function StudentActivity() {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Student Activity</h3>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 md:space-y-4 overflow-y-auto">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`flex items-start gap-2.5 transition-all ${
              isInView ? 'opacity-100' : 'opacity-0'
            } ${index >= 2 && 'opacity-50'}`}
            style={{
              animation: isInView 
                ? `fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index === 0 ? '0.4s' : index === 1 ? '0.8s' : '1.2s'} both`
                : 'none',
            }}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                activity.type === 'trophy'
                  ? 'bg-yellow-50'
                  : activity.type === 'check'
                    ? 'bg-green-50'
                    : 'bg-blue-50'
              }`}
            >
              {activity.type === 'trophy' ? (
                <Trophy className="w-4 h-4 text-yellow-500" />
              ) : activity.type === 'check' ? (
                <BookOpen className="w-4 h-4 text-green-500" />
              ) : (
                <BookMarked className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-1">{activity.title}</p>
              <p className="text-xs text-gray-400 leading-snug mt-0.5 line-clamp-1">{activity.desc}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
