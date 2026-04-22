// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
  List,
  ListItemButton,
  Grid as MuiGrid,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  ArrowBack,
  PersonAdd,
  AttachMoney,
  Person,
  Phone,
  LocationOn,
  Receipt,
  CalendarToday,
  CheckRounded,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';

const Grid = MuiGrid as any;

import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { InvoiceItem } from '../types';
import { PageScaffold } from '../components/layout/PageScaffold';

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: '#faf9f7',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
    '&.Mui-focused fieldset': { borderColor: '#4a5d4a', borderWidth: 2 },
    '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 4px 20px rgba(74,93,74,0.08)' }
  }
};

export const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { clients, addInvoice, updateInvoice, invoices } = useDataStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Form State
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [clientSearch, setClientSearch] = useState('');

  const filteredPickerClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
    );
  }, [clients, clientSearch]);
  const [tempClientName, setTempClientName] = useState('');
  const [tempClientPhone, setTempClientPhone] = useState('');
  const [tempClientAddress, setTempClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Dayjs | null>(dayjs());
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  // Auto-generate invoice number and populate form when editing
  useEffect(() => {
    if (editId) {
      if (hasInitialized) return; // Prevent overwriting user's typing when invoices reload
      const existing = invoices.find(inv => inv.id === editId);
      if (existing) {
        setClientId(existing.clientId);
        setTempClientName(existing.tempClientName || '');
        setTempClientPhone(existing.tempClientPhone || '');
        setTempClientAddress(existing.tempClientAddress || '');
        setInvoiceNumber(existing.invoiceNumber);
        setIssueDate(dayjs(existing.issueDate));
        setDueDate(dayjs(existing.dueDate));
        setItems(existing.items);
        setTaxRate(existing.taxRate);
        setNotes(existing.notes || '');
        setHasInitialized(true);
      }
    } else {
      let maxNum = 1000;
      invoices.forEach(inv => {
        const match = inv.invoiceNumber.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      setInvoiceNumber(`INV-${maxNum + 1}`);
    }
  }, [invoices, editId]);

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
    if (clientId === 'temp' && !tempClientName.trim()) {
      alert('يرجى إدخال اسم العميل المؤقت');
      return;
    }
    if (items.some(i => !i.description)) {
      alert('يرجى ملء وصف جميع البنود');
      return;
    }
    
    setLoading(true);
    try {
      const invoiceData = {
        invoiceNumber,
        clientId,
        ...(clientId === 'temp' ? { 
          tempClientName: tempClientName.trim(),
          tempClientPhone: tempClientPhone.trim(),
          tempClientAddress: tempClientAddress.trim(),
        } : {
          tempClientName: '',
          tempClientPhone: '',
          tempClientAddress: '',
        }),
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        issueDate: issueDate?.toISOString() || new Date().toISOString(),
        dueDate: dueDate?.toISOString() || new Date().toISOString(),
        notes,
        updatedAt: new Date().toISOString(),
      };

      if (editId) {
        await updateInvoice(editId, invoiceData);
      } else {
        await addInvoice({
          id: crypto.randomUUID(),
          ...invoiceData,
          status: 'draft', // Default is draft on insert
          createdAt: new Date().toISOString(),
          createdBy: user?.displayName || 'غير معروف',
        });
      }
      navigate('/invoices');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 12, minHeight: '100dvh', bgcolor: 'background.default' }}>
      <PageScaffold
        title={editId ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
        subtitle="بيانات العميل والبنود"
        backTo="/invoices"
        contentOffset={-1}
        headerExtra={(
          <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>الإجمالي</Typography>
              <Typography fontWeight={900} color="white" sx={{ fontSize: '1.25rem' }}>{Math.round(total)} د.ل</Typography>
            </Stack>
          </Paper>
        )}
      >
        {/* Client — أسماء فقط، تصميم نظيف */}
        <Box
          sx={{
            mb: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
            overflow: 'hidden',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf9f6'),
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 32px -12px rgba(20,30,20,0.08)',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (t) =>
                t.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' : 'linear-gradient(180deg, #fff 0%, #f7f5f0 100%)',
            }}
          >
            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, letterSpacing: 1, color: 'text.secondary', mb: 1.25, fontSize: '0.65rem' }}>
              العميل
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="ابحث بالاسم (أو رقم هاتف للتصفية)…"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              sx={inputStyle}
            />
          </Box>
          <List disablePadding sx={{ maxHeight: 280, overflow: 'auto', py: 0.5 }}>
            {filteredPickerClients.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  لا يوجد عميل مطابق
                </Typography>
                <Button variant="text" size="small" onClick={() => navigate('/clients')} sx={{ mt: 1, fontWeight: 700 }}>
                  فتح سجل العملاء
                </Button>
              </Box>
            ) : (
              filteredPickerClients.map((c) => {
                const selected = clientId === c.id;
                return (
                  <ListItemButton
                    key={c.id}
                    selected={selected}
                    onClick={() => setClientId(c.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      minHeight: 52,
                      borderRadius: 2,
                      mx: 1,
                      my: 0.35,
                      border: '1px solid transparent',
                      transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                      '&.Mui-selected': {
                        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(90, 120, 90, 0.25)' : 'rgba(61, 79, 61, 0.09)'),
                        border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(130,160,130,0.35)' : 'rgba(61, 79, 61, 0.2)'}`,
                        boxShadow: (t) => (t.palette.mode === 'light' ? '0 2px 12px rgba(61,79,61,0.08)' : 'none'),
                        borderInlineStart: '3px solid',
                        borderInlineStartColor: 'primary.main',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(90, 120, 90, 0.32)' : 'rgba(61, 79, 61, 0.12)'),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1.5 }}>
                      <Typography
                        sx={{
                          fontWeight: selected ? 800 : 600,
                          fontSize: '0.95rem',
                          letterSpacing: 0.2,
                          color: 'text.primary',
                          lineHeight: 1.35,
                        }}
                      >
                        {c.name}
                      </Typography>
                      {selected && (
                        <CheckRounded sx={{ fontSize: 22, color: 'primary.main', flexShrink: 0, opacity: 0.95 }} />
                      )}
                    </Box>
                  </ListItemButton>
                );
              })
            )}
          </List>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              p: 1.5,
              gap: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(61,79,61,0.03)'),
            }}
          >
            <Button
              fullWidth
              variant={clientId === 'temp' ? 'contained' : 'outlined'}
              onClick={() => setClientId('temp')}
              sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
            >
              عميل مؤقت
            </Button>
            <Button fullWidth variant="outlined" onClick={() => navigate('/clients')} sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}>
              تسجيل عميل دائم
            </Button>
          </Stack>
        </Box>

        {clientId === 'temp' && (
          <Box sx={{ mb: 2.5, p: 2.25, borderRadius: 3, border: '1px dashed', borderColor: 'secondary.main', bgcolor: 'rgba(200, 192, 176, 0.06)' }}>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, mb: 1.5, display: 'block' }}>
              بيانات العميل المؤقت (لا تُحفَظ في سجل العملاء)
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="الاسم *"
                value={tempClientName}
                onChange={(e) => setTempClientName(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person sx={{ color: '#888' }} /></InputAdornment>,
                }}
                sx={inputStyle}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف (اختياري)"
                    value={tempClientPhone}
                    onChange={(e) => setTempClientPhone(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#888' }} /></InputAdornment>,
                    }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="العنوان (اختياري)"
                    value={tempClientAddress}
                    onChange={(e) => setTempClientAddress(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#888' }} /></InputAdornment>,
                    }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Box>
        )}

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block', ml: 0.5 }}>
                تفاصيل الفاتورة
              </Typography>
              <TextField
                fullWidth
                label="رقم الفاتورة (تلقائي)"
                value={invoiceNumber}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start"><Receipt sx={{ color: '#4a5d4a', opacity: 0.8 }} /></InputAdornment>,
                }}
                sx={{ ...inputStyle, pointerEvents: 'none', opacity: 0.8 }}
              />
            </Box>

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
                        variant: 'outlined',
                        sx: inputStyle,
                        InputProps: {
                          startAdornment: <InputAdornment position="start"><CalendarToday sx={{ color: '#4a5d4a', opacity: 0.8, fontSize: 20 }} /></InputAdornment>,
                        }
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
                        variant: 'outlined',
                        sx: inputStyle,
                        InputProps: {
                          startAdornment: <InputAdornment position="start"><CalendarToday sx={{ color: '#4a5d4a', opacity: 0.8, fontSize: 20 }} /></InputAdornment>,
                        }
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

          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {items.map((item, idx) => (
              <Box key={item.id}>
                {idx > 0 && <Divider />}
                <Box
                  sx={{
                    p: 2.5,
                    position: 'relative',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') },
                  }}
                >
                {items.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                    sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(214,69,69,0.08)' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}

                <Stack spacing={2} mt={items.length > 1 ? 2.25 : 0}>
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
                        onWheel={(e) => (e.target as HTMLElement).blur()}
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
                        onWheel={(e) => (e.target as HTMLElement).blur()}
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
                </Box>
              </Box>
            ))}
          </Paper>
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
                  onWheel={(e) => (e.target as HTMLElement).blur()}
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
      </PageScaffold>

      {/* Sticky Save Button */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, pb: 'calc(env(safe-area-inset-bottom) + 16px)', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', zIndex: 1300, boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
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
            {loading ? 'جاري الحفظ...' : (editId ? 'تحديث البيانات' : 'حفظ الفاتورة')}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

