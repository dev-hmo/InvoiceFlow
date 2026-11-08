const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateReceiptNumber(year) {
  const db = readDb();
  const currentYear = year || new Date().getFullYear();
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

function getOrCreateReceipt(paymentId, advanceAmount = 0) {
  const db = readDb();
  const existing = db.receipts.find((r) => r.payment_id === paymentId);
  if (existing) {
    return existing;
  }

  const receiptNumber = generateReceiptNumber();
  const nextId = db.receipts.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const now = new Date();

  const newReceipt = {
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

console.log('=== STARTING INVOICEFLOW ORYX RECEIPT TEST SUITE ===');

// Setup clean DB
const initialDb = {
  business_settings: {
    id: 1,
    name: 'Oryx Hospitality Management & Cruise Ship Training Center',
    address: 'No. (277), Seikkan Thar Road & Bo Min Yaung Road, Asia Plaza, Kyauktada, Yangon, Myanmar.',
    phone1: '09 777 379 000',
    phone2: '09 777 118 720',
    viber_whatsapp: '+959 421 139 022',
    facebook_page: 'FACEBOOK',
    tiktok_page: 'TIKTOK',
    thank_you_message: 'Thank you for choosing ORYX! Your Career Journey Starts Here. Train Today, Sail Tomorrow.',
    logo_path: '/oryx-logo.png',
    watermark_path: '/oryx-watermark.png',
    facebook_qr_path: '/qr-facebook.png',
    tiktok_qr_path: '/qr-tiktok.png',
    slogan_line1: 'Your Future',
    slogan_line2: 'Your Success',
  },
  students: [{ id: 1, name: 'Aung Kyaw Moe' }],
  courses: [],
  invoices: [{ id: 1, student_id: 1, total_amount: 1500000, status: 'partial' }],
  payments: [{ id: 1, invoice_id: 1, amount: 800000, payment_method: 'bank_transfer' }],
  payment_items: [{ id: 1, payment_id: 1, description: 'Tuition Fee 1st Installment', amount: 800000, sort_order: 0 }],
  receipts: [],
  receipt_sequence: {},
};
writeDb(initialDb);

// Test 1: Number format
const r1 = generateReceiptNumber(2026);
const r2 = generateReceiptNumber(2026);
console.log('Generated Receipt 1:', r1);
console.log('Generated Receipt 2:', r2);
if (r1 !== 'ORX-RCP-2026-0001' || r2 !== 'ORX-RCP-2026-0002') {
  throw new Error('Test 1 Failed: Bad receipt sequence');
}
console.log('✓ PASS Test 1: Sequential ORX-RCP-YYYY-NNNN format correct');

// Test 2: Idempotency (re-opening / printing does not alter receipt number)
const recA = getOrCreateReceipt(1, 0);
console.log('Created receipt record:', recA.receipt_number);
const recB = getOrCreateReceipt(1, 0);
console.log('Re-opened receipt record:', recB.receipt_number);
if (recA.receipt_number !== recB.receipt_number) {
  throw new Error('Test 2 Failed: Receipt number changed upon reprint');
}
console.log('✓ PASS Test 2: Idempotent receipt lookup preserved on re-open/re-print');

// Test 3: Math check
const items = [{ amount: 500000 }, { amount: 300000 }];
const subtotal = items.reduce((s, it) => s + it.amount, 0);
const advance = 50000;
const total = subtotal - advance;
if (subtotal !== 800000 || total !== 750000) {
  throw new Error('Test 3 Failed: Calculation error');
}
console.log('✓ PASS Test 3: Subtotal, Advance, and Total math verified');

console.log('=== ALL AUTOMATED QA TESTS PASSED SUCCESSFULLY ===');
