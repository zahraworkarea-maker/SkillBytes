'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Search, Loader } from 'lucide-react'
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
import { userService, userResumeService } from '@/lib/api-services'

interface User {
  id: number
  name: string
  email: string
}

interface Resume {
  id: number
  user_id: number
  lesson_id: number
  content: string
  created_at: string
  updated_at: string
}

interface StudentResume {
  id: number
  name: string
  email: string
  resumeCount: number
  resumes: Resume[]
}

export default function StudentResumePage() {
  const [studentResumes, setStudentResumes] = useState<StudentResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchStudentResumes()
  }, [])

  const fetchStudentResumes = async () => {
    try {
      setIsLoading(true)
      // Fetch all users
      const usersResponse = await userService.getAllUsers()
      const users = usersResponse.data || usersResponse
      
      // Fetch all resumes
      const resumesResponse = await userResumeService.getAllResumes()
      const allResumes = resumesResponse.data || resumesResponse

      // Group resumes by user_id
      const resumesByUserId = (allResumes || []).reduce((acc: any, resume: Resume) => {
        if (!acc[resume.user_id]) {
          acc[resume.user_id] = []
        }
        acc[resume.user_id].push(resume)
        return acc
      }, {})

      // Combine users with their resumes
      const combined: StudentResume[] = (users || []).map((user: User) => ({
        ...user,
        resumeCount: resumesByUserId[user.id]?.length || 0,
        resumes: resumesByUserId[user.id] || [],
      }))

      setStudentResumes(combined)
    } catch (error: any) {
      console.error('Error fetching student resumes:', error)
      toast.error('Gagal mengambil data resume siswa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewResume = (resume: Resume, student: StudentResume) => {
    setSelectedResume(resume)
    setSelectedStudent({
      id: student.id,
      name: student.name,
      email: student.email,
    })
    setIsModalOpen(true)
  }

  const columns: ColumnDef<StudentResume>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Siswa',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'resumeCount',
      header: 'Jumlah Resume',
      cell: (info) => info.getValue(),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: (info) => {
        const student = info.row.original
        return (
          <div className="flex gap-2 flex-wrap">
            {student.resumes.length > 0 ? (
              student.resumes.map((resume) => (
                <Button
                  key={resume.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewResume(resume, student)}
                  title={`Lihat Resume ${resume.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ))
            ) : (
              <span className="text-sm text-gray-500">Tidak ada resume</span>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: studentResumes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Memuat data resume siswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Siswa</h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Cari nama atau email siswa..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="cursor-pointer">
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-2"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  Tidak ada data resume ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for Viewing Resume */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Siswa</DialogTitle>
            <DialogDescription>
              {selectedStudent && <span>{selectedStudent.name} - {selectedStudent.email}</span>}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedResume && (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                  {selectedResume.content}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
