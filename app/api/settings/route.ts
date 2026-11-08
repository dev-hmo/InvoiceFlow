import { NextResponse } from 'next/server';
import { getBusinessSettings, updateBusinessSettings } from '@/lib/models';

export async function GET() {
  try {
    const settings = getBusinessSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    updateBusinessSettings(body);
    const updated = getBusinessSettings();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

