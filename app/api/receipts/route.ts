import { NextResponse } from 'next/server';
import { getAllReceipts } from '@/lib/models';

export async function GET() {
  try {
    const receipts = getAllReceipts();
    return NextResponse.json(receipts);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

