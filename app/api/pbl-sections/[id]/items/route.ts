import { NextRequest, NextResponse } from 'next/server';

// Mock database
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

interface PBLSectionItemRequest {
  type: 'text' | 'image' | 'video' | 'file';
  content?: string;
  image_url?: string | null;
  order?: number;
  file_url?: string;
}

// POST - Create a new section item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr);
    const body = (await request.json()) as PBLSectionItemRequest;

    if (!body.type) {
      return NextResponse.json(
        { message: 'Item type is required' },
        { status: 400 }
      );
    }

    if (body.type === 'text' && !body.content) {
      return NextResponse.json(
        { message: 'Content is required for text items' },
        { status: 400 }
      );
    }

    const newItem = {
      id: pblSectionItemsDb.length > 0 ? Math.max(...pblSectionItemsDb.map((i) => i.id)) + 1 : 1,
      pbl_section_id: id,
      type: body.type,
      content: body.content || null,
      image_url: body.image_url || null,
      order: body.order || pblSectionItemsDb.filter((i) => i.pbl_section_id === id).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    pblSectionItemsDb.push(newItem);

    return NextResponse.json(
      {
        message: 'Section item created successfully',
        data: {
          id: newItem.id,
          type: newItem.type,
          content: newItem.content,
          image_url: newItem.image_url,
          order: newItem.order,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating section item', error: String(error) },
      { status: 500 }
    );
  }
}
