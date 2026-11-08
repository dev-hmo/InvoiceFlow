import { getFullReceipt } from '@/lib/models';
import OryxReceipt from '@/components/receipt/OryxReceipt';
import type { Metadata } from 'next';

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
    return <div style={{ padding: '20px', color: 'red' }}>Receipt not found.</div>;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @page {
            size: A4 landscape;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            font-family: Arial, Helvetica, sans-serif;
          }
          .receipt-page {
            width: 297mm;
            min-height: 210mm;
            max-width: 297mm;
            overflow: hidden;
          }
          @media screen {
            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              background: #e5e7eb;
              padding: 20px;
            }
            .receipt-page {
              box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            }
            .print-btn {
              position: fixed;
              top: 16px;
              right: 16px;
              background: #1a3a8f;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-family: Arial, sans-serif;
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .print-btn:hover { background: #0d2666; }
          }
          @media print {
            .print-btn { display: none !important; }
            body { background: white; padding: 0; display: block; }
          }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
        <OryxReceipt data={data} printMode />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Auto-trigger print dialog after a brief delay for PDF export workflows
            // Remove this if you don't want auto-print
            // setTimeout(() => window.print(), 800);
          `
        }} />
      </body>
    </html>
  );
}

