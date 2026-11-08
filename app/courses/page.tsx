'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface Course { id: number; name: string; description: string | null; fee: number; created_at: string; }

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', fee: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch('/api/courses');
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description || null, fee: Number(form.fee) }),
    });
    setForm({ name: '', description: '', fee: '' });
    setShowForm(false);
    setSubmitting(false);
    fetchCourses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    fetchCourses();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Courses</h1>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="card border-indigo-200">
          <h2 className="font-semibold mb-4">New Course</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Course Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div>
              <label className="form-label">Fee (MMK)</label>
              <input className="form-input" type="number" min="0" value={form.fee} onChange={e => setForm(p => ({...p, fee: e.target.value}))} />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No courses yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header border-b border-gray-200">
                <th className="text-left pb-2 px-2">Name</th>
                <th className="text-left pb-2 px-2">Description</th>
                <th className="text-right pb-2 px-2">Fee</th>
                <th className="pb-2 px-2" />
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2 font-medium">{c.name}</td>
                  <td className="py-2.5 px-2 text-gray-500">{c.description || '—'}</td>
                  <td className="py-2.5 px-2 text-right">{c.fee.toLocaleString()} MMK</td>
                  <td className="py-2.5 px-2">
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 float-right">
                      <Trash2 size={14} />
                    </button>
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

