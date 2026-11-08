/**
 * OryxReceipt – Pixel-faithful reproduction of the Oryx Hospitality
 * Cruise Ship Training Center receipt design.
 *
 * Source of truth: The attached Oryx reference receipt image.
 * Paper sizing: Standard A4 Landscape (297mm × 210mm) / 864:382 aspect ratio.
 */

import React from 'react';
import type { ReceiptFull } from '@/lib/models';

interface OryxReceiptProps {
  data: ReceiptFull;
  printMode?: boolean;
}

// ─── Exact colors sampled directly from the reference image ─────────────────
const COLOR_BLUE_DARK = '#2B3E8A';   // Decorative blocks, receipt header box, footer background
const COLOR_BLUE_TABLE = '#1D50A3';  // Table header background, borders
const COLOR_TEXT_LABEL = '#243265';  // "Student Name:", "Payment Method:", table labels

function formatMMK(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day} / ${month} / ${year}`;
}

export default function OryxReceipt({ data }: OryxReceiptProps) {
  const { payment, payment_items, student, settings } = data;

  const subtotal = payment_items.reduce((sum, item) => sum + item.amount, 0);
  const advance = data.advance_amount ?? 0;
  const total = subtotal - advance;

  return (
    <div
      className="receipt-wrapper receipt-page relative bg-white select-none text-black"
      style={{
        width: '8in',
        height: '3.5in', // Exact 8 x 3.5 inches
        maxHeight: '3.5in',
        margin: '0 auto',
        padding: '0',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
      }}
    >
      {/* ── 1. WATERMARK ──────────────────────────────────────────────── */}
      {/* Large Oryx logo watermark centered behind the receipt content */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={settings.watermark_path || '/oryx-watermark.png'}
          alt="Oryx Watermark"
          style={{
            width: '48%',
            height: 'auto',
            opacity: 0.12,
            objectFit: 'contain',
            transform: 'translateY(-2%)',
          }}
        />
      </div>

      {/* ── RECEIPT CONTENT CONTAINER ─────────────────────────────────── */}
      <div className="relative flex flex-col h-full justify-between" style={{ zIndex: 1 }}>

        {/* ── TOP SECTION: HEADER + STUDENT ROW ───────────────────────── */}
        <div>
          {/* Header Row */}
          <div className="flex items-stretch justify-between" style={{ height: '78px' }}>
            
            {/* Left Header Group: Dark Blue Block + Logo + Brand + Divider + Slogan */}
            <div className="flex items-center">
              {/* Dark blue decorative block on the far left */}
              <div
                style={{
                  width: '42px',
                  height: '56px',
                  backgroundColor: COLOR_BLUE_DARK,
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}
              />

              {/* Oryx Logo and brand identity */}
              <div className="flex items-center pl-3 pr-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logo_path || '/oryx-logo.png'}
                  alt="Oryx Hospitality"
                  style={{
                    height: '54px',
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Vertical divider beside logo */}
              <div
                style={{
                  width: '1.5px',
                  height: '46px',
                  backgroundColor: COLOR_BLUE_DARK,
                  margin: '0 10px',
                }}
              />

              {/* Slogan */}
              <div
                className="flex flex-col justify-center italic"
                style={{
                  fontFamily: "'Brush Script MT', cursive, Georgia, serif",
                  color: COLOR_BLUE_DARK,
                  lineHeight: '1.25',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{settings.slogan_line1 || 'Your Future'}</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{settings.slogan_line2 || 'Your Success'}</span>
              </div>
            </div>

            {/* Right Header Group: Receipt No. & Date Block */}
            <div
              style={{
                width: '260px',
                backgroundColor: COLOR_BLUE_DARK,
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '10px 18px',
                gap: '8px',
                borderBottomLeftRadius: '2px',
              }}
            >
              {/* Receipt No. field */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="whitespace-nowrap tracking-wide" style={{ fontSize: '13px' }}>
                  Receipt No. :
                </span>
                <div
                  className="flex-1 ml-2 font-mono text-center tracking-wider"
                  style={{
                    borderBottom: '1.5px solid #ffffff',
                    fontSize: '13px',
                    paddingBottom: '1px',
                    color: '#ffffff',
                  }}
                >
                  {data.receipt_number}
                </div>
              </div>

              {/* Date field directly below Receipt No. */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="whitespace-nowrap tracking-wide" style={{ fontSize: '13px' }}>
                  Date :
                </span>
                <div
                  className="flex-1 ml-2 text-center tracking-wider"
                  style={{
                    borderBottom: '1.5px solid #ffffff',
                    fontSize: '12px',
                    paddingBottom: '1px',
                    color: '#ffffff',
                  }}
                >
                  {formatDate(data.receipt_date)}
                </div>
              </div>
            </div>
          </div>

          {/* Divider line under header */}
          <div
            style={{
              height: '1px',
              backgroundColor: '#a2b4db',
              width: '100%',
              marginTop: '2px',
            }}
          />

          {/* ── 2. STUDENT AND PAYMENT INFORMATION ────────────────────── */}
          <div
            className="flex items-center justify-between px-8 py-3"
            style={{ color: COLOR_TEXT_LABEL }}
          >
            {/* Student Name field on the left with continuous line */}
            <div className="flex items-baseline flex-1 max-w-[48%]">
              <span className="font-bold whitespace-nowrap" style={{ fontSize: '13.5px' }}>
                Student Name:
              </span>
              <div
                className="flex-1 ml-3 px-2 text-gray-900 font-semibold"
                style={{
                  borderBottom: '1.5px solid #758bb8',
                  fontSize: '13.5px',
                  minHeight: '20px',
                }}
              >
                {student.name}
              </div>
            </div>

            {/* Payment Method section on the right */}
            <div className="flex items-center gap-5 ml-4">
              <span className="font-bold whitespace-nowrap" style={{ fontSize: '13.5px' }}>
                Payment Method:
              </span>

              {/* Cash option */}
              <div className="flex items-center gap-2 cursor-pointer">
                <div
                  className="rounded flex items-center justify-center bg-white"
                  style={{
                    width: '17px',
                    height: '17px',
                    border: `1.8px solid ${COLOR_BLUE_DARK}`,
                  }}
                >
                  {payment.payment_method === 'cash' && (
                    <div
                      style={{
                        width: '9px',
                        height: '9px',
                        backgroundColor: COLOR_BLUE_DARK,
                        borderRadius: '1px',
                      }}
                    />
                  )}
                </div>
                <span className="font-semibold text-gray-900" style={{ fontSize: '13px' }}>
                  Cash
                </span>
              </div>

              {/* Bank Transfer option */}
              <div className="flex items-center gap-2 cursor-pointer">
                <div
                  className="rounded flex items-center justify-center bg-white"
                  style={{
                    width: '17px',
                    height: '17px',
                    border: `1.8px solid ${COLOR_BLUE_DARK}`,
                  }}
                >
                  {payment.payment_method === 'bank_transfer' && (
                    <div
                      style={{
                        width: '9px',
                        height: '9px',
                        backgroundColor: COLOR_BLUE_DARK,
                        borderRadius: '1px',
                      }}
                    />
                  )}
                </div>
                <span className="font-semibold text-gray-900" style={{ fontSize: '13px' }}>
                  Bank Transfer
                </span>
              </div>

              {/* Other option */}
              <div className="flex items-center gap-2">
                <div
                  className="rounded flex items-center justify-center bg-white"
                  style={{
                    width: '17px',
                    height: '17px',
                    border: `1.8px solid ${COLOR_BLUE_DARK}`,
                  }}
                >
                  {payment.payment_method === 'other' && (
                    <div
                      style={{
                        width: '9px',
                        height: '9px',
                        backgroundColor: COLOR_BLUE_DARK,
                        borderRadius: '1px',
                      }}
                    />
                  )}
                </div>
                <span className="font-semibold text-gray-900 whitespace-nowrap" style={{ fontSize: '13px' }}>
                  Other :
                </span>
                <div
                  className="px-1 text-gray-900 font-semibold text-center"
                  style={{
                    width: '100px',
                    borderBottom: '1.5px solid #758bb8',
                    fontSize: '12px',
                    minHeight: '18px',
                  }}
                >
                  {payment.payment_method === 'other' ? (payment.payment_method_detail || '✓') : ''}
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. RECEIPT TABLE & SUMMARY ────────────────────────────── */}
          <div className="px-8 mt-1">
            <table
              className="w-full border-collapse"
              style={{
                border: `1.5px solid ${COLOR_BLUE_TABLE}`,
              }}
            >
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '70%' }} />
                <col style={{ width: '21%' }} />
              </colgroup>

              {/* Blue table header */}
              <thead>
                <tr style={{ backgroundColor: COLOR_BLUE_TABLE, color: '#ffffff' }}>
                  <th
                    className="py-1.5 text-center font-bold tracking-wider"
                    style={{
                      borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                      fontSize: '13px',
                    }}
                  >
                    No.
                  </th>
                  <th
                    className="py-1.5 text-center font-bold tracking-wider"
                    style={{
                      borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                      fontSize: '13px',
                    }}
                  >
                    Description
                  </th>
                  <th
                    className="py-1.5 text-center font-bold tracking-wider"
                    style={{ fontSize: '13px' }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>

              {/* Table body rows */}
              <tbody>
                {/* Fixed row presentation to match exact reference form */}
                {Array.from({ length: Math.max(3, payment_items.length) }).map((_, index) => {
                  const item = payment_items[index];
                  return (
                    <tr
                      key={index}
                      style={{
                        height: '24px',
                        borderBottom: `1px solid ${COLOR_BLUE_TABLE}`,
                      }}
                    >
                      <td
                        className="text-center font-semibold text-gray-800"
                        style={{
                          borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                          fontSize: '12px',
                        }}
                      >
                        {item ? index + 1 : ''}
                      </td>
                      <td
                        className="px-3 font-medium text-gray-900"
                        style={{
                          borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                          fontSize: '12.5px',
                        }}
                      >
                        {item?.description || ''}
                      </td>
                      <td
                        className="px-4 text-right font-semibold text-gray-900"
                        style={{ fontSize: '12.5px' }}
                      >
                        {item ? formatMMK(item.amount) : ''}
                      </td>
                    </tr>
                  );
                })}

                {/* Subtotal row */}
                <tr style={{ height: '22px', borderBottom: `1px solid ${COLOR_BLUE_TABLE}` }}>
                  <td style={{ borderRight: `1.5px solid ${COLOR_BLUE_TABLE}` }} />
                  <td
                    className="text-right pr-4 font-bold"
                    style={{
                      borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                      color: COLOR_BLUE_DARK,
                      fontSize: '12.5px',
                    }}
                  >
                    Subtotal :
                  </td>
                  <td className="px-4 text-right font-bold text-gray-900" style={{ fontSize: '12.5px' }}>
                    {formatMMK(subtotal)}
                  </td>
                </tr>

                {/* Advance row */}
                <tr style={{ height: '22px', borderBottom: `1px solid ${COLOR_BLUE_TABLE}` }}>
                  <td style={{ borderRight: `1.5px solid ${COLOR_BLUE_TABLE}` }} />
                  <td
                    className="text-right pr-4 font-bold"
                    style={{
                      borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                      color: COLOR_BLUE_DARK,
                      fontSize: '12.5px',
                    }}
                  >
                    Advance :
                  </td>
                  <td className="px-4 text-right font-bold text-gray-900" style={{ fontSize: '12.5px' }}>
                    {advance ? formatMMK(advance) : '0'}
                  </td>
                </tr>

                {/* Total row */}
                <tr style={{ height: '23px' }}>
                  <td style={{ borderRight: `1.5px solid ${COLOR_BLUE_TABLE}` }} />
                  <td
                    className="text-right pr-4 font-bold"
                    style={{
                      borderRight: `1.5px solid ${COLOR_BLUE_TABLE}`,
                      color: COLOR_BLUE_DARK,
                      fontSize: '13px',
                    }}
                  >
                    Total :
                  </td>
                  <td
                    className="px-4 text-right font-extrabold"
                    style={{
                      color: COLOR_BLUE_DARK,
                      fontSize: '13.5px',
                    }}
                  >
                    {formatMMK(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BOTTOM SECTION: THANK YOU MESSAGE + FOOTER ──────────────── */}
        <div>
          {/* Thank-you message in brand script font */}
          <div
            className="px-8 pb-1 italic font-semibold text-center sm:text-left"
            style={{
              fontFamily: "'Brush Script MT', cursive, Georgia, serif",
              color: COLOR_BLUE_DARK,
              fontSize: '16px',
              letterSpacing: '0.2px',
            }}
          >
            {settings.thank_you_message}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between" style={{ minHeight: '52px' }}>
            
            {/* Left curved dark blue block containing address & phone numbers */}
            <div
              className="flex items-center justify-between px-6 py-2.5 flex-1"
              style={{
                backgroundColor: COLOR_BLUE_DARK,
                color: '#ffffff',
                borderTopRightRadius: '24px',
                marginRight: '24px',
              }}
            >
              {/* Address with location pin */}
              <div className="flex items-start gap-2.5 max-w-[58%]">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-white fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-[10px] leading-tight font-medium">
                  {settings.address}
                </span>
              </div>

              {/* Phone & Viber / WhatsApp */}
              <div className="flex flex-col gap-1 text-[10px] font-medium pl-3 border-l border-blue-400/40">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span>Phone: {settings.phone1}, {settings.phone2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.24-1.3c1.42.79 3.05 1.25 4.76 1.25 5.52 0 10-4.48 10-10S17.52 2 12 2zm4.5 14.5c-.2.5-1.1.9-1.6 1-.4.1-.9.1-2.9-.7-2.3-1-3.8-3.3-3.9-3.5-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.9.2-.2.5-.3.7-.3.2 0 .4 0 .5.1.2.4.6 1.5.7 1.6.1.1.1.3 0 .5-.1.2-.2.3-.3.4-.1.1-.3.3-.1.6.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.9 1.7.3.1.5.1.7-.1.2-.2.9-1.1 1.2-1.4.2-.3.4-.3.7-.2.3.1 1.9.9 2.2 1.1.3.2.5.3.6.4.1.2.1 1.1-.1 1.6z"/>
                  </svg>
                  <span>Viber &amp; WhatsApp: {settings.viber_whatsapp}</span>
                </div>
              </div>
            </div>

            {/* Right side: Facebook & TikTok QR Codes with vertical divider */}
            <div className="flex items-center pr-8 gap-4 flex-shrink-0">
              {/* Facebook QR Code */}
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.facebook_qr_path || '/qr-facebook.png'}
                  alt="Facebook QR Code"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-[9px] font-bold tracking-widest text-black mt-0.5">
                  FACEBOOK
                </span>
              </div>

              {/* Vertical divider */}
              <div style={{ width: '1.5px', height: '42px', backgroundColor: '#000000' }} />

              {/* TikTok QR Code */}
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.tiktok_qr_path || '/qr-tiktok.png'}
                  alt="TikTok QR Code"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-[9px] font-bold tracking-widest text-black mt-0.5">
                  TIKTOK
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
