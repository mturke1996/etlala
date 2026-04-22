import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { Box, Container, IconButton, Stack, Typography, useTheme, alpha } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Etlala — هيكل صفحات موحّد
 * UI/UX Pro Max: Swiss spacing، تدرج علوي نقي، تركيز واضح، ومساحة بيضاء سخية.
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
  const isDark = theme.palette.mode === 'dark';
  const isProfile = headerVariant === 'profile';

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
        pb: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="header"
        className={isProfile ? 'etlala-home-hero--mesh' : undefined}
        sx={[
          {
            background: isProfile
              ? (isDark
                ? 'linear-gradient(168deg, #0B1221 0%, #111C3A 38%, #0D1528 100%)'
                : 'linear-gradient(168deg, #4361EE 0%, #2E44A6 45%, #1B296B 100%)')
              : (isDark
                ? 'linear-gradient(162deg, #111827 0%, #0B0F19 52%, #090C14 100%)'
                : 'linear-gradient(162deg, #637DFF 0%, #4361EE 46%, #2E44A6 100%)'),
            pt: isProfile ? 'calc(env(safe-area-inset-top) + 16px)' : 'calc(env(safe-area-inset-top) + 12px)',
            pb: isProfile ? 3.5 : 2.75,
            px: 2,
            color: 'common.white',
            borderRadius: isProfile ? { xs: '0 0 32px 32px', sm: '0 0 40px 40px' } : { xs: '0 0 26px 26px', sm: '0 0 32px 32px' },
            boxShadow: isProfile
              ? (isDark
                ? '0 28px 80px -12px rgba(0,0,0,0.65), inset 0 0 100px -40px rgba(67, 97, 238, 0.06), inset 0 -1px 0 rgba(226, 232, 240, 0.08)'
                : '0 24px 64px -14px rgba(15, 25, 60, 0.5), inset 0 0 80px -30px rgba(255,255,255,0.04)')
              : (isDark
                ? '0 20px 56px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(226, 232, 240, 0.06)'
                : '0 16px 48px -12px rgba(20, 25, 45, 0.35), inset 0 -1px 0 rgba(255,255,255,0.12)'),
            position: 'relative',
            overflow: 'hidden',
            borderBottom: isProfile
              ? `1px solid ${isDark ? 'rgba(226, 232, 240, 0.12)' : 'rgba(226, 232, 240, 0.28)'}`
              : `2px solid ${isDark ? 'rgba(226, 232, 240, 0.14)' : 'rgba(226, 232, 240, 0.22)'}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: isProfile
                ? (isDark
                  ? 'radial-gradient(ellipse 100% 90% at 100% 0%, rgba(100, 130, 255, 0.18) 0%, transparent 45%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(226, 232, 240, 0.06) 0%, transparent 50%)'
                  : 'radial-gradient(ellipse 100% 85% at 0% 0%, rgba(255,255,255,0.2) 0%, transparent 48%), radial-gradient(ellipse 70% 60% at 100% 100%, rgba(226, 232, 240, 0.12) 0%, transparent 55%)')
                : (isDark
                  ? 'radial-gradient(ellipse 90% 70% at 100% 0%, rgba(100, 130, 255, 0.12) 0%, transparent 52%)'
                  : 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(255,255,255,0.22) 0%, transparent 55%)'),
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: isProfile ? 2 : 1,
              background: isProfile
                ? (isDark
                  ? 'linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.25) 20%, rgba(226, 232, 240, 0.45) 50%, rgba(226, 232, 240, 0.25) 80%, transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 30%, rgba(226, 232, 240, 0.4) 50%, rgba(255,255,255,0.4) 70%, transparent)')
                : (isDark
                  ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)'),
              pointerEvents: 'none',
            },
          },
          ...(headerSx ? [headerSx] : []),
        ] as SxProps<Theme>}
      >
        {isProfile ? (
          <Box className="etlala-dot-overlay" sx={{ zIndex: 0, pointerEvents: 'none' }} aria-hidden />
        ) : null}
        <Container maxWidth={maxWidth} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{ mb: headerExtra ? 2 : 0, minHeight: 46 }}
          >
            <IconButton
              onClick={onBack}
              aria-label="رجوع"
              sx={{
                color: alpha('#fff', 0.95),
                bgcolor: alpha('#fff', 0.08),
                border: `1px solid ${alpha('#fff', 0.12)}`,
                '&:hover': { bgcolor: alpha('#fff', 0.16) },
                flexShrink: 0,
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <Typography
                component="h1"
                variant={isProfile ? 'h4' : 'h5'}
                sx={{
                  fontWeight: 800,
                  letterSpacing: isProfile ? 0.2 : 0.15,
                  lineHeight: 1.2,
                  color: '#fff',
                  fontFeatureSettings: '"kern" 1',
                  textShadow: isProfile
                    ? '0 2px 24px rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.2)'
                    : '0 1px 18px rgba(0,0,0,0.15)',
                  fontSize: isProfile ? { xs: '1.35rem', sm: '1.5rem' } : undefined,
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
                    mt: 0.5,
                    lineHeight: 1.5,
                    fontSize: isProfile ? '0.82rem' : undefined,
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
        maxWidth={maxWidth}
        sx={{
          flex: 1,
          py: 2.5,
          px: 2,
          mt: contentOffset,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
