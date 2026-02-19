// @ts-nocheck
/**
 * Client Reports PDF Templates
 * All text written directly in Arabic (not Unicode escapes)
 * Expenses, Payments, Workers, Full Report
 * Full Arabic font support via Cairo
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './pdfFonts'; // registers Cairo Arabic font
import { PDF_FONT_FAMILY } from './pdfFonts';
import type { Client, Expense, Payment, StandaloneDebt, Worker } from '../../types';
import { COMPANY_INFO } from '../../constants/companyInfo';
import { expenseCategories } from '../../utils/formatters';

const C = {
  primary: '#364036',
  secondary: '#4a5d4a',
  accent: '#c8c0b0',
  accentDark: '#8b7e6a',
  text: '#1a1f1a',
  muted: '#6b7f6b',
  light: '#888888',
  white: '#ffffff',
  border: '#e8e5de',
  rowAlt: '#fafaf8',
  success: '#0d9668',
  warning: '#c9a54e',
  danger: '#d64545',
  headerBg: '#364036',
  lightBg: '#f8f7f4',
};

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9,
    color: C.text,
    backgroundColor: C.white,
    paddingTop: 28,
    paddingBottom: 52,
    paddingHorizontal: 32,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: C.primary,
  },
  logo: { width: 155, height: 65, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end' },
  reportTitle: { fontSize: 20, fontWeight: 'bold', color: C.primary },
  reportSubtitle: { fontSize: 8, color: C.muted, marginTop: 3 },
  // Company info
  companyBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  companyName: { fontSize: 9, fontWeight: 'bold', color: C.secondary, textAlign: 'right' },
  companyDetail: { fontSize: 7.5, color: C.light, textAlign: 'right', marginTop: 1 },
  // Client info bar
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.lightBg,
    borderRadius: 4,
    borderRightWidth: 3,
    borderRightColor: C.primary,
  },
  clientName: { fontSize: 13, fontWeight: 'bold', color: C.primary },
  clientSub: { fontSize: 8, color: C.muted, marginTop: 2 },
  dateText: { fontSize: 8, color: C.light },
  // Summary cards
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: {
    flex: 1, padding: 9,
    backgroundColor: C.lightBg,
    borderRadius: 4,
    borderTopWidth: 2.5,
    borderTopColor: C.primary,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 7, color: C.muted, marginBottom: 3 },
  summaryValue: { fontSize: 13, fontWeight: 'bold', color: C.primary },
  // Section
  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', color: C.primary,
    marginBottom: 5, marginTop: 12,
    paddingBottom: 5,
    borderBottomWidth: 1.5, borderBottomColor: C.border,
  },
  // Table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.headerBg,
    paddingVertical: 7, paddingHorizontal: 9,
    borderRadius: 3, marginBottom: 1,
  },
  th: { color: C.white, fontSize: 8, fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7, paddingHorizontal: 9,
    borderBottomWidth: 1, borderBottomColor: '#f0efeb',
  },
  rowEven: { backgroundColor: C.rowAlt },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 8, paddingHorizontal: 9,
    backgroundColor: '#f0ede7',
    borderTopWidth: 1.5, borderTopColor: C.primary,
    marginTop: 1, borderRadius: 2,
  },
  td: { fontSize: 8, color: C.text },
  tdBold: { fontSize: 8, fontWeight: 'bold', color: C.text },
  tdPos: { fontSize: 8, fontWeight: 'bold', color: C.success },
  tdNeg: { fontSize: 8, fontWeight: 'bold', color: C.danger },
  // Columns
  cNum: { width: 22 },
  cDesc: { flex: 1 },
  cCat: { width: 85 },
  cDate: { width: 62 },
  cInv: { width: 55 },
  cAmt: { width: 75, textAlign: 'left' },
  cMethod: { width: 75 },
  cNote: { width: 80 },
  cBy: { width: 65 },
  cName: { width: 90 },
  cJob: { width: 80 },
  cMoney: { width: 65, textAlign: 'left' },
  cStatus: { width: 50 },
  cParty: { width: 76 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 16, left: 32, right: 32,
    textAlign: 'center',
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 7,
  },
  footerText: { fontSize: 7, color: C.light },
});

// Helpers
// IMPORTANT: Do NOT use toLocaleString('ar-LY') - it creates Arabic numerals
// which mixed with Arabic text causes BiDi crash in @react-pdf/renderer v4
const fmt = (n: number) => String(Math.round(n)) + ' د.ل';

const fmtDate = (d: string) => {
  try {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  } catch { return d; }
};
const today = () => fmtDate(new Date().toISOString());
const getCatLabel = (cat: string) => (expenseCategories as any)[cat] || cat;
const getPayLabel = (m: string) => ({
  cash: 'نقدا',
  check: 'شيك',
  bank_transfer: 'تحويل بنكي',
  credit_card: 'بطاقة ائتمان',
  mobile_payment: 'دفع الكتروني',
}[m] || m);

// Shared Components
const PDFHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <>
    <View style={s.header}>
      <Image src={`${window.location.origin}/logo.jpeg`} style={s.logo} />
      <View style={s.headerRight}>
        <Text style={s.reportTitle}>{title}</Text>
        {subtitle ? <Text style={s.reportSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    <View style={s.companyBar}>
      <View>
        <Text style={s.companyName}>{COMPANY_INFO.fullName}</Text>
        <Text style={s.companyDetail}>{COMPANY_INFO.address} | {COMPANY_INFO.phone}</Text>
      </View>
    </View>
  </>
);

const InfoBar = ({ client }: { client: Client }) => (
  <View style={s.infoBar}>
    <View>
      <Text style={s.clientName}>{client.name}</Text>
      <Text style={s.clientSub}>{client.phone}{client.address ? ` | ${client.address}` : ''}</Text>
    </View>
    <Text style={s.dateText}>{today()}</Text>
  </View>
);

const PDFFooter = () => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>{COMPANY_INFO.fullName} | {COMPANY_INFO.address} | {COMPANY_INFO.phone}</Text>
    <Text style={s.footerText}>تم انشاء هذا التقرير بواسطة نظام اطلالة | {today()}</Text>
  </View>
);

// ═══════════════════════════════════════════════
// 1. EXPENSES PDF
// ═══════════════════════════════════════════════
interface ExpensesPDFProps { client: Client; expenses: Expense[]; total: number; }

export const ExpensesPDF: React.FC<ExpensesPDFProps> = ({ client, expenses, total }) => (
  <Document title={`مصروفات-${client.name}`} language="ar">
    <Page size="A4" style={s.page}>
      <PDFHeader title="كشف المصروفات" subtitle={`عدد السجلات: ${expenses.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>عدد المصروفات</Text>
          <Text style={s.summaryValue}>{expenses.length}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>اجمالي المصروفات</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(total)}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum]}>#</Text>
        <Text style={[s.th, s.cDesc]}>الوصف</Text>
        <Text style={[s.th, s.cCat]}>التصنيف</Text>
        <Text style={[s.th, s.cDate]}>التاريخ</Text>
        <Text style={[s.th, s.cInv]}>رقم فاتورة</Text>
        <Text style={[s.th, s.cAmt]}>المبلغ</Text>
      </View>
      {expenses.map((e, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum]}>{i + 1}</Text>
          <Text style={[s.tdBold, s.cDesc]}>{e.description}</Text>
          <Text style={[s.td, s.cCat]}>{getCatLabel(e.category)}</Text>
          <Text style={[s.td, s.cDate]}>{fmtDate(e.date)}</Text>
          <Text style={[s.td, s.cInv]}>{e.invoiceNumber || '-'}</Text>
          <Text style={[s.tdBold, s.cAmt]}>{fmt(e.amount)}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1 }]}>الاجمالي</Text>
        <Text style={[s.tdBold, s.cAmt]}>{fmt(total)}</Text>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);

// ═══════════════════════════════════════════════
// 2. PAYMENTS PDF
// ═══════════════════════════════════════════════
interface PaymentsPDFProps { client: Client; payments: Payment[]; total: number; }

export const PaymentsPDF: React.FC<PaymentsPDFProps> = ({ client, payments, total }) => (
  <Document title={`مدفوعات-${client.name}`} language="ar">
    <Page size="A4" style={s.page}>
      <PDFHeader title="كشف المدفوعات" subtitle={`عدد الدفعات: ${payments.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>عدد الدفعات</Text>
          <Text style={s.summaryValue}>{payments.length}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>اجمالي المدفوعات</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(total)}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum]}>#</Text>
        <Text style={[s.th, s.cAmt]}>المبلغ</Text>
        <Text style={[s.th, s.cMethod]}>طريقة الدفع</Text>
        <Text style={[s.th, s.cDate]}>التاريخ</Text>
        <Text style={[s.th, s.cBy]}>بواسطة</Text>
        <Text style={[s.th, s.cNote]}>ملاحظات</Text>
      </View>
      {payments.map((p, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum]}>{i + 1}</Text>
          <Text style={[s.tdBold, s.cAmt]}>{fmt(p.amount)}</Text>
          <Text style={[s.td, s.cMethod]}>{getPayLabel(p.paymentMethod)}</Text>
          <Text style={[s.td, s.cDate]}>{fmtDate(p.paymentDate)}</Text>
          <Text style={[s.td, s.cBy]}>{p.createdBy || '-'}</Text>
          <Text style={[s.td, s.cNote]}>{p.notes || '-'}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1 }]}>الاجمالي</Text>
        <Text style={[s.tdBold, s.cAmt]}>{fmt(total)}</Text>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);

// ═══════════════════════════════════════════════
// 3. WORKERS PDF
// ═══════════════════════════════════════════════
interface WorkersPDFProps {
  client: Client; workers: Worker[];
  totalAgreed: number; totalPaid: number; totalDue: number;
}

export const WorkersPDF: React.FC<WorkersPDFProps> = ({ client, workers, totalAgreed, totalPaid, totalDue }) => (
  <Document title={`عمال-${client.name}`} language="ar">
    <Page size="A4" style={s.page}>
      <PDFHeader title="كشف العمال" subtitle={`عدد العمال: ${workers.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>اجمالي الاتفاق</Text>
          <Text style={s.summaryValue}>{fmt(totalAgreed)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>تم دفعه</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(totalPaid)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>المتبقي</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(totalDue)}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum]}>#</Text>
        <Text style={[s.th, s.cName]}>الاسم</Text>
        <Text style={[s.th, s.cJob]}>نوع العمل</Text>
        <Text style={[s.th, s.cMoney]}>الاتفاق</Text>
        <Text style={[s.th, s.cMoney]}>مدفوع</Text>
        <Text style={[s.th, s.cMoney]}>متبقي</Text>
        <Text style={[s.th, s.cStatus]}>الحالة</Text>
      </View>
      {workers.map((w, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum]}>{i + 1}</Text>
          <Text style={[s.tdBold, s.cName]}>{w.name}</Text>
          <Text style={[s.td, s.cJob]}>{w.jobType || '-'}</Text>
          <Text style={[s.tdBold, s.cMoney]}>{fmt(w.totalAmount)}</Text>
          <Text style={[s.tdPos, s.cMoney]}>{fmt(w.paidAmount)}</Text>
          <Text style={[s.tdNeg, s.cMoney]}>{fmt(w.remainingAmount)}</Text>
          <Text style={[s.td, s.cStatus]}>{w.status === 'completed' ? 'مكتمل' : 'نشط'}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1 }]}>الاجمالي</Text>
        <Text style={[s.tdBold, s.cMoney]}>{fmt(totalAgreed)}</Text>
        <Text style={[s.tdBold, s.cMoney]}>{fmt(totalPaid)}</Text>
        <Text style={[s.tdBold, s.cMoney]}>{fmt(totalDue)}</Text>
        <Text style={[s.td, s.cStatus]}></Text>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);

// ═══════════════════════════════════════════════
// 4. FULL REPORT PDF
// ═══════════════════════════════════════════════
interface FullReportPDFProps {
  client: Client;
  expenses: Expense[];
  payments: Payment[];
  debts: StandaloneDebt[];
  workers: Worker[];
  summary: {
    totalPaid: number; profit: number; profitPercentage: number;
    totalExpenses: number; totalDebts: number; totalObligations: number;
    remaining: number; totalWorkersAgreed: number; totalWorkersPaid: number; totalWorkersDue: number;
  };
}

export const FullReportPDF: React.FC<FullReportPDFProps> = ({
  client, expenses, payments, debts, workers, summary
}) => (
  <Document title={`تقرير-${client.name}`} language="ar">
    <Page size="A4" style={s.page}>
      <PDFHeader title="التقرير الشامل" subtitle="ملخص حساب العميل" />
      <InfoBar client={client} />

      {/* Summary Cards */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>اجمالي المدفوعات</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(summary.totalPaid)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.warning }]}>
          <Text style={s.summaryLabel}>الربح ({summary.profitPercentage}%)</Text>
          <Text style={[s.summaryValue, { color: C.warning }]}>{fmt(summary.profit)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>مصروفات + ديون</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(summary.totalObligations)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: summary.remaining >= 0 ? C.success : C.danger }]}>
          <Text style={s.summaryLabel}>المتبقي</Text>
          <Text style={[s.summaryValue, { color: summary.remaining >= 0 ? C.success : C.danger }]}>{fmt(summary.remaining)}</Text>
        </View>
      </View>

      {/* Expenses */}
      {expenses.length > 0 && (
        <>
          <Text style={s.sectionTitle}>المصروفات ({expenses.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cDesc]}>الوصف</Text>
            <Text style={[s.th, s.cCat]}>التصنيف</Text>
            <Text style={[s.th, s.cDate]}>التاريخ</Text>
            <Text style={[s.th, s.cAmt]}>المبلغ</Text>
          </View>
          {expenses.map((e, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cDesc]}>{e.description}</Text>
              <Text style={[s.td, s.cCat]}>{getCatLabel(e.category)}</Text>
              <Text style={[s.td, s.cDate]}>{fmtDate(e.date)}</Text>
              <Text style={[s.tdBold, s.cAmt]}>{fmt(e.amount)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1 }]}>اجمالي المصروفات</Text>
            <Text style={[s.tdBold, s.cAmt]}>{fmt(summary.totalExpenses)}</Text>
          </View>
        </>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <>
          <Text style={s.sectionTitle}>المدفوعات ({payments.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cAmt]}>المبلغ</Text>
            <Text style={[s.th, s.cMethod]}>طريقة الدفع</Text>
            <Text style={[s.th, s.cDate]}>التاريخ</Text>
            <Text style={[s.th, s.cNote]}>ملاحظات</Text>
          </View>
          {payments.map((p, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cAmt]}>{fmt(p.amount)}</Text>
              <Text style={[s.td, s.cMethod]}>{getPayLabel(p.paymentMethod)}</Text>
              <Text style={[s.td, s.cDate]}>{fmtDate(p.paymentDate)}</Text>
              <Text style={[s.td, s.cNote]}>{p.notes || '-'}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1 }]}>اجمالي المدفوعات</Text>
            <Text style={[s.tdBold, s.cAmt]}>{fmt(summary.totalPaid)}</Text>
          </View>
        </>
      )}

      {/* Debts */}
      {debts.length > 0 && (
        <>
          <Text style={s.sectionTitle}>الديون ({debts.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cParty]}>الطرف</Text>
            <Text style={[s.th, s.cDesc]}>الوصف</Text>
            <Text style={[s.th, s.cMoney]}>المبلغ</Text>
            <Text style={[s.th, s.cMoney]}>مدفوع</Text>
            <Text style={[s.th, s.cMoney]}>متبقي</Text>
          </View>
          {debts.map((d, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cParty]}>{d.partyName}</Text>
              <Text style={[s.td, s.cDesc]}>{d.description}</Text>
              <Text style={[s.tdBold, s.cMoney]}>{fmt(d.amount)}</Text>
              <Text style={[s.tdPos, s.cMoney]}>{fmt(d.paidAmount)}</Text>
              <Text style={[s.tdNeg, s.cMoney]}>{fmt(d.remainingAmount)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1 }]}>اجمالي الديون</Text>
            <Text style={[s.tdBold, s.cMoney]}>{fmt(summary.totalDebts)}</Text>
            <Text style={[s.td, s.cMoney]}></Text>
            <Text style={[s.td, s.cMoney]}></Text>
          </View>
        </>
      )}

      {/* Workers */}
      {workers.length > 0 && (
        <>
          <Text style={s.sectionTitle}>العمال ({workers.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cName]}>الاسم</Text>
            <Text style={[s.th, s.cJob]}>نوع العمل</Text>
            <Text style={[s.th, s.cMoney]}>الاتفاق</Text>
            <Text style={[s.th, s.cMoney]}>مدفوع</Text>
            <Text style={[s.th, s.cMoney]}>متبقي</Text>
          </View>
          {workers.map((w, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cName]}>{w.name}</Text>
              <Text style={[s.td, s.cJob]}>{w.jobType || '-'}</Text>
              <Text style={[s.tdBold, s.cMoney]}>{fmt(w.totalAmount)}</Text>
              <Text style={[s.tdPos, s.cMoney]}>{fmt(w.paidAmount)}</Text>
              <Text style={[s.tdNeg, s.cMoney]}>{fmt(w.remainingAmount)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1 }]}>اجمالي العمال</Text>
            <Text style={[s.tdBold, s.cMoney]}>{fmt(summary.totalWorkersAgreed)}</Text>
            <Text style={[s.tdBold, s.cMoney]}>{fmt(summary.totalWorkersPaid)}</Text>
            <Text style={[s.tdBold, s.cMoney]}>{fmt(summary.totalWorkersDue)}</Text>
          </View>
        </>
      )}

      <PDFFooter />
    </Page>
  </Document>
);
