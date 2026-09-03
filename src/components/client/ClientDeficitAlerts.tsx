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
    glow: '0 10px 26px -12px rgba(214, 69, 69, 0.85)',
    ink: '#FFFFFF',
    softInk: 'rgba(255,255,255,0.82)',
    chipBg: 'rgba(255,255,255,0.18)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #F2B93D 0%, #D9930C 100%)',
    glow: '0 10px 26px -12px rgba(217, 147, 12, 0.85)',
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
        borderRadius: 2.5,
        px: 1.75,
        py: 1.5,
        background: t.gradient,
        border: `1px solid ${alpha('#fff', 0.2)}`,
        boxShadow: t.glow,
        color: t.ink,
        '&::after': {
          content: '""',
          position: 'absolute',
          insetBlockStart: 0,
          insetInlineEnd: 0,
          width: '48%',
          height: '100%',
          background: `radial-gradient(ellipse 90% 120% at 100% 0%, ${alpha('#fff', 0.22)} 0%, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: t.chipBg,
            border: `1px solid ${alpha('#fff', 0.28)}`,
            color: 'inherit',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.35 }}>{title}</Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.02rem',
              lineHeight: 1.3,
              mt: 0.25,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {value}
          </Typography>
          {note ? (
            <Typography sx={{ fontWeight: 700, fontSize: '0.66rem', color: t.softInk, mt: 0.35 }}>
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
  const softInk = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(46,35,32,0.62)';
  const accent = isDark ? '#FFC2C2' : '#B54747';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2.5,
        px: 1.75,
        py: 1.5,
        color: ink,
        border: `1px solid ${alpha(isDark ? '#FFB4B4' : '#B54747', isDark ? 0.32 : 0.24)}`,
        background: isDark
          ? `linear-gradient(140deg, ${alpha('#fff', 0.13)} 0%, ${alpha('#fff', 0.04)} 55%, ${alpha('#E14B4B', 0.14)} 100%)`
          : 'linear-gradient(140deg, #FFF7F5 0%, #FFFBF0 100%)',
        backdropFilter: isDark ? 'blur(18px)' : undefined,
        boxShadow: isDark
          ? `0 12px 32px -18px ${alpha('#000', 0.7)}, inset 0 1px 0 ${alpha('#fff', 0.12)}`
          : '0 8px 22px -18px rgba(46,35,32,0.5)',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            bgcolor: alpha(isDark ? '#FFB4B4' : '#B54747', isDark ? 0.16 : 0.1),
            border: `1px solid ${alpha(isDark ? '#FFB4B4' : '#B54747', 0.28)}`,
          }}
        >
          <CalculateRounded sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.72rem', color: softInk, letterSpacing: 0.4 }}>
            إجمالي العجز الكلي
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.16rem',
              lineHeight: 1.25,
              color: accent,
              fontFamily: 'Outfit, sans-serif',
              mt: 0.2,
            }}
          >
            {formatCurrency(requiredCollection)}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.63rem', color: softInk, mt: 0.15 }}>
            المطلوب تحصيله لإغلاق العجز بالكامل
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        sx={{
          mt: 1.25,
          pt: 1.15,
          borderTop: `1px solid ${alpha(isDark ? '#fff' : '#2E2320', isDark ? 0.12 : 0.08)}`,
        }}
      >
        {[
          { label: 'العجز العام', value: clientDeficit },
          {
            label: profitPercentage > 0 ? `عجز النسبة (${profitPercentage}%)` : 'عجز النسبة',
            value: agreedPercentageDeficit,
          },
        ].map((item, i) => (
          <Box
            key={item.label}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 0.5,
              borderInlineStart:
                i === 1 ? `1px solid ${alpha(isDark ? '#fff' : '#2E2320', isDark ? 0.12 : 0.08)}` : 'none',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.63rem', color: softInk, mb: 0.2 }}>
              {item.label}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.84rem',
                color: ink,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {formatCurrency(item.value)}
            </Typography>
          </Box>
        ))}
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
    <Stack spacing={1.25} sx={sx}>
      {hasGeneral ? (
        <DeficitAlertCard
          tone="danger"
          icon={<TrendingDown sx={{ fontSize: 22 }} />}
          title="تنبيه: الرصيد الحالي بالسالب"
          value={`يوجد عجز مالي بقيمة ${formatCurrency(clientDeficit)}`}
          note={overspent ? 'إجمالي المصروفات تجاوز قيمة المدفوعات' : undefined}
        />
      ) : overspent ? (
        <DeficitAlertCard
          tone="danger"
          icon={<TrendingDown sx={{ fontSize: 22 }} />}
          title="تنبيه: تجاوز في المصروفات"
          value="إجمالي المصروفات تجاوز قيمة المدفوعات"
        />
      ) : null}

      {hasPercentage ? (
        <DeficitAlertCard
          tone="warning"
          icon={<PercentRounded sx={{ fontSize: 22 }} />}
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
