// @ts-nocheck
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import {
  Box, Typography, TextField, IconButton, Stack, Chip, InputAdornment, alpha, Divider,
} from '@mui/material';
import { Add, Close, Inventory2, Straighten, Calculate } from '@mui/icons-material';
import {
  formatCurrencyDisplay,
  formatMeasureUnit,
  expenseHasQuantityLine,
  parseDecimalInput,
  isPartialDecimalInput,
  sanitizeDecimalTyping,
  multiplyQuantityPrice,
  EXPENSE_MEASURE_UNIT_GROUPS,
  CURRENCY_SYMBOL,
  formatQuantityDisplay,
} from '../../utils/pdfFormatters';

const ETLALA = {
  primary: '#1F3D35',
  primarySoft: '#2C4A42',
  accent: '#C8B27D',
  surface: '#FAFAF8',
} as const;

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: 'background.paper',
    fontVariantNumeric: 'tabular-nums',
    '&.Mui-focused fieldset': { borderColor: ETLALA.primary },
  },
};

function DecimalField({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  label,
  placeholder,
  center = false,
  endAdornment,
  readOnly = false,
}: {
  value: unknown;
  onChange: (v: string) => void;
  onBlur?: () => void;
  name?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  label?: string;
  placeholder?: string;
  center?: boolean;
  endAdornment?: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <TextField
      name={name}
      inputRef={inputRef}
      onBlur={onBlur}
      value={value ?? ''}
      label={label}
      placeholder={placeholder}
      fullWidth
      type="text"
      inputMode="decimal"
      disabled={readOnly}
      InputProps={{
        readOnly,
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
        if (readOnly) return;
        const v = sanitizeDecimalTyping(e.target.value);
        if (isPartialDecimalInput(v)) onChange(v);
      }}
      sx={fieldSx}
    />
  );
}

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
          p: 2,
          borderRadius: 3,
          border: '1px dashed',
          borderColor: alpha(ETLALA.primary, 0.25),
          bgcolor: alpha(ETLALA.primary, 0.03),
          textAlign: 'right',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: ETLALA.primary,
            bgcolor: alpha(ETLALA.primary, 0.06),
            boxShadow: `0 4px 16px ${alpha(ETLALA.primary, 0.08)}`,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(ETLALA.primary, 0.15)}`,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: ETLALA.primary,
            }}
          >
            <Add sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
              <Chip label="اختياري" size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(ETLALA.accent, 0.15), color: ETLALA.primarySoft }} />
              <Typography variant="body2" fontWeight={800} color={ETLALA.primary}>
                تفصيل الكمية × السعر
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              يدعم الفواصل: 12,5 أو 1,234.50 — يظهر في PDF
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${active ? alpha(ETLALA.accent, 0.55) : alpha(ETLALA.primary, 0.12)}`,
        overflow: 'hidden',
        bgcolor: ETLALA.surface,
        boxShadow: active ? `0 8px 28px ${alpha(ETLALA.primary, 0.1)}` : `0 2px 8px ${alpha(ETLALA.primary, 0.04)}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: ETLALA.primary,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Inventory2 sx={{ fontSize: 20, opacity: 0.9 }} />
          <Typography variant="subtitle2" fontWeight={800}>جدول الكميات</Typography>
        </Stack>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.85)' }} aria-label="إغلاق">
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* صف الجدول: كمية | سعر | إجمالي */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr auto 1fr' },
            gap: 1.5,
            alignItems: 'end',
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(ETLALA.primary, 0.1)}`,
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={800} color={ETLALA.primarySoft} sx={{ mb: 0.75, display: 'block' }}>
              الكمية
            </Typography>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <DecimalField
                  {...field}
                  center
                  placeholder="2,5"
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.5, color: 'text.disabled', fontWeight: 300, fontSize: '1.4rem' }}>×</Typography>

          <Box>
            <Typography variant="caption" fontWeight={800} color={ETLALA.primarySoft} sx={{ mb: 0.75, display: 'block' }}>
              {priceLabel}
            </Typography>
            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <DecimalField
                  {...field}
                  placeholder="120,75"
                  endAdornment={<InputAdornment position="end"><Typography variant="caption" fontWeight={700}>{CURRENCY_SYMBOL}</Typography></InputAdornment>}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.5, color: 'text.disabled', fontWeight: 300, fontSize: '1.4rem' }}>=</Typography>

          <Box>
            <Typography variant="caption" fontWeight={800} color={ETLALA.primarySoft} sx={{ mb: 0.75, display: 'block' }}>
              الإجمالي
            </Typography>
            <Box
              sx={{
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2.5,
                border: `1px dashed ${active ? ETLALA.accent : alpha(ETLALA.primary, 0.2)}`,
                bgcolor: active ? alpha(ETLALA.accent, 0.08) : alpha(ETLALA.primary, 0.02),
                px: 1,
              }}
            >
              {active ? (
                <Typography fontWeight={900} color={ETLALA.primary} fontSize="1rem">
                  {formatCurrencyDisplay(computed || total)}
                </Typography>
              ) : (
                <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                  <Calculate sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={600}>تلقائي</Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(ETLALA.primary, 0.08) }} />

        {/* وحدات القياس */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
            <Straighten sx={{ fontSize: 16, color: ETLALA.accent }} />
            <Typography variant="caption" fontWeight={800} color={ETLALA.primary}>
              وحدة القياس (اختياري)
            </Typography>
          </Stack>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Stack spacing={1.25}>
                {EXPENSE_MEASURE_UNIT_GROUPS.map((group) => (
                  <Box key={group.title}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block' }}>
                      {group.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {group.units.map((u) => {
                        const selected = field.value === u;
                        return (
                          <Chip
                            key={u}
                            label={formatMeasureUnit(u)}
                            size="small"
                            clickable
                            onClick={() => field.onChange(selected ? '' : u)}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              ...(selected
                                ? { bgcolor: ETLALA.primary, color: '#fff', '&:hover': { bgcolor: ETLALA.primarySoft } }
                                : { borderColor: alpha(ETLALA.primary, 0.2) }),
                            }}
                            variant={selected ? 'filled' : 'outlined'}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          />
        </Box>

        {active ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 1.25,
              px: 1.5,
              borderRadius: 2,
              bgcolor: alpha(ETLALA.accent, 0.1),
              border: `1px solid ${alpha(ETLALA.accent, 0.25)}`,
            }}
          >
            <Typography variant="body2" fontWeight={800} color={ETLALA.primary}>
              {formatQuantityDisplay(q, unitKey || undefined)} × {formatCurrencyDisplay(p)} = {formatCurrencyDisplay(computed || total)}
            </Typography>
          </Box>
        ) : null}
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
  label = 'المبلغ الإجمالي',
  readOnly = false,
}: {
  control: Control<any>;
  name?: string;
  label?: string;
  readOnly?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DecimalField
          {...field}
          label={label}
          placeholder="0"
          readOnly={readOnly}
          endAdornment={<InputAdornment position="end"><Typography variant="caption" fontWeight={700}>{CURRENCY_SYMBOL}</Typography></InputAdornment>}
          onChange={field.onChange}
        />
      )}
    />
  );
}
