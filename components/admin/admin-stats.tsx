'use client'

import { Users, BookOpenCheck, BarChart3, Zap } from 'lucide-react'

const stats = [
  {
    label: 'Total Siswa',
    value: '128',
    change: '+12%',
    icon: Users,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
  },
  {
    label: 'Kursus Aktif',
    value: '5',
    change: '+2%',
    icon: BookOpenCheck,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
  },
  {
    label: 'Rata-rata Progress',
    value: '68%',
    change: '+8%',
    icon: BarChart3,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
  },
  {
    label: 'Assessment Completion',
    value: '92%',
    change: '+5%',
    icon: Zap,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
  },
]

export function AdminStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.textColor} p-3 rounded-lg bg-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-green-600">{stat.change}</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        )
      })}
    </div>
  )
}
