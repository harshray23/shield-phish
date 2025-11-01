
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
    }

    const result = await analyzeUrl(url);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      // The error message from analyzeUrl is user-facing and safe to return
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Route Error:', error);
    // This is a failsafe for truly unexpected errors.
    return NextResponse.json({ success: false, error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
