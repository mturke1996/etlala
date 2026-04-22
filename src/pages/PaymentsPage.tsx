// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Box,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  Chip,
  Paper,
  alpha,
  Grid as MuiGrid,
} from '@mui/material';
import {
  Search,
  Payment,
  CalendarToday,
} from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaAccentSurface, EtlalaEmptyState, EtlalaSectionTitle, etlalaContentFieldSx } from '../components/etlala/EtlalaMobileUi';

const Grid = MuiGrid as any;

export const PaymentsPage = () => {
  const theme = useTheme();
  const { payments, clients, invoices } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

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
      headerExtra={(
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Paper sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>إجمالي المحصل</Typography>
              <Typography variant="body1" fontWeight={800} color="white">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Paper sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>عدد العمليات</Typography>
              <Typography variant="body1" fontWeight={800} color="white">{payments.length}</Typography>
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
            startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', opacity: 0.5 }} /></InputAdornment>,
          }}
          sx={[
            etlalaContentFieldSx,
            { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '14px', border: '1px solid', borderColor: 'divider', '& fieldset': { border: 'none' } } },
          ]}
        />

        <Stack spacing={1.5}>
          {filteredPayments.length === 0 ? (
            <EtlalaEmptyState
              icon={<Payment />}
              title={searchQuery ? 'لا نتائج' : 'لا توجد مدفوعات'}
              hint={searchQuery ? 'غيّر نص البحث أو امسح الحقل' : 'سجّل دفعة من بروفايل العميل أو من الفواتير'}
            />
          ) : (
            filteredPayments.map((payment) => {
              const client = clients.find(c => c.id === payment.clientId);
              const invoice = invoices.find(inv => inv.id === payment.invoiceId);
              const clientName = client?.name || invoice?.tempClientName || 'عميل غير معروف';
              return (
                <EtlalaAccentSurface key={payment.id} accent={theme.palette.success.main}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={800} variant="body2">
                          {clientName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                          <CalendarToday sx={{ fontSize: 13 }} />
                          <Typography variant="caption">{formatDate(payment.paymentDate)}</Typography>
                          <Typography variant="caption" component="span">•</Typography>
                          <Chip
                            label={getPaymentMethodLabel(payment.paymentMethod)}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                          />
                        </Stack>
                      </Box>
                      <Typography fontWeight={800} color="success.main" variant="body1" sx={{ whiteSpace: 'nowrap', mr: 1, fontFamily: 'Outfit, sans-serif' }}>
                        +{formatCurrency(payment.amount)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </EtlalaAccentSurface>
              );
            })
          )}
        </Stack>
    </PageScaffold>
  );
};
