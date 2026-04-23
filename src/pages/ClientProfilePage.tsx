// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Container,
  Avatar, Stack, FormControl, InputLabel, Select, MenuItem, Divider,
  useTheme, Snackbar, InputAdornment, Alert, Grid as MuiGrid, CircularProgress, Collapse, alpha,
} from '@mui/material';
import {
  ArrowBack, Payment, Business, Person, Phone, Add, TrendingDown,
  TrendingUp, Edit, Delete, CreditCard, PersonAdd, Save, Share, Close, PostAdd, ChevronLeft, Search, KeyboardArrowDown, KeyboardArrowUp,   AccountBalanceWallet, WarningAmber, CalendarToday, NoteAlt, PictureAsPdf, FolderOpen, ReceiptLong, Label, Category, Handyman, PrecisionManufacturing, Engineering, Storefront, LocalShipping, Description, MoreVert, Build
} from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppLockStore } from '../store/useAppLockStore';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { formatCurrency, formatDate, getExpenseCategoryLabel, expenseCategories } from '../utils/formatters';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import React from 'react';
import { downloadPdf, sharePdf } from '../utils/pdfService';
import { ExpensesPDF, PaymentsPDF, WorkersPDF, DebtsPDF, FullReportPDF } from '../components/pdf/ClientReportsPDF';
import toast from 'react-hot-toast';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useGlobalFundStore } from '../store/useGlobalFundStore';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaSectionTitle, EtlalaAccentSurface, EtlalaEmptyState } from '../components/etlala/EtlalaMobileUi';
import { ClientProfileHero } from '../components/client/ClientProfileHero';
import {
  ProfileListSessionHeader,
  profileHeroAddIconButtonSx,
  profileHeroPdfButtonSx,
  profileHeroPrimaryButtonSx,
} from '../components/client/ProfileListSessionHeader';
import {
  ProfileSessionListShell,
  ProfileSessionSearch,
  ProfileSessionSearchBar,
  ProfileSessionScroll,
  ProfileSessionTotalBar,
  ProfileSessionRowMeta,
  ProfileSessionRecordListItem,
  ProfileSessionRecordCardContent,
  ProfileSessionListHeading,
} from '../components/client/ProfileSessionUi';
import { PROFILE_MODULE } from '../components/client/profileSessionTokens';
import { premiumTokens } from '../theme/tokens';
import { motion, useReducedMotion } from 'framer-motion';

const Grid = MuiGrid as any;
import type { Payment as PaymentType, Expense, StandaloneDebt, Worker, UserBalance } from '../types';
import { COMPANY_INFO } from '../constants/companyInfo';

dayjs.locale('ar');

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().optional(),
  phone: z.string().min(8),
  address: z.string().min(3),
  type: z.enum(['company', 'individual']),
});

const workerSchema = z.object({
  name: z.string().min(1, 'مطلوب'),
  jobType: z.string().optional(),
  totalAmount: z.preprocess((val) => (val === '' ? undefined : parseFloat(val as string)), z.number().min(0, 'يجب أن يكون مبلغ إيجابي').optional())
});

export const ClientProfilePage = () => {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { canAccess } = useAppLockStore();

  const { transactions: fundTransactions, initialize: initFund } = useGlobalFundStore();

  const {
    clients, payments, expenses, standaloneDebts, invoices, debtParties,
    addPayment, updatePayment, deletePayment,
    addExpense, updateExpense, deleteExpense,
    addStandaloneDebt, updateStandaloneDebt, deleteStandaloneDebt,
    updateClient, deleteClient,
    workers, addWorker, updateWorker, deleteWorker,
    userBalances, addUserBalance, updateUserBalance, deleteUserBalance,
  } = useDataStore();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [expensesListOpen, setExpensesListOpen] = useState(false);
  const [paymentsListOpen, setPaymentsListOpen] = useState(false);
  const [debtsListOpen, setDebtsListOpen] = useState(false);
  const [expandedUserExpenses, setExpandedUserExpenses] = useState<string | null>(null);
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(null);
  const [editingDebt, setEditingDebt] = useState<StandaloneDebt | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [workersListOpen, setWorkersListOpen] = useState(false);
  const [profitPercentage, setProfitPercentage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [expSearch, setExpSearch] = useState('');
  const [paySearch, setPaySearch] = useState('');
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [expensesPerUserOpen, setExpensesPerUserOpen] = useState(false);
  const [balancesListOpen, setBalancesListOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<UserBalance | null>(null);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  const client = clients.find((c) => c.id === clientId);
  const reduceMotion = useReducedMotion();

  // Forms
  const { control: clientControl, handleSubmit: handleClientSubmit, reset: resetClient } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', type: 'individual' },
  });

  const { control: payCtrl, handleSubmit: handlePaySubmit, reset: resetPay, setValue: setPayVal } = useForm({
    defaultValues: { amount: '' as any, paymentMethod: 'cash' as const, paymentDate: dayjs().format('YYYY-MM-DD'), invoiceId: '', notes: '' },
  });

  const { control: expCtrl, handleSubmit: handleExpSubmit, reset: resetExp, setValue: setExpVal } = useForm({
    defaultValues: { description: '', amount: '' as any, category: 'materials', date: dayjs().format('YYYY-MM-DD'), invoiceNumber: '', notes: '', workerId: '', userId: '' },
  });

  const { control: debtCtrl, handleSubmit: handleDebtSubmit, reset: resetDebt, setValue: setDebtVal } = useForm({
    defaultValues: { partyName: '', description: '', amount: '' as any, date: dayjs().format('YYYY-MM-DD'), notes: '' },
  });

  const { control: workCtrl, handleSubmit: handleWorkSubmit, reset: resetWork, setValue: setWorkVal } = useForm({
    defaultValues: { name: '', jobType: '', totalAmount: '' as any },
  });

  const { control: balCtrl, handleSubmit: handleBalSubmit, reset: resetBal, setValue: setBalVal } = useForm({
    defaultValues: { userId: '', amount: '' as any, date: dayjs().format('YYYY-MM-DD'), notes: '' },
  });

  useEffect(() => { const u = initFund(); return u; }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      setSystemUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (client && editClientOpen) {
      resetClient({ name: client.name, email: client.email || '', phone: client.phone, address: client.address, type: client.type });
    }
  }, [client, editClientOpen, resetClient]);

  useEffect(() => {
    if (client) setProfitPercentage(client.profitPercentage?.toString() || '');
  }, [client?.id, client?.profitPercentage]);

  const clientExpenses = useMemo(() => expenses.filter((e) => e.clientId === clientId).sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))), [expenses, clientId]);
  const clientPayments = useMemo(() => payments.filter((p) => p.clientId === clientId).sort((a, b) => dayjs(b.paymentDate).diff(dayjs(a.paymentDate))), [payments, clientId]);
  const clientDebts = useMemo(() => standaloneDebts.filter((d) => d.clientId === clientId).sort((a, b) => dayjs(b.date).diff(dayjs(a.date))), [standaloneDebts, clientId]);
  const clientWorkers = useMemo(() => {
    const works = workers.filter((w) => w.clientId === clientId).sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
    return works.map(w => {
      const paid = expenses.filter(e => e.workerId === w.id).reduce((sum, e) => sum + e.amount, 0);
      return { ...w, paidAmount: paid, remainingAmount: w.totalAmount - paid };
    });
  }, [workers, expenses, clientId]);

  const clientUserBalances = useMemo(() => userBalances.filter(b => b.clientId === clientId).sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))), [userBalances, clientId]);

  // Build cross-reference maps: uid <-> docId <-> displayName
  const userIdMap = useMemo(() => {
    const uidToDoc: Record<string, string> = {}; // Firebase Auth UID -> Firestore doc.id
    const docToUid: Record<string, string> = {}; // Firestore doc.id -> Firebase Auth UID
    const nameToUid: Record<string, string> = {}; // displayName -> Firebase Auth UID
    systemUsers.forEach((u: any) => {
      const authUid = u.uid || u.id;
      const docId = u.id;
      uidToDoc[authUid] = docId;
      docToUid[docId] = authUid;
      if (u.displayName) nameToUid[u.displayName] = authUid;
    });
    return { uidToDoc, docToUid, nameToUid };
  }, [systemUsers]);

  const userBalancesSummary = useMemo(() => {
    const summary: Record<string, { given: number, spent: number, remaining: number, expenses: typeof clientExpenses, name: string, minTime: string }> = {};
    
    const sortedBalances = [...clientUserBalances].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
    sortedBalances.forEach(b => {
      // Normalize key to Firebase Auth UID
      let k = b.userId;
      if (k && userIdMap.docToUid[k]) k = userIdMap.docToUid[k]; // old data: was stored as doc.id
      if (!k && b.userName && userIdMap.nameToUid[b.userName]) k = userIdMap.nameToUid[b.userName];
      if (!k) k = b.userId || b.userName || 'unknown';

      const currentUserData = systemUsers.find((u: any) => (u.uid || u.id) === k);
      const actualName = currentUserData ? currentUserData.displayName : (b.userName || 'مستخدم');

      if (!summary[k]) summary[k] = { given: 0, spent: 0, remaining: 0, expenses: [], name: actualName, minTime: b.createdAt };
      if (currentUserData) summary[k].name = actualName;
      summary[k].given += b.amount;
      summary[k].remaining += b.amount;
    });

    clientExpenses.forEach(e => {
      // Normalize expense user key to Firebase Auth UID
      let k = e.userId;
      if (k && userIdMap.docToUid[k]) k = userIdMap.docToUid[k];
      if (!k && e.createdBy && userIdMap.nameToUid[e.createdBy]) k = userIdMap.nameToUid[e.createdBy];
      if (!k) k = e.userId || e.createdBy || 'المستخدم';

      if (summary[k] && summary[k].minTime) {
        if (dayjs(e.createdAt).isAfter(dayjs(summary[k].minTime).subtract(1, 'minute'))) {
          summary[k].spent += e.amount;
          summary[k].remaining -= e.amount;
          summary[k].expenses.push(e);
        }
      }
    });

    return summary;
  }, [clientUserBalances, clientExpenses, systemUsers, userIdMap]);

  // user.id is always the Firebase Auth UID
  const activeUserKey = user?.id || '';
  const currentUserBalanceInfo = activeUserKey ? userBalancesSummary[activeUserKey] : null;

  // ── رصيد العهدة العام (نفس خوارزمية FundPage بالضبط) ──────────────────
  const globalFundStats = useMemo(() => {
    if (!user) return null;
    const uid = user.id;
    const userName = user.displayName || '';

    const deposits = [...fundTransactions.filter(t =>
      t.type === 'deposit' && (
        (uid && t.userId === uid) ||
        (userName && t.userName === userName)
      )
    )].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));

    if (deposits.length === 0) return null;

    const custodies = deposits.map(tx => ({
      createdAt: tx.createdAt, amount: tx.amount, remaining: tx.amount, spent: 0,
    }));

    const allExp = [...expenses.filter(e =>
      (uid && e.userId === uid) || (userName && e.createdBy === userName)
    )].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));

    allExp.forEach(exp => {
      let rem = exp.amount;
      const expTime = dayjs(exp.createdAt);
      for (let i = 0; i < custodies.length; i++) {
        const c = custodies[i];
        if (rem <= 0) break;
        if (expTime.isBefore(dayjs(c.createdAt))) continue;
        if (c.remaining <= 0) {
          const hasNext = custodies.slice(i + 1).some(nc => !expTime.isBefore(dayjs(nc.createdAt)));
          if (hasNext) continue;
        }
        const take = Math.min(rem, Math.max(c.remaining, 0));
        if (take > 0) { c.spent += take; c.remaining -= take; rem -= take; }
        if (rem > 0) {
          const hasNext = custodies.slice(i + 1).some(nc => !expTime.isBefore(dayjs(nc.createdAt)));
          if (!hasNext) { c.spent += rem; c.remaining -= rem; rem = 0; }
        }
      }
    });

    for (let i = 0; i < custodies.length - 1; i++) {
      if (custodies[i].remaining < 0) {
        const deficit = Math.abs(custodies[i].remaining);
        custodies[i + 1].remaining -= deficit;
        custodies[i + 1].spent += deficit;
        custodies[i].remaining = 0;
      }
    }

    const totalDeposited = custodies.reduce((s, c) => s + c.amount, 0);
    const totalSpent = custodies.reduce((s, c) => s + c.spent, 0);
    const totalRemaining = custodies.reduce((s, c) => s + c.remaining, 0);
    return { deposited: totalDeposited, spent: totalSpent, remaining: totalRemaining };
  }, [fundTransactions, expenses, user]);

  const depletedBalances = useMemo(() => Object.entries(userBalancesSummary).filter(([u, b]) => b.given > 0 && b.remaining <= 0), [userBalancesSummary]);

  const filteredExp = useMemo(() => {
    if (!expSearch) return clientExpenses;
    const q = expSearch.toLowerCase();
    return clientExpenses.filter((e) => e.description.toLowerCase().includes(q) || e.category.includes(q));
  }, [clientExpenses, expSearch]);

  const expensesByUser = useMemo(() => {
    const totals: Record<string, number> = {};
    clientExpenses.forEach(exp => {
      const user = exp.createdBy || 'المستخدم';
      totals[user] = (totals[user] || 0) + exp.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [clientExpenses]);

  const filteredPay = useMemo(() => {
    if (!paySearch) return clientPayments;
    const q = paySearch.toLowerCase();
    return clientPayments.filter((p) => formatCurrency(p.amount).includes(q) || p.paymentMethod.includes(q));
  }, [clientPayments, paySearch]);

  const clientInvoicesCount = useMemo(
    () => (clientId ? invoices.filter((i) => i.clientId === clientId).length : 0),
    [invoices, clientId],
  );

  const clientActivitySummary = useMemo(() => {
    if (!clientId) return '';
    const parts: string[] = [];
    if (clientInvoicesCount) parts.push(`${clientInvoicesCount} فاتورة`);
    if (clientPayments.length) parts.push(`${clientPayments.length} دفعة`);
    if (clientExpenses.length) parts.push(`${clientExpenses.length} مصروف`);
    if (clientWorkers.length) parts.push(`${clientWorkers.length} عامل`);
    if (clientDebts.length) parts.push(`${clientDebts.length} بند دين`);
    return parts.length ? `مرجع النشاط: ${parts.join(' · ')}` : 'لا توجد حركات مسجّلة بعد';
  }, [clientId, clientInvoicesCount, clientPayments.length, clientExpenses.length, clientWorkers.length, clientDebts.length]);

  const summary = useMemo(() => {
    const totalExpenses = clientExpenses.reduce((s, e) => s + e.amount, 0);
    const totalDebts = clientDebts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalPaid = clientPayments.reduce((s, p) => s + p.amount, 0);
    const totalWorkersDue = clientWorkers.reduce((s, w) => s + w.remainingAmount, 0);
    const totalWorkersAgreed = clientWorkers.reduce((s, w) => s + w.totalAmount, 0);
    const totalWorkersPaid = clientWorkers.reduce((s, w) => s + w.paidAmount, 0);
    const pct = client?.profitPercentage || 0;
    // النسبة تؤخذ من إجمالي المدفوعات
    const profit = totalPaid > 0 && pct > 0 ? (totalPaid * pct) / 100 : 0;
    // المتبقي = المدفوعات - النسبة - المصروفات - الديون المتبقية
    const totalObligations = totalExpenses + totalDebts;
    const remaining = totalPaid - profit - totalObligations;
    return { totalExpenses, totalDebts, totalPaid, totalWorkersDue, totalWorkersAgreed, totalWorkersPaid, remaining, profit, profitPercentage: pct, totalObligations };
  }, [clientExpenses, clientDebts, clientPayments, clientWorkers, client]);

  const msg = (m: string) => setSnackbar({ open: true, message: m });
  const [pdfLoading, setPdfLoading] = useState(false);

  // === PDF Helpers (using @react-pdf/renderer) ===
  const withPdfLoading = async (fn: () => Promise<void>) => {
    setPdfLoading(true);
    try {
      await fn();
    } catch (e) {
      console.error('PDF error:', e);
      toast.error('فشل في إنشاء PDF');
    } finally {
      setPdfLoading(false);
    }
  };
  // ─── Full Report ──────────────────────────────
  const handleGeneratePDF = () => withPdfLoading(() =>
    downloadPdf(
      React.createElement(FullReportPDF, { client, expenses: clientExpenses, payments: clientPayments, debts: clientDebts, workers: clientWorkers, summary }),
      `تقرير-${client?.name}`
    )
  );
  const handleShareFullReport = () => withPdfLoading(() =>
    sharePdf(
      React.createElement(FullReportPDF, { client, expenses: clientExpenses, payments: clientPayments, debts: clientDebts, workers: clientWorkers, summary }),
      `تقرير-${client?.name}`,
      `التقرير الشامل - ${client?.name}`
    )
  );

  // ─── Expenses ────────────────────────────────
  const handleDownloadExpenses = () => withPdfLoading(() =>
    downloadPdf(
      React.createElement(ExpensesPDF, { client, expenses: clientExpenses, total: summary.totalExpenses }),
      `مصروفات-${client?.name}`
    )
  );
  const handleShareExpenses = () => withPdfLoading(() =>
    sharePdf(
      React.createElement(ExpensesPDF, { client, expenses: clientExpenses, total: summary.totalExpenses }),
      `مصروفات-${client?.name}`,
      `كشف المصروفات - ${client?.name}`
    )
  );

  // ─── Payments ────────────────────────────────
  const handleDownloadPayments = () => withPdfLoading(() =>
    downloadPdf(
      React.createElement(PaymentsPDF, { client, payments: clientPayments, total: summary.totalPaid }),
      `مدفوعات-${client?.name}`
    )
  );
  const handleSharePayments = () => withPdfLoading(() =>
    sharePdf(
      React.createElement(PaymentsPDF, { client, payments: clientPayments, total: summary.totalPaid }),
      `مدفوعات-${client?.name}`,
      `كشف المدفوعات - ${client?.name}`
    )
  );

  // ─── Debts ────────────────────────────────────
  const handleDownloadDebts = () => withPdfLoading(() =>
    downloadPdf(
      React.createElement(DebtsPDF, { client, debts: clientDebts, total: summary.totalDebts }),
      `ديون-${client?.name}`
    )
  );
  const handleShareDebts = () => withPdfLoading(() =>
    sharePdf(
      React.createElement(DebtsPDF, { client, debts: clientDebts, total: summary.totalDebts }),
      `ديون-${client?.name}`,
      `كشف الديون - ${client?.name}`
    )
  );

  // ─── Workers ──────────────────────────────────
  const handleDownloadWorkers = () => withPdfLoading(() =>
    downloadPdf(
      React.createElement(WorkersPDF, { client, workers: clientWorkers, totalAgreed: summary.totalWorkersAgreed, totalPaid: summary.totalWorkersPaid, totalDue: summary.totalWorkersDue }),
      `عمال-${client?.name}`
    )
  );
  const handleShareWorkers = () => withPdfLoading(() =>
    sharePdf(
      React.createElement(WorkersPDF, { client, workers: clientWorkers, totalAgreed: summary.totalWorkersAgreed, totalPaid: summary.totalWorkersPaid, totalDue: summary.totalWorkersDue }),
      `عمال-${client?.name}`,
      `كشف العمال - ${client?.name}`
    )
  );

  const menuItems = [
    { title: 'فاتورة جديدة', icon: PostAdd, color: '#e6a817', bgColor: 'rgba(230,168,23,0.08)', borderColor: 'rgba(230,168,23,0.12)', module: 'invoices', onClick: () => navigate(`/invoices/new?clientId=${clientId}`) },
    { title: 'المصروفات', icon: TrendingDown, color: '#d64545', bgColor: 'rgba(214,69,69,0.08)', borderColor: 'rgba(214,69,69,0.12)', module: 'expenses', onClick: () => setExpensesListOpen(true) },
    { title: 'المدفوعات', icon: Payment, color: '#0d9668', bgColor: 'rgba(13,150,104,0.08)', borderColor: 'rgba(13,150,104,0.12)', module: 'payments', onClick: () => setPaymentsListOpen(true) },
    { title: 'الديون', icon: CreditCard, color: '#c9a54e', bgColor: 'rgba(201,165,78,0.08)', borderColor: 'rgba(201,165,78,0.12)', module: 'debts', onClick: () => setDebtsListOpen(true) },
    { title: 'العمال', icon: PersonAdd, color: '#4A5E50', bgColor: 'rgba(74, 94, 80, 0.08)', borderColor: 'rgba(74, 94, 80, 0.12)', module: 'workers', onClick: () => setWorkersListOpen(true) },
    { title: 'إضافة رصيد (العهد)', icon: AccountBalanceWallet, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.12)', module: 'balances', onClick: () => setBalancesListOpen(true) },
    { title: 'حساب الأرباح', icon: TrendingUp, color: '#C2B280', bgColor: 'rgba(194, 178, 128, 0.08)', borderColor: 'rgba(194, 178, 128, 0.12)', module: 'stats', onClick: () => setProfitDialogOpen(true) },
    { title: 'تحميل التقرير الشامل', icon: Business, color: '#2F3E34', bgColor: 'rgba(47, 62, 52, 0.1)', borderColor: 'rgba(47, 62, 52, 0.16)', module: 'stats', onClick: () => handleGeneratePDF() },
    { title: 'مشاركة التقرير الشامل', icon: Share, color: '#243028', bgColor: 'rgba(36, 48, 40, 0.08)', borderColor: 'rgba(36, 48, 40, 0.12)', module: 'stats', onClick: () => handleShareFullReport() },
  ].filter(item => canAccess(item.module as any));

  // Handlers
  const onSubmitClient = async (data: any) => { if (!clientId) return; try { await updateClient(clientId, data); msg('تم تحديث بيانات العميل'); setEditClientOpen(false); } catch { msg('خطأ'); } };
  const handleDeleteClient = async () => { if (!clientId || !window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return; try { await deleteClient(clientId); navigate('/clients'); } catch { msg('خطأ'); } };

  const handleSaveProfit = async () => {
    if (!clientId) return;
    const pct = parseFloat(profitPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) { msg('النسبة يجب أن تكون بين 0 و 100'); return; }
    try { await updateClient(clientId, { profitPercentage: pct }); window.dispatchEvent(new Event('profitPercentageUpdated')); msg('تم حفظ النسبة'); setProfitDialogOpen(false); } catch { msg('خطأ'); }
  };

  const onSubmitPayment = async (data: any) => {
    const amount = parseFloat(data.amount) || 0;
    try {
      if (editingPayment) { await updatePayment(editingPayment.id, { amount, paymentMethod: data.paymentMethod, paymentDate: data.paymentDate, invoiceId: data.invoiceId, notes: data.notes }); setEditingPayment(null); msg('تم التعديل'); }
      else { await addPayment({ id: crypto.randomUUID(), invoiceId: data.invoiceId || '', clientId: clientId!, amount, paymentMethod: data.paymentMethod, paymentDate: data.paymentDate, notes: data.notes || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: user?.displayName || 'المستخدم' }); msg('تمت الإضافة'); }
      setPaymentDialogOpen(false); resetPay(); setPaymentsListOpen(true);
    } catch { msg('خطأ'); }
  };

  const onSubmitExpense = async (data: any) => {
    const amount = parseFloat(data.amount) || 0;
    const workerId = data.workerId || null;
    const workerName = workerId ? workers.find(w => w.id === workerId)?.name : null;
    const userId = editingExpense ? (editingExpense.userId || user?.id || '') : (user?.id || '');
    const createdBy = editingExpense ? (editingExpense.createdBy || user?.displayName || 'المستخدم') : (user?.displayName || 'المستخدم');
    try {
      if (editingExpense) { await updateExpense(editingExpense.id, { description: data.description, amount, category: data.category, date: data.date, invoiceNumber: data.invoiceNumber, notes: data.notes, workerId, workerName, userId, createdBy }); setEditingExpense(null); msg('تم التعديل'); }
      else { await addExpense({ id: crypto.randomUUID(), clientId: clientId!, description: data.description, amount, category: data.category, date: data.date, invoiceNumber: data.invoiceNumber || '', notes: data.notes, isClosed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), workerId, workerName, userId, createdBy }); msg('تمت الإضافة'); }
      setExpenseDialogOpen(false); resetExp(); setExpensesListOpen(true);
    } catch { msg('خطأ'); }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      await deleteExpense(expense.id);
      setDeletingExpense(null);
      msg('تم حذف المصروف');
    } catch { msg('خطأ في الحذف'); }
  };

  const onSubmitDebt = async (data: any) => {
    const amount = parseFloat(data.amount) || 0;
    try {
      if (editingDebt) { const newPaid = Math.min(editingDebt.paidAmount, amount); await updateStandaloneDebt(editingDebt.id, { partyName: data.partyName, description: data.description, amount, paidAmount: newPaid, remainingAmount: Math.max(0, amount - newPaid), status: amount - newPaid <= 0 ? 'paid' : 'unpaid', date: data.date, notes: data.notes }); setEditingDebt(null); msg('تم التعديل'); }
      else { await addStandaloneDebt({ id: crypto.randomUUID(), clientId: clientId!, partyType: 'external', partyName: data.partyName, description: data.description, amount, paidAmount: 0, remainingAmount: amount, status: 'unpaid', date: data.date, notes: data.notes || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); msg('تمت الإضافة'); }
      setDebtDialogOpen(false); resetDebt(); setDebtsListOpen(true);
    } catch { msg('خطأ'); }
  };

  const onSubmitWorker = async (data: any) => {
    const totalAmount = parseFloat(data.totalAmount) || 0;
    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, { name: data.name, jobType: data.jobType, totalAmount, status: 'active' });
        msg('تم تحديث بيانات العامل');
      } else {
        await addWorker({
          id: crypto.randomUUID(),
          clientId: clientId!,
          name: data.name,
          jobType: data.jobType,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        msg('تم إضافة العامل');
      }
      setWorkerDialogOpen(false); resetWork(); setWorkersListOpen(true);
    } catch { msg('خطأ'); }
  };

  const onSubmitBalance = async (data: any) => {
    const amount = parseFloat(data.amount) || 0;
    // data.userId contains the Firebase Auth UID (from u.uid stored in Firestore)
    const assignedUser = systemUsers.find(u => (u.uid || u.id) === data.userId);
    const userName = assignedUser ? assignedUser.displayName : (user?.displayName || 'المستخدم');
    const userId = data.userId; // This is now the Firebase Auth UID;
    try {
      if (editingBalance) {
        await updateUserBalance(editingBalance.id, { userId, userName, amount, date: data.date, notes: data.notes });
        msg('تم التعديل');
        setEditingBalance(null);
      } else {
        await addUserBalance({
          id: crypto.randomUUID(), clientId: clientId!, userId, userName, amount, date: data.date, notes: data.notes || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: user?.displayName || 'المستخدم'
        });
        msg('تمت الإضافة');
      }
      setBalanceDialogOpen(false); resetBal(); setBalancesListOpen(true);
    } catch { msg('خطأ'); }
  };

  const getPayMethodLabel = (m: string) => ({ cash: 'نقدي', bank_transfer: 'تحويل بنكي', check: 'شيك', credit_card: 'بطاقة', mobile_payment: 'محفظة' }[m] || m);
  const getCategoryLabel = getExpenseCategoryLabel;

  const headerGradient = theme.palette.mode === 'light' ? 'linear-gradient(160deg, #2F3E34 0%, #4A5E50 100%)' : 'linear-gradient(160deg, #111814 0%, #1A221C 100%)';
  const pageBg = theme.palette.mode === 'dark' ? 'linear-gradient(180deg, #0B0F19 0%, #090C14 100%)' : 'linear-gradient(180deg, #F7F9FC 0%, #F1F5F9 100%)';

  if (!client) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography>العميل غير موجود</Typography>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/clients')} sx={{ mt: 2 }}>العودة</Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100dvh', background: pageBg, pb: 8 }}>
      <PageScaffold
        headerVariant="profile"
        title={client.name}
        backTo="/clients"
        rightAction={(
            <IconButton
              onClick={() => setEditClientOpen(true)}
              aria-label="تعديل بيانات العميل"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                width: 46,
                height: 46,
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(200,192,176,0.4)' },
              }}
            >
              <Edit sx={{ fontSize: 20 }} />
            </IconButton>
        )}
        headerExtra={(
        <>
          <ClientProfileHero 
            client={client} 
            activitySummary={clientActivitySummary}
            totalExpenses={summary.totalExpenses}
            totalExpensesCount={clientExpenses.length}
            expenses={clientExpenses}
          />
          {/* Financial Alerts */}
          {canAccess('stats') && (summary.totalExpenses > summary.totalPaid || summary.remaining < 0) && (
            <Stack spacing={1.5} sx={{ mt: 3, mb: 1 }}>
              {summary.totalExpenses > summary.totalPaid && (
                <Alert 
                  severity="error" 
                  variant="filled"
                  icon={<TrendingDown fontSize="inherit" />}
                  sx={{ 
                    borderRadius: 2.5, 
                    fontWeight: 800, 
                    boxShadow: '0 4px 12px rgba(214, 69, 69, 0.25)',
                    bgcolor: '#d64545',
                    alignItems: 'center'
                  }}
                >
                  تنبيه دقيق: إجمالي المصروفات تجاوز قيمة المدفوعات!
                </Alert>
              )}
              
              {summary.remaining < 0 && (
                <Alert 
                  severity="warning" 
                  variant="filled"
                  sx={{ 
                    borderRadius: 2.5, 
                    fontWeight: 700, 
                    boxShadow: '0 4px 12px rgba(230, 168, 23, 0.25)',
                    bgcolor: '#e6a817',
                    color: '#2a3a2a',
                    alignItems: 'center',
                    '& .MuiAlert-icon': { color: '#2a3a2a' }
                  }}
                >
                  تنبيه: الرصيد الحالي بالسالب (يوجد عجز مالي بقيمة {formatCurrency(Math.abs(summary.remaining))})
                </Alert>
              )}
            </Stack>
          )}

          {depletedBalances.map(([userId, data]) => (
            <Alert 
              key={userId}
              severity="warning" 
              variant="filled"
              icon={<WarningAmber fontSize="inherit" />}
              sx={{ 
                mt: 1,
                mb: 2,
                borderRadius: 2.5, 
                fontWeight: 700, 
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                bgcolor: '#f59e0b',
                color: '#2a3a2a',
                alignItems: 'center',
                '& .MuiAlert-icon': { color: '#2a3a2a' }
              }}
            >
              تنبيه: لقد نفد الرصيد (العهدة) الخاص بالمستخدم "{data.name}". (المصروفات: {formatCurrency(data.spent)})
            </Alert>
          ))}

          {/* Financial Summary — لوحة واحدة أنيقة */}
          {canAccess('stats') && (
          <Box sx={{ mt: 2.5 }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(0,0,0,0.08) 100%)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '55%',
                  height: '100%',
                  background: 'radial-gradient(ellipse 80% 100% at 100% 0%, rgba(212, 197, 163, 0.1) 0%, transparent 55%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box sx={{ p: 2.25, position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.62rem' }}>
                      إجمالي المدفوعات
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#fff',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        mt: 0.5,
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        fontFamily: 'Outfit, sans-serif',
                        textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                      }}
                    >
                      {formatCurrency(summary.totalPaid)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      background: 'linear-gradient(140deg, #e4d5b8 0%, #9a8b72 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1a1f1a',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.35)',
                      flexShrink: 0,
                    }}
                  >
                    <Payment sx={{ fontSize: 30 }} />
                  </Box>
                </Stack>
              </Box>
              <Grid container sx={{ position: 'relative' }}>
                {[
                  { label: 'الربح', value: formatCurrency(summary.profit), sub: summary.profitPercentage > 0 ? `${summary.profitPercentage}%` : '—' },
                  { label: 'المصروفات', value: formatCurrency(summary.totalExpenses), sub: `${clientExpenses.length} سجل` },
                  { label: 'الديون', value: formatCurrency(summary.totalDebts), sub: `${clientDebts.length} بند` },
                  { label: 'المتبقي', value: formatCurrency(summary.remaining), sub: summary.remaining >= 0 ? 'رصيد' : 'عجز' },
                ].map((c, i) => (
                  <Grid
                    size={{ xs: 6 }}
                    key={c.label}
                    sx={{
                      borderInlineStart: i % 2 === 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      borderTop: i >= 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <Box sx={{ p: 1.75, height: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.6rem', letterSpacing: 0.6, display: 'block', mb: 0.4 }}>
                        {c.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{
                          color: c.label === 'المتبقي' && summary.remaining < 0 ? '#fda4a4' : '#fff',
                          fontSize: { xs: '0.8rem', sm: '0.88rem' },
                          fontFamily: 'Outfit, sans-serif',
                          lineHeight: 1.25,
                        }}
                      >
                        {c.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', mt: 0.25, display: 'block' }}>
                        {c.sub}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
          )}
        </>
        )}
        contentOffset={1}
      >
        <EtlalaSectionTitle title="الإجراءات" subtitle="فواتير، مصروفات، مدفوعات، عمال، عهود، وتقارير" />
        <Stack spacing={1.25} sx={{ mb: 5 }}>
          {menuItems.map((item, i) => (
            <Box
              key={i}
              component={motion.div}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.03 * i, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
            >
              <EtlalaAccentSurface accent={item.color} onClick={item.onClick}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={0}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.25,
                          bgcolor: item.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginLeft: '16px',
                          border: '1px solid',
                          borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
                          boxShadow: (t) => (t.palette.mode === 'light' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none'),
                        }}
                      >
                        <item.icon sx={{ fontSize: 24, color: item.color }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight={800} sx={{ fontSize: '0.95rem', letterSpacing: 0.12, lineHeight: 1.35 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem', opacity: 0.9 }}>
                          فتح
                        </Typography>
                      </Box>
                    </Stack>
                    <ChevronLeft sx={{ color: 'text.secondary', fontSize: 20, opacity: 0.4 }} />
                  </Stack>
                </CardContent>
              </EtlalaAccentSurface>
            </Box>
          ))}
        </Stack>
      </PageScaffold>

      {/* ===== EXPENSES — Swiss / ledger: زوايا 0، هيرو قصير، تجميع أيقونات 48px، صفوف متلاصقة ===== */}
      <Dialog
        open={expensesListOpen}
        onClose={() => setExpensesListOpen(false)}
        fullScreen
        sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        <Box sx={{ bgcolor: '#F7F7F5', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          {/* ── HEADER: 80px compact strip ── */}
          <ProfileListSessionHeader
            module="expenses"
            title="المصروفات"
            onBack={() => setExpensesListOpen(false)}
            headerGradient="linear-gradient(135deg, #2F3E34 0%, #1A2218 100%)"
            compact
            squareBottom
            strip
            endAdornment={(
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <IconButton
                  onClick={handleDownloadExpenses}
                  disabled={pdfLoading}
                  sx={{ width: 36, height: 36, color: alpha('#fff', 0.9), bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }, transition: 'all 0.2s' }}
                >
                  {pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdf sx={{ fontSize: 18 }} />}
                </IconButton>
                <IconButton
                  onClick={handleShareExpenses}
                  disabled={pdfLoading}
                  sx={{ width: 36, height: 36, color: alpha('#fff', 0.9), bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }, transition: 'all 0.2s' }}
                >
                  <Share sx={{ fontSize: 18 }} />
                </IconButton>
                <Box sx={{ width: '1px', height: 22, bgcolor: alpha('#fff', 0.2), mx: 0.5 }} />
                <IconButton
                  onClick={() => { setEditingExpense(null); resetExp(); setExpenseDialogOpen(true); }}
                  sx={{
                    width: 38, height: 38,
                    color: '#2F3E34',
                    borderRadius: '10px',
                    bgcolor: '#C2B280',
                    boxShadow: '0 4px 12px rgba(194, 178, 128, 0.3)',
                    '&:hover': { bgcolor: '#d4c592', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(194, 178, 128, 0.4)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Add sx={{ fontSize: 22 }} />
                </IconButton>
              </Stack>
            )}
          />

          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#F7F7F5' }}>
            {/* ── SEARCH: slim sticky prompt style ── */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, px: 1.5, pt: 1.5, pb: 1, bgcolor: '#F7F7F5' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="اسأل أو ابحث عن مصروف..."
                value={expSearch}
                onChange={(e) => setExpSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ color: '#C2B280', fontSize: 18 }} /></InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: '20px',
                    height: 42,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    '& fieldset': { borderColor: 'rgba(47, 62, 52, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(47, 62, 52, 0.15)' },
                    '&.Mui-focused fieldset': { borderColor: '#C2B280', borderWidth: 1, boxShadow: '0 4px 16px rgba(194,178,128,0.15)' },
                  },
                  '& .MuiInputBase-input': { fontSize: '0.85rem', color: '#1F2521', px: 0.5 }
                }}
              />
            </Box>

            {/* ── SUMMARY STRIP: Clickable ── */}
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Box 
                onClick={() => setExpensesPerUserOpen(true)}
                sx={{ display: 'flex', bgcolor: '#fff', borderRadius: '12px', border: '1px solid rgba(47, 62, 52, 0.08)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderColor: 'rgba(194, 178, 128, 0.4)' }, '&:active': { transform: 'scale(0.98)' } }}
              >
                {[
                  { label: 'العدد', val: String(filteredExp.length) },
                  { label: 'الشهري', val: formatCurrency(summary.totalExpenses) },
                  { label: 'الإجمالي (مفصل)', val: formatCurrency(summary.totalExpenses), accent: true },
                ].map((s, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1, py: 1.25, textAlign: 'center',
                      borderRight: idx < 2 ? '1px solid rgba(47, 62, 52, 0.04)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <Typography sx={{ color: '#6B736E', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 0.5, mb: 0.25 }}>{s.label}</Typography>
                    <Typography sx={{ color: s.accent ? '#2F3E34' : '#1F2521', fontSize: '0.85rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                      {s.val}
                    </Typography>
                    {s.accent && <Box sx={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', bgcolor: '#C2B280' }} />}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── EXPENSE LIST: high-density rows ── */}
            <Box sx={{ px: 1.5, pb: 12 }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: '6px', border: '1px solid rgba(47, 62, 52, 0.05)', overflow: 'hidden' }}>
                {filteredExp.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Search sx={{ fontSize: 28, color: '#C2B280', mb: 1 }} />
                    <Typography sx={{ color: '#6B736E', fontSize: '0.8rem' }}>{expSearch ? 'لا نتائج' : 'لا توجد مصروفات بعد'}</Typography>
                  </Box>
                ) : (
                  filteredExp.map((exp, i) => {
                    /* ── Category icon resolver ── */
                    const cat = exp.category;
                    const iconSx = { fontSize: 17, color: '#2F3E34' } as const;
                    let CatIcon: React.ReactNode;
                    if (['concrete', 'rebar', 'masonry', 'insulation', 'excavation', 'site_prep', 'surveying'].includes(cat))
                      CatIcon = <Engineering sx={iconSx} />;
                    else if (['plumbing', 'electrical', 'hvac'].includes(cat))
                      CatIcon = <Build sx={iconSx} />;
                    else if (['flooring', 'painting', 'gypsum', 'woodwork', 'aluminum_glass', 'iron_work', 'plaster'].includes(cat))
                      CatIcon = <Description sx={iconSx} />;
                    else if (['materials', 'tools'].includes(cat))
                      CatIcon = <Storefront sx={iconSx} />;
                    else if (['labor', 'subcontractors'].includes(cat))
                      CatIcon = <Engineering sx={{ ...iconSx, color: '#C2B280' }} />;
                    else if (['equipment', 'maintenance'].includes(cat))
                      CatIcon = <PrecisionManufacturing sx={iconSx} />;
                    else if (['transport', 'disposal', 'fuel'].includes(cat))
                      CatIcon = <LocalShipping sx={iconSx} />;
                    else if (['permits', 'consulting', 'utilities', 'rent'].includes(cat))
                      CatIcon = <AccountBalanceWallet sx={iconSx} />;
                    else if (['hospitality'].includes(cat))
                      CatIcon = <Storefront sx={{ ...iconSx, color: '#C2B280' }} />;
                    else
                      CatIcon = <Category sx={iconSx} />;

                    const hasSecondary = exp.invoiceNumber || exp.createdBy;

                    return (
                      <Box
                        key={exp.id}
                        onClick={() => { setViewingExpense(exp); }}
                        component={motion.div}
                        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          px: 1.25,
                          py: '10px',
                          borderBottom: i < filteredExp.length - 1 ? '1px solid rgba(47, 62, 52, 0.04)' : 'none',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                          '&:active': { bgcolor: 'rgba(47, 62, 52, 0.03)' },
                        }}
                      >
                        {/* ▎ Category icon */}
                        <Box sx={{
                          width: 34, height: 34, borderRadius: '50%',
                          bgcolor: 'rgba(47, 62, 52, 0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, mt: '2px',
                        }}>
                          {CatIcon}
                        </Box>

                        {/* ▎ Center: title + meta */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{
                            color: '#1F2521', fontSize: '0.82rem', fontWeight: 700,
                            lineHeight: 1.35, mb: '2px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {exp.description}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: hasSecondary || exp.notes ? '3px' : 0 }}>
                            <Typography sx={{ color: '#6B736E', fontSize: '0.62rem', fontWeight: 500 }}>{formatDate(exp.date)}</Typography>
                            <Box sx={{ width: 2.5, height: 2.5, borderRadius: '50%', bgcolor: '#C2B280' }} />
                            <Typography sx={{ color: '#C2B280', fontSize: '0.62rem', fontWeight: 700 }}>{getCategoryLabel(exp.category)}</Typography>
                          </Stack>
                          {hasSecondary && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: exp.notes ? '3px' : 0 }}>
                              {exp.invoiceNumber && (
                                <Typography sx={{ color: '#9CA3A7', fontSize: '0.58rem', fontWeight: 600 }}>
                                  ف#{exp.invoiceNumber}
                                </Typography>
                              )}
                              {exp.createdBy && (
                                <Typography sx={{ color: '#9CA3A7', fontSize: '0.58rem', fontWeight: 600 }}>
                                  ← {exp.createdBy}
                                </Typography>
                              )}
                            </Stack>
                          )}
                          {exp.notes && (
                            <Typography sx={{
                              color: '#6B736E', fontSize: '0.6rem', fontWeight: 500,
                              lineHeight: 1.4,
                              bgcolor: 'rgba(194, 178, 128, 0.06)',
                              borderRight: '2px solid #C2B280',
                              px: 0.75, py: 0.35,
                              borderRadius: '0 4px 4px 0',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {exp.notes}
                            </Typography>
                          )}
                        </Box>

                        {/* ▎ Left: amount + actions */}
                        <Stack alignItems="flex-end" spacing={0.35} sx={{ flexShrink: 0, mt: '1px' }}>
                          <Typography sx={{
                            color: '#2F3E34', fontSize: '0.88rem', fontWeight: 900,
                            fontFamily: "'Outfit', sans-serif", lineHeight: 1.2,
                            letterSpacing: -0.3,
                          }}>
                            {formatCurrency(exp.amount)}
                          </Typography>
                          <Stack direction="row" spacing={0.25}>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setEditingExpense(exp); setExpVal('description', exp.description); setExpVal('amount', exp.amount); setExpVal('category', exp.category); setExpVal('date', exp.date); setExpVal('invoiceNumber', exp.invoiceNumber || ''); setExpVal('notes', exp.notes || ''); setExpVal('userId', exp.userId || ''); setExpenseDialogOpen(true); }}
                              sx={{ color: '#6B736E', p: 0.35, opacity: 0.5, '&:hover': { opacity: 1, bgcolor: 'rgba(47, 62, 52, 0.08)' } }}
                            >
                              <Edit sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setDeletingExpense(exp); }}
                              sx={{ color: '#d64545', p: 0.35, opacity: 0.5, '&:hover': { opacity: 1, bgcolor: 'rgba(214, 69, 69, 0.1)' } }}
                            >
                              <Delete sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* ===== PAYMENTS LIST DIALOG ===== */}
      <Dialog open={paymentsListOpen} onClose={() => setPaymentsListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ bgcolor: '#F7F7F5', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          {/* ── HEADER ── */}
          <ProfileListSessionHeader
            module="payments"
            title="المدفوعات"
            onBack={() => setPaymentsListOpen(false)}
            headerGradient="linear-gradient(135deg, #1A2218 0%, #2F3E34 100%)"
            compact
            squareBottom
            strip
            endAdornment={(
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <IconButton
                  onClick={handleDownloadPayments}
                  disabled={pdfLoading}
                  sx={{ width: 36, height: 36, color: alpha('#fff', 0.9), bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }, transition: 'all 0.2s' }}
                >
                  {pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdf sx={{ fontSize: 18 }} />}
                </IconButton>
                <IconButton
                  onClick={handleSharePayments}
                  disabled={pdfLoading}
                  sx={{ width: 36, height: 36, color: alpha('#fff', 0.9), bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }, transition: 'all 0.2s' }}
                >
                  <Share sx={{ fontSize: 18 }} />
                </IconButton>
                <Box sx={{ width: '1px', height: 22, bgcolor: alpha('#fff', 0.2), mx: 0.5 }} />
                <IconButton
                  onClick={() => { setEditingPayment(null); resetPay(); setPaymentDialogOpen(true); }}
                  sx={{
                    width: 38, height: 38,
                    color: '#2F3E34',
                    borderRadius: '10px',
                    bgcolor: '#C2B280',
                    boxShadow: '0 4px 12px rgba(194, 178, 128, 0.3)',
                    '&:hover': { bgcolor: '#d4c592', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(194, 178, 128, 0.4)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Add sx={{ fontSize: 22 }} />
                </IconButton>
              </Stack>
            )}
          />

          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#F7F7F5' }}>
            {/* ── SEARCH ── */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, px: 1.5, pt: 1.5, pb: 1, bgcolor: '#F7F7F5' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="ابحث عن دفعة..."
                value={paySearch}
                onChange={(e) => setPaySearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ color: '#C2B280', fontSize: 18 }} /></InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: '20px',
                    height: 42,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    '& fieldset': { borderColor: 'rgba(47, 62, 52, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(47, 62, 52, 0.15)' },
                    '&.Mui-focused fieldset': { borderColor: '#C2B280', borderWidth: 1, boxShadow: '0 4px 16px rgba(194,178,128,0.15)' },
                  },
                  '& .MuiInputBase-input': { fontSize: '0.85rem', color: '#1F2521', px: 0.5 }
                }}
              />
            </Box>

            {/* ── SUMMARY STRIP ── */}
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Box 
                sx={{ display: 'flex', bgcolor: '#fff', borderRadius: '12px', border: '1px solid rgba(47, 62, 52, 0.08)', overflow: 'hidden' }}
              >
                {[
                  { label: 'العدد', val: String(filteredPay.length) },
                  { label: 'الإجمالي المقبوض', val: formatCurrency(summary.totalPaid), accent: true },
                ].map((s, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1, py: 1.25, textAlign: 'center',
                      borderRight: idx === 0 ? '1px solid rgba(47, 62, 52, 0.04)' : 'none',
                    }}
                  >
                    <Typography sx={{ color: '#6B736E', fontSize: '0.6rem', fontWeight: 700, letterSpacing: 0.5, mb: 0.25 }}>{s.label}</Typography>
                    <Typography sx={{ color: s.accent ? '#0d9668' : '#1F2521', fontSize: '0.85rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                      {s.val}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── PAYMENTS LIST ── */}
            <Box sx={{ px: 1.5, pb: 12 }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: '6px', border: '1px solid rgba(47, 62, 52, 0.05)', overflow: 'hidden' }}>
                {filteredPay.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Search sx={{ fontSize: 28, color: '#C2B280', mb: 1 }} />
                    <Typography sx={{ color: '#6B736E', fontSize: '0.8rem' }}>{paySearch ? 'لا نتائج' : 'لا توجد مدفوعات'}</Typography>
                  </Box>
                ) : (
                  filteredPay.map((pay, i) => {
                    const methodLabels: Record<string, string> = {
                      cash: 'نقدي', bank_transfer: 'تحويل بنكي', check: 'شيك', credit_card: 'بطاقة'
                    };
                    const methodLabel = methodLabels[pay.paymentMethod] || pay.paymentMethod;
                    
                    return (
                      <Box
                        key={pay.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.25,
                          px: 1.5,
                          py: '10px',
                          borderBottom: i < filteredPay.length - 1 ? '1px solid rgba(47, 62, 52, 0.04)' : 'none',
                          transition: 'background 0.15s',
                          '&:active': { bgcolor: 'rgba(47, 62, 52, 0.03)' },
                        }}
                      >
                        <Box sx={{
                          width: 34, height: 34, borderRadius: '50%',
                          bgcolor: 'rgba(13, 150, 104, 0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, mt: '2px', color: '#0d9668'
                        }}>
                          <Payment sx={{ fontSize: 17 }} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{
                            color: '#1F2521', fontSize: '0.82rem', fontWeight: 700,
                            lineHeight: 1.35, mb: '2px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {methodLabel} {pay.notes ? `- ${pay.notes}` : ''}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: pay.createdBy ? '3px' : 0 }}>
                            <Typography sx={{ color: '#6B736E', fontSize: '0.62rem', fontWeight: 500 }}>{formatDate(pay.paymentDate)}</Typography>
                          </Stack>
                          {pay.createdBy && (
                            <Typography sx={{ color: '#9CA3A7', fontSize: '0.58rem', fontWeight: 600 }}>
                              ← {pay.createdBy}
                            </Typography>
                          )}
                        </Box>

                        <Stack alignItems="flex-end" spacing={0} sx={{ flexShrink: 0, mt: '1px' }}>
                          <Typography sx={{
                            color: '#0d9668', fontSize: '0.88rem', fontWeight: 900,
                            fontFamily: "'Outfit', sans-serif", lineHeight: 1.2,
                            letterSpacing: -0.3,
                          }}>
                            {formatCurrency(pay.amount)}
                          </Typography>
                          <Stack direction="row" spacing={0.25} sx={{ mt: 0.25 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setEditingPayment(pay); setPayVal('amount', pay.amount); setPayVal('paymentMethod', pay.paymentMethod as any); setPayVal('paymentDate', pay.paymentDate); setPayVal('notes', pay.notes || ''); setPaymentDialogOpen(true); }}
                              sx={{ color: '#6B736E', p: 0.35, opacity: 0.5, '&:hover': { opacity: 1, bgcolor: 'rgba(47, 62, 52, 0.08)' } }}
                            >
                              <Edit sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); if(window.confirm('حذف؟')) deletePayment(pay.id).then(()=>msg('تم الحذف')); }}
                              sx={{ color: '#d64545', p: 0.35, opacity: 0.5, '&:hover': { opacity: 1, bgcolor: 'rgba(214, 69, 69, 0.1)' } }}
                            >
                              <Delete sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* ===== DEBTS LIST DIALOG ===== */}
      <Dialog open={debtsListOpen} onClose={() => setDebtsListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <ProfileSessionListShell module="debts">
          <ProfileListSessionHeader
            module="debts"
            title="الديون"
            subtitle="التزامات على المشروع"
            onBack={() => setDebtsListOpen(false)}
            headerGradient={headerGradient}
            endAdornment={(
              <Stack direction="row" alignItems="center" spacing={0} sx={{ border: `1px solid ${alpha('#fff', 0.15)}`, bgcolor: 'rgba(0,0,0,0.1)' }}>
                <IconButton
                  onClick={() => { setEditingDebt(null); resetDebt(); setDebtDialogOpen(true); }}
                  aria-label="دين جديد"
                  sx={{
                    width: 40, height: 40, minWidth: 40,
                    color: '#fff',
                    borderRadius: 0,
                    border: 'none',
                    bgcolor: alpha('#C2B280', 0.15),
                    '&:hover': { bgcolor: alpha('#C2B280', 0.25) },
                  }}
                >
                  <Add sx={{ fontSize: 24 }} />
                </IconButton>
                <Divider flexItem orientation="vertical" sx={{ borderColor: alpha('#fff', 0.1), height: 24, alignSelf: 'center' }} />
                <IconButton
                  onClick={handleShareDebts}
                  disabled={pdfLoading}
                  aria-label="مشاركة"
                  sx={{
                    width: 40, height: 40, minWidth: 40,
                    color: '#fff',
                    borderRadius: 0,
                    border: 'none',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: alpha('#fff', 0.1) },
                  }}
                >
                  <Share sx={{ fontSize: 20 }} />
                </IconButton>
                <Divider flexItem orientation="vertical" sx={{ borderColor: alpha('#fff', 0.1), height: 24, alignSelf: 'center' }} />
                <IconButton
                  onClick={handleDownloadDebts}
                  disabled={pdfLoading}
                  aria-label="تحميل PDF"
                  sx={{
                    width: 40, height: 40, minWidth: 40,
                    color: '#fff',
                    borderRadius: 0,
                    border: 'none',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: alpha('#fff', 0.1) },
                  }}
                >
                  {pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf sx={{ fontSize: 20 }} />}
                </IconButton>
              </Stack>
            )}
          />
          <ProfileSessionScroll>
            {clientDebts.length === 0 ? (
              <EtlalaEmptyState icon={<CreditCard />} title="لا توجد ديون" hint="سجّل ديناً من الزر أعلاه" />
            ) : (
              <Stack spacing={1.1}>
                {clientDebts.map((debt, i) => (
                  <ProfileSessionRecordListItem key={debt.id} accent={PROFILE_MODULE.debts.listAccent} index={i}>
                    <ProfileSessionRecordCardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={800} sx={{ fontSize: '0.95rem' }}>{debt.partyName}</Typography>
                          {debt.description ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.4, fontSize: '0.8rem' }}>{debt.description}</Typography>
                          ) : null}
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mt: 1.25, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.6rem' }}>الإجمالي</Typography>
                              <Typography display="block" fontWeight={800} fontSize="0.82rem" sx={{ fontFamily: "'Outfit', sans-serif", mt: 0.2 }}>{formatCurrency(debt.amount)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.6rem' }}>المدفوع</Typography>
                              <Typography display="block" fontWeight={800} color="success.main" fontSize="0.82rem" sx={{ fontFamily: "'Outfit', sans-serif", mt: 0.2 }}>{formatCurrency(debt.paidAmount)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.6rem' }}>المتبقي</Typography>
                              <Typography display="block" fontWeight={800} color="error.main" fontSize="0.82rem" sx={{ fontFamily: "'Outfit', sans-serif", mt: 0.2 }}>{formatCurrency(debt.remainingAmount)}</Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.75}>
                          <IconButton size="small" sx={{ borderRadius: 2, p: 0.75, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(47, 62, 52, 0.06)', '&:hover': { bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(47, 62, 52, 0.1)' } }} onClick={() => { setEditingDebt(debt); setDebtVal('partyName', debt.partyName); setDebtVal('description', debt.description); setDebtVal('amount', debt.amount); setDebtVal('date', debt.date); setDebtVal('notes', debt.notes || ''); setDebtDialogOpen(true); }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" sx={{ borderRadius: 2, p: 0.75, color: 'error.main', bgcolor: 'rgba(214, 69, 69, 0.08)', '&:hover': { bgcolor: 'rgba(214, 69, 69, 0.15)' } }} onClick={() => { if (window.confirm('حذف؟')) deleteStandaloneDebt(debt.id).then(() => msg('تم الحذف')); }}><Delete sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                      </Stack>
                    </ProfileSessionRecordCardContent>
                  </ProfileSessionRecordListItem>
                ))}
              </Stack>
            )}
            {clientDebts.length > 0 && (
              <ProfileSessionTotalBar
                module="debts"
                label="إجمالي الديون المستحقة (متبقي)"
                amount={formatCurrency(clientDebts.reduce((s, d) => s + d.remainingAmount, 0))}
                tone="default"
              />
            )}
          </ProfileSessionScroll>
        </ProfileSessionListShell>
      </Dialog>
      {/* ===== EXPENSES PER USER DIALOG ===== */}
      <Dialog
        open={expensesPerUserOpen}
        onClose={() => setExpensesPerUserOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#F7F7F5' } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: '#2F3E34', pb: 1 }}>
          إجمالي المصروفات لكل مستخدم
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {(() => {
              const totals: Record<string, number> = {};
              const names: Record<string, string> = {};
              filteredExp.forEach(e => {
                const uId = e.userId || 'unknown';
                if (!totals[uId]) { totals[uId] = 0; names[uId] = e.createdBy || 'غير محدد'; }
                totals[uId] += e.amount;
              });
              const stats = Object.entries(totals).map(([id, amount]) => ({ id, name: names[id], amount })).sort((a,b)=>b.amount-a.amount);
              
              if (stats.length === 0) return <Typography textAlign="center" color="#6B736E" py={2}>لا توجد بيانات</Typography>;
              
              return stats.map(s => (
                <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 1.5, borderRadius: 2, border: '1px solid rgba(47,62,52,0.06)' }}>
                   <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(194,178,128,0.15)', color: '#C2B280', fontSize: '1rem', fontWeight: 700 }}>
                        {s.name.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, color: '#1F2521', fontSize: '0.9rem' }}>{s.name}</Typography>
                   </Stack>
                   <Typography sx={{ fontWeight: 900, color: '#2F3E34', fontFamily: "'Outfit', sans-serif" }}>
                      {formatCurrency(s.amount)}
                   </Typography>
                </Box>
              ));
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button fullWidth variant="contained" onClick={() => setExpensesPerUserOpen(false)} sx={{ borderRadius: 2.5, bgcolor: '#2F3E34', '&:hover': { bgcolor: '#1A2218' }, py: 1, fontWeight: 700 }}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== ADD/EDIT EXPENSE DIALOG ===== */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleExpSubmit(onSubmitExpense)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setExpenseDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف'}</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              {currentUserBalanceInfo && (
                <Box sx={{ p: 2, borderRadius: 3, background: currentUserBalanceInfo.remaining >= 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'linear-gradient(135deg, rgba(225,29,72,0.1) 0%, rgba(225,29,72,0.05) 100%)', border: `1px solid ${currentUserBalanceInfo.remaining >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(225,29,72,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <Box>
                     <Typography variant="caption" sx={{ color: currentUserBalanceInfo.remaining >= 0 ? '#0d9668' : '#f87171', fontWeight: 800 }}>
                       {currentUserBalanceInfo.remaining >= 0 ? `الرصيد المتاح للعهدة (${user?.displayName || currentUserBalanceInfo.name})` : `عجز عهدة (${user?.displayName || currentUserBalanceInfo.name})`}
                     </Typography>
                     <Typography variant="h6" sx={{ color: currentUserBalanceInfo.remaining >= 0 ? '#0d9668' : '#f87171', fontWeight: 900, lineHeight: 1, mt: 0.5 }}>
                       {currentUserBalanceInfo.remaining < 0 ? `-${formatCurrency(Math.abs(currentUserBalanceInfo.remaining))}` : formatCurrency(currentUserBalanceInfo.remaining)}
                     </Typography>
                   </Box>
                   <AccountBalanceWallet sx={{ fontSize: 32, color: currentUserBalanceInfo.remaining >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(225,29,72,0.5)' }} />
                </Box>
              )}
              
              <Controller name="description" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="الوصف" InputProps={{ startAdornment: <InputAdornment position="start" sx={{ ml: 1, mr: 1.5 }}><NoteAlt sx={{ color: '#4a5d4a' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="amount" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="المبلغ" type="number" InputProps={{ startAdornment: <InputAdornment position="start" sx={{ ml: 1, mr: 1.5 }}><Payment sx={{ color: '#4a5d4a' }} /></InputAdornment>, endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="category" control={expCtrl} render={({ field }) => <FormControl fullWidth><InputLabel>التصنيف</InputLabel><Select {...field} label="التصنيف" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>{Object.entries(expenseCategories).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl>} />
              <Controller name="invoiceNumber" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="رقم الفاتورة (اختياري)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="workerId" control={expCtrl} render={({ field }) => <FormControl fullWidth><InputLabel>العامل (اختياري)</InputLabel><Select {...field} label="العامل (اختياري)" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}><MenuItem value=""><em>لا يوجد</em></MenuItem>{workers.filter(w=>w.clientId===clientId).map(w=><MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>} />
              <Controller name="date" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="التاريخ" type="date" InputProps={{ startAdornment: <InputAdornment position="start" sx={{ ml: 1, mr: 1.5 }}><CalendarToday sx={{ color: '#4a5d4a' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="notes" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="ملاحظات" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              {editingExpense ? (
                <>
                  <IconButton 
                    onClick={() => { if(window.confirm('حذف هذا المصروف؟')) { deleteExpense(editingExpense.id).then(() => { setExpenseDialogOpen(false); msg('تم الحذف'); }); } }} 
                    sx={{ bgcolor: 'rgba(225,29,72,0.1)', color: '#e11d48', borderRadius: 2.5, width: 56, height: 56, '&:hover': { bgcolor: 'rgba(225,29,72,0.2)' } }}
                  >
                    <Delete />
                  </IconButton>
                  <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>تحديث وحفظ</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setExpenseDialogOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
                  <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ وإصدار</Button>
                </>
              )}
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== ADD/EDIT PAYMENT DIALOG ===== */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handlePaySubmit(onSubmitPayment)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setPaymentDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>{editingPayment ? 'تعديل دفعة' : 'إضافة دفعة'}</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="amount" control={payCtrl} render={({ field }) => <TextField {...field} fullWidth label="المبلغ" type="number" InputProps={{ endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="paymentMethod" control={payCtrl} render={({ field }) => <FormControl fullWidth><InputLabel>طريقة الدفع</InputLabel><Select {...field} label="طريقة الدفع" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}><MenuItem value="cash">نقدي</MenuItem><MenuItem value="bank_transfer">تحويل بنكي</MenuItem><MenuItem value="check">شيك</MenuItem><MenuItem value="credit_card">بطاقة</MenuItem></Select></FormControl>} />
              <Controller name="paymentDate" control={payCtrl} render={({ field }) => <TextField {...field} fullWidth label="التاريخ" type="date" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="notes" control={payCtrl} render={({ field }) => <TextField {...field} fullWidth label="ملاحظات" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setPaymentDialogOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ</Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== ADD/EDIT DEBT DIALOG ===== */}
      <Dialog open={debtDialogOpen} onClose={() => setDebtDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleDebtSubmit(onSubmitDebt)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setDebtDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>{editingDebt ? 'تعديل دين' : 'إضافة دين'}</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="partyName" control={debtCtrl} render={({ field }) => <TextField {...field} fullWidth label="اسم الطرف" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="description" control={debtCtrl} render={({ field }) => <TextField {...field} fullWidth label="وصف الدين" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="amount" control={debtCtrl} render={({ field }) => <TextField {...field} fullWidth label="المبلغ" type="number" InputProps={{ endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="date" control={debtCtrl} render={({ field }) => <TextField {...field} fullWidth label="التاريخ" type="date" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="notes" control={debtCtrl} render={({ field }) => <TextField {...field} fullWidth label="ملاحظات" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setDebtDialogOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ</Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== PROFIT DIALOG ===== */}
      <Dialog open={profitDialogOpen} onClose={() => setProfitDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 20, padding: 16 } }}>
        <Typography variant="h6" fontWeight={800} mb={2}>حساب الأرباح</Typography>
        <Stack spacing={2}>
          <TextField fullWidth label="نسبة الربح (%)" type="number" value={profitPercentage} onChange={(e) => setProfitPercentage(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          {summary.profit > 0 && <Alert severity="info" sx={{ borderRadius: 2 }}>الربح الحالي: {formatCurrency(summary.profit)}</Alert>}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button fullWidth onClick={() => setProfitDialogOpen(false)} sx={{ borderRadius: 2.5 }}>إلغاء</Button>
          <Button fullWidth variant="contained" onClick={handleSaveProfit} sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ النسبة</Button>
        </Stack>
      </Dialog>

      {/* ===== EDIT CLIENT DIALOG ===== */}
      <Dialog open={editClientOpen} onClose={() => setEditClientOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleClientSubmit(onSubmitClient)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setEditClientOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>تعديل بيانات العميل</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="name" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="الاسم" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="type" control={clientControl} render={({ field }) => <FormControl fullWidth><InputLabel>النوع</InputLabel><Select {...field} label="النوع" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}><MenuItem value="individual">فرد</MenuItem><MenuItem value="company">شركة</MenuItem></Select></FormControl>} />
              <Controller name="phone" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="الهاتف" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="address" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="العنوان" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setEditClientOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ</Button>
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Button fullWidth variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteClient} sx={{ borderRadius: 2.5 }}>حذف العميل</Button>
          </Box>
        </form>
      </Dialog>

      {/* Snackbar */}

      {/* ===== WORKERS LIST DIALOG ===== */}
      <Dialog open={workersListOpen} onClose={() => setWorkersListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <ProfileSessionListShell module="workers">
        <ProfileListSessionHeader
          module="workers"
          title="سجل العمال"
          subtitle="فريق المشروع والمقاولون"
          onBack={() => setWorkersListOpen(false)}
          headerGradient={headerGradient}
          primaryAction={(
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<Add />}
              onClick={() => { setEditingWorker(null); resetWork({ name: '', jobType: '', totalAmount: '' as any }); setWorkerDialogOpen(true); }}
              sx={{ ...profileHeroPrimaryButtonSx, color: '#fff', '& .MuiButton-startIcon': { color: '#fff' } }}
            >
              إضافة
            </Button>
          )}
          pdfRow={(
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ width: 1 }}>
              <Button
                size="medium"
                startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdf />}
                onClick={handleDownloadWorkers}
                disabled={pdfLoading}
                sx={profileHeroPdfButtonSx}
              >
                تحميل PDF
              </Button>
              <Button
                size="medium"
                startIcon={<Share />}
                onClick={handleShareWorkers}
                disabled={pdfLoading}
                sx={profileHeroPdfButtonSx}
              >
                مشاركة
              </Button>
            </Stack>
          )}
        />
        {clientWorkers.length > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background:
                theme.palette.mode === 'dark'
                  ? `linear-gradient(180deg, ${alpha(PROFILE_MODULE.workers.listAccent, 0.08)} 0%, rgba(0,0,0,0.12) 100%)`
                  : `linear-gradient(180deg, ${alpha(PROFILE_MODULE.workers.listAccent, 0.07)} 0%, rgba(255,255,255,0.85) 100%)`,
            }}
          >
            <Container maxWidth="sm" disableGutters>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25 }}>
                {[
                  { label: 'الاتفاقيات', value: formatCurrency(clientWorkers.reduce((s, w) => s + w.totalAmount, 0)), color: theme.palette.mode === 'dark' ? '#c8c0b0' : '#4a5d4a' },
                  { label: 'المدفوع', value: formatCurrency(clientWorkers.reduce((s, w) => s + w.paidAmount, 0)), color: '#0d9668' },
                  { label: 'المتبقي', value: formatCurrency(clientWorkers.reduce((s, w) => s + w.remainingAmount, 0)), color: '#d64545' },
                ].map((s, i) => (
                  <Box
                    key={i}
                    sx={{
                      textAlign: 'center',
                      py: 1.15,
                      px: 0.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (t) => alpha(PROFILE_MODULE.workers.listAccent, t.palette.mode === 'dark' ? 0.22 : 0.14),
                      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#fff', 0.6)),
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.58rem', display: 'block', mb: 0.4 }}>{s.label}</Typography>
                    <Typography sx={{ color: s.color, fontSize: '0.78rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{s.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* ── Content below header ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 4, pt: 2 }}>
          <Container maxWidth="sm">
            {clientWorkers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: (t) => (t.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#fff', 0.7)), border: '1px solid', borderColor: (t) => alpha(PROFILE_MODULE.workers.listAccent, t.palette.mode === 'dark' ? 0.2 : 0.15), borderRadius: 2.5, mt: 1, boxShadow: (t) => (t.palette.mode === 'light' ? '0 1px 0 rgba(255,255,255,0.9) inset' : 'none') }}>
                <PersonAdd sx={{ fontSize: 64, color: alpha('#4a5d4a', 0.2), mb: 2 }} />
                <Typography variant="h6" fontWeight={800} color="text.secondary">لا يوجد عمال بعد</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>اضغط على زر الإضافة لتسجيل عمال المشروع</Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {clientWorkers.map((worker) => {
                  const pct = worker.totalAmount > 0 ? Math.min(100, (worker.paidAmount / worker.totalAmount) * 100) : 0;
                  const done = worker.remainingAmount <= 0;
                  return (
                    <Box key={worker.id} sx={{
                      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#fff', 0.85)),
                      overflow: 'hidden', border: '1px solid', borderColor: (t) => alpha(PROFILE_MODULE.workers.listAccent, t.palette.mode === 'dark' ? 0.2 : 0.14),
                      borderBottom: 'none',
                      boxShadow: (t) => (t.palette.mode === 'light' ? '0 1px 0 rgba(255,255,255,0.85) inset' : 'none'),
                      '&:first-of-type': { borderRadius: '12px 12px 0 0' },
                      '&:last-of-type': { borderBottom: '1px solid', borderColor: (t) => alpha(PROFILE_MODULE.workers.listAccent, t.palette.mode === 'dark' ? 0.2 : 0.14), borderRadius: '0 0 12px 12px' },
                      '&:only-child': { borderRadius: '12px' },
                    }}>
                      {/* Color strip top */}
                      <Box sx={{ height: 3, background: done ? 'linear-gradient(90deg,#0d9668,#34d399)' : `linear-gradient(90deg, ${PROFILE_MODULE.workers.listAccent}, ${alpha(PROFILE_MODULE.workers.listAccent, 0.5)})` }} />

                      {/* Worker info row */}
                      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 50, height: 50, borderRadius: '14px', flexShrink: 0,
                          background: done
                            ? 'linear-gradient(135deg,rgba(13,150,104,0.15),rgba(13,150,104,0.05))'
                            : 'linear-gradient(135deg,rgba(201,165,78,0.15),rgba(201,165,78,0.05))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${done ? 'rgba(13,150,104,0.25)' : 'rgba(201,165,78,0.3)'}`,
                        }}>
                          <Typography fontWeight={900} sx={{ fontSize: '1.2rem', color: done ? '#0d9668' : '#c9a54e' }}>
                            {worker.name.charAt(0)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={800} noWrap sx={{ fontSize: '0.97rem' }}>{worker.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#4a5d4a', fontWeight: 600 }}>
                            {worker.jobType || 'عامل / مقاول'}
                          </Typography>
                        </Box>
                        <Chip
                          label={done ? '✓ مكتمل' : 'جارٍ'}
                          size="small"
                          sx={{
                            height: 22, fontSize: '0.62rem', fontWeight: 700, borderRadius: '8px',
                            bgcolor: done ? 'rgba(13,150,104,0.1)' : 'rgba(201,165,78,0.1)',
                            color: done ? '#0d9668' : '#c9a54e',
                            border: `1px solid ${done ? 'rgba(13,150,104,0.2)' : 'rgba(201,165,78,0.2)'}`,
                          }}
                        />
                      </Box>

                      {/* Progress bar */}
                      <Box sx={{ px: 2.5, pb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                          <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', fontWeight: 600 }}>نسبة الإنجاز</Typography>
                          <Typography sx={{ fontSize: '0.62rem', color: done ? '#0d9668' : '#c9a54e', fontWeight: 800 }}>{Math.round(pct)}%</Typography>
                        </Box>
                        <Box sx={{ height: 5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: done ? 'linear-gradient(90deg,#0d9668,#34d399)' : 'linear-gradient(90deg,#c9a54e,#e8c87a)', transition: 'width 0.5s ease' }} />
                        </Box>
                      </Box>

                      {/* Stats */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid', borderColor: 'divider' }}>
                        {[
                          { label: 'الاتفاق', value: worker.totalAmount, color: 'text.primary' },
                          { label: 'المدفوع', value: worker.paidAmount, color: '#0d9668' },
                          { label: 'المتبقي', value: worker.remainingAmount, color: worker.remainingAmount > 0 ? '#d64545' : '#0d9668' },
                        ].map((stat, idx) => (
                          <Box key={idx} sx={{ py: 1.5, textAlign: 'center', borderRight: idx < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.3, fontSize: '0.6rem' }}>{stat.label}</Typography>
                            <Typography variant="body2" fontWeight={900} sx={{ color: stat.color, fontSize: '0.8rem' }}>{formatCurrency(stat.value)}</Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                        <Button
                          fullWidth variant="contained"
                          startIcon={<Payment sx={{ fontSize: '18px !important' }} />}
                          onClick={() => { resetExp({ description: `دفعة حساب: ${worker.name}`, amount: '' as any, category: 'labor', date: dayjs().format('YYYY-MM-DD'), notes: '', workerId: worker.id }); setEditingExpense(null); setExpenseDialogOpen(true); }}
                          sx={{ py: 1, borderRadius: 2, fontWeight: 800, bgcolor: 'rgba(13,150,104,0.1)', color: '#0d9668', boxShadow: 'none', fontSize: '0.85rem', flex: 1, gap: 0.5, '&:hover': { bgcolor: 'rgba(13,150,104,0.15)', boxShadow: 'none' } }}
                        >
                          صرف دفعة
                        </Button>
                        <IconButton
                          onClick={() => { setEditingWorker(worker); setWorkVal('name', worker.name); setWorkVal('jobType', worker.jobType || ''); setWorkVal('totalAmount', worker.totalAmount); setWorkerDialogOpen(true); }}
                          sx={{ borderRadius: 2, width: 42, height: 42, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(47, 62, 52, 0.06)', color: 'text.secondary', '&:hover': { bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(47, 62, 52, 0.1)' } }}
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          onClick={() => { if (window.confirm('هل تريد حذف هذا العامل؟')) deleteWorker(worker.id).then(() => msg('تم الحذف')); }}
                          sx={{ borderRadius: 2, width: 42, height: 42, bgcolor: 'rgba(214,69,69,0.08)', color: 'error.main', '&:hover': { bgcolor: 'rgba(214,69,69,0.15)' } }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Container>
        </Box>
        </ProfileSessionListShell>
      </Dialog>

      {/* ===== ADD/EDIT WORKER DIALOG ===== */}
      <Dialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'background.default' } }}>
        <form onSubmit={handleWorkSubmit(onSubmitWorker)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* MD3 Top App Bar */}
          <Box sx={{ background: headerGradient, color: 'white', px: 1, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setWorkerDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{editingWorker ? 'تعديل بيانات العامل' : 'إضافة عامل / مقاول'}</Typography>
          </Box>
          {/* Flat Form - No Cards, No Radius */}
          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
            <Box sx={{ px: 0 }}>
              <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 2 }}>بيانات العامل</Typography>
              </Box>
              <Divider />
              <Stack divider={<Divider />}>
                <Controller name="name" control={workCtrl} render={({ field }) => (
                  <TextField {...field} fullWidth label="اسم العامل أو المقاول" variant="filled"
                    InputProps={{ disableUnderline: false, startAdornment: <InputAdornment position="start"><Person sx={{ color: '#4a5d4a', fontSize: 20 }} /></InputAdornment> }}
                    sx={{ '& .MuiFilledInput-root': { borderRadius: 0, bgcolor: 'background.paper', '&:hover': { bgcolor: alpha('#4a5d4a', 0.04) }, '&.Mui-focused': { bgcolor: alpha('#4a5d4a', 0.06) } }, '& .MuiInputLabel-root': { fontWeight: 600 } }}
                  />
                )} />
                <Controller name="jobType" control={workCtrl} render={({ field }) => (
                  <TextField {...field} fullWidth label="طبيعة العمل (بياض، كهرباء، مقاول...)" variant="filled"
                    InputProps={{ disableUnderline: false, startAdornment: <InputAdornment position="start"><Business sx={{ color: '#4a5d4a', fontSize: 20 }} /></InputAdornment> }}
                    sx={{ '& .MuiFilledInput-root': { borderRadius: 0, bgcolor: 'background.paper', '&:hover': { bgcolor: alpha('#4a5d4a', 0.04) }, '&.Mui-focused': { bgcolor: alpha('#4a5d4a', 0.06) } }, '& .MuiInputLabel-root': { fontWeight: 600 } }}
                  />
                )} />
                <Controller name="totalAmount" control={workCtrl} render={({ field: { value, onChange, ...rest } }) => (
                  <TextField {...rest} value={value === 0 && !editingWorker ? '' : value} onChange={e => { const val = e.target.value; onChange(val === '' ? '' : val); }}
                    fullWidth label="إجمالي المبلغ المتفق عليه" type="number" variant="filled"
                    InputProps={{ disableUnderline: false, startAdornment: <InputAdornment position="start"><AccountBalanceWallet sx={{ color: '#4a5d4a', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><Typography fontWeight={800} color="text.secondary" fontSize="0.85rem">د.ل</Typography></InputAdornment> }}
                    sx={{ '& .MuiFilledInput-root': { borderRadius: 0, bgcolor: 'background.paper', '&:hover': { bgcolor: alpha('#4a5d4a', 0.04) }, '&.Mui-focused': { bgcolor: alpha('#4a5d4a', 0.06) } }, '& .MuiInputLabel-root': { fontWeight: 600 } }}
                  />
                )} />
              </Stack>
            </Box>
          </Box>
          {/* Bottom Action Bar - MD3 style */}
          <Box sx={{ display: 'flex', gap: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Button onClick={() => setWorkerDialogOpen(false)} fullWidth size="large"
              sx={{ borderRadius: 0, fontWeight: 700, color: 'text.secondary', py: 2, fontSize: '1rem' }}>إلغاء</Button>
            <Divider orientation="vertical" flexItem />
            <Button type="submit" variant="contained" fullWidth size="large"
              sx={{ borderRadius: 0, fontWeight: 900, bgcolor: '#4a5d4a', color: '#fff', py: 2, fontSize: '1rem', boxShadow: 'none', '&:hover': { bgcolor: '#364036', boxShadow: 'none' } }}>
              {editingWorker ? 'حفظ التعديلات' : 'إضافة العامل'}
            </Button>
          </Box>
        </form>
      </Dialog>

      {/* ===== BALANCES LIST DIALOG ===== */}
      <Dialog open={balancesListOpen} onClose={() => setBalancesListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <ProfileSessionListShell module="balances">
        <ProfileListSessionHeader
          module="balances"
          title="أرصدة العميل (العهد)"
          subtitle="عهود مخصصة للمشروع"
          onBack={() => setBalancesListOpen(false)}
          headerGradient={
            theme.palette.mode === 'dark'
              ? 'radial-gradient(120% 120% at 50% 0%, #152219 0%, #0a110c 50%, #050806 100%)'
              : 'radial-gradient(120% 120% at 50% 0%, #213526 0%, #132217 50%, #0b140e 100%)'
          }
          primaryAction={(
            <IconButton
              onClick={() => { setEditingBalance(null); resetBal(); setBalanceDialogOpen(true); }}
              aria-label="إضافة عهدة"
              sx={profileHeroAddIconButtonSx}
            >
              <Add />
            </IconButton>
          )}
        />
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 4, pt: 2.5 }}>
          <Container maxWidth="sm">
            {/* Show User Summary Cards first */}
            {Object.entries(userBalancesSummary).length > 0 && (
              <Box sx={{ mb: {xs: 4, sm: 5} }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, px: 0.5, fontWeight: 900, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                  <TrendingUp sx={{ color: '#4a5d4a', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  ملخص الأرصدة والمصروفات المنفذة للمستخدمين:
                </Typography>
                <Grid container spacing={{xs: 1.5, sm: 2}}>
                  {Object.entries(userBalancesSummary).map(([uId, sum]) => (
                    <Grid size={{xs: 12}} key={uId}>
                      <Card sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 8, background: sum.remaining > 0 ? `linear-gradient(180deg, ${PROFILE_MODULE.balances.listAccent}, ${alpha(PROFILE_MODULE.balances.listAccent, 0.7)})` : 'linear-gradient(180deg, #d64545, #b83b3b)' }} />
                        <CardContent sx={{ p: {xs: 2.5, sm: 3}, pl: {xs: 3, sm: 4}, '&:last-child': { pb: {xs: 2.5, sm: 3} } }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: {xs: 2, sm: 2.5} }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                               <Avatar sx={{ width: {xs: 44, sm: 52}, height: {xs: 44, sm: 52}, bgcolor: alpha('#4a5d4a', 0.1), color: '#4a5d4a', fontSize: {xs: '1.1rem', sm: '1.3rem'}, fontWeight: 900, border: `2px solid ${alpha('#4a5d4a', 0.15)}`, flexShrink: 0 }}>
                                 {sum.name?.charAt(0) || 'م'}
                               </Avatar>
                               <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                                 <Typography fontWeight={900} noWrap sx={{ fontSize: {xs: '1rem', sm: '1.15rem'}, color: '#2a3a2a' }}>{sum.name}</Typography>
                                 <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 700, fontSize: {xs: '0.75rem', sm: '0.8rem'} }}>مكلف بالعهد والمصروفات</Typography>
                               </Box>
                            </Stack>
                            <Box sx={{ textAlign: 'left', background: sum.remaining > 0 ? alpha('#4a5d4a',0.04) : alpha('#d64545',0.04), px: {xs: 2, sm: 2.5}, py: {xs: 1, sm: 1.5}, borderRadius: 0, flexShrink: 0, ml: 1, border: `1px solid ${sum.remaining > 0 ? alpha('#4a5d4a',0.2) : alpha('#d64545',0.2)}` }}>
                               <Typography variant="caption" sx={{ color: sum.remaining > 0 ? '#4a5d4a' : '#d64545', fontWeight: 800, display: 'block', fontSize: {xs: '0.7rem', sm: '0.75rem'}, mb: 0.5 }}>الرصيد المتاح</Typography>
                               <Typography variant="body1" fontWeight={900} sx={{ color: sum.remaining > 0 ? '#4a5d4a' : '#d64545', fontSize: {xs: '1.1rem', sm: '1.3rem'} }}>{formatCurrency(sum.remaining)}</Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={0} sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                            <Box sx={{ flex: 1, p: 1.5, borderRight: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5, fontSize: {xs: '0.7rem', sm: '0.75rem'} }}>إجمالي العهدة الممنوحة</Typography>
                              <Typography variant="body2" fontWeight={900} noWrap sx={{ color: '#2a3a2a', fontSize: {xs: '0.9rem', sm: '1rem'} }}>{formatCurrency(sum.given)}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, p: 1.5 }}>
                              <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5, fontSize: {xs: '0.7rem', sm: '0.75rem'} }}>المنفذ بالمصروفات</Typography>
                              <Typography variant="body2" fontWeight={900} noWrap color="error.main" sx={{ fontSize: {xs: '0.9rem', sm: '1rem'} }}>{formatCurrency(sum.spent)}</Typography>
                            </Box>
                          </Stack>

                          {/* Beautiful Expenses Review for That User */}
                          <Button 
                            fullWidth onClick={() => setExpandedUserExpenses(expandedUserExpenses === uId ? null : uId)}
                            endIcon={expandedUserExpenses === uId ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            sx={{ borderRadius: 0, fontWeight: 800, color: '#4a5d4a', bgcolor: expandedUserExpenses === uId ? alpha('#4a5d4a',0.08) : 'transparent', '&:hover': { bgcolor: alpha('#4a5d4a',0.05) } }}
                          >
                            {expandedUserExpenses === uId ? 'إخفاء سجل المصروفات التفصيلي' : `مراجعة المصروفات المنفذة (${sum.expenses?.length || 0})`}
                          </Button>

                          <Collapse in={expandedUserExpenses === uId} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 2, borderTop: `1px dashed ${alpha('#000',0.1)}`, pt: 2 }}>
                              {sum.expenses?.length === 0 ? (
                                <Typography variant="body2" textAlign="center" color="text.secondary" py={2}>لم يقم هذا المستخدم بتسجيل أي مصروفات بعد.</Typography>
                              ) : (
                                <Stack spacing={1}>
                                  {sum.expenses?.map((e: any, idx: number) => (
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" key={e.id} sx={{ p: 1.5, bgcolor: alpha('#4a5d4a',0.03), borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                      <Box>
                                        <Typography variant="body2" fontWeight={800} color="#2a3a2a" noWrap>{e.description}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{formatDate(e.date)} • {getExpenseCategoryLabel(e.category)}</Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight={900} color="error.main">-{formatCurrency(e.amount)}</Typography>
                                    </Stack>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          </Collapse>

                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mb: {xs: 1.5, sm: 2}, px: 1, fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              <AccountBalanceWallet sx={{ color: '#4a5d4a', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              سجل الحركات (إيداعات الأرصدة):
            </Typography>
            {clientUserBalances.length === 0 ? (
              <Card sx={{ borderRadius: 3, textAlign: 'center', py: {xs: 5, sm: 8}, boxShadow: 'none', border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                 <Box sx={{ width: {xs: 60, sm: 80}, height: {xs: 60, sm: 80}, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(245,158,11,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                   <AccountBalanceWallet sx={{ fontSize: {xs: 32, sm: 40}, color: '#f59e0b', opacity: 0.5 }} />
                 </Box>
                 <Typography variant="h6" fontWeight={700} color="text.secondary" sx={{ fontSize: {xs: '1rem', sm: '1.25rem'} }}>لا توجد أرصدة مسجلة</Typography>
                 <Typography variant="body2" color="text.disabled" sx={{ mt: 1, maxWidth: 300, mx: 'auto', fontSize: {xs: '0.75rem', sm: '0.875rem'} }}>قم بالضغط على إضافة رصيد لمنح المستخدمين أرصدة للاستخدام في قسم المصروفات.</Typography>
              </Card>
            ) : (
              <Stack spacing={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>{clientUserBalances.map((bal, idx) => (
                <Box key={bal.id} sx={{ borderBottom: idx < clientUserBalances.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: alpha('#000', 0.02) } }}>
                  <Box sx={{ p: {xs: '16px', sm: '20px'} }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, pl: {xs: 1, sm: 2}, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: alpha('#4a5d4a',0.1), color: '#4a5d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${alpha('#4a5d4a',0.2)}` }}>
                            <Typography fontWeight={900} fontSize="0.75rem"># {clientUserBalances.length - clientUserBalances.indexOf(bal)}</Typography>
                          </Box>
                          <Avatar sx={{ width: {xs: 32, sm: 36}, height: {xs: 32, sm: 36}, bgcolor: '#f5f3ef', color: '#364036', flexShrink: 0 }}>
                            <Person sx={{ fontSize: {xs: 18, sm: 20} }} />
                          </Avatar>
                          <Typography fontWeight={800} noWrap sx={{ fontSize: {xs: '1rem', sm: '1.1rem'}, color: '#111827' }}>{bal.userName}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1, mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                           <Typography variant="body2" sx={{ color: '#4a5d4a', fontWeight: 900, bgcolor: alpha('#4a5d4a',0.08), px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: {xs: '0.8rem', sm: '0.9rem'} }}>
                             + {formatCurrency(bal.amount)} الرصيد المضاف
                           </Typography>
                           <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: {xs: '0.7rem', sm: '0.8rem'} }}>تاريخ الإضافة: {formatDate(bal.date)}</Typography>
                        </Stack>
                        {bal.notes && <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, bgcolor: alpha('#c8c0b0',0.15), p: 1.5, borderRadius: 2, fontSize: {xs: '0.7rem', sm: '0.8rem'}, fontWeight: 600 }}>{bal.notes}</Typography>}
                        {bal.createdBy && <Typography variant="caption" display="block" sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, fontSize: {xs: '0.65rem', sm: '0.75rem'} }}>بواسطة: {bal.createdBy}</Typography>}
                      </Box>
                      <Stack spacing={0.5} sx={{ flexShrink: 0 }}>
                        <IconButton size="small" onClick={() => { setEditingBalance(bal); setBalVal('userId', bal.userId); setBalVal('amount', bal.amount); setBalVal('date', bal.date); setBalVal('notes', bal.notes || ''); setBalanceDialogOpen(true); }} sx={{ bgcolor: alpha('#4a5d4a', 0.05), color: '#4a5d4a', '&:hover': { bgcolor: alpha('#4a5d4a', 0.15) } }}><Edit sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" onClick={() => { if (window.confirm('هل أنت متأكد من حذف حركة الرصيد هذه؟')) deleteUserBalance(bal.id).then(() => msg('تم الحذف')); }} sx={{ bgcolor: 'rgba(214,69,69,0.05)', color: '#d64545', '&:hover': { bgcolor: 'rgba(214,69,69,0.15)' } }}><Delete sx={{ fontSize: 18 }} /></IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}</Stack>
            )}
          </Container>
        </Box>
        </ProfileSessionListShell>
      </Dialog>

      {/* ===== ADD/EDIT BALANCE DIALOG (MOBILE OPTIMIZED) ===== */}
      <Dialog open={balanceDialogOpen} onClose={() => setBalanceDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#0a0e14' : '#f0f2f5' } }}>
        <form onSubmit={handleBalSubmit(onSubmitBalance)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <Box sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'radial-gradient(120% 120% at 50% 0%, #152219 0%, #0a110c 50%, #050806 100%)' 
              : 'radial-gradient(120% 120% at 50% 0%, #213526 0%, #132217 50%, #0b140e 100%)', 
            pt: 'calc(env(safe-area-inset-top) + 24px)', pb: 4, px: 2, position: 'relative', overflow: 'hidden'
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <IconButton onClick={() => setBalanceDialogOpen(false)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', '&:active': { transform: 'scale(0.95)' } }}>
                <ArrowBack fontSize="small" />
              </IconButton>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.2px' }}>
                  {editingBalance ? 'تعديل رصيد العهدة' : 'إضافة عهدة للمشروع'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 500 }}>
                  يرجى تحديد الموظف وإدخال تفاصيل الدفعة المالية
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, mt: -2, bgcolor: theme.palette.mode === 'dark' ? '#0a0e14' : '#f0f2f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, zIndex: 2 }}>
            <Stack spacing={3}>
              
              <Controller name="userId" control={balCtrl} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 700 }}>الموظف / المستلم</InputLabel>
                  <Select {...field} label="الموظف / المستلم" sx={{ borderRadius: 3, bgcolor: 'background.paper', '& .MuiSelect-select': { py: 2 } }}>
                    {systemUsers.map(u => (
                       <MenuItem key={u.id} value={u.uid || u.id} sx={{ fontWeight: 600 }}>
                         <Stack direction="row" alignItems="center" spacing={1.5}>
                           <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'rgba(74,93,74,0.1)', color: '#4a5d4a' }}>{u.displayName?.charAt(0)}</Avatar>
                           <Typography>{u.displayName}</Typography>
                         </Stack>
                       </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />

              <Controller name="amount" control={balCtrl} render={({ field }) => (
                <TextField {...field} fullWidth label="مبلغ العهدة (د.ل)" type="number" 
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mr: 1, ml: 1 }}><AccountBalanceWallet sx={{ color: '#4a5d4a', opacity: 0.7 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' }, '& .MuiInputLabel-root': { fontWeight: 700 } }}
                />
              )} />

              <Controller name="date" control={balCtrl} render={({ field }) => (
                <TextField {...field} fullWidth label="تاريخ الإضافة" type="date"
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mr: 1, ml: 1 }}><CalendarToday sx={{ color: '#4a5d4a', opacity: 0.7 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' }, '& .MuiInputLabel-root': { fontWeight: 700 } }}
                />
              )} />

              <Controller name="notes" control={balCtrl} render={({ field }) => (
                <TextField {...field} fullWidth label="ملاحظات توضيحية (اختياري)" multiline rows={3}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, mr: 1, ml: 1 }}><NoteAlt sx={{ color: '#4a5d4a', opacity: 0.7 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' }, '& .MuiInputLabel-root': { fontWeight: 700 } }}
                />
              )} />
              
            </Stack>
          </Box>

          {/* Bottom Action Area */}
          <Box sx={{ p: 2, pb: 'calc(env(safe-area-inset-bottom) + 16px)', bgcolor: theme.palette.mode === 'dark' ? '#0a0e14' : '#f0f2f5', borderTop: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setBalanceDialogOpen(false)} variant="outlined" fullWidth size="large" sx={{ borderRadius: 3, p: 1.5, fontWeight: 700, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: 'text.secondary' }}>
                رجوع
              </Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 3, p: 1.5, fontWeight: 900, bgcolor: '#4a5d4a', color: '#fff', '&:hover': { bgcolor: '#364036' }, boxShadow: '0 4px 12px rgba(74,93,74,0.3)' }}>
                {editingBalance ? 'حفظ التعديل' : 'إيداع العهدة'}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== EDIT CLIENT DIALOG ===== */}
      <Dialog open={editClientOpen} onClose={() => setEditClientOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleClientSubmit(onSubmitClient)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconButton onClick={() => setEditClientOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
                <Typography variant="h5" fontWeight={800}>تعديل العميل</Typography>
              </Stack>
            </Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="name" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="اسم العميل" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="phone" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="رقم الهاتف" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="address" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="العنوان" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="email" control={clientControl} render={({ field }) => <TextField {...field} fullWidth label="البريد الإلكتروني (اختياري)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="type" control={clientControl} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>النوع</InputLabel>
                  <Select {...field} label="النوع" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
                    <MenuItem value="individual">فرد</MenuItem>
                    <MenuItem value="company">شركة</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setEditClientOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ التعديلات</Button>
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Button fullWidth size="large" variant="outlined" color="error" onClick={handleDeleteClient} sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.5 }}>
              حذف العميل وجميع بياناته
            </Button>
          </Box>
        </form>
      </Dialog>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <Dialog
        open={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 340 } }}
      >
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(214, 69, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Delete sx={{ fontSize: 28, color: '#d64545' }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>حذف المصروف؟</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5 }}>
            هل أنت متأكد من حذف "{deletingExpense?.description?.substring(0, 30)}{deletingExpense && deletingExpense.description.length > 30 ? '...' : ''}"؟
          </Typography>
          <Typography variant="body2" sx={{ color: '#d64545', fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>
            {formatCurrency(deletingExpense?.amount || 0)}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setDeletingExpense(null)} fullWidth sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}>إلغاء</Button>
            <Button onClick={() => deletingExpense && handleDeleteExpense(deletingExpense)} fullWidth variant="contained" color="error" sx={{ borderRadius: 2, py: 1, fontWeight: 700, bgcolor: '#d64545', '&:hover': { bgcolor: '#c53030' } }}>حذف</Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ===== EXPENSE DETAIL DIALOG ===== */}
      <Dialog
        open={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        fullScreen
        PaperProps={{ sx: { bgcolor: '#F7F7F5' } }}
      >
        <Box sx={{ bgcolor: '#2F3E34', color: 'white', p: 2, pt: 'calc(max(env(safe-area-inset-top), 50px) + 16px)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => setViewingExpense(null)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h6" fontWeight={700}>تفاصيل المصروف</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => {
                  if (viewingExpense) {
                    setEditingExpense(viewingExpense);
                    setExpVal('description', viewingExpense.description);
                    setExpVal('amount', viewingExpense.amount);
                    setExpVal('category', viewingExpense.category);
                    setExpVal('date', viewingExpense.date);
                    setExpVal('invoiceNumber', viewingExpense.invoiceNumber || '');
                    setExpVal('notes', viewingExpense.notes || '');
                    setExpVal('userId', viewingExpense.userId || '');
                    setExpenseDialogOpen(true);
                    setViewingExpense(null);
                  }
                }}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <Edit sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  setDeletingExpense(viewingExpense);
                  setViewingExpense(null);
                }}
                sx={{
                  color: '#fda4a4',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(214, 69, 69, 0.3)' },
                }}
              >
                <Delete sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid rgba(47, 62, 52, 0.06)', overflow: 'hidden', mb: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
              <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>المبلغ</Typography>
              <Typography sx={{ color: '#2F3E34', fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", mt: 0.5 }}>{formatCurrency(viewingExpense?.amount || 0)}</Typography>
            </Box>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
              <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>الوصف</Typography>
              <Typography sx={{ color: '#1F2521', fontSize: '1rem', fontWeight: 700, mt: 0.5, lineHeight: 1.5 }}>{viewingExpense?.description}</Typography>
            </Box>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
              <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>التصنيف</Typography>
              <Chip label={getExpenseCategoryLabel(viewingExpense?.category || '')} size="small" sx={{ mt: 0.75, bgcolor: 'rgba(194, 178, 128, 0.15)', color: '#2F3E34', fontWeight: 700, fontSize: '0.75rem' }} />
            </Box>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
              <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>التاريخ</Typography>
              <Typography sx={{ color: '#1F2521', fontSize: '0.95rem', fontWeight: 600, mt: 0.5 }}>{formatDate(viewingExpense?.date || '')}</Typography>
            </Box>
            {viewingExpense?.invoiceNumber && (
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
                <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>رقم الفاتورة</Typography>
                <Typography sx={{ color: '#1F2521', fontSize: '0.95rem', fontWeight: 600, mt: 0.5 }}>{viewingExpense.invoiceNumber}</Typography>
              </Box>
            )}
            {viewingExpense?.createdBy && (
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(47, 62, 52, 0.04)' }}>
                <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>مسجل بواسطة</Typography>
                <Typography sx={{ color: '#1F2521', fontSize: '0.95rem', fontWeight: 600, mt: 0.5 }}>{viewingExpense.createdBy}</Typography>
              </Box>
            )}
            {viewingExpense?.notes && (
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B736E', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>ملاحظات</Typography>
                <Typography sx={{ color: '#1F2521', fontSize: '0.9rem', mt: 0.5, lineHeight: 1.6 }}>{viewingExpense.notes}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
