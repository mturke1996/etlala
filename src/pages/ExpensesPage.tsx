// @ts-nocheck
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  Chip,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  FileText,
  Plus,
  Search,
  TrendingDown,
  User,
  Wallet,
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaAccentSurface, EtlalaEmptyState, EtlalaSectionTitle, etlalaContentFieldSx, etlalaHeroActionButtonSx } from '../components/etlala/EtlalaMobileUi';
import { useAuthStore } from '../store/useAuthStore';
import { useGlobalFundStore } from '../store/useGlobalFundStore';
import { computeUserFundAllocTotals } from '../utils/custodyFundAlloc';
import { formatCurrency, formatDate, getExpenseCategoryLabel, expenseCategories } from '../utils/formatters';
import { QuickExpenseSheet } from '../components/expense/QuickExpenseSheet';
import { ExpenseQuantityChip } from '../components/expense/ExpenseQuantityBlock';

/** عدد السجلات المعروضة دفعة واحدة — يحافظ على خفة الصفحة مهما كبر الأرشيف */
const PAGE_SIZE = 30;

export const ExpensesPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { expenses, clients } = useDataStore();
  const { user } = useAuthStore();
  const { transactions, getUserStats, initialize: initFund } = useGlobalFundStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchParams, setSearchParams] = useSearchParams();

  // Init global fund store
  useEffect(() => { const u = initFund(); return u; }, []);

  /** روابط قديمة `/expenses?new=1` تفتح النافذة مباشرة */
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSheetOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /** عند تغيير البحث أو الفلتر نعود لأول دفعة */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, categoryFilter]);

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return expenses.filter(exp =>
      (categoryFilter === 'all' || exp.category === categoryFilter) &&
      (exp.description.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, categoryFilter]);

  /** الدفعة الظاهرة فقط — DOM خفيف وسلس */
  const visibleExpenses = useMemo(
    () => filteredExpenses.slice(0, visibleCount),
    [filteredExpenses, visibleCount],
  );
  const remainingCount = filteredExpenses.length - visibleExpenses.length;

  /** أعلى الفئات — حساب خفيف بدون مكتبة رسم */
  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    let grand = 0;
    for (const exp of expenses) {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
      grand += exp.amount;
    }
    const rows = Object.entries(totals)
      .map(([key, value]) => ({ key, name: getExpenseCategoryLabel(key), value }))
      .sort((a, b) => b.value - a.value);
    const top = rows.slice(0, 5);
    const rest = rows.slice(5).reduce((s, r) => s + r.value, 0);
    if (rest > 0) top.push({ key: '__rest', name: 'فئات أخرى', value: rest });
    return { rows: top, grand, categoryCount: rows.length };
  }, [expenses]);

  // ─── رصيد عهدة المستخدم: نفس منطق `FundPage` / `computeUserFundAllocTotals` ──
  const myFundStats = useMemo(() => {
    if (!user) return null;
    const uid = user.id;
    const userName = user.displayName || '';

    const deposits = transactions.filter(
      (t) =>
        t.type === 'deposit' &&
        ((uid && t.userId === uid) || (userName && t.userName === userName))
    );

    if (deposits.length === 0) {
      const storeStats = uid ? getUserStats(uid) : null;
      if (storeStats && storeStats.deposited > 0) {
        return { deposited: storeStats.deposited, spent: storeStats.withdrawn, remaining: storeStats.remaining };
      }
      return null;
    }

    const depositRows = deposits.map((t) => ({ createdAt: t.createdAt, amount: t.amount }));
    const expenseRows = expenses
      .filter((e) => (uid && e.userId === uid) || (userName && e.createdBy === userName))
      .map((e) => ({ createdAt: e.createdAt, amount: e.amount }));

    return computeUserFundAllocTotals(depositRows, expenseRows);
  }, [transactions, expenses, user, getUserStats]);

  const totalExpenses = topCategories.grand;

  const openAddSheet = useCallback(() => setSheetOpen(true), []);

  return (
    <>
    <PageScaffold
      title="المصروفات العامة"
      subtitle={`${expenses.length} سجل مصروف`}
      backTo="/"
      contentOffset={3}
      rightAction={(
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} strokeWidth={2.2} />}
              onClick={openAddSheet}
              sx={etlalaHeroActionButtonSx}
            >
              مصروف جديد
            </Button>
      )}
      headerExtra={(
          <Stack spacing={1.5}>
            {/* ─── Fund Balance Banner (Premium) ─── */}
            {myFundStats ? (
              <Box sx={{
                borderRadius: '20px', overflow: 'hidden',
                background: myFundStats.remaining < 0 
                  ? 'linear-gradient(135deg, rgba(225,29,72,0.18) 0%, rgba(225,29,72,0.06) 100%)'
                  : myFundStats.remaining > myFundStats.deposited * 0.4
                  ? 'linear-gradient(135deg, rgba(13,150,104,0.18) 0%, rgba(13,150,104,0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 100%)',
                border: `1px solid ${myFundStats.remaining < 0 ? 'rgba(225,29,72,0.4)' : myFundStats.remaining > myFundStats.deposited * 0.4 ? 'rgba(13,150,104,0.35)' : 'rgba(245,158,11,0.35)'}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                {/* Top: icon + title + main balance */}
                <Box sx={{ px: 2.25, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '16px', flexShrink: 0,
                    background: myFundStats.remaining >= 0
                      ? 'linear-gradient(135deg, rgba(13,150,104,0.25), rgba(13,150,104,0.45))'
                      : 'linear-gradient(135deg, rgba(225,29,72,0.25), rgba(225,29,72,0.45))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${myFundStats.remaining >= 0 ? 'rgba(13,150,104,0.4)' : 'rgba(225,29,72,0.4)'}`,
                    boxShadow: `0 4px 14px ${myFundStats.remaining >= 0 ? 'rgba(13,150,104,0.3)' : 'rgba(225,29,72,0.3)'}`,
                  }}>
                    <Wallet size={22} color={myFundStats.remaining >= 0 ? '#34d399' : '#fca5a5'} strokeWidth={2} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 0.8, display: 'block', mb: 0.2, fontSize: '0.62rem' }}>
                      {myFundStats.remaining >= 0 ? 'رصيد عهدتك المتاح' : 'عجز في العهدة'}
                    </Typography>
                    <Typography sx={{
                      fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1, fontFamily: 'Outfit, sans-serif',
                      fontVariantNumeric: 'tabular-nums',
                      color: myFundStats.remaining < 0 ? '#f87171' : myFundStats.remaining > myFundStats.deposited * 0.4 ? '#34d399' : '#fbbf24',
                      textShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    }}>
                      {myFundStats.remaining < 0 ? `-${formatCurrency(Math.abs(myFundStats.remaining))}` : formatCurrency(myFundStats.remaining)}
                    </Typography>
                  </Box>
                  {myFundStats.remaining < 0 && (
                    <AlertTriangle size={22} color="#fca5a5" strokeWidth={2} style={{ flexShrink: 0 }} />
                  )}
                </Box>

                {/* Progress bar */}
                <Box sx={{ px: 2.25, pb: 1.25 }}>
                  {(() => {
                    const pct = myFundStats.deposited > 0 ? Math.max(0, Math.min(100, (myFundStats.remaining / myFundStats.deposited) * 100)) : 0;
                    const barColor = pct > 40
                      ? 'linear-gradient(90deg, #0d9668, #34d399)'
                      : pct > 15 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #d64545, #f87171)';
                    return (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 600 }}>
                            {Math.round(pct)}% متبقي
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 600 }}>
                            من {formatCurrency(myFundStats.deposited)}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 6, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: myFundStats.remaining < 0 ? '100%' : `${pct}%`, borderRadius: '999px', background: barColor }} />
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>

                {/* 3-column stats */}
                <Box sx={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  bgcolor: 'rgba(0,0,0,0.12)', borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {[
                    { label: 'إجمالي العهدة', val: myFundStats.deposited, color: '#6ee7b7' },
                    { label: 'المصروف', val: myFundStats.spent, color: '#fca5a5' },
                    { label: 'المتبقي', val: myFundStats.remaining, color: myFundStats.remaining >= 0 ? '#34d399' : '#f87171' },
                  ].map((s, i) => (
                    <Box key={i} sx={{ py: 1.25, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                      <Typography fontWeight={900} sx={{ color: s.color, fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(s.val)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.58rem', fontWeight: 600 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Alert strip */}
                {myFundStats.remaining < 0 && (
                  <Box sx={{ bgcolor: 'rgba(225,29,72,0.25)', px: 2.25, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid rgba(225,29,72,0.4)' }}>
                    <AlertTriangle size={15} color="#fca5a5" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <Typography fontWeight={800} sx={{ color: '#fca5a5', fontSize: '0.78rem' }}>التجاوز المالي مسجل كعجز، سيُخصم من رصيدك القادم</Typography>
                  </Box>
                )}
              </Box>
            ) : null}

            {/* Total expenses */}
            <Box sx={{
              px: 2.25, py: 2,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
            }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', mb: 0.5, fontWeight: 600 }}>إجمالي المصروفات</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'white', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalExpenses)}</Typography>
              </Box>
              <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.08)', px: 1.75, py: 0.9, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography fontWeight={800} color="white" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>{expenses.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.62rem' }}>سجل</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.08)', px: 1.75, py: 0.9, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography fontWeight={800} color="white" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>{topCategories.categoryCount}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.62rem' }}>فئة</Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
      )}
    >

        {/* ── أعلى الفئات — أشرطة خفيفة بدون مكتبة رسم ── */}
        {topCategories.rows.length > 0 && (
          <Box
            sx={{
              mb: 3,
              px: 2.25,
              py: 2.25,
              borderRadius: '20px',
              bgcolor: 'background.paper',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(31, 37, 33, 0.06)'}`,
              boxShadow: isDark
                ? '0 8px 26px rgba(0,0,0,0.3)'
                : '0 1px 2px rgba(25, 34, 29, 0.03), 0 8px 26px rgba(25, 34, 29, 0.05)',
            }}
          >
            <EtlalaSectionTitle title="توزيع المصروفات" subtitle="أعلى الفئات إنفاقاً" />
            <Stack spacing={1.75} sx={{ mt: 2 }}>
              {topCategories.rows.map((row, index) => {
                const pct = topCategories.grand > 0 ? (row.value / topCategories.grand) * 100 : 0;
                const barAlpha = [0.95, 0.78, 0.6, 0.45, 0.34, 0.26][index] ?? 0.26;
                const barColor = isDark ? alpha('#D4C9A3', barAlpha) : alpha('#2F3E34', barAlpha);
                return (
                  <Box key={row.key}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.6 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.76rem' }} noWrap>
                        {row.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.74rem', fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}>
                          {formatCurrency(row.value)}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.64rem', color: 'text.disabled', fontVariantNumeric: 'tabular-nums', minWidth: 30, textAlign: 'left' }}>
                          {pct.toFixed(0)}%
                        </Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ height: 7, borderRadius: '999px', bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(31, 37, 33, 0.05)', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${Math.max(pct, 2)}%`, borderRadius: '999px', bgcolor: barColor }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* ── Search & Filter ── */}
        <EtlalaSectionTitle title="سجل المصروفات" subtitle="فلترة حسب التصنيف والبحث" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="بحث في المصروفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={18} strokeWidth={2} color={theme.palette.text.secondary} style={{ opacity: 0.7 }} /></InputAdornment>,
            }}
            sx={[
              etlalaContentFieldSx,
              {
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' },
                },
              },
            ]}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '16px',
                bgcolor: 'background.paper',
                fontWeight: 600,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' },
              }}
            >
              <MenuItem value="all">كل التصنيفات</MenuItem>
              {Object.entries(expenseCategories).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* ── Results count ── */}
        {filteredExpenses.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 600 }}>
            عرض {visibleExpenses.length} من {filteredExpenses.length} سجل
          </Typography>
        )}

        {/* ── Expenses List ── */}
        <Stack spacing={1.25} sx={{ mb: 6 }}>
          {filteredExpenses.length === 0 ? (
            <EtlalaEmptyState
              icon={<TrendingDown size={46} strokeWidth={1.6} />}
              title={searchQuery || categoryFilter !== 'all' ? 'لا نتائج' : 'لا توجد مصروفات'}
              hint={searchQuery || categoryFilter !== 'all' ? 'عدّل البحث أو أعد «كل التصنيفات»' : 'اضغط «مصروف جديد» لإضافة أول سجل'}
              actionLabel={!searchQuery && categoryFilter === 'all' ? 'مصروف جديد' : undefined}
              onAction={!searchQuery && categoryFilter === 'all' ? openAddSheet : undefined}
            />
          ) : (
            visibleExpenses.map((exp) => {
              const clientName = clients.find(c => c.id === exp.clientId)?.name || 'مجهول';
              return (
                <EtlalaAccentSurface key={exp.id} accent="#d64545">
                  <Box sx={{ px: 2, py: 1.75 }}>
                    {/* السطر الأول: أيقونة + وصف | المبلغ */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{
                        width: 42, height: 42, borderRadius: '14px', flexShrink: 0,
                        display: 'grid', placeItems: 'center',
                        bgcolor: 'rgba(214,69,69,0.08)',
                        border: '1px solid rgba(214,69,69,0.14)',
                      }}>
                        <TrendingDown size={18} color="#d64545" strokeWidth={2} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={800} variant="body2" noWrap sx={{ mb: 0.35 }}>
                          {exp.description}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                          <Chip
                            label={getExpenseCategoryLabel(exp.category)}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)', color: 'text.secondary', flexShrink: 0 }}
                          />
                          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ minWidth: 0 }}>
                            <User size={12} color={theme.palette.text.disabled} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                              {clientName}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                      <Box sx={{ textAlign: 'left', flexShrink: 0 }}>
                        <Typography fontWeight={900} sx={{ color: '#d64545', fontSize: '0.98rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {formatCurrency(exp.amount)}
                        </Typography>
                        <ExpenseQuantityChip quantity={exp.quantity} unit={exp.unit} unitPrice={exp.unitPrice} amount={exp.amount} />
                      </Box>
                    </Stack>

                    {/* تذييل: تاريخ + رقم فاتورة + بواسطة — خط شعري فاصل */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{
                        mt: 1.25,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(31, 37, 33, 0.05)',
                        minWidth: 0,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                        <Calendar size={11} color={theme.palette.text.disabled} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums' }}>
                          {formatDate(exp.date)}
                        </Typography>
                        {exp.invoiceNumber ? (
                          <>
                            <Box aria-hidden sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled', mx: 0.35, flexShrink: 0 }} />
                            <FileText size={11} color={theme.palette.text.disabled} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <Typography variant="caption" color="text.disabled" fontWeight={600} noWrap sx={{ fontSize: '0.68rem' }}>
                              {exp.invoiceNumber}
                            </Typography>
                          </>
                        ) : null}
                      </Stack>
                      {exp.createdBy ? (
                        <Typography variant="caption" noWrap sx={{ color: 'text.disabled', fontSize: '0.66rem', fontWeight: 500, flexShrink: 1, minWidth: 0 }}>
                          {exp.createdBy}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>
                </EtlalaAccentSurface>
              );
            })
          )}

          {/* ── عرض المزيد — تحميل تدريجي خفيف ── */}
          {remainingCount > 0 && (
            <Button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              endIcon={<ChevronDown size={16} strokeWidth={2.2} />}
              sx={{
                alignSelf: 'center',
                mt: 1,
                px: 3,
                py: 1.1,
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: 'text.secondary',
                bgcolor: 'background.paper',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(31, 37, 33, 0.08)'}`,
                boxShadow: isDark ? 'none' : '0 1px 2px rgba(25, 34, 29, 0.04)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' },
              }}
            >
              عرض المزيد ({remainingCount})
            </Button>
          )}
        </Stack>
    </PageScaffold>

      {/* ── نافذة «مصروف جديد» — نفس النافذة الفورية المشتركة ── */}
      <QuickExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
};
