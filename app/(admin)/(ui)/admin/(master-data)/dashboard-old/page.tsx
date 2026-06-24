'use client'

import { useState } from 'react'
import { AdminStats } from '@/components/admin/admin-stats'
import { StudentProgressChart } from '@/components/admin/student-progress-chart'
import { StudentListTable } from '@/components/admin/student-list-table'
import { AdminActivityLog } from '@/components/admin/admin-activity-log'
import { CourseOverviewChart } from '@/components/admin/course-overview-chart'

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">Pantau perkembangan dan aktivitas siswa secara real-time</p>
        </div>

        {/* Stats Cards */}
        <AdminStats />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <StudentProgressChart period={selectedPeriod} onPeriodChange={setSelectedPeriod} />
          <CourseOverviewChart />
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <StudentListTable />
          </div>
          <div className="lg:col-span-1">
            <AdminActivityLog />
          </div>
        </div>
      </main>
    </div>
  )
}
