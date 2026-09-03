import type { ReactNode } from 'react';
import { Box, Stack, Typography, alpha } from '@mui/material';
import { TrendingDown, PercentRounded, CalculateRounded } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

type Surface = 'dark' | 'light';

export type ClientDeficitAlertsProps = {
  /** العجز العام (الرصيد المتبقي بالسالب) */
  clientDeficit: number;
  /** عجز النسبة المتفق عليها */
  agreedPercentageDeficit: number;
  /** إجمالي التحصيل المطلوب لإغلاق العجز = العجز العام + عجز النسبة */
  requiredCollection: number;
  /** النسبة المتفق عليها (%) */
  profitPercentage: number;
  /** المصروفات تجاوزت المدفوعات */
  overspent?: boolean;
  /** dark: فوق ترويسة الموبايل الداكنة — light: فوق أسطح سطح المكتب الفاتحة */
  surface?: Surface;
  sx?: any;
};

const TONES = {
  danger: {
    gradient: 'linear-gradient(135deg, #E14B4B 0%, #B32E2E 100%)',
    glow: '0 6px 16px -10px rgba(214, 69, 69, 0.7)',
    ink: '#FFFFFF',
    softInk: 'rgba(255,255,255,0.82)',
    chipBg: 'rgba(255,255,255,0.18)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #F2B93D 0%, #D9930C 100%)',
    glow: '0 6px 16px -10px rgba(217, 147, 12, 0.7)',
    ink: '#2A2205',
    softInk: 'rgba(42,34,5,0.72)',
    chipBg: 'rgba(255,255,255,0.32)',
  },
} as const;

type Tone = keyof typeof TONES;

function DeficitAlertCard({
  tone,
  icon,
  title,
  value,
  note,
}: {
  tone: Tone;
  icon: ReactNode;
  title: string;
  value: string;
  note?: string;
}) {
  const t = TONES[tone];
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        px: 1.2,
        py: 0.85,
        background: t.gradient,
        borderInlineStart: `3px solid ${alpha('#fff', 0.55)}`,
        boxShadow: t.glow,
        color: t.ink,
        '&::after': {
          content: '""',
          position: 'absolute',
          insetBlockStart: 0,
          insetInlineEnd: 0,
          width: '46%',
          height: '100%',
          background: `radial-gradient(ellipse 90% 120% at 100% 0%, ${alpha('#fff', 0.18)} 0%, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: t.chipBg,
            border: `1px solid ${alpha('#fff', 0.24)}`,
            color: 'inherit',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.58rem', lineHeight: 1.3 }}>{title}</Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.72rem',
              lineHeight: 1.25,
              mt: 0.1,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {value}
          </Typography>
          {note ? (
            <Typography sx={{ fontWeight: 700, fontSize: '0.5rem', color: t.softInk, mt: 0.2 }}>
              {note}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

function TotalDeficitLine({
  requiredCollection,
  surface,
}: {
  requiredCollection: number;
  surface: Surface;
}) {
  const isDark = surface === 'dark';
  // لون محايد (رمادي مزرقّ) مختلف عن الأحمر والأصفر
  const accent = isDark ? '#AAB4C2' : '#5B6675';
  const bg = isDark ? alpha('#C4CDD9', 0.12) : alpha('#5B6675', 0.07);
  const ink = isDark ? 'rgba(255,255,255,0.9)' : '#3B4553';

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 1,
        py: 0.55,
        bgcolor: bg,
        borderInlineStart: `3px solid ${accent}`,
        color: ink,
      }}
    >
      <CalculateRounded sx={{ fontSize: 14, color: accent, flexShrink: 0 }} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.6rem', lineHeight: 1.35 }}>
        إجمالي العجز الكلي المطلوب تحصيله:{' '}
        <Box
          component="span"
          sx={{ fontWeight: 900, fontSize: '0.66rem', fontFamily: 'Outfit, sans-serif', color: accent }}
        >
          {formatCurrency(requiredCollection)}
        </Box>
      </Typography>
    </Stack>
  );
}

/**
 * تنبيهات العجز المالي للعميل:
 * - أحمر: العجز العام (الرصيد الحالي بالسالب)
 * - أصفر: عجز النسبة المتفق عليها
 * - بطاقة: مجموع العجز الكلي عند وجود العجزين معاً
 */
export function ClientDeficitAlerts({
  clientDeficit,
  agreedPercentageDeficit,
  requiredCollection,
  profitPercentage,
  overspent = false,
  surface = 'dark',
  sx,
}: ClientDeficitAlertsProps) {
  const hasGeneral = clientDeficit > 0;
  const hasPercentage = agreedPercentageDeficit > 0;

  if (!hasGeneral && !hasPercentage && !overspent) return null;

  return (
    <Stack spacing={1} sx={sx}>
      {hasGeneral ? (
        <DeficitAlertCard
          tone="danger"
          icon={<TrendingDown sx={{ fontSize: 16 }} />}
          title="تنبيه: الرصيد الحالي بالسالب"
          value={`يوجد عجز مالي بقيمة ${formatCurrency(clientDeficit)}`}
          note={overspent ? 'إجمالي المصروفات تجاوز قيمة المدفوعات' : undefined}
        />
      ) : overspent ? (
        <DeficitAlertCard
          tone="danger"
          icon={<TrendingDown sx={{ fontSize: 16 }} />}
          title="تنبيه: تجاوز في المصروفات"
          value="إجمالي المصروفات تجاوز قيمة المدفوعات"
        />
      ) : null}

      {hasPercentage ? (
        <DeficitAlertCard
          tone="warning"
          icon={<PercentRounded sx={{ fontSize: 16 }} />}
          title={`تنبيه: عجز في النسبة المتفق عليها${profitPercentage > 0 ? ` (${profitPercentage}%)` : ''}`}
          value={`قيمة العجز ${formatCurrency(agreedPercentageDeficit)}`}
          note="النسبة المستحقة على مبلغ العجز عند تحصيله"
        />
      ) : null}

      {hasGeneral && hasPercentage ? (
        <TotalDeficitLine requiredCollection={requiredCollection} surface={surface} />
      ) : null}
    </Stack>
  );
}

export default ClientDeficitAlerts;
