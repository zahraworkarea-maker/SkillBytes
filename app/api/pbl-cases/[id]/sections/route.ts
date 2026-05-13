import { NextRequest, NextResponse } from 'next/server';

// Mock database
let pblSectionsDb = [
  {
    id: 1,
    pbl_case_id: 1,
    title: 'Tes Endpoint',
    order: 1,
    created_at: '2026-05-06T12:03:19.000000Z',
    updated_at: '2026-05-06T12:03:19.000000Z',
  },
];

let pblSectionItemsDb = [
  {
    id: 1,
    pbl_section_id: 1,
    type: 'text' as const,
    content: 'abcdefghijklmnopqrstuvwxyz',
    image_url: null,
    order: 1,
    created_at: '2026-05-06T12:03:19.000000Z',
    updated_at: '2026-05-06T12:03:19.000000Z',
  },
  {
    id: 2,
    pbl_section_id: 1,
    type: 'text' as const,
    content: 'coba end point ini',
    image_url: null,
    order: 2,
    created_at: '2026-05-06T12:04:20.000000Z',
    updated_at: '2026-05-06T12:04:20.000000Z',
  },
];

interface PBLSectionRequest {
  title: string;
  order?: number;
}

// GET - Retrieve sections by case ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr);

    // Get sections for this case
    const sections = pblSectionsDb
      .filter((s) => s.pbl_case_id === id)
      .map((section) => ({
        id: section.id,
        title: section.title,
        order: section.order,
        items: pblSectionItemsDb.filter((item) => item.pbl_section_id === section.id),
      }));

    return NextResponse.json(sections, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error retrieving sections', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr);
    const body = (await request.json()) as PBLSectionRequest;

    if (!body.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const newSection = {
      id: pblSectionsDb.length > 0 ? Math.max(...pblSectionsDb.map((s) => s.id)) + 1 : 1,
      pbl_case_id: id,
      title: body.title,
      order: body.order || pblSectionsDb.filter((s) => s.pbl_case_id === id).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    pblSectionsDb.push(newSection);

    return NextResponse.json(
      {
        message: 'Section created successfully',
        data: {
          id: newSection.id,
          title: newSection.title,
          order: newSection.order,
          items: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating section', error: String(error) },
      { status: 500 }
    );
  }
}
