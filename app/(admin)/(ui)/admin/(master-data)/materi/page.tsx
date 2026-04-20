'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus, BookOpen } from 'lucide-react'
import { materiData, DifficultyLevel } from '@/lib/materi-data'
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

export default function MateriManagementPage() {
  const allLessons = materiData.flatMap(course =>
    course.levels.flatMap(level =>
      level.lessons.map(lesson => ({
        ...lesson,
        courseTitle: course.title,
        levelNumber: level.levelNumber,
      }))
    )
  )
  const [lessons, setLessons] = useState(allLessons)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Pemula' as DifficultyLevel,
    duration: '',
  })

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration || '',
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingLesson(null)
    setFormData({
      title: '',
      description: '',
      difficulty: 'Pemula',
      duration: '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
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
      setLessons(lessons.filter(lesson => lesson.id !== id))
      toast.success('Materi berhasil dihapus!')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingLesson) {
      // Edit tanpa konfirmasi
      setLessons(lessons.map(lesson =>
        lesson.id === editingLesson.id
          ? { ...lesson, ...formData }
          : lesson
      ))
      toast.success('Materi berhasil diedit!')
      setIsDialogOpen(false)
    } else {
      // Add tanpa konfirmasi
      const newLesson: any = {
        id: Date.now().toString(),
        ...formData,
        icon: BookOpen, // Default icon
        completed: false,
        courseTitle: 'Pemrograman Berorientasi Objek', // Default course
        levelNumber: 1, // Default level
      }
      setLessons([...lessons, newLesson])
      toast.success('Materi berhasil ditambahkan!')
      setIsDialogOpen(false)
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
        <div className="max-w-xs truncate">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Durasi',
    },
    {
      accessorKey: 'levelNumber',
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
        <Button onClick={handleAdd} className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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
            <DialogTitle className="text-blue-900 text-xl font-bold">{editingLesson ? 'Edit Materi' : 'Tambah Materi'}</DialogTitle>
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
                required
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Durasi</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 25 Menit"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200">
                Batal
              </Button>
              <Button type="submit" className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {editingLesson ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}