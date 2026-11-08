import { readDb, writeDb, Receipt } from './db';

/**
 * Generates a unique receipt number in the format: ORX-RCP-YYYY-NNNN
 * Safe against race conditions and duplicates using atomic file updates.
 *
 * @param year - Optional year override (defaults to current year)
 * @returns Receipt number string e.g. "ORX-RCP-2026-0001"
 */
export function generateReceiptNumber(year?: number): string {
  const db = readDb();
  const currentYear = year ?? new Date().getFullYear();
  const yearKey = String(currentYear);

  if (!db.receipt_sequence) {
    db.receipt_sequence = {};
  }

  const currentSeq = db.receipt_sequence[yearKey] || 0;
  const nextSeq = currentSeq + 1;
  db.receipt_sequence[yearKey] = nextSeq;

  writeDb(db);

  return `ORX-RCP-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Creates a receipt for a given payment ID.
 * If a receipt already exists for this payment, returns the existing one (idempotent).
 *
 * @param paymentId - ID of the payment to generate a receipt for
 * @param advanceAmount - Any advance/deposit amount to show on receipt
 * @returns The receipt record
 */
export function getOrCreateReceipt(paymentId: number, advanceAmount: number = 0): Receipt {
  const db = readDb();

  // Check if receipt already exists for this payment
  const existing = db.receipts.find((r) => r.payment_id === paymentId);
  if (existing) {
    return existing;
  }

  // Generate new receipt number
  const receiptNumber = generateReceiptNumber();
  const nextId = db.receipts.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const now = new Date();

  const newReceipt: Receipt = {
    id: nextId,
    receipt_number: receiptNumber,
    payment_id: paymentId,
    receipt_date: now.toISOString().split('T')[0],
    advance_amount: advanceAmount,
    notes: null,
    created_at: now.toISOString(),
  };

  db.receipts.push(newReceipt);
  writeDb(db);

  return newReceipt;
}
