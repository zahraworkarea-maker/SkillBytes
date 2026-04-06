'use client'

import { ClipboardList, Clock, User } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const statsData = [
  {
    label: 'Absence',
    value: 90,
    barColor: 'bg-blue-500',
    icon: <User className="w-3.5 h-3.5 text-blue-500" />,
    iconBg: 'bg-blue-100',
  },
  {
    label: 'Tasks & Exam',
    value: 70,
    barColor: 'bg-green-500',
    icon: <ClipboardList className="w-3.5 h-3.5 text-green-500" />,
    iconBg: 'bg-green-100',
  },
  {
    label: 'Quiz',
    value: 85,
    barColor: 'bg-orange-400',
    icon: <Clock className="w-3.5 h-3.5 text-orange-400" />,
    iconBg: 'bg-orange-100',
  },
]

function CircularProgress({ value, size = 120, isInView }: { value: number; size?: number; isInView: boolean }) {
  const strokeWidth = 11
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = !isInView ? circumference : circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center animate-scale-in-delay-2" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: isInView ? 'stroke-dashoffset 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s' : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{value}%</span>
        <span className="text-xs text-gray-500 text-center leading-tight">
          Grades
          <br />
          Completed
        </span>
      </div>
    </div>
  )
}

export function Statistics() {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-scale-in-delay-3 flex flex-col h-full">
      <div className="mb-4 md:mb-5" style={{
        animation: isInView ? 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        opacity: isInView ? 1 : 0,
      }}>
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Statistics</h3>
        <p className="text-xs md:text-sm text-gray-400 mt-0.5">Januari - June 2025</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 flex-1">
        <div className="flex-1 space-y-4">
          {statsData.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`flex items-center gap-2 md:gap-2.5 animate-scale-in ${
                index === 0 && 'animate-scale-in-delay-1'
              } ${index === 1 && 'animate-scale-in-delay-2'} ${index === 2 && 'animate-scale-in-delay-3'}`}
            >
              <div className={`w-6 md:w-7 h-6 md:h-7 ${stat.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-1 mb-1">
                  <span className="text-xs md:text-sm text-gray-600 truncate">{stat.label}</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-800 shrink-0">{stat.value}%</span>
                </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.barColor} rounded-full transition-all ${isInView ? 'animate-progress-fill-delay-' + (index + 1) : 'w-0'}`}
                    style={{
                      width: isInView ? `${stat.value}%` : '0%',
                      animation: isInView ? `progressFill 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.3}s both` : 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <CircularProgress value={75} size={100} isInView={isInView} />
      </div>
    </div>
  )
}
