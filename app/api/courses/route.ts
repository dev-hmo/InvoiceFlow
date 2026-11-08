import { NextResponse } from 'next/server';
import { readDb, writeDb, Course } from '@/lib/db';

export async function GET() {
  try {
    const db = readDb();
    const courses = [...db.courses].sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = readDb();
    const { name, description, fee } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const nextId = db.courses.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const newCourse: Course = {
      id: nextId,
      name,
      description: description || null,
      fee: fee ? Number(fee) : 0,
      created_at: new Date().toISOString(),
    };

    db.courses.push(newCourse);
    writeDb(db);

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
