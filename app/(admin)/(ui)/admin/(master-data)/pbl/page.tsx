'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent} from '@/components/ui/card'
import { Edit, Trash2, Search, Plus, Upload, X, AlertCircle, ChevronDown, ChevronRight, Eye, FileText, CheckCircle2, Clock } from 'lucide-react'
import { PBLSectionForm, PBLSectionItemForm, type PBLSectionFormData, type PBLSectionItemFormData } from '@/components/pbl'
import { AdminPBLLoadingSkeleton } from '@/components/ui/loading-skeleton'
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
  
  // Get auth token
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
      credentials: 'include', // Include cookies if needed
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

const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
const MAX_IMAGE_SIZE = 1 * 1024 * 1024

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    return { valid: false, error: `Format gambar harus: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}` }
  }

  if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
    return { valid: false, error: `Format gambar harus: JPG, JPEG, PNG, GIF, WebP, BMP, atau SVG` }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Ukuran gambar maksimal ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}

interface PBLSection {
  id: string
  title: string
  order: number
  items: PBLItem[]
}

interface PBLItem {
  id: string
  type: 'text' | 'image' | 'video' | 'file'
  content?: string
  imageUrl?: string
  order: number
}

interface PBLCaseFormData {
  title: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'
  description: string
  startDate: string
  deadline: string
  imageFile: File | null
  imageUrl: string
}

interface PBLCase extends PBLCaseFormData {
  id: string
  caseNumber: number
  timeLimit: number
  sections: PBLSection[]
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

export default function PBLManagementPage() {
  const router = useRouter()
  const [cases, setCases] = useState<PBLCase[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<PBLCase | null>(null)
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [formData, setFormData] = useState<PBLCaseFormData>({
    title: '',
    level: 'Beginner',
    description: '',
    startDate: '',
    deadline: '',
    imageFile: null,
    imageUrl: '',
  })

  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const apiResponse = await apiCall('/pbl-cases')
        
        // Handle paginated response from backend
        const casesList = apiResponse.data || apiResponse
        if (!Array.isArray(casesList)) {
          console.error('[Invalid Cases Format]', casesList)
          toast.error('Format response dari API tidak valid')
          return
        }

        const transformedCases = await Promise.all(
          casesList.map(async (apiCase: any) => {
            try {
              const sectionsData = await apiCall(`/pbl-cases/${apiCase.id}/sections`)
              
              // Handle both response formats: direct array or wrapped { data: [...] }
              let sections = Array.isArray(sectionsData) ? sectionsData : (sectionsData.data || [])
              
              return {
                ...apiCase,
                id: apiCase.id.toString(),
                caseNumber: apiCase.case_number,
                timeLimit: apiCase.time_limit,
                level: apiCase.pbl_level?.name || apiCase.level || 'Beginner',
                sections: (sections || []).map((s: any) => ({
                  id: s.id?.toString() || s.id,
                  title: s.title,
                  order: s.order,
                  items: (s.items || []).map((item: any) => ({
                    id: item.id?.toString() || item.id,
                    type: item.type,
                    content: item.content,
                    imageUrl: item.image_url,
                    order: item.order,
                  })),
                })),
              }
            } catch (sectionError) {
              console.error('[Section Fetch Exception]', apiCase.id, sectionError)
              return { 
                ...apiCase, 
                id: apiCase.id.toString(), 
                caseNumber: apiCase.case_number, 
                timeLimit: apiCase.time_limit,
                level: apiCase.pbl_level?.name || apiCase.level || 'Beginner',
                sections: [] 
              }
            }
          })
        )
        setCases(transformedCases)
      } catch (error) {
        console.error('Error fetching cases:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`Gagal memuat PBL cases: ${errorMsg}`)
      } finally {
        setIsInitialLoading(false)
      }
    }
    fetchCases()
  }, [])

  const calculateTimeLimitInMinutes = (start: string, end: string): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffInMs = endDate.getTime() - startDate.getTime()
    return Math.round(diffInMs / (1000 * 60))
  }

  // Helper to format datetime-local to backend format (YYYY-MM-DD HH:MM:SS)
  const formatDatetimeForBackend = (datetimeLocalString: string): string => {
    if (!datetimeLocalString) return ''
    // datetime-local format: "2026-05-12T14:30"
    // Convert to: "2026-05-12 14:30:00"
    const [date, time] = datetimeLocalString.split('T')
    if (!time) return `${date} 00:00:00`
    return `${date} ${time}:00`
  }

  // Helper to format backend format to datetime-local
  const formatDatetimeToLocal = (backendDateString: string): string => {
    if (!backendDateString) return ''
    // Handle ISO format from backend: "2026-05-07T20:28:13.000000Z"
    let cleanDate = backendDateString
    if (backendDateString.includes('T')) {
      // ISO format - extract date and time
      const [date, timeWithMs] = backendDateString.split('T')
      const time = timeWithMs.split('.')[0] // Remove milliseconds
      const timeWithoutSeconds = time.substring(0, 5)
      return `${date}T${timeWithoutSeconds}`
    } else {
      // backend format: "2026-05-12 14:30:00"
      // Convert to: "2026-05-12T14:30"
      const [date, time] = backendDateString.split(' ')
      if (!time) return date
      const timeWithoutSeconds = time.substring(0, 5)
      return `${date}T${timeWithoutSeconds}`
    }
  }

  const handleEdit = (caseItem: PBLCase) => {
    setEditingCase(caseItem)
    setFormData({
      title: caseItem.title,
      level: caseItem.level,
      description: caseItem.description,
      startDate: formatDatetimeToLocal(caseItem.startDate),
      deadline: formatDatetimeToLocal(caseItem.deadline),
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

  const resetForm = () => {
    setFormData({
      title: '',
      level: 'Beginner',
      description: '',
      startDate: '',
      deadline: '',
      imageFile: null,
      imageUrl: '',
    })
    setEditingCase(null)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus kasus PBL ini?')
    if (confirmed) {
      try {
        await apiCall(`/pbl-cases/${id}`, { method: 'DELETE' })
        setCases(cases.filter(c => c.id !== id))
        toast.success('Kasus PBL berhasil dihapus!')
      } catch (error) {
        toast.error('Gagal menghapus kasus PBL')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imagePath = formData.imageUrl // fallback ke imageUrl yang sudah ada
      
      // Upload gambar jika ada file baru
      if (formData.imageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', formData.imageFile)
        
        try {
          const uploadResponse = await fetch(`${API_BASE_URL}/upload-image`, {
            method: 'POST',
            body: formDataUpload,
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
            },
            credentials: 'include',
          })
          
          if (!uploadResponse.ok) {
            throw new Error('Gagal upload gambar')
          }
          
          const uploadData = await uploadResponse.json()
          imagePath = uploadData.data?.path || uploadData.path || formData.imageUrl
          console.log('[Image Upload Success]', imagePath)
          toast.success('Gambar berhasil diupload!')
        } catch (uploadError) {
          console.error('[Image Upload Error]', uploadError)
          toast.error('Gagal upload gambar: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'))
          setIsLoading(false)
          return
        }
      }

      if (editingCase) {
        await apiCall(`/pbl-cases/${editingCase.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            pbl_level_id: getLevelId(formData.level),
            start_date: formatDatetimeForBackend(formData.startDate),
            deadline: formatDatetimeForBackend(formData.deadline),
            time_limit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
            image_url: imagePath || null,
          }),
        })

        setCases(cases.map(c =>
          c.id === editingCase.id
            ? {
                ...c,
                ...formData,
                imageUrl: imagePath,
                timeLimit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
              }
            : c
        ))
        toast.success('Kasus PBL berhasil diperbarui!')
        resetForm()
        setIsDialogOpen(false)
      } else {
        const newCaseData = await apiCall('/pbl-cases', {
          method: 'POST',
          body: JSON.stringify({
            case_number: cases.length + 1,
            title: formData.title,
            pbl_level_id: getLevelId(formData.level),
            description: formData.description,
            start_date: formatDatetimeForBackend(formData.startDate),
            deadline: formatDatetimeForBackend(formData.deadline),
            time_limit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
            image_url: imagePath || null,
            status: 'not-started',
          }),
        })

        const caseData = newCaseData.data || newCaseData
        const newCase: PBLCase = {
          id: caseData.id?.toString() || caseData.id,
          caseNumber: caseData.case_number || cases.length + 1,
          title: formData.title,
          level: formData.level,
          description: formData.description,
          startDate: formatDatetimeForBackend(formData.startDate),
          deadline: formatDatetimeForBackend(formData.deadline),
          imageFile: null,
          imageUrl: imagePath,
          timeLimit: calculateTimeLimitInMinutes(formData.startDate, formData.deadline),
          sections: [],
        }
        setCases([...cases, newCase])
        toast.success('Kasus PBL berhasil ditambahkan!')
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast.error('Gagal menyimpan kasus PBL: ' + (error instanceof Error ? error.message : 'Unknown error'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSection = (caseId: string) => {
    setExpandedCaseId(caseId)
    setSelectedSectionId(null)
    setIsSectionDialogOpen(true)
  }

  const handleSubmitSection = async (data: PBLSectionFormData) => {
    if (!expandedCaseId) return

    try {
      const responseData = await apiCall(`/pbl-cases/${expandedCaseId}/sections`, {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          order: data.order || 1,
        }),
      })

      const createdSection = responseData.data || responseData || {}

      setCases(cases.map(c => {
        if (c.id === expandedCaseId) {
          return {
            ...c,
            sections: [
              ...c.sections,
              {
                id: createdSection.id?.toString() || `section-${Date.now()}`,
                title: data.title,
                order: data.order || c.sections.length + 1,
                items: [],
              },
            ],
          }
        }
        return c
      }))
      toast.success('Section berhasil ditambahkan!')
      setIsSectionDialogOpen(false)
    } catch (error) {
      console.error('[PBL Section Exception]', error)
      toast.error('Gagal menambahkan section: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteSection = async (caseId: string, sectionId: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus section ini?')
    if (confirmed) {
      try {
        await apiCall(`/pbl-sections/${sectionId}`, {
          method: 'DELETE',
        })

        setCases(cases.map(c => {
          if (c.id === caseId) {
            return {
              ...c,
              sections: c.sections.filter(s => s.id !== sectionId),
            }
          }
          return c
        }))
        toast.success('Section berhasil dihapus!')
      } catch (error) {
        console.error('[PBL Section Delete Exception]', error)
        toast.error('Gagal menghapus section: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleAddItem = (caseId: string, sectionId: string) => {
    setExpandedCaseId(caseId)
    setSelectedSectionId(sectionId)
    setIsItemDialogOpen(true)
  }

  const handleSubmitItem = async (data: PBLSectionItemFormData) => {
    if (!expandedCaseId || !selectedSectionId) return

    try {
      const responseData = await apiCall(`/pbl-sections/${selectedSectionId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          type: data.type,
          content: data.content,
          image_url: data.imageUrl,
          order: data.order || 1,
          file_url: data.fileUrl,
        }),
      })

      const createdItem = responseData.data || responseData || {}

      setCases(cases.map(c => {
        if (c.id === expandedCaseId) {
          return {
            ...c,
            sections: c.sections.map(s => {
              if (s.id === selectedSectionId) {
                return {
                  ...s,
                  items: [
                    ...s.items,
                    {
                      id: createdItem.id?.toString() || `item-${Date.now()}`,
                      type: data.type,
                      content: data.content,
                      imageUrl: data.imageUrl,
                      order: data.order || s.items.length + 1,
                    },
                  ],
                }
              }
              return s
            }),
          }
        }
        return c
      }))
      toast.success('Item berhasil ditambahkan!')
      setIsItemDialogOpen(false)
    } catch (error) {
      console.error('[PBL Item Exception]', error)
      toast.error('Gagal menambahkan item: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteItem = async (caseId: string, sectionId: string, itemId: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus item ini?')
    if (confirmed) {
      try {
        await apiCall(`/pbl-items/${itemId}`, {
          method: 'DELETE',
        })

        setCases(cases.map(c => {
          if (c.id === caseId) {
            return {
              ...c,
              sections: c.sections.map(s => {
                if (s.id === sectionId) {
                  return {
                    ...s,
                    items: s.items.filter(i => i.id !== itemId),
                  }
                }
                return s
              }),
            }
          }
          return c
        }))
        toast.success('Item berhasil dihapus!')
      } catch (error) {
        console.error('[PBL Item Delete Exception]', error)
        toast.error('Gagal menghapus item: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleViewSubmissions = (pblCase: PBLCase) => {
    // Navigate to detail page with slug
    router.push(`/admin/pbl/${pblCase.id}`)
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4" />
      case 'on-review':
        return <Eye className="h-4 w-4" />
      case 'returned':
        return <AlertCircle className="h-4 w-4" />
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  const getLevelId = (level: string): number => {
    const levelMap = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 5 }
    return levelMap[level as keyof typeof levelMap] || 1
  }

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
    c.description.toLowerCase().includes(globalFilter.toLowerCase())
  )

  // Show loading skeleton while fetching initial data
  if (isInitialLoading) {
    return <AdminPBLLoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-2">
                Kelola PBL Cases
              </h1>
              <p className="text-gray-600">Kelola case, section, dan lihat pengumpulan siswa dengan mudah</p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg px-6 py-3 whitespace-nowrap"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah PBL Case
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
            <Input
              placeholder="Cari case..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"
            />
          </div>
        </div>

        {/* Cases Grid */}
        <div className="space-y-4">
        {filteredCases.length > 0 ? (
          filteredCases.map((pblCase) => (
            <Card
              key={pblCase.id}
              className="border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-indigo-300"
            >
              {/* Case Header */}
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between cursor-pointer text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                onClick={() =>
                  setExpandedCaseId(expandedCaseId === pblCase.id ? null : pblCase.id)
                }
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button className="hover:opacity-80 transition-opacity flex-shrink-0">
                    {expandedCaseId === pblCase.id ? (
                      <ChevronDown className="h-6 w-6" />
                    ) : (
                      <ChevronRight className="h-6 w-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{pblCase.title}</h3>
                    <p className="text-sm text-blue-100 mt-1 line-clamp-1">
                      {pblCase.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex gap-3 mt-2 text-sm flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-colors">
                        {pblCase.level}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-white">
                        {pblCase.sections.length} section
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-white">
                        Waktu: {pblCase.timeLimit || '-'} menit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewSubmissions(pblCase)
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300"
                    title="Lihat pengumpulan dari siswa"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Pengumpulan
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(pblCase)
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Edit case"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(pblCase.id)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Hapus case"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>

              {/* Sections List */}
              {expandedCaseId === pblCase.id && (
                <CardContent className="p-6 bg-gradient-to-b from-blue-50/50 to-indigo-50/30">
                  <div className="space-y-3 mb-6">
                    {pblCase.sections.length > 0 ? (
                      pblCase.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <Card
                            key={section.id}
                            className="border border-blue-200 bg-white/90 backdrop-blur-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                          >
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-colors rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
                                    {section.order}
                                  </span>
                                  {section.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {section.items.length} item
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddItem(pblCase.id, section.id)
                                  }}
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Item
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteSection(pblCase.id, section.id)
                                  }}
                                  className="border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Items */}
                            {section.items.length > 0 && (
                              <div className="border-t border-blue-200 p-4 bg-white/50 space-y-2">
                                {section.items
                                  .sort((a, b) => a.order - b.order)
                                  .map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-150 text-sm hover:shadow-md transition-all duration-300"
                                    >
                                      <span className="text-gray-700 flex items-center gap-2 flex-1 min-w-0">
                                        {item.type === 'text' && '📝'}
                                        {item.type === 'image' && '🖼️'}
                                        {item.type === 'video' && '▶️'}
                                        {item.type === 'file' && '📄'}
                                        <span className="truncate">{item.content?.substring(0, 40) || item.type}</span>
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleDeleteItem(pblCase.id, section.id, item.id)
                                        }
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all duration-300 flex-shrink-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                        <p className="text-gray-500">Belum ada section</p>
                        <p className="text-sm text-gray-400 mt-1">Tambahkan section untuk memulai</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold transition-all duration-300"
                    onClick={() => handleAddSection(pblCase.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Section
                  </Button>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Search className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Belum ada PBL case</p>
              <p className="text-gray-500 text-sm mt-2">
                Mulai dengan menambahkan case baru menggunakan tombol di atas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>

      {/* PBL Case Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader className="border-b-2 border-blue-200 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {editingCase ? '✏️ Edit PBL Case' : '➕ Tambah PBL Case Baru'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingCase
                ? 'Ubah informasi case di bawah ini'
                : 'Tambahkan case baru dengan mengisi form di bawah ini'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-gray-700 font-semibold">Judul Case</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={isLoading}
                placeholder="Masukkan judul case yang menarik"
                className="mt-2 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-3"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 font-semibold">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Jelaskan tujuan dan konteks case ini"
                disabled={isLoading}
                className="mt-2 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-3 min-h-24"
              />
            </div>

            <div>
              <Label htmlFor="imageFile" className="text-gray-700 font-semibold">Gambar Case - Opsional</Label>
              <p className="text-xs text-gray-500 mb-2">Format: JPG, JPEG, PNG, GIF, WebP (Max 2MB)</p>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                onDrop={(e) => {
                  e.preventDefault()
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    const file = files[0]
                    if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
                      setFormData({ ...formData, imageFile: file })
                      toast.success('Gambar berhasil dipilih!')
                    } else {
                      toast.error('File harus berupa gambar (JPG, PNG, GIF, WebP) dengan ukuran max 2MB')
                    }
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('imageFileInput')?.click()}
              >
                {formData.imageFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-700 text-sm">
                          {formData.imageFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
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
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-gray-700 font-medium text-sm">Drag gambar ke sini</p>
                    <p className="text-xs text-gray-500">atau klik untuk memilih</p>
                  </div>
                )}
              </div>
              <input
                id="imageFileInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.size <= 2 * 1024 * 1024) {
                    setFormData({ ...formData, imageFile: file })
                    toast.success('Gambar berhasil dipilih!')
                  } else if (file) {
                    toast.error('Ukuran gambar max 2MB')
                  }
                }}
                disabled={isLoading}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level" className="text-gray-700 font-semibold">Level Kesulitan</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value as any })
                  }
                  className="mt-2 w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  required
                  disabled={isLoading}
                >
                  <option value="Beginner">🟢 Beginner</option>
                  <option value="Intermediate">🔵 Intermediate</option>
                  <option value="Advanced">🟠 Advanced</option>
                  <option value="Expert">🔴 Expert</option>
                  <option value="Master">🟣 Master</option>
                </select>
              </div>
              <div>
                <Label htmlFor="startDate" className="text-gray-700 font-semibold">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="mt-2 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-3"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-gray-700 font-semibold">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
                disabled={isLoading}
                className="mt-2 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg py-3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t-2 border-blue-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
                className="border-2 border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-6 font-semibold rounded-lg transition-all duration-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 py-3 px-6 font-semibold rounded-lg transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Menyimpan...
                  </>
                ) : editingCase ? (
                  '💾 Simpan'
                ) : (
                  '➕ Tambah'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <PBLSectionForm
        isOpen={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        onSubmit={handleSubmitSection}
      />

      {/* Item Dialog */}
      <PBLSectionItemForm
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSubmit={handleSubmitItem}
      />
    </div>
  )
}
