'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { knowledgeTracingService } from '@/lib/api-services'
import { useInView } from '@/hooks/use-in-view'

export function ClassMasteryChart() {
  const { ref, isInView } = useInView()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const response = await knowledgeTracingService.getClassMastery()
        setData(response?.data?.class_averages || [])
      } catch (error) {
        console.error('Failed to fetch class mastery', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMastery()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-h-80 flex items-center justify-center animate-pulse">
        <div className="h-40 w-full bg-gray-200 rounded" />
      </div>
    )
  }

  if (data.length === 0) return null

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-2 flex flex-col h-full">
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Rata-rata Penguasaan Kelas (KT)</h3>
        <p className="text-xs text-gray-500">Nilai rata-rata penguasaan tiap materi (Assessment + PBL)</p>
      </div>

      <div className="flex-1 w-full min-h-64 md:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="material_name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 13,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
              cursor={{ fill: '#f3f4f6' }}
              formatter={(value) => [`${value}%`, 'Average Mastery']}
            />
            <Bar dataKey="average_mastery" radius={[4, 4, 0, 0]} isAnimationActive={isInView} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.average_mastery < 60 ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
