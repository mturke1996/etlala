import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import {
  Home,
  People,
  Receipt,
  Payment,
  AccountBalanceWallet,
} from '@mui/icons-material';

const navItems = [
  { label: 'الرئيسية', icon: <Home />, path: '/' },
  { label: 'العملاء', icon: <People />, path: '/clients' },
  { label: 'الفواتير', icon: <Receipt />, path: '/invoices' },
  { label: 'المدفوعات', icon: <Payment />, path: '/payments' },
  { label: 'الديون', icon: <AccountBalanceWallet />, path: '/debts' },
];

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const currentIndex = navItems.findIndex((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  });

  return (
    <Box sx={{ minHeight: '100vh', pb: '72px', '@media print': { pb: 0 } }}>
      <Outlet />

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 68,
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(26, 31, 26, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: theme.palette.mode === 'dark'
            ? '1px solid rgba(107, 127, 107, 0.15)'
            : '1px solid rgba(74, 93, 74, 0.08)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 -4px 24px rgba(0, 0, 0, 0.3)'
            : '0 -4px 24px rgba(74, 93, 74, 0.08)',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 1,
            px: 0.5,
            color: theme.palette.mode === 'dark'
              ? 'rgba(200, 192, 176, 0.45)'
              : 'rgba(74, 93, 74, 0.4)',
            transition: 'all 0.25s ease',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              fontWeight: 600,
              mt: 0.3,
              transition: 'all 0.25s ease',
              '&.Mui-selected': {
                fontSize: '0.68rem',
                fontWeight: 800,
              },
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22,
              transition: 'all 0.25s ease',
            },
            '&.Mui-selected': {
              color: '#4a5d4a',
              '& .MuiSvgIcon-root': {
                fontSize: 24,
                filter: 'drop-shadow(0 2px 4px rgba(74, 93, 74, 0.3))',
              },
            },
          },
        }}
      >
        {navItems.map((item, index) => (
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
