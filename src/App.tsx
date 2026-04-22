import { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { createAppTheme } from './theme';
import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';
import { AppLockGuard } from './components/AppLockGuard';
import { useAppLockStore } from './store/useAppLockStore';

// ─── Direct imports (no lazy loading = instant transitions) ──
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { InvoicesPage } from './pages/InvoicesPage';
import { NewInvoicePage } from './pages/NewInvoicePage';
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { DebtsPage } from './pages/DebtsPage';
import { UsersPage } from './pages/UsersPage';
import { FundPage } from './pages/FundPage';
import { LettersPage } from './pages/LettersPage';

// ─── QueryClient with optimized defaults ────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes before refetch
      gcTime: 10 * 60 * 1000,         // 10 minutes garbage collection
      refetchOnWindowFocus: false,     // Avoid unnecessary refetches
      retry: 1,                        // Single retry on failure
    },
  },
});

function AppContent() {
  const { mode } = useThemeStore();
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { initialize } = useDataStore();
  
  // ─── Memoize theme to avoid recreation on every render ────
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribeData = initialize();
      const unsubscribeAppLock = useAppLockStore.getState().initAppLockSync();
      return () => {
        unsubscribeData();
        unsubscribeAppLock();
      };
    }
  }, [isAuthenticated, initialize]);

  // ─── Memoize toast options to avoid recreation ────────────
  const toastOptions = useMemo(() => ({
    duration: 3000,
    style: {
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      fontWeight: 700,
      fontSize: '0.9rem',
      borderRadius: '14px',
      padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      direction: 'rtl' as const,
      maxWidth: '380px',
    },
    success: {
      iconTheme: { primary: '#0d9668', secondary: '#fff' },
      style: {
        background: mode === 'dark' ? '#1e251e' : '#fff',
        color: mode === 'dark' ? '#e8e5df' : '#2d3a2d',
        border: '1px solid rgba(13,150,104,0.25)',
      },
    },
    error: {
      iconTheme: { primary: '#d64545', secondary: '#fff' },
      style: {
        background: mode === 'dark' ? '#1e251e' : '#fff',
        color: mode === 'dark' ? '#e8e5df' : '#2d3a2d',
        border: '1px solid rgba(214,69,69,0.25)',
      },
    },
  }), [mode]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-center" toastOptions={toastOptions} />
      
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          
          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/clients" element={<AppLockGuard module="clients" requireScreen><ClientsPage /></AppLockGuard>} />
            <Route path="/clients/:id" element={<AppLockGuard module="clients" requireScreen><ClientProfilePage /></AppLockGuard>} />
            
            <Route path="/invoices" element={<AppLockGuard module="invoices" requireScreen><InvoicesPage /></AppLockGuard>} />
            <Route path="/invoices/new" element={<AppLockGuard module="invoices" requireScreen><NewInvoicePage /></AppLockGuard>} />
            <Route path="/invoices/:id" element={<AppLockGuard module="invoices" requireScreen><InvoiceDetailsPage /></AppLockGuard>} />
            
            <Route path="/expenses" element={<AppLockGuard module="expenses" requireScreen><ExpensesPage /></AppLockGuard>} />
            <Route path="/payments" element={<AppLockGuard module="payments" requireScreen><PaymentsPage /></AppLockGuard>} />
            <Route path="/debts" element={<AppLockGuard module="debts" requireScreen><DebtsPage /></AppLockGuard>} />
            <Route path="/users" element={<AppLockGuard module="users" requireScreen><UsersPage /></AppLockGuard>} />
            <Route path="/fund" element={<AppLockGuard module="balances" requireScreen><FundPage /></AppLockGuard>} />
            <Route path="/letters" element={<AppLockGuard module="letters" requireScreen><LettersPage /></AppLockGuard>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
