// @ts-nocheck
/**
 * نافذة «مصروف جديد» السريعة — bottom sheet عامة تُفتح فوراً من أي صفحة
 * (زر + العائم في Layout، وزر «مصروف جديد» في صفحة المصروفات) بدون أي تنقّل.
 */
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { Briefcase, StickyNote, Wallet, X } from 'lucide-react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { expenseCategories } from '../../utils/formatters';
import {
  ExpenseQuantityBlock,
  ExpenseAmountField,
} from './ExpenseQuantityBlock';
import {
  expenseHasQuantityLine,
  multiplyQuantityPrice,
  parseDecimalInput,
  buildExpenseQuantityPayload,
} from '../../utils/pdfFormatters';

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: 'materials',
  date: dayjs(),
  invoiceNumber: '',
  notes: '',
  clientId: '',
  quantity: '',
  unit: '',
  unitPrice: '',
};

export const QuickExpenseSheet = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { clients, addExpense } = useDataStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const quantity = useWatch({ control, name: 'quantity' });
  const unit = useWatch({ control, name: 'unit' });
  const unitPrice = useWatch({ control, name: 'unitPrice' });
  const clientId = useWatch({ control, name: 'clientId' });
  const amountPreview = parseDecimalInput(watch('amount')) ?? 0;

  /** الكمية × سعر الوحدة = المبلغ تلقائياً */
  useEffect(() => {
    const q = parseDecimalInput(quantity);
    const p = parseDecimalInput(unitPrice);
    if (q != null && q > 0 && p != null && p >= 0) {
      setValue('amount', String(multiplyQuantityPrice(q, p)));
    }
  }, [quantity, unitPrice, setValue]);

  /** عند كل فتح: نموذج نظيف مع اختيار أول عميل تلقائياً */
  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_FORM, date: dayjs(), clientId: clients.length > 0 ? clients[0].id : '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** العملاء يصلون لاحقاً من Firestore — اختر الأول تلقائياً إن كان الحقل فارغاً */
  useEffect(() => {
    if (open && !clientId && clients.length > 0) {
      setValue('clientId', clients[0].id);
    }
  }, [open, clientId, clients, setValue]);

  const handleAdd = useCallback(
    async (data) => {
      const amount = parseDecimalInput(data.amount) ?? 0;
      if (!data.description?.trim()) {
        toast.error('أدخل وصف المصروف');
        return;
      }
      if (!data.clientId) {
        toast.error('اختر العميل / المشروع');
        return;
      }
      if (amount <= 0) {
        toast.error('أدخل المبلغ الإجمالي');
        return;
      }
      const q = parseDecimalInput(data.quantity);
      const p = parseDecimalInput(data.unitPrice);
      const unitName = data.unit?.trim() || undefined;
      const qtyFields = buildExpenseQuantityPayload(q, p, unitName);
      setLoading(true);
      try {
        await addExpense({
          id: crypto.randomUUID(),
          clientId: data.clientId,
          description: data.description,
          amount,
          category: data.category,
          date: dayjs(data.date).toISOString(),
          invoiceNumber: data.invoiceNumber || undefined,
          isClosed: false,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || '',
          createdBy: user?.displayName || 'غير معروف',
          ...qtyFields,
        });
        toast.success('تم حفظ المصروف');
        onClose();
      } catch (error) {
        console.error(error);
        toast.error('تعذّر حفظ المصروف. حاول مجدداً.');
      } finally {
        setLoading(false);
      }
    },
    [addExpense, onClose, user],
  );

  /** حقل نموذج موحّد — أبيض نظيف وزوايا iOS */
  const sheetFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: isDark ? alpha('#fff', 0.04) : '#F4F4F2',
      '& fieldset': { border: 'none' },
      '&.Mui-focused': {
        bgcolor: isDark ? alpha('#fff', 0.06) : '#FFFFFF',
        boxShadow: `0 0 0 2px ${alpha('#2F3E34', isDark ? 0.55 : 0.3)}`,
      },
    },
  } as const;

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      transitionDuration={{ enter: 220, exit: 160 }}
      PaperProps={{
        sx: {
          borderRadius: { xs: '26px 26px 0 0', sm: '24px' },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: undefined },
          maxWidth: { xs: '100%', sm: 444 },
          maxHeight: { xs: '92dvh', sm: 'calc(100dvh - 64px)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#1f2521', 0.08)}`,
          background: isDark
            ? 'linear-gradient(180deg, #1B241E 0%, #161E19 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF8 100%)',
          boxShadow: isDark
            ? '0 -12px 46px rgba(0,0,0,0.48)'
            : '0 -12px 40px rgba(31,37,33,0.2)',
        },
      }}
    >
      {/* مقبض السحب — مألوف على iOS */}
      <Box
        aria-hidden
        sx={{
          display: { xs: 'block', sm: 'none' },
          width: 40,
          height: 5,
          borderRadius: '999px',
          mx: 'auto',
          mt: 1,
          mb: 0.25,
          flexShrink: 0,
          bgcolor: isDark ? alpha('#fff', 0.14) : 'rgba(31, 37, 33, 0.14)',
        }}
      />

      {/* Header */}
      <Box
        sx={{
          px: 2.75,
          pt: 1.5,
          pb: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexShrink: 0,
          borderBottom: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#1f2521', 0.08)}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25 }}>
            تسجيل مصروف جديد
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            حدّد العميل وأدخل تفاصيل المصروف
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          disabled={loading}
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            bgcolor: isDark ? alpha('#fff', 0.07) : '#F1F1EF',
            color: 'text.secondary',
            border: `1px solid ${isDark ? alpha('#fff', 0.08) : 'rgba(31, 37, 33, 0.06)'}`,
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </IconButton>
      </Box>
      <Box
        sx={{
          mx: 2.75,
          mt: 1.25,
          mb: 1,
          px: 1.75,
          py: 1.35,
          borderRadius: '14px',
          border: `1px solid ${alpha('#2F3E34', isDark ? 0.32 : 0.18)}`,
          bgcolor: isDark ? alpha('#2F3E34', 0.22) : alpha('#2F3E34', 0.06),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.9} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#2F3E34', 0.1),
              flexShrink: 0,
            }}
          >
            <Wallet size={15} strokeWidth={2} color={isDark ? '#d6e2dc' : '#2F3E34'} />
          </Box>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 650 }}>
            المبلغ الإجمالي الحالي
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: '0.96rem',
            fontWeight: 850,
            color: isDark ? '#d6e2dc' : '#2F3E34',
            fontFamily: "'Sora','Montserrat','Outfit','Inter',sans-serif",
            fontVariantNumeric: 'tabular-nums lining-nums',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {Math.round(amountPreview).toLocaleString('ar-LY')} د.ل
        </Typography>
      </Box>

      {/* Body — يتمرر داخلياً */}
      <Box
        component="form"
        onSubmit={handleSubmit(handleAdd)}
        sx={{
          px: 2.75,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          flex: 1,
          minHeight: 0,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
          <Stack spacing={2.25} sx={{ pt: 0.5 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.06em' }}>
              البيانات الأساسية
            </Typography>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={sheetFieldSx}>
                  <InputLabel>العميل / المشروع</InputLabel>
                  <Select
                    {...field}
                    label="العميل / المشروع"
                    sx={{ borderRadius: '16px' }}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <Briefcase size={17} color={theme.palette.text.secondary} strokeWidth={2} />
                      </InputAdornment>
                    }
                  >
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="وصف المصروف"
                  fullWidth
                  sx={sheetFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <StickyNote size={17} color={theme.palette.text.secondary} strokeWidth={2} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <ExpenseQuantityBlock
              control={control}
              quantity={quantity}
              unit={unit}
              unitPrice={unitPrice}
              amount={watch('amount')}
              onClear={() => {
                setValue('quantity', '');
                setValue('unit', '');
                setValue('unitPrice', '');
              }}
            />
            <ExpenseAmountField
              control={control}
              qtyActive={expenseHasQuantityLine({
                quantity: parseDecimalInput(quantity),
                unitPrice: parseDecimalInput(unitPrice),
              })}
            />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.06em', pt: 0.2 }}>
              تفاصيل إضافية
            </Typography>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={sheetFieldSx}>
                  <InputLabel>الفئة</InputLabel>
                  <Select {...field} label="الفئة" sx={{ borderRadius: '16px' }}>
                    {Object.entries(expenseCategories).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="تاريخ المصروف"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue || dayjs())}
                  /* صيغة ASCII صريحة — صيغة locale العربية تحقن علامات RLM فتُبعثر الشرطات */
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: sheetFieldSx,
                      inputProps: { dir: 'ltr', style: { textAlign: 'end' } },
                    },
                  }}
                />
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="ملاحظات (اختياري)" multiline rows={2} fullWidth sx={sheetFieldSx} />
              )}
            />
          </Stack>
        </LocalizationProvider>

        {/* Actions */}
        <Box sx={{ pt: 2.5, display: 'flex', gap: 1.25 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              flex: 1,
              borderRadius: '14px',
              fontWeight: 700,
              color: 'text.secondary',
              bgcolor: isDark ? alpha('#fff', 0.05) : '#F1F1EF',
              border: `1px solid ${isDark ? alpha('#fff', 0.08) : 'rgba(31, 37, 33, 0.07)'}`,
            }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              flex: 2,
              borderRadius: '14px',
              fontWeight: 800,
              background: 'linear-gradient(180deg, #d64545 0%, #b83b3b 100%)',
              boxShadow: '0 6px 18px rgba(214,69,69,0.3)',
              '&:hover': {
                boxShadow: '0 8px 22px rgba(214,69,69,0.38)',
                background: 'linear-gradient(180deg, #c94040 0%, #a83636 100%)',
              },
              '&:disabled': { opacity: 0.55 },
            }}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ المصروف'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
