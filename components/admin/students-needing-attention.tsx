'use client'

import { useEffect, useState } from 'react'
import { knowledgeTracingService } from '@/lib/api-services'
import { AlertCircle, Eye, Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function StudentsNeedingAttention() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const response = await knowledgeTracingService.getClassMastery()
        setStudents(response?.data?.students_needing_attention || [])
      } catch (error) {
        console.error('Failed to fetch students needing attention', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMastery()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-h-[300px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded w-full" />
          <div className="h-10 bg-gray-100 rounded w-full" />
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="font-medium text-gray-800">Semua Terkendali!</h3>
        <p className="text-sm text-gray-500 mt-1">Tidak ada siswa yang memiliki penguasaan materi di bawah standar.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-amber-600">
        <AlertCircle className="w-5 h-5" />
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Siswa Membutuhkan Perhatian</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Siswa dengan nilai Knowledge Tracing di bawah batas 60</p>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {students.map((student: any) => (
          <div key={student.user_id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-800">{student.name}</h4>
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                  <Eye className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail Penguasaan Materi</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Siswa: <span className="font-semibold text-gray-800">{student.name}</span>
                  </p>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {student.materials.map((mat: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white rounded border border-gray-200 shadow-sm">
                        <span className="text-gray-700 font-medium">{mat.material_name}</span>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{mat.mastery_score}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-700">
                      <Lightbulb className="w-4 h-4" />
                      <h5 className="font-semibold text-sm">Saran untuk Guru</h5>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Siswa ini kesulitan pada materi tertentu. Disarankan untuk memantau perkembangan siswa secara personal, memberikan tugas pengayaan, atau menjadwalkan sesi bimbingan tambahan khusus untuk mengatasi kelemahannya.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
}
