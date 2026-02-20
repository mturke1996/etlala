// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './pdfFonts';
import { PDF_FONT_FAMILY } from './pdfFonts';
import type { Invoice, Client } from '../../types';
import { COMPANY_INFO } from '../../constants/companyInfo';

const C = {
  primary: '#364036', accent: '#8b7e6a', text: '#1a1f1a',
  muted: '#6b7f6b', light: '#888', white: '#fff',
  border: '#e8e5de', rowAlt: '#fafaf8',
  success: '#0d9668', danger: '#d64545', warning: '#c9a54e',
  headerBg: '#364036', lightBg: '#f8f7f4',
};

const s = StyleSheet.create({
  page: { fontFamily: PDF_FONT_FAMILY, fontSize: 10, color: C.text, backgroundColor: C.white, paddingVertical: 32, paddingHorizontal: 38 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: C.primary },
  logo: { width: 170, height: 85, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end', justifyContent: 'center' },
  companyName: { fontSize: 16, fontWeight: 'bold', color: C.primary, textAlign: 'right', marginBottom: 2 },
  companyDetail: { fontSize: 11, color: C.light, textAlign: 'right', marginTop: 2 },
  
  invoiceMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  invoiceLabel: { fontSize: 20, fontWeight: 'bold', color: '#cac6be' },
  invoiceNum: { fontSize: 14, fontWeight: 'bold', color: C.primary },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 16 },
  clientBox: { flex: 1, padding: 10, backgroundColor: C.lightBg, borderRightWidth: 3, borderRightColor: C.primary, borderRadius: 3, alignItems: 'flex-end' },
  sectionLabel: { fontSize: 8, fontWeight: 'bold', color: C.accent, marginBottom: 5, textAlign: 'right' },
  clientName: { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 3, textAlign: 'right' },
  clientSub: { fontSize: 9, color: C.light, textAlign: 'right' },
  
  datesBox: { width: 160 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0efeb' },
  dateLabel: { fontSize: 9, color: C.light, textAlign: 'right' },
  dateValue: { fontSize: 9.5, fontWeight: 'bold', color: C.text, textAlign: 'left' },
  statusBadge: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3 },
  
  tableHead: { flexDirection: 'row', backgroundColor: C.headerBg, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 3, marginBottom: 1 },
  th: { color: C.white, fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0efeb' },
  rowEven: { backgroundColor: C.rowAlt },
  
  // Exact Percentages
  cTotal: { width: '20%', textAlign: 'left', paddingLeft: 4 },
  cPrice: { width: '20%', textAlign: 'center' },
  cNum: { width: '15%', textAlign: 'center' },
  cDesc: { width: '45%', textAlign: 'right', paddingRight: 4 },
  
  td: { fontSize: 9.5, color: C.text },
  tdBold: { fontSize: 9.5, fontWeight: 'bold', color: C.text },
  
  totals: { alignItems: 'flex-start', marginTop: 14 },
  totalsBox: { width: 200 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f0efeb' },
  totalLabel: { fontSize: 9, color: C.muted, textAlign: 'right' },
  totalVal: { fontSize: 10, fontWeight: 'bold', color: C.text, textAlign: 'left' },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 2, borderTopColor: C.primary, marginTop: 5 },
  grandLabel: { fontSize: 14, fontWeight: 'bold', color: C.primary, textAlign: 'right' },
  grandVal: { fontSize: 15, fontWeight: 'bold', color: C.primary, textAlign: 'left' },
  
  notesBox: { padding: 10, backgroundColor: '#fffcf5', borderRightWidth: 3, borderRightColor: C.border, borderRadius: 3, marginTop: 14, alignItems: 'flex-end' },
  notesLabel: { fontSize: 8, fontWeight: 'bold', color: C.accent, marginBottom: 3, textAlign: 'right' },
  notesText: { fontSize: 9, color: '#555', textAlign: 'right' },
  
  footer: { position: 'absolute', bottom: 16, left: 38, right: 38, textAlign: 'center', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6 },
  footerText: { fontSize: 8, color: C.light },
});

const fmtDate = (d: string) => {
  try { const dt = new Date(d); return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`; }
  catch { return d; }
};
const fmt = (n: number) => {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const fmtCurrency = (n: number) => {
  return fmt(n) + ' د.ل';
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid:           { label: 'مدفوعة',  color: '#0d9668', bg: '#e6f9f1' },
  sent:           { label: 'مرسلة',   color: '#2563eb', bg: '#eff6ff' },
  draft:          { label: 'مسودة',   color: '#6b7280', bg: '#f3f4f6' },
  overdue:        { label: 'متأخرة',  color: '#dc2626', bg: '#fef2f2' },
  partially_paid: { label: 'جزئية',   color: '#d97706', bg: '#fffbeb' },
  cancelled:      { label: 'ملغاة',   color: '#dc2626', bg: '#fef2f2' },
};

interface Props { invoice: Invoice; client: Client; }

export const InvoicePDF: React.FC<Props> = ({ invoice, client }) => {
  const st = STATUS[invoice.status] || { label: invoice.status, color: '#6b7280', bg: '#f3f4f6' };
  const logoUrl = `${window.location.origin}/logo.jpeg`;

  return (
    <Document title={`فاتورة`} author={COMPANY_INFO.fullName} language="ar">
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <Image src={logoUrl} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.companyName}>{COMPANY_INFO.fullName}</Text>
            <Text style={s.companyDetail}>{COMPANY_INFO.address}</Text>
            <Text style={s.companyDetail}>{COMPANY_INFO.phone}</Text>
          </View>
        </View>

        <View style={s.invoiceMeta}>
          <Text style={s.invoiceNum}>#{invoice.invoiceNumber}</Text>
          <Text style={s.invoiceLabel}>فـاتـورة INVOICE</Text>
        </View>

        {/* CLIENT + DATES */}
        <View style={s.infoRow}>
          <View style={s.datesBox}>
            <View style={s.dateRow}>
              <Text style={s.dateValue}>{fmtDate(invoice.issueDate)}</Text>
              <Text style={s.dateLabel}>تاريخ الاصدار</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateValue}>{fmtDate(invoice.dueDate)}</Text>
              <Text style={s.dateLabel}>الاستحقاق</Text>
            </View>
            <View style={[s.dateRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.statusBadge, { color: st.color, backgroundColor: st.bg }]}>{st.label}</Text>
              <Text style={s.dateLabel}>الحالة</Text>
            </View>
          </View>

          <View style={s.clientBox}>
            <Text style={s.sectionLabel}>فاتورة الى</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
            {client.address ? <Text style={s.clientSub}>{client.address}</Text> : null}
          </View>
        </View>

        {/* TABLE */}
        {/* Visual LTR rendered with JSX items: Left-most element first, Right-most last */}
        <View style={s.tableHead}>
          <Text style={[s.th, s.cTotal, { textAlign: 'left' }]}>الاجمالي (د.ل)</Text>
          <Text style={[s.th, s.cPrice]}>السعر</Text>
          <Text style={[s.th, s.cNum]}>الكمية</Text>
          <Text style={[s.th, s.cDesc]}>الوصف</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <Text style={[s.tdBold, s.cTotal, { textAlign: 'left' }]}>{fmt(item.total)}</Text>
            <Text style={[s.td, s.cPrice]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.td, s.cNum]}>{item.quantity}</Text>
            <Text style={[s.tdBold, s.cDesc]}>{item.description}</Text>
          </View>
        ))}

        {/* TOTALS */}
        <View style={s.totals}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalVal}>{fmtCurrency(invoice.subtotal)}</Text>
              <Text style={s.totalLabel}>المجموع</Text>
            </View>
            {invoice.taxAmount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalVal}>{fmtCurrency(invoice.taxAmount)}</Text>
                <Text style={s.totalLabel}>الضريبة</Text>
              </View>
            )}
            <View style={s.grandRow}>
              <Text style={s.grandVal}>{fmtCurrency(invoice.total)}</Text>
              <Text style={s.grandLabel}>الاجمالي</Text>
            </View>
          </View>
        </View>

        {/* NOTES */}
        {invoice.notes ? (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>ملاحظات</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{COMPANY_INFO.fullName} - {COMPANY_INFO.phone}</Text>
        </View>
      </Page>
    </Document>
  );
};
