import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/models';
import { getOrCreateReceipt } from '@/lib/receipt-number';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      invoice_id,
      amount,
      payment_method,
      payment_method_detail,
      notes,
      paid_at,
      items,
      advance_amount,
    } = body;

    if (!invoice_id || !amount || !payment_method) {
      return NextResponse.json({ error: 'invoice_id, amount and payment_method are required' }, { status: 400 });
    }

    // Create the payment record
    const payment = createPayment(
      {
        invoice_id: Number(invoice_id),
        amount: Number(amount),
        payment_method,
        payment_method_detail: payment_method_detail || null,
        notes: notes || null,
        paid_at: paid_at || new Date().toISOString(),
      },
      (items && items.length > 0)
        ? items.map((item: { description: string; amount: number }, i: number) => ({
            description: item.description,
            amount: Number(item.amount),
            sort_order: i,
          }))
        : [{ description: body.description || 'Payment', amount: Number(amount), sort_order: 0 }]
    );

    // Auto-generate (or retrieve existing) receipt
    const receipt = getOrCreateReceipt(payment.id, Number(advance_amount ?? 0));

    return NextResponse.json({ payment, receipt }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

