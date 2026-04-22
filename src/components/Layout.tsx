import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import { useAppLockStore } from '../store/useAppLockStore';
import {
  Home,
  People,
  Receipt,
  Payment,
  AccountBalance,
} from '@mui/icons-material';

const navItems = [
  { label: 'الرئيسية', icon: <Home />, path: '/', module: null },
  { label: 'العملاء', icon: <People />, path: '/clients', module: 'clients' },
  { label: 'الفواتير', icon: <Receipt />, path: '/invoices', module: 'invoices' },
  { label: 'المدفوعات', icon: <Payment />, path: '/payments', module: 'payments' },
  { label: 'العهدات', icon: <AccountBalance />, path: '/fund', module: 'balances' },
];

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { canAccess } = useAppLockStore();

  const visibleNavItems = navItems.filter(item => {
    if (!item.module) return true;
    return canAccess(item.module as any);
  });

  const currentIndex = visibleNavItems.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  });

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        pb: 'calc(72px + env(safe-area-inset-bottom))',
        position: 'relative',
        '@media print': { pb: 0 },
      }}
    >
      <Box
        className={isDark ? 'etlala-app-ambient etlala-app-ambient--dark' : 'etlala-app-ambient'}
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </Box>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, newValue) => navigate(visibleNavItems[newValue].path)}
        showLabels
      >
        {visibleNavItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};