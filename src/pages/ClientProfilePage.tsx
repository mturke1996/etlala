import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Grid, Typography, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Container,
  Avatar, Stack, FormControl, InputLabel, Select, MenuItem, Divider,
  useTheme, Snackbar, InputAdornment, Alert,
} from '@mui/material';
import {
  ArrowBack, Payment, Business, Person, Phone, Add, TrendingDown,
  TrendingUp, Edit, Delete, CreditCard, PersonAdd, Save, Share, Close, PostAdd, ChevronLeft, Search
} from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { formatCurrency, formatDate, getExpenseCategoryLabel, expenseCategories } from '../utils/formatters';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { Payment as PaymentType, Expense, StandaloneDebt, Worker } from '../types';
import { COMPANY_INFO } from '../constants/companyInfo';

dayjs.locale('ar');

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().optional(),
  phone: z.string().min(8),
  address: z.string().min(3),
  type: z.enum(['company', 'individual']),
});

export const ClientProfilePage = () => {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();

  const {
    clients, payments, expenses, standaloneDebts, invoices, debtParties,
    addPayment, updatePayment, deletePayment,
    addExpense, updateExpense, deleteExpense,
    addStandaloneDebt, updateStandaloneDebt, deleteStandaloneDebt,
    updateClient, deleteClient,
    workers, addWorker, updateWorker, deleteWorker,
  } = useDataStore();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [expensesListOpen, setExpensesListOpen] = useState(false);
  const [paymentsListOpen, setPaymentsListOpen] = useState(false);
  const [debtsListOpen, setDebtsListOpen] = useState(false);
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

  const client = clients.find((c) => c.id === clientId);

  // Forms
  const { control: clientControl, handleSubmit: handleClientSubmit, reset: resetClient } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', type: 'individual' },
  });

  const { control: payCtrl, handleSubmit: handlePaySubmit, reset: resetPay, setValue: setPayVal } = useForm({
    defaultValues: { amount: '' as any, paymentMethod: 'cash' as const, paymentDate: dayjs().format('YYYY-MM-DD'), invoiceId: '', notes: '' },
  });

  const { control: expCtrl, handleSubmit: handleExpSubmit, reset: resetExp, setValue: setExpVal } = useForm({
    defaultValues: { description: '', amount: '' as any, category: 'materials', date: dayjs().format('YYYY-MM-DD'), invoiceNumber: '', notes: '', workerId: '' },
  });

  const { control: debtCtrl, handleSubmit: handleDebtSubmit, reset: resetDebt, setValue: setDebtVal } = useForm({
    defaultValues: { partyName: '', description: '', amount: '' as any, date: dayjs().format('YYYY-MM-DD'), notes: '' },
  });

  const { control: workCtrl, handleSubmit: handleWorkSubmit, reset: resetWork, setValue: setWorkVal } = useForm({
    defaultValues: { name: '', jobType: '', totalAmount: '' as any },
  });

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

  const filteredExp = useMemo(() => {
    if (!expSearch) return clientExpenses;
    const q = expSearch.toLowerCase();
    return clientExpenses.filter((e) => e.description.toLowerCase().includes(q) || e.category.includes(q));
  }, [clientExpenses, expSearch]);

  const filteredPay = useMemo(() => {
    if (!paySearch) return clientPayments;
    const q = paySearch.toLowerCase();
    return clientPayments.filter((p) => formatCurrency(p.amount).includes(q) || p.paymentMethod.includes(q));
  }, [clientPayments, paySearch]);

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

  // === PDF Helper ===
  const pdfStyles = `@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Tajawal',sans-serif;background:#fff;color:#1a1a1a;padding:24px;font-size:12px;direction:rtl}
.header{display:flex;justify-content:space-between;align-items:center;padding:10px 0 14px;margin-bottom:6px}
.header-right h1{font-size:22px;font-weight:900;color:#364036;margin:0 0 4px 0;letter-spacing:0.5px}
.header-right p{margin:0;font-size:11px;color:#555;line-height:1.6}
.header-left img{height:150px;width:300px;object-fit:contain}
.header-line{border:none;border-top:3px solid #364036;margin-bottom:14px}
.client-info{background:#f8f6f2;border-radius:8px;padding:12px 16px;margin-bottom:16px;border:1px solid #e8e4de;display:flex;justify-content:space-between;align-items:center}
.client-info h2{font-size:15px;color:#364036;margin-bottom:2px}.client-info span{color:#888;font-size:11px}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px}
.summary-card{background:#f8f6f2;border-radius:8px;padding:10px;text-align:center;border:1px solid #e8e4de}
.summary-card .label{font-size:9px;color:#888;margin-bottom:3px}.summary-card .value{font-size:13px;font-weight:800;color:#364036}
.section{margin-bottom:20px;page-break-inside:avoid}.section h3{font-size:13px;font-weight:800;color:#364036;border-bottom:2px solid #e8e4de;padding-bottom:6px;margin-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:11px}table th{background:#364036;color:white;padding:8px 10px;text-align:right;font-weight:700;white-space:nowrap}
table td{padding:7px 10px;border-bottom:1px solid #eee;text-align:right}table tr:nth-child(even){background:#fafaf8}
.total-row{background:#f0ede7!important;font-weight:800}.total-row td{border-top:2px solid #364036}
.footer{text-align:center;margin-top:24px;padding-top:12px;border-top:2px solid #e8e4de;color:#999;font-size:10px}
.amount{font-weight:700}.neg{color:#d64545}.pos{color:#0d9668}
@media print{body{padding:12px}@page{size:A4;margin:8mm}}
@media(max-width:600px){.summary-grid{grid-template-columns:repeat(2,1fr)}table{font-size:9px}table th,table td{padding:4px 5px}.header-right h1{font-size:16px}.header-left img{height:50px}}`;

  const pdfHeader = `<div class="header"><div class="header-right"><h1>${COMPANY_INFO.fullName}</h1><p>${COMPANY_INFO.address}<br/>${COMPANY_INFO.phone}</p></div><div class="header-left"><img src="/logo.jpeg" alt="Etlala"/></div></div><hr class="header-line"/>`;
  const pdfClientInfo = `<div class="client-info"><div><h2>${client?.name || ''}</h2><span>${client?.phone || ''} | ${client?.address || ''}</span></div><div style="text-align:left;font-size:10px;color:#888">${formatDate(new Date().toISOString())}</div></div>`;
  const pdfFooter = `<div class="footer">تم إنشاء هذا التقرير بواسطة نظام إطلالة | ${formatDate(new Date().toISOString())}</div>`;

  const openPrintWindow = (title: string, body: string) => {
    const w = window.open('', '_blank');
    if (!w) { msg('يرجى السماح بالنوافذ المنبثقة'); return; }
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${pdfStyles}</style></head><body>${pdfHeader}${pdfClientInfo}${body}${pdfFooter}<script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  };

  const handleGeneratePDF = () => {
    let body = `<div class="summary-grid">
<div class="summary-card"><div class="label">إجمالي المدفوعات</div><div class="value">${formatCurrency(summary.totalPaid)}</div></div>
<div class="summary-card"><div class="label">الربح (${summary.profitPercentage}%)</div><div class="value">${formatCurrency(summary.profit)}</div></div>
<div class="summary-card"><div class="label">المصروفات + الديون</div><div class="value">${formatCurrency(summary.totalObligations)}</div></div>
<div class="summary-card"><div class="label">المتبقي</div><div class="value ${summary.remaining >= 0 ? 'pos' : 'neg'}">${formatCurrency(summary.remaining)}</div></div></div>`;
    if (clientExpenses.length > 0) body += `<div class="section"><h3>المصروفات (${clientExpenses.length})</h3><table><thead><tr><th>#</th><th>الوصف</th><th>التصنيف</th><th>التاريخ</th><th>المبلغ</th></tr></thead><tbody>${clientExpenses.map((e,i) => `<tr><td>${i+1}</td><td>${e.description}</td><td>${getCategoryLabel(e.category)}</td><td>${formatDate(e.date)}</td><td class="amount">${formatCurrency(e.amount)}</td></tr>`).join('')}<tr class="total-row"><td colspan="4">الإجمالي</td><td class="amount">${formatCurrency(summary.totalExpenses)}</td></tr></tbody></table></div>`;
    if (clientPayments.length > 0) body += `<div class="section"><h3>المدفوعات (${clientPayments.length})</h3><table><thead><tr><th>#</th><th>المبلغ</th><th>الطريقة</th><th>التاريخ</th><th>ملاحظات</th></tr></thead><tbody>${clientPayments.map((p,i) => `<tr><td>${i+1}</td><td class="amount">${formatCurrency(p.amount)}</td><td>${getPayMethodLabel(p.paymentMethod)}</td><td>${formatDate(p.paymentDate)}</td><td>${p.notes||'-'}</td></tr>`).join('')}<tr class="total-row"><td colspan="4">الإجمالي</td><td class="amount">${formatCurrency(summary.totalPaid)}</td></tr></tbody></table></div>`;
    if (clientDebts.length > 0) body += `<div class="section"><h3>الديون (${clientDebts.length})</h3><table><thead><tr><th>#</th><th>الطرف</th><th>الوصف</th><th>المبلغ</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>${clientDebts.map((d,i) => `<tr><td>${i+1}</td><td>${d.partyName}</td><td>${d.description}</td><td class="amount">${formatCurrency(d.amount)}</td><td class="amount pos">${formatCurrency(d.paidAmount)}</td><td class="amount neg">${formatCurrency(d.remainingAmount)}</td></tr>`).join('')}<tr class="total-row"><td colspan="3">الإجمالي</td><td class="amount">${formatCurrency(clientDebts.reduce((s,d)=>s+d.amount,0))}</td><td class="amount">${formatCurrency(clientDebts.reduce((s,d)=>s+d.paidAmount,0))}</td><td class="amount">${formatCurrency(summary.totalDebts)}</td></tr></tbody></table></div>`;
    if (clientWorkers.length > 0) body += `<div class="section"><h3>العمال (${clientWorkers.length})</h3><table><thead><tr><th>#</th><th>الاسم</th><th>نوع العمل</th><th>الاتفاق</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>${clientWorkers.map((w,i) => `<tr><td>${i+1}</td><td>${w.name}</td><td>${w.jobType||'-'}</td><td class="amount">${formatCurrency(w.totalAmount)}</td><td class="amount pos">${formatCurrency(w.paidAmount)}</td><td class="amount neg">${formatCurrency(w.remainingAmount)}</td></tr>`).join('')}<tr class="total-row"><td colspan="3">الإجمالي</td><td class="amount">${formatCurrency(summary.totalWorkersAgreed)}</td><td class="amount">${formatCurrency(summary.totalWorkersPaid)}</td><td class="amount">${formatCurrency(summary.totalWorkersDue)}</td></tr></tbody></table></div>`;
    openPrintWindow(`تقرير ${client?.name}`, body);
  };

  const handleShareExpenses = () => {
    const body = `<div class="section"><h3>كشف المصروفات (${clientExpenses.length})</h3><table><thead><tr><th>#</th><th>الوصف</th><th>التصنيف</th><th>التاريخ</th><th>رقم الفاتورة</th><th>المبلغ</th></tr></thead><tbody>${clientExpenses.map((e,i) => `<tr><td>${i+1}</td><td>${e.description}</td><td>${getCategoryLabel(e.category)}</td><td>${formatDate(e.date)}</td><td>${e.invoiceNumber||'-'}</td><td class="amount">${formatCurrency(e.amount)}</td></tr>`).join('')}<tr class="total-row"><td colspan="5">الإجمالي</td><td class="amount">${formatCurrency(summary.totalExpenses)}</td></tr></tbody></table></div>`;
    openPrintWindow(`مصروفات ${client?.name}`, body);
  };

  const handleSharePayments = () => {
    const body = `<div class="section"><h3>كشف المدفوعات (${clientPayments.length})</h3><table><thead><tr><th>#</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th><th>بواسطة</th><th>ملاحظات</th></tr></thead><tbody>${clientPayments.map((p,i) => `<tr><td>${i+1}</td><td class="amount">${formatCurrency(p.amount)}</td><td>${getPayMethodLabel(p.paymentMethod)}</td><td>${formatDate(p.paymentDate)}</td><td>${p.createdBy||'-'}</td><td>${p.notes||'-'}</td></tr>`).join('')}<tr class="total-row"><td colspan="5">الإجمالي</td><td class="amount">${formatCurrency(summary.totalPaid)}</td></tr></tbody></table></div>`;
    openPrintWindow(`مدفوعات ${client?.name}`, body);
  };

  const handleShareWorkers = () => {
    const body = `<div class="section"><h3>كشف العمال (${clientWorkers.length})</h3><table><thead><tr><th>#</th><th>الاسم</th><th>نوع العمل</th><th>الاتفاق</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>${clientWorkers.map((w,i) => `<tr><td>${i+1}</td><td>${w.name}</td><td>${w.jobType||'-'}</td><td class="amount">${formatCurrency(w.totalAmount)}</td><td class="amount pos">${formatCurrency(w.paidAmount)}</td><td class="amount neg">${formatCurrency(w.remainingAmount)}</td></tr>`).join('')}<tr class="total-row"><td colspan="3">الإجمالي</td><td class="amount">${formatCurrency(summary.totalWorkersAgreed)}</td><td class="amount">${formatCurrency(summary.totalWorkersPaid)}</td><td class="amount">${formatCurrency(summary.totalWorkersDue)}</td></tr></tbody></table></div>`;
    openPrintWindow(`عمال ${client?.name}`, body);
  };

  const menuItems = [
    { title: 'فاتورة جديدة', icon: PostAdd, color: '#e6a817', bgColor: 'rgba(230,168,23,0.08)', borderColor: 'rgba(230,168,23,0.12)', onClick: () => navigate(`/invoices/new?clientId=${clientId}`) },
    { title: 'المصروفات', icon: TrendingDown, color: '#d64545', bgColor: 'rgba(214,69,69,0.08)', borderColor: 'rgba(214,69,69,0.12)', onClick: () => setExpensesListOpen(true) },
    { title: 'المدفوعات', icon: Payment, color: '#0d9668', bgColor: 'rgba(13,150,104,0.08)', borderColor: 'rgba(13,150,104,0.12)', onClick: () => setPaymentsListOpen(true) },
    { title: 'الديون', icon: CreditCard, color: '#c9a54e', bgColor: 'rgba(201,165,78,0.08)', borderColor: 'rgba(201,165,78,0.12)', onClick: () => setDebtsListOpen(true) },
    { title: 'العمال', icon: PersonAdd, color: '#4a5d4a', bgColor: 'rgba(74,93,74,0.08)', borderColor: 'rgba(74,93,74,0.12)', onClick: () => setWorkersListOpen(true) },
    { title: 'حساب الأرباح', icon: TrendingUp, color: '#5a8fc4', bgColor: 'rgba(90,143,196,0.08)', borderColor: 'rgba(90,143,196,0.12)', onClick: () => setProfitDialogOpen(true) },
    { title: 'مشاركة التقرير', icon: Business, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.12)', onClick: () => handleGeneratePDF() },
  ];

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
    try {
      if (editingExpense) { await updateExpense(editingExpense.id, { description: data.description, amount, category: data.category, date: data.date, invoiceNumber: data.invoiceNumber, notes: data.notes, workerId, workerName }); setEditingExpense(null); msg('تم التعديل'); }
      else { await addExpense({ id: crypto.randomUUID(), clientId: clientId!, description: data.description, amount, category: data.category, date: data.date, invoiceNumber: data.invoiceNumber || '', notes: data.notes, isClosed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), workerId, workerName, createdBy: user?.displayName || 'المستخدم' }); msg('تمت الإضافة'); }
      setExpenseDialogOpen(false); resetExp(); setExpensesListOpen(true);
    } catch { msg('خطأ'); }
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

  const getPayMethodLabel = (m: string) => ({ cash: 'نقدي', bank_transfer: 'تحويل بنكي', check: 'شيك', credit_card: 'بطاقة', mobile_payment: 'محفظة' }[m] || m);
  const getCategoryLabel = getExpenseCategoryLabel;

  const headerGradient = theme.palette.mode === 'light' ? 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)' : 'linear-gradient(160deg, #2a3a2a 0%, #364036 100%)';
  const pageBg = theme.palette.mode === 'dark' ? 'linear-gradient(180deg, #1a1f1a 0%, #151a15 100%)' : 'linear-gradient(180deg, #f5f3ef 0%, #ede9e3 100%)';

  if (!client) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography>العميل غير موجود</Typography>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/clients')} sx={{ mt: 2 }}>العودة</Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: pageBg, pb: 8 }}>
      {/* Header */}
      <Box sx={{ background: headerGradient, pt: 2, pb: 4, px: 2, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 70% 20%, rgba(200,192,176,0.08) 0%, transparent 50%)', pointerEvents: 'none' } }}>
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <IconButton onClick={() => navigate('/clients')} sx={{ color: 'rgba(255,255,255,0.9)' }}><ArrowBack /></IconButton>
            <Box sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'white', fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 0.5 }}>{client.name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'rgba(200,192,176,0.15)', px: 1.5, py: 0.75, borderRadius: 2.5, border: '1px solid rgba(200,192,176,0.2)', width: 'fit-content' }}>
                <Phone sx={{ fontSize: 16, color: 'white', opacity: 0.95 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{client.phone}</Typography>
              </Stack>
            </Box>
            <IconButton onClick={() => setEditClientOpen(true)} sx={{ color: 'white', bgcolor: 'rgba(200,192,176,0.12)', border: '1px solid rgba(200,192,176,0.2)', width: 44, height: 44, '&:hover': { bgcolor: 'rgba(200,192,176,0.2)' } }}>
              <Edit sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>

          {/* Financial Alerts */}
          {(summary.totalExpenses > summary.totalPaid || summary.remaining < 0) && (
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

          {/* Financial Summary - Professional Design */}
          <Box sx={{ mt: 2 }}>
            {/* Main Balance Card */}
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', mb: 1.5, overflow: 'hidden', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 100% 0%, rgba(212,197,163,0.12) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <CardContent sx={{ p: '18px 20px !important', position: 'relative' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: 0.5, display: 'block', mb: 0.5 }}>إجمالي المدفوعات</Typography>
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{formatCurrency(summary.totalPaid)}</Typography>
                  </Box>
                  <Box sx={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #d4c5a3 0%, #a3967a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(212,197,163,0.3)', color: '#2a3a2a' }}>
                    <Payment sx={{ fontSize: 28 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Detail Cards Grid */}
            <Grid container spacing={1}>
              {[
                { label: 'الربح', value: formatCurrency(summary.profit), sub: summary.profitPercentage > 0 ? `${summary.profitPercentage}%` : '-', gradient: 'linear-gradient(135deg, rgba(90,143,196,0.3) 0%, rgba(90,143,196,0.1) 100%)', border: 'rgba(90,143,196,0.4)' },
                { label: 'المصروفات', value: formatCurrency(summary.totalExpenses), sub: `${clientExpenses.length} سجل`, gradient: 'linear-gradient(135deg, rgba(214,69,69,0.3) 0%, rgba(214,69,69,0.1) 100%)', border: 'rgba(214,69,69,0.4)' },
                { label: 'الديون', value: formatCurrency(summary.totalDebts), sub: `${clientDebts.length} دين`, gradient: 'linear-gradient(135deg, rgba(201,165,78,0.3) 0%, rgba(201,165,78,0.1) 100%)', border: 'rgba(201,165,78,0.4)' },
                { label: 'المتبقي', value: formatCurrency(summary.remaining), sub: summary.remaining >= 0 ? 'رصيد' : 'عجز', gradient: summary.remaining >= 0 ? 'linear-gradient(135deg, rgba(13,150,104,0.3) 0%, rgba(13,150,104,0.1) 100%)' : 'linear-gradient(135deg, rgba(214,69,69,0.35) 0%, rgba(214,69,69,0.15) 100%)', border: summary.remaining >= 0 ? 'rgba(13,150,104,0.4)' : 'rgba(214,69,69,0.5)' },
              ].map((c, i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Card sx={{ borderRadius: 2.5, background: c.gradient, backdropFilter: 'blur(20px)', color: 'white', border: `1px solid ${c.border}`, height: '100%' }}>
                    <CardContent sx={{ p: '12px 14px !important' }}>
                      <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontSize: '0.65rem', fontWeight: 600, mb: 0.5 }}>{c.label}</Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: { xs: '0.85rem', sm: '0.92rem' }, mb: 0.3 }}>{c.value}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.6rem' }}>{c.sub}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Menu Items */}
      <Container maxWidth="sm" sx={{ mt: 1, pt: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 0.5, mt: 4 }}>القوائم السريعة</Typography>
        <Stack spacing={2} sx={{ mb: 5 }}>
          {menuItems.map((item, i) => (
            <Card key={i} onClick={item.onClick} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none', '&:hover': { transform: 'translateY(-2px)' }, '&:active': { transform: 'scale(0.98)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0}>
                    <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '20px' }}>
                      <item.icon sx={{ fontSize: 26, color: item.color }} />
                    </Box>
                    <Box><Typography variant="body1" fontWeight={700}>{item.title}</Typography><Typography variant="caption" color="text.secondary">اضغط للدخول</Typography></Box>
                  </Stack>
                  <ChevronLeft sx={{ color: 'text.secondary', fontSize: 24 }} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      {/* ===== EXPENSES LIST DIALOG ===== */}
      <Dialog open={expensesListOpen} onClose={() => setExpensesListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => setExpensesListOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h5" fontWeight={800}>المصروفات ({clientExpenses.length})</Typography>
            </Stack>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingExpense(null); resetExp(); setExpenseDialogOpen(true); }} sx={{ bgcolor: 'rgba(200,192,176,0.15)', color: '#c8c0b0', fontWeight: 700, border: '1px solid rgba(200,192,176,0.3)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' }, borderRadius: 2.5, boxShadow: 'none' }}>جديدة</Button>
            <IconButton onClick={handleShareExpenses} sx={{ color: 'white', bgcolor: 'rgba(200,192,176,0.12)', border: '1px solid rgba(200,192,176,0.2)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' } }}><Share sx={{ fontSize: 20 }} /></IconButton>
          </Stack>
        </Box>
        <Box sx={{ px: 2, pt: 2 }}>
          <TextField fullWidth placeholder="ابحث..." size="small" value={expSearch} onChange={(e) => setExpSearch(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper', '& fieldset': { border: 'none' } } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
          <Container maxWidth="sm" sx={{ mt: 2 }}>
            {filteredExp.length === 0 ? <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 6 }}><TrendingDown sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} /><Typography variant="h6" color="text.secondary">لا توجد مصروفات</Typography></Card> : (
              <Stack spacing={2}>{filteredExp.map((exp) => (
                <Card key={exp.id} sx={{ borderRadius: 0, borderRight: '3px solid #d64545', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>{exp.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{getCategoryLabel(exp.category)} • {formatDate(exp.date)} {exp.invoiceNumber && `• فاتورة: ${exp.invoiceNumber}`}</Typography>
                        {exp.createdBy && <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 600 }}>بواسطة: {exp.createdBy}</Typography>}
                        {exp.notes && <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>{exp.notes}</Typography>}
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography fontWeight={800} color="error.main">{formatCurrency(exp.amount)}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => { setEditingExpense(exp); setExpVal('description', exp.description); setExpVal('amount', exp.amount); setExpVal('category', exp.category); setExpVal('date', exp.date); setExpVal('invoiceNumber', exp.invoiceNumber || ''); setExpVal('notes', exp.notes || ''); setExpenseDialogOpen(true); }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                          <IconButton size="small" onClick={() => { if (window.confirm('حذف؟')) deleteExpense(exp.id).then(() => msg('تم الحذف')); }}><Delete sx={{ fontSize: 16, color: 'error.main' }} /></IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}</Stack>
            )}
            {/* Total */}
            <Card sx={{ borderRadius: 0, mt: 2, bgcolor: '#364036', color: 'white' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>إجمالي المصروفات</Typography>
                  <Typography fontWeight={900} variant="h6">{formatCurrency(summary.totalExpenses)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Dialog>

      {/* ===== PAYMENTS LIST DIALOG ===== */}
      <Dialog open={paymentsListOpen} onClose={() => setPaymentsListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => setPaymentsListOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h5" fontWeight={800}>المدفوعات ({clientPayments.length})</Typography>
            </Stack>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingPayment(null); resetPay(); setPaymentDialogOpen(true); }} sx={{ bgcolor: 'rgba(200,192,176,0.15)', color: '#c8c0b0', fontWeight: 700, border: '1px solid rgba(200,192,176,0.3)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' }, borderRadius: 2.5, boxShadow: 'none' }}>جديدة</Button>
            <IconButton onClick={handleSharePayments} sx={{ color: 'white', bgcolor: 'rgba(200,192,176,0.12)', border: '1px solid rgba(200,192,176,0.2)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' } }}><Share sx={{ fontSize: 20 }} /></IconButton>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
          <Container maxWidth="sm" sx={{ mt: 2 }}>
            {clientPayments.length === 0 ? <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 6 }}><Payment sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} /><Typography variant="h6" color="text.secondary">لا توجد مدفوعات</Typography></Card> : (
              <Stack spacing={2}>{filteredPay.map((pay) => (
                <Card key={pay.id} sx={{ borderRadius: 0, borderRight: '3px solid #0d9668', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography fontWeight={800} color="success.main">{formatCurrency(pay.amount)}</Typography>
                        <Typography variant="caption" color="text.secondary">{getPayMethodLabel(pay.paymentMethod)} • {formatDate(pay.paymentDate)}</Typography>
                        {pay.createdBy && <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 600 }}>بواسطة: {pay.createdBy}</Typography>}
                        {pay.notes && <Typography variant="caption" display="block" color="text.secondary">{pay.notes}</Typography>}
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => { setEditingPayment(pay); setPayVal('amount', pay.amount); setPayVal('paymentMethod', pay.paymentMethod as any); setPayVal('paymentDate', pay.paymentDate); setPayVal('notes', pay.notes || ''); setPaymentDialogOpen(true); }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                        <IconButton size="small" onClick={() => { if (window.confirm('حذف؟')) deletePayment(pay.id).then(() => msg('تم الحذف')); }}><Delete sx={{ fontSize: 16, color: 'error.main' }} /></IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}</Stack>
            )}
            {/* Total */}
            <Card sx={{ borderRadius: 0, mt: 2, bgcolor: '#364036', color: 'white' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>إجمالي المدفوعات</Typography>
                  <Typography fontWeight={900} variant="h6">{formatCurrency(summary.totalPaid)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Dialog>

      {/* ===== DEBTS LIST DIALOG ===== */}
      <Dialog open={debtsListOpen} onClose={() => setDebtsListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => setDebtsListOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h5" fontWeight={800}>الديون ({clientDebts.length})</Typography>
            </Stack>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingDebt(null); resetDebt(); setDebtDialogOpen(true); }} sx={{ bgcolor: 'rgba(200,192,176,0.15)', color: '#c8c0b0', fontWeight: 700, border: '1px solid rgba(200,192,176,0.3)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' }, borderRadius: 2.5, boxShadow: 'none' }}>جديد</Button>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
          <Container maxWidth="sm" sx={{ mt: 2 }}>
            {clientDebts.length === 0 ? <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 6 }}><CreditCard sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} /><Typography variant="h6" color="text.secondary">لا توجد ديون</Typography></Card> : (
              <Stack spacing={2}>{clientDebts.map((debt) => (
                <Card key={debt.id} sx={{ borderRadius: 3, borderRight: '3px solid #c9a54e', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography fontWeight={700}>{debt.partyName}</Typography>
                    <Typography variant="body2" color="text.secondary">{debt.description}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">الإجمالي</Typography><Typography variant="body2" fontWeight={700}>{formatCurrency(debt.amount)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">المدفوع</Typography><Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(debt.paidAmount)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">المتبقي</Typography><Typography variant="body2" fontWeight={800} color="error.main">{formatCurrency(debt.remainingAmount)}</Typography></Stack>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      <IconButton size="small" onClick={() => { setEditingDebt(debt); setDebtVal('partyName', debt.partyName); setDebtVal('description', debt.description); setDebtVal('amount', debt.amount); setDebtVal('date', debt.date); setDebtVal('notes', debt.notes || ''); setDebtDialogOpen(true); }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => { if (window.confirm('حذف؟')) deleteStandaloneDebt(debt.id).then(() => msg('تم الحذف')); }}><Delete sx={{ fontSize: 16, color: 'error.main' }} /></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}</Stack>
            )}
          </Container>
        </Box>
      </Dialog>

      {/* ===== ADD/EDIT EXPENSE DIALOG ===== */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleExpSubmit(onSubmitExpense)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setExpenseDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف'}</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="description" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="الوصف" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="amount" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="المبلغ" type="number" InputProps={{ endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="category" control={expCtrl} render={({ field }) => <FormControl fullWidth><InputLabel>التصنيف</InputLabel><Select {...field} label="التصنيف" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>{Object.entries(expenseCategories).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl>} />
              <Controller name="invoiceNumber" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="رقم الفاتورة (اختياري)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="workerId" control={expCtrl} render={({ field }) => <FormControl fullWidth><InputLabel>العامل (اختياري)</InputLabel><Select {...field} label="العامل (اختياري)" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}><MenuItem value=""><em>لا يوجد</em></MenuItem>{workers.filter(w=>w.clientId===clientId).map(w=><MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>} />
              <Controller name="date" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="التاريخ" type="date" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="notes" control={expCtrl} render={({ field }) => <TextField {...field} fullWidth label="ملاحظات" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setExpenseDialogOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ</Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== ADD/EDIT PAYMENT DIALOG ===== */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handlePaySubmit(onSubmitPayment)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
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
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
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
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
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
      <Dialog open={workersListOpen} onClose={() => setWorkersListOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => setWorkersListOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h5" fontWeight={800}>العمال ({clientWorkers.length})</Typography>
            </Stack>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingWorker(null); resetWork(); setWorkerDialogOpen(true); }} sx={{ bgcolor: 'rgba(200,192,176,0.15)', color: '#c8c0b0', fontWeight: 700, border: '1px solid rgba(200,192,176,0.3)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' }, borderRadius: 2.5, boxShadow: 'none' }}>عامل جديد</Button>
            <IconButton onClick={handleShareWorkers} sx={{ color: 'white', bgcolor: 'rgba(200,192,176,0.12)', border: '1px solid rgba(200,192,176,0.2)', '&:hover': { bgcolor: 'rgba(200,192,176,0.25)' } }}><Share sx={{ fontSize: 20 }} /></IconButton>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
          <Container maxWidth="sm" sx={{ mt: 2 }}>
            {clientWorkers.length === 0 ? <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 6 }}><PersonAdd sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} /><Typography variant="h6" color="text.secondary">لا يوجد عمال</Typography></Card> : (
              <Stack spacing={2}>{clientWorkers.map((worker) => (
                <Card key={worker.id} sx={{ borderRadius: 3, borderRight: '3px solid #4a5d4a', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography fontWeight={700}>{worker.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{worker.jobType}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => { resetExp({ description: `دفعة حساب: ${worker.name}`, amount: '' as any, category: 'labor', date: dayjs().format('YYYY-MM-DD'), notes: '', workerId: worker.id }); setEditingExpense(null); setExpenseDialogOpen(true); }} title="تسجيل دفعة"><Payment sx={{ fontSize: 16, color: 'success.main' }} /></IconButton>
                        <IconButton size="small" onClick={() => { setEditingWorker(worker); setWorkVal('name', worker.name); setWorkVal('jobType', worker.jobType || ''); setWorkVal('totalAmount', worker.totalAmount); setWorkerDialogOpen(true); }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                        <IconButton size="small" onClick={() => { if (window.confirm('حذف؟')) deleteWorker(worker.id).then(() => msg('تم الحذف')); }}><Delete sx={{ fontSize: 16, color: 'error.main' }} /></IconButton>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">الاتفاق</Typography><Typography variant="body2" fontWeight={700}>{formatCurrency(worker.totalAmount)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">المدفوع</Typography><Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(worker.paidAmount)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">المتبقي</Typography><Typography variant="body2" fontWeight={800} color="error.main">{formatCurrency(worker.remainingAmount)}</Typography></Stack>
                  </CardContent>
                </Card>
              ))}</Stack>
            )}
          </Container>
        </Box>
      </Dialog>

      {/* ===== ADD/EDIT WORKER DIALOG ===== */}
      <Dialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleWorkSubmit(onSubmitWorker)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}><IconButton onClick={() => setWorkerDialogOpen(false)} sx={{ color: 'white' }}><ArrowBack /></IconButton><Typography variant="h6" fontWeight={700}>{editingWorker ? 'تعديل بيانات عامل' : 'إضافة عامل جديد'}</Typography></Stack>
          </Box>
          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller name="name" control={workCtrl} render={({ field }) => <TextField {...field} fullWidth label="اسم العامل" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="jobType" control={workCtrl} render={({ field }) => <TextField {...field} fullWidth label="نوع العمل (مثلاً: سباكة، كهرباء)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
              <Controller name="totalAmount" control={workCtrl} render={({ field }) => <TextField {...field} fullWidth label="المبلغ المتفق عليه" type="number" InputProps={{ endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }} />} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setWorkerDialogOpen(false)} fullWidth size="large" sx={{ borderRadius: 2.5 }}>إلغاء</Button>
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ borderRadius: 2.5, bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' } }}>حفظ</Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* ===== EDIT CLIENT DIALOG ===== */}
      <Dialog open={editClientOpen} onClose={() => setEditClientOpen(false)} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef' } }}>
        <form onSubmit={handleClientSubmit(onSubmitClient)}>
          <Box sx={{ background: headerGradient, color: 'white', p: 2 }}>
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

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
