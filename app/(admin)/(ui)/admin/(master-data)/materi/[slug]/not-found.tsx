'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function MateriNotFound() {
  const router = useRouter()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <h2 className="text-lg font-semibold text-amber-800">Materi Tidak Ditemukan</h2>
        </div>
        
        <p className="text-amber-700 mb-6">
          Materi yang Anda cari tidak ada di dalam database. Slug atau ID yang digunakan mungkin tidak valid.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/admin/materi')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Daftar Materi
          </Button>
        </div>
      </div>
    </div>
  )
}
