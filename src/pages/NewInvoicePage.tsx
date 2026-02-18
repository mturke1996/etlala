import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { clients, addInvoice, invoices } = useDataStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
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
    if (!clientId || items.some(i => !i.description)) return;
    
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

      <Container maxWidth="sm" sx={{ mt: -1 }}>
        {/* Client & Invoice Info */}
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <Typography fontWeight={700} sx={{ mb: 2, fontSize: '0.9rem', color: '#364036' }}>معلومات الفاتورة</Typography>
          <Stack spacing={2}>
            <TextField
              select fullWidth size="small" label="العميل" value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
              <MenuItem value="" onClick={() => navigate('/clients')}>
                <Typography color="primary" fontWeight={700}>+ عميل جديد</Typography>
              </MenuItem>
            </TextField>

            <TextField
              fullWidth size="small" label="رقم الفاتورة" value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                  <DatePicker label="الإصدار" value={issueDate} onChange={(val) => setIssueDate(val)}
                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                  <DatePicker label="الاستحقاق" value={dueDate} onChange={(val) => setDueDate(val)}
                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Items - Card based for mobile */}
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#364036' }}>البنود</Typography>
            <Button startIcon={<Add />} size="small" onClick={handleAddItem}
              sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#4a5d4a' }}
            >
              إضافة
            </Button>
          </Stack>

          <Stack spacing={2}>
            {items.map((item, idx) => (
              <Box key={item.id} sx={{ p: 2, bgcolor: '#fafaf8', borderRadius: 2, border: '1px solid #eee', position: 'relative' }}>
                {items.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}
                    sx={{ position: 'absolute', top: 4, left: 4, width: 28, height: 28 }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>بند {idx + 1}</Typography>
                <TextField fullWidth size="small" placeholder="الوصف" value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                />
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="الكمية" type="number" value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth size="small" label="السعر" type="number" value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#364036', borderRadius: 2, color: 'white' }}>
                      <Typography fontWeight={800} sx={{ fontSize: '0.85rem' }}>{Math.round(item.total)} د.ل</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Tax & Notes */}
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ fontSize: '0.85rem', color: '#555', minWidth: 50 }}>الضريبة</Typography>
              <TextField size="small" type="number" value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Typography fontWeight={700} sx={{ flexGrow: 1, textAlign: 'left', fontSize: '0.85rem' }}>{Math.round(taxAmount)} د.ل</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={800} sx={{ color: '#364036' }}>الإجمالي</Typography>
              <Typography fontWeight={900} sx={{ fontSize: '1.2rem', color: '#364036' }}>{Math.round(total)} د.ل</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <TextField
            label="ملاحظات" multiline rows={2} fullWidth size="small"
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات أو شروط الدفع..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Paper>
      </Container>

      {/* Sticky Save Button */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white', borderTop: '1px solid #eee', zIndex: 100 }}>
        <Container maxWidth="sm">
          <Button
            variant="contained" fullWidth size="large"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading || !clientId}
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

