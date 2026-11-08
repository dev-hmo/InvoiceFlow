import { readDb } from '@/lib/db';
import Link from 'next/link';
import {
  Users,
  FileText,
  Receipt,
  TrendingUp,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  Download,
  Printer,
  ChevronRight,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const db = readDb();

  // Core metrics
  const totalStudents = db.students.length;
  const totalInvoices = db.invoices.length;
  const totalReceipts = db.receipts.length;
  const totalRevenue = db.payments.reduce((sum, p) => sum + p.amount, 0);

  // Unpaid balance total
  const totalInvoiceAmount = db.invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingBalance = Math.max(0, totalInvoiceAmount - totalRevenue);

  // Payments breakdown by method
  const cashTotal = db.payments
    .filter((p) => p.payment_method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0);
  const bankTotal = db.payments
    .filter((p) => p.payment_method === 'bank_transfer')
    .reduce((sum, p) => sum + p.amount, 0);
  const otherTotal = db.payments
    .filter((p) => p.payment_method === 'other')
    .reduce((sum, p) => sum + p.amount, 0);

  // Today's collections
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = db.payments
    .filter((p) => (p.paid_at || '').startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);
  const todayReceiptsCount = db.receipts.filter((r) => r.receipt_date === todayStr).length;

  // Recent 10 receipts with enriched details
  const recentReceipts = [...db.receipts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
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
        detail: payment?.payment_method_detail,
      };
    });

  // Recent Students
  const recentStudents = [...db.students]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-md">Management Portal</span>
            <span className="text-xs text-slate-400">Live Reports &amp; Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Management Dashboard</h1>
          <p className="text-sm text-slate-500">
            Oryx Hospitality Management &amp; Cruise Ship Training Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Printer size={18} /> Open Touch POS (ဘောင်ချာထုတ်ရန်)
          </Link>
          <Link
            href="/invoices"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-colors"
          >
            <FileText size={18} /> Invoices
          </Link>
        </div>
      </div>

      {/* ── 4 KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">စုစုပေါင်း ဝင်ငွေ (Total Revenue)</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalRevenue.toLocaleString()} <span className="text-xs font-semibold text-slate-400">MMK</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t">
            <span>ယနေ့ရရှိငွေ (Today):</span>
            <span className="font-bold text-emerald-600">{todayRevenue.toLocaleString()} MMK</span>
          </div>
        </div>

        {/* Total Receipts */}
        <div className="card border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ဘောင်ချာ အရေအတွက် (Receipts)</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalReceipts} <span className="text-xs font-semibold text-slate-400">Vouchers</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t">
            <span>ယနေ့ထုတ် (Today):</span>
            <span className="font-bold text-blue-600">{todayReceiptsCount} Vouchers</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ကျန်ငွေ စာရင်း (Pending Balance)</p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {pendingBalance.toLocaleString()} <span className="text-xs font-semibold text-slate-400">MMK</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t">
            <span>စုစုပေါင်း ပြေစာ (Invoices):</span>
            <span className="font-bold text-amber-700">{totalInvoices} Invoices</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="card border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">စုစုပေါင်း သင်တန်းသား (Students)</p>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalStudents} <span className="text-xs font-semibold text-slate-400">Enrolled</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t">
            <span>အမြန်ကြည့်ရန်:</span>
            <Link href="/students" className="font-bold text-purple-600 hover:underline">
              Student List →
            </Link>
          </div>
        </div>
      </div>

      {/* ── FINANCIAL REPORT SUMMARY: CASH VS BANK VS OTHER ───────── */}
      <div className="card">
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-700" />
          ငွေပေးချေမှုအလိုက် ငွေဝင်စာရင်း အကျဉ်းချုပ် (Payment Method Breakdown)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cash box */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase">ငွေသား (Cash Payments)</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-2">
              {cashTotal.toLocaleString()} <span className="text-xs font-normal text-emerald-700">MMK</span>
            </p>
          </div>

          {/* Bank Transfer box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase">ဘဏ်လွှဲ / KPay (Bank Transfer)</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {totalRevenue > 0 ? Math.round((bankTotal / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <p className="text-2xl font-black text-blue-950 mt-2">
              {bankTotal.toLocaleString()} <span className="text-xs font-normal text-blue-700">MMK</span>
            </p>
          </div>

          {/* Other box */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase">အခြားနည်းလမ်း (Other)</span>
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {totalRevenue > 0 ? Math.round((otherTotal / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <p className="text-2xl font-black text-purple-950 mt-2">
              {otherTotal.toLocaleString()} <span className="text-xs font-normal text-purple-700">MMK</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMNS: RECENT TRANSACTIONS + QUICK MANAGEMENT ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Receipts Table (2 cols) */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">လတ်တလော ထုတ်ထားသော ဘောင်ချာများ (Recent Receipts)</h2>
              <p className="text-xs text-slate-500">Slip Size: 8" × 3.5" Original Design</p>
            </div>
            <Link href="/receipts" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
              View All ({totalReceipts}) <ChevronRight size={14} />
            </Link>
          </div>

          {recentReceipts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Receipt size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">ဘောင်ချာစာရင်း မရှိသေးပါ။</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Receipt No.</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount (MMK)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs font-bold text-blue-700">
                        {r.receipt_number}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {r.student_name}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">
                        {r.receipt_date}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.payment_method === 'cash'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.payment_method === 'bank_transfer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {r.payment_method === 'cash' ? 'Cash' : r.detail || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {r.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          href={`/print/${r.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Printer size={13} /> Print Slip
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts (1 col) */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">အမြန်စီမံရန် (Quick Management)</h3>
            <div className="space-y-2">
              <Link
                href="/students"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">သင်တန်းသားများ စီမံမည်</p>
                    <p className="text-xs text-slate-400">ကျောင်းသားစာရင်း / အချက်အလက်</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-700" />
              </Link>

              <Link
                href="/invoices"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">ပြေစာများ စစ်ဆေးမည်</p>
                    <p className="text-xs text-slate-400">ကျန်ငွေ / ပေးသွင်းငွေမှတ်တမ်း</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-700" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700">သင်တန်းကြေး သတ်မှတ်ချက်</p>
                    <p className="text-xs text-slate-400">သင်တန်းများ / သင်တန်းကြေး</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-700" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-500 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">လုပ်ငန်း အချက်အလက် (Settings)</p>
                    <p className="text-xs text-slate-400">လိပ်စာ၊ ဖုန်း၊ QR ကုဒ်များ ပြင်ရန်</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Slip info callout */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              📌 ဘောင်ချာ အရွယ်အစား (Paper Dimensions):
            </p>
            <p>အလျား <strong>8 လက်မ (8 in)</strong> × အနံ <strong>3.5 လက်မ (3.5 in)</strong> မူရင်းအတိုင်း အတိအကျ သတ်မှတ်ထားပါသည်။</p>
          </div>
        </div>

      </div>

    </div>
  );
}
