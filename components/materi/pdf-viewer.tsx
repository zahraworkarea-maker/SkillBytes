'use client'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'

interface PDFViewerProps {
  pdfUrl?: string
  fileName?: string
}

export function PDFViewer({ pdfUrl, fileName = 'materi.pdf' }: PDFViewerProps) {
  if (!pdfUrl) {
    return <div className="p-4 text-center text-gray-500">Tidak ada file PDF</div>
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl h-[70vh] rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* 🔥 WAJIB: SET WORKER */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={pdfUrl} />
        </Worker>
      </div>
    </div>
  )
}