import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  IconButton,
  Stack,
} from '@mui/material';
import {
  People,
  Receipt,
  Payment,
  Brightness4,
  Brightness7,
  Logout,
  ChevronLeft,
  TrendingUp,
  AccountBalanceWallet,
  Settings,
  LocationOn,
  Phone,
  ManageAccounts,
} from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { COMPANY_INFO } from '../constants/companyInfo';
import { Logo } from '../components/Logo';
import { formatCurrency } from '../utils/formatters';
import { useMemo, useEffect, useState } from 'react';

export const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { payments, clients, expenses } = useDataStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [profitRecalcTrigger, setProfitRecalcTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setProfitRecalcTrigger((prev) => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profitPercentageUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profitPercentageUpdated', handleStorageChange);
    };
  }, []);

  const stats = useMemo(() => {
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const clientsCount = clients.length;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const totalProfit = clients.reduce((total, client) => {
      const clientPercentage = client.profitPercentage;
      if (!clientPercentage || isNaN(clientPercentage) || clientPercentage <= 0) {
        return total;
      }
      const clientPayments = payments.filter((pay) => pay.clientId === client.id);
      const clientTotalPayments = clientPayments.reduce((sum, pay) => sum + pay.amount, 0);
      const clientProfit = (clientTotalPayments * clientPercentage) / 100;
      return total + clientProfit;
    }, 0);

    return { totalPaid, clientsCount, profit: totalProfit, totalExpenses };
  }, [payments, clients, expenses, profitRecalcTrigger]);

  const menuItems = [
    {
      title: 'العملاء',
      subtitle: `${stats.clientsCount} عميل`,
      icon: People,
      path: '/clients',
      color: '#4a5d4a',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(74, 93, 74, 0.12)' : 'rgba(74, 93, 74, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(74, 93, 74, 0.2)' : 'rgba(74, 93, 74, 0.12)',
    },
    {
      title: 'الفواتير',
      subtitle: 'إدارة الفواتير',
      icon: Receipt,
      path: '/invoices',
      color: '#5a8fc4',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.12)' : 'rgba(90, 143, 196, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.2)' : 'rgba(90, 143, 196, 0.12)',
    },
    {
      title: 'المدفوعات',
      subtitle: 'سجل التحصيلات',
      icon: Payment,
      path: '/payments',
      color: '#0d9668',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(13, 150, 104, 0.12)' : 'rgba(13, 150, 104, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 150, 104, 0.2)' : 'rgba(13, 150, 104, 0.12)',
    },
    {
      title: 'الديون',
      subtitle: 'إدارة الديون',
      icon: AccountBalanceWallet,
      path: '/debts',
      color: '#c9a54e',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.12)' : 'rgba(201, 165, 78, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.2)' : 'rgba(201, 165, 78, 0.12)',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #1a1f1a 0%, #151a15 100%)'
          : 'linear-gradient(180deg, #f5f3ef 0%, #ede9e3 100%)',
        pb: 4,
      }}
    >
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(160deg, #1a1f1a 0%, #2f3e2f 50%, #3a4a3a 100%)',
          pt: 6,
          pb: 10,
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 48px 48px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderBottom: '1px solid rgba(200, 192, 176, 0.15)', // Subtle gold rim
          // Decorative patterns
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%', left: '-20%',
            width: '140%', height: '140%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)',
            border: '1px solid rgba(255,255,255,0.02)',
            borderRadius: '50%',
            pointerEvents: 'none',
          },
          '&::after': {
            // Elegant gold accent glow at bottom center
            content: '""',
            position: 'absolute',
            bottom: -50, left: '20%', right: '20%',
            height: '100px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(200, 192, 176, 0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top Navigation Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 50, height: 50,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#e8edf5',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 700,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>مرحباً بك</Typography>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}>
                  {user?.displayName || 'المستخدم'}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[
                { icon: <Brightness4 fontSize="small" />, action: toggleTheme },
                { icon: <Logout fontSize="small" />, action: handleLogout }
              ].map((item, idx) => (
                <IconButton
                  key={idx}
                  onClick={item.action}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: '#ffffff' }
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Center Logo - BEIGE & ENLARGED */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 1,
              position: 'relative',
              '& img': {
                filter: 'brightness(0) saturate(100%) invert(83%) sepia(18%) saturate(350%) hue-rotate(349deg) brightness(89%) contrast(88%) !important', // Magic Beige Filter
                transition: 'all 0.5s ease',
                dropShadow: '0 10px 20px rgba(0,0,0,0.3)'
              }
            }}
          >
            <Logo size={280} showSubtitle={false} />
          </Box>

          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ color: '#e8edf5', bgcolor: 'rgba(255,255,255,0.05)', px: 2.5, py: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
               <LocationOn sx={{ fontSize: 20, color: '#c8c0b0' }} />
               <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
                 شارع الجرابه، طرابلس، ليبيا
               </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)', direction: 'ltr' }}>
               <Phone sx={{ fontSize: 18 }} />
               <Typography variant="caption" sx={{ fontWeight: 500, fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem' }}>
                 {COMPANY_INFO.phone}
               </Typography>
            </Stack>
          </Box>

          {/* Profit Summary Card - Professional Design */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 100% 0%, rgba(212, 197, 163, 0.15) 0%, transparent 50%)',
                pointerEvents: 'none'
              }}
            />
            <CardContent sx={{ py: 2.5, px: 3, position: 'relative' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                    صافي الأرباح
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {formatCurrency(stats.profit)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4c5a3 0%, #a3967a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(212, 197, 163, 0.3)',
                    color: '#2a3a2a'
                  }}
                >
                  <TrendingUp sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: -2 }}>
        {/* Quick Stats */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3, mt: 3 }}>
          {[
            { label: 'المحصل', value: formatCurrency(stats.totalPaid), color: '#0d9668' },
            { label: 'المصروفات', value: formatCurrency(stats.totalExpenses), color: '#d64545' },
          ].map((stat, i) => (
            <Card
              key={i}
              sx={{
                flex: 1,
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 2px 12px -2px rgba(74, 93, 74, 0.06)' 
                  : '0 2px 12px -2px rgba(0,0,0,0.3)',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
                <Typography variant="body1" fontWeight={800} sx={{ color: stat.color, mt: 0.3 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Menu Section */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 0.5, letterSpacing: 0.3 }}>
          القوائم الرئيسية
        </Typography>

        <Stack spacing={1.5}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'light'
                  ? '0 2px 12px -2px rgba(74, 93, 74, 0.06)'
                  : '0 2px 12px -2px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${item.borderColor}`,
                bgcolor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'light'
                    ? '0 8px 24px -4px rgba(74, 93, 74, 0.1)'
                    : '0 8px 24px -4px rgba(0,0,0,0.4)',
                },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 48, height: 48,
                        borderRadius: 2.5,
                        bgcolor: item.bgColor,
                        border: `1px solid ${item.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <item.icon sx={{ fontSize: 24, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronLeft sx={{ color: 'text.secondary', opacity: 0.5, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* System Section */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 0.5, mt: 4, letterSpacing: 0.3 }}>
          النظام
        </Typography>

        <Card
          onClick={() => navigate('/expenses')}
          sx={{
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'light'
              ? '0 2px 12px -2px rgba(74, 93, 74, 0.06)'
              : '0 2px 12px -2px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(107, 127, 107, 0.12)'
              : '1px solid rgba(74, 93, 74, 0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'light'
                ? '0 8px 24px -4px rgba(74, 93, 74, 0.1)'
                : '0 8px 24px -4px rgba(0,0,0,0.4)',
            },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: 2.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(107, 127, 107, 0.12)' : 'rgba(74, 93, 74, 0.06)',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(107, 127, 107, 0.2)' : '1px solid rgba(74, 93, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Settings sx={{ fontSize: 24, color: theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a' }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                    المصروفات العامة
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    تتبع مصروفات الشركة
                  </Typography>
                </Box>
              </Box>
              <ChevronLeft sx={{ color: 'text.secondary', opacity: 0.5, fontSize: 20 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate('/users')}
          sx={{
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'light'
              ? '0 2px 12px -2px rgba(74, 93, 74, 0.06)'
              : '0 2px 12px -2px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            mt: 1.5,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(107, 127, 107, 0.12)'
              : '1px solid rgba(74, 93, 74, 0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'light'
                ? '0 8px 24px -4px rgba(74, 93, 74, 0.1)'
                : '0 8px 24px -4px rgba(0,0,0,0.4)',
            },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: 2.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(107, 127, 107, 0.12)' : 'rgba(74, 93, 74, 0.06)',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(107, 127, 107, 0.2)' : '1px solid rgba(74, 93, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ManageAccounts sx={{ fontSize: 24, color: theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a' }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                    المستخدمين
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    إدارة مستخدمي النظام
                  </Typography>
                </Box>
              </Box>
              <ChevronLeft sx={{ color: 'text.secondary', opacity: 0.5, fontSize: 20 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
            إطلالة للاستشارات الهندسية © 2024 | طرابلس ليبيا
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
