import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Stack,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  ArrowBack,
  PersonAdd,
  AttachMoney,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';

import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { InvoiceItem } from '../types';

export const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients, addInvoice, invoices } = useDataStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);

  // Form State
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Dayjs | null>(dayjs());
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  // Auto-generate invoice number (simple logic)
  useEffect(() => {
    const nextNum = invoices.length + 1001;
    setInvoiceNumber(`INV-${nextNum}`);
  }, [invoices]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total if qty or price changes
        if (field === 'quantity' || field === 'unitPrice') {
           updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (!clientId) {
      // You should import toast/msg or use window.alert if toast is not available in this scope, 
      // but assuming consistent usage pattern, we might need to import 'toast' from react-hot-toast if not present.
      // Based on previous files, 'msg' helper was used or 'toast'.
      // Let's use console.error or alert if we can't easily add import.
      // Better: add toast import.
      // For now, I'll assume toast is available or use alert as fallback.
      alert('يرجى اختيار العميل أولاً');
      return;
    }
    if (items.some(i => !i.description)) {
      alert('يرجى ملء وصف جميع البنود');
      return;
    }
    
    setLoading(true);
    try {
      await addInvoice({
        id: crypto.randomUUID(),
        invoiceNumber,
        clientId,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: 'draft', // Default is draft
        issueDate: issueDate?.toISOString() || new Date().toISOString(),
        dueDate: dueDate?.toISOString() || new Date().toISOString(),
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.displayName || 'غير معروف',
      });
      navigate('/invoices');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 12, minHeight: '100vh', bgcolor: '#f5f3ef' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)', pt: 2, pb: 3, px: 2, color: 'white' }}>
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <IconButton onClick={() => navigate('/invoices')} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              <ArrowBack />
            </IconButton>
            <Typography fontWeight={800} sx={{ fontSize: '1.2rem' }}>فاتورة جديدة</Typography>
          </Stack>

          {/* Summary */}
          <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>الإجمالي</Typography>
              <Typography fontWeight={900} color="white" sx={{ fontSize: '1.3rem' }}>{Math.round(total)} د.ل</Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -2, pb: 4 }}>
        {/* Client & Invoice Info */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              label="العميل"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              variant="filled"
              InputProps={{ disableUnderline: true }}
              sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, '&.Mui-focused': { bgcolor: 'rgba(0,0,0,0.06)' } } }}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
              <MenuItem value="" onClick={() => navigate('/clients')}>
                <Typography color="primary" fontWeight={700}>+ عميل جديد</Typography>
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="رقم الفاتورة"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              variant="filled"
              InputProps={{ disableUnderline: true }}
              sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' } }}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                  <DatePicker 
                    label="تاريخ الإصدار" 
                    value={issueDate} 
                    onChange={(val) => setIssueDate(val)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        variant: 'filled',
                        InputProps: { disableUnderline: true },
                        sx: { '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' } }
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                  <DatePicker 
                    label="تاريخ الاستحقاق" 
                    value={dueDate} 
                    onChange={(val) => setDueDate(val)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        variant: 'filled',
                        InputProps: { disableUnderline: true },
                        sx: { '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' } }
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Items */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary' }}>البنود</Typography>
            <Button 
              startIcon={<Add />} 
              onClick={handleAddItem}
              sx={{ 
                bgcolor: 'rgba(74,93,74,0.1)', 
                color: '#4a5d4a', 
                fontWeight: 800, 
                borderRadius: 3,
                px: 2,
                '&:hover': { bgcolor: 'rgba(74,93,74,0.2)' }
              }}
            >
              إضافة بند
            </Button>
          </Stack>

          <Stack spacing={2}>
            {items.map((item, idx) => (
              <Paper 
                key={item.id} 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 4, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(0.99)' }
                }}
              >
                {items.length > 1 && (
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveItem(item.id)}
                    sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(214,69,69,0.1)' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
                
                <Stack spacing={2} mt={items.length > 1 ? 2 : 0}>
                  <TextField 
                    fullWidth 
                    placeholder="وصف البند / الخدمة" 
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    variant="filled"
                    multiline
                    InputProps={{ disableUnderline: true }}
                    sx={{ 
                      '& .MuiFilledInput-root': { 
                        borderRadius: 3, 
                        bgcolor: 'rgba(0,0,0,0.03)', 
                        fontSize: '1rem', 
                        fontWeight: 500 
                      } 
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <TextField 
                        fullWidth 
                        label="الكمية" 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        variant="filled"
                        InputProps={{ disableUnderline: true, inputProps: { min: 1 } }}
                        sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.03)' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField 
                        fullWidth 
                        label="السعر" 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.03)' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center',
                        bgcolor: '#364036', 
                        borderRadius: 3, 
                        color: 'white',
                        py: 1
                      }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>الإجمالي</Typography>
                        <Typography fontWeight={800}>{Math.round(item.total)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Tax & Notes */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 600 }}>نسبة الضريبة</Typography>
                <TextField 
                  size="small" 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  variant="filled"
                  InputProps={{ 
                    disableUnderline: true,
                    endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>%</Typography> 
                  }}
                  sx={{ width: 80, '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', px: 1 } }}
                />
              </Stack>
              <Typography fontWeight={700} color="text.secondary">{Math.round(taxAmount)} د.ل</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={800}>الإجمالي النهائي</Typography>
              <Typography variant="h5" fontWeight={900} color="primary">{Math.round(total)} د.ل</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, mb: 10, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            label="ملاحظات وشروط" 
            multiline 
            rows={3} 
            fullWidth 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            variant="filled"
            InputProps={{ disableUnderline: true }}
            sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' } }}
          />
        </Paper>
      </Container>

      {/* Sticky Save Button */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', zIndex: 1300, boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
        <Container maxWidth="sm">
          <Button
            variant="contained" fullWidth size="large"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              py: 1.5, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem',
              bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' },
              boxShadow: '0 4px 14px rgba(74,93,74,0.4)',
            }}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

