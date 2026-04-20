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
  Legend,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const progressData = [
  { week: 'Minggu 1', progress: 35, target: 50 },
  { week: 'Minggu 2', progress: 42, target: 50 },
  { week: 'Minggu 3', progress: 55, target: 60 },
  { week: 'Minggu 4', progress: 65, target: 65 },
  { week: 'Minggu 5', progress: 72, target: 70 },
  { week: 'Minggu 6', progress: 78, target: 75 },
  { week: 'Minggu 7', progress: 85, target: 80 },
  { week: 'Minggu 8', progress: 88, target: 85 },
]

interface StudentProgressChartProps {
  period: string
  onPeriodChange: (period: string) => void
}

export function StudentProgressChart({ period, onPeriodChange }: StudentProgressChartProps) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-1 flex flex-col h-full"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">Progress Siswa</h3>
          <p className="text-xs text-gray-500">Rata-rata pencapaian siswa per minggu</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari</SelectItem>
              <SelectItem value="30days">30 Hari</SelectItem>
              <SelectItem value="90days">90 Hari</SelectItem>
              <SelectItem value="1year">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
          <button className="text-gray-400 hover:text-gray-600 p-0.5">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-64 md:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 13, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              name="Actual Progress"
              isAnimationActive={isInView}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#9ca3af"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4 }}
              name="Target"
              isAnimationActive={isInView}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
