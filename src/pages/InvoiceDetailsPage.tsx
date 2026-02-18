import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Stack, Typography, IconButton,
  Chip, Menu, MenuItem,  CircularProgress,
} from '@mui/material';
import {
  ArrowBack, Print, MoreVert, CheckCircle, Cancel, Email,
} from '@mui/icons-material';
import { useDataStore } from '../store/useDataStore';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { getStatusLabel } from '../utils/formatters';

export const InvoiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, clients, updateInvoice } = useDataStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const invoice = invoices.find(inv => inv.id === id);
  const client = clients.find(c => c.id === invoice?.clientId);

  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    window.print();
  };

  if (!invoice || !client) {
    return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  }

  const handleStatusChange = async (status: string) => {
    await updateInvoice(invoice.id, { status: status as any });
    setAnchorEl(null);
  };

  return (
    <Box sx={{
      pb: 4, minHeight: '100vh', bgcolor: '#f5f3ef',
      '@media print': { bgcolor: 'white', pb: 0, minHeight: 'auto' },
    }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)',
          pt: 2, pb: 3, px: 2, color: 'white',
          '@media print': { display: 'none' },
        }}
      >
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <IconButton onClick={() => navigate('/invoices')} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                فاتورة #{invoice.invoiceNumber}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getStatusLabel(invoice.status)}
                  color={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'error' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: 1.5, height: 22, fontSize: '0.65rem' }}
                />
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              size="small" startIcon={<Print />} onClick={handlePrint}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600, flex: 1 }}
            >
              طباعة
            </Button>
            <Button
              size="small" endIcon={<MoreVert />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600, flex: 1 }}
            >
              إجراءات
            </Button>
          </Stack>

          <Menu
            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 160 } }}
          >
            <MenuItem onClick={() => handleStatusChange('paid')} disabled={invoice.status === 'paid'}>
              <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} /> تم الدفع
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('sent')} disabled={invoice.status === 'sent'}>
              <Email fontSize="small" color="info" sx={{ mr: 1 }} /> تم الإرسال
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('cancelled')} disabled={invoice.status === 'cancelled'}>
              <Cancel fontSize="small" color="error" sx={{ mr: 1 }} /> إلغاء
            </MenuItem>
          </Menu>
        </Container>
      </Box>

      {/* Printable Invoice */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          mt: 2, px: { xs: 0.5, sm: 2 },
          '@media print': { maxWidth: 'none', mt: 0, px: 0 },
        }}
      >
        <Box
          sx={{
            boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.08)' },
            borderRadius: { xs: 0, sm: 1 },
            overflow: 'hidden',
          }}
        >
          <PrintableInvoice ref={componentRef} invoice={invoice} client={client} />
        </Box>
      </Container>
    </Box>
  );
};
