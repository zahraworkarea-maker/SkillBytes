import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/lessons/slug/[slug]
 * Fetch lesson by slug instead of ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    
    // Get the token from cookies for authentication
    const token = request.cookies.get('auth_token')?.value;
    
    // Fetch from backend - try to get lesson by slug
    // First, we need to get all lessons and filter by slug since backend might not support slug endpoint
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/levels/all`;
    
    console.log('[Lesson Slug API] Fetching lessons from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.error('[Lesson Slug API] Backend error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const levels = data.data || data;

    // Search for the lesson with matching slug across all levels
    let foundLesson = null;
    for (const level of levels) {
      if (level.lessons && Array.isArray(level.lessons)) {
        const lesson = level.lessons.find((l: any) => l.slug === slug);
        if (lesson) {
          foundLesson = lesson;
          break;
        }
      }
    }

    if (!foundLesson) {
      console.warn('[Lesson Slug API] Lesson not found with slug:', slug);
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Return the lesson data with CORS headers
    return NextResponse.json(
      { data: foundLesson, success: true },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    console.error('[Lesson Slug API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
