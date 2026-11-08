'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch('/api/students');
    setStudents(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setShowForm(false);
    setSubmitting(false);
    fetchStudents();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{students.length}</span>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border-blue-200">
          <h2 className="font-semibold mb-4">New Student</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Address</label>
              <input className="form-input" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div className="card">
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{search ? 'No students match your search.' : 'No students yet. Add your first student.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header border-b border-gray-200">
                <th className="text-left pb-2 px-2">Name</th>
                <th className="text-left pb-2 px-2">Phone</th>
                <th className="text-left pb-2 px-2">Email</th>
                <th className="text-left pb-2 px-2">Registered</th>
                <th className="pb-2 px-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2 font-medium">{s.name}</td>
                  <td className="py-2.5 px-2 text-gray-600">{s.phone || '—'}</td>
                  <td className="py-2.5 px-2 text-gray-600">{s.email || '—'}</td>
                  <td className="py-2.5 px-2 text-gray-400 text-xs">{s.created_at.split('T')[0]}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/students/${s.id}`} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
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

