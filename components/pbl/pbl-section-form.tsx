'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

export interface PBLSectionFormData {
  id?: string
  title: string
  description?: string
  order?: number
}

interface PBLSectionFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PBLSectionFormData | null
  onSubmit: (data: PBLSectionFormData) => void | Promise<void>
  isLoading?: boolean
}

export function PBLSectionForm({
  isOpen,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading = false,
}: PBLSectionFormProps) {
  const [formData, setFormData] = useState<PBLSectionFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    order: initialData?.order || 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Judul section tidak boleh kosong')
      return
    }

    try {
      await onSubmit({
        ...formData,
        id: initialData?.id,
      })
      setFormData({
        title: '',
        description: '',
        order: 1,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-blue-200 bg-white/95 backdrop-blur-sm shadow-2xl">
        <DialogHeader className="border-b-2 border-blue-200 pb-4">
          <DialogTitle className="text-blue-900 text-xl font-bold">
            {initialData ? 'Edit Section' : 'Tambah Section Baru'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Ubah informasi section di bawah ini'
              : 'Tambahkan section baru dengan mengisi form di bawah ini'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="section-title">Judul Section</Label>
            <Input
              id="section-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Masukkan judul section"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="section-description">Deskripsi (Opsional)</Label>
            <Textarea
              id="section-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan deskripsi section"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="section-order">Urutan</Label>
            <Input
              id="section-order"
              type="number"
              min="1"
              value={formData.order ?? 1}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Menyimpan...'
                : initialData
                  ? 'Simpan'
                  : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
