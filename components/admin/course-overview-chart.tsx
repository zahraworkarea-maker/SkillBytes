'use client'

import { MoreVertical } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const courseData = [
  { name: 'OOP', completed: 85, inProgress: 12, notStarted: 3 },
  { name: 'Web Dev', completed: 72, inProgress: 20, notStarted: 8 },
  { name: 'Database', completed: 65, inProgress: 25, notStarted: 10 },
  { name: 'API Design', completed: 58, inProgress: 28, notStarted: 14 },
  { name: 'Testing', completed: 45, inProgress: 35, notStarted: 20 },
]

export function CourseOverviewChart() {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-2 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Statistik Kursus</h3>
          <p className="text-xs text-gray-500">Distribusi status kursus per jumlah siswa</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-64 md:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={courseData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="completed"
              fill="#22c55e"
              name="Selesai"
              radius={[8, 8, 0, 0]}
              isAnimationActive={isInView}
              animationDuration={1500}
            />
            <Bar
              dataKey="inProgress"
              fill="#f59e0b"
              name="Sedang Berlangsung"
              radius={[8, 8, 0, 0]}
              isAnimationActive={isInView}
              animationDuration={1500}
              animationDelay={100}
            />
            <Bar
              dataKey="notStarted"
              fill="#ef4444"
              name="Belum Dimulai"
              radius={[8, 8, 0, 0]}
              isAnimationActive={isInView}
              animationDuration={1500}
              animationDelay={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
