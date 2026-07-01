import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { script, language, versionIndex } = body;

    const clientId = 'd4d96e675c5e7b9c4a69af7d87f184e1';
    const clientSecret = 'da0700f3881d48c800fa007c3711a999a5d05dc8550969f7f71b29f5c05b01e3';

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script,
        language,
        versionIndex,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}
