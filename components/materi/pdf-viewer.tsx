'use client'

import { useEffect, useState } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'

interface PDFViewerProps {
  pdfUrl?: string
  fileName?: string
}

export function PDFViewer({ pdfUrl, fileName = 'materi.pdf' }: PDFViewerProps) {
  const [fileBlob, setFileBlob] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pdfUrl) return

    const fetchPdf = async () => {
      try {
        setLoading(true)

        const res = await fetch(pdfUrl)
        const blob = await res.blob()

        const url = URL.createObjectURL(blob)
        setFileBlob(url)
      } catch (err) {
        console.error('Failed to load PDF:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPdf()

    return () => {
      if (fileBlob) URL.revokeObjectURL(fileBlob)
    }
  }, [pdfUrl])

  if (!pdfUrl) {
    return <div>Tidak ada file PDF</div>
  }

  if (loading) {
    return <div>Memuat konten...</div>
  }

  return (
    <div className="w-full h-[80vh]">
      {/* 🔥 WAJIB: SET WORKER */}
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        {fileBlob && <Viewer fileUrl={fileBlob} />}
      </Worker>
    </div>
  )
}