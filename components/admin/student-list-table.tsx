'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Student {
  id: string
  name: string
  email: string
  enrollmentDate: string
  progress: number
  status: 'active' | 'inactive' | 'completed'
  coursesCompleted: number
  assessmentScore: number
}

const studentData: Student[] = [
  {
    id: '1',
    name: 'Aulia Rahman',
    email: 'aulia.rahman@student.com',
    enrollmentDate: '2024-01-15',
    progress: 92,
    status: 'active',
    coursesCompleted: 4,
    assessmentScore: 88,
  },
  {
    id: '2',
    name: 'Dina Putri',
    email: 'dina.putri@student.com',
    enrollmentDate: '2024-02-10',
    progress: 78,
    status: 'active',
    coursesCompleted: 3,
    assessmentScore: 82,
  },
  {
    id: '3',
    name: 'Rendra Wijaya',
    email: 'rendra.wijaya@student.com',
    enrollmentDate: '2024-01-20',
    progress: 65,
    status: 'active',
    coursesCompleted: 2,
    assessmentScore: 75,
  },
  {
    id: '4',
    name: 'Siti Nurjanah',
    email: 'siti.nurjanah@student.com',
    enrollmentDate: '2024-03-05',
    progress: 88,
    status: 'active',
    coursesCompleted: 3,
    assessmentScore: 85,
  },
  {
    id: '5',
    name: 'Budi Santoso',
    email: 'budi.santoso@student.com',
    enrollmentDate: '2024-02-15',
    progress: 45,
    status: 'inactive',
    coursesCompleted: 1,
    assessmentScore: 60,
  },
  {
    id: '6',
    name: 'Maya Wijaya',
    email: 'maya.wijaya@student.com',
    enrollmentDate: '2023-12-01',
    progress: 100,
    status: 'completed',
    coursesCompleted: 5,
    assessmentScore: 95,
  },
  {
    id: '7',
    name: 'Farah Anwar',
    email: 'farah.anwar@student.com',
    enrollmentDate: '2024-03-10',
    progress: 58,
    status: 'active',
    coursesCompleted: 2,
    assessmentScore: 70,
  },
  {
    id: '8',
    name: 'Hendra Kusuma',
    email: 'hendra.kusuma@student.com',
    enrollmentDate: '2024-02-20',
    progress: 72,
    status: 'active',
    coursesCompleted: 2,
    assessmentScore: 78,
  },
]

export function StudentListTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('progress')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredAndSortedData = useMemo(() => {
    let data = [...studentData]

    // Filter by search term
    if (searchTerm) {
      data = data.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      data = data.filter((student) => student.status === filterStatus)
    }

    // Sort
    data.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
        default:
          return 0
      }
    })

    return data
  }, [searchTerm, sortBy, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Tidak Aktif'
      case 'completed':
        return 'Selesai'
      default:
        return ''
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-blue-600'
    if (progress >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-3">
      {/* Header dengan Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-4">Daftar Siswa</h3>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari siswa..."
              className="pl-10 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Sort: Progress</SelectItem>
              <SelectItem value="name">Sort: Nama</SelectItem>
              <SelectItem value="date">Sort: Tanggal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-700">Nama</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700">Email</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 text-right">Progress</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 text-center">Kursus Selesai</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 text-right">Nilai Assessment</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((student) => (
              <TableRow
                key={student.id}
                className="border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <TableCell className="text-sm font-medium text-gray-900">{student.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{student.email}</TableCell>
                <TableCell className="text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className={`font-semibold text-sm ${getProgressColor(student.progress)}`}>
                      {student.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-center text-gray-900 font-medium">
                  {student.coursesCompleted}
                </TableCell>
                <TableCell className="text-sm text-right text-gray-900 font-medium">
                  {student.assessmentScore}%
                </TableCell>
                <TableCell className="text-sm">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(student.status)} text-xs font-medium`}
                  >
                    {getStatusLabel(student.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Tidak ada siswa ditemukan</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
        <p>Total Siswa: {filteredAndSortedData.length}</p>
        <p>
          Progress Rata-rata:{' '}
          <span className="font-semibold text-gray-900">
            {filteredAndSortedData.length > 0
              ? Math.round(
                  filteredAndSortedData.reduce((acc, s) => acc + s.progress, 0) /
                    filteredAndSortedData.length
                )
              : 0}
            %
          </span>
        </p>
      </div>
    </div>
  )
}
