'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus, Code, Upload, X, AlertCircle } from 'lucide-react'
import { pblCasesData } from '@/lib/pbl-data'
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

const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1 MB

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file extension
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return { valid: false, error: `Format gambar harus: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}` }
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
    return { valid: false, error: `Format gambar harus: JPG, JPEG, PNG, GIF, WebP, BMP, atau SVG` }
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Ukuran gambar maksimal ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}

export default function PBLManagementPage() {
  const allCases = Object.values(pblCasesData)
  const [cases, setCases] = useState(allCases)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<any | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master',
    description: '',
    startDate: '',
    deadline: '',
    imageFile: null as File | null,
    imageUrl: '',
  })

  const calculateTimeLimitInMinutes = (start: string, end: string): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffInMs = endDate.getTime() - startDate.getTime()
    return Math.round(diffInMs / (1000 * 60))
  }

  const handleEdit = (caseItem: any) => {
    setEditingCase(caseItem)
    setFormData({
      title: caseItem.title,
      level: caseItem.level,
      description: caseItem.description,
      startDate: caseItem.startDate,
      deadline: caseItem.deadline,
      imageFile: null,
      imageUrl: caseItem.imageUrl || '',
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCase(null)
    setFormData({
      title: '',
      level: 'Beginner',
      description: '',
      startDate: '',
      deadline: '',
      imageFile: null,
      imageUrl: '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const Swal = (await import('sweetalert2')).default
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus kasus PBL ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    })

    if (result.isConfirmed) {
      setCases(cases.filter(caseItem => caseItem.id !== id))
      toast.success('Kasus PBL berhasil dihapus!')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCase) {
      // Edit tanpa konfirmasi
      setCases(cases.map(caseItem =>
        caseItem.id === editingCase.id
          ? {
              ...caseItem,
              title: formData.title,
              level: formData.level,
              description: formData.description,
              timeLimit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
              startDate: formData.startDate,
              deadline: formData.deadline,
              imageUrl: formData.imageUrl,
            }
          : caseItem
      ))
      toast.success('Kasus PBL berhasil diedit!')
      setIsDialogOpen(false)
    } else {
      // Add tanpa konfirmasi
      const newCase: any = {
        id: `case-${Date.now().toString()}`,
        caseNumber: cases.length + 1,
        title: formData.title,
        level: formData.level,
        description: formData.description,
        content: `<div><p>${formData.description}</p></div>`,
        timeLimit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
        isCompleted: false,
        startDate: formData.startDate,
        deadline: formData.deadline,
        status: 'not-started',
        imageUrl: formData.imageUrl,
      }
      setCases([...cases, newCase])
      toast.success('Kasus PBL berhasil ditambahkan!')
      setIsDialogOpen(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'Advanced':
        return 'bg-orange-100 text-orange-800'
      case 'Expert':
        return 'bg-red-100 text-red-800'
      case 'Master':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      accessorKey: 'level',
      header: 'Level',
      cell: ({ getValue }) => {
        const level = getValue<string>()
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(level)}`}>
            {level}
          </span>
        )
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Tanggal Mulai',
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>())
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      },
    },
    {
      accessorKey: 'deadline',
      header: 'Tanggal Deadline',
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>())
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
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
            onClick={() => handleDelete(row.original.id)}
            className="border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: cases,
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
          Kelola Kasus PBL
        </h1>
        <Button onClick={handleAdd} className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Plus className="mr-2 h-5 w-5" />
          Tambah Kasus PBL
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          <Input
            placeholder="Cari kasus PBL..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
          />
        </div>
      </div>

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-2 border-blue-200 bg-white/95 backdrop-blur-sm shadow-2xl">
          <DialogHeader className="border-b-2 border-blue-200 pb-4">
            <DialogTitle className="text-blue-900 text-xl font-bold">{editingCase ? 'Edit Kasus PBL' : 'Tambah Kasus PBL'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi kasus PBL..."
              />
            </div>
            <div>
              <Label htmlFor="level">Level Kesulitan</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
                <option value="Master">Master</option>
              </select>
            </div>
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="deadline">Tanggal Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>            <div>
              <Label htmlFor="imageFile">Gambar Kasus</Label>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Format yang diizinkan: JPG, JPEG, PNG, GIF, WebP, BMP, SVG (Max 1MB)
              </p>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                onDrop={(e) => {
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
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('imageFileInput')?.click()}
              >
                {formData.imageFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-700">{formData.imageFile.name}</p>
                        <p className="text-sm text-gray-500">{(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <p className="text-left font-semibold text-gray-700">Gambar saat ini tersimpan</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, imageUrl: '' })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-gray-700 font-medium">Drag and drop gambar di sini</p>
                    <p className="text-sm text-gray-500">atau klik untuk memilih file</p>
                  </div>
                )}
              </div>
              <input
                id="imageFileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                onChange={(e) => {
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
                }}
                className="hidden"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200">
                Batal
              </Button>
              <Button type="submit" className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {editingCase ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
