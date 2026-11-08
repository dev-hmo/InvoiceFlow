import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = readDb();
    const id = Number(params.id);
    db.courses = db.courses.filter((c) => c.id !== id);
    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
