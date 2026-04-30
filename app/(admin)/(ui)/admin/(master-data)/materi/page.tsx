'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus, BookOpen, Upload, X, Loader } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { toast } from 'react-toastify'
import apiClient from '@/lib/api-client'

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
type DifficultyLevel = '1' | '2' | '3'

interface LevelMapping {
  level_number: number
  level_id: number
}

const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'File harus berekstensi .pdf' }
  }

  // Check MIME type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Hanya file PDF yang diizinkan!' }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}

export default function MateriManagementPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [levelMappings, setLevelMappings] = useState<LevelMapping[]>([])
  const [formData, setFormData] = useState({
    title: '',
    level_id: '' as string,
    level_number: '1' as DifficultyLevel,
    duration: '',
    pdfFile: null as File | null,
    pdfUrl: '',
    description: '',
  })

  // Fetch data from API on component mount
  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setIsLoading(true)
      // Fetch dari /levels/all untuk mendapatkan lessons yang grouped by level
      const response = await apiClient.get('/levels/all')
      const levels = response.data.data || []
      
      // Buat mapping level_number ke level_id
      const mappings = levels.map((level: any) => ({
        level_number: level.level_number,
        level_id: level.id,
      }))
      setLevelMappings(mappings)
      
      // Flatten lessons dari semua levels, tambahkan level_number dan level_id ke setiap lesson
      const flattenedLessons = levels.flatMap((level: any) => 
        level.lessons.map((lesson: any) => ({
          ...lesson,
          level_number: level.level_number,
          level_id: level.id,
        }))
      )
      
      setLessons(flattenedLessons)
    } catch (error: any) {
      console.error('Error fetching lessons:', error)
      toast.error('Gagal mengambil data materi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      level_id: lesson.level_id?.toString() || levelMappings[0]?.level_id.toString() || '',
      level_number: lesson.level_number?.toString() || '1',
      duration: lesson.duration || '',
      pdfFile: null,
      pdfUrl: lesson.pdf_url || '',
      description: lesson.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingLesson(null)
    const firstLevelId = levelMappings[0]?.level_id.toString() || ''
    setFormData({
      title: '',
      level_id: firstLevelId,
      level_number: '1',
      duration: '',
      pdfFile: null,
      pdfUrl: '',
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (slug: string) => {
    const Swal = (await import('sweetalert2')).default
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus materi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    })

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/lessons/${slug}`)
        setLessons(lessons.filter(lesson => lesson.slug !== slug))
        toast.success('Materi berhasil dihapus!')
      } catch (error: any) {
        console.error('Error deleting lesson:', error)
        toast.error(error.response?.data?.message || 'Gagal menghapus materi')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Judul materi tidak boleh kosong!')
      return
    }

    try {
      setIsSaving(true)
      const submitData = new FormData()
      
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('duration', formData.duration)
      submitData.append('level_id', formData.level_id) // Kirim level_id ke backend
      
      if (formData.pdfFile) {
        submitData.append('pdf_file', formData.pdfFile)
      }

      if (editingLesson) {
        // Update existing lesson
        await apiClient.put(`/lessons/${editingLesson.slug}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Materi berhasil diperbarui!')
      } else {
        // Create new lesson
        await apiClient.post('/lessons', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Materi berhasil ditambahkan!')
      }

      setIsDialogOpen(false)
      await fetchLessons() // Refresh list
    } catch (error: any) {
      console.error('Error saving lesson:', error)
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan materi'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-white/20 text-white font-bold hover:text-blue-100 transition-colors duration-200"
          >
            Judul
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate line-clamp-1">{getValue<string>()}</div>
      ),
    },

    {
      accessorKey: 'duration',
      header: 'Durasi',
      cell: ({ getValue }) => {
        const duration = getValue<string>()
        // Remove "menit" jika sudah ada, untuk mencegah double
        const cleanDuration = duration?.replace(/\s*menit\s*/gi, '').trim() || '0'
        return <span>{cleanDuration} menit</span>
      },
    },
    {
      accessorKey: 'level_number',
      header: 'Level',
      cell: ({ getValue }) => {
        const level = getValue() as number
        const color = level === 1 ? 'bg-blue-100 text-blue-800' :
                      level === 2 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            Level {level}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
            className="border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.slug)}
            className="border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: lessons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Kelola Materi
        </h1>
        <Button 
          onClick={handleAdd} 
          disabled={isLoading || isSaving}
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Materi
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          <Input
            placeholder="Cari materi..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            disabled={isLoading}
            className="pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm disabled:opacity-50"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-blue-600 font-medium">Memuat data materi...</p>
          </div>
        </div>
      ) : (
        <Table className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm">
          <TableHeader className="bg-linear-to-r from-blue-600 to-blue-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-blue-500/10 transition-colors duration-200">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-white font-bold py-5 px-6 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-linear-to-r hover:from-blue-50 hover:to-blue-25 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md ${
                    index % 2 === 0 ? 'bg-white' : 'bg-blue-25/50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5 px-6 text-gray-700 font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-blue-600 py-12 text-lg font-medium">
                  <div className="flex flex-col items-center space-y-2">
                    <Search className="h-8 w-8 text-blue-300" />
                    <span>Tidak ada data yang ditemukan</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-2 border-blue-200 bg-white/95 backdrop-blur-sm shadow-2xl">
          <DialogHeader className="border-b-2 border-blue-200 pb-4">
            <DialogTitle className="text-blue-900 text-xl font-bold">{editingLesson ? 'Edit Materi' : 'Tambah Materi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSaving}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi materi..."
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="level_id">Tingkat Level</Label>
              <select
                id="level_id"
                value={formData.level_id}
                onChange={(e) => {
                  const selectedId = e.target.value
                  const mapping = levelMappings.find(m => m.level_id.toString() === selectedId)
                  setFormData({ 
                    ...formData, 
                    level_id: selectedId,
                    level_number: (mapping?.level_number.toString() || '1') as DifficultyLevel
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
                required
              >
                {levelMappings.map((mapping) => (
                  <option key={mapping.level_id} value={mapping.level_id}>
                    Level {mapping.level_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Durasi</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="contoh : 25 (dalam hitngan menit)"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="pdfFile">File PDF</Label>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onDrop={(e) => {
                  if (isSaving) return
                  e.preventDefault()
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    const validation = validatePdfFile(files[0])
                    if (validation.valid) {
                      setFormData({ ...formData, pdfFile: files[0] })
                      toast.success('File PDF berhasil dipilih!')
                    } else {
                      toast.error(validation.error)
                    }
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !isSaving && document.getElementById('pdfFileInput')?.click()}
              >
                {formData.pdfFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-700">{formData.pdfFile.name}</p>
                        <p className="text-sm text-gray-500">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, pdfFile: null })
                      }}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-gray-700 font-medium">Drag and drop PDF di sini</p>
                    <p className="text-sm text-gray-500">atau klik untuk memilih file</p>
                  </div>
                )}
              </div>
              <input
                id="pdfFileInput"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const validation = validatePdfFile(file)
                    if (validation.valid) {
                      setFormData({ ...formData, pdfFile: file })
                      toast.success('File PDF berhasil dipilih!')
                    } else {
                      toast.error(validation.error)
                    }
                  }
                }}
                disabled={isSaving}
                className="hidden"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={isSaving}
                className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader className="h-4 w-4 animate-spin" />}
                {editingLesson ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}