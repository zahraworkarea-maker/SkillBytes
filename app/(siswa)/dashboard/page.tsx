'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ProgressCards } from '@/components/dashboard/progress-cards'
import { ContinueLearning } from '@/components/dashboard/continue-learning'
import { StudentActivity } from '@/components/dashboard/student-activity'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { Statistics } from '@/components/dashboard/statistics'
import { LazyLoad } from '@/hooks/use-lazy-load'

// Memoized components untuk prevent re-renders
const MemoizedProgressCards = ({ activeCard, onCardClick }: any) => 
  useMemo(() => <ProgressCards activeCard={activeCard} onCardClick={onCardClick} />, [activeCard, onCardClick])

const MemoizedContinueLearning = () => 
  useMemo(() => <ContinueLearning />, [])

const MemoizedStudentActivity = () => 
  useMemo(() => <StudentActivity />, [])

const MemoizedOverviewChart = () => 
  useMemo(() => <OverviewChart />, [])

const MemoizedStatistics = () => 
  useMemo(() => <Statistics />, [])

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
        <MemoizedProgressCards activeCard={activeCard} onCardClick={setActiveCard} />

        {/* Middle Row - Critical content, load immediately */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 lg:auto-rows-fr min-h-80">
          <div className="lg:col-span-2">
            <MemoizedContinueLearning />
          </div>
          <div className="lg:col-span-1 h-full">
            <MemoizedStudentActivity />
          </div>
        </div>

        {/* Bottom Row - Less critical, lazy load until visible */}
        <LazyLoad 
          placeholder={
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:auto-rows-fr min-h-80">
              <div className="lg:col-span-2 bg-gray-200 rounded animate-pulse" />
              <div className="lg:col-span-1 bg-gray-200 rounded animate-pulse" />
            </div>
          }
          threshold={0.1}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:auto-rows-fr min-h-80">
            <div className="lg:col-span-2">
              <MemoizedOverviewChart />
            </div>
            <div className="lg:col-span-1 h-full">
              <MemoizedStatistics />
            </div>
          </div>
        </LazyLoad>
      </main>
    </div>
  )
}
