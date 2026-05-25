'use client'

import dynamic from 'next/dynamic'
import { FileText, Play } from 'lucide-react'

// Dynamic import untuk menghindari SSR issues
const PDFViewer = dynamic(
  () => import('@/components/materi/pdf-viewer').then(mod => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p>Memuat PDF...</p>
      </div>
    ),
  }
)

interface MediaViewerProps {
  fileUrl: string
  fileName: string
}

// Function to detect file type from URL
const getFileType = (url: string): 'pdf' | 'video' | 'unknown' => {
  if (!url) return 'unknown'
  
  const urlLower = url.toLowerCase()
  
  // Check for PDF
  if (urlLower.includes('.pdf')) {
    return 'pdf'
  }
  
  // Check for video formats
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v']
  if (videoExtensions.some(ext => urlLower.includes(ext))) {
    return 'video'
  }
  
  return 'unknown'
}

export function MediaViewer({ fileUrl, fileName }: MediaViewerProps) {
  const fileType = getFileType(fileUrl)

  // Route PDF through proxy to avoid CORS issues
  const getProxiedUrl = (url: string): string => {
    if (!url) return url
    // If already a relative URL (proxy), return as is
    if (url.startsWith('/')) return url
    // Otherwise, encode and route through proxy
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}`
  }

  if (fileType === 'pdf') {
    const proxiedUrl = getProxiedUrl(fileUrl)
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <FileText className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">File PDF</span>
        </div>
        <PDFViewer pdfUrl={proxiedUrl} fileName={fileName} />
      </div>
    )
  }

  if (fileType === 'video') {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <Play className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">Video</span>
        </div>
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
          <video
            controls
            className="w-full h-full"
            controlsList="nodownload"
          >
            <source src={fileUrl} />
            Browser Anda tidak mendukung video player.
          </video>
        </div>
      </div>
    )
  }

  // Fallback untuk tipe file yang tidak dikenali
  return (
    <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p className="text-yellow-800 font-medium">
        Tipe file tidak didukung: {fileUrl.split('.').pop()?.toUpperCase()}
      </p>
      <p className="text-yellow-600 text-sm mt-2">
        Tipe file yang didukung: PDF, MP4, WebM, OGG, MOV
      </p>
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Download File
      </a>
    </div>
  )
}
