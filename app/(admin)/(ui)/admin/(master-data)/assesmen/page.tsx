'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Plus, CheckCircle } from 'lucide-react'
import { assessmentDatabase } from '@/lib/assessment-data'
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

export default function AssessmentManagementPage() {
  const router = useRouter()
  const allAssessments = Object.values(assessmentDatabase)
  const [assessments, setAssessments] = useState(allAssessments)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const handleAdd = () => {
    router.push('/admin/assesmen/tambah')
  }

  const handleDelete = async (id: string) => {
    const Swal = (await import('sweetalert2')).default
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus assesmen ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    })

    if (result.isConfirmed) {
      setAssessments(assessments.filter(assessment => assessment.id !== id))
      toast.success('Assesmen berhasil dihapus!')
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
      accessorKey: 'totalQuestions',
      header: 'Jumlah Soal',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          {getValue<number>()} Soal
        </span>
      ),
    },
    {
      accessorKey: 'timeLimit',
      header: 'Waktu Limit (Menit)',
      cell: ({ getValue }) => `${getValue<number>()} Menit`,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/master-data/assesmen/${row.original.id}/edit`)}
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
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Kelola Assesmen
        </h1>
        <Button onClick={handleAdd} className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Plus className="mr-2 h-5 w-5" />
          Tambah Assesmen
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          <Input
            placeholder="Cari assesmen..."
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
    </div>
  )
}
