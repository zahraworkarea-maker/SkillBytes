'use client'

import React from 'react'

interface PDFViewerProps {
  pdfUrl?: string
  fileName?: string
}

export function PDFViewer({ pdfUrl, fileName = 'materi.pdf' }: PDFViewerProps) {
  // Convert public path to API route
  const apiUrl = pdfUrl?.startsWith('/materi/') 
    ? `/api/pdf?file=${encodeURIComponent(pdfUrl.replace(/^\//, ''))}` 
    : pdfUrl

  if (!pdfUrl) {
    return (
      <div className="w-full h-150 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📁</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Materi yang Tersedia</h3>
          <p className="text-slate-500">File materi akan ditampilkan di sini</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
      <iframe
        src={apiUrl}
        className="w-full h-screen border-none"
        title={fileName}
      />
    </div>
  )
}
