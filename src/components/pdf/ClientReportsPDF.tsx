// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './pdfFonts';
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
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: C.primary },
  logo: { width: 170, height: 85, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end', justifyContent: 'center' },
  companyName: { fontSize: 16, fontWeight: 'bold', color: C.secondary, textAlign: 'right', marginBottom: 2 },
  companyDetail: { fontSize: 11, color: C.light, textAlign: 'right', marginTop: 2 },
  
  reportTitleBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reportTitle: { fontSize: 20, fontWeight: 'bold', color: C.primary },
  reportSubtitle: { fontSize: 12, fontWeight: 'bold', color: C.muted },

  infoBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: C.lightBg, borderRadius: 4, borderRightWidth: 3, borderRightColor: C.primary },
  clientName: { fontSize: 13, fontWeight: 'bold', color: C.primary, textAlign: 'right' },
  clientSub: { fontSize: 8, color: C.muted, marginTop: 2, textAlign: 'right' },
  dateText: { fontSize: 8, color: C.light, textAlign: 'left' },

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

  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', color: C.primary,
    marginBottom: 5, marginTop: 12,
    paddingBottom: 5,
    borderBottomWidth: 1.5, borderBottomColor: C.border,
    textAlign: 'right',
  },

  tableHead: { flexDirection: 'row', backgroundColor: C.headerBg, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 3, marginBottom: 1 },
  th: { color: C.white, fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#f0efeb' },
  rowEven: { backgroundColor: C.rowAlt },
  totalRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 9, backgroundColor: '#f0ede7', borderTopWidth: 1.5, borderTopColor: C.primary, marginTop: 1, borderRadius: 2 },
  
  td: { fontSize: 8, color: C.text, textAlign: 'right' },
  tdBold: { fontSize: 8, fontWeight: 'bold', color: C.text, textAlign: 'right' },
  tdPos: { fontSize: 8, fontWeight: 'bold', color: C.success, textAlign: 'right' },
  tdNeg: { fontSize: 8, fontWeight: 'bold', color: C.danger, textAlign: 'right' },

  cNum: { width: '5%', textAlign: 'center' },
  
  cDesc2: { width: '30%', textAlign: 'right', paddingRight: 4 },
  cNote2: { width: '20%', textAlign: 'right', paddingRight: 4 },
  cCat: { width: '15%', textAlign: 'left' },
  cDate: { width: '15%', textAlign: 'left' },
  cAmt: { width: '15%', textAlign: 'left' },

  cPayNote: { width: '25%', textAlign: 'right' },
  cPayBy: { width: '15%', textAlign: 'right' },
  cMethod: { width: '20%', textAlign: 'left' },
  cPayAmt: { width: '20%', textAlign: 'left' },

  cParty: { width: '15%', textAlign: 'right' },
  cDebtDesc: { width: '20%', textAlign: 'right' },
  cMoneyCol: { width: '20%', textAlign: 'left' },

  cName: { width: '20%', textAlign: 'right' },
  cJob: { width: '15%', textAlign: 'right' },
  cStatus: { width: '10%', textAlign: 'left' },
  
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
const fmtNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmt = (n: number) => fmtNum(n) + ' د.ل';
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

const PDFHeader = () => (
  <View style={s.header}>
    <Image src={`${window.location.origin}/logo.jpeg`} style={s.logo} />
    <View style={s.headerRight}>
      <Text style={s.companyName}>{COMPANY_INFO.fullName}</Text>
      <Text style={s.companyDetail}>{COMPANY_INFO.address}</Text>
      <Text style={s.companyDetail}>{COMPANY_INFO.phone}</Text>
    </View>
  </View>
);

const TitleBar = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={s.reportTitleBox}>
    {subtitle ? <Text style={s.reportSubtitle}>{subtitle}</Text> : <Text></Text>}
    <Text style={s.reportTitle}>{title}</Text>
  </View>
)

const InfoBar = ({ client }: { client: Client }) => (
  <View style={s.infoBar}>
    <Text style={s.dateText}>{today()}</Text>
    <View>
      <Text style={s.clientName}>{client.name}</Text>
      <Text style={s.clientSub}>{client.phone}{client.address ? ` | ${client.address}` : ''}</Text>
    </View>
  </View>
);

const PDFFooter = () => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>{COMPANY_INFO.fullName} | {COMPANY_INFO.address} | {COMPANY_INFO.phone}</Text>
  </View>
);

// ═══════════════════════════════════════════════
// 1. EXPENSES PDF
// ═══════════════════════════════════════════════
interface ExpensesPDFProps { client: Client; expenses: Expense[]; total: number; }

export const ExpensesPDF: React.FC<ExpensesPDFProps> = ({ client, expenses, total }) => (
  <Document title={`مصروفات-${client.name}`} language="ar">
    <Page size="A4" style={s.page}>
      <PDFHeader />
      <TitleBar title="كشف المصروفات" subtitle={`عدد السجلات: ${expenses.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>اجمالي المصروفات</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(total)}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>عدد المصروفات</Text>
          <Text style={s.summaryValue}>{expenses.length}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
        <Text style={[s.th, s.cDesc2]}>الوصف</Text>
        <Text style={[s.th, s.cNote2]}>الملاحظات</Text>
        <Text style={[s.th, s.cDate]}>التاريخ</Text>
        <Text style={[s.th, s.cCat]}>التصنيف</Text>
        <Text style={[s.th, s.cAmt, { textAlign: 'left' }]}>المبلغ</Text>
      </View>
      {expenses.map((e, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
          <Text style={[s.tdBold, s.cDesc2]}>{e.description}</Text>
          <Text style={[s.td, s.cNote2]}>{e.notes || '-'}</Text>
          <Text style={[s.td, s.cDate]}>{fmtDate(e.date)}</Text>
          <Text style={[s.td, s.cCat]}>{getCatLabel(e.category)}</Text>
          <Text style={[s.tdBold, s.cAmt, { textAlign: 'left' }]}>{fmt(e.amount)}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>الاجمالي</Text>
        <Text style={[s.tdBold, s.cAmt, { textAlign: 'left' }]}>{fmt(total)}</Text>
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
      <PDFHeader />
      <TitleBar title="كشف المدفوعات" subtitle={`عدد الدفعات: ${payments.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>اجمالي المدفوعات</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(total)}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>عدد الدفعات</Text>
          <Text style={s.summaryValue}>{payments.length}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
        <Text style={[s.th, s.cPayNote]}>ملاحظات</Text>
        <Text style={[s.th, s.cPayBy]}>بواسطة</Text>
        <Text style={[s.th, s.cDate]}>التاريخ</Text>
        <Text style={[s.th, s.cMethod]}>طريقة الدفع</Text>
        <Text style={[s.th, s.cPayAmt, { textAlign: 'left' }]}>المبلغ</Text>
      </View>
      {payments.map((p, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
          <Text style={[s.td, s.cPayNote]}>{p.notes || '-'}</Text>
          <Text style={[s.td, s.cPayBy]}>{p.createdBy || '-'}</Text>
          <Text style={[s.td, s.cDate]}>{fmtDate(p.paymentDate)}</Text>
          <Text style={[s.td, s.cMethod]}>{getPayLabel(p.paymentMethod)}</Text>
          <Text style={[s.tdBold, s.cPayAmt, { textAlign: 'left', color: C.success }]}>{fmt(p.amount)}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>الاجمالي</Text>
        <Text style={[s.tdBold, s.cPayAmt, { textAlign: 'left' }]}>{fmt(total)}</Text>
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
      <PDFHeader />
      <TitleBar title="كشف العمال والمقاولين" subtitle={`مجموع العمال: ${workers.length}`} />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>المتبقي لهم</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(totalDue)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>المدفوع مسبقاً</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(totalPaid)}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>إجمالي الإتفاقيات</Text>
          <Text style={s.summaryValue}>{fmt(totalAgreed)}</Text>
        </View>
      </View>

      <View style={s.tableHead}>
        <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
        <Text style={[s.th, s.cName]}>اسم العامل</Text>
        <Text style={[s.th, s.cJob]}>طبيعة العمل</Text>
        <Text style={[s.th, s.cMoneyCol, { textAlign: 'left' }]}>الإتفاق</Text>
        <Text style={[s.th, s.cMoneyCol, { textAlign: 'left' }]}>المدفوع</Text>
        <Text style={[s.th, s.cMoneyCol, { textAlign: 'left' }]}>المتبقي</Text>
        <Text style={[s.th, s.cStatus]}>الحالة</Text>
      </View>
      {workers.map((w, i) => (
        <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
          <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
          <Text style={[s.tdBold, s.cName]}>{w.name}</Text>
          <Text style={[s.td, s.cJob]}>{w.jobType || 'تم التعيين'}</Text>
          <Text style={[s.tdBold, s.cMoneyCol, { textAlign: 'left' }]}>{fmt(w.totalAmount)}</Text>
          <Text style={[s.tdPos, s.cMoneyCol, { textAlign: 'left' }]}>{fmt(w.paidAmount)}</Text>
          <Text style={[s.tdNeg, s.cMoneyCol, { textAlign: 'left' }]}>{fmt(w.remainingAmount)}</Text>
          <Text style={[s.td, s.cStatus]}>{w.status === 'completed' ? 'تصفية' : 'مستمر'}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>اجمالي العمال</Text>
        <Text style={[s.tdBold, s.cMoneyCol, { textAlign: 'left' }]}>{fmt(totalAgreed)}</Text>
        <Text style={[s.tdBold, s.cMoneyCol, { textAlign: 'left', color: C.success }]}>{fmt(totalPaid)}</Text>
        <Text style={[s.tdBold, s.cMoneyCol, { textAlign: 'left', color: C.danger }]}>{fmt(totalDue)}</Text>
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
      <PDFHeader />
      <TitleBar title="التقرير الشامل" subtitle="ملخص حساب العميل" />
      <InfoBar client={client} />

      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: summary.remaining >= 0 ? C.success : C.danger }]}>
          <Text style={s.summaryLabel}>المتبقي</Text>
          <Text style={[s.summaryValue, { color: summary.remaining >= 0 ? C.success : C.danger }]}>{fmt(summary.remaining)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.danger }]}>
          <Text style={s.summaryLabel}>مصروفات + ديون</Text>
          <Text style={[s.summaryValue, { color: C.danger }]}>{fmt(summary.totalObligations)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.warning }]}>
          <Text style={s.summaryLabel}>الربح ({summary.profitPercentage}%)</Text>
          <Text style={[s.summaryValue, { color: C.warning }]}>{fmt(summary.profit)}</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: C.success }]}>
          <Text style={s.summaryLabel}>إجمالي المدفوعات</Text>
          <Text style={[s.summaryValue, { color: C.success }]}>{fmt(summary.totalPaid)}</Text>
        </View>
      </View>

      {expenses.length > 0 && (
        <View wrap={false} style={{ marginBottom: 10 }}>
          <Text style={s.sectionTitle}>المصروفات ({expenses.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
            <Text style={[s.th, s.cDesc2]}>الوصف</Text>
            <Text style={[s.th, s.cNote2]}>الملاحظات</Text>
            <Text style={[s.th, s.cDate]}>التاريخ</Text>
            <Text style={[s.th, s.cCat]}>التصنيف</Text>
            <Text style={[s.th, s.cAmt, { textAlign: 'left' }]}>المبلغ</Text>
          </View>
          {expenses.map((e, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cDesc2]}>{e.description}</Text>
              <Text style={[s.td, s.cNote2]}>{e.notes || '-'}</Text>
              <Text style={[s.td, s.cDate]}>{fmtDate(e.date)}</Text>
              <Text style={[s.td, s.cCat]}>{getCatLabel(e.category)}</Text>
              <Text style={[s.tdBold, s.cAmt, { textAlign: 'left', color: C.danger }]}>{fmt(e.amount)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>اجمالي المصروفات</Text>
            <Text style={[s.tdBold, s.cAmt, { textAlign: 'left' }]}>{fmt(summary.totalExpenses)}</Text>
          </View>
        </View>
      )}

      {payments.length > 0 && (
        <View wrap={false} style={{ marginBottom: 10 }}>
          <Text style={s.sectionTitle}>المدفوعات ({payments.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
            <Text style={[s.th, s.cPayNote]}>ملاحظات</Text>
            <Text style={[s.th, s.cPayBy]}>بواسطة</Text>
            <Text style={[s.th, s.cDate]}>التاريخ</Text>
            <Text style={[s.th, s.cMethod]}>طريقة الدفع</Text>
            <Text style={[s.th, s.cPayAmt, { textAlign: 'left' }]}>المبلغ</Text>
          </View>
          {payments.map((p, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
              <Text style={[s.td, s.cPayNote]}>{p.notes || '-'}</Text>
              <Text style={[s.td, s.cPayBy]}>{p.createdBy || '-'}</Text>
              <Text style={[s.td, s.cDate]}>{fmtDate(p.paymentDate)}</Text>
              <Text style={[s.td, s.cMethod]}>{getPayLabel(p.paymentMethod)}</Text>
              <Text style={[s.tdBold, s.cPayAmt, { textAlign: 'left', color: C.success }]}>{fmt(p.amount)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>اجمالي المدفوعات</Text>
            <Text style={[s.tdBold, s.cPayAmt, { textAlign: 'left' }]}>{fmt(summary.totalPaid)}</Text>
          </View>
        </View>
      )}

      {debts.length > 0 && (
        <View wrap={false} style={{ marginBottom: 10 }}>
          <Text style={s.sectionTitle}>الديون ({debts.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
            <Text style={[s.th, s.cParty]}>الطرف</Text>
            <Text style={[s.th, s.cDebtDesc]}>الوصف</Text>
            <Text style={[s.th, s.cMoneyCol]}>المبلغ</Text>
            <Text style={[s.th, s.cMoneyCol]}>مدفوع</Text>
            <Text style={[s.th, s.cMoneyCol]}>متبقي</Text>
          </View>
          {debts.map((d, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cParty]}>{d.partyName}</Text>
              <Text style={[s.td, s.cDebtDesc]}>{d.description}</Text>
              <Text style={[s.tdBold, s.cMoneyCol]}>{fmt(d.amount)} د.ل</Text>
              <Text style={[s.tdPos, s.cMoneyCol]}>{fmt(d.paidAmount)} د.ل</Text>
              <Text style={[s.tdNeg, s.cMoneyCol]}>{fmt(d.remainingAmount)} د.ل</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>اجمالي الديون</Text>
            <Text style={[s.tdBold, s.cMoneyCol]}>{fmt(summary.totalDebts)} د.ل</Text>
            <Text style={[s.td, s.cMoneyCol]}></Text>
            <Text style={[s.td, s.cMoneyCol]}></Text>
          </View>
        </View>
      )}

      {workers.length > 0 && (
        <View wrap={false} style={{ marginBottom: 10 }}>
          <Text style={s.sectionTitle}>العمال والمقاولين ({workers.length})</Text>
          <View style={s.tableHead}>
            <Text style={[s.th, s.cNum, { textAlign: 'center' }]}>#</Text>
            <Text style={[s.th, s.cName]}>اسم العامل</Text>
            <Text style={[s.th, s.cJob]}>طبيعة العمل</Text>
            <Text style={[s.th, s.cMoneyCol]}>الإتفاق</Text>
            <Text style={[s.th, s.cMoneyCol]}>المدفوع</Text>
            <Text style={[s.th, s.cMoneyCol]}>المتبقي</Text>
            <Text style={[s.th, s.cStatus]}>الحالة</Text>
          </View>
          {workers.map((w, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 && s.rowEven]}>
              <Text style={[s.td, s.cNum, { textAlign: 'center' }]}>{i + 1}</Text>
              <Text style={[s.tdBold, s.cName]}>{w.name}</Text>
              <Text style={[s.td, s.cJob]}>{w.jobType || 'تم التعيين'}</Text>
              <Text style={[s.tdBold, s.cMoneyCol]}>{fmt(w.totalAmount)} د.ل</Text>
              <Text style={[s.tdPos, s.cMoneyCol]}>{fmt(w.paidAmount)} د.ل</Text>
              <Text style={[s.tdNeg, s.cMoneyCol]}>{fmt(w.remainingAmount)} د.ل</Text>
              <Text style={[s.td, s.cStatus]}>{w.status === 'completed' ? 'تصفية' : 'مستمر'}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.tdBold, { flex: 1, textAlign: 'right' }]}>اجمالي العمال</Text>
            <Text style={[s.tdBold, s.cMoneyCol]}>{fmt(summary.totalWorkersAgreed)} د.ل</Text>
            <Text style={[s.tdBold, s.cMoneyCol, { color: C.success }]}>{fmt(summary.totalWorkersPaid)} د.ل</Text>
            <Text style={[s.tdBold, s.cMoneyCol, { color: C.danger }]}>{fmt(summary.totalWorkersDue)} د.ل</Text>
            <Text style={[s.td, s.cStatus]}></Text>
          </View>
        </View>
      )}

      <PDFFooter />
    </Page>
  </Document>
);
