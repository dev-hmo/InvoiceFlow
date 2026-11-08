import { getFullReceipt } from '@/lib/models';
import OryxReceipt from '@/components/receipt/OryxReceipt';
import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import PrintButton from './PrintButton';

interface Props { params: { id: string } }

export default function ReceiptViewPage({ params }: Props) {
  const data = getFullReceipt(Number(params.id));

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-500">Receipt not found.</p>
        <Link href="/receipts" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Back to Receipts</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link href="/receipts" className="btn-secondary flex items-center gap-1 text-sm">
            <ArrowLeft size={14} /> Back
          </Link>
          <div>
            <p className="text-xs text-gray-500">Receipt</p>
            <p className="font-mono font-semibold text-purple-700">{data.receipt_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/receipts/${params.id}/print`}
            target="_blank"
            className="btn-secondary flex items-center gap-2"
          >
            <Printer size={15} /> Print / PDF
          </Link>
          <PrintButton receiptId={params.id} />
        </div>
      </div>

      {/* Receipt preview — scaled to fit screen */}
      <div
        style={{
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'flex-start',
          paddingBottom: '8px',
        }}
        className="no-print"
      >
        <div
          style={{
            transform: 'scale(0.72)',
            transformOrigin: 'top left',
            width: '297mm',
            flexShrink: 0,
          }}
        >
          <OryxReceipt data={data} />
        </div>
      </div>

      {/* Full-size print target (hidden on screen) */}
      <div className="print-only" style={{ display: 'none' }}>
        <OryxReceipt data={data} printMode />
      </div>
    </div>
  );
}

