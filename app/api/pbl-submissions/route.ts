import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pblCaseId = searchParams.get('pbl_case_id')

    // Base URL untuk backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Build query string
    const queryParams = new URLSearchParams()
    if (pblCaseId) {
      queryParams.append('pbl_case_id', pblCaseId)
    }

    const url = `${backendUrl}/api/pbl-submissions${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // Return empty array if endpoint doesn't exist yet
      if (response.status === 404) {
        return NextResponse.json({ data: [] })
      }
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    // Return empty array as fallback
    return NextResponse.json({ data: [] })
  }
}
