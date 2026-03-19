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
    <Box sx={{ minHeight: '100dvh', pb: 'calc(72px + env(safe-area-inset-bottom))', '@media print': { pb: 0 } }}>
      <Outlet />

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, newValue) => navigate(visibleNavItems[newValue].path)}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          paddingBottom: 'env(safe-area-inset-bottom)',
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 'calc(68px + env(safe-area-inset-bottom))',
          bgcolor: isDark
            ? 'rgba(22, 27, 22, 0.96)'
            : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: isDark
            ? '1px solid rgba(200, 192, 176, 0.1)'
            : '1px solid rgba(74, 93, 74, 0.08)',
          boxShadow: isDark
            ? '0 -8px 32px rgba(0, 0, 0, 0.4)'
            : '0 -4px 24px rgba(74, 93, 74, 0.08)',

          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 1,
            px: 0.5,
            gap: '4px',
            color: isDark
              ? 'rgba(200, 192, 176, 0.4)'
              : 'rgba(74, 93, 74, 0.38)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px',
            mx: 0.25,
            position: 'relative',

            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.63rem',
              fontWeight: 600,
              fontFamily: "'Tajawal', 'Cairo', sans-serif !important",
              transition: 'all 0.25s ease',
              '&.Mui-selected': {
                fontSize: '0.67rem',
                fontWeight: 800,
              },
            },

            '& .MuiSvgIcon-root': {
              fontSize: 22,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },

            '&.Mui-selected': {
              color: isDark ? '#9ab89a' : '#4a5d4a',

              '& .MuiSvgIcon-root': {
                fontSize: 25,
                filter: isDark
                  ? 'drop-shadow(0 3px 6px rgba(122,154,122,0.45))'
                  : 'drop-shadow(0 3px 6px rgba(74, 93, 74, 0.35))',
                transform: 'translateY(-2px)',
              },

              '&::before': {
                content: '""',
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: isDark
                  ? 'rgba(122, 154, 122, 0.18)'
                  : 'rgba(74, 93, 74, 0.1)',
                transition: 'all 0.3s ease',
              },
            },

            '&:hover:not(.Mui-selected)': {
              color: isDark
                ? 'rgba(200, 192, 176, 0.7)'
                : 'rgba(74, 93, 74, 0.65)',
              '& .MuiSvgIcon-root': {
                transform: 'translateY(-1px) scale(1.08)',
              },
            },
          },
        }}
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