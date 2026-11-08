'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Plus, Minus, ArrowLeft } from 'lucide-react';

interface InvoiceDetail {
  id: number;
  student_name: string;
  description: string;
  total_amount: number;
  status: string;
  total_paid: number;
  balance: number;
}

interface PaymentItem { description: string; amount: string; }

export default function PayInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'other'>('cash');
  const [paymentMethodDetail, setPaymentMethodDetail] = useState('');
  const [advance, setAdvance] = useState('0');
  const [items, setItems] = useState<PaymentItem[]>([{ description: '', amount: '' }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`)
      .then(r => r.json())
      .then(d => { setInvoice(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const addItem = () => setItems(p => [...p, { description: '', amount: '' }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof PaymentItem, val: string) => {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const totalAmount = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setSubmitting(true);

    const validItems = items.filter(i => i.description.trim() && parseFloat(i.amount) > 0);
    if (validItems.length === 0) {
      alert('Please add at least one payment item with description and amount.');
      setSubmitting(false);
      return;
    }

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: invoice.id,
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_method_detail: paymentMethodDetail || null,
        notes: notes || null,
        paid_at: new Date().toISOString(),
        items: validItems.map(it => ({ description: it.description, amount: parseFloat(it.amount) })),
        advance_amount: parseFloat(advance) || 0,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // Navigate to the generated receipt
      router.push(`/receipts/${data.receipt.id}`);
    } else {
      const err = await res.json();
      alert('Error: ' + err.error);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!invoice) return <div className="p-6 text-red-500">Invoice not found.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <Link href="/invoices" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
      </div>

      <div className="card mb-4 bg-blue-50 border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Invoice #{invoice.id}</p>
            <p className="text-lg font-bold text-gray-900">{invoice.student_name}</p>
            <p className="text-sm text-gray-600">{invoice.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Balance Due</p>
            <p className="text-xl font-bold text-blue-700">{invoice.balance.toLocaleString()} MMK</p>
            <p className="text-xs text-gray-400">of {invoice.total_amount.toLocaleString()} MMK total</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Record Payment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payment Method */}
          <div>
            <label className="form-label">Payment Method *</label>
            <div className="flex gap-4 mt-1">
              {(['cash', 'bank_transfer', 'other'] as const).map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                    className="accent-blue-700"
                  />
                  <span className="text-sm capitalize">{m.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            {paymentMethod === 'other' && (
              <input
                className="form-input mt-2"
                placeholder="Specify payment method…"
                value={paymentMethodDetail}
                onChange={e => setPaymentMethodDetail(e.target.value)}
              />
            )}
          </div>

          {/* Payment Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Payment Items *</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={12} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="form-input flex-1"
                    placeholder="Description (e.g. Tuition Fee)"
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                  />
                  <input
                    className="form-input w-36 text-right"
                    type="number"
                    min="0"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={e => updateItem(i, 'amount', e.target.value)}
                  />
                  <span className="text-xs text-gray-400">MMK</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                      <Minus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Advance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Advance Amount (MMK)</label>
              <input
                className="form-input text-right"
                type="number"
                min="0"
                value={advance}
                onChange={e => setAdvance(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Prior advance/deposit to deduct on receipt</p>
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{totalAmount.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Advance:</span>
                  <span>−{(parseFloat(advance) || 0).toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 mt-1 pt-1">
                  <span>Total:</span>
                  <span>{(totalAmount - (parseFloat(advance) || 0)).toLocaleString()} MMK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input h-16 resize-none"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/invoices" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary" disabled={submitting || totalAmount === 0}>
              {submitting ? 'Processing…' : '✓ Record Payment & Generate Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

