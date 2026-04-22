import type { ReactNode, ElementType } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/** صف تنقّل مسطح — أسلوب تطبيقات حديثة (بدون ظلال ثقيلة) */
export function EtlalaNavRow(props: {
  title: string;
  subtitle?: string;
  icon: ElementType;
  accent: string;
  onClick: () => void;
  end?: ReactNode;
  /** شريط تحذير علوي (مثلاً صندوق منخفض) */
  topStripe?: string;
  dense?: boolean;
}) {
  const { title, subtitle, icon: Icon, accent, onClick, end, topStripe, dense } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        minHeight: dense ? 56 : 64,
        px: 2,
        py: 1.35,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderInlineStart: `3px solid ${accent}`,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.92)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        boxShadow: isDark ? 'none' : '0 1px 0 rgba(255,255,255,0.9) inset',
        overflow: 'hidden',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(61,79,61,0.04)',
          boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.06)' : '0 1px 0 rgba(255,255,255,1) inset, 0 4px 18px rgba(20,25,20,0.05)',
        },
        '&:active': { transform: 'scale(0.995)' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:active': { transform: 'none' } },
      }}
    >
      {topStripe ? (
        <Box
          aria-hidden
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: topStripe }}
        />
      ) : null}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0, flex: 1, pt: topStripe ? 0.3 : 0 }}>
        <Box
          sx={{
            width: dense ? 42 : 46,
            height: dense ? 42 : 46,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${accent}18`,
            border: `1px solid ${accent}2a`,
          }}
        >
          <Icon sx={{ fontSize: dense ? 22 : 24, color: accent }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} sx={{ fontSize: '0.95rem', letterSpacing: 0.1, lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 500, display: 'block', mt: 0.2 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{end}</Box>
    </Box>
  );
}

/** عنوان قسم — نفس فكرة الصفحة الرئيسية: شريط رأسي + نص */
export function EtlalaSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2, px: 0.25, mt: 0.5 }}>
      <Box
        sx={{
          width: 3,
          height: 26,
          borderRadius: 1.5,
          mt: 0.4,
          flexShrink: 0,
          background: isDark
            ? 'linear-gradient(180deg, #8aab8c, #2d3d2c)'
            : 'linear-gradient(180deg, #3d4f3d, #6b7f6b)',
        }}
        aria-hidden
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ letterSpacing: 0.15, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export function EtlalaEmptyState(props: {
  title: string;
  hint?: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { title, hint, icon, actionLabel, onAction } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 7 },
        px: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)',
        backgroundImage: isDark
          ? 'none'
          : 'linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(250,247,240,0.9) 100%)',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 28px rgba(20,25,20,0.04)',
      }}
    >
      <Box sx={{ color: 'text.secondary', opacity: 0.35, mb: 2, '& svg': { fontSize: 56 } }}>{icon}</Box>
      <Typography variant="h6" color="text.secondary" fontWeight={700} sx={{ mb: hint ? 0.5 : 0, fontSize: '1rem' }}>
        {title}
      </Typography>
      {hint ? (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 280, mx: 'auto', lineHeight: 1.5 }}>
          {hint}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2.5, borderRadius: 2.5, fontWeight: 800, px: 3 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}

/** بطاقة صف في قوائم (عملاء / فواتير / مدفوعات…) — mobile-first */
export function EtlalaAccentSurface(props: {
  children: ReactNode;
  /** لون شريط البداية (inline-start) */
  accent: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}) {
  const { children, accent, onClick, sx: sxIn } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      sx={[
        {
          borderRadius: 2,
          cursor: onClick ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: 'divider',
          borderInlineStart: `4px solid ${accent}`,
          bgcolor: 'background.paper',
          backgroundImage: isDark
            ? 'linear-gradient(115deg, #1a221a 0%, #171c17 100%)'
            : 'linear-gradient(115deg, #fff 0%, #faf7f0 100%)',
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 20px rgba(20,25,20,0.05)',
          transition: 'transform 0.22s ease, box-shadow 0.28s ease, border-color 0.22s ease',
          WebkitTapHighlightColor: 'transparent',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
          ...(onClick
            ? {
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
                    : '0 14px 40px rgba(61, 79, 61, 0.14), 0 0 0 1px rgba(255,255,255,0.5) inset',
                },
                '&:active': { transform: 'scale(0.99)' },
              }
            : {}),
        },
        ...(sxIn ? [sxIn] : []),
      ] as SxProps<Theme>}
    >
      {children}
    </Box>
  );
}

/** صف نصوص صغير للمبالغ (RTL) */
export function EtlalaStatRow(props: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      useFlexGap
      spacing={1}
      sx={{ gap: 1, rowGap: 0.75, pt: 1.5, mt: 1, borderTop: '1px dashed', borderColor: 'divider' }}
    >
      {props.items.map((it) => (
        <Box
          key={it.label}
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(61,79,61,0.04)'),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>
            {it.label}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{ fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', color: it.color || 'text.primary' }}
          >
            {it.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

/** حقول البحث في منطقة المحتوى (تحت هيدر PageScaffold) */
export const etlalaContentFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: (t) =>
      t.palette.mode === 'dark' ? 'none' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 10px rgba(20,25,20,0.04)',
  },
};
