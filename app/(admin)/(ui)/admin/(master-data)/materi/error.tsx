'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function MateriSlugError({ error, reset }: ErrorProps) {
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

      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h2>
        </div>
        
        <p className="text-red-700 mb-6">
          {error.message || 'Tidak dapat mengakses halaman ini. Slug materi tidak valid atau materi tidak ditemukan.'}
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Coba Lagi
          </Button>
          <Button
            onClick={() => router.push('/admin/materi')}
            variant="outline"
            className="border-red-300 hover:bg-red-50"
          >
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    </div>
  )
}
