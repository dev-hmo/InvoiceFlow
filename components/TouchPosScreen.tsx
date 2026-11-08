'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Sparkles,
  Banknote,
  Smartphone,
  CreditCard,
  User,
  GraduationCap,
  Delete,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  phone: string | null;
}

interface Course {
  id: number;
  name: string;
  fee: number;
}

interface RecentReceipt {
  id: number;
  receipt_number: string;
  receipt_date: string;
  student_name: string;
  amount: number;
  payment_method: string;
}

export default function TouchPosScreen() {
  const router = useRouter();

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<RecentReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states (Touch-optimized)
  const [selectedStudentId, setSelectedStudentId] = useState<number | 'new'>(1);
  const [customStudentName, setCustomStudentName] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  const [selectedCourse, setSelectedCourse] = useState<string>('Hospitality Management & Cruise Ship Training');
  const [amountStr, setAmountStr] = useState<string>('800000');
  const [advanceStr, setAdvanceStr] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'other'>('cash');
  const [bankDetail, setBankDetail] = useState<'KBZ Pay' | 'KBZ Bank' | 'CB Pay' | 'AYA Pay' | 'Wave Money' | 'Other'>('KBZ Pay');
  const [otherMethodDetail, setOtherMethodDetail] = useState('');

  // Keypad active target
  const [activeInput, setActiveInput] = useState<'amount' | 'advance'>('amount');

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch('/api/students').then((r) => r.json()),
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/receipts').then((r) => r.json()),
    ])
      .then(([sData, cData, rData]) => {
        if (Array.isArray(sData) && sData.length > 0) {
          setStudents(sData);
          setSelectedStudentId(sData[0].id);
        }
        if (Array.isArray(cData) && cData.length > 0) {
          setCourses(cData);
        }
        if (Array.isArray(rData)) {
          setRecentReceipts(rData.slice(0, 5));
        }
      })
      .catch((err) => console.error('Error loading POS data:', err));
  }, []);

  // Preset Course selection helper
  const handleSelectCourse = (name: string, defaultFee: number) => {
    setSelectedCourse(name);
    if (defaultFee > 0) {
      setAmountStr(String(defaultFee));
    }
  };

  // On-screen Numpad Press
  const handleNumpad = (val: string) => {
    const current = activeInput === 'amount' ? amountStr : advanceStr;
    const setter = activeInput === 'amount' ? setAmountStr : setAdvanceStr;

    if (val === 'CLEAR') {
      setter('0');
    } else if (val === 'BACK') {
      if (current.length <= 1) {
        setter('0');
      } else {
        setter(current.slice(0, -1));
      }
    } else if (val === '00' || val === '000') {
      if (current === '0') return;
      setter(current + val);
    } else {
      if (current === '0') {
        setter(val);
      } else {
        setter(current + val);
      }
    }
  };

  // Quick Preset Additions
  const addPresetAmount = (addVal: number) => {
    const current = Number(amountStr) || 0;
    setAmountStr(String(current + addVal));
  };

  // Calculations
  const numAmount = Number(amountStr) || 0;
  const numAdvance = Number(advanceStr) || 0;
  const numTotal = Math.max(0, numAmount - numAdvance);

  // Big 1-Touch Generate & Print Button
  const handleInstantPrint = async () => {
    if (numAmount <= 0) {
      alert('ကျေးဇူးပြု၍ ငွေပမာဏ ရိုက်ထည့်ပါ (Please enter an amount)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: selectedStudentId === 'new' ? null : selectedStudentId,
        student_name: selectedStudentId === 'new' ? customStudentName : null,
        phone: selectedStudentId === 'new' ? customPhone : null,
        description: selectedCourse,
        amount: numAmount,
        advance_amount: numAdvance,
        payment_method: paymentMethod,
        payment_method_detail:
          paymentMethod === 'bank_transfer'
            ? bankDetail
            : paymentMethod === 'other'
            ? otherMethodDetail || 'Other'
            : null,
      };

      const res = await fetch('/api/quick-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.receipt_id) {
        // Direct jump to print layout where receipt triggers window.print() instantly!
        router.push(`/print/${data.receipt_id}`);
      } else {
        alert(data.error || 'အမှားဖြစ်သွားပါသည်။ ထပ်မံကြိုးစားပါ။');
        setLoading(false);
      }
    } catch (err: any) {
      alert('Connection error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-20px)] bg-slate-100 overflow-hidden select-none">
      
      {/* ── TOP BANNER: TOUCH FRIENDLY & CLEAR ──────────────────────── */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-950 font-black text-xl shadow-inner">
            O
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              ORYX TOUCH POS <span className="text-xs bg-blue-700 text-blue-100 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">1-Touch Voucher</span>
            </h1>
            <p className="text-xs text-blue-200">
              နှိပ်ရလွယ်ကူသော ငွေလက်ခံဘောင်ချာ ထုတ်ပေးစနစ် (Elderly &amp; Non-Tech Friendly)
            </p>
          </div>
        </div>

        {/* Live Total Display in Top Bar */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-blue-200 uppercase font-semibold">ကျသင့်ငွေ စုစုပေါင်း (Total Amount)</p>
            <p className="text-2xl font-black text-amber-300 tracking-wide">
              {numTotal.toLocaleString()} <span className="text-sm text-white font-normal">MMK</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN TOUCH POS WORKSPACE: 3 COLUMNS ─────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">

        {/* ── COLUMN 1: STUDENT & COURSE SELECTION (4 COLS) ──────────── */}
        <div className="col-span-4 flex flex-col gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
          
          {/* Section A: Student Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <User size={18} className="text-blue-700" />
                ၁။ သင်တန်းသား ရွေးပါ (Student)
              </label>
              <button
                type="button"
                onClick={() => setSelectedStudentId(selectedStudentId === 'new' ? (students[0]?.id || 1) : 'new')}
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                {selectedStudentId === 'new' ? '← စာရင်းထဲမှရွေးမည်' : '+ နာမည်အသစ်ရိုက်မည်'}
              </button>
            </div>

            {selectedStudentId !== 'new' ? (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`flex items-center justify-between p-3 rounded-xl text-left border-2 transition-all active:scale-[0.98] ${
                      selectedStudentId === s.id
                        ? 'border-blue-700 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-base">{s.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{s.phone || 'ဖုန်းနံပါတ် မရှိပါ'}</p>
                    </div>
                    {selectedStudentId === s.id && (
                      <CheckCircle2 size={22} className="text-blue-700 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">သင်တန်းသား အမည် *</label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - မောင်မောင်"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    className="w-full text-base font-semibold px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">ဖုန်းနံပါတ် (Phone)</label>
                  <input
                    type="text"
                    placeholder="09..."
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full text-base font-semibold px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-200 my-1" />

          {/* Section B: Course / Description (Big Tap Buttons) */}
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <GraduationCap size={18} className="text-blue-700" />
              ၂။ သင်တန်း / အကြောင်းအရာ (Course)
            </label>

            <div className="grid grid-cols-1 gap-2 flex-1">
              {[
                { name: 'Hospitality Management & Cruise Ship Training', fee: 1500000, label: 'Cruise Hospitality (Full)' },
                { name: 'Hospitality Management Course Fee (1st Installment)', fee: 800000, label: 'Course Fee (1st Installment)' },
                { name: 'Hospitality Management Course Fee (2nd Installment)', fee: 700000, label: 'Course Fee (2nd Installment)' },
                { name: 'Culinary & F&B Service Training Fee', fee: 600000, label: 'Culinary & F&B Training' },
                { name: 'Uniform & Training Materials Fee', fee: 150000, label: 'Uniform & Materials Fee' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCourse(item.name, item.fee)}
                  className={`p-3 rounded-xl text-left border-2 transition-all active:scale-[0.98] ${
                    selectedCourse === item.name
                      ? 'border-blue-700 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm leading-snug">{item.label}</p>
                  <p className="text-xs text-blue-700 font-extrabold mt-1">
                    {item.fee.toLocaleString()} MMK
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Description Input */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="အခြား အကြောင်းအရာ စိတ်ကြိုက်ရိုက်ရန်..."
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

        </div>

        {/* ── COLUMN 2: PAYMENT METHOD & NUMPAD (4 COLS) ─────────────── */}
        <div className="col-span-5 flex flex-col gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
          
          {/* Section C: Payment Method Selector */}
          <div>
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Banknote size={18} className="text-blue-700" />
              ၃။ ငွေပေးချေမှု ပုံစံ ရွေးပါ (Payment Method)
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-sm'
                    : 'border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <Banknote size={24} className={paymentMethod === 'cash' ? 'text-emerald-700' : 'text-slate-400'} />
                <span className="text-sm">ငွေသား (Cash)</span>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 font-black shadow-sm'
                    : 'border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <Smartphone size={24} className={paymentMethod === 'bank_transfer' ? 'text-blue-700' : 'text-slate-400'} />
                <span className="text-sm">ဘဏ် / KPay</span>
              </button>

              {/* Other */}
              <button
                type="button"
                onClick={() => setPaymentMethod('other')}
                className={`py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 ${
                  paymentMethod === 'other'
                    ? 'border-purple-700 bg-purple-50 text-purple-900 font-black shadow-sm'
                    : 'border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <CreditCard size={24} className={paymentMethod === 'other' ? 'text-purple-700' : 'text-slate-400'} />
                <span className="text-sm">အခြား (Other)</span>
              </button>
            </div>

            {/* Sub-selector for Banks */}
            {paymentMethod === 'bank_transfer' && (
              <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                {(['KBZ Pay', 'KBZ Bank', 'CB Pay', 'AYA Pay', 'Wave Money'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBankDetail(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bankDetail === b
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {paymentMethod === 'other' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="ငွေပေးသည့်ပုံစံ ရေးပါ..."
                  value={otherMethodDetail}
                  onChange={(e) => setOtherMethodDetail(e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-200 my-1" />

          {/* Section D: Amount Displays (Click to focus on-screen Numpad) */}
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setActiveInput('amount')}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                activeInput === 'amount'
                  ? 'border-blue-700 bg-blue-50/50 shadow-inner'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">ကျသင့်ငွေ (Amount)</span>
                {activeInput === 'amount' && (
                  <span className="text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded">ရိုက်နေသည်</span>
                )}
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {numAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">MMK</span>
              </p>
            </div>

            <div
              onClick={() => setActiveInput('advance')}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                activeInput === 'advance'
                  ? 'border-blue-700 bg-blue-50/50 shadow-inner'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">ကြိုတင်ပေးငွေ (Advance)</span>
                {activeInput === 'advance' && (
                  <span className="text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded">ရိုက်နေသည်</span>
                )}
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {numAdvance.toLocaleString()} <span className="text-xs font-normal text-slate-500">MMK</span>
              </p>
            </div>
          </div>

          {/* Preset Buttons for Quick Typing */}
          <div className="flex gap-1.5">
            {[100000, 500000, 1000000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => addPresetAmount(v)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                +{v.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Section E: Giant Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 flex-1 mt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'BACK'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleNumpad(btn)}
                className={`py-3.5 rounded-xl text-xl font-black flex items-center justify-center transition-all active:scale-95 shadow-sm border ${
                  btn === 'BACK'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {btn === 'BACK' ? <Delete size={24} /> : btn}
              </button>
            ))}
          </div>

        </div>

        {/* ── COLUMN 3: SUMMARY & 1-TOUCH PRINT ACTION (3 COLS) ───────── */}
        <div className="col-span-3 flex flex-col justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              ဘောင်ချာ အကျဉ်းချုပ် (Receipt)
            </h2>

            {/* Live Receipt Card Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">သင်တန်းသား (Student)</p>
                <p className="text-base font-bold text-slate-900">
                  {selectedStudentId === 'new'
                    ? (customStudentName || '—')
                    : (students.find((s) => s.id === selectedStudentId)?.name || '—')}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">သင်တန်း / အကြောင်းအရာ</p>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {selectedCourse}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">ငွေပေးချေမှု (Payment Method)</p>
                <p className="text-xs font-bold text-blue-800 capitalize">
                  {paymentMethod === 'cash' ? 'ငွေသား (Cash)' : paymentMethod === 'bank_transfer' ? `ဘဏ်လွှဲ (${bankDetail})` : 'အခြား'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{numAmount.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Advance:</span>
                  <span>− {numAdvance.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-lg font-black text-blue-900 pt-1 border-t border-slate-200">
                  <span>Total:</span>
                  <span className="text-amber-600">{numTotal.toLocaleString()} MMK</span>
                </div>
              </div>
            </div>

            {/* Recent Printed Receipts history mini-list */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <Clock size={14} /> လတ်တလော ထုတ်ထားသော ဘောင်ချာများ
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recentReceipts.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/print/${r.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 cursor-pointer text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{r.receipt_number}</p>
                      <p className="text-[10px] text-slate-500">{r.student_name}</p>
                    </div>
                    <span className="font-extrabold text-blue-700">
                      {(r.amount ?? 0).toLocaleString()} MMK
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── GIANT 1-TOUCH PRINT BUTTON ────────────────────────────── */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={loading || numAmount <= 0}
              onClick={handleInstantPrint}
              className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-white font-black text-xl tracking-wide shadow-xl transition-all cursor-pointer ${
                loading || numAmount <= 0
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] shadow-emerald-700/30 ring-4 ring-emerald-600/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Printer size={28} className="animate-pulse" />
                <span>{loading ? 'ထုတ်နေပါသည်...' : 'ဘောင်ချာ ထုတ်မည်'}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-100">
                (1-Touch Instant Voucher Print)
              </span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

