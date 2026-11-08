import fs from 'fs';
import path from 'path';

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface BusinessSettings {
  id: number;
  name: string;
  address: string;
  phone1: string;
  phone2: string;
  viber_whatsapp: string;
  facebook_page: string;
  tiktok_page: string;
  thank_you_message: string;
  logo_path: string;
  watermark_path: string;
  facebook_qr_path: string;
  tiktok_qr_path: string;
  slogan_line1: string;
  slogan_line2: string;
  updated_at: string;
}

export interface Student {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  description: string | null;
  fee: number;
  created_at: string;
}

export interface Invoice {
  id: number;
  student_id: number;
  course_id: number | null;
  description: string;
  total_amount: number;
  notes: string | null;
  status: 'unpaid' | 'partial' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'other';
  payment_method_detail: string | null;
  notes: string | null;
  paid_at: string;
  created_at: string;
}

export interface PaymentItem {
  id: number;
  payment_id: number;
  description: string;
  amount: number;
  sort_order: number;
}

export interface Receipt {
  id: number;
  receipt_number: string;
  payment_id: number;
  receipt_date: string;
  advance_amount: number;
  notes: string | null;
  created_at: string;
}

export interface DbSchema {
  business_settings: BusinessSettings;
  students: Student[];
  courses: Course[];
  invoices: Invoice[];
  payments: Payment[];
  payment_items: PaymentItem[];
  receipts: Receipt[];
  receipt_sequence: Record<string, number>; // year -> last_seq
}

export const defaultSettings: BusinessSettings = {
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
  updated_at: new Date().toISOString(),
};

function getInitialData(): DbSchema {
  return {
    business_settings: defaultSettings,
    students: [
      {
        id: 1,
        name: 'Aung Kyaw Moe',
        phone: '09 777 123 456',
        email: 'aungkyawmoe@example.com',
        address: 'Yangon, Myanmar',
        notes: 'Enrolled in Cruise Hospitality Course',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    courses: [
      {
        id: 1,
        name: 'Hospitality Management & Cruise Ship Training',
        description: 'Comprehensive cruise line hospitality training program',
        fee: 1500000,
        created_at: new Date().toISOString(),
      }
    ],
    invoices: [
      {
        id: 1,
        student_id: 1,
        course_id: 1,
        description: 'Cruise Ship Hospitality Training - Batch 12 Enrollment',
        total_amount: 1500000,
        notes: 'Standard enrollment',
        status: 'partial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    payments: [
      {
        id: 1,
        invoice_id: 1,
        amount: 800000,
        payment_method: 'bank_transfer',
        payment_method_detail: 'KBZ Bank',
        notes: 'First installment',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    ],
    payment_items: [
      {
        id: 1,
        payment_id: 1,
        description: 'Hospitality Management Course Fee (1st Installment)',
        amount: 800000,
        sort_order: 0,
      }
    ],
    receipts: [
      {
        id: 1,
        receipt_number: `ORX-RCP-${new Date().getFullYear()}-0001`,
        payment_id: 1,
        receipt_date: new Date().toISOString().split('T')[0],
        advance_amount: 0,
        notes: null,
        created_at: new Date().toISOString(),
      }
    ],
    receipt_sequence: {
      [String(new Date().getFullYear())]: 1,
    },
  };
}

export function readDb(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Ensure all settings fields exist
    parsed.business_settings = { ...defaultSettings, ...parsed.business_settings };
    return parsed;
  } catch (err) {
    console.error('Error reading DB, reinitializing:', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export function writeDb(data: DbSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
