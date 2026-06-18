'use client'

import { useEffect, useState } from 'react'
import { knowledgeTracingService } from '@/lib/api-services'
import { AlertTriangle, Eye, Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function MaterialsNeedingAttention() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const response = await knowledgeTracingService.getClassMastery()
        const averages = response?.data?.class_averages || []
        // Filter materials with average mastery below 60
        const needingAttention = averages.filter((mat: any) => mat.average_mastery < 60)
        setMaterials(needingAttention)
      } catch (error) {
        console.error('Failed to fetch materials needing attention', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMastery()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-h-[200px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded w-full" />
          <div className="h-12 bg-gray-100 rounded w-full" />
        </div>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="font-medium text-gray-800">Penguasaan Materi Kelas Baik!</h3>
        <p className="text-sm text-gray-500 mt-1">Rata-rata kelas untuk semua materi berada di atas standar.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-orange-600">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Materi Butuh Perhatian Khusus</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Materi dengan rata-rata penguasaan kelas di bawah batas standar (60%)</p>
      
      <div className="space-y-3">
        {materials.map((mat: any, idx: number) => (
          <div key={idx} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm text-gray-800">{mat.material_name}</h4>
              <p className="text-xs text-gray-500 mt-1">Rata-rata: <span className="font-semibold text-orange-600">{mat.average_mastery}%</span></p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-md transition-colors" title="Lihat Detail & Saran">
                  <Eye className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail & Saran Tindakan</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Materi</p>
                    <p className="font-medium text-gray-800">{mat.material_name}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Rata-rata Penguasaan Kelas</p>
                      <span className="font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">{mat.average_mastery}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-700">
                      <Lightbulb className="w-4 h-4" />
                      <h5 className="font-semibold text-sm">Saran untuk Guru</h5>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Rata-rata penguasaan kelas pada materi ini berada di bawah batas standar. Disarankan untuk mengulas kembali konsep inti materi ini di kelas, memberikan latihan tambahan secara spesifik, atau menggunakan pendekatan pengajaran yang berbeda (seperti contoh kasus nyata atau visualisasi) untuk membantu meningkatkan pemahaman kolektif siswa.
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
