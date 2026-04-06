import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')

    if (!filename) {
      return new NextResponse('Filename not provided', { status: 400 })
    }

    // Sanitize filename
    const sanitized = filename.replace(/\.\./g, '').replace(/[\\]/g, '/')
    const pdfPath = path.join(process.cwd(), 'public', sanitized)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file and convert to base64
    const fileBuffer = fs.readFileSync(pdfPath)
    const base64PDF = fileBuffer.toString('base64')
    const fileName = path.basename(pdfPath)
    
    // Extract title from filename (remove .pdf and replace underscores)
    const fileTitle = fileName.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ')

    // Return HTML page with PDF embedded using data URI
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; }
    body { font-family: sans-serif; background: #f5f5f5; }
    #container { width: 100%; height: 100%; display: flex; flex-direction: column; }
    #toolbar { padding: 10px 20px; background: white; border-bottom: 1px solid #ddd; }
    #viewer { flex: 1; overflow: auto; }
    object { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <div id="container">
    <div id="toolbar">
      <span style="font-size: 14px; color: #666;">${fileTitle}</span>
    </div>
    <div id="viewer">
      <object data="data:application/pdf;base64,${base64PDF}" type="application/pdf" style="width:100%;height:100%;"></object>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
      },
    })
  } catch (error) {
    console.error('[PDF API] Error:', error)
    return new NextResponse(`Error: ${error}`, { status: 500 })
  }
}

