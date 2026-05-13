import { NextRequest, NextResponse } from 'next/server';

// Mock database
let pblCasesDb = [
  {
    id: 1,
    slug: 'system-login-bermasalah-ymEGQTTF',
    case_number: 1,
    title: 'System Login Bermasalah',
    pbl_level_id: 1,
    description: 'Anda diminta untuk menyelesaikan masalah sistem login yang bermasalah',
    image_url: null,
    time_limit: 120,
    start_date: '2026-05-07T20:28:13.000000Z',
    deadline: '2026-06-07T02:28:13.000000Z',
    pbl_level: {
      id: 1,
      name: 'Beginner',
      created_at: '2026-05-06T12:03:19.000000Z',
      updated_at: '2026-05-06T12:03:19.000000Z',
    },
    status: 'in-progress' as const,
    created_at: '2026-05-06T12:03:19.000000Z',
    updated_at: '2026-05-06T12:03:19.000000Z',
  },
];

interface PBLCaseRequest {
  case_number?: number;
  title?: string;
  pbl_level_id?: number;
  description?: string;
  image_url?: string | null;
  time_limit?: number;
  start_date?: string;
  deadline?: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}

// GET - Retrieve a specific PBL case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const pblCase = pblCasesDb.find((c) => c.id === id);

    if (!pblCase) {
      return NextResponse.json(
        { message: 'PBL case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'PBL case retrieved successfully',
        data: pblCase,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error retrieving PBL case', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update a PBL case
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = (await request.json()) as PBLCaseRequest;

    const index = pblCasesDb.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'PBL case not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updatedCase = {
      ...pblCasesDb[index],
      ...(body.title && { title: body.title }),
      ...(body.case_number && { case_number: body.case_number }),
      ...(body.pbl_level_id && { pbl_level_id: body.pbl_level_id }),
      ...(body.description && { description: body.description }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
      ...(body.time_limit && { time_limit: body.time_limit }),
      ...(body.start_date && { start_date: body.start_date }),
      ...(body.deadline && { deadline: body.deadline }),
      ...(body.status && { status: body.status }),
      updated_at: new Date().toISOString(),
    };

    pblCasesDb[index] = updatedCase;

    return NextResponse.json(
      {
        message: 'PBL case updated successfully',
        data: updatedCase,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating PBL case', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a PBL case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const index = pblCasesDb.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'PBL case not found' },
        { status: 404 }
      );
    }

    const deletedCase = pblCasesDb[index];
    pblCasesDb.splice(index, 1);

    return NextResponse.json(
      {
        message: 'PBL case deleted successfully',
        data: deletedCase,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting PBL case', error: String(error) },
      { status: 500 }
    );
  }
}
