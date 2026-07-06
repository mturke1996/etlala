// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  Stack,
  InputAdornment,
  Divider,
  List,
  ListItemButton,
  Grid as MuiGrid,
  alpha,
  useTheme,
  Fade,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Person,
  Phone,
  LocationOn,
  Receipt,
  CalendarToday,
  CheckRounded,
  Search,
  ArrowForward,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Grid = MuiGrid as any;

import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { InvoiceItem } from '../types';
import { PageScaffold } from '../components/layout/PageScaffold';
import { etlalaHeroActionButtonSx } from '../components/etlala/EtlalaMobileUi';
import { premiumTokens } from '../theme/tokens';

// ═══════════════════════════════════════════════════════════
// Design Tokens - Soft, organic, mobile-first
// ═══════════════════════════════════════════════════════════
const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

const SHADOWS = {
  sm: '0 1px 2px rgba(47, 62, 52, 0.04), 0 1px 3px rgba(47, 62, 52, 0.06)',
  md: '0 4px 6px -1px rgba(47, 62, 52, 0.05), 0 2px 4px -1px rgba(47, 62, 52, 0.03)',
  lg: '0 10px 15px -3px rgba(47, 62, 52, 0.08), 0 4px 6px -2px rgba(47, 62, 52, 0.04)',
  inset: 'inset 0 2px 4px rgba(47, 62, 52, 0.03)',
};

const MONEY_SX = {
  fontFamily: "'Sora', 'Montserrat', 'Outfit', 'Inter', sans-serif",
  fontVariantNumeric: 'tabular-nums lining-nums',
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
} as const;

export const NewInvoicePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { clients, addInvoice, updateInvoice, invoices } = useDataStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [clientSearch, setClientSearch] = useState('');
  const [tempClientName, setTempClientName] = useState('');
  const [tempClientPhone, setTempClientPhone] = useState('');
  const [tempClientAddress, setTempClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Dayjs | null>(dayjs());
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  const filteredPickerClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
    );
  }, [clients, clientSearch]);

  useEffect(() => {
    if (editId) {
      if (hasInitialized) return;
      const existing = invoices.find((inv) => inv.id === editId);
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
      invoices.forEach((inv) => {
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
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error('يرجى اختيار العميل أولاً');
      return;
    }
    if (clientId === 'temp' && !tempClientName.trim()) {
      toast.error('يرجى إدخال اسم العميل المؤقت');
      return;
    }
    if (items.some((i) => !i.description)) {
      toast.error('يرجى ملء وصف جميع البنود');
      return;
    }
    if (items.some((i) => Number(i.total) <= 0 || Number(i.quantity) <= 0)) {
      toast.error('تحقق من الكمية والسعر لكل بند');
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        invoiceNumber,
        clientId,
        ...(clientId === 'temp'
          ? {
              tempClientName: tempClientName.trim(),
              tempClientPhone: tempClientPhone.trim(),
              tempClientAddress: tempClientAddress.trim(),
            }
          : {
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
        toast.success('تم تحديث الفاتورة');
      } else {
        await addInvoice({
          id: crypto.randomUUID(),
          ...invoiceData,
          status: 'draft',
          createdAt: new Date().toISOString(),
          createdBy: user?.displayName || 'غير معروف',
        });
        toast.success('تم إنشاء الفاتورة');
      }
      navigate('/invoices');
    } catch (error) {
      console.error(error);
      toast.error('تعذّر حفظ الفاتورة. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const isClientSelected = clientId && clientId !== 'temp';
  const isTempClient = clientId === 'temp';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        pb: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <PageScaffold
        title={editId ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
        subtitle="أنشئ فاتورة بخطوات بسيطة"
        backTo="/invoices"
        contentOffset={-0.5}
        rightAction={
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={!loading && <Save sx={{ fontSize: 16 }} />}
            sx={{
              ...etlalaHeroActionButtonSx,
              minHeight: 38,
              px: 1.9,
            }}
          >
            {loading ? '...' : editId ? 'تحديث' : 'حفظ الفاتورة'}
          </Button>
        }
        headerExtra={
          <Box
            sx={{
              p: 2,
              borderRadius: `${RADIUS.lg}px`,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
                إجمالي الفاتورة
              </Typography>
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  ...MONEY_SX,
                  lineHeight: 1.2,
                  mt: 0.25,
                }}
              >
                {Math.round(total).toLocaleString('ar-LY')}
                <Typography component="span" sx={{ fontSize: '0.875rem', mr: 0.5 }}>
                  د.ل
                </Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: alpha(premiumTokens.accent, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt sx={{ color: premiumTokens.accent, fontSize: 22 }} />
            </Box>
          </Box>
        }
      >
        <Stack spacing={3}>
          {/* ═══════════════════════════════════════════════════════════
              Step 1: Client Selection
          ═══════════════════════════════════════════════════════════ */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                mb: 1.5,
                px: 0.5,
              }}
            >
              الخطوة ١ · اختيار العميل
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: `${RADIUS.lg}px`,
                boxShadow: SHADOWS.md,
                overflow: 'hidden',
              }}
            >
              {/* Search */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  placeholder="ابحث عن عميل…"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: `${RADIUS.md}px`,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(47,62,52,0.03)',
                      minHeight: 48,
                      '& fieldset': { border: 'none' },
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(47,62,52,0.05)',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                        boxShadow: `0 0 0 2px ${alpha(premiumTokens.primary, 0.2)}`,
                      },
                    },
                  }}
                />
              </Box>

              {/* Client List */}
              <List sx={{ maxHeight: 280, overflow: 'auto', py: 1 }}>
                <AnimatePresence>
                  {filteredPickerClients.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" fontSize="0.875rem">
                        لا يوجد عميل مطابق
                      </Typography>
                    </Box>
                  ) : (
                    filteredPickerClients.map((c, idx) => {
                      const selected = clientId === c.id;
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                        >
                          <ListItemButton
                            selected={selected}
                            onClick={() => setClientId(c.id)}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: `${RADIUS.md}px`,
                              py: 1.5,
                              px: 2,
                              transition: 'all 0.2s ease',
                              '&.Mui-selected': {
                                bgcolor: alpha(premiumTokens.primary, isDark ? 0.25 : 0.08),
                                '&:hover': {
                                  bgcolor: alpha(premiumTokens.primary, isDark ? 0.3 : 0.12),
                                },
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                              sx={{ width: '100%' }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: `${RADIUS.sm}px`,
                                  bgcolor: selected
                                    ? alpha(premiumTokens.accent, 0.2)
                                    : isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(47,62,52,0.06)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <Person
                                  sx={{
                                    color: selected ? premiumTokens.accent : 'text.secondary',
                                    fontSize: 20,
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  flex: 1,
                                  fontWeight: selected ? 700 : 500,
                                  fontSize: '0.95rem',
                                  color: selected ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {c.name}
                              </Typography>
                              {selected && (
                                <CheckRounded
                                  sx={{ color: premiumTokens.accent, fontSize: 20 }}
                                />
                              )}
                            </Stack>
                          </ListItemButton>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </List>

              {/* Quick Actions */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1.5,
                }}
              >
                <Button
                  fullWidth
                  variant={isTempClient ? 'contained' : 'outlined'}
                  onClick={() => setClientId('temp')}
                  sx={{
                    borderRadius: `${RADIUS.md}px`,
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderColor: isTempClient ? 'transparent' : alpha(premiumTokens.primary, 0.25),
                    color: isTempClient ? '#fff' : 'text.secondary',
                    bgcolor: isTempClient ? premiumTokens.primary : 'transparent',
                    '&:hover': {
                      bgcolor: isTempClient ? premiumTokens.primaryDark : alpha(premiumTokens.primary, 0.05),
                    },
                  }}
                >
                  عميل سريع
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/clients')}
                  sx={{
                    borderRadius: `${RADIUS.md}px`,
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderColor: alpha(premiumTokens.primary, 0.25),
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(premiumTokens.primary, 0.05),
                    },
                  }}
                >
                  + عميل جديد
                </Button>
              </Box>
            </Box>

            {/* Temp Client Form */}
            <AnimatePresence>
              {isTempClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Box
                    sx={{
                      mt: 2,
                      p: 2.5,
                      borderRadius: `${RADIUS.lg}px`,
                      bgcolor: alpha(premiumTokens.accent, isDark ? 0.08 : 0.12),
                      border: `1px dashed ${alpha(premiumTokens.accent, 0.4)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: premiumTokens.primary,
                        mb: 2,
                      }}
                    >
                      بيانات العميل السريع
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        placeholder="اسم العميل *"
                        value={tempClientName}
                        onChange={(e) => setTempClientName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: `${RADIUS.md}px`,
                            bgcolor: 'background.paper',
                          },
                        }}
                      />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            placeholder="رقم الهاتف"
                            value={tempClientPhone}
                            onChange={(e) => setTempClientPhone(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: `${RADIUS.md}px`,
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            placeholder="العنوان"
                            value={tempClientAddress}
                            onChange={(e) => setTempClientAddress(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: `${RADIUS.md}px`,
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* ═══════════════════════════════════════════════════════════
              Step 2: Invoice Details
          ═══════════════════════════════════════════════════════════ */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                mb: 1.5,
                px: 0.5,
              }}
            >
              الخطوة ٢ · تفاصيل الفاتورة
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: `${RADIUS.lg}px`,
                boxShadow: SHADOWS.md,
                p: 2.5,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="رقم الفاتورة"
                    value={invoiceNumber}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Receipt sx={{ color: premiumTokens.primary, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: `${RADIUS.md}px`,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(47,62,52,0.03)',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                    <DatePicker
                      label="تاريخ الإصدار"
                      value={issueDate}
                      onChange={(val) => setIssueDate(val)}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputProps: { dir: 'ltr', style: { textAlign: 'end' } },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: `${RADIUS.md}px`,
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                    <DatePicker
                      label="تاريخ الاستحقاق"
                      value={dueDate}
                      onChange={(val) => setDueDate(val)}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputProps: { dir: 'ltr', style: { textAlign: 'end' } },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: `${RADIUS.md}px`,
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* ═══════════════════════════════════════════════════════════
              Step 3: Items
          ═══════════════════════════════════════════════════════════ */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5, px: 0.5 }}
            >
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                الخطوة ٣ · البنود ({items.length})
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={handleAddItem}
                size="small"
                sx={{
                  borderRadius: `${RADIUS.md}px`,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: premiumTokens.primary,
                  bgcolor: alpha(premiumTokens.primary, 0.08),
                  '&:hover': {
                    bgcolor: alpha(premiumTokens.primary, 0.15),
                  },
                }}
              >
                إضافة بند
              </Button>
            </Stack>

            <Stack spacing={2}>
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: `${RADIUS.lg}px`,
                        boxShadow: SHADOWS.md,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Item Header */}
                      <Box
                        sx={{
                          px: 2.5,
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: `${RADIUS.sm}px`,
                              bgcolor: alpha(premiumTokens.accent, 0.15),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.875rem',
                                color: premiumTokens.accent,
                              }}
                            >
                              {idx + 1}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                            بند {idx + 1}
                          </Typography>
                        </Stack>
                        {items.length > 1 && (
                          <IconButton
                            onClick={() => handleRemoveItem(item.id)}
                            size="small"
                            sx={{
                              color: '#B54747',
                              bgcolor: alpha('#B54747', 0.08),
                              borderRadius: `${RADIUS.sm}px`,
                              '&:hover': {
                                bgcolor: alpha('#B54747', 0.15),
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      {/* Item Body */}
                      <Box sx={{ p: 2.5 }}>
                        <TextField
                          fullWidth
                          placeholder="وصف البند أو الخدمة…"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(item.id, 'description', e.target.value)
                          }
                          multiline
                          rows={2}
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: `${RADIUS.md}px`,
                              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(47,62,52,0.03)',
                              '& fieldset': { border: 'none' },
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(47,62,52,0.05)',
                              },
                              '&.Mui-focused': {
                                bgcolor: 'background.paper',
                                boxShadow: `0 0 0 2px ${alpha(premiumTokens.primary, 0.15)}`,
                              },
                            },
                          }}
                        />

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="الكمية"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, 'quantity', Number(e.target.value))
                              }
                              onWheel={(e) => (e.target as HTMLElement).blur()}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: `${RADIUS.md}px`,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="السعر"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(item.id, 'unitPrice', Number(e.target.value))
                              }
                              onWheel={(e) => (e.target as HTMLElement).blur()}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: `${RADIUS.md}px`,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Box
                              sx={{
                                height: '100%',
                                minHeight: 56,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: `${RADIUS.md}px`,
                                bgcolor: premiumTokens.primary,
                                color: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <Typography sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
                                الإجمالي
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '1.1rem',
                                  fontFamily: "'Outfit', sans-serif",
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {Math.round(item.total).toLocaleString('ar-LY')}
                              </Typography>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 3,
                                  bgcolor: premiumTokens.accent,
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </Box>

          {/* ═══════════════════════════════════════════════════════════
              Step 4: Summary & Notes
          ═══════════════════════════════════════════════════════════ */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                mb: 1.5,
                px: 0.5,
              }}
            >
              الخلاصة
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: `${RADIUS.lg}px`,
                boxShadow: SHADOWS.md,
                overflow: 'hidden',
              }}
            >
              {/* Tax & Total */}
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.9rem' }}>
                        نسبة الضريبة
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        InputProps={{
                          endAdornment: <Typography sx={{ color: 'text.secondary' }}>%</Typography>,
                        }}
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: `${RADIUS.sm}px`,
                          },
                        }}
                      />
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        fontFamily: "'Outfit', sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Math.round(taxAmount).toLocaleString('ar-LY')} د.ل
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                      الإجمالي النهائي
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '1.75rem',
                        color: premiumTokens.primary,
                        fontFamily: "'Outfit', sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Math.round(total).toLocaleString('ar-LY')}
                      <Typography component="span" sx={{ fontSize: '1rem', mr: 0.5 }}>
                        د.ل
                      </Typography>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Notes */}
              <Box sx={{ px: 2.5, pb: 2.5 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="ملاحظات أو شروط إضافية…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: `${RADIUS.md}px`,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(47,62,52,0.03)',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Spacer for sticky button */}
          <Box sx={{ height: 20 }} />
        </Stack>
      </PageScaffold>

      {/* ═══════════════════════════════════════════════════════════
          Sticky Bottom Button
      ═══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${alpha(premiumTokens.primary, 0.1)}`,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={!loading && <Save sx={{ fontSize: 22 }} />}
            sx={{
              py: 1.5,
              borderRadius: `${RADIUS.md}px`,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              letterSpacing: '0.02em',
              color: '#fff',
              bgcolor: premiumTokens.primary,
              boxShadow: `0 4px 14px ${alpha(premiumTokens.primary, 0.35)}`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: premiumTokens.primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(premiumTokens.primary, 0.45)}`,
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              '&.Mui-disabled': {
                bgcolor: alpha(premiumTokens.primary, 0.5),
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          >
            {loading ? 'جاري الحفظ…' : editId ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
