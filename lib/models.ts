import {
  readDb,
  writeDb,
  BusinessSettings,
  Student,
  Invoice,
  Payment,
  PaymentItem,
  Receipt,
  Course,
} from './db';

export type { BusinessSettings, Student, Invoice, Payment, PaymentItem, Receipt, Course };

export interface ReceiptFull extends Receipt {
  payment: Payment;
  payment_items: PaymentItem[];
  invoice: Invoice;
  student: Student;
  settings: BusinessSettings;
}

// ─── Business Settings ───────────────────────────────────────────────────────

export function getBusinessSettings(): BusinessSettings {
  const db = readDb();
  return db.business_settings;
}

export function updateBusinessSettings(data: Partial<BusinessSettings>): void {
  const db = readDb();
  db.business_settings = {
    ...db.business_settings,
    ...data,
    updated_at: new Date().toISOString(),
  };
  writeDb(db);
}

// ─── Students ────────────────────────────────────────────────────────────────

export function getAllStudents(): Student[] {
  const db = readDb();
  return [...db.students].sort((a, b) => a.name.localeCompare(b.name));
}

export function getStudent(id: number): Student | undefined {
  const db = readDb();
  return db.students.find((s) => s.id === id);
}

export function createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student {
  const db = readDb();
  const nextId = db.students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  const now = new Date().toISOString();
  const newStudent: Student = {
    ...data,
    id: nextId,
    created_at: now,
    updated_at: now,
  };
  db.students.push(newStudent);
  writeDb(db);
  return newStudent;
}

export function updateStudent(id: number, data: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): void {
  const db = readDb();
  const idx = db.students.findIndex((s) => s.id === id);
  if (idx !== -1) {
    db.students[idx] = {
      ...db.students[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    writeDb(db);
  }
}

export function deleteStudent(id: number): void {
  const db = readDb();
  db.students = db.students.filter((s) => s.id !== id);
  writeDb(db);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function getAllInvoices(): (Invoice & { student_name: string })[] {
  const db = readDb();
  return db.invoices
    .map((inv) => {
      const student = db.students.find((s) => s.id === inv.student_id);
      return {
        ...inv,
        student_name: student ? student.name : 'Unknown',
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getInvoice(id: number): (Invoice & { student_name?: string }) | undefined {
  const db = readDb();
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return undefined;
  const student = db.students.find((s) => s.id === inv.student_id);
  return {
    ...inv,
    student_name: student ? student.name : 'Unknown',
  };
}

export function createInvoice(data: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Invoice {
  const db = readDb();
  const nextId = db.invoices.reduce((max, i) => Math.max(max, i.id), 0) + 1;
  const now = new Date().toISOString();
  const newInvoice: Invoice = {
    ...data,
    id: nextId,
    created_at: now,
    updated_at: now,
  };
  db.invoices.push(newInvoice);
  writeDb(db);
  return newInvoice;
}

export function updateInvoiceStatus(id: number): void {
  const db = readDb();
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return;

  const totalPaid = db.payments
    .filter((p) => p.invoice_id === id)
    .reduce((sum, p) => sum + p.amount, 0);

  let status: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  if (totalPaid >= inv.total_amount) status = 'paid';
  else if (totalPaid > 0) status = 'partial';

  inv.status = status;
  inv.updated_at = new Date().toISOString();
  writeDb(db);
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function getPaymentsForInvoice(invoiceId: number): Payment[] {
  const db = readDb();
  return db.payments
    .filter((p) => p.invoice_id === invoiceId)
    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
}

export function getPayment(id: number): Payment | undefined {
  const db = readDb();
  return db.payments.find((p) => p.id === id);
}

export function createPayment(
  data: Omit<Payment, 'id' | 'created_at'>,
  items: Omit<PaymentItem, 'id' | 'payment_id'>[]
): Payment {
  const db = readDb();
  const paymentId = db.payments.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const now = new Date().toISOString();

  const newPayment: Payment = {
    ...data,
    id: paymentId,
    created_at: now,
  };
  db.payments.push(newPayment);

  let nextItemId = db.payment_items.reduce((max, it) => Math.max(max, it.id), 0) + 1;
  items.forEach((item, i) => {
    db.payment_items.push({
      id: nextItemId++,
      payment_id: paymentId,
      description: item.description,
      amount: item.amount,
      sort_order: item.sort_order ?? i,
    });
  });

  writeDb(db);
  updateInvoiceStatus(data.invoice_id);

  return newPayment;
}

export function getPaymentItems(paymentId: number): PaymentItem[] {
  const db = readDb();
  return db.payment_items
    .filter((pi) => pi.payment_id === paymentId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// ─── Receipts ────────────────────────────────────────────────────────────────

export function getAllReceipts(): (Receipt & { student_name: string; payment_method: string; amount: number })[] {
  const db = readDb();
  return db.receipts
    .map((r) => {
      const payment = db.payments.find((p) => p.id === r.payment_id);
      const invoice = payment ? db.invoices.find((i) => i.id === payment.invoice_id) : undefined;
      const student = invoice ? db.students.find((s) => s.id === invoice.student_id) : undefined;
      return {
        ...r,
        student_name: student ? student.name : 'Unknown',
        payment_method: payment ? payment.payment_method : 'cash',
        amount: payment ? payment.amount : 0,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getReceipt(id: number): Receipt | undefined {
  const db = readDb();
  return db.receipts.find((r) => r.id === id);
}

export function getReceiptByNumber(receiptNumber: string): Receipt | undefined {
  const db = readDb();
  return db.receipts.find((r) => r.receipt_number === receiptNumber);
}

export function getFullReceipt(id: number): ReceiptFull | null {
  const db = readDb();
  const receipt = db.receipts.find((r) => r.id === id);
  if (!receipt) return null;

  const payment = db.payments.find((p) => p.id === receipt.payment_id);
  if (!payment) return null;

  const items = db.payment_items
    .filter((pi) => pi.payment_id === receipt.payment_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const invoice = db.invoices.find((i) => i.id === payment.invoice_id);
  if (!invoice) return null;

  const student = db.students.find((s) => s.id === invoice.student_id);
  if (!student) return null;

  return {
    ...receipt,
    payment,
    payment_items: items,
    invoice,
    student,
    settings: db.business_settings,
  };
}
