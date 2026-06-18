'use client'

import { useEffect, useState } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { knowledgeTracingService } from '@/lib/api-services'
import { useInView } from '@/hooks/use-in-view'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function KnowledgeTracingChart() {
  const { ref, isInView } = useInView()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const response = await knowledgeTracingService.getStudentMastery()
        setData(response?.data)
      } catch (error) {
        console.error('Failed to fetch KT mastery', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMastery()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-h-80 flex items-center justify-center animate-pulse">
        <div className="h-40 w-40 bg-gray-200 rounded-full" />
      </div>
    )
  }

  if (!data || !data.mastery_list || data.mastery_list.length === 0) {
    return null
  }

  const { mastery_list, needs_attention } = data

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-3 h-full flex flex-col">
      <div className="flex flex-col gap-1 mb-4" style={{
        animation: isInView ? 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both' : 'none',
        opacity: isInView ? 1 : 0,
      }}>
        <h3 className="font-semibold text-gray-800 text-base">Knowledge Tracing Mastery</h3>
        <p className="text-xs text-gray-500">Tingkat penguasaan materi Anda berdasarkan nilai kuis & PBL</p>
      </div>

      <div className="flex-1 w-full min-h-64 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart Side */}
        <div className="h-64 md:h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mastery_list}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="material_name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`${value}%`, 'Mastery Score']}
              />
              <Radar
                name="Mastery"
                dataKey="mastery_score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
                isAnimationActive={isInView}
                animationDuration={2000}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Needs Attention Side */}
        <div className="flex flex-col gap-3 justify-center">
          <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Status Penguasaan</h4>
          {needs_attention.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs">Ada beberapa materi yang perlu dipelajari kembali karena nilainya di bawah 60.</p>
              </div>
              <div className="flex flex-col gap-1.5 mt-1 max-h-36 overflow-y-auto pr-1">
                {needs_attention.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs border border-gray-100">
                    <span className="font-medium text-gray-700 truncate mr-2" title={item.material_name}>{item.material_name}</span>
                    <span className="font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{item.mastery_score}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="flex items-start gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 h-full">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium mb-1">Luar Biasa!</p>
                  <p className="text-emerald-700 opacity-90">Anda telah menguasai semua materi dengan baik di atas batas aman.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
