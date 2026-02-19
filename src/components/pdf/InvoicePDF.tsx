// @ts-nocheck
/**
 * Invoice PDF Template - Professional A4 Layout
 * ==============================================
 * - Full Arabic RTL support
 * - Company logo + name + address
 * - Embedded Cairo font
 * - Print-safe colors
 * - Clean typographic hierarchy
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './pdfFonts';
import { pdfBaseStyles, PDF_COLORS } from './pdfStyles';
import { PDF_FONT_FAMILY } from './pdfFonts';
import type { Invoice, Client } from '../../types';
import { COMPANY_INFO } from '../../constants/companyInfo';

// Get logo URL - works in dev and production
const getLogoUrl = () => {
  try {
    return (window?.location?.origin || '') + '/logo.jpeg';
  } catch {
    return '/logo.jpeg';
  }
};

// ─── Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: PDF_COLORS.primary,
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#d4d0c8',
    letterSpacing: 3,
    fontFamily: PDF_FONT_FAMILY,
  },
  invoiceNumber: {
    fontSize: 11,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
    marginTop: 2,
  },

  // Company info bar
  companyBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 18,
    paddingBottom: 8,
  },
  companyText: {
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.textMuted,
    fontFamily: PDF_FONT_FAMILY,
  },

  // Client & Dates section
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 20,
  },
  clientBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRightWidth: 3,
    borderRightColor: PDF_COLORS.primary,
    backgroundColor: '#fafaf8',
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: PDF_COLORS.accentDark,
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: PDF_FONT_FAMILY,
  },
  clientName: {
    fontSize: 13,
    fontWeight: 800,
    color: PDF_COLORS.text,
    fontFamily: PDF_FONT_FAMILY,
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 9,
    color: PDF_COLORS.textLight,
    fontFamily: PDF_FONT_FAMILY,
    lineHeight: 1.6,
  },
  datesBox: {
    width: 155,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
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
    paddingVertical: 3,
    borderRadius: 4,
  },

  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 1,
  },
  thText: {
    color: PDF_COLORS.white,
    fontSize: 9,
    fontWeight: 700,
    fontFamily: PDF_FONT_FAMILY,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0efeb',
  },
  rowAlt: {
    backgroundColor: PDF_COLORS.tableRowAlt,
  },
  colDesc: { flex: 1 },
  colQty: { width: 55, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'center' },
  colTotal: { width: 85, textAlign: 'left' },
  cellText: {
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 400,
  },
  cellBold: {
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
    fontWeight: 700,
  },

  // Totals
  totalsWrap: {
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
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 2.5,
    borderTopColor: PDF_COLORS.primary,
    marginTop: 6,
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
  },
  grandValue: {
    fontSize: 15,
    fontWeight: 800,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONT_FAMILY,
  },

  // Notes
  notesBox: {
    padding: 12,
    borderRightWidth: 3,
    borderRightColor: PDF_COLORS.accent,
    backgroundColor: '#fffcf5',
    borderRadius: 3,
    marginBottom: 14,
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
    color: '#555',
    fontFamily: PDF_FONT_FAMILY,
    lineHeight: 1.7,
  },
});

// ─── Helpers ────────────────────────────────────────
const fmtAmount = (n: number) => Math.round(n).toLocaleString('ar-LY') + ' د.ل';

const fmtDate = (d: string) => {
  try {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  } catch {
    return d;
  }
};

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'مدفوعة', color: '#0d9668', bg: '#e6f9f1' },
  sent: { label: 'مرسلة', color: '#2563eb', bg: '#eff6ff' },
  draft: { label: 'مسودة', color: '#6b7280', bg: '#f3f4f6' },
  overdue: { label: 'متأخرة', color: '#dc2626', bg: '#fef2f2' },
  partially_paid: { label: 'جزئية', color: '#d97706', bg: '#fffbeb' },
  cancelled: { label: 'ملغاة', color: '#dc2626', bg: '#fef2f2' },
};

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

interface Props {
  invoice: Invoice;
  client: Client;
}

export const InvoicePDF: React.FC<Props> = ({ invoice, client }) => {
  const st = statusMap[invoice.status] || { label: invoice.status, color: '#6b7280', bg: '#f3f4f6' };
  const logoUrl = getLogoUrl();

  return (
    <Document
      title={`فاتورة-${invoice.invoiceNumber}`}
      author={COMPANY_INFO.fullName}
      subject="فاتورة"
      language="ar"
    >
      <Page size="A4" style={pdfBaseStyles.page}>

        {/* ═══ HEADER: Logo + Invoice Badge ═══ */}
        <View style={s.header}>
          {/* Company Logo */}
          <View>
            <Image src={logoUrl} style={s.logo} />
          </View>

          {/* Invoice Title */}
          <View style={s.headerRight}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* ═══ COMPANY INFO BAR ═══ */}
        <View style={s.companyBar}>
          <Text style={s.companyText}>
            {COMPANY_INFO.fullName} | {COMPANY_INFO.address} | {COMPANY_INFO.phone}
          </Text>
        </View>

        {/* ═══ CLIENT + DATES ═══ */}
        <View style={s.infoSection}>
          {/* Client */}
          <View style={s.clientBox}>
            <Text style={s.sectionLabel}>فاتورة إلى</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.phone ? <Text style={s.clientDetail}>{client.phone}</Text> : null}
            {client.address ? <Text style={s.clientDetail}>{client.address}</Text> : null}
          </View>

          {/* Dates */}
          <View style={s.datesBox}>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ الإصدار</Text>
              <Text style={s.dateValue}>{fmtDate(invoice.issueDate)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>تاريخ الاستحقاق</Text>
              <Text style={s.dateValue}>{fmtDate(invoice.dueDate)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>الحالة</Text>
              <Text style={[s.statusBadge, { color: st.color, backgroundColor: st.bg }]}>
                {st.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ ITEMS TABLE ═══ */}
        <View style={{ marginBottom: 4 }}>
          {/* Header */}
          <View style={s.tableHeader}>
            <Text style={[s.thText, s.colDesc]}>الوصف</Text>
            <Text style={[s.thText, s.colQty]}>الكمية</Text>
            <Text style={[s.thText, s.colPrice]}>السعر</Text>
            <Text style={[s.thText, s.colTotal]}>الإجمالي</Text>
          </View>

          {/* Rows */}
          {invoice.items.map((item, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowAlt]}>
              <Text style={[s.cellBold, s.colDesc]}>{item.description}</Text>
              <Text style={[s.cellText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.cellText, s.colPrice]}>{fmtAmount(item.unitPrice)}</Text>
              <Text style={[s.cellBold, s.colTotal]}>{fmtAmount(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ═══ TOTALS ═══ */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>المجموع الفرعي</Text>
              <Text style={s.totalValue}>{fmtAmount(invoice.subtotal)}</Text>
            </View>

            {invoice.taxAmount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>الضريبة ({invoice.taxRate}%)</Text>
                <Text style={s.totalValue}>{fmtAmount(invoice.taxAmount)}</Text>
              </View>
            )}

            <View style={s.grandRow}>
              <Text style={s.grandLabel}>الإجمالي</Text>
              <Text style={s.grandValue}>{fmtAmount(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* ═══ NOTES ═══ */}
        {invoice.notes ? (
          <View style={s.notesBox}>
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
