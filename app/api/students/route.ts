import { NextResponse } from 'next/server';
import { getAllStudents, createStudent } from '@/lib/models';

export async function GET() {
  try {
    const students = getAllStudents();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, notes } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const student = createStudent({ name, phone: phone || null, email: email || null, address: address || null, notes: notes || null });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

