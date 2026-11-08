import { readDb } from '@/lib/db';
import Link from 'next/link';
import { Users, FileText, Receipt, TrendingUp } from 'lucide-react';

function getDashboardStats() {
  const db = readDb();
  const students = db.students.length;
  const invoices = db.invoices.length;
  const receipts = db.receipts.length;
  const totalRevenue = db.payments.reduce((sum, p) => sum + p.amount, 0);

  const recentReceipts = [...db.receipts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((r) => {
      const payment = db.payments.find((p) => p.id === r.payment_id);
      const invoice = payment ? db.invoices.find((i) => i.id === payment.invoice_id) : undefined;
      const student = invoice ? db.students.find((s) => s.id === invoice.student_id) : undefined;
      return {
        id: r.id,
        receipt_number: r.receipt_number,
        receipt_date: r.receipt_date,
        student_name: student ? student.name : 'Unknown',
        amount: payment ? payment.amount : 0,
        payment_method: payment ? payment.payment_method : 'cash',
      };
    });

  return { students, invoices, receipts, totalRevenue, recentReceipts };
}

export default function DashboardPage() {
  const stats = getDashboardStats();

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Invoices', value: stats.invoices, icon: FileText, color: 'bg-green-500' },
    { label: 'Total Receipts', value: stats.receipts, icon: Receipt, color: 'bg-purple-500' },
    {
      label: 'Total Revenue',
      value: stats.totalRevenue.toLocaleString() + ' MMK',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Oryx Hospitality Management & Cruise Ship Training Center</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Receipts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Receipts</h2>
          <Link href="/receipts" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        {stats.recentReceipts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Receipt size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No receipts yet. <Link href="/invoices" className="text-blue-600 hover:underline">Create an invoice</Link> to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left pb-2 px-2">Receipt No.</th>
                <th className="text-left pb-2 px-2">Student</th>
                <th className="text-left pb-2 px-2">Date</th>
                <th className="text-left pb-2 px-2">Method</th>
                <th className="text-right pb-2 px-2">Amount</th>
                <th className="pb-2 px-2" />
              </tr>
            </thead>
            <tbody>
              {stats.recentReceipts.map((r) => (
                <tr key={r.receipt_number} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 font-mono text-xs text-blue-700">{r.receipt_number}</td>
                  <td className="py-2 px-2">{r.student_name}</td>
                  <td className="py-2 px-2 text-gray-500">{r.receipt_date}</td>
                  <td className="py-2 px-2 capitalize">{r.payment_method.replace('_', ' ')}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.amount.toLocaleString()} MMK</td>
                  <td className="py-2 px-2 text-right">
                    <Link
                      href={`/receipts/${r.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/students" className="card hover:shadow-md transition-shadow text-center group">
          <Users size={28} className="mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-700">Manage Students</p>
        </Link>
        <Link href="/invoices" className="card hover:shadow-md transition-shadow text-center group">
          <FileText size={28} className="mx-auto text-green-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-700">Create Invoice</p>
        </Link>
        <Link href="/receipts" className="card hover:shadow-md transition-shadow text-center group">
          <Receipt size={28} className="mx-auto text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-700">View Receipts</p>
        </Link>
      </div>
    </div>
  );
}
