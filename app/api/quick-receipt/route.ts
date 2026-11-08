import { NextResponse } from 'next/server';
import { readDb, writeDb, Student, Invoice } from '@/lib/db';
import { createPayment } from '@/lib/models';
import { getOrCreateReceipt } from '@/lib/receipt-number';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      student_id,
      student_name,
      phone,
      description,
      amount,
      advance_amount = 0,
      payment_method = 'cash',
      payment_method_detail = null,
      notes = null,
    } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'ကျေးဇူးပြု၍ ငွေပမာဏ မှန်ကန်စွာ ထည့်သွင်းပါ (Valid amount required)' }, { status: 400 });
    }

    const db = readDb();
    let finalStudentId: number = student_id ? Number(student_id) : 0;

    // If new student name is provided or selected existing
    if (!finalStudentId && student_name && student_name.trim()) {
      // Find or create student
      const existingStudent = db.students.find(
        (s) => s.name.trim().toLowerCase() === student_name.trim().toLowerCase()
      );
      if (existingStudent) {
        finalStudentId = existingStudent.id;
      } else {
        const nextStudentId = db.students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
        const now = new Date().toISOString();
        const newStudent: Student = {
          id: nextStudentId,
          name: student_name.trim(),
          phone: phone || null,
          email: null,
          address: null,
          notes: 'Touch POS Auto-Created',
          created_at: now,
          updated_at: now,
        };
        db.students.push(newStudent);
        finalStudentId = nextStudentId;
      }
    } else if (finalStudentId) {
      const student = db.students.find((s) => s.id === finalStudentId);
      if (!student) {
        finalStudentId = 1; // Fallback
      }
    } else {
      // Default fallback student if nothing typed
      finalStudentId = db.students[0]?.id || 1;
    }

    const finalDescription = description && description.trim() ? description.trim() : 'သင်တန်းကြေး ပေးသွင်းငွေ (Course Fee Payment)';

    // Create Invoice
    const nextInvoiceId = db.invoices.reduce((max, i) => Math.max(max, i.id), 0) + 1;
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      id: nextInvoiceId,
      student_id: finalStudentId,
      course_id: null,
      description: finalDescription,
      total_amount: parsedAmount,
      notes: notes || 'Touch Screen 1-Touch Payment',
      status: 'paid',
      created_at: now,
      updated_at: now,
    };
    db.invoices.push(newInvoice);
    writeDb(db);

    // Create Payment record
    const payment = createPayment(
      {
        invoice_id: nextInvoiceId,
        amount: parsedAmount,
        payment_method,
        payment_method_detail: payment_method_detail || null,
        notes: notes || null,
        paid_at: now,
      },
      [
        {
          description: finalDescription,
          amount: parsedAmount,
          sort_order: 0,
        },
      ]
    );

    // Auto-generate receipt
    const receipt = getOrCreateReceipt(payment.id, Number(advance_amount) || 0);

    return NextResponse.json({
      success: true,
      receipt_id: receipt.id,
      receipt_number: receipt.receipt_number,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
