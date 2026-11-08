import { NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/lib/models';

export async function GET() {
  try {
    const invoices = getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, description, total_amount, notes, course_id } = body;
    if (!student_id || !description || !total_amount) {
      return NextResponse.json({ error: 'student_id, description and total_amount are required' }, { status: 400 });
    }
    const invoice = createInvoice({
      student_id: Number(student_id),
      course_id: course_id ? Number(course_id) : null,
      description,
      total_amount: Number(total_amount),
      notes: notes || null,
      status: 'unpaid',
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

