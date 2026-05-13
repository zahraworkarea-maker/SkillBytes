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
  title?: string;
  order?: number;
}

// GET - Retrieve a specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const section = pblSectionsDb.find((s) => s.id === id);

    if (!section) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }

    const sectionData = {
      id: section.id,
      title: section.title,
      order: section.order,
      items: pblSectionItemsDb.filter((item) => item.pbl_section_id === section.id),
    };

    return NextResponse.json(
      {
        message: 'Section retrieved successfully',
        data: sectionData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error retrieving section', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = (await request.json()) as PBLSectionRequest;

    const index = pblSectionsDb.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }

    const updatedSection = {
      ...pblSectionsDb[index],
      ...(body.title && { title: body.title }),
      ...(body.order && { order: body.order }),
      updated_at: new Date().toISOString(),
    };

    pblSectionsDb[index] = updatedSection;

    const sectionData = {
      id: updatedSection.id,
      title: updatedSection.title,
      order: updatedSection.order,
      items: pblSectionItemsDb.filter((item) => item.pbl_section_id === updatedSection.id),
    };

    return NextResponse.json(
      {
        message: 'Section updated successfully',
        data: sectionData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating section', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const index = pblSectionsDb.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Section not found' },
        { status: 404 }
      );
    }

    const deletedSection = pblSectionsDb[index];

    // Also delete associated items
    pblSectionItemsDb = pblSectionItemsDb.filter(
      (item) => item.pbl_section_id !== deletedSection.id
    );

    pblSectionsDb.splice(index, 1);

    return NextResponse.json(
      {
        message: 'Section deleted successfully',
        data: deletedSection,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting section', error: String(error) },
      { status: 500 }
    );
  }
}
