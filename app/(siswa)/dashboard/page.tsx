'use client'

import { useState } from 'react'
import { ProgressCards } from '@/components/dashboard/progress-cards'
import { ContinueLearning } from '@/components/dashboard/continue-learning'
import { StudentActivity } from '@/components/dashboard/student-activity'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { Statistics } from '@/components/dashboard/statistics'

export default function DashboardPage() {
  const [activeCard, setActiveCard] = useState('materi')

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl lg:text-[3.6rem] font-extrabold text-[#1e3a8a] mb-1 tracking-tight animate-slide-up">Halo, User!</h1>
          <p className="text-sm md:text-base text-gray-400 animate-slide-up-delay-1">Lanjutkan belajarmu hari ini</p>
        </div>

        {/* Progress Cards */}
        <ProgressCards activeCard={activeCard} onCardClick={setActiveCard} />

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 lg:auto-rows-fr min-h-80">
          <div className="lg:col-span-2">
            <ContinueLearning />
          </div>
          <div className="lg:col-span-1 h-full">
            <StudentActivity />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:auto-rows-fr min-h-80">
          <div className="lg:col-span-2">
            <OverviewChart />
          </div>
          <div className="lg:col-span-1 h-full">
            <Statistics />
          </div>
        </div>
      </main>
    </div>
  )
}
