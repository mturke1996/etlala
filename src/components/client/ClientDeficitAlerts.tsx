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
        borderRadius: 2.25,
        px: 1.5,
        py: 1.15,
        background: t.gradient,
        border: `1px solid ${alpha('#fff', 0.18)}`,
        boxShadow: t.glow,
        color: t.ink,
        '&::after': {
          content: '""',
          position: 'absolute',
          insetBlockStart: 0,
          insetInlineEnd: 0,
          width: '46%',
          height: '100%',
          background: `radial-gradient(ellipse 90% 120% at 100% 0%, ${alpha('#fff', 0.2)} 0%, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: t.chipBg,
            border: `1px solid ${alpha('#fff', 0.26)}`,
            color: 'inherit',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.72rem', lineHeight: 1.35 }}>{title}</Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.88rem',
              lineHeight: 1.3,
              mt: 0.15,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {value}
          </Typography>
          {note ? (
            <Typography sx={{ fontWeight: 700, fontSize: '0.58rem', color: t.softInk, mt: 0.3 }}>
              {note}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

function TotalDeficitCard({
  clientDeficit,
  agreedPercentageDeficit,
  requiredCollection,
  profitPercentage,
  surface,
}: {
  clientDeficit: number;
  agreedPercentageDeficit: number;
  requiredCollection: number;
  profitPercentage: number;
  surface: Surface;
}) {
  const isDark = surface === 'dark';
  const ink = isDark ? '#fff' : '#2E2320';
  const softInk = isDark ? 'rgba(255,255,255,0.58)' : 'rgba(46,35,32,0.6)';
  const accent = isDark ? '#FFC2C2' : '#B54747';
  const line = alpha(isDark ? '#fff' : '#2E2320', isDark ? 0.1 : 0.08);

  const breakdown = [
    { label: 'العجز العام', value: clientDeficit },
    {
      label: profitPercentage > 0 ? `عجز النسبة ${profitPercentage}%` : 'عجز النسبة',
      value: agreedPercentageDeficit,
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        px: 1.5,
        py: 1.1,
        color: ink,
        border: `1px solid ${alpha(isDark ? '#FFB4B4' : '#B54747', isDark ? 0.24 : 0.2)}`,
        // خلفية زجاجية بدون blur لتخفيف الحِمل على الأداء
        background: isDark
          ? `linear-gradient(140deg, ${alpha('#FFFFFF', 0.08)} 0%, ${alpha('#E14B4B', 0.12)} 100%)`
          : 'linear-gradient(140deg, #FFF7F5 0%, #FFFBF0 100%)',
        boxShadow: isDark ? 'none' : '0 4px 14px -12px rgba(46,35,32,0.4)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            bgcolor: alpha(isDark ? '#FFB4B4' : '#B54747', isDark ? 0.14 : 0.1),
            border: `1px solid ${alpha(isDark ? '#FFB4B4' : '#B54747', 0.26)}`,
          }}
        >
          <CalculateRounded sx={{ fontSize: 18 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.62rem', color: softInk, letterSpacing: 0.3 }}>
            إجمالي العجز الكلي المطلوب تحصيله
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.02rem',
              lineHeight: 1.2,
              color: accent,
              fontFamily: 'Outfit, sans-serif',
              mt: 0.05,
            }}
          >
            {formatCurrency(requiredCollection)}
          </Typography>
        </Box>

        <Stack spacing={0.5} sx={{ flexShrink: 0, textAlign: 'start' }}>
          {breakdown.map((item) => (
            <Box
              key={item.label}
              sx={{
                px: 0.85,
                py: 0.3,
                borderRadius: 1.25,
                bgcolor: alpha(isDark ? '#FFFFFF' : '#2E2320', isDark ? 0.07 : 0.04),
                border: `1px solid ${line}`,
                lineHeight: 1.1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.54rem', color: softInk, display: 'block' }}>
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  color: ink,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {formatCurrency(item.value)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
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
          icon={<TrendingDown sx={{ fontSize: 19 }} />}
          title="تنبيه: الرصيد الحالي بالسالب"
          value={`يوجد عجز مالي بقيمة ${formatCurrency(clientDeficit)}`}
          note={overspent ? 'إجمالي المصروفات تجاوز قيمة المدفوعات' : undefined}
        />
      ) : overspent ? (
        <DeficitAlertCard
          tone="danger"
          icon={<TrendingDown sx={{ fontSize: 19 }} />}
          title="تنبيه: تجاوز في المصروفات"
          value="إجمالي المصروفات تجاوز قيمة المدفوعات"
        />
      ) : null}

      {hasPercentage ? (
        <DeficitAlertCard
          tone="warning"
          icon={<PercentRounded sx={{ fontSize: 19 }} />}
          title={`تنبيه: عجز في النسبة المتفق عليها${profitPercentage > 0 ? ` (${profitPercentage}%)` : ''}`}
          value={`قيمة العجز ${formatCurrency(agreedPercentageDeficit)}`}
          note="النسبة المستحقة على مبلغ العجز عند تحصيله"
        />
      ) : null}

      {hasGeneral && hasPercentage ? (
        <TotalDeficitCard
          clientDeficit={clientDeficit}
          agreedPercentageDeficit={agreedPercentageDeficit}
          requiredCollection={requiredCollection}
          profitPercentage={profitPercentage}
          surface={surface}
        />
      ) : null}
    </Stack>
  );
}

export default ClientDeficitAlerts;
