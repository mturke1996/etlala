import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { Box, Container, IconButton, Stack, Typography, useTheme, alpha } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopLayout } from '../../hooks/useIsDesktopLayout';

/**
 * Etlala — هيكل صفحات موحّد
 * جوال: هيرو متدرج بزوايا سفلية. سطح المكتب: شريط أوامر مسطّح لاصق (لوحة تحكم).
 */
export interface PageScaffoldProps {
  title: ReactNode;
  subtitle?: string;
  /** مسار الـ React Router (افتراضي: /) */
  backTo?: string;
  /** إن وُضع: navigate(-1) بدل backTo */
  useHistoryBack?: boolean;
  rightAction?: ReactNode;
  /** شريط بحث/إحصائيات داخل الهيدر */
  headerExtra?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  children: ReactNode;
  /** margin-top للمحتوى بعد الهيدر */
  contentOffset?: number;
  /** دمج مع `sx` على شريط الهيدر الملون (مثلاً إخفاء عند الطباعة) */
  headerSx?: SxProps<Theme>;
  /** هيدر بروفايل/تفاصيل: تدرج أعمق، هندسة أنظف */
  headerVariant?: 'default' | 'profile';
}

export function PageScaffold({
  title,
  subtitle,
  backTo = '/',
  useHistoryBack,
  rightAction,
  headerExtra,
  maxWidth = 'sm',
  children,
  contentOffset = 0,
  headerSx,
  headerVariant = 'default',
}: PageScaffoldProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopLayout();
  const isDark = theme.palette.mode === 'dark';
  const isProfile = headerVariant === 'profile';
  const effectiveMaxWidth =
    maxWidth === 'sm' && isDesktop ? 'xl' : maxWidth;
  const pageBottomPad = isDesktop
    ? 4
    : 'calc(80px + env(safe-area-inset-bottom, 0px))';
  const hideBack = isDesktop && backTo === '/' && !useHistoryBack;

  const onBack = () => {
    if (useHistoryBack) navigate(-1);
    else navigate(backTo);
  };

  return (
    <Box
      className="etlala-page"
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        pb: pageBottomPad,
      }}
    >
      <Box
        component="header"
        className={isProfile ? 'etlala-home-hero--mesh' : undefined}
        sx={[
          {
            background: isProfile
              ? (isDark
                ? 'linear-gradient(166deg, #111A14 0%, #1A251D 42%, #121A15 100%)'
                : 'linear-gradient(166deg, #304238 0%, #2A3A31 45%, #233229 100%)')
              : (isDark
                ? 'linear-gradient(180deg, #1B251E 0%, #141C17 100%)'
                : 'linear-gradient(180deg, #35483D 0%, #2C3D33 100%)'),
            pt: isProfile
              ? (isDesktop
                ? '18px'
                : 'calc(env(safe-area-inset-top) + 17px)')
              : isDesktop
                ? '16px'
                : 'calc(env(safe-area-inset-top) + 14px)',
            pb: isProfile ? (isDesktop ? 2.5 : 3.25) : isDesktop ? 2 : 2.95,
            px: isDesktop ? 0 : 2,
            color: 'common.white',
            position: isDesktop ? 'sticky' : 'relative',
            top: isDesktop ? 0 : undefined,
            zIndex: isDesktop ? 20 : 1,
            overflow: 'hidden',
            borderRadius: isDesktop
              ? 0
              : isProfile
                ? { xs: '0 0 30px 30px', sm: '0 0 36px 36px' }
                : { xs: '0 0 24px 24px', sm: '0 0 30px 30px' },
            borderBottom: isDesktop
              ? `1px solid ${isDark ? 'rgba(212, 201, 163, 0.16)' : 'rgba(194, 178, 128, 0.28)'}`
              : `1px solid ${isDark ? 'rgba(226, 232, 240, 0.14)' : 'rgba(226, 232, 240, 0.24)'}`,
            boxShadow: isDesktop
              ? (isDark
                ? '0 8px 28px rgba(0,0,0,0.28)'
                : '0 8px 24px rgba(20, 28, 22, 0.12)')
              : isProfile
                ? (isDark
                  ? '0 20px 54px -16px rgba(0,0,0,0.62), inset 0 0 100px -50px rgba(194, 178, 128, 0.05), inset 0 -1px 0 rgba(226, 232, 240, 0.07)'
                  : '0 16px 44px -14px rgba(20, 28, 22, 0.4), inset 0 0 72px -34px rgba(255,255,255,0.05)')
                : (isDark
                  ? '0 14px 40px -16px rgba(0,0,0,0.56), inset 0 -1px 0 rgba(226, 232, 240, 0.05)'
                  : '0 12px 34px -14px rgba(20, 28, 22, 0.28), inset 0 -1px 0 rgba(255,255,255,0.1)'),
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: isProfile
                ? (isDark
                  ? 'radial-gradient(ellipse 110% 90% at 100% 0%, rgba(194, 178, 128, 0.12) 0%, transparent 48%), radial-gradient(ellipse 62% 52% at 0% 100%, rgba(255,255,255,0.05) 0%, transparent 52%)'
                  : 'radial-gradient(ellipse 100% 86% at 0% 0%, rgba(255,255,255,0.14) 0%, transparent 50%), radial-gradient(ellipse 70% 62% at 100% 100%, rgba(194, 178, 128, 0.1) 0%, transparent 56%)')
                : (isDark
                  ? 'radial-gradient(ellipse 80% 120% at 100% 0%, rgba(194, 178, 128, 0.1) 0%, transparent 55%)'
                  : 'radial-gradient(ellipse 70% 140% at 0% 0%, rgba(255,255,255,0.16) 0%, transparent 58%)'),
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)',
              pointerEvents: 'none',
            },
          },
          ...(headerSx ? [headerSx] : []),
        ] as SxProps<Theme>}
      >
        {isProfile ? (
          <Box className="etlala-dot-overlay" sx={{ zIndex: 0, pointerEvents: 'none' }} aria-hidden />
        ) : null}
        <Container maxWidth={effectiveMaxWidth} sx={{ position: 'relative', zIndex: 1, px: { xs: 0, lg: 3.5 } }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{ mb: headerExtra ? (isDesktop ? 1.75 : 2) : 0, minHeight: isDesktop ? 44 : 46 }}
          >
            {hideBack ? null : (
              <IconButton
                onClick={onBack}
                aria-label="رجوع"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '14px',
                  color: alpha('#fff', 0.95),
                  bgcolor: alpha('#fff', 0.08),
                  border: `1px solid ${alpha('#fff', 0.14)}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: alpha('#fff', 0.16), borderColor: alpha('#fff', 0.22) },
                  flexShrink: 0,
                }}
              >
                <ArrowRight size={20} strokeWidth={2} />
              </IconButton>
            )}
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <Typography
                component="h1"
                variant={isProfile ? 'h4' : 'h5'}
                sx={{
                  fontWeight: 800,
                  letterSpacing: isProfile ? 0.2 : 0.1,
                  lineHeight: 1.25,
                  color: '#fff',
                  fontFeatureSettings: '"kern" 1',
                  textShadow: isProfile
                    ? '0 2px 24px rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.2)'
                    : '0 1px 18px rgba(0,0,0,0.15)',
                  fontSize: isProfile
                    ? { xs: '1.35rem', sm: '1.5rem' }
                    : isDesktop
                      ? '1.28rem'
                      : { xs: '1.14rem', sm: '1.24rem' },
                }}
              >
                {title}
              </Typography>
              {subtitle ? (
                <Typography
                  component="p"
                  variant="caption"
                  sx={{
                    color: alpha('#fff', isProfile ? 0.75 : 0.7),
                    display: 'block',
                    mt: 0.4,
                    lineHeight: 1.5,
                    fontSize: isProfile ? '0.82rem' : isDesktop ? '0.8rem' : '0.78rem',
                    fontWeight: isProfile ? 500 : 400,
                    letterSpacing: isProfile ? 0.2 : undefined,
                  }}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {rightAction ? <Box sx={{ flexShrink: 0 }}>{rightAction}</Box> : null}
          </Stack>
          {headerExtra}
        </Container>
      </Box>

      <Container
        maxWidth={effectiveMaxWidth}
        sx={{
          py: isDesktop ? 3.5 : 2.5,
          px: isDesktop ? 3.5 : 2,
          mt: contentOffset,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
