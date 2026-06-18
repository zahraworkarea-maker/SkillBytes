'use client'

import { ClassMasteryChart } from '@/components/admin/class-mastery-chart'
import { StudentsNeedingAttention } from '@/components/admin/students-needing-attention'
import { MaterialsNeedingAttention } from '@/components/admin/materials-needing-attention'
import { BookOpenCheck } from 'lucide-react'

export default function AdminKnowledgeTracingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <BookOpenCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e3a8a] tracking-tight">
              Knowledge Tracing Dashboard
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Pantau hasil analisis tingkat penguasaan materi (Mastery) gabungan dari Assessment dan Pembelajaran Berbasis Proyek (PBL) seluruh siswa.
          </p>
        </div>

        {/* Knowledge Tracing Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="h-[450px]">
              <ClassMasteryChart />
            </div>
            <div>
              <StudentsNeedingAttention />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-full min-h-[350px] sticky top-6">
              <MaterialsNeedingAttention />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
