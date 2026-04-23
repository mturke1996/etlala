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
  /** مظهر Etlala الرئيسية: تباعد أدق مع strip/compact (هيدر داخل %25 ارتفاع) */
  etlalaHomeDensity?: boolean;
  /** هيرو احترافي: عناوين أوضح، ظل أعمق، زوايا سفلية ناعمة، يتجاوز ضيق strip */
  premium?: boolean;
  /**
   * بحث + إحصائيات (أو أي محتوى) داخل نفس خلفية الهيرو — بلا زوايا مفرطة، يلتصق بعرض الشاشة.
   * عند التمرير يبقى الهيرو كتلة واحدة مربَعة السفل.
   */
  integratedSlot?: ReactNode;
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

/** PDF / مشاركة — فوق هيرو Etlala الداكن (صف واحد مع العنوان) */
export const profileListSessionHeroIconSecondarySx: SxProps<Theme> = {
  width: { xs: 40, sm: 44 },
  height: { xs: 40, sm: 44 },
  borderRadius: 2.5,
  bgcolor: '#EFEFED',
  color: '#1F2A2A',
  border: '1px solid rgba(31,61,53,0.08)',
  boxShadow: '0 2px 10px rgba(24,38,33,0.04)',
  '&:hover': { bgcolor: '#F6F6F4' },
};

/** زر إضافة ذهبي — نفس الصف */
export const profileListSessionHeroIconAccentSx = (accent: string): SxProps<Theme> => ({
  width: { xs: 40, sm: 44 },
  height: { xs: 40, sm: 44 },
  borderRadius: 2.5,
  bgcolor: accent,
  color: '#1F2A2A',
  border: '1px solid rgba(31,61,53,0.1)',
  boxShadow: '0 2px 12px rgba(200, 178, 125, 0.35)',
  fontWeight: 800,
  '&:hover': { bgcolor: alpha(accent, 0.92) },
});

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
  etlalaHomeDensity = false,
  premium = false,
  integratedSlot,
}: ProfileListSessionHeaderProps) {
  const resolvedAccent = accent ?? PROFILE_MODULE[module].accent;
  const resolvedOverline = overline ?? PROFILE_MODULE[module].overline;
  const tight = strip && compact;
  const ehd = etlalaHomeDensity && tight && !premium;
  const prm = premium && compact;
  const integrated = Boolean(integratedSlot);

  return (
    <Box
      className="etlala-home-hero--mesh"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'common.white',
        width: 1,
        alignSelf: 'stretch',
        /* دمج: هيرو مربع بلا border-radius يفسد التلاصق مع القائمة */
        borderTopLeftRadius: integrated ? 0 : undefined,
        borderTopRightRadius: integrated ? 0 : undefined,
        borderBottomLeftRadius: integrated
          ? 0
          : prm
            ? { xs: 22, sm: 26 }
            : squareBottom
              ? 0
              : compact
                ? { xs: 16, sm: 20 }
                : { xs: 20, sm: 24 },
        borderBottomRightRadius: integrated
          ? 0
          : prm
            ? { xs: 22, sm: 26 }
            : squareBottom
              ? 0
              : compact
                ? { xs: 16, sm: 20 }
                : { xs: 20, sm: 24 },
        background: headerGradient,
        boxShadow: prm
          ? '0 1px 0 rgba(255,255,255,0.07) inset, 0 20px 50px -14px rgba(0,0,0,0.45), 0 8px 24px -8px rgba(24,41,35,0.35)'
          : tight
          ? '0 1px 0 rgba(0,0,0,0.18) inset, 0 2px 12px -8px rgba(0,0,0,0.28)'
          : squareBottom
            ? '0 1px 0 rgba(0,0,0,0.2) inset, 0 8px 32px -16px rgba(0,0,0,0.4)'
            : compact
              ? '0 4px 24px -8px rgba(0,0,0,0.35)'
              : '0 8px 32px -12px rgba(0,0,0,0.45)',
        borderTop: squareBottom || prm || integrated ? `1px solid ${alpha('#C2B280', prm || integrated ? 0.35 : 0.28)}` : 'none',
        borderBottom: `1px solid ${alpha(integrated ? '#000' : squareBottom ? '#fff' : resolvedAccent, integrated ? 0.2 : squareBottom ? 0.12 : 0.45)}`,
        ...(ehd
          ? {
              flexShrink: 0,
            }
          : {}),
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
          // مسافات آمنة أفقية (يسار/يمين) على آيفون + Dynamic Island
          ...(prm
            ? {
                pl: { xs: 'max(10px, env(safe-area-inset-left, 0px))', sm: 2.5 },
                pr: { xs: 'max(10px, env(safe-area-inset-right, 0px))', sm: 2.5 },
              }
            : { px: { xs: 1.75, sm: 2.5 } }),
          pt: prm
            ? integrated
              ? 'calc(env(safe-area-inset-top, 0px) + 4px)'
              : 'calc(env(safe-area-inset-top, 0px) + 8px)'
            : ehd
            ? 'max(8px, env(safe-area-inset-top, 0px))'
            : tight
            ? 'max(16px, env(safe-area-inset-top, 0px))'
            : compact
            ? 'max(24px, env(safe-area-inset-top, 0px))'
            : 'max(32px, env(safe-area-inset-top, 0px))',
          pb: integrated
            ? 0
            : pdfRow
            ? (tight ? 0.5 : compact ? 1 : 1.5)
            : prm
              ? 1.65
            : ehd
              ? 0.2
            : tight
              ? 0.25
              : compact
                ? 0.75
                : 1.5,
        }}
      >
        <Stack spacing={integrated ? 0 : prm ? 1.35 : ehd ? 0.35 : tight ? 0.75 : compact ? 1.25 : 2.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="nowrap"
            gap={{ xs: 0.5, sm: 1 }}
            sx={{
              width: 1,
              ...(ehd ? { alignItems: 'flex-start' } : {}),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={prm ? { xs: 0.75, sm: 1.25 } : ehd ? 0.75 : tight ? 1 : compact ? 1.25 : 2}
              useFlexGap
              sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
            >
              <IconButton
                onClick={onBack}
                aria-label="رجوع"
                size="small"
                sx={{
                  flexShrink: 0,
                  minWidth: prm ? { xs: 40, sm: 44 } : tight ? 32 : compact ? 36 : 40,
                  minHeight: prm ? { xs: 40, sm: 44 } : tight ? 32 : compact ? 36 : 40,
                  p: prm ? 0.65 : 0.5,
                  borderRadius: prm ? 2.5 : tight ? 0 : 2,
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', prm ? 0.28 : 0.22)}`,
                  bgcolor: alpha('#fff', prm ? 0.12 : 0.08),
                  boxShadow: prm ? '0 2px 12px rgba(0,0,0,0.2)' : undefined,
                  '&:hover': { bgcolor: alpha('#fff', 0.18) },
                  '&:focus-visible': { outline: `2px solid ${alpha('#fff', 0.5)}`, outlineOffset: 2 },
                }}
              >
                <ArrowBack sx={prm ? { fontSize: { xs: 22, sm: 24 } } : tight ? { fontSize: 22 } : undefined} />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
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
                      letterSpacing: prm ? 1.15 : 1,
                      fontWeight: prm ? 800 : 700,
                      fontSize: prm ? '0.65rem' : ehd ? '0.52rem' : tight ? '0.55rem' : '0.58rem',
                      color: alpha('#fff', prm ? 0.62 : 0.5),
                      mb: prm ? 0.4 : ehd ? 0.05 : tight ? 0.1 : 0.2,
                    }}
                  >
                    {resolvedOverline}
                  </Typography>
                )}
                <Typography
                  fontWeight={900}
                  noWrap={!!prm}
                  sx={{
                    lineHeight: prm ? 1.2 : 1.1,
                    ...(prm
                      ? { overflow: 'hidden', textOverflow: 'ellipsis' }
                      : {}),
                    fontSize: prm
                      ? { xs: '1.05rem', sm: '1.32rem' }
                      : ehd
                      ? { xs: '0.9rem', sm: '0.95rem' }
                      : tight
                      ? { xs: '0.85rem', sm: '0.95rem' }
                      : compact
                        ? { xs: '0.95rem', sm: '1.05rem' }
                        : { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: prm ? 0.02 : 0.01,
                    textShadow: prm ? '0 2px 16px rgba(0,0,0,0.25)' : undefined,
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
                      color: alpha('#fff', prm ? 0.78 : 0.65),
                      fontWeight: prm ? 600 : 500,
                      mt: prm ? 0.5 : tight ? 0.2 : 0.35,
                      lineHeight: 1.4,
                    fontSize: prm ? { xs: '0.8rem', sm: '0.85rem' } : tight ? '0.72rem' : '0.78rem',
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

            <Stack
              direction="row"
              alignItems="center"
              spacing={prm ? { xs: 0.35, sm: 0.75 } : 1}
              sx={{ flexShrink: 0, alignSelf: 'center' }}
            >
              {endAdornment}
              {primaryAction ? <Box sx={{ display: 'inline-flex' }}>{primaryAction}</Box> : null}
            </Stack>
          </Stack>

          {integrated ? (
            <Box
              sx={{
                width: 1,
                display: 'flex',
                flexDirection: 'column',
                pt: 1,
                mt: 0.5,
                borderTop: `1px solid ${alpha('#fff', 0.12)}`,
                gap: 0.75,
                pb: 1.15,
              }}
            >
              {integratedSlot}
            </Box>
          ) : null}

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

          {(studioBottomAccent || prm) && !pdfRow && !integrated ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: prm ? 0.5 : tight ? 0.35 : compact ? 0.5 : 0.75,
                mt: prm ? 0.15 : 0.25,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: prm ? 72 : 56,
                  height: prm ? 2.5 : 2,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, transparent, #C2B280 20%, #E8DCC4 50%, #C2B280 80%, transparent)',
                  opacity: prm ? 1 : 0.9,
                  boxShadow: prm ? '0 0 20px rgba(200, 192, 176, 0.35)' : undefined,
                }}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
