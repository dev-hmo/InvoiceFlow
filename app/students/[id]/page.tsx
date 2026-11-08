'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Student {
  id: number; name: string; phone: string | null;
  email: string | null; address: string | null; notes: string | null;
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setStudent(d);
          setForm({ name: d.name, phone: d.phone ?? '', email: d.email ?? '', address: d.address ?? '', notes: d.notes ?? '' });
        }
      });
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/students/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, phone: form.phone || null, email: form.email || null, address: form.address || null, notes: form.notes || null }),
    });
    setSaving(false);
    router.push('/students');
  };

  if (!student) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-4">
        <Link href="/students" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 w-fit">
          <ArrowLeft size={14} /> Back to Students
        </Link>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Edit Student</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input h-20 resize-none" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/students" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

