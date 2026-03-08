import { useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
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

// ─── Lazy-loaded Pages (code-splitting) ─────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage').then(m => ({ default: m.ClientProfilePage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const NewInvoicePage = lazy(() => import('./pages/NewInvoicePage').then(m => ({ default: m.NewInvoicePage })));
const InvoiceDetailsPage = lazy(() => import('./pages/InvoiceDetailsPage').then(m => ({ default: m.InvoiceDetailsPage })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const DebtsPage = lazy(() => import('./pages/DebtsPage').then(m => ({ default: m.DebtsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const FundPage = lazy(() => import('./pages/FundPage').then(m => ({ default: m.FundPage })));
const LettersPage = lazy(() => import('./pages/LettersPage').then(m => ({ default: m.LettersPage })));

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
      
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
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
              <Route path="/letters" element={<LettersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
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
