'use client';

import { useEffect } from 'react';
import { Printer } from 'lucide-react';

export default function PrintTrigger({
  autoPrint = false,
  showButtonOnly = false,
}: {
  autoPrint?: boolean;
  showButtonOnly?: boolean;
}) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  if (autoPrint) return null;

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-extrabold text-lg shadow-md transition-all cursor-pointer"
    >
      <Printer size={22} /> Print Voucher (ဘောင်ချာထုတ်မည်)
    </button>
  );
}
