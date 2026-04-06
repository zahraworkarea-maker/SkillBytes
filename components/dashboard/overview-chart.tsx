'use client'

import { MoreVertical } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const overviewData = [
  { month: 'Jan', materi: 40, assesmen: 30 },
  { month: 'Feb', materi: 50, assesmen: 42 },
  { month: 'Mar', materi: 73, assesmen: 58 },
  { month: 'Apr', materi: 55, assesmen: 50 },
  { month: 'May', materi: 63, assesmen: 52 },
  { month: 'Jun', materi: 46, assesmen: 40 },
  { month: 'Jul', materi: 30, assesmen: 25 },
]

export function OverviewChart() {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4" style={{
        animation: isInView ? 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both' : 'none',
        opacity: isInView ? 1 : 0,
      }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Overview</h3>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs md:text-sm text-gray-500">Materi</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs md:text-sm text-gray-500">Assesmen</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-64 md:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={overviewData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 13, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[25, 80]}
              ticks={[30, 40, 50, 60, 70, 80]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="materi"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={isInView}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="assesmen"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={isInView}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
