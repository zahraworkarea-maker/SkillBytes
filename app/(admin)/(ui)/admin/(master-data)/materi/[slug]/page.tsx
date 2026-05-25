'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Search, Loader, ArrowLeft } from 'lucide-react'
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

export default function MateriStudentResumePage() {
  const router = useRouter()
  const params = useParams()
  const lessonSlug = params.slug as string

  const [lesson, setLesson] = useState<any | null>(null)
  const [studentResumes, setStudentResumes] = useState<StudentResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (lessonSlug) {
      fetchData()
    }
  }, [lessonSlug])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validate slug
      if (!lessonSlug || lessonSlug === 'undefined') {
        setError('Slug tidak valid atau kosong')
        notFound()
        return
      }

      console.log('Fetching lesson with slug:', lessonSlug)
      
      // Fetch lesson details by slug - use the correct endpoint
      const lessonResponse = await apiClient.get(`/lessons/${lessonSlug}`)
      const lessonDetails = lessonResponse.data.data || lessonResponse.data
      
      if (!lessonDetails || !lessonDetails.id) {
        console.warn('Lesson not found for slug:', lessonSlug)
        notFound()
        return
      }
      
      setLesson(lessonDetails)
      
      // Fetch all users
      const usersResponse = await userService.getAllUsers()
      const users = usersResponse.data || usersResponse
      
      // Fetch all resumes
      const resumesResponse = await userResumeService.getAllResumes()
      const allResumes = resumesResponse.data || resumesResponse

      // Filter resumes untuk lesson ini berdasarkan lesson_id
      const filteredResumes = (allResumes || []).filter(
        (resume: Resume) => resume.lesson_id === lessonDetails.id
      )

      // Group resumes by user_id
      const resumesByUserId = (filteredResumes || []).reduce((acc: any, resume: Resume) => {
        if (!acc[resume.user_id]) {
          acc[resume.user_id] = []
        }
        acc[resume.user_id].push(resume)
        return acc
      }, {})

      // Combine users with their resumes for this lesson
      const combined: StudentResume[] = (users || [])
        .map((user: User) => ({
          ...user,
          resumeCount: resumesByUserId[user.id]?.length || 0,
          resumes: resumesByUserId[user.id] || [],
        }))
        .filter((student: StudentResume) => student.resumeCount > 0) // Only show students with resumes for this lesson

      setStudentResumes(combined)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      
      // Check if error is 404
      if (error.response?.status === 404) {
        console.warn('Lesson not found (404)')
        notFound()
        return
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengambil data'
      setError(errorMessage)
      toast.error(errorMessage)
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
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
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
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Kembali
            </Button>
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header with Back Button */}
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
        <div>
          <h1 className="text-3xl font-bold">Resume Siswa - {lesson?.title || 'Materi'}</h1>
          {lesson?.description && (
            <p className="text-gray-600 mt-1">{lesson.description}</p>
          )}
        </div>
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
                  Tidak ada resume untuk materi ini
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
