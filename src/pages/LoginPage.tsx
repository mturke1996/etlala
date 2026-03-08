import { useState, FormEvent } from 'react';
import {
  Box, Button, Container, IconButton, InputAdornment,
  Stack, TextField, Typography, useTheme, Alert, Fade,
  useMediaQuery, alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Email, Lock } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COMPANY_INFO } from '../constants/companyInfo';

export const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    } catch (err: any) {
      console.error(err);
      setError('فشل تسجيل الدخول. تأكد من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `
            linear-gradient(180deg, rgba(26,42,26,0.4) 0%, rgba(15,26,15,0.97) 65%),
            url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', zIndex: 10, 
          flexGrow: 1, display: 'flex', flexDirection: 'column',
          justifyContent: isMobile ? 'flex-end' : 'center',
          px: { xs: 0, sm: 3 }, pb: { xs: 0, sm: 4 },
          height: '100vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          {/* Brand Section */}
          <Box sx={{ mb: { xs: 5, md: 7 }, textAlign: 'center', pt: { xs: 0, md: 0 } }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.8rem', sm: '3.5rem' },
                  fontWeight: 900,
                  color: '#c8c0b0',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                إطلالة
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: alpha('#c8c0b0', 0.45),
                  letterSpacing: '0.3em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontFamily: "'Outfit', sans-serif",
                  mt: 0.5,
                }}
              >
                ARCHITECTURE & ENGINEERING
              </Typography>
              <Box sx={{ width: 40, height: 1.5, bgcolor: alpha('#c8c0b0', 0.25), mx: 'auto', mt: 2 }} />
            </motion.div>
          </Box>

          {/* Login Form */}
          <Box
            sx={{
              borderRadius: { xs: '28px 28px 0 0', sm: '24px' },
              bgcolor: alpha('#1a2a1a', 0.65),
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: { xs: 'none', sm: '1px solid rgba(255,255,255,0.06)' },
              p: { xs: 3.5, sm: 4.5 },
            }}
          >
            <Typography
              sx={{
                color: alpha('#fff', 0.85),
                fontWeight: 700,
                fontSize: '1.1rem',
                mb: 3,
              }}
            >
              تسجيل الدخول
            </Typography>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" variant="filled"
                  sx={{ mb: 2.5, borderRadius: 3, bgcolor: alpha('#d64545', 0.12), color: '#fca5a5', border: '1px solid rgba(214,69,69,0.2)', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني" type="email" required size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white', bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 48,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&.Mui-focused fieldset': { borderColor: '#4a5d4a' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)' },
                  }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: alpha('#fff', 0.3), fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField
                  fullWidth value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  type={showPassword ? 'text' : 'password'} required size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white', bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 48,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&.Mui-focused fieldset': { borderColor: '#4a5d4a' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)' },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: alpha('#fff', 0.3), fontSize: 18 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: alpha('#fff', 0.3) }}>
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  endIcon={!loading && <LoginIcon sx={{ mr: 1, fontSize: 18 }} />}
                  sx={{
                    py: 1.5, borderRadius: 3, fontSize: '0.95rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, #4a5d4a 0%, #364036 100%)',
                    boxShadow: '0 6px 20px rgba(74,93,74,0.35)',
                    '&:hover': { boxShadow: '0 8px 28px rgba(74,93,74,0.5)' },
                    transition: 'all 0.3s ease',
                    mt: 1,
                  }}
                >
                  {loading ? 'جاري التحقق...' : 'دخول'}
                </Button>
              </Stack>
            </form>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 2, mb: { xs: 2, sm: 0 }, textAlign: 'center' }}>
            <Typography sx={{ color: alpha('#fff', 0.25), fontSize: '0.65rem' }}>
              {COMPANY_INFO.fullName} © {new Date().getFullYear()}
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};
