'use client'

import { Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Activity {
  id: string
  type: 'assessment' | 'course' | 'warning' | 'completion'
  studentName: string
  description: string
  timestamp: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'completion',
    studentName: 'Maya Wijaya',
    description: 'Menyelesaikan kursus "Pemrograman Berorientasi Objek"',
    timestamp: '2 jam lalu',
  },
  {
    id: '2',
    type: 'assessment',
    studentName: 'Aulia Rahman',
    description: 'Menyelesaikan assessment "Konsep Class dan Object" dengan nilai 92%',
    timestamp: '3 jam lalu',
  },
  {
    id: '3',
    type: 'course',
    studentName: 'Dina Putri',
    description: 'Memulai kursus baru "Web Development Fundamentals"',
    timestamp: '5 jam lalu',
  },
  {
    id: '4',
    type: 'warning',
    studentName: 'Budi Santoso',
    description: 'Tidak aktif selama 7 hari terakhir',
    timestamp: '1 jam lalu',
  },
  {
    id: '5',
    type: 'assessment',
    studentName: 'Rendra Wijaya',
    description: 'Menyelesaikan assessment dengan nilai 75%',
    timestamp: '8 jam lalu',
  },
  {
    id: '6',
    type: 'completion',
    studentName: 'Siti Nurjanah',
    description: 'Menyelesaikan modul "Database Design Principles"',
    timestamp: '1 hari lalu',
  },
]

export function AdminActivityLog() {
  const { ref, isInView } = useInView()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'assessment':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'course':
        return <BookOpen className="w-4 h-4 text-purple-600" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completion':
        return 'bg-green-50 border-green-200'
      case 'assessment':
        return 'bg-blue-50 border-blue-200'
      case 'course':
        return 'bg-purple-50 border-purple-200'
      case 'warning':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-3 flex flex-col h-full"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Aktivitas Terkini</h3>
        <p className="text-xs text-gray-500">Update aktivitas siswa real-time</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`${getActivityColor(activity.type)} border rounded-lg p-3 animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{activity.studentName}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Lihat Semua Aktivitas
        </button>
      </div>
    </div>
  )
}
