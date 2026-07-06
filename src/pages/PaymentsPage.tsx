// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  Chip,
  Paper,
  Grid as MuiGrid,
} from '@mui/material';
import { Calendar, HandCoins, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaAccentSurface, EtlalaEmptyState, EtlalaSectionTitle, etlalaContentFieldSx, etlalaHeroActionButtonSx } from '../components/etlala/EtlalaMobileUi';

const Grid = MuiGrid as any;

export const PaymentsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { payments, clients, invoices } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const moneySx = { fontFamily: "'Sora','Montserrat','Outfit','Inter',sans-serif", fontVariantNumeric: 'tabular-nums lining-nums' } as const;

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const client = clients.find(c => c.id === payment.clientId);
      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
      const clientName = client?.name || invoice?.tempClientName || '';
      return (
        payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, clients, invoices, searchQuery]);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'نقدي',
      check: 'شيك',
      bank_transfer: 'تحويل بنكي',
      mobile_payment: 'إلكتروني',
    };
    return labels[method] || method;
  };

  return (
    <PageScaffold
      title="المدفوعات"
      subtitle={`${payments.length} عملية تحصيل`}
      backTo="/"
      rightAction={(
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={15} strokeWidth={2.2} />}
          onClick={() => navigate('/invoices')}
          sx={etlalaHeroActionButtonSx}
        >
          تحصيل جديد
        </Button>
      )}
      headerExtra={(
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Paper sx={{
              px: 1.65, py: 1.35,
              borderRadius: '18px',
              bgcolor: 'rgba(255,255,255,0.1)',
              boxShadow: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)', display: 'block', fontWeight: 650 }}>إجمالي المحصل</Typography>
                <HandCoins size={14} color="rgba(255,255,255,0.84)" strokeWidth={2.1} />
              </Stack>
              <Typography variant="body1" fontWeight={850} color="white" sx={{ lineHeight: 1.2, ...moneySx }}>
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Paper sx={{
              px: 1.65, py: 1.35,
              borderRadius: '18px',
              bgcolor: 'rgba(255,255,255,0.1)',
              boxShadow: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)', display: 'block', fontWeight: 650, mb: 0.4 }}>عدد العمليات</Typography>
              <Typography variant="body1" fontWeight={850} color="white" sx={{ lineHeight: 1.2, ...moneySx }}>{payments.length}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    >
        <EtlalaSectionTitle title="سجل المدفوعات" subtitle="ابحث بالعميل أو الملاحظات" />
        <TextField
          fullWidth
          placeholder="بحث في المدفوعات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={18} strokeWidth={2} color={theme.palette.text.secondary} style={{ opacity: 0.6 }} /></InputAdornment>,
          }}
          sx={[
            etlalaContentFieldSx,
            { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '16px', border: '1px solid', borderColor: 'divider', '& fieldset': { border: 'none' } } },
          ]}
        />

        <Stack spacing={1.25} sx={{ mb: 6 }}>
          {filteredPayments.length === 0 ? (
            <EtlalaEmptyState
              icon={<HandCoins size={46} strokeWidth={1.6} />}
              title={searchQuery ? 'لا نتائج' : 'لا توجد مدفوعات'}
              hint={searchQuery ? 'غيّر نص البحث أو امسح الحقل' : 'سجّل دفعة من بروفايل العميل أو من الفواتير'}
            />
          ) : (
            filteredPayments.map((payment) => {
              const client = clients.find(c => c.id === payment.clientId);
              const invoice = invoices.find(inv => inv.id === payment.invoiceId);
              const clientName = client?.name || invoice?.tempClientName || 'عميل غير معروف';
              return (
                <EtlalaAccentSurface key={payment.id} accent={theme.palette.primary.main}>
                  <Box sx={{ px: 2.25, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.75}>
                      {/* البداية: أيقونة + معلومات */}
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{
                          width: 42, height: 42, borderRadius: '14px', flexShrink: 0,
                          display: 'grid', placeItems: 'center',
                          bgcolor: isDark ? 'rgba(110,231,183,0.08)' : 'rgba(47,62,52,0.07)',
                          border: `1px solid ${isDark ? 'rgba(110,231,183,0.14)' : 'rgba(47,62,52,0.1)'}`,
                        }}>
                          <HandCoins size={18} color={theme.palette.primary.main} strokeWidth={2} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={800} variant="body2" noWrap>
                            {clientName}
                          </Typography>
                          <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary" sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                            <Stack direction="row" alignItems="center" spacing={0.4}>
                              <Calendar size={12} color={theme.palette.text.disabled} strokeWidth={2} />
                              <Typography variant="caption" fontWeight={500}>{formatDate(payment.paymentDate)}</Typography>
                            </Stack>
                            <Chip
                              label={getPaymentMethodLabel(payment.paymentMethod)}
                              size="small"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: isDark ? 'rgba(110,231,183,0.1)' : 'rgba(47, 62, 52, 0.08)', color: 'primary.main', borderRadius: '8px' }}
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      {/* النهاية: المبلغ */}
                      <Typography fontWeight={900} color="primary.main" sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.98rem', ...moneySx }}>
                        +{formatCurrency(payment.amount)}
                      </Typography>
                    </Stack>
                  </Box>
                </EtlalaAccentSurface>
              );
            })
          )}
        </Stack>
    </PageScaffold>
  );
};
