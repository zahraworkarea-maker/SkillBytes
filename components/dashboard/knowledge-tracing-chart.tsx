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

        {/* Mastery Levels Side */}
        <div className="flex flex-col gap-2 h-full max-h-64 md:max-h-full">
          <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Detail Penguasaan Materi</h4>
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
            {mastery_list.map((item: any, idx: number) => {
              const score = item.mastery_score;
              let statusText = "Sangat Baik";
              let bgClass = "bg-emerald-50 border-emerald-100";
              let textClass = "text-emerald-700";
              let barClass = "bg-emerald-500";
              
              if (score < 40) {
                statusText = "Sangat Kurang";
                bgClass = "bg-red-50 border-red-100";
                textClass = "text-red-700";
                barClass = "bg-red-500";
              } else if (score < 60) {
                statusText = "Perlu Perhatian";
                bgClass = "bg-orange-50 border-orange-100";
                textClass = "text-orange-700";
                barClass = "bg-orange-500";
              } else if (score < 80) {
                statusText = "Cukup";
                bgClass = "bg-amber-50 border-amber-100";
                textClass = "text-amber-700";
                barClass = "bg-amber-500";
              }

              return (
                <div key={idx} className={`flex flex-col p-2.5 rounded-lg border ${bgClass}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium text-xs mr-2 ${textClass}`} title={item.material_name}>
                      {item.material_name}
                    </span>
                    <span className={`font-bold text-xs ${textClass}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider opacity-80 ${textClass}`}>
                      {statusText}
                    </span>
                    <div className="w-20 h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barClass}`} 
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
