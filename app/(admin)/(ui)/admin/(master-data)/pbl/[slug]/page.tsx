'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, FileText, Eye, ChevronLeft, Download, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Helper to get auth token from cookie
const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
  
  if (!match) return null
  
  const value = match.substring('auth_token='.length)
  return decodeURIComponent(value)
}

// Helper function to make API calls with better error handling
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  console.log('[API Call]', url, options?.method || 'GET')
  
  const authToken = getAuthToken()
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options?.headers,
      },
      credentials: 'include',
    })
    
    const contentType = response.headers.get('content-type')
    let data: any
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    console.log('[API Response]', {url, status: response.status, data})
    
    if (!response.ok) {
      const errorMessage = typeof data === 'object' ? (data.message || data.error || JSON.stringify(data)) : data
      console.error(`[API Error] ${response.status}:`, errorMessage)
      throw new Error(`${response.status}: ${errorMessage}`)
    }
    
    return data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[API Exception]', url, message)
    throw error
  }
}

interface StudentSubmission {
  id: string
  student_id: string
  student_name: string
  pbl_case_id: string
  status: 'submitted' | 'on-review' | 'returned' | 'approved'
  submitted_at: string
  score?: number
  feedback?: string
  file_url?: string
}

interface PBLCase {
  id: string
  title: string
  description: string
  level: string
  start_date: string
  deadline: string
  image_url?: string
}

export default function PBLSubmissionsPage() {
  const params = useParams()
  const slugId = params?.slug as string
  
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [pblCase, setPBLCase] = useState<PBLCase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [isGradingOpen, setIsGradingOpen] = useState(false)
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<StudentSubmission | null>(null)
  const [gradingScore, setGradingScore] = useState<string>('')
  const [gradingFeedback, setGradingFeedback] = useState<string>('')
  const [isGradingLoading, setIsGradingLoading] = useState(false)

  // Fetch PBL Case and Submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch PBL Case details
        const caseData = await apiCall(`/pbl-cases/${slugId}`)
        const caseInfo = caseData.data || caseData
        setPBLCase(caseInfo)

        // Fetch submissions for this case
        const submissionData = await apiCall(`/pbl-submissions?pbl_case_id=${slugId}`)
        const submissionsList = submissionData.data || submissionData
        
        if (Array.isArray(submissionsList)) {
          // Fetch user details for each submission
          const submissionsWithUserNames = await Promise.all(
            submissionsList.map(async (submission: any) => {
              try {
                // Fetch user details using user_id
                if (submission.user_id || submission.student_id) {
                  const userId = submission.user_id || submission.student_id
                  const userData = await apiCall(`/auth/user/${userId}`)
                  const user = userData.data || userData
                  
                  return {
                    ...submission,
                    student_id: submission.student_id || userId,
                    student_name: user.name 
                  }
                }
                return submission
              } catch (userError) {
                console.error(`Error fetching user data for user_id ${submission.user_id}:`, userError)
                return submission
              }
            })
          )
          setSubmissions(submissionsWithUserNames)
        } else {
          setSubmissions([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`Gagal memuat data: ${errorMsg}`)
        setSubmissions([])
      } finally {
        setIsLoading(false)
      }
    }

    if (slugId) {
      fetchData()
    }
  }, [slugId])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'on-review':
        return 'bg-yellow-100 text-yellow-800'
      case 'returned':
        return 'bg-red-100 text-red-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Dikumpulkan'
      case 'on-review':
        return 'Review'
      case 'returned':
        return 'Dikembalikan'
      case 'approved':
        return 'Disetujui'
      default:
        return status
    }
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const studentName = submission.student_name || ''
    return studentName.toLowerCase().includes(searchFilter.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4 animate-pulse">
                <div className="h-6 w-6 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-gray-600 font-medium">Memuat data pengumpulan...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-2">
              📥 Pengumpulan Siswa
            </h1>
            {pblCase && (
              <div>
                <p className="text-gray-600 text-lg font-semibold">{pblCase.title}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Level: <span className="font-medium">{pblCase.level}</span>
                </p>
              </div>
            )}
          </div>

          {/* Search Filter */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
            <Input
              placeholder="Cari nama siswa..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"
            />
          </div>
        </div>

        {/* Table */}
        {filteredSubmissions.length > 0 ? (
          <Card className="border-2 border-blue-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <TableRow className="border-b-2 border-blue-300 hover:bg-transparent">
                    <TableHead className="text-white font-bold text-center w-12">No</TableHead>
                    <TableHead className="text-white font-bold">Nama Siswa</TableHead>
                    <TableHead className="text-white font-bold">Tanggal Pengumpulan</TableHead>
                    <TableHead className="text-white font-bold text-center">Nilai</TableHead>
                    <TableHead className="text-white font-bold text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission, index) => (
                    <TableRow key={submission.id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors duration-200">
                      <TableCell className="text-center font-semibold text-gray-700 text-sm py-4">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800 py-4">
                        {submission.student_name || 'Nama Tidak Tersedia'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm py-4">
                        {new Date(submission.submitted_at).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {submission.score != null ? (
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold ${
                            submission.score >= 80 ? 'bg-green-100 text-green-800' :
                            submission.score >= 60 ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {submission.score}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Perlu dinilai
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                            onClick={() => {
                              setSelectedSubmissionForGrading(submission)
                              setGradingScore(submission.score?.toString() || '')
                              setGradingFeedback(submission.feedback || '')
                              setIsGradingOpen(true)
                            }}
                            title="Berikan nilai"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Nilai
                          </Button>
                          {submission.file_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                              onClick={() => window.open(submission.file_url, '_blank')}
                              title="Download file pengumpulan"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {submission.feedback && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-600 hover:bg-amber-50 transition-all duration-300"
                              title="Lihat feedback"
                              onClick={() => {
                                alert(`Feedback untuk ${submission.student_name || 'Siswa'}:\n\n${submission.feedback}`)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Tidak ada pengumpulan</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchFilter 
                  ? 'Tidak ada pengumpulan yang sesuai dengan pencarian'
                  : 'Belum ada pengumpulan dari siswa'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grading Modal */}
      <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
        <DialogContent className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm shadow-2xl max-w-md rounded-lg">
          <DialogHeader className="border-b-2 border-purple-200 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ⭐ Berikan Nilai
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedSubmissionForGrading?.student_name || 'Siswa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label htmlFor="score" className="text-gray-700 font-semibold">Nilai (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={gradingScore}
                onChange={(e) => setGradingScore(e.target.value)}
                placeholder="Masukkan nilai siswa"
                className="mt-2 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg py-3"
                disabled={isGradingLoading}
              />
            </div>

            <div>
              <Label htmlFor="feedback" className="text-gray-700 font-semibold">Feedback</Label>
              <Textarea
                id="feedback"
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                placeholder="Berikan feedback untuk siswa (opsional)"
                disabled={isGradingLoading}
                className="mt-2 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg p-3 min-h-24"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-purple-200">
              <Button
                variant="outline"
                onClick={() => setIsGradingOpen(false)}
                disabled={isGradingLoading}
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Batal
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedSubmissionForGrading || !gradingScore) {
                    toast.error('Nilai harus diisi!')
                    return
                  }

                  const score = parseInt(gradingScore)
                  if (isNaN(score) || score < 0 || score > 100) {
                    toast.error('Nilai harus antara 0-100!')
                    return
                  }

                  setIsGradingLoading(true)
                  try {
                    await apiCall(`/pbl-submissions/${selectedSubmissionForGrading.id}/grade`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        score: score,
                        feedback: gradingFeedback || null,
                      }),
                    })

                    // Update submissions list
                    setSubmissions(submissions.map(s =>
                      s.id === selectedSubmissionForGrading.id
                        ? { ...s, score: score, feedback: gradingFeedback || s.feedback }
                        : s
                    ))

                    toast.success('Nilai berhasil disimpan!')
                    setIsGradingOpen(false)
                    setGradingScore('')
                    setGradingFeedback('')
                    setSelectedSubmissionForGrading(null)
                  } catch (error) {
                    toast.error('Gagal menyimpan nilai: ' + (error instanceof Error ? error.message : 'Unknown error'))
                  } finally {
                    setIsGradingLoading(false)
                  }
                }}
                disabled={isGradingLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isGradingLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
