'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Search, Eye, Printer } from 'lucide-react';

interface ReceiptRow {
  id: number;
  receipt_number: string;
  receipt_date: string;
  student_name: string;
  payment_method: string;
  advance_amount: number;
  created_at: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/receipts')
      .then(r => r.json())
      .then(d => { setReceipts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = receipts.filter(r =>
    r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    r.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={22} className="text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">Receipts</h1>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{receipts.length}</span>
        </div>
        <Link href="/invoices" className="btn-primary flex items-center gap-2">
          + Record New Payment
        </Link>
      </div>

      <div className="card">
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Search by receipt number or student…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Receipt size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No receipts found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header border-b border-gray-200">
                <th className="text-left pb-2 px-2">Receipt No.</th>
                <th className="text-left pb-2 px-2">Student</th>
                <th className="text-left pb-2 px-2">Date</th>
                <th className="text-left pb-2 px-2">Method</th>
                <th className="pb-2 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2 font-mono text-xs text-purple-700 font-semibold">{r.receipt_number}</td>
                  <td className="py-2.5 px-2 font-medium">{r.student_name}</td>
                  <td className="py-2.5 px-2 text-gray-500">{r.receipt_date}</td>
                  <td className="py-2.5 px-2 capitalize text-gray-600">{r.payment_method.replace('_', ' ')}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/receipts/${r.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                        <Eye size={13} /> View
                      </Link>
                      <Link href={`/print/${r.id}`} target="_blank" className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs">
                        <Printer size={13} /> Print
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

