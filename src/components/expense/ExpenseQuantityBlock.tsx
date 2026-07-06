// @ts-nocheck
import { forwardRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import {
  Box, Typography, TextField, IconButton, Stack, Chip, alpha, Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  formatCurrencyDisplay,
  formatMeasureUnit,
  expenseHasQuantityLine,
  parseDecimalInput,
  isPartialDecimalInput,
  sanitizeDecimalTyping,
  multiplyQuantityPrice,
  EXPENSE_MEASURE_UNIT_GROUPS,
  formatQuantityDisplay,
} from '../../utils/pdfFormatters';
import { ExpenseMoneyField, EXPENSE_FORM } from './ExpenseFormKit';

const ETLALA = { ...EXPENSE_FORM, surface: '#FAFAF8' };

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: 'background.paper',
    fontVariantNumeric: 'tabular-nums',
    '&.Mui-focused fieldset': { borderColor: ETLALA.primary },
  },
};

const DecimalField = forwardRef(function DecimalField(
  {
    value,
    onChange,
    onBlur,
    name,
    label,
    placeholder,
    center = false,
    endAdornment,
    helperText,
  }: {
    value: unknown;
    onChange: (v: string) => void;
    onBlur?: () => void;
    name?: string;
    label?: string;
    placeholder?: string;
    center?: boolean;
    endAdornment?: React.ReactNode;
    helperText?: string;
  },
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <TextField
      name={name}
      inputRef={ref}
      onBlur={onBlur}
      value={value ?? ''}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      fullWidth
      type="text"
      inputMode="decimal"
      InputProps={{
        endAdornment,
        inputProps: {
          dir: 'ltr',
          style: {
            textAlign: center ? 'center' : 'left',
            fontWeight: 700,
            fontSize: center ? '1.05rem' : '0.95rem',
          },
        },
      }}
      onChange={(e) => {
        const v = sanitizeDecimalTyping(e.target.value);
        if (isPartialDecimalInput(v)) onChange(v);
      }}
      sx={fieldSx}
    />
  );
});

type Props = {
  control: Control<any>;
  quantity: unknown;
  unit: unknown;
  unitPrice: unknown;
  amount: unknown;
  defaultOpen?: boolean;
  onClear?: () => void;
};

export function ExpenseQuantityBlock({
  control,
  quantity,
  unit,
  unitPrice,
  amount,
  defaultOpen = false,
  onClear,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const q = parseDecimalInput(quantity) ?? 0;
  const p = parseDecimalInput(unitPrice) ?? 0;
  const unitKey = String(unit || '').trim();
  const total = (parseDecimalInput(amount) ?? parseFloat(String(amount))) || 0;
  const active = expenseHasQuantityLine({ quantity: q, unitPrice: p });
  const computed = q > 0 && p >= 0 ? multiplyQuantityPrice(q, p) : 0;
  const priceLabel = unitKey ? 'سعر الوحدة' : 'سعر القطعة';

  const handleClose = () => {
    onClear?.();
    setOpen(false);
  };

  if (!open) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        sx={{
          width: '100%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: alpha(ETLALA.primary, 0.22),
          bgcolor: 'transparent',
          textAlign: 'right',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          '&:hover': { borderColor: ETLALA.primary, bgcolor: alpha(ETLALA.primary, 0.04) },
        }}
      >
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          + كمية × سعر (اختياري)
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(ETLALA.primary, 0.12)}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(ETLALA.primary, 0.08)}` }}>
        <Typography variant="caption" fontWeight={700} color={ETLALA.primary}>
          كمية × سعر
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="إغلاق" sx={{ p: 0.5 }}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>الكمية</Typography>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <DecimalField {...field} center placeholder="2,5" onChange={field.onChange} />
              )}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{priceLabel}</Typography>
            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <ExpenseMoneyField
                  ref={field.ref}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  variant="compact"
                  placeholder="120"
                  onChange={(v) => {
                    const sanitized = sanitizeDecimalTyping(v);
                    if (isPartialDecimalInput(sanitized)) field.onChange(sanitized);
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {active ? (
          <Typography variant="caption" color={ETLALA.primary} fontWeight={700} textAlign="center">
            {formatQuantityDisplay(q, unitKey || undefined)} × {formatCurrencyDisplay(p)} = {formatCurrencyDisplay(computed || total)}
          </Typography>
        ) : null}

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>الوحدة (اختياري)</Typography>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {EXPENSE_MEASURE_UNIT_GROUPS.flatMap((g) => g.units).map((u) => {
                  const selected = field.value === u;
                  return (
                    <Chip
                      key={u}
                      label={formatMeasureUnit(u)}
                      size="small"
                      clickable
                      onClick={() => field.onChange(selected ? '' : u)}
                      sx={{
                        height: 24,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        ...(selected
                          ? { bgcolor: ETLALA.primary, color: '#fff' }
                          : { borderColor: alpha(ETLALA.primary, 0.15) }),
                      }}
                      variant={selected ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}

export function ExpenseQuantityChip({
  quantity,
  unit,
  unitPrice,
  amount,
}: {
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  amount?: number;
}) {
  if (!expenseHasQuantityLine({ quantity, unitPrice })) return null;
  const q = quantity!;
  const p = unitPrice!;
  const total = amount ?? multiplyQuantityPrice(q, p);

  const cell = (label: string, value: React.ReactNode, highlight?: boolean) => (
    <Box sx={{ flex: 1, textAlign: 'center', py: 0.75, px: 0.5 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.55rem', display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        fontWeight={800}
        color={highlight ? ETLALA.primary : 'text.primary'}
        sx={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        mt: 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(ETLALA.primary, 0.15)}`,
        bgcolor: alpha(ETLALA.primary, 0.03),
      }}
    >
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: alpha(ETLALA.primary, 0.1) }} />}>
        {cell('الكمية', formatQuantityDisplay(q, unit || undefined))}
        {cell(unit ? 'سعر الوحدة' : 'سعر القطعة', formatCurrencyDisplay(p))}
        {cell('الإجمالي', formatCurrencyDisplay(total), true)}
      </Stack>
    </Box>
  );
}

export function ExpenseAmountField({
  control,
  name = 'amount',
  qtyActive = false,
  hideLabel = false,
}: {
  control: Control<any>;
  name?: string;
  qtyActive?: boolean;
  hideLabel?: boolean;
}) {
  const resolvedLabel = qtyActive ? 'المبلغ الإجمالي (يُحدَّث تلقائياً)' : 'المبلغ الإجمالي';
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          {!hideLabel ? (
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {resolvedLabel}
            </Typography>
          ) : null}
          <ExpenseMoneyField
            ref={field.ref}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            placeholder="0"
            variant="compact"
            onChange={(v) => {
              const sanitized = sanitizeDecimalTyping(v);
              if (isPartialDecimalInput(sanitized)) field.onChange(sanitized);
            }}
          />
          {!hideLabel && qtyActive ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.68rem' }}>
              يُحدَّث تلقائياً — يمكنك تعديله
            </Typography>
          ) : null}
        </Box>
      )}
    />
  );
}
