'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'
import { AlertCircle, Upload, X } from 'lucide-react'

export type PBLSectionItemType = 'text' | 'image' | 'video' | 'file'

export interface PBLSectionItemFormData {
  id?: string
  type: PBLSectionItemType
  content?: string
  imageUrl?: string
  imageFile?: File | null
  order?: number
  fileUrl?: string
}

interface PBLSectionItemFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PBLSectionItemFormData | null
  onSubmit: (data: PBLSectionItemFormData) => void | Promise<void>
  isLoading?: boolean
}

const ALLOWED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
]
const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
]
const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1 MB

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  )

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Format gambar harus: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    }
  }

  if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error:
        'Format gambar harus: JPG, JPEG, PNG, GIF, WebP, BMP, atau SVG',
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Ukuran gambar maksimal ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

export function PBLSectionItemForm({
  isOpen,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading = false,
}: PBLSectionItemFormProps) {
  const [formData, setFormData] = useState<PBLSectionItemFormData>({
    type: initialData?.type || 'text',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    imageFile: null,
    order: initialData?.order || 1,
    fileUrl: initialData?.fileUrl || '',
  })

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const validation = validateImageFile(files[0])
      if (validation.valid) {
        setFormData({ ...formData, imageFile: files[0] })
        toast.success('Gambar berhasil dipilih!')
      } else {
        toast.error(validation.error)
      }
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateImageFile(file)
      if (validation.valid) {
        setFormData({ ...formData, imageFile: file })
        toast.success('Gambar berhasil dipilih!')
      } else {
        toast.error(validation.error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.type === 'text' && !formData.content?.trim()) {
      toast.error('Konten tidak boleh kosong')
      return
    }

    try {
      await onSubmit({
        ...formData,
        id: initialData?.id,
      })
      setFormData({
        type: 'text',
        content: '',
        imageUrl: '',
        imageFile: null,
        order: 1,
        fileUrl: '',
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-blue-200 bg-white/95 backdrop-blur-sm shadow-2xl max-w-md">
        <DialogHeader className="border-b-2 border-blue-200 pb-4">
          <DialogTitle className="text-blue-900 text-xl font-bold">
            {initialData ? 'Edit Item' : 'Tambah Item Baru'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Ubah informasi item section di bawah ini'
              : 'Tambahkan item baru ke section'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item-type">Tipe Item</Label>
            <select
              id="item-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as PBLSectionItemType,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-200 transition-all"
              disabled={isLoading}
            >
              <option value="text">Teks</option>
              <option value="image">Gambar</option>
              <option value="video">Video</option>
              <option value="file">File</option>
            </select>
          </div>

          {formData.type === 'text' && (
            <div>
              <Label htmlFor="item-content">Konten</Label>
              <Textarea
                id="item-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Masukkan konten teks"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {formData.type === 'image' && (
            <div>
              <Label htmlFor="item-image">Gambar</Label>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Format: JPG, JPEG, PNG, GIF, WebP, BMP, SVG (Max 1MB)
              </p>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() =>
                  document.getElementById('imageFileInput')?.click()
                }
              >
                {formData.imageFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-700 text-sm">
                          {formData.imageFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(
                            formData.imageFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{' '}
                          MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, imageFile: null })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <p className="text-left font-semibold text-gray-700 text-sm">
                        Gambar tersimpan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, imageUrl: '' })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-6 h-6 text-blue-400 mb-1" />
                    <p className="text-gray-700 font-medium text-sm">
                      Drag and drop gambar
                    </p>
                    <p className="text-xs text-gray-500">atau klik</p>
                  </div>
                )}
              </div>
              <input
                id="imageFileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          )}

          {formData.type === 'video' && (
            <div>
              <Label htmlFor="item-video">URL Video</Label>
              <Input
                id="item-video"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="https://youtube.com/..."
                required
                disabled={isLoading}
              />
            </div>
          )}

          {formData.type === 'file' && (
            <div>
              <Label htmlFor="item-file">URL File</Label>
              <Input
                id="item-file"
                value={formData.fileUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                placeholder="https://..."
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="item-order">Urutan</Label>
            <Input
              id="item-order"
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
              className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all"
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
