import { useState, FormEvent } from 'react';
import {
  Box, Button, CircularProgress, IconButton, InputAdornment,
  Stack, TextField, Typography, useTheme, alpha,
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COMPANY_INFO } from '../constants/companyInfo';
import { premiumTokens } from '../theme/tokens';

/** شعار القوس الذهبي — قصاصة مضغوطة من الشعار الأصلي عالي الدقة */
const LOGO_SRC = '/logo-arch-gold.jpg';

export const LoginPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('فشل تسجيل الدخول. تأكد من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  /** حقل iOS نظيف: تعبئة هادئة بلا إطار، وحلقة تركيز بلون العلامة */
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      height: 54,
      fontSize: '0.95rem',
      fontWeight: 600,
      bgcolor: isDark ? alpha('#fff', 0.05) : '#F4F4F2',
      transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
      '& fieldset': { border: 'none' },
      '&.Mui-focused': {
        bgcolor: isDark ? alpha('#fff', 0.07) : '#FFFFFF',
        boxShadow: `0 0 0 2px ${alpha(premiumTokens.primary, isDark ? 0.55 : 0.32)}`,
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'text.disabled',
      opacity: 1,
      fontWeight: 500,
    },
  } as const;

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'background.default',
        pt: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        px: 3,
        overflowX: 'hidden',
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        sx={{
          width: '100%',
          maxWidth: 400,
          my: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ─── العلامة ─── */}
        <Stack alignItems="center" sx={{ mb: 4.5 }}>
          <Box
            sx={{
              width: 108,
              height: 108,
              borderRadius: '30px',
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              border: `1px solid ${isDark ? alpha('#C8B27D', 0.25) : 'rgba(31, 37, 33, 0.06)'}`,
              boxShadow: isDark
                ? '0 16px 40px rgba(0,0,0,0.5)'
                : '0 1px 2px rgba(25, 34, 29, 0.04), 0 16px 40px rgba(25, 34, 29, 0.1)',
              display: 'grid',
              placeItems: 'center',
              mb: 2.25,
            }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt="شعار إطلالة"
              sx={{ width: '78%', height: '78%', objectFit: 'contain', display: 'block' }}
              draggable={false}
            />
          </Box>
          <Typography
            sx={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            إطلالة
          </Typography>
          <Typography
            sx={{
              fontSize: '0.62rem',
              color: 'text.secondary',
              letterSpacing: '0.28em',
              fontWeight: 600,
              textTransform: 'uppercase',
              mt: 0.75,
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            Architectural &amp; Engineering
          </Typography>
        </Stack>

        {/* ─── بطاقة الدخول ─── */}
        <Box
          sx={{
            borderRadius: '24px',
            bgcolor: 'background.paper',
            border: `1px solid ${isDark ? alpha('#fff', 0.07) : 'rgba(31, 37, 33, 0.06)'}`,
            boxShadow: isDark
              ? '0 18px 50px rgba(0,0,0,0.45)'
              : '0 1px 2px rgba(25, 34, 29, 0.03), 0 12px 36px rgba(25, 34, 29, 0.07)',
            p: { xs: 3, sm: 3.5 },
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.3 }}>
            تسجيل الدخول
          </Typography>
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.82rem', fontWeight: 500, mt: 0.5, mb: 2.75 }}
          >
            أدخل بياناتك للمتابعة إلى لوحة التحكم
          </Typography>

          {error && (
            <Box
              role="alert"
              sx={{
                mb: 2,
                px: 1.75,
                py: 1.25,
                borderRadius: '14px',
                bgcolor: alpha('#d64545', isDark ? 0.16 : 0.08),
                border: `1px solid ${alpha('#d64545', 0.22)}`,
              }}
            >
              <Typography sx={{ color: isDark ? '#fca5a5' : '#b83b3b', fontWeight: 700, fontSize: '0.8rem' }}>
                {error}
              </Typography>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.75}>
              <TextField
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                type="email"
                required
                autoComplete="email"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <Mail size={18} strokeWidth={2} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <Lock size={18} strokeWidth={2} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        edge="end"
                        sx={{ color: 'text.disabled', width: 40, height: 40 }}
                      >
                        {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 0.75,
                  height: 54,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  backgroundColor: premiumTokens.primary,
                  boxShadow: `0 10px 24px ${alpha(premiumTokens.primary, 0.28)}`,
                  '&:hover': {
                    backgroundColor: premiumTokens.primaryDark,
                    boxShadow: `0 12px 28px ${alpha(premiumTokens.primary, 0.34)}`,
                  },
                  '&:disabled': { opacity: 0.6, color: '#fff' },
                }}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <CircularProgress size={18} thickness={5} sx={{ color: '#fff' }} />
                    <span>جاري التحقق...</span>
                  </Stack>
                ) : (
                  'دخول'
                )}
              </Button>
            </Stack>
          </form>
        </Box>

        {/* ─── تذييل ─── */}
        <Typography
          sx={{
            mt: 3,
            textAlign: 'center',
            color: 'text.disabled',
            fontSize: '0.68rem',
            fontWeight: 500,
          }}
        >
          {COMPANY_INFO.fullName} © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};
