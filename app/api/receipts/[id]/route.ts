import { NextResponse } from 'next/server';
import { getFullReceipt } from '@/lib/models';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const receipt = getFullReceipt(Number(params.id));
    if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(receipt);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

