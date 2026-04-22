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
  LinearProgress,
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
  Lock,
  LockOpen,
  Description,
  WarningAmber,
  ErrorOutline,
} from '@mui/icons-material';
import { AppLockSettingsDialog } from '../components/AppLockSettingsDialog';
import { useAppLockStore } from '../store/useAppLockStore';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { COMPANY_INFO } from '../constants/companyInfo';
import { HeroLogo } from '../components/HeroLogo';
import { formatCurrency } from '../utils/formatters';
import { useMemo, useEffect, useState } from 'react';
import { useGlobalFundStore } from '../store/useGlobalFundStore';
import dayjs from 'dayjs';
import { motion, useReducedMotion } from 'framer-motion';
import { EtlalaNavRow } from '../components/etlala/EtlalaMobileUi';

export const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { payments, clients, expenses } = useDataStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const { isLocked, isSessionUnlocked, canAccess, unlockedUsers } = useAppLockStore();
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);
  const [profitRecalcTrigger, setProfitRecalcTrigger] = useState(0);
  const { transactions, getCurrentBalance, getUserStats, initialize: initFund } = useGlobalFundStore();

  // Init global fund store
  useEffect(() => {
    const unsub = initFund();
    return unsub;
  }, []);

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

  // Fund data
  const fundBalance = getCurrentBalance();
  const myFundStats = useMemo(() => {
    if (!user?.id) return null;
    const uid = user.id;
    const userName = user.displayName || '';

    // === نفس خوارزمية FundPage بالضبط ===
    const deposits = [...transactions.filter(t =>
      t.type === 'deposit' && (
        t.userId === uid || (userName && t.userName === userName)
      )
    )].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));

    if (deposits.length === 0) return null;

    // بناء العهدات
    const custodies = deposits.map(tx => ({
      createdAt: tx.createdAt,
      amount: tx.amount,
      remaining: tx.amount,
      spent: 0,
    }));

    // توزيع المصروفات على العهدات (نفس منطق FundPage)
    const allExp = [...expenses.filter(e =>
      e.userId === uid || (userName && e.createdBy === userName)
    )].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));

    allExp.forEach(exp => {
      let rem = exp.amount;
      const expTime = dayjs(exp.createdAt);

      for (let i = 0; i < custodies.length; i++) {
        const c = custodies[i];
        if (rem <= 0) break;
        if (expTime.isBefore(dayjs(c.createdAt))) continue;

        if (c.remaining <= 0) {
          const hasNext = custodies.slice(i + 1).some(nc => !expTime.isBefore(dayjs(nc.createdAt)));
          if (hasNext) continue;
        }

        const take = Math.min(rem, Math.max(c.remaining, 0));
        if (take > 0) {
          c.spent += take;
          c.remaining -= take;
          rem -= take;
        }

        // إذا بقي مبلغ ولم نجد عهدة تالية، ضعه كسالب على آخر عهدة
        if (rem > 0) {
          const hasNext = custodies.slice(i + 1).some(nc => !expTime.isBefore(dayjs(nc.createdAt)));
          if (!hasNext) {
            c.spent += rem;
            c.remaining -= rem;
            rem = 0;
          }
        }
      }
    });

    // ترحيل الرصيد السالب بين العهدات (نفس منطق FundPage)
    for (let i = 0; i < custodies.length - 1; i++) {
      const current = custodies[i];
      const next = custodies[i + 1];
      if (current.remaining < 0) {
        const deficit = Math.abs(current.remaining);
        next.remaining -= deficit;
        next.spent += deficit;
        current.remaining = 0;
      }
    }

    const totalDeposited = custodies.reduce((s, c) => s + c.amount, 0);
    const totalSpent = custodies.reduce((s, c) => s + c.spent, 0);
    const totalRemaining = custodies.reduce((s, c) => s + c.remaining, 0);

    return { deposited: totalDeposited, spent: totalSpent, remaining: totalRemaining, count: deposits.length };
  }, [transactions, expenses, user]);
  const fundIsLow = fundBalance < 100 && transactions.length > 0;
  const fundIsEmpty = fundBalance <= 0 && transactions.length > 0;

  const menuItems = [
    {
      title: 'العملاء',
      subtitle: `${stats.clientsCount} عميل`,
      icon: People,
      path: '/clients',
      color: '#4a5d4a',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(74, 93, 74, 0.12)' : 'rgba(74, 93, 74, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(74, 93, 74, 0.2)' : 'rgba(74, 93, 74, 0.12)',
      module: 'clients',
    },
    {
      title: 'الفواتير',
      subtitle: 'إدارة الفواتير',
      icon: Receipt,
      path: '/invoices',
      color: '#5a8fc4',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.12)' : 'rgba(90, 143, 196, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.2)' : 'rgba(90, 143, 196, 0.12)',
      module: 'invoices',
    },
    {
      title: 'المدفوعات',
      subtitle: 'سجل التحصيلات',
      icon: Payment,
      path: '/payments',
      color: '#0d9668',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(13, 150, 104, 0.12)' : 'rgba(13, 150, 104, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 150, 104, 0.2)' : 'rgba(13, 150, 104, 0.12)',
      module: 'payments',
    },
    {
      title: 'الديون',
      subtitle: 'إدارة الديون',
      icon: AccountBalanceWallet,
      path: '/debts',
      color: '#c9a54e',
      bgColor: theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.12)' : 'rgba(201, 165, 78, 0.08)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.2)' : 'rgba(201, 165, 78, 0.12)',
      module: 'debts',
    },
  ].filter(item => canAccess(item.module as any));

  // Fund menu item (separate since it navigates to /fund)
  const showFund = canAccess('balances');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      className="etlala-page"
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        pb: 4,
      }}
    >
      {/* Hero — v2: هندسة أوضح + شبكة نقاط فوق الداكن */}
      <Box
        className="etlala-home-hero--mesh"
        sx={{
          background: 'linear-gradient(152deg, #0c1210 0%, #14221a 28%, #1b2e24 55%, #1a2620 100%)',
          pt: 'calc(env(safe-area-inset-top) + 32px)',
          pb: { xs: 4, sm: 5 },
          px: 2.5,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: '0 0 28px 28px', sm: '0 0 32px 32px' },
          boxShadow: '0 20px 56px -24px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,192,176,0.06), inset 0 -1px 0 rgba(200,192,176,0.1)',
          borderBottom: '1px solid rgba(200, 192, 176, 0.22)',
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
            zIndex: 0,
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
            zIndex: 0,
          },
        }}
      >
        <Box className="etlala-dot-overlay" sx={{ zIndex: 0 }} aria-hidden />
        <Box
          className="etlala-hero-sheen"
          sx={{ zIndex: 0, borderRadius: 'inherit', pointerEvents: 'none' }}
          aria-hidden
        />
        <Box
          className="etlala-hero-orb"
          sx={{
            zIndex: 0,
            top: '-8%',
            right: '-8%',
            width: 140,
            height: 140,
            bgcolor: 'rgba(200, 192, 176, 0.1)',
            animationDelay: '0s',
          }}
          aria-hidden
        />
        <Box
          className="etlala-hero-orb"
          sx={{
            zIndex: 0,
            bottom: '2%',
            left: '-6%',
            width: 160,
            height: 160,
            bgcolor: 'rgba(74, 93, 74, 0.16)',
            animation: 'etlala-blob-float 16s var(--ease-smooth) infinite',
            animationDelay: '-3s',
          }}
          aria-hidden
        />
        <Box
          className="etlala-hero-orb"
          sx={{
            zIndex: 0,
            top: '36%',
            left: '6%',
            width: 72,
            height: 72,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            animationDuration: '12s',
            animationDelay: '-1.5s',
          }}
          aria-hidden
        />
        <Box
          className="etlala-hero-arc"
          sx={{
            position: 'absolute',
            bottom: '-14%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '110%', sm: '85%' },
            maxWidth: 400,
            height: 120,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            border: '1px solid rgba(200, 192, 176, 0.06)',
            borderBottom: 'none',
            zIndex: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(200, 192, 176, 0.03) 0%, transparent 72%)',
          }}
          aria-hidden
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top Navigation Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 44, height: 44,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: 0.2 }}>مرحباً</Typography>
                <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.25, fontSize: '1rem' }}>
                  {user?.displayName || 'المستخدم'}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[
                { icon: <Brightness4 fontSize="small" />, action: toggleTheme },
                { icon: isLocked && !isSessionUnlocked() ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />, action: () => setLockSettingsOpen(true) },
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

          <Box sx={{ mb: 1 }}>
            <HeroLogo size={124} compact />
          </Box>

          <Typography
            variant="subtitle2"
            component="p"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.72)',
              fontWeight: 500,
              letterSpacing: 0.15,
              maxWidth: 300,
              mx: 'auto',
              lineHeight: 1.55,
              mb: 1.25,
              px: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.82rem' },
            }}
          >
            لوحة تحكم موحّدة للعملاء والفواتير والمدفوعات.
          </Typography>
          <Box
            className="etlala-hero-creative-line"
            sx={{ width: 56, height: 2, mx: 'auto', borderRadius: 2, mb: 2, opacity: 0.85 }}
            aria-hidden
          />

          <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ color: 'rgba(255,255,255,0.88)', bgcolor: 'rgba(255,255,255,0.05)', px: 2, py: 0.75, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.07)' }}>
               <LocationOn sx={{ fontSize: 17, color: 'rgba(200,192,176,0.9)', flexShrink: 0 }} />
               <Typography variant="caption" fontWeight={600} sx={{ letterSpacing: 0.2, fontSize: '0.75rem', lineHeight: 1.4 }}>
                 شارع الجرابه، طرابلس، ليبيا
               </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.55)', direction: 'ltr' }}>
               <Phone sx={{ fontSize: 15, opacity: 0.85 }} />
               <Typography variant="caption" sx={{ fontWeight: 500, fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem' }}>
                 {COMPANY_INFO.phone}
               </Typography>
            </Stack>
          </Box>

          {/* ─── بطاقة الأرباح (admin فقط) ─── */}
          {canAccess('stats') && (
            <Box
              component={motion.div}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3, boxShadow: '0 20px 50px -12px rgba(0,0,0,0.35)' }}
              style={{ borderRadius: 12, marginBottom: myFundStats ? 12 : 0 }}
            >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              overflow: 'hidden', position: 'relative',
              transition: 'transform 0.2s',
              mb: 0,
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 100% 0%, rgba(212,197,163,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <CardContent sx={{ py: 2.5, px: 3, position: 'relative' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>صافي الأرباح</Typography>
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{formatCurrency(stats.profit)}</Typography>
                  </Box>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #d4c5a3 0%, #a3967a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(212,197,163,0.3)', color: '#2a3a2a' }}>
                    <TrendingUp sx={{ fontSize: 28 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            </Box>
          )}

          {/* ─── بطاقة رصيد العهدة الشخصية (Stripe/Revolut Premium) ─── */}
          {myFundStats && (() => {
            const isNeg = myFundStats.remaining < 0;
            const pct = myFundStats.deposited > 0 ? Math.max(0, Math.min(100, (myFundStats.remaining / myFundStats.deposited) * 100)) : 0;
            return (
            <Box
              component={motion.div}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.06 }}
              whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              onClick={() => navigate('/fund')}
              sx={{
                cursor: 'pointer',
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${isNeg ? 'rgba(225,29,72,0.35)' : 'rgba(255,255,255,0.18)'}`,
                boxShadow: isNeg
                  ? '0 12px 40px rgba(225,29,72,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 12px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {/* Main Balance Display */}
              <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    {isNeg && <ErrorOutline sx={{ fontSize: 14, color: '#fca5a5' }} />}
                    <Typography sx={{
                      color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: 1.2,
                      fontWeight: 600, textTransform: 'uppercase',
                    }}>
                      {isNeg ? 'عجز رصيد العهدة' : 'رصيد عهدتي المتاح'}
                    </Typography>
                  </Stack>
                  <Typography sx={{
                    color: isNeg ? '#f87171' : '#fff',
                    fontSize: '2.2rem', fontWeight: 900, lineHeight: 1,
                    fontFamily: "'Outfit', sans-serif",
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}>
                    {isNeg ? `-${formatCurrency(Math.abs(myFundStats.remaining))}` : formatCurrency(myFundStats.remaining)}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: isNeg
                    ? 'linear-gradient(135deg, rgba(248,113,113,0.25) 0%, rgba(225,29,72,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
                  border: `1px solid ${isNeg ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <AccountBalanceWallet sx={{ fontSize: 28, color: isNeg ? '#f87171' : '#ffffff' }} />
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ px: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', fontWeight: 600 }}>
                    {isNeg ? 'تجاوز 100%' : `${Math.round(pct)}% متبقي`}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', fontWeight: 600 }}>
                    من {formatCurrency(myFundStats.deposited)}
                  </Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', borderRadius: 3,
                    width: isNeg ? '100%' : `${pct}%`,
                    background: isNeg
                      ? 'linear-gradient(90deg, #be123c, #e11d48)'
                      : pct > 40
                        ? 'linear-gradient(90deg, #34d399, #10b981)'
                        : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    transition: 'width 0.6s cubic-bezier(0.85, 0, 0.15, 1)',
                  }} />
                </Box>
              </Box>

              {/* 4-Column Stats Grid — Same as FundPage */}
              <Box sx={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(0,0,0,0.08)',
              }}>
                {[
                  { label: 'عدد العهدات', value: String(myFundStats.count), color: '#fff' },
                  { label: 'إجمالي العهدات', value: formatCurrency(myFundStats.deposited), color: '#fff' },
                  { label: 'المصروفات', value: formatCurrency(myFundStats.spent), color: '#fca5a5' },
                  { label: 'المتبقي', value: isNeg ? `-${formatCurrency(Math.abs(myFundStats.remaining))}` : formatCurrency(myFundStats.remaining), color: isNeg ? '#f87171' : '#6ee7b7' },
                ].map((s, i) => (
                  <Box key={i} sx={{
                    py: 1.5, textAlign: 'center',
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}>
                    <Typography sx={{ color: s.color, fontSize: '0.8rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.55rem', fontWeight: 600, mt: 0.4 }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Deficit Warning Strip */}
              {isNeg && (
                <Box sx={{
                  background: 'linear-gradient(90deg, rgba(225,29,72,0.2) 0%, rgba(225,29,72,0.1) 100%)',
                  borderTop: '1px solid rgba(225,29,72,0.3)',
                  px: 3, py: 1.2,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                  <WarningAmber sx={{ fontSize: 22, color: '#fca5a5', flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.78rem', lineHeight: 1.2 }}>
                      رصيد العهدة بالسالب!
                    </Typography>
                    <Typography sx={{ color: 'rgba(252,165,165,0.7)', fontSize: '0.62rem', fontWeight: 600 }}>
                      سيتم خصم العجز من عهدتك القادمة
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            );
          })()}
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: canAccess('stats') ? -2 : 4, position: 'relative', zIndex: 1 }}>
        {/* Quick Stats */}
        {canAccess('stats') && (
          <Stack direction="row" spacing={1.25} sx={{ mb: 2.5, mt: 3 }}>
          {[
            { label: 'المحصل', value: formatCurrency(stats.totalPaid), color: '#0d9668' },
            { label: 'المصروفات', value: formatCurrency(stats.totalExpenses), color: '#d64545' },
          ].map((stat, i) => (
            <Box
              key={i}
              component={motion.div}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.07, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
              sx={{
                flex: 1,
                p: 1.75,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
                boxShadow: theme.palette.mode === 'light' ? '0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem', letterSpacing: 0.3 }}>
                {stat.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={800}
                sx={{ color: stat.color, mt: 0.4, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}
              >
                {stat.value}
              </Typography>
            </Box>
          ))}
          </Stack>
        )}

        {/* Menu Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 0.5 }}>
          <Box
            sx={{
              width: 3,
              height: 22,
              borderRadius: 1.5,
              background: (t) =>
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #8aab8c, #3d4d3d)'
                  : 'linear-gradient(180deg, #3d4f3d, #6b7f6b)',
            }}
            aria-hidden
          />
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.2, color: 'text.primary' }}>
            القوائم الرئيسية
          </Typography>
        </Box>

        <Stack spacing={1.1}>
          {menuItems.map((item, index) => (
            <Box
              key={index}
              component={motion.div}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              sx={{ width: 1, '@media (prefers-reduced-motion: reduce)': { y: 0 } }}
            >
              <EtlalaNavRow
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                accent={item.color}
                onClick={() => navigate(item.path)}
                end={<ChevronLeft sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 22 }} />}
              />
            </Box>
          ))}
        </Stack>

        {/* System Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 0.5, mt: 4 }}>
          <Box
            sx={{
              width: 3,
              height: 22,
              borderRadius: 1.5,
              background: (t) =>
                t.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, rgba(200,192,176,0.5), #3d4d3d)'
                  : 'linear-gradient(180deg, #5c6b5c, #c8c0b0)',
            }}
            aria-hidden
          />
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.2, color: 'text.primary' }}>
            النظام
          </Typography>
        </Box>

        {canAccess('expenses') && (
          <Box
            component={motion.div}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            sx={{ mt: 1.25 }}
          >
            <EtlalaNavRow
              title="المصروفات العامة"
              subtitle="تتبع مصروفات الشركة"
              icon={Settings}
              accent={theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a'}
              onClick={() => navigate('/expenses')}
              end={<ChevronLeft sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 22 }} />}
            />
          </Box>
        )}

        {/* Letters Card */}
        {canAccess('letters') && (
          <Box
            component={motion.div}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            sx={{ mt: 1.1 }}
          >
            <EtlalaNavRow
              title="الرسائل الرسمية"
              subtitle="خطابات، عروض أسعار، استحقاقات"
              icon={Description}
              accent="#5a8fc4"
              onClick={() => navigate('/letters')}
              end={<ChevronLeft sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 22 }} />}
            />
          </Box>
        )}

        {/* Fund Card */}
        {showFund && (
          <Box
            component={motion.div}
            onClick={() => navigate('/fund')}
            role="button"
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
            whileTap={reduceMotion ? undefined : { scale: 0.992 }}
            sx={{
              mt: 1.1,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderInlineStart: '3px solid',
              borderInlineStartColor: fundIsEmpty ? '#d64545' : fundIsLow ? '#f59e0b' : '#0d9668',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.92)',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'background 0.2s ease',
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(61,79,61,0.04)' },
            }}
          >
            {(fundIsLow || fundIsEmpty) && (
              <Box sx={{ height: 2.5, background: fundIsEmpty ? 'linear-gradient(90deg, #d64545, #f87171)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            )}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: fundIsEmpty ? 'rgba(214,69,69,0.1)' : fundIsLow ? 'rgba(245,158,11,0.1)' : 'rgba(13,150,104,0.1)', border: `1px solid ${fundIsEmpty ? 'rgba(214,69,69,0.22)' : fundIsLow ? 'rgba(245,158,11,0.22)' : 'rgba(13,150,104,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AccountBalanceWallet sx={{ fontSize: 22, color: fundIsEmpty ? '#d64545' : fundIsLow ? '#f59e0b' : '#0d9668' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={800}>الصندوق المشترك</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {fundIsEmpty ? (
                        <><ErrorOutline sx={{ fontSize: 15, color: 'error.main' }} /><Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>الصندوق فارغ</Box></>
                      ) : fundIsLow ? (
                        <><WarningAmber sx={{ fontSize: 15, color: 'warning.main' }} /><Box component="span" sx={{ color: 'warning.main', fontWeight: 700 }}>رصيد منخفض</Box></>
                      ) : (
                        'إدارة العهد والرصيد'
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography fontWeight={900} sx={{ color: fundIsEmpty ? '#d64545' : fundIsLow ? '#f59e0b' : '#0d9668', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
                    {formatCurrency(fundBalance)}
                  </Typography>
                  <ChevronLeft sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 20, display: 'block', mr: 'auto' }} />
                </Box>
              </Box>
              {myFundStats && myFundStats.deposited > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>رصيدي الشخصي</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: myFundStats.remaining > 0 ? '#0d9668' : '#d64545', fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(myFundStats.remaining)}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, (myFundStats.remaining / myFundStats.deposited) * 100))}
                    sx={{ height: 4, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { background: myFundStats.remaining > myFundStats.deposited * 0.3 ? 'linear-gradient(90deg, #0d9668, #34d399)' : myFundStats.remaining > 0 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #d64545, #f87171)', borderRadius: 2 } }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {canAccess('users') && (
          <Box
            component={motion.div}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            sx={{ mt: 1.1 }}
          >
            <EtlalaNavRow
              title="المستخدمين"
              subtitle="إدارة مستخدمي النظام"
              icon={ManageAccounts}
              accent={theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a'}
              onClick={() => navigate('/users')}
              end={<ChevronLeft sx={{ color: 'text.secondary', opacity: 0.4, fontSize: 22 }} />}
            />
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
            إطلالة للاستشارات الهندسية © 2024 | طرابلس ليبيا
          </Typography>
        </Box>
      </Container>
      
      <AppLockSettingsDialog open={lockSettingsOpen} onClose={() => setLockSettingsOpen(false)} />
    </Box>
  );
};
