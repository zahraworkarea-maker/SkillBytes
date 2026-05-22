'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import apiClient from '@/lib/api-client'

interface UserData {
  id: string | number
  name: string
  email: string
}

interface Result {
  id: string | number
  user_id: string | number
  score: number
  status: string
  completed_at: string
  assessment?: {
    slug: string
    title: string
  }
}

interface StudentResult {
  result: Result
  user: UserData
}

export default function DetailNilaiSiswaPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Get results from /results endpoint
        const resultsResponse = await apiClient.get('/results', {
          params: {
            page: 1,
            per_page: 1000, // Get all results
          },
        })

        if (!resultsResponse.data.success || !resultsResponse.data.data) {
          throw new Error('Failed to fetch results')
        }

        // 2. Filter results by slug
        const allResults: Result[] = resultsResponse.data.data
        const filteredResults = allResults.filter(
          (result: Result) => result.assessment?.slug === slug
        )

        if (filteredResults.length === 0) {
          setStudentResults([])
          setLoading(false)
          return
        }

        // 3. Fetch user details for each result
        const resultsWithUsers: StudentResult[] = await Promise.all(
          filteredResults.map(async (result: Result) => {
            try {
              const userResponse = await apiClient.get(`/auth/user/${result.user_id}`)
              return {
                result,
                user: userResponse.data.data || userResponse.data,
              }
            } catch (err) {
              console.error(`Failed to fetch user ${result.user_id}:`, err)
              return {
                result,
                user: {
                  id: result.user_id,
                  name: 'Unknown',
                  email: 'N/A',
                },
              }
            }
          })
        )

        setStudentResults(resultsWithUsers)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      COMPLETED: { label: 'Selesai', variant: 'default' },
      IN_PROGRESS: { label: 'Sedang Dikerjakan', variant: 'secondary' },
      FAILED: { label: 'Gagal', variant: 'destructive' },
      SUBMITTED: { label: 'Disubmit', variant: 'default' },
    }

    const statusInfo = statusMap[status.toUpperCase()] || {
      label: status,
      variant: 'outline',
    }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detail Nilai Siswa</h1>
        <p className="text-gray-600 mt-2">
          Assesmen: <span className="font-semibold">{slug}</span>
        </p>
      </div>

      {studentResults.length === 0 ? (
        <Alert>
          <AlertDescription>Tidak ada data siswa untuk assesmen ini.</AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentResults.map((item, index) => (
                <TableRow key={item.result.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{item.user.name}</TableCell>
                  <TableCell>{item.user.email}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{item.result.score}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.result.status)}</TableCell>
                  <TableCell>
                    {item.result.completed_at
                      ? new Date(item.result.completed_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Total siswa: <span className="font-semibold">{studentResults.length}</span>
      </div>
    </div>
  )
}
