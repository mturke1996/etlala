// @ts-nocheck
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Grid as MuiGrid,
  Fab,
  LinearProgress,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Description,
  Close,
  TrendingUp,
  AccountBalanceWallet,
  PendingActions,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency, getStatusLabel } from '../utils/formatters';
import { PageScaffold } from '../components/layout/PageScaffold';
import {
  EtlalaEmptyState,
  etlalaContentFieldSx,
  etlalaHeroActionButtonSx,
} from '../components/etlala/EtlalaMobileUi';
import { InvoiceListItem, InvoiceMonthHeader } from '../components/invoices/InvoiceListItem';
import { premiumTokens } from '../theme/tokens';

dayjs.locale('ar');

const Grid = MuiGrid as any;

const FILTER_STATUSES = ['all', 'paid', 'partially_paid', 'draft', 'overdue', 'sent'] as const;

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { invoices, clients } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const client = clients.find((c) => c.id === inv.clientId);
        const clientName = client?.name || inv.tempClientName || '';
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          clientName.toLowerCase().includes(q);
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      );
  }, [invoices, clients, searchQuery, filterStatus]);

  const groupedInvoices = useMemo(() => {
    const groups: { label: string; items: typeof filteredInvoices }[] = [];
    const map = new Map<string, typeof filteredInvoices>();

    filteredInvoices.forEach((inv) => {
      const key = dayjs(inv.issueDate).format('MMMM YYYY');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    });

    map.forEach((items, label) => groups.push({ label, items }));
    return groups;
  }, [filteredInvoices]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pending = Math.max(0, total - paid);
    const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;
    const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
    return { total, paid, pending, collectionRate, overdueCount };
  }, [invoices]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: invoices.length };
    invoices.forEach((inv) => {
      counts[inv.status] = (counts[inv.status] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  const filteredTotal = useMemo(
    () => filteredInvoices.reduce((s, inv) => s + inv.total, 0),
    [filteredInvoices]
  );

  let rowIndex = 0;

  return (
    <Box sx={{ position: 'relative' }}>
      <PageScaffold
        title="الفواتير"
        subtitle={`${invoices.length} فاتورة · ${stats.collectionRate}% محصّل`}
        backTo="/"
        rightAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/invoices/new')}
            sx={{
              ...etlalaHeroActionButtonSx,
              minHeight: 38,
              px: 1.85,
            }}
          >
            فاتورة جديدة
          </Button>
        }
        headerExtra={
          <Stack spacing={1.25}>
            <Grid container spacing={1}>
              {[
                { label: 'المفوتر', value: formatCurrency(stats.total), icon: TrendingUp },
                { label: 'المحصل', value: formatCurrency(stats.paid), icon: AccountBalanceWallet },
                { label: 'المستحق', value: formatCurrency(stats.pending), icon: PendingActions },
              ].map((stat, i) => (
                <Grid size={{ xs: 4 }} key={i}>
                  <Paper
                    sx={{
                      p: 1.15,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.35 }}>
                      <stat.icon sx={{ fontSize: 12, color: premiumTokens.accent, opacity: 0.9 }} />
                      <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.58rem', fontWeight: 700 }}>
                        {stat.label}
                      </Typography>
                    </Stack>
                    <Typography
                      fontWeight={800}
                      color="white"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        fontFamily: 'Outfit, sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                  نسبة التحصيل
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: 'white',
                    fontFamily: 'Outfit, sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {stats.collectionRate}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stats.collectionRate}
                sx={{
                  height: 5,
                  borderRadius: 99,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 99,
                    bgcolor: premiumTokens.accent,
                  },
                }}
              />
            </Box>
          </Stack>
        }
      >
        <Stack spacing={2}>
          {/* بحث */}
          <TextField
            fullWidth
            size="small"
            placeholder="ابحث برقم الفاتورة أو اسم العميل…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={[
              etlalaContentFieldSx,
              {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  minHeight: 48,
                  fontSize: '0.875rem',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& fieldset': { border: 'none' },
                },
              },
            ]}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: premiumTokens.primary, fontSize: 21, opacity: 0.7 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="مسح البحث"
                    onClick={() => setSearchQuery('')}
                    sx={{ mr: -0.5 }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* فلاتر — تمرير أفقي */}
          <Box
            sx={{
              mx: -2,
              px: 2,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Stack direction="row" spacing={0.75} sx={{ pb: 0.25, width: 'max-content', minWidth: '100%' }}>
              {FILTER_STATUSES.map((status) => {
                const selected = filterStatus === status;
                const count = statusCounts[status] ?? 0;
                if (status !== 'all' && count === 0) return null;
                return (
                  <Chip
                    key={status}
                    label={
                      status === 'all'
                        ? `الكل (${count})`
                        : `${getStatusLabel(status)} (${count})`
                    }
                    onClick={() => setFilterStatus(status)}
                    sx={{
                      borderRadius: '20px',
                      height: 36,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      px: 0.25,
                      border: '1.5px solid',
                      borderColor: selected ? 'transparent' : alpha(premiumTokens.primary, 0.14),
                      bgcolor: selected
                        ? status === 'all'
                          ? premiumTokens.primary
                          : alpha(premiumTokens.accent, 0.28)
                        : 'background.paper',
                      color: selected
                        ? status === 'all'
                          ? '#FFFFFF'
                          : premiumTokens.primaryDark
                        : 'text.secondary',
                      boxShadow: selected
                        ? `0 2px 10px ${alpha(premiumTokens.primary, 0.2)}`
                        : '0 1px 3px rgba(31,37,33,0.04)',
                      transition: 'transform 0.12s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {/* شريط ملخص النتائج */}
          {filteredInvoices.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.25,
                py: 1,
                borderRadius: 2.5,
                bgcolor: isDark ? alpha(premiumTokens.primary, 0.2) : alpha(premiumTokens.primary, 0.06),
                border: `1px solid ${alpha(premiumTokens.primary, isDark ? 0.25 : 0.1)}`,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                {filteredInvoices.length} فاتورة
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: 'primary.main',
                  fontFamily: 'Outfit, sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(filteredTotal)}
              </Typography>
            </Box>
          ) : null}

          {stats.overdueCount > 0 && filterStatus === 'all' && !searchQuery ? (
            <Box
              onClick={() => setFilterStatus('overdue')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setFilterStatus('overdue');
              }}
              sx={{
                px: 1.5,
                py: 1.1,
                borderRadius: 2.5,
                bgcolor: alpha('#B54747', isDark ? 0.14 : 0.08),
                border: `1px solid ${alpha('#B54747', 0.22)}`,
                cursor: 'pointer',
                transition: 'transform 0.12s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9A3838' }}>
                {stats.overdueCount} فاتورة متأخرة — اضغط للعرض
              </Typography>
            </Box>
          ) : null}

          {/* القائمة */}
          {filteredInvoices.length === 0 ? (
            <EtlalaEmptyState
              icon={<Description />}
              title={searchQuery ? 'لا نتائج للبحث' : 'لا توجد فواتير مطابقة'}
              hint={
                searchQuery
                  ? 'جرّب رقم فاتورة أو اسم عميل مختلف'
                  : 'غيّر الفلتر أو أنشئ فاتورة جديدة'
              }
              actionLabel="فاتورة جديدة"
              onAction={() => navigate('/invoices/new')}
            />
          ) : (
            <Stack spacing={0.5}>
              {groupedInvoices.map((group) => (
                <Box key={group.label}>
                  <InvoiceMonthHeader label={group.label} count={group.items.length} />
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: isDark
                        ? '0 4px 24px rgba(0,0,0,0.22)'
                        : '0 2px 12px rgba(31, 37, 33, 0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
                    }}
                  >
                    {group.items.map((inv, i) => {
                      const client = clients.find((c) => c.id === inv.clientId);
                      const clientName = client?.name || inv.tempClientName || 'عميل غير معروف';
                      const idx = rowIndex++;
                      return (
                        <InvoiceListItem
                          key={inv.id}
                          invoice={inv}
                          clientName={clientName}
                          isLast={i === group.items.length - 1}
                          index={idx}
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                        />
                      );
                    })}
                  </Paper>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </PageScaffold>

      {/* FAB — إضافة سريعة على الجوال */}
      <Fab
        aria-label="فاتورة جديدة"
        onClick={() => navigate('/invoices/new')}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          insetInlineEnd: 16,
          bottom: 'calc(78px + env(safe-area-inset-bottom, 0px))',
          zIndex: 1090,
          width: 56,
          height: 56,
          color: '#FFFFFF',
          background: `linear-gradient(180deg, ${premiumTokens.primary} 0%, ${premiumTokens.primaryDark} 100%)`,
          boxShadow: `0 6px 20px ${alpha(premiumTokens.primary, 0.38)}`,
          '&:active': { transform: 'scale(0.94)' },
          transition: 'transform 0.12s ease, box-shadow 0.2s ease',
        }}
      >
        <Add sx={{ fontSize: 26 }} />
      </Fab>
    </Box>
  );
};
