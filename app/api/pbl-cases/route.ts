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
  case_number: number;
  title: string;
  pbl_level_id: number;
  description: string;
  image_url?: string | null;
  time_limit: number;
  start_date: string;
  deadline: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}

// GET - Retrieve all PBL cases with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '15');
    const search = searchParams.get('search') || '';

    // Filter based on search
    let filtered = pblCasesDb;
    if (search) {
      filtered = pblCasesDb.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);
    const data = filtered.slice((page - 1) * perPage, page * perPage);

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/pbl-cases`;

    return NextResponse.json(
      {
        current_page: page,
        data,
        first_page_url: `${baseUrl}?page=1`,
        from,
        last_page: lastPage,
        last_page_url: `${baseUrl}?page=${lastPage}`,
        links: [
          {
            url: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
            label: '&laquo; Previous',
            active: false,
          },
          ...Array.from({ length: lastPage }, (_, i) => ({
            url: `${baseUrl}?page=${i + 1}`,
            label: String(i + 1),
            active: i + 1 === page,
          })),
          {
            url: page < lastPage ? `${baseUrl}?page=${page + 1}` : null,
            label: 'Next &raquo;',
            active: false,
          },
        ],
        next_page_url: page < lastPage ? `${baseUrl}?page=${page + 1}` : null,
        path: baseUrl,
        per_page: perPage,
        prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
        to,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error retrieving PBL cases', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new PBL case
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PBLCaseRequest;

    // Validation
    if (!body.title || !body.case_number || !body.pbl_level_id) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = `${body.title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}`;

    const newCase = {
      id: pblCasesDb.length > 0 ? Math.max(...pblCasesDb.map((c) => c.id)) + 1 : 1,
      slug,
      case_number: body.case_number,
      title: body.title,
      pbl_level_id: body.pbl_level_id,
      description: body.description,
      image_url: body.image_url || null,
      time_limit: body.time_limit,
      start_date: body.start_date,
      deadline: body.deadline,
      status: body.status || 'not-started',
      pbl_level: {
        id: body.pbl_level_id,
        name: body.pbl_level_id === 1 ? 'Beginner' : 'Intermediate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    pblCasesDb.push(newCase);

    return NextResponse.json(
      {
        message: 'PBL case created successfully',
        data: newCase,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating PBL case', error: String(error) },
      { status: 500 }
    );
  }
}
