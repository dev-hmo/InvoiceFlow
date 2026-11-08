import { NextResponse } from 'next/server';
import { getInvoice, getPaymentsForInvoice } from '@/lib/models';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const invoice = getInvoice(Number(params.id));
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const payments = getPaymentsForInvoice(Number(params.id));
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    return NextResponse.json({ ...invoice, payments, total_paid: totalPaid, balance: invoice.total_amount - totalPaid });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

