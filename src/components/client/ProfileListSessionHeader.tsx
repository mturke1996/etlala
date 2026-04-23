import { Box, Stack, Typography, IconButton, alpha, type SxProps, type Theme } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { ReactNode } from 'react';
import type { ProfileSessionModule } from './profileSessionTokens';
import { PROFILE_MODULE } from './profileSessionTokens';

type ProfileListSessionHeaderProps = {
  module: ProfileSessionModule;
  title: string;
  subtitle?: string;
  overline?: string;
  accent?: string;
  onBack: () => void;
  headerGradient: string;
  primaryAction?: ReactNode;
  pdfRow?: ReactNode;
  /** هيرو أقصر — عناوين أصغر ومسافات أقل */
  compact?: boolean;
  /** أيقونة إضافية (مثل قائمة التصدير) بجانب زر الإضافة */
  endAdornment?: ReactNode;
  /** تمويجات سفلية = 0 — مظهر معماري حاد (بدون border-radius) */
  squareBottom?: boolean;
  /** خط زخرفي ذهبي رقيق تحت العنوان — مود «استوديو» */
  studioBottomAccent?: boolean;
  /**
   * شريط علوي قصير جداً (Swiss / ledger): يُستخدم مع `compact` + `squareBottom`.
   * يقلل padding رأسيًا ويُناسب الشاشات التي تحتاج أقصى مساحة للقائمة.
   */
  strip?: boolean;
};

/** أزرار ثانوية (PDF / مشاركة) فوق خلفية الهيرو الداكنة — مرتفعة، غير ملتصقة */
export const profileHeroPdfButtonSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  minHeight: 48,
  px: 2.25,
  py: 1.35,
  fontSize: '0.8125rem',
  fontWeight: 700,
  lineHeight: 1.2,
  borderRadius: 2,
  textTransform: 'none',
  letterSpacing: 0.02,
  color: '#fff',
  bgcolor: alpha('#fff', 0.1),
  border: `1px solid ${alpha('#fff', 0.22)}`,
  boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    bgcolor: alpha('#fff', 0.16),
    borderColor: alpha('#fff', 0.3),
  },
  '&:focus-visible': {
    outline: `2px solid ${alpha('#fff', 0.5)}`,
    outlineOffset: 2,
  },
  '&:disabled': {
    color: alpha('#fff', 0.75),
    borderColor: alpha('#fff', 0.12),
    opacity: 0.65,
  },
};

export const profileHeroPrimaryButtonSx: SxProps<Theme> = {
  minHeight: 48,
  px: 2.5,
  py: 1.15,
  fontSize: '0.875rem',
  fontWeight: 800,
  lineHeight: 1.2,
  borderRadius: 2,
  textTransform: 'none',
  boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.24)' },
  '&:focus-visible': { outline: `2px solid ${alpha('#fff', 0.45)}`, outlineOffset: 2 },
  '& .MuiButton-startIcon': { marginInlineStart: 0, marginInlineEnd: 0.75 },
};

export const profileHeroAddIconButtonSx: SxProps<Theme> = {
  minWidth: 48,
  minHeight: 48,
  color: 'common.white',
  borderRadius: 2,
  border: `1px solid ${alpha('#fff', 0.24)}`,
  bgcolor: alpha('#fff', 0.08),
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': { bgcolor: alpha('#fff', 0.15), borderColor: alpha('#fff', 0.32) },
  '&:focus-visible': { outline: `2px solid ${alpha('#fff', 0.5)}`, outlineOffset: 2 },
};

/**
 * رأس جلسة القائمة — هيرو **نضيف**: تدرج + طبقة خفيفة + شبكة نقاط، دون فوضى بصرية.
 * مسافات واضحة بين العنوان والإجراءات وأزرار PDF.
 */
export function ProfileListSessionHeader({
  module,
  title,
  subtitle,
  overline,
  accent,
  onBack,
  headerGradient,
  primaryAction,
  pdfRow,
  compact = false,
  endAdornment,
  squareBottom = false,
  studioBottomAccent = false,
  strip = false,
}: ProfileListSessionHeaderProps) {
  const resolvedAccent = accent ?? PROFILE_MODULE[module].accent;
  const resolvedOverline = overline ?? PROFILE_MODULE[module].overline;
  const tight = strip && compact;

  return (
    <Box
      className="etlala-home-hero--mesh"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'common.white',
        borderBottomLeftRadius: squareBottom ? 0 : compact ? { xs: 16, sm: 20 } : { xs: 20, sm: 24 },
        borderBottomRightRadius: squareBottom ? 0 : compact ? { xs: 16, sm: 20 } : { xs: 20, sm: 24 },
        background: headerGradient,
        boxShadow: tight
          ? '0 1px 0 rgba(0,0,0,0.18) inset, 0 2px 12px -8px rgba(0,0,0,0.28)'
          : squareBottom
            ? '0 1px 0 rgba(0,0,0,0.2) inset, 0 8px 32px -16px rgba(0,0,0,0.4)'
            : compact
              ? '0 4px 24px -8px rgba(0,0,0,0.35)'
              : '0 8px 32px -12px rgba(0,0,0,0.45)',
        borderTop: squareBottom ? `1px solid ${alpha('#C2B280', 0.28)}` : 'none',
        borderBottom: `1px solid ${alpha(squareBottom ? '#fff' : resolvedAccent, squareBottom ? 0.12 : 0.45)}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: squareBottom
            ? 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.2) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.22) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        className="etlala-dot-overlay"
        sx={{ zIndex: 0, mixBlendMode: 'soft-light', opacity: 0.5 }}
        aria-hidden
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 1.75, sm: 2.5 },
          pt: tight
            ? 'calc(max(env(safe-area-inset-top), 16px))'
            : compact
            ? 'calc(max(env(safe-area-inset-top), 24px))'
            : 'calc(max(env(safe-area-inset-top), 32px))',
          pb: pdfRow
            ? (tight ? 0.5 : compact ? 1 : 1.5)
            : tight
              ? 0.25
              : compact
                ? 0.75
                : 1.5,
        }}
      >
        <Stack spacing={tight ? 0.75 : compact ? 1.25 : 2.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="nowrap"
            gap={1}
            sx={{ width: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={tight ? 1 : compact ? 1.25 : 2}
              useFlexGap
              sx={{ flex: 1, minWidth: 0 }}
            >
              <IconButton
                onClick={onBack}
                aria-label="رجوع"
                size="small"
                sx={{
                  minWidth: tight ? 32 : compact ? 36 : 40,
                  minHeight: tight ? 32 : compact ? 36 : 40,
                  p: 0.5,
                  borderRadius: tight ? 0 : 2,
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', 0.22)}`,
                  bgcolor: alpha('#fff', 0.08),
                  '&:hover': { bgcolor: alpha('#fff', 0.14) },
                  '&:focus-visible': { outline: `2px solid ${alpha('#fff', 0.5)}`, outlineOffset: 2 },
                }}
              >
                <ArrowBack sx={tight ? { fontSize: 22 } : undefined} />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {!compact && (
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'block',
                      lineHeight: 1.35,
                      letterSpacing: 1.2,
                      fontWeight: 800,
                      fontSize: '0.62rem',
                      color: alpha('#fff', 0.55),
                      mb: 0.35,
                    }}
                  >
                    {resolvedOverline}
                  </Typography>
                )}
                {compact && (
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'block',
                      letterSpacing: 1,
                      fontWeight: 700,
                      fontSize: tight ? '0.55rem' : '0.58rem',
                      color: alpha('#fff', 0.5),
                      mb: tight ? 0.1 : 0.2,
                    }}
                  >
                    {resolvedOverline}
                  </Typography>
                )}
                <Typography
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.1,
                    fontSize: tight
                      ? { xs: '0.85rem', sm: '0.95rem' }
                      : compact
                        ? { xs: '0.95rem', sm: '1.05rem' }
                        : { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: 0.01,
                  }}
                >
                  {title}
                </Typography>
                {subtitle && !compact ? (
                  <Typography
                    component="p"
                    variant="body2"
                    sx={{
                      color: alpha('#fff', 0.7),
                      fontWeight: 600,
                      mt: 0.75,
                      lineHeight: 1.45,
                      fontSize: { xs: '0.8rem', sm: '0.86rem' },
                      maxWidth: 520,
                    }}
                  >
                    {subtitle}
                  </Typography>
                ) : null}
                {subtitle && compact ? (
                  <Typography
                    component="p"
                    variant="body2"
                    sx={{
                      color: alpha('#fff', 0.65),
                      fontWeight: 500,
                      mt: tight ? 0.2 : 0.35,
                      lineHeight: 1.35,
                    fontSize: tight ? '0.72rem' : '0.78rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                    {subtitle}
                  </Typography>
                ) : null}
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
              {endAdornment}
              {primaryAction ? <Box sx={{ display: 'inline-flex' }}>{primaryAction}</Box> : null}
            </Stack>
          </Stack>

          {pdfRow ? (
            <Box
              sx={{
                width: 1,
                pt: compact ? 1.35 : 2.25,
                mt: compact ? 0 : 0.5,
                borderTop: `1px solid ${alpha('#fff', 0.12)}`,
              }}
            >
              {pdfRow}
            </Box>
          ) : null}

          {studioBottomAccent && !pdfRow ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: tight ? 0.35 : compact ? 0.5 : 0.75,
                mt: 0.25,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 56,
                  height: 2,
                  borderRadius: 0,
                  background: 'linear-gradient(90deg, transparent, #C2B280 20%, #E8DCC4 50%, #C2B280 80%, transparent)',
                  opacity: 0.9,
                }}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
