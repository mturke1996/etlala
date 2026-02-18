import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { createAppTheme } from './theme';
import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen'; // Import new component

// Pages
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

const queryClient = new QueryClient();

function AppContent() {
  const { mode } = useThemeStore();
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { initialize } = useDataStore();
  
  const theme = createAppTheme(mode);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = initialize();
      return () => unsubscribe();
    }
  }, [isAuthenticated, initialize]);

  if (authLoading) {
    return <LoadingScreen />; // Use Custom Screen
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          
          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientProfilePage />} />
            
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
            
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/users" element={<UsersPage />} />
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
