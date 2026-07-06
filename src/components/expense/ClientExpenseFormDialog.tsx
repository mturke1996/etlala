// @ts-nocheck
import {
  Box, Button, Dialog, FormControl, IconButton, InputLabel,
  MenuItem, Select, Stack, TextField, Typography, alpha, useTheme,
} from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';
import { Controller, type Control } from 'react-hook-form';
import type { Expense, Worker } from '../../types';
import { expenseCategories } from '../../utils/formatters';
import { expenseHasQuantityLine, parseDecimalInput } from '../../utils/pdfFormatters';
import { ExpenseQuantityBlock, ExpenseAmountField } from './ExpenseQuantityBlock';
import { expenseFormFieldSx, EXPENSE_FORM } from './ExpenseFormKit';

type WalletBanner = {
  remaining: number;
  name: string;
  isGlobalFund: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
  control: Control<any>;
  onSubmit: () => void;
  onDelete?: () => void;
  expenseDialogWallet: WalletBanner | null;
  formatCurrency: (n: number) => string;
  workers: Worker[];
  clientId?: string;
  userDisplayName?: string;
  expQuantity: unknown;
  expUnit: unknown;
  expUnitPrice: unknown;
  watchAmount: unknown;
  onClearQuantity: () => void;
};

const compactFieldSx = {
  ...expenseFormFieldSx,
  '& .MuiOutlinedInput-root': {
    ...expenseFormFieldSx['& .MuiOutlinedInput-root'],
    minHeight: 44,
    borderRadius: 2,
  },
};

export function ClientExpenseFormDialog({
  open,
  onClose,
  editingExpense,
  control,
  onSubmit,
  onDelete,
  expenseDialogWallet,
  formatCurrency,
  workers,
  clientId,
  userDisplayName,
  expQuantity,
  expUnit,
  expUnitPrice,
  watchAmount,
  onClearQuantity,
}: Props) {
  const theme = useTheme();
  const headerGradient = theme.palette.mode === 'light'
    ? `linear-gradient(160deg, ${EXPENSE_FORM.primary} 0%, ${EXPENSE_FORM.primarySoft} 100%)`
    : 'linear-gradient(160deg, #111814 0%, #1A221C 100%)';

  const qtyActive = expenseHasQuantityLine({
    quantity: parseDecimalInput(expQuantity),
    unitPrice: parseDecimalInput(expUnitPrice),
  });

  const clientWorkers = workers.filter((w) => w.clientId === clientId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
      >
        <Box
          sx={{
            flexShrink: 0,
            background: headerGradient,
            color: '#fff',
            px: 1.5,
            py: 1.5,
            pt: 'calc(max(env(safe-area-inset-top), 48px) + 8px)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }} aria-label="رجوع">
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700}>
              {editingExpense ? 'تعديل مصروف' : 'إضافة مصروف'}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
          <Stack spacing={2}>
            {expenseDialogWallet && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  bgcolor: expenseDialogWallet.remaining >= 0
                    ? alpha('#0d9668', 0.08)
                    : alpha('#c73e3e', 0.08),
                  border: `1px solid ${expenseDialogWallet.remaining >= 0 ? alpha('#0d9668', 0.2) : alpha('#c73e3e', 0.2)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.35, flex: 1 }}>
                  {expenseDialogWallet.isGlobalFund
                    ? (expenseDialogWallet.remaining >= 0 ? 'رصيد العهدة' : 'عجز العهدة')
                    : (expenseDialogWallet.remaining >= 0 ? 'رصيد متاح' : 'عجز')}
                  {' · '}{userDisplayName || expenseDialogWallet.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    color: expenseDialogWallet.remaining >= 0 ? '#0d9668' : '#c73e3e',
                    flexShrink: 0,
                  }}
                >
                  {expenseDialogWallet.remaining < 0
                    ? `-${formatCurrency(Math.abs(expenseDialogWallet.remaining))}`
                    : formatCurrency(expenseDialogWallet.remaining)}
                </Typography>
              </Box>
            )}

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="الوصف" placeholder="مثال: شراء مواد" sx={compactFieldSx} />
              )}
            />

            <ExpenseAmountField control={control} qtyActive={qtyActive} />

            <ExpenseQuantityBlock
              control={control}
              quantity={expQuantity}
              unit={expUnit}
              unitPrice={expUnitPrice}
              amount={watchAmount}
              defaultOpen={Boolean(editingExpense && expenseHasQuantityLine(editingExpense))}
              onClear={onClearQuantity}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" sx={compactFieldSx}>
                  <InputLabel>التصنيف</InputLabel>
                  <Select {...field} label="التصنيف">
                    {Object.entries(expenseCategories).map(([key, label]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="التاريخ"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={compactFieldSx}
                  />
                )}
              />
              <Controller
                name="invoiceNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" label="رقم الفاتورة" sx={compactFieldSx} />
                )}
              />
            </Box>

            <Controller
              name="workerId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" sx={compactFieldSx}>
                  <InputLabel>العامل (اختياري)</InputLabel>
                  <Select {...field} label="العامل (اختياري)">
                    <MenuItem value=""><em>لا يوجد</em></MenuItem>
                    {clientWorkers.map((w) => (
                      <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="ملاحظات" multiline rows={2} sx={compactFieldSx} />
              )}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.5,
            pb: 'calc(max(env(safe-area-inset-bottom), 12px) + 8px)',
            borderTop: `1px solid ${alpha(EXPENSE_FORM.primary, 0.08)}`,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5}>
            {editingExpense ? (
              <>
                <IconButton
                  onClick={onDelete}
                  aria-label="حذف المصروف"
                  size="small"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha('#c73e3e', 0.1),
                    color: '#c73e3e',
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
                <Button type="submit" variant="contained" fullWidth sx={{ borderRadius: 2, minHeight: 44, fontWeight: 700, bgcolor: EXPENSE_FORM.primary, '&:hover': { bgcolor: EXPENSE_FORM.primarySoft } }}>
                  حفظ
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose} fullWidth variant="outlined" sx={{ borderRadius: 2, minHeight: 44, fontWeight: 600 }}>
                  إلغاء
                </Button>
                <Button type="submit" variant="contained" fullWidth sx={{ borderRadius: 2, minHeight: 44, fontWeight: 700, bgcolor: EXPENSE_FORM.primary, '&:hover': { bgcolor: EXPENSE_FORM.primarySoft } }}>
                  حفظ
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
