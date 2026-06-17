import type { ElementType } from 'react';
import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CheckCircleOutline,
  EditNote,
  ErrorOutline,
  PieChartOutline,
  ReceiptLong,
  SendOutlined,
  CancelOutlined,
} from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import dayjs from 'dayjs';
import type { Invoice } from '../../types';
import { formatCurrency, formatDate, getStatusLabel } from '../../utils/formatters';
import { premiumTokens } from '../../theme/tokens';

type StatusKey = Invoice['status'];

const STATUS_META: Record<
  StatusKey,
  { icon: ElementType; accent: string; chipBg: string; chipColor: string }
> = {
  paid: {
    icon: CheckCircleOutline,
    accent: premiumTokens.primary,
    chipBg: 'rgba(47, 62, 52, 0.12)',
    chipColor: premiumTokens.primary,
  },
  overdue: {
    icon: ErrorOutline,
    accent: '#B54747',
    chipBg: 'rgba(181, 71, 71, 0.12)',
    chipColor: '#9A3838',
  },
  partially_paid: {
    icon: PieChartOutline,
    accent: premiumTokens.accent,
    chipBg: 'rgba(194, 178, 128, 0.24)',
    chipColor: '#5C5234',
  },
  draft: {
    icon: EditNote,
    accent: premiumTokens.textMuted,
    chipBg: 'rgba(31, 37, 33, 0.07)',
    chipColor: premiumTokens.textMuted,
  },
  sent: {
    icon: SendOutlined,
    accent: '#4A5E50',
    chipBg: 'rgba(74, 94, 80, 0.12)',
    chipColor: premiumTokens.primary,
  },
  cancelled: {
    icon: CancelOutlined,
    accent: premiumTokens.textMuted,
    chipBg: 'rgba(31, 37, 33, 0.06)',
    chipColor: premiumTokens.textMuted,
  },
};

export interface InvoiceListItemProps {
  invoice: Invoice;
  clientName: string;
  isLast: boolean;
  index: number;
  onClick: () => void;
}

export function InvoiceListItem({
  invoice,
  clientName,
  isLast,
  index,
  onClick,
}: InvoiceListItemProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const reduceMotion = useReducedMotion();
  const meta = STATUS_META[invoice.status] ?? STATUS_META.draft;
  const StatusIcon = meta.icon;
  const isOverdue =
    invoice.status !== 'paid' &&
    invoice.status !== 'cancelled' &&
    dayjs(invoice.dueDate).isBefore(dayjs(), 'day');

  return (
    <Box
      component={motion.div}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.28),
        duration: 0.32,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.992 }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.5,
        py: 1.35,
        minHeight: 72,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.15s ease',
        '&:active': {
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(47, 62, 52, 0.04)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          flexShrink: 0,
          mt: 0.15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDark ? alpha(meta.accent, 0.18) : alpha(meta.accent, 0.1),
          border: `1px solid ${alpha(meta.accent, isDark ? 0.28 : 0.18)}`,
        }}
      >
        <StatusIcon sx={{ fontSize: 20, color: meta.accent }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.84rem',
              color: 'text.primary',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            #{invoice.invoiceNumber}
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.88rem',
              color: 'primary.main',
              fontFamily: "'Outfit', sans-serif",
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
              letterSpacing: -0.3,
            }}
          >
            {formatCurrency(invoice.total)}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'text.secondary',
            mt: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {clientName}
        </Typography>

        <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 0.65 }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 500, color: 'text.disabled' }}>
            {formatDate(invoice.issueDate)}
          </Typography>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' ? (
            <>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'divider' }} />
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: isOverdue ? '#B54747' : premiumTokens.textMuted,
                }}
              >
                {isOverdue ? 'متأخرة · ' : 'استحقاق '}
                {formatDate(invoice.dueDate)}
              </Typography>
            </>
          ) : null}
          <Chip
            label={getStatusLabel(invoice.status)}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.6rem',
              fontWeight: 700,
              borderRadius: '6px',
              bgcolor: isDark ? alpha(meta.chipColor, 0.14) : meta.chipBg,
              color: meta.chipColor,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
}

export function InvoiceMonthHeader({ label, count }: { label: string; count: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 0.5,
        pt: 2,
        pb: 0.75,
        '&:first-of-type': { pt: 0.5 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <ReceiptLong sx={{ fontSize: 16, color: premiumTokens.accent, opacity: 0.85 }} />
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'text.secondary',
            letterSpacing: '0.04em',
            textTransform: 'none',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'text.disabled',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count}
      </Typography>
    </Box>
  );
}
