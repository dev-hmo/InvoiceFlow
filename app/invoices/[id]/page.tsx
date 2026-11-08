import { getInvoice, getPaymentsForInvoice, getPaymentItems, getStudent } from '@/lib/models';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import { readDb } from '@/lib/db';

interface Props { params: { id: string } }

export default function InvoiceDetailPage({ params }: Props) {
  const invoice = getInvoice(Number(params.id));
  if (!invoice) return <div className="p-6 text-red-500">Invoice not found.</div>;

  const student = getStudent(invoice.student_id);
  const payments = getPaymentsForInvoice(Number(params.id));
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.total_amount - totalPaid;

  const db = readDb();
  const paymentWithReceipts = payments.map(p => {
    const receipt = db.receipts.find((r) => r.payment_id === p.id);
    const items = getPaymentItems(p.id);
    return { ...p, receipt, items };
  });

  const statusColors = { paid: 'status-paid', partial: 'status-partial', unpaid: 'status-unpaid' };

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/invoices" className="btn-secondary text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> Invoices
        </Link>
        <div>
          <p className="text-xs text-gray-500">Invoice #{invoice.id}</p>
          <p className="font-bold text-gray-900">{invoice.student_name ?? student?.name}</p>
        </div>
      </div>

      {/* Invoice summary */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Student</p>
            <p className="font-semibold">{invoice.student_name ?? student?.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Invoice Total</p>
            <p className="font-semibold">{invoice.total_amount.toLocaleString()} MMK</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Amount Paid</p>
            <p className="font-semibold text-green-600">{totalPaid.toLocaleString()} MMK</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Balance</p>
            <p className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{balance.toLocaleString()} MMK</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div>
            <span className={statusColors[invoice.status]}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
            <span className="text-xs text-gray-400 ml-3">{invoice.description}</span>
          </div>
          {balance > 0 && (
            <Link href={`/invoices/${invoice.id}/pay`} className="btn-primary text-sm flex items-center gap-1">
              <CreditCard size={14} /> Record Payment
            </Link>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="card">
        <h2 className="font-semibold mb-4">Payment History</h2>
        {paymentWithReceipts.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No payments recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {paymentWithReceipts.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-mono text-purple-600 font-semibold">
                      {p.receipt?.receipt_number ?? '—'}
                    </span>
                    <span className="ml-3 text-xs text-gray-400">{p.paid_at?.split('T')[0]}</span>
                    <span className="ml-3 text-xs capitalize text-gray-500">{p.payment_method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.amount.toLocaleString()} MMK</span>
                    {p.receipt && (
                      <Link href={`/receipts/${p.receipt.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Receipt size={12} /> View Receipt
                      </Link>
                    )}
                  </div>
                </div>
                {p.items.length > 0 && (
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {p.items.map((item, j) => (
                      <div key={j} className="flex justify-between">
                        <span>{item.description}</span>
                        <span>{item.amount.toLocaleString()} MMK</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
