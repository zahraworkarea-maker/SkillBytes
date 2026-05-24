import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const token = request.cookies.get('auth_token')?.value

    const response = await fetch(`${backendUrl}/api/pbl-submissions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch submission' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const token = request.cookies.get('auth_token')?.value

    // Check if this is a grade request
    const url = new URL(request.url)
    const isGradeRequest = url.pathname.includes('/grade')

    const body = await request.json()

    const endpoint = isGradeRequest 
      ? `${backendUrl}/api/pbl-submissions/${id}/grade`
      : `${backendUrl}/api/pbl-submissions/${id}`

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Failed to update submission' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
