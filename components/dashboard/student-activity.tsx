'use client'

import { MoreVertical, Trophy, BookOpen, BookMarked, CheckCircle2 } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

export function StudentActivity({ dashboardData }: { dashboardData?: any }) {
  const { ref, isInView } = useInView()

  // Use real activities from dashboardData
  const activities = dashboardData?.activities || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trophy':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'check':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      default:
        return <BookMarked className="w-4 h-4 text-blue-400" />
    }
  }

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'trophy':
        return 'bg-yellow-50'
      case 'check':
        return 'bg-green-50'
      default:
        return 'bg-blue-50'
    }
  }

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Student Activity</h3>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 md:space-y-4 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity: any, index: number) => (
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
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getActivityBg(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-1">{activity.title}</p>
                <p className="text-xs text-gray-400 leading-snug mt-0.5 line-clamp-1">{activity.desc}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{activity.time}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Tidak ada aktivitas yang ditampilkan</p>
        )}
      </div>
    </div>
  )
}
