'use client';
import { Download } from 'lucide-react';

export default function PrintButton({ receiptId }: { receiptId: string }) {
  return (
    <button
      className="btn-primary flex items-center gap-2"
      onClick={() => {
        window.open(`/receipts/${receiptId}/print`, '_blank');
      }}
    >
      <Download size={15} /> Export PDF
    </button>
  );
}

