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

export async function POST(request: NextRequest) {
  try {
    // Parse the request to get FormData
    const formData = await request.formData()
    
    const caseId = formData.get('case_id')
    const answer = formData.get('answer')
    const submissionFiles = formData.getAll('submission_file') as File[]

    // Validation
    if (!caseId) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      )
    }

    if (!answer) {
      return NextResponse.json(
        { error: 'answer is required' },
        { status: 400 }
      )
    }

    if (!submissionFiles || submissionFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one submission_file is required' },
        { status: 400 }
      )
    }

    // Get auth token from request cookies
    const token = request.cookies.get('auth_token')?.value

    // Base URL untuk backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Create FormData untuk backend
    const backendFormData = new FormData()
    backendFormData.append('case_id', caseId.toString())
    backendFormData.append('answer', answer.toString())

    // Add all files
    submissionFiles.forEach((file) => {
      backendFormData.append('submission_file', file)
    })

    // Forward to backend
    const backendResponse = await fetch(`${backendUrl}/api/pbl-submissions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Failed to submit PBL' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error submitting PBL:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}
