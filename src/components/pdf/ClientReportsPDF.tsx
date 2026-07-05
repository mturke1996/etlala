// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import './pdfFonts';
import type { Client, Expense, Payment, StandaloneDebt, Worker } from '../../types';
import { expenseCategories } from '../../utils/formatters';
import { formatExpenseNotesOnly, formatExpensePdfUnitPrice, expenseHasQuantityLine } from '../../utils/pdfFormatters';
import { ar, arDate } from './arabicPDF';
import { getPdfBrand } from './pdfBrand';
import { makePdfStyles, PdfBrandedReportHeader, PdfBrandedFooter, PdfSummaryStrip, INK } from './pdfKit';
import { PdfTable, PdfSectionTitle, type PdfColumn } from './PdfTable';

const today = () => arDate(new Date().toISOString());
const getCatLabel = (cat: string) => ar((expenseCategories as any)[cat] || cat);
const getPayLabel = (m: string) =>
  ar(({ cash: 'نقداً', check: 'شيك', bank_transfer: 'تحويل بنكي', credit_card: 'بطاقة ائتمان', mobile_payment: 'دفع إلكتروني' } as Record<string, string>)[m] || m);

const EXP_COLS: PdfColumn[] = [
  { key: 'desc', label: 'البيان', flex: 1.75, kind: 'text' },
  { key: 'cat', label: 'التصنيف', flex: 0.85, kind: 'text' },
  { key: 'date', label: 'التاريخ', flex: 0.7, kind: 'date' },
  { key: 'qty', label: 'الكمية', flex: 1, kind: 'qty' },
  { key: 'unitPrice', label: 'سعر الوحدة', flex: 1, kind: 'money' },
  { key: 'notes', label: 'ملاحظات', flex: 2, kind: 'multiline' },
  { key: 'amount', label: 'المبلغ', flex: 0.85, kind: 'money' },
];

const mapExpensePdfRow = (e: Expense) => ({
  desc: e.description,
  cat: getCatLabel(e.category),
  date: arDate(e.date),
  qty: expenseHasQuantityLine(e) ? { quantity: e.quantity!, unit: e.unit } : '—',
  unitPrice: formatExpensePdfUnitPrice(e),
  notes: formatExpenseNotesOnly(e.notes) || '—',
  amount: e.amount,
});

const avgAmount = (total: number, count: number) => (count > 0 ? total / count : 0);

const latestExpenseDate = (expenses: Expense[]) => {
  if (!expenses.length) return '—';
  const latest = expenses.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a));
  return arDate(latest.date);
};

const PAY_COLS: PdfColumn[] = [
  { key: 'notes', label: 'ملاحظات', flex: 2, kind: 'text' },
  { key: 'method', label: 'طريقة الدفع', flex: 1.1, kind: 'text' },
  { key: 'by', label: 'بواسطة', flex: 1, kind: 'text' },
  { key: 'date', label: 'التاريخ', flex: 1, kind: 'date' },
  { key: 'amount', label: 'المبلغ', flex: 1, kind: 'money' },
];

const DEBT_COLS: PdfColumn[] = [
  { key: 'desc', label: 'الوصف', flex: 1.8, kind: 'text' },
  { key: 'party', label: 'الطرف', flex: 1.2, kind: 'text' },
  { key: 'amount', label: 'المبلغ', flex: 1, kind: 'money' },
  { key: 'paid', label: 'مدفوع', flex: 1, kind: 'money' },
  { key: 'remaining', label: 'متبقي', flex: 1, kind: 'money' },
];

const WORKER_COLS: PdfColumn[] = [
  { key: 'job', label: 'طبيعة العمل', flex: 1.6, kind: 'text' },
  { key: 'name', label: 'اسم العامل', flex: 1.2, kind: 'text' },
  { key: 'status', label: 'الحالة', flex: 0.8, kind: 'text' },
  { key: 'agreed', label: 'الاتفاق', flex: 1, kind: 'money' },
  { key: 'paid', label: 'المدفوع', flex: 1, kind: 'money' },
  { key: 'due', label: 'المتبقي', flex: 1, kind: 'money' },
];

const MetaBar = ({ s, client }: { s: any; client: Client }) => (
  <View style={s.infoRow}>
    <View style={s.datesCol}>
      <View style={s.dateRow}>
        <Text style={s.dateLabel}>{ar('تاريخ التقرير')}</Text>
        <Text style={s.dateVal}>{today()}</Text>
      </View>
    </View>
    <View style={s.clientBox}>
      <Text style={s.clientSectionLbl}>{ar('تقرير لحساب')}</Text>
      <Text style={s.clientName}>{ar(client.name)}</Text>
      {client.address ? <Text style={s.clientSub}>{ar(client.address)}</Text> : null}
      {client.phone ? <Text style={s.clientSub}>{client.phone}</Text> : null}
    </View>
  </View>
);

const ReportPage = ({
  title, titleEn, refText, client, children, summaryCells, docRef,
}: {
  title: string; titleEn?: string; refText: string; client: Client; children: React.ReactNode;
  summaryCells?: { label: string; value: string | number; color?: string; accent?: boolean; format?: 'money' | 'count' | 'text' }[];
  docRef?: string;
}) => {
  const B = getPdfBrand();
  const s = makePdfStyles(B);
  return (
    <Page size="A4" style={s.page} wrap>
      <PdfBrandedFooter s={s} B={B} />
      <PdfBrandedReportHeader s={s} B={B} titleEn={titleEn || title} subtitleAr={title} refLine={refText} />
      <MetaBar s={s} client={client} />
      {summaryCells?.length ? <PdfSummaryStrip s={s} cells={summaryCells} /> : null}
      {children}
    </Page>
  );
};

const fullReportSectionStyle = { marginBottom: 6 };

/* ═══ 1. EXPENSES ═══ */
interface ExpensesPDFProps { client: Client; expenses: Expense[]; total: number }

export const ExpensesPDF: React.FC<ExpensesPDFProps> = ({ client, expenses, total }) => {
  const B = getPdfBrand();
  return (
    <Document title={`مصروفات-${client.name}`} author={B.fullName} language="ar">
      <ReportPage title="تقرير مصروفات" titleEn="EXPENSES" refText={ar('كشف المصروفات')} client={client}
        summaryCells={[
          { label: 'أحدث مصروف', value: latestExpenseDate(expenses), format: 'text' },
          { label: 'إجمالي المصروفات', value: total, color: INK.danger, accent: true, format: 'money' },
        ]}>
        <PdfTable
          repeatHeader
          columns={EXP_COLS}
          primary={B.palette.primary}
          moneyColor={INK.danger}
          rows={expenses.map(mapExpensePdfRow)}
          footer={{ label: 'الإجمالي', values: { amount: total }, colors: { amount: INK.danger } }}
        />
      </ReportPage>
    </Document>
  );
};

/* ═══ 2. PAYMENTS ═══ */
interface PaymentsPDFProps { client: Client; payments: Payment[]; total: number }

export const PaymentsPDF: React.FC<PaymentsPDFProps> = ({ client, payments, total }) => {
  const B = getPdfBrand();
  return (
    <Document title={`مدفوعات-${client.name}`} author={B.fullName} language="ar">
      <ReportPage title="تقرير مدفوعات" titleEn="PAYMENTS" refText={ar('كشف المدفوعات')} client={client}
        summaryCells={[
          { label: 'متوسط الدفعة', value: avgAmount(total, payments.length), format: 'money', color: INK.success },
          { label: 'إجمالي المدفوعات', value: total, color: INK.success, accent: true, format: 'money' },
        ]}>
        <PdfTable
          repeatHeader
          columns={PAY_COLS}
          primary={B.palette.primary}
          moneyColor={INK.success}
          rows={payments.map((p) => ({
            notes: p.notes || '-',
            method: getPayLabel(p.paymentMethod),
            by: p.createdBy || '-',
            date: arDate(p.paymentDate),
            amount: p.amount,
          }))}
          footer={{ label: 'الإجمالي', values: { amount: total }, colors: { amount: INK.success } }}
        />
      </ReportPage>
    </Document>
  );
};

/* ═══ 3. WORKERS ═══ */
interface WorkersPDFProps {
  client: Client; workers: Worker[];
  totalAgreed: number; totalPaid: number; totalDue: number;
}

export const WorkersPDF: React.FC<WorkersPDFProps> = ({ client, workers, totalAgreed, totalPaid, totalDue }) => {
  const B = getPdfBrand();
  return (
    <Document title={`عمال-${client.name}`} author={B.fullName} language="ar">
      <ReportPage title="تقرير عمال" titleEn="WORKERS" refText={ar('كشف العمال والمقاولين')} client={client}
        summaryCells={[
          { label: 'إجمالي الاتفاقيات', value: totalAgreed },
          { label: 'المدفوع', value: totalPaid, color: INK.success, accent: true },
          { label: 'المتبقي', value: totalDue, color: INK.danger, accent: true },
        ]}>
        <PdfTable
          repeatHeader
          columns={WORKER_COLS}
          primary={B.palette.primary}
          rows={workers.map((w) => ({
            job: w.jobType || 'تم التعيين',
            name: w.name,
            status: w.status === 'completed' ? 'تصفية' : 'مستمر',
            agreed: w.totalAmount,
            paid: w.paidAmount,
            due: w.remainingAmount,
          }))}
          footer={{
            label: 'إجمالي العمال',
            values: { agreed: totalAgreed, paid: totalPaid, due: totalDue },
            colors: { paid: INK.success, due: INK.danger },
          }}
        />
      </ReportPage>
    </Document>
  );
};

/* ═══ 4. FULL REPORT ═══ */
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
  client, expenses, payments, debts, workers, summary,
}) => {
  const B = getPdfBrand();
  const s = makePdfStyles(B);
  const remColor = summary.remaining >= 0 ? INK.success : INK.danger;

  type ReportSection = {
    key: string;
    title: string;
    node: React.ReactNode;
  };

  const sections: ReportSection[] = [];

  if (expenses.length > 0) {
    sections.push({
      key: 'expenses',
      title: `المصروفات (${expenses.length})`,
      node: (
        <PdfTable
          repeatHeader={false}
          columns={EXP_COLS}
          primary={B.palette.primary}
          moneyColor={INK.danger}
          rows={expenses.map(mapExpensePdfRow)}
          footer={{ label: 'إجمالي المصروفات', values: { amount: summary.totalExpenses }, colors: { amount: INK.danger } }}
        />
      ),
    });
  }

  if (payments.length > 0) {
    sections.push({
      key: 'payments',
      title: `المدفوعات (${payments.length})`,
      node: (
        <PdfTable
          repeatHeader={false}
          columns={PAY_COLS}
          primary={B.palette.primary}
          moneyColor={INK.success}
          rows={payments.map((p) => ({
            notes: p.notes || '-',
            method: getPayLabel(p.paymentMethod),
            by: p.createdBy || '-',
            date: arDate(p.paymentDate),
            amount: p.amount,
          }))}
          footer={{ label: 'إجمالي المدفوعات', values: { amount: summary.totalPaid }, colors: { amount: INK.success } }}
        />
      ),
    });
  }

  if (debts.length > 0) {
    sections.push({
      key: 'debts',
      title: `الديون (${debts.length})`,
      node: (
        <PdfTable
          repeatHeader={false}
          columns={DEBT_COLS}
          primary={B.palette.primary}
          rows={debts.map((d) => ({
            desc: d.description,
            party: d.partyName,
            amount: d.amount,
            paid: d.paidAmount,
            remaining: d.remainingAmount,
          }))}
          footer={{ label: 'إجمالي الديون', values: { amount: summary.totalDebts } }}
        />
      ),
    });
  }

  if (workers.length > 0) {
    sections.push({
      key: 'workers',
      title: `العمال والمقاولون (${workers.length})`,
      node: (
        <PdfTable
          repeatHeader={false}
          columns={WORKER_COLS}
          primary={B.palette.primary}
          rows={workers.map((w) => ({
            job: w.jobType || 'تم التعيين',
            name: w.name,
            status: w.status === 'completed' ? 'تصفية' : 'مستمر',
            agreed: w.totalAmount,
            paid: w.paidAmount,
            due: w.remainingAmount,
          }))}
          footer={{
            label: 'إجمالي العمال',
            values: { agreed: summary.totalWorkersAgreed, paid: summary.totalWorkersPaid, due: summary.totalWorkersDue },
            colors: { paid: INK.success, due: INK.danger },
          }}
        />
      ),
    });
  }

  return (
    <Document title={`تقرير-${client.name}`} author={B.fullName} language="ar">
      <Page size="A4" style={s.page} wrap>
        <PdfBrandedFooter s={s} B={B} />
        <PdfBrandedReportHeader
          s={s}
          B={B}
          titleEn="FULL REPORT"
          subtitleAr="تقرير شامل"
          refLine={ar('التقرير الشامل')}
        />
        <MetaBar s={s} client={client} />

        <PdfSummaryStrip
          s={s}
          cells={[
            { label: 'إجمالي المدفوعات', value: summary.totalPaid, color: INK.success, accent: true },
            { label: `النسبة المتفق عليها (${summary.profitPercentage}%)`, value: summary.profit, color: INK.warning },
            { label: 'مصروفات + ديون', value: summary.totalObligations, color: INK.danger, accent: true },
            { label: 'المتبقي', value: summary.remaining, color: remColor, accent: true },
          ]}
        />

        {sections.map((section, index) => (
          <View key={section.key} style={fullReportSectionStyle}>
            <PdfSectionTitle primary={B.palette.primary} compact={index > 0}>
              {section.title}
            </PdfSectionTitle>
            {section.node}
          </View>
        ))}
      </Page>
    </Document>
  );
};

/* ═══ 5. DEBTS ═══ */
interface DebtsPDFProps { client: Client; debts: StandaloneDebt[]; total: number }

export const DebtsPDF: React.FC<DebtsPDFProps> = ({ client, debts, total }) => {
  const B = getPdfBrand();
  return (
    <Document title={`ديون-${client.name}`} author={B.fullName} language="ar">
      <ReportPage title="تقرير ديون" titleEn="DEBTS" refText={ar('كشف الديون')} client={client}
        summaryCells={[
          { label: 'متوسط المتبقي', value: avgAmount(total, debts.length), format: 'money', color: INK.warning },
          { label: 'إجمالي المتبقي', value: total, color: INK.warning, accent: true, format: 'money' },
        ]}>
        <PdfTable
          repeatHeader
          columns={DEBT_COLS}
          primary={B.palette.primary}
          rows={debts.map((d) => ({
            desc: d.description,
            party: d.partyName,
            amount: d.amount,
            paid: d.paidAmount,
            remaining: d.remainingAmount,
          }))}
          footer={{ label: 'إجمالي الديون المتبقية', values: { remaining: total }, colors: { remaining: INK.warning } }}
        />
      </ReportPage>
    </Document>
  );
};
