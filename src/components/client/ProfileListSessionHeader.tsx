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
}: ProfileListSessionHeaderProps) {
  const resolvedAccent = accent ?? PROFILE_MODULE[module].accent;
  const resolvedOverline = overline ?? PROFILE_MODULE[module].overline;

  return (
    <Box
      className="etlala-home-hero--mesh"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'common.white',
        borderBottomLeftRadius: { xs: 20, sm: 24 },
        borderBottomRightRadius: { xs: 20, sm: 24 },
        background: headerGradient,
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.45)',
        borderBottom: `1px solid ${alpha(resolvedAccent, 0.45)}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.22) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        className="etlala-dot-overlay"
        sx={{ zIndex: 0, mixBlendMode: 'soft-light', opacity: 0.5 }}
        aria-hidden
      />

      <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 2.75 }, pt: 'calc(max(env(safe-area-inset-top), 48px) + 4px)', pb: pdfRow ? 2.25 : 2.5 }}>
        <Stack spacing={2.25}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2.5}
            useFlexGap
            sx={{ rowGap: 2, columnGap: 2.5 }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={2} useFlexGap sx={{ flex: 1, minWidth: 0, maxWidth: { xs: '100%', sm: 'calc(100% - 200px)' } }}>
              <IconButton
                onClick={onBack}
                aria-label="رجوع"
                size="small"
                sx={{
                  minWidth: 48,
                  minHeight: 48,
                  p: 1,
                  mt: 0.25,
                  color: 'common.white',
                  border: `1px solid ${alpha('#fff', 0.22)}`,
                  bgcolor: alpha('#fff', 0.08),
                  '&:hover': { bgcolor: alpha('#fff', 0.14) },
                  '&:focus-visible': { outline: `2px solid ${alpha('#fff', 0.5)}`, outlineOffset: 2 },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1, pt: 0.15 }}>
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
                <Typography
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.25,
                    fontSize: { xs: '1.2rem', sm: '1.35rem' },
                    letterSpacing: 0.01,
                  }}
                >
                  {title}
                </Typography>
                {subtitle ? (
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
              </Box>
            </Stack>

            {primaryAction ? (
              <Box
                sx={{
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  pt: 0.25,
                  pl: { xs: 0, sm: 1.5 },
                  ml: { xs: 'auto', sm: 0 },
                }}
              >
                {primaryAction}
              </Box>
            ) : null}
          </Stack>

          {pdfRow ? (
            <Box
              sx={{
                width: 1,
                pt: 2.25,
                mt: 0.5,
                borderTop: `1px solid ${alpha('#fff', 0.12)}`,
              }}
            >
              {pdfRow}
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
