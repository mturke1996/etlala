/**
 * Invoice PDF Template
 * ====================
 * Professional A4 invoice template with full Arabic RTL support.
 * 
 * Design Principles:
 * - Clean visual hierarchy (company → invoice info → client → items → totals)
 * - Print-safe colors (tested for CMYK offset & laser)
 * - Embedded Arabic fonts (Cairo family)
 * - Responsive table that handles long descriptions
 * - Professional footer with company info
 * - Balanced whitespace and alignment
 * 
 * Architecture:
 * - Pure presentational component (no side effects)
 * - Receives typed props (Invoice + Client)
 * - Uses shared styles from pdfStyles.ts
 * - Can be extended for different invoice formats
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import './pdfFonts'; // Side-effect: registers fonts
import { pdfBaseStyles, PDF_COLORS } from './pdfStyles';
import { PDF_FONT_FAMILY } from './pdfFonts';
import type { Invoice, Client } from '../../types';
import { COMPANY_INFO } from '../../constants/companyInfo';

// ─── Invoice-Specific Styles ──────────────────────────
const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 6,
    objectFit: 'contain',
  },
  companyBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
  },
  companySubtitle: {
    fontSize: 7,
    fontWeight: 600,
    color: PDF_COLORS.accentDark,
    fontFamily: PDF_FONT_FAMILY,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#e0dcd4',
    letterSpacing: 2,
    fontFamily: PDF_FONT_FAMILY,
  },
  invoiceNumber: {
    fontSize: 11,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
    textAlign: 'left',
    marginTop: 2,
  },

  // Contact bar
  contactBar: {
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 8,
    marginBottom: 20,
  },
  contactText: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.textMuted,
    fontFamily: PDF_FONT_FAMILY,
  },

  // Info section (client + dates)
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 20,
  },
  clientBlock: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 3,
    borderRightColor: PDF_COLORS.primary,
  },
  clientLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: PDF_COLORS.accentDark,
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: PDF_FONT_FAMILY,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 800,
    color: PDF_COLORS.text,
    fontFamily: PDF_FONT_FAMILY,
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 9,
    color: PDF_COLORS.textLight,
    fontFamily: PDF_FONT_FAMILY,
    lineHeight: 1.5,
  },
  dateBlock: {
    width: 160,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 8,
    color: PDF_COLORS.textLight,
    fontFamily: PDF_FONT_FAMILY,
  },
  dateValue: {
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.text,
    fontFamily: PDF_FONT_FAMILY,
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: PDF_FONT_FAMILY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.tableHeader,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: PDF_COLORS.white,
    fontSize: 9,
    fontWeight: 700,
    fontFamily: PDF_FONT_FAMILY,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0efeb',
  },
  tableRowAlt: {
    backgroundColor: PDF_COLORS.tableRowAlt,
  },
  colDescription: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colPrice: { width: 75, textAlign: 'center' },
  colTotal: { width: 85, textAlign: 'left' },
  cellText: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 400,
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
  },

  // Totals
  totalsSection: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
  },
  totalsBox: {
    width: '55%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: PDF_COLORS.textMuted,
    fontFamily: PDF_FONT_FAMILY,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: PDF_FONT_FAMILY,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: PDF_COLORS.primary,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
  },

  // Notes
  notesBlock: {
    padding: 12,
    borderRightWidth: 3,
    borderRightColor: PDF_COLORS.accent,
    backgroundColor: '#fffcf5',
    borderRadius: 4,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: PDF_COLORS.accentDark,
    fontFamily: PDF_FONT_FAMILY,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#555555',
    fontFamily: PDF_FONT_FAMILY,
    lineHeight: 1.6,
  },
});

// ─── Helper: Format Currency ─────────────────────────
const formatAmount = (amount: number): string => {
  const rounded = Math.round(amount);
  return rounded.toLocaleString('ar-LY') + ' د.ل';
};

// ─── Helper: Format Date ─────────────────────────────
const formatPdfDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

// ─── Helper: Status Label & Color ────────────────────
const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    paid: { label: 'مدفوعة', color: '#0d9668', bg: '#e6f9f1' },
    sent: { label: 'مرسلة', color: '#2563eb', bg: '#eff6ff' },
    draft: { label: 'مسودة', color: '#6b7280', bg: '#f3f4f6' },
    overdue: { label: 'متأخرة', color: '#dc2626', bg: '#fef2f2' },
    partially_paid: { label: 'جزئية', color: '#d97706', bg: '#fffbeb' },
    cancelled: { label: 'ملغاة', color: '#dc2626', bg: '#fef2f2' },
  };
  return map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
};

// ═══════════════════════════════════════════════════════
// ─── Main Component ──────────────────────────────────
// ═══════════════════════════════════════════════════════

interface InvoicePDFProps {
  invoice: Invoice;
  client: Client;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client }) => {
  const statusInfo = getStatusInfo(invoice.status);

  return (
    <Document
      title={`فاتورة-${invoice.invoiceNumber}`}
      author={COMPANY_INFO.fullName}
      subject="فاتورة"
      language="ar"
    >
      <Page size="A4" style={pdfBaseStyles.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          {/* Company Info (Right) */}
          <View style={s.companyBlock}>
            <View>
              <Text style={s.companyName}>{COMPANY_INFO.fullName}</Text>
              <Text style={s.companySubtitle}>Architecture & Engineering</Text>
            </View>
          </View>

          {/* Invoice Badge (Left) */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* ═══ CONTACT BAR ═══ */}
        <View style={s.contactBar}>
          <Text style={s.contactText}>
            {COMPANY_INFO.address} | {COMPANY_INFO.phone}
            {COMPANY_INFO.email ? ` | ${COMPANY_INFO.email}` : ''}
          </Text>
        </View>

        {/* ═══ CLIENT & DATES ═══ */}
        <View style={s.infoSection}>
          {/* Client Info */}
          <View style={s.clientBlock}>
            <Text style={s.clientLabel}>فاتورة إلى</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.address ? (
              <Text style={s.clientDetail}>{client.address}</Text>
            ) : null}
            {client.phone ? (
              <Text style={s.clientDetail}>{client.phone}</Text>
            ) : null}
          </View>

          {/* Dates */}
          <View style={s.dateBlock}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ الإصدار</Text>
              <Text style={s.dateValue}>{formatPdfDate(invoice.issueDate)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ الاستحقاق</Text>
              <Text style={s.dateValue}>{formatPdfDate(invoice.dueDate)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>الحالة</Text>
              <Text
                style={[
                  s.statusBadge,
                  { color: statusInfo.color, backgroundColor: statusInfo.bg },
                ]}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ ITEMS TABLE ═══ */}
        <View style={{ marginBottom: 4 }}>
          {/* Table Header */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDescription]}>الوصف</Text>
            <Text style={[s.tableHeaderText, s.colQty]}>الكمية</Text>
            <Text style={[s.tableHeaderText, s.colPrice]}>السعر</Text>
            <Text style={[s.tableHeaderText, s.colTotal]}>الإجمالي</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => (
            <View
              key={index}
              style={[s.tableRow, index % 2 !== 0 ? s.tableRowAlt : {}]}
            >
              <Text style={[s.cellTextBold, s.colDescription]}>
                {item.description}
              </Text>
              <Text style={[s.cellText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.cellText, s.colPrice]}>
                {formatAmount(item.unitPrice)}
              </Text>
              <Text style={[s.cellTextBold, s.colTotal]}>
                {formatAmount(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* ═══ TOTALS ═══ */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            {/* Subtotal */}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>المجموع الفرعي</Text>
              <Text style={s.totalValue}>{formatAmount(invoice.subtotal)}</Text>
            </View>

            {/* Tax (if any) */}
            {invoice.taxAmount > 0 ? (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>
                  الضريبة ({invoice.taxRate}%)
                </Text>
                <Text style={s.totalValue}>
                  {formatAmount(invoice.taxAmount)}
                </Text>
              </View>
            ) : null}

            {/* Grand Total */}
            <View style={s.grandTotalRow}>
              <Text style={s.grandTotalLabel}>الإجمالي</Text>
              <Text style={s.grandTotalValue}>
                {formatAmount(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ NOTES ═══ */}
        {invoice.notes ? (
          <View style={s.notesBlock}>
            <Text style={s.notesLabel}>ملاحظات</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* ═══ FOOTER ═══ */}
        <View style={pdfBaseStyles.footer} fixed>
          <Text style={pdfBaseStyles.footerText}>
            {COMPANY_INFO.fullName}
          </Text>
          <Text style={pdfBaseStyles.footerText}>
            {COMPANY_INFO.address} | {COMPANY_INFO.phone}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
