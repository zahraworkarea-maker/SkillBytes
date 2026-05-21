'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus, Loader } from 'lucide-react'
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
import { assessmentLevelService, assessmentService } from '@/lib/api-services'
import { Assessment } from '@/lib/types/assessment.types'

// Data assessment yang sudah digabung dengan informasi level
interface AssessmentWithLevel extends Assessment {
  levelDisplay: string   // teks yang akan ditampilkan di kolom level
  levelNumber: number
}

export default function AssessmentManagementPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentWithLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Ambil semua level beserta assessment di dalamnya
      const levelRes = await assessmentLevelService.getAllAssessmentLevels(1, 100)
      if (levelRes.success && levelRes.data) {
        const levels = levelRes.data
        const flattened: AssessmentWithLevel[] = []
        for (const level of levels) {
          // Tentukan teks level: gunakan "Level X" dengan X adalah level_number
          // Bisa juga menggunakan level.description jika diinginkan
          const levelDisplay = `Level ${level.level_number}`
          if (level.assessments && level.assessments.length) {
            for (const assessment of level.assessments) {
              flattened.push({
                ...assessment,
                levelDisplay,
                levelNumber: level.level_number,
              })
            }
          }
        }
        setAssessments(flattened)
      } else {
        // Fallback: jika tidak ada data level, coba langsung ambil assessments (tanpa level)
        const assessmentRes = await assessmentService.getAllAssessments(1, 100)
        if (assessmentRes.success && assessmentRes.data) {
          setAssessments(assessmentRes.data.map((a: Assessment) => ({ ...a, levelDisplay: '-', levelNumber: 0 })))
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data assessment')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => router.push('/admin/assesmen/tambah')
  const handleEdit = (slug: string) => router.push(`/admin/assesmen/${slug}/edit`)

  const handleDelete = async (id: number) => {
    const Swal = (await import('sweetalert2')).default
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus assessment ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Tidak',
    })
    if (result.isConfirmed) {
      try {
        await assessmentService.deleteAssessment(id)
        setAssessments(prev => prev.filter(a => a.id !== id))
        toast.success('Assessment berhasil dihapus!')
      } catch {
        toast.error('Gagal menghapus assessment')
      }
    }
  }

  // Warna badge berdasarkan level number (opsional)
  const getLevelBadgeClass = (levelNumber: number) => {
    if (levelNumber === 1) return 'bg-green-100 text-green-800'
    if (levelNumber === 2) return 'bg-yellow-100 text-yellow-800'
    if (levelNumber === 3) return 'bg-orange-100 text-orange-800'
    if (levelNumber >= 4) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const columns: ColumnDef<AssessmentWithLevel>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}
                className="hover:bg-white/20 text-white font-bold">
          Judul
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" />
            : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" />
            : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate line-clamp-1">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'levelDisplay',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}
                className="hover:bg-white/20 text-white font-bold">
          Level
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" />
            : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" />
            : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => {
        const levelDisplay = row.original.levelDisplay
        const levelNumber = row.original.levelNumber
        const badgeClass = getLevelBadgeClass(levelNumber)
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
            {levelDisplay}
          </span>
        )
      },
    },
    {
      accessorKey: 'total_questions',
      header: 'Jumlah Soal',
      cell: ({ getValue }) => (
        <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-800">
          {getValue<number>()} Soal
        </span>
      ),
    },
    {
      accessorKey: 'time_limit',
      header: 'Waktu (Menit)',
      cell: ({ getValue }) => {
        const val = getValue<number>()
        // Tampilkan waktu asli (atau kurangi 5 sesuai aturan bisnis)
        return `${val - 5} Menit`
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
            onClick={() => handleEdit(row.original.slug)}
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
    data: assessments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  })

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Kelola Assessment
        </h1>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <Plus className="mr-2 h-5 w-5" /> Tambah Assessment
        </Button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
        <Input
          placeholder="Cari assessment..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadData()}
          className="pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <div className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-white font-bold py-5 px-6">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, idx) => (
                  <TableRow key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-5 px-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-blue-600">
                    Tidak ada data assessment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}