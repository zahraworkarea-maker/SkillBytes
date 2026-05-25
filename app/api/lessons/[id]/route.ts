import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/lessons/[id]
 * Proxy endpoint to fetch lesson PDF with CORS headers
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Get the token from cookies for authentication
    const token = request.cookies.get('auth_token')?.value;
    
    // Fetch from backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/lessons/${id}`;
    
    console.log('[PDF API] Fetching lesson from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.error('[PDF API] Backend error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch lesson' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the lesson data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[PDF API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
