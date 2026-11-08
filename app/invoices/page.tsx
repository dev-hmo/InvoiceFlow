'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Eye, CreditCard } from 'lucide-react';

interface Invoice {
  id: number;
  student_name: string;
  description: string;
  total_amount: number;
  status: 'unpaid' | 'partial' | 'paid';
  created_at: string;
}

interface Student { id: number; name: string; }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', description: '', total_amount: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [invRes, stuRes] = await Promise.all([fetch('/api/invoices'), fetch('/api/students')]);
    setInvoices(await invRes.json());
    setStudents(await stuRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = invoices.filter(i =>
    i.student_name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: Number(formData.student_id),
        description: formData.description,
        total_amount: Number(formData.total_amount),
        notes: formData.notes,
      }),
    });
    setFormData({ student_id: '', description: '', total_amount: '', notes: '' });
    setShowForm(false);
    setSubmitting(false);
    fetchAll();
  };

  const statusBadge = (status: Invoice['status']) => {
    if (status === 'paid') return <span className="status-paid">Paid</span>;
    if (status === 'partial') return <span className="status-partial">Partial</span>;
    return <span className="status-unpaid">Unpaid</span>;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={22} className="text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{invoices.length}</span>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {showForm && (
        <div className="card border-green-200">
          <h2 className="font-semibold mb-4">Create Invoice</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Student *</label>
              <select className="form-select" value={formData.student_id} onChange={e => setFormData(p => ({...p, student_id: e.target.value}))} required>
                <option value="">Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Total Amount (MMK) *</label>
              <input className="form-input" type="number" min="0" value={formData.total_amount} onChange={e => setFormData(p => ({...p, total_amount: e.target.value}))} required />
            </div>
            <div className="col-span-2">
              <label className="form-label">Description / Course *</label>
              <input className="form-input" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} required />
            </div>
            <div className="col-span-2">
              <label className="form-label">Notes</label>
              <textarea className="form-input h-16 resize-none" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting || students.length === 0}>
                {students.length === 0 ? 'Add students first' : submitting ? 'Saving...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No invoices found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header border-b border-gray-200">
                <th className="text-left pb-2 px-2">ID</th>
                <th className="text-left pb-2 px-2">Student</th>
                <th className="text-left pb-2 px-2">Description</th>
                <th className="text-right pb-2 px-2">Total</th>
                <th className="text-left pb-2 px-2">Status</th>
                <th className="pb-2 px-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2 text-gray-400 text-xs font-mono">#{inv.id}</td>
                  <td className="py-2.5 px-2 font-medium">{inv.student_name}</td>
                  <td className="py-2.5 px-2 text-gray-600 max-w-xs truncate">{inv.description}</td>
                  <td className="py-2.5 px-2 text-right font-medium">{inv.total_amount.toLocaleString()} MMK</td>
                  <td className="py-2.5 px-2">{statusBadge(inv.status)}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-800" title="View">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/invoices/${inv.id}/pay`} className="text-green-600 hover:text-green-800" title="Record Payment">
                        <CreditCard size={14} />
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

