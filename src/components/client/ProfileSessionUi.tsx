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
            ? `radial-gradient(ellipse 100% 45% at 100% 0%, ${tint} 0%, #0f130f 55%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(47, 62, 52, 0.05) 0%, transparent 50%)`
            : `radial-gradient(ellipse 100% 50% at 0% 0%, ${tint} 0%, #f0ede6 50%), linear-gradient(180deg, #faf8f3 0%, #f2efe8 100%)`,
      }}
    >
      {children}
    </Box>
  );
}

/** بحث بمظهر استوديو — حواف ناعمة وظل خفيف */
const searchFieldSxElegant: SxProps<Theme> = (theme) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 50,
    borderRadius: 2,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(47, 62, 52, 0.1)',
    boxShadow: theme.palette.mode === 'light' ? '0 2px 8px rgba(47, 62, 52, 0.06), 0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: 'rgba(194, 178, 128, 0.45)',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': { fontSize: '0.9rem', py: 1.15, fontWeight: 500 },
  '& .MuiInputBase-input::placeholder': { opacity: 0.5, fontSize: '0.875rem' },
});

const searchFieldSxSharp: SxProps<Theme> = (theme) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 42,
    borderRadius: 0,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(47, 62, 52, 0.12)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(47, 62, 52, 0.22)',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
      boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}`,
    },
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.9 },
  '& .MuiInputBase-input::placeholder': { opacity: 0.55, fontSize: '0.82rem' },
});

const searchFieldSx: SxProps<Theme> = (theme) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    borderRadius: 2.5,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#fff',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(47, 62, 52, 0.12)',
    boxShadow: theme.palette.mode === 'light' ? '0 1px 0 rgba(255,255,255,0.95) inset' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(47, 62, 52, 0.2)',
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
  /** حواف 0 — مطابق لقائمة مصروفات مدمجة */
  sharp?: boolean;
  /** حواف لينة + ظل — قسم مصروفات مرتق */
  elegant?: boolean;
};

export function ProfileSessionSearch({ value, onChange, placeholder = 'بحث في السجلات…', sharp, elegant }: ProfileSessionSearchProps) {
  const fieldSx = elegant ? searchFieldSxElegant : sharp ? searchFieldSxSharp : searchFieldSx;
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={fieldSx}
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

export function ProfileSessionSearchBar({
  children,
  dense,
  flush,
}: {
  children: ReactNode;
  dense?: boolean;
  /** بدون padding جانبي — بعرض المخطط */
  flush?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        px: flush ? 0 : dense ? 1.5 : 2,
        py: flush ? 0.75 : dense ? 1.15 : 1.75,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(47, 62, 52, 0.1)'}`,
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
export function ProfileSessionListHeading({ children, tight }: { children: ReactNode; /** مسافة أقل — قوائم مدمجة */ tight?: boolean }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        letterSpacing: 1.1,
        fontWeight: 800,
        fontSize: tight ? '0.6rem' : '0.65rem',
        color: 'text.secondary',
        mb: tight ? 0.5 : 1.25,
        opacity: 0.9,
      }}
    >
      {children}
    </Typography>
  );
}

export function ProfileSessionScroll({
  children,
  dense,
  flush,
}: {
  children: ReactNode;
  /** تقليل الهوامش لزيادة مساحة التمرير العمودية (قوائم طويلة) */
  dense?: boolean;
  /** عرض كامل بدون هوامش أفقية — قوائم مصروفات مدمجة */
  flush?: boolean;
}) {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
      <Container
        maxWidth="sm"
        disableGutters={dense || flush}
        sx={{
          py: flush ? 0 : dense ? 1.25 : 2,
          px: flush ? 0 : dense ? { xs: 1.5, sm: 2 } : 2,
          pb: flush ? 3 : dense ? 4 : 3.5,
        }}
      >
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
  /** زوايا 0 — متوافق مع قائمة مسطحة */
  square?: boolean;
};

export function ProfileSessionTotalBar({
  label,
  amount,
  tone = 'default',
  onClick,
  children,
  titleAdornment,
  module,
  square = false,
}: ProfileSessionTotalBarProps) {
  const theme = useTheme();
  const accent = module ? PROFILE_MODULE[module].accent : undefined;

  const bg =
    tone === 'success'
      ? 'linear-gradient(145deg, #1a3d2a 0%, #0f2a1a 100%)'
      : tone === 'danger'
        ? module === 'expenses'
          ? 'linear-gradient(145deg, #3d4f44 0%, #243028 100%)'
          : 'linear-gradient(145deg, #3a1e1e 0%, #2a1212 100%)'
        : theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1c241c 0%, #141a14 100%)'
          : 'linear-gradient(145deg, #2F3E34 0%, #1a2218 100%)';

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      sx={{
        position: 'relative',
        mt: square ? 1 : 2.5,
        pt: accent ? 0.5 : 0,
        p: square ? 1.75 : 2.5,
        borderRadius: square ? 0 : 3.5,
        background: bg,
        color: '#fff',
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: '0 16px 40px -12px rgba(0,0,0,0.4)',
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

export function ProfileSessionRowMeta({
  children,
  large,
}: {
  children: ReactNode;
  /** نص أوضح لقوائم المصروفات الطويلة */
  large?: boolean;
}) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      sx={{
        mt: 0.45,
        lineHeight: 1.55,
        fontSize: large ? '0.82rem' : '0.72rem',
        fontWeight: 500,
      }}
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
  /** صف مضغوط بلا زوايا دائرية ولاصف — أقصى كثافة في الشاشة */
  variant?: 'card' | 'flat';
  /** آخر صف في المجموعة المسطحة — بدون خط سفلي */
  isLast?: boolean;
};

/**
 * بطاقة سجل — حواف ناعمة، شريط لون، حركة دخول خفيفة (يُعطّل مع reduced-motion)
 * أو وضع flat: جدولي بلا فواصل عمودية كبيرة
 */
export function ProfileSessionRecordListItem({
  accent,
  children,
  index = 0,
  variant = 'card',
  isLast = false,
}: ProfileSessionRecordListItemProps) {
  const reduce = useReducedMotion();

  if (variant === 'flat') {
    return (
      <Box
        component={motion.div}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : Math.min(index * 0.02, 0.12), duration: 0.2 }}
        sx={{
          borderBottom: isLast ? 'none' : '1px solid',
          borderColor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(47, 62, 52, 0.08)',
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.015)' : '#fff',
          borderInlineStart: `4px solid ${accent}`,
          boxShadow: 'none',
          borderRadius: 0,
          transition: 'background-color 0.2s ease',
          '&:hover': {
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(47, 62, 52, 0.02)',
          }
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index * 0.04, 0.24), duration: 0.35, ease: easeSmooth }}
    >
      <Box sx={{ mb: 1.5 }}>
        <EtlalaAccentSurface
          accent={accent}
          sx={{
            borderRadius: 4,
            borderInlineStartWidth: 0,
            border: '1px solid',
            borderColor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(47, 62, 52, 0.05)',
            background: (t) => t.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(24,30,26,0.8) 0%, rgba(15,20,17,0.95) 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f9faf8 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 12px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
                : '0 12px 32px -8px rgba(47,62,52,0.08), inset 0 1px 0 rgba(255,255,255,1)',
            overflow: 'hidden',
          }}
        >
          {children}
        </EtlalaAccentSurface>
      </Box>
    </Box>
  );
}

export function ProfileSessionRecordCardContent({
  children,
  comfortable,
  flat,
}: {
  children: ReactNode;
  /** مسافات أوضح للقراءة في قوائم طويلة */
  comfortable?: boolean;
  /** صف جدولي مضغوط */
  flat?: boolean;
}) {
  return (
    <CardContent
      sx={
        flat
          ? { p: 1, py: 0.85, px: 1.15, '&:last-child': { pb: 0.85 } }
          : comfortable
            ? { p: { xs: 2.5, sm: 2.75 }, pt: { xs: 2.35, sm: 2.5 }, '&:last-child': { pb: { xs: 2.5, sm: 2.75 } } }
            : profileSessionRowCardContentSx
      }
    >
      {children}
    </CardContent>
  );
}
