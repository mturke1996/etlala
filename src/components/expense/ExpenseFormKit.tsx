// @ts-nocheck
import { forwardRef, type ReactNode } from 'react';
import { Box, Stack, Typography, alpha } from '@mui/material';
import { PROFILE_MODULE } from '../client/profileSessionTokens';

export const EXPENSE_FORM = {
  primary: PROFILE_MODULE.expenses.accent,
  primarySoft: '#4A5E50',
  accent: '#C2B280',
  surface: '#FAFAF8',
} as const;

export const expenseFormFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: 'background.paper',
    minHeight: 52,
    fontVariantNumeric: 'tabular-nums',
    '&.Mui-focused fieldset': { borderColor: EXPENSE_FORM.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: EXPENSE_FORM.primary },
};

export function ExpenseFormSection({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(EXPENSE_FORM.primary, 0.1)}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: `0 2px 12px ${alpha(EXPENSE_FORM.primary, 0.05)}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${alpha(EXPENSE_FORM.primary, 0.08)}`,
          bgcolor: alpha(EXPENSE_FORM.primary, 0.03),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {step != null && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(EXPENSE_FORM.primary, 0.1),
                color: EXPENSE_FORM.primary,
                fontSize: '0.72rem',
                fontWeight: 900,
              }}
            >
              {step}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} color={EXPENSE_FORM.primary}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', lineHeight: 1.45 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Box>
      <Stack spacing={2} sx={{ p: 2 }}>{children}</Stack>
    </Box>
  );
}

/** حقل مبلغ — العملة منفصلة عن الإدخال (بدون تداخل InputAdornment) */
export const ExpenseMoneyField = forwardRef(function ExpenseMoneyField(
  {
    value,
    onChange,
    onBlur,
    name,
    placeholder = '0',
    variant = 'compact',
  }: {
    value: unknown;
    onChange: (v: string) => void;
    onBlur?: () => void;
    name?: string;
    placeholder?: string;
    variant?: 'hero' | 'compact';
  },
  ref: React.Ref<HTMLInputElement>,
) {
  const isHero = variant === 'hero';
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(EXPENSE_FORM.primary, isHero ? 0.14 : 0.12)}`,
        bgcolor: 'background.paper',
        px: 1.5,
        py: isHero ? 1.25 : 0.75,
        minHeight: isHero ? 52 : 44,
        display: 'flex',
        alignItems: 'center',
        transition: 'border-color 0.15s ease',
        '&:focus-within': {
          borderColor: alpha(EXPENSE_FORM.primary, 0.45),
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          width: '100%',
          direction: 'ltr',
        }}
      >
        <Box
          component="input"
          ref={ref}
          name={name}
          value={value ?? ''}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode="decimal"
          autoComplete="off"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            border: 'none',
            outline: 'none',
            bgcolor: 'transparent',
            color: 'text.primary',
            fontSize: isHero ? '1.35rem' : '1rem',
            fontWeight: 700,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: '"Outfit", "Cairo", sans-serif',
            '&::placeholder': { color: 'text.disabled', fontWeight: 500 },
          }}
        />
        <Typography
          component="span"
          sx={{
            flexShrink: 0,
            minWidth: '2.25rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: EXPENSE_FORM.accent,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          د.ل
        </Typography>
      </Box>
    </Box>
  );
});
