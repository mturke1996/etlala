// @ts-nocheck
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, TextField, InputAdornment, Chip,
  Stack, Paper, Grid as MuiGrid, useTheme,
} from '@mui/material';
import { Add, Search, Description } from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency, formatDate, getStatusLabel } from '../utils/formatters';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaAccentSurface, EtlalaEmptyState, EtlalaSectionTitle } from '../components/etlala/EtlalaMobileUi';

const Grid = MuiGrid as any;

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { invoices, clients } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const client = clients.find(c => c.id === inv.clientId);
      const clientName = client?.name || inv.tempClientName || '';
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, clients, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partially_paid': return 'warning';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      default: return 'primary';
    }
  };

  return (
    <PageScaffold
      title="الفواتير"
      subtitle="متابعة الفواتير والحالات"
      backTo="/"
      rightAction={(
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          onClick={() => navigate('/invoices/new')}
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            borderRadius: 2.5,
            px: 2,
            fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              color: '#ffffff',
              boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
            },
            '& .MuiButton-startIcon': { color: '#ffffff' },
          }}
        >
          إنشاء
        </Button>
      )}
      headerExtra={(
        <Stack spacing={1.5}>
          <Grid container spacing={1}>
            {[
              { label: 'المفوتر', value: formatCurrency(stats.total) },
              { label: 'المحصل', value: formatCurrency(stats.paid) },
              { label: 'المستحق', value: formatCurrency(stats.pending) },
            ].map((stat, i) => (
              <Grid size={{ xs: 4 }} key={i}>
                <Paper sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', mb: 0.3 }}>{stat.label}</Typography>
                  <Typography fontWeight={800} color="white" sx={{ fontSize: '0.75rem' }}>{stat.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <TextField
            fullWidth
            size="small"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2.5,
                height: 40, fontSize: '0.85rem',
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#4a5d4a', fontSize: 20 }} /></InputAdornment>,
            }}
          />
        </Stack>
      )}
    >
        <Stack spacing={1.5}>
        <EtlalaSectionTitle title="قائمة الفواتير" subtitle="رقم الفاتورة، العميل، والحالة" />
        <Stack direction="row" spacing={0.8} sx={{ overflowX: 'auto', pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
          {['all', 'paid', 'partially_paid', 'draft', 'overdue'].map((status) => (
            <Chip
              key={status}
              label={status === 'all' ? 'الكل' : getStatusLabel(status)}
              onClick={() => setFilterStatus(status)}
              variant={filterStatus === status ? 'filled' : 'outlined'}
              color={filterStatus === status && status !== 'all' ? getStatusColor(status) as any : 'default'}
              sx={{ borderRadius: 2, height: 30, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
            />
          ))}
        </Stack>

        <Stack spacing={1.25}>
          {filteredInvoices.length === 0 ? (
            <EtlalaEmptyState
              icon={<Description />}
              title="لا توجد فواتير مطابقة"
              hint="غيّر الحالة، أو أضف فاتورة جديدة"
            />
          ) : (
            filteredInvoices.map((inv) => {
              const client = clients.find(c => c.id === inv.clientId);
              const isPaid = inv.status === 'paid';
              return (
                <EtlalaAccentSurface
                  key={inv.id}
                  accent={isPaid ? theme.palette.success.main : theme.palette.warning.main}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={800} sx={{ fontSize: '0.9rem' }}>
                          #{inv.invoiceNumber}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.3 }}>
                          {client?.name || inv.tempClientName || 'عميل غير معروف'} • {formatDate(inv.issueDate)}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.3}>
                        <Typography fontWeight={800} sx={{ fontSize: '0.9rem', color: 'primary.main', fontFamily: 'Outfit, sans-serif' }}>
                          {formatCurrency(inv.total)}
                        </Typography>
                        <Chip
                          label={getStatusLabel(inv.status)}
                          color={getStatusColor(inv.status) as any}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1.5, height: 20, fontSize: '0.6rem' }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </EtlalaAccentSurface>
              );
            })
          )}
        </Stack>
        </Stack>
    </PageScaffold>
  );
};
