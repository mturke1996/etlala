// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './pdfFonts';
import { PDF_FONT_FAMILY } from './pdfFonts';
import type { Invoice, Client } from '../../types';
import { COMPANY_INFO } from '../../constants/companyInfo';

const C = {
  primary: '#4a5d4a',
  accent: '#8b7e6a',
  text: '#1a1f1a',
  muted: '#6b7f6b',
  light: '#888',
  white: '#fff',
  border: '#e8e5de',
  rowAlt: '#fafaf8',
  success: '#0d9668',
  danger: '#d64545',
  warning: '#c9a54e',
  headerBg: '#4a5d4a',
  lightBg: '#f8f7f4',
};

const s = StyleSheet.create({
  page: { fontFamily: PDF_FONT_FAMILY, fontSize: 10, color: C.text, backgroundColor: C.white, paddingVertical: 32, paddingHorizontal: 38 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  
  headerTitleBox: { textAlign: 'left', alignItems: 'flex-start' },
  invoiceLabel: { fontSize: 24, fontWeight: 'bold', color: '#e0dcd4', letterSpacing: 1, marginBottom: 2 },
  invoiceNum: { fontSize: 11, fontWeight: 'bold', color: C.primary },
  
  headerCompanyBox: { flexDirection: 'row', alignItems: 'center' },
  companyTextBox: { justifyContent: 'center', alignItems: 'flex-end', marginRight: 12 },
  companyName: { fontSize: 13, fontWeight: 'bold', color: C.primary, marginBottom: 2 },
  companySub: { fontSize: 9, fontWeight: 'bold', color: C.accent },
  logo: { width: 50, height: 50, objectFit: 'contain', borderRadius: 8 },
  
  contactLine: { borderBottomWidth: 2, borderBottomColor: C.primary, paddingBottom: 6, marginBottom: 24, alignItems: 'flex-end' },
  contactText: { fontSize: 9, fontWeight: 'bold', color: C.muted },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  
  datesBox: { width: '40%' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { fontSize: 9, color: '#999' },
  dateValue: { fontSize: 9, fontWeight: 'bold', color: C.text },

  clientBox: { paddingVertical: 4, paddingRight: 10, borderRightWidth: 2, borderRightColor: C.primary, width: '50%', alignItems: 'flex-end' },
  sectionLabel: { fontSize: 7.5, fontWeight: 'bold', color: C.accent, marginBottom: 2 },
  clientName: { fontSize: 13, fontWeight: 'bold', color: '#2d3a2d', marginBottom: 2 },
  clientSub: { fontSize: 9, color: '#888', marginTop: 2 },
  
  tableHead: { flexDirection: 'row', backgroundColor: C.headerBg, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 3, marginBottom: 2 },
  th: { color: C.white, fontSize: 9.5, fontWeight: 'bold', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0efeb' },
  rowEven: { backgroundColor: C.rowAlt },
  
  cDesc: { flex: 1, textAlign: 'right', paddingRight: 4 },
  cNum: { width: 50, textAlign: 'center' },
  cPrice: { width: 70, textAlign: 'center' },
  cTotal: { width: 80, textAlign: 'left', paddingLeft: 4 },
  
  td: { fontSize: 10, color: C.text },
  tdBold: { fontSize: 10, fontWeight: 'bold', color: C.text },
  
  totals: { alignItems: 'flex-start', marginTop: 14 },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  totalLabel: { fontSize: 10, color: '#666', textAlign: 'right' },
  totalVal: { fontSize: 10, fontWeight: 'bold', color: C.text, textAlign: 'left' },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.primary, marginTop: 5 },
  grandLabel: { fontSize: 13, fontWeight: 'bold', color: C.primary, textAlign: 'right' },
  grandVal: { fontSize: 14, fontWeight: 'bold', color: C.primary, textAlign: 'left' },
  
  notesBox: { padding: 12, backgroundColor: '#fffcf5', borderRightWidth: 3, borderRightColor: '#c8c0b0', borderRadius: 3, marginTop: 24, alignItems: 'flex-end' },
  notesLabel: { fontSize: 9, fontWeight: 'bold', color: C.accent, marginBottom: 4 },
  notesText: { fontSize: 10, color: '#555', textAlign: 'right' },
  
  footer: { position: 'absolute', bottom: 16, left: 38, right: 38, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  footerTitle: { fontSize: 10, fontWeight: 'bold', color: C.primary, marginBottom: 3 },
  footerText: { fontSize: 8, color: '#888' },
});

const fmtDate = (d: string) => {
  try { const dt = new Date(d); return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`; }
  catch { return d; }
};
const fmtNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmt = (n: number) => fmtNum(n);
const fmtCurrency = (n: number) => fmtNum(n) + ' د.ل';

interface Props { invoice: Invoice; client: Client; }

export const InvoicePDF: React.FC<Props> = ({ invoice, client }) => {
  const logoUrl = `${window.location.origin}/logo-icon.jpg`;

  return (
    <Document title={`فاتورة`} author={COMPANY_INFO.fullName} language="ar">
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <View style={s.headerTitleBox}>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceNum}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={s.headerCompanyBox}>
            <View style={s.companyTextBox}>
              <Text style={s.companyName}>{COMPANY_INFO.fullName}</Text>
              <Text style={s.companySub}>Architecture & Engineering</Text>
            </View>
            <Image src={logoUrl} style={s.logo} />
          </View>
        </View>

        {/* CONTACT LINE */}
        <View style={s.contactLine}>
          <Text style={s.contactText}>{COMPANY_INFO.address} | {COMPANY_INFO.phone}</Text>
        </View>

        {/* CLIENT + DATES */}
        <View style={s.infoRow}>
          <View style={s.datesBox}>
            <View style={s.dateRow}>
              <Text style={s.dateValue}>{fmtDate(invoice.issueDate)}</Text>
              <Text style={s.dateLabel}>الإصدار</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateValue}>{fmtDate(invoice.dueDate)}</Text>
              <Text style={s.dateLabel}>الاستحقاق</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={[s.dateValue, { color: invoice.status === 'paid' ? C.success : C.warning }]}>
                {invoice.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
              </Text>
              <Text style={s.dateLabel}>الحالة</Text>
            </View>
          </View>

          <View style={s.clientBox}>
            <Text style={s.sectionLabel}>فاتورة إلى</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.address && <Text style={s.clientSub}>{client.address}</Text>}
            {client.phone && <Text style={s.clientSub}>{client.phone}</Text>}
          </View>
        </View>

        {/* TABLE */}
        <View style={s.tableHead}>
          <Text style={[s.th, s.cTotal, { textAlign: 'left' }]}>الإجمالي</Text>
          <Text style={[s.th, s.cPrice, { textAlign: 'center' }]}>السعر</Text>
          <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>الكمية</Text>
          <Text style={[s.th, s.cDesc, { textAlign: 'right' }]}>الوصف</Text>
        </View>
        
        {invoice.items.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
            <Text style={[s.tdBold, s.cTotal, { textAlign: 'left' }]}>{fmt(item.total)}</Text>
            <Text style={[s.td, s.cPrice, { textAlign: 'center' }]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[s.tdBold, s.cDesc, { textAlign: 'right' }]}>{item.description}</Text>
          </View>
        ))}

        {/* TOTALS */}
        <View style={s.totals}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalVal}>{fmtCurrency(invoice.subtotal)}</Text>
              <Text style={s.totalLabel}>المجموع الفرعي</Text>
            </View>
            {invoice.taxAmount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalVal}>{fmtCurrency(invoice.taxAmount)}</Text>
                <Text style={s.totalLabel}>الضريبة ({invoice.taxRate}%)</Text>
              </View>
            )}
            <View style={s.grandRow}>
              <Text style={s.grandVal}>{fmtCurrency(invoice.total)}</Text>
              <Text style={s.grandLabel}>الإجمالي</Text>
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
          <Text style={s.footerTitle}>{COMPANY_INFO.fullName}</Text>
          <Text style={s.footerText}>{COMPANY_INFO.address} | {COMPANY_INFO.phone}</Text>
        </View>
      </Page>
    </Document>
  );
};
