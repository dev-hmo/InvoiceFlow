import { getFullReceipt } from '@/lib/models';
import OryxReceipt from '@/components/receipt/OryxReceipt';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrintTrigger from './PrintTrigger';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getFullReceipt(Number(params.id));
  return {
    title: data ? `Receipt ${data.receipt_number}` : 'Receipt',
  };
}

export default function ReceiptPrintPage({ params }: Props) {
  const data = getFullReceipt(Number(params.id));

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600 font-bold mb-4">Receipt not found</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-bold">
          ← Back to POS Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 px-4 print:p-0 print:m-0 print:bg-white">
      {/* Top action bar - Hidden when printed */}
      <div className="w-full max-w-[8in] mb-4 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors"
        >
          <ArrowLeft size={20} /> Back to POS (ပင်မစာမျက်နှာ)
        </Link>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium">Slip Dimensions: 8" × 3.5"</p>
          <p className="text-base font-extrabold text-blue-900">{data.receipt_number}</p>
        </div>

        <PrintTrigger showButtonOnly />
      </div>

      {/* Actual Receipt */}
      <div className="bg-white shadow-xl rounded-sm print:shadow-none print:rounded-none">
        <OryxReceipt data={data} printMode />
      </div>

      <PrintTrigger autoPrint />
    </div>
  );
}
