import {
  Box,
  CardContent,
  Container,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  alpha,
  type SxProps,
  type Theme,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EtlalaAccentSurface } from '../etlala/EtlalaMobileUi';
import type { ProfileSessionModule } from './profileSessionTokens';
import { PROFILE_MODULE } from './profileSessionTokens';

export type { ProfileSessionModule } from './profileSessionTokens';

const easeSmooth = [0.2, 0.8, 0.2, 1] as const;

export function ProfileSessionListShell({
  children,
  module,
}: {
  children: ReactNode;
  module?: ProfileSessionModule;
}) {
  const theme = useTheme();
  const tint = module
    ? alpha(PROFILE_MODULE[module].accent, theme.palette.mode === 'dark' ? 0.08 : 0.05)
    : 'transparent';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        bgcolor: theme.palette.mode === 'dark' ? '#0f130f' : '#f0ede6',
        background:
          theme.palette.mode === 'dark'
            ? `radial-gradient(ellipse 100% 45% at 100% 0%, ${tint} 0%, #0f130f 55%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(74,93,74,0.05) 0%, transparent 50%)`
            : `radial-gradient(ellipse 100% 50% at 0% 0%, ${tint} 0%, #f0ede6 50%), linear-gradient(180deg, #faf8f3 0%, #f2efe8 100%)`,
      }}
    >
      {children}
    </Box>
  );
}

const searchFieldSx: SxProps<Theme> = (theme) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    borderRadius: 2.5,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#fff',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(61,79,61,0.12)',
    boxShadow: theme.palette.mode === 'light' ? '0 1px 0 rgba(255,255,255,0.95) inset' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(61,79,61,0.2)',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.22)}`,
    },
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': { fontSize: '0.9rem', py: 1.1 },
  '& .MuiInputBase-input::placeholder': { opacity: 0.6, fontSize: '0.88rem' },
});

type ProfileSessionSearchProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function ProfileSessionSearch({ value, onChange, placeholder = 'بحث في السجلات…' }: ProfileSessionSearchProps) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={searchFieldSx}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: 'text.disabled', fontSize: 22 }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

export function ProfileSessionSearchBar({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        px: 2,
        py: 1.75,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(61,79,61,0.1)'}`,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.08) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 100%)',
        backdropFilter: 'blur(12px)',
      })}
    >
      {children}
    </Box>
  );
}

/** عنوان قسم داخل التمرير (مثال: «السجلات») */
export function ProfileSessionListHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        letterSpacing: 1.1,
        fontWeight: 800,
        fontSize: '0.65rem',
        color: 'text.secondary',
        mb: 1.25,
        opacity: 0.9,
      }}
    >
      {children}
    </Typography>
  );
}

export function ProfileSessionScroll({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Container maxWidth="sm" sx={{ py: 2, px: 2, pb: 3.5 }}>
        {children}
      </Container>
    </Box>
  );
}

type ProfileSessionTotalBarProps = {
  label: string;
  amount: string;
  tone?: 'default' | 'success' | 'danger';
  onClick?: () => void;
  children?: ReactNode;
  titleAdornment?: ReactNode;
  module?: ProfileSessionModule;
};

export function ProfileSessionTotalBar({
  label,
  amount,
  tone = 'default',
  onClick,
  children,
  titleAdornment,
  module,
}: ProfileSessionTotalBarProps) {
  const theme = useTheme();
  const accent = module ? PROFILE_MODULE[module].accent : undefined;

  const bg =
    tone === 'success'
      ? 'linear-gradient(145deg, #1a3d2a 0%, #0f2a1a 100%)'
      : tone === 'danger'
        ? 'linear-gradient(145deg, #3a1e1e 0%, #2a1212 100%)'
        : theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1c241c 0%, #141a14 100%)'
          : 'linear-gradient(145deg, #3d4f3d 0%, #2a3a2a 100%)';

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      sx={{
        position: 'relative',
        mt: 2.5,
        pt: accent ? 0.5 : 0,
        p: 2.25,
        borderRadius: 2.5,
        background: bg,
        color: '#fff',
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: '0 12px 36px -12px rgba(0,0,0,0.4)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        ...(onClick
          ? {
              '&:hover': {
                boxShadow: '0 16px 44px -10px rgba(0,0,0,0.5)',
                transform: 'translateY(-2px)',
              },
              '&:focus-visible': {
                outline: `2px solid ${alpha('#fff', 0.5)}`,
                outlineOffset: 2,
              },
            }
          : {}),
      }}
    >
      {accent ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.4)})`,
          }}
        />
      ) : null}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Typography fontWeight={800} fontSize="0.88rem" sx={{ color: 'rgba(255,255,255,0.95)' }}>
              {label}
            </Typography>
            {titleAdornment}
          </Box>
          <Typography
            fontWeight={900}
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.12rem',
              flexShrink: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {amount}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export const profileSessionRowCardContentSx: SxProps<Theme> = {
  p: 2.25,
  pt: 2,
  '&:last-child': { pb: 2.25 },
};

export function ProfileSessionRowMeta({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      sx={{ mt: 0.4, lineHeight: 1.5, fontSize: '0.72rem', fontWeight: 500 }}
    >
      {children}
    </Typography>
  );
}

type ProfileSessionRecordListItemProps = {
  accent: string;
  children: ReactNode;
  /** فهرس لحركة دخول متدرجة */
  index?: number;
};

/**
 * بطاقة سجل — حواف ناعمة، شريط لون، حركة دخول خفيفة (يُعطّل مع reduced-motion)
 */
export function ProfileSessionRecordListItem({ accent, children, index = 0 }: ProfileSessionRecordListItemProps) {
  const reduce = useReducedMotion();
  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index * 0.04, 0.24), duration: 0.35, ease: easeSmooth }}
    >
      <EtlalaAccentSurface
        accent={accent}
        sx={{
          borderRadius: 2.5,
          borderInlineStartWidth: 4,
          boxShadow: (t) =>
            t.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.3)'
              : '0 2px 0 rgba(255,255,255,0.9) inset, 0 6px 24px rgba(30,40,30,0.07)',
        }}
      >
        {children}
      </EtlalaAccentSurface>
    </Box>
  );
}

export function ProfileSessionRecordCardContent({ children }: { children: ReactNode }) {
  return <CardContent sx={profileSessionRowCardContentSx}>{children}</CardContent>;
}
