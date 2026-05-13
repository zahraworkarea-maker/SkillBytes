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
  type?: 'text' | 'image' | 'video' | 'file';
  content?: string;
  image_url?: string | null;
  order?: number;
  file_url?: string;
}

// GET - Retrieve a specific item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const item = pblSectionItemsDb.find((i) => i.id === id);

    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Item retrieved successfully',
        data: {
          id: item.id,
          type: item.type,
          content: item.content,
          image_url: item.image_url,
          order: item.order,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error retrieving item', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = (await request.json()) as PBLSectionItemRequest;

    const index = pblSectionItemsDb.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    const updatedItem = {
      ...pblSectionItemsDb[index],
      ...(body.type && { type: body.type }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
      ...(body.order && { order: body.order }),
      updated_at: new Date().toISOString(),
    };

    pblSectionItemsDb[index] = updatedItem;

    return NextResponse.json(
      {
        message: 'Item updated successfully',
        data: {
          id: updatedItem.id,
          type: updatedItem.type,
          content: updatedItem.content,
          image_url: updatedItem.image_url,
          order: updatedItem.order,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating item', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const index = pblSectionItemsDb.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    const deletedItem = pblSectionItemsDb[index];
    pblSectionItemsDb.splice(index, 1);

    return NextResponse.json(
      {
        message: 'Item deleted successfully',
        data: deletedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting item', error: String(error) },
      { status: 500 }
    );
  }
}
