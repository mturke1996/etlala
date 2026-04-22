import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Business,
  Person,
  ChevronLeft,
  ArrowBack,
  People,
} from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SxProps, Theme } from '@mui/material/styles';
import type { Client } from '../types';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaEmptyState, EtlalaAccentSurface, etlalaContentFieldSx } from '../components/etlala/EtlalaMobileUi';

const clientSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').or(z.literal('')).optional(),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
  address: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  type: z.enum(['company', 'individual']),
});

type ClientFormData = z.infer<typeof clientSchema>;

export const ClientsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { clients, addClient, updateClient, deleteClient } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
    },
  });

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    );
  }, [clients, searchQuery]);

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone,
        address: client.address,
        type: client.type,
      });
    } else {
      setEditingClient(null);
      reset({ name: '', email: '', phone: '', address: '', type: 'individual' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
    reset();
  };

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      const newClient: Client = {
        ...data,
        name: data.name!,
        email: data.email || '',
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Client;
      addClient(newClient);
    }
    handleCloseDialog();
  };

  return (
    <>
    <PageScaffold
      title="العملاء"
      subtitle="الاسم والنوع فقط — التفاصيل والأرقام داخل ملف العميل"
      backTo="/"
      rightAction={
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          size="small"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            borderRadius: 2.5,
            px: 2.5,
            boxShadow: '0 4px 14px -3px rgba(0,0,0,0.25)',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              color: '#ffffff',
              boxShadow: '0 6px 18px -4px rgba(0,0,0,0.3)',
            },
            '& .MuiButton-startIcon': { color: '#ffffff' },
          }}
          startIcon={<Add />}
        >
          جديد
        </Button>
      }
      headerExtra={(
        <Stack spacing={1.5}>
        <TextField
          fullWidth
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={[
            etlalaContentFieldSx,
            {
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.96)',
                borderRadius: '12px',
                '& fieldset': { border: 'none' },
              },
            },
          ] as SxProps<Theme>}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(0,0,0,0.35)' }} />
              </InputAdornment>
            ),
          }}
        />
        </Stack>
      )}
    >
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          {filteredClients.length === 0 ? (
            <EtlalaEmptyState
              icon={<People />}
              title={searchQuery ? 'لا نتائج للبحث' : 'لا يوجد عملاء'}
              hint={searchQuery ? 'جرّب كلمات أوسع أو امسح البحث' : 'أضف أول عميل للبدء في تتبع المشاريع والمدفوعات'}
              actionLabel={!searchQuery ? 'إضافة عميل' : undefined}
              onAction={!searchQuery ? () => handleOpenDialog() : undefined}
            />
          ) : (
            filteredClients.map((client, index) => (
              <Box
                key={client.id}
                component={motion.div}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.35), duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
              >
                <EtlalaAccentSurface
                  accent={theme.palette.primary.main}
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.75}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: client.type === 'company'
                            ? (theme.palette.mode === 'dark' ? 'rgba(107, 127, 107, 0.18)' : 'rgba(74, 93, 74, 0.1)')
                            : (theme.palette.mode === 'dark' ? 'rgba(200, 192, 176, 0.14)' : 'rgba(200, 192, 176, 0.14)'),
                          flexShrink: 0,
                          border: '1.5px solid',
                          borderColor: client.type === 'company' ? 'rgba(107, 127, 107, 0.25)' : 'rgba(200, 192, 176, 0.3)',
                        }}
                      >
                        {client.type === 'company' ? (
                          <Business sx={{ color: theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a', fontSize: 22 }} />
                        ) : (
                          <Person sx={{ color: '#c8c0b0', fontSize: 22 }} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          fontWeight={800}
                          sx={{
                            fontSize: '1.02rem',
                            letterSpacing: 0.15,
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {client.name}
                        </Typography>
                        <Chip
                          label={client.type === 'company' ? 'شركة' : 'فرد'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            mt: 0.75,
                            bgcolor: client.type === 'company'
                              ? (theme.palette.mode === 'dark' ? 'rgba(107, 127, 107, 0.12)' : 'rgba(74, 93, 74, 0.08)')
                              : (theme.palette.mode === 'dark' ? 'rgba(200, 192, 176, 0.1)' : 'rgba(200, 192, 176, 0.1)'),
                            color: client.type === 'company'
                              ? (theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a')
                              : '#8b7e6a',
                            border: 'none',
                          }}
                        />
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(client);
                          }}
                          aria-label="تعديل"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(107, 127, 107, 0.1)' : 'rgba(74, 93, 74, 0.06)',
                            color: theme.palette.mode === 'dark' ? '#6b7f6b' : '#4a5d4a',
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            border: '1px solid rgba(74, 93, 74, 0.12)',
                            '&:hover': { bgcolor: 'rgba(74, 93, 74, 0.12)' },
                          }}
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                        <ChevronLeft sx={{ color: 'text.secondary', opacity: 0.35, fontSize: 22 }} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </EtlalaAccentSurface>
              </Box>
            ))
          )}
        </Stack>
    </PageScaffold>

      {/* Full-screen Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: theme.palette.mode === 'dark' ? '#1a1f1a' : '#f5f3ef',
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)'
                : 'linear-gradient(160deg, #2a3a2a 0%, #364036 100%)',
              color: 'white',
              p: 2,
              pt: 'calc(env(safe-area-inset-top) + 16px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at 70% 50%, rgba(200, 192, 176, 0.08) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
                {editingClient ? 'تعديل عميل' : 'إضافة عميل جديد'}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الاسم"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select {...field} label="النوع" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
                      <MenuItem value="individual">فرد</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رقم الهاتف"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="البريد الإلكتروني (اختياري)"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="العنوان"
                    multiline
                    rows={3}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
              <Button
                onClick={handleCloseDialog}
                fullWidth
                size="large"
                sx={{
                  borderRadius: 2.5, py: 1.5, fontWeight: 600,
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(107, 127, 107, 0.2)'
                    : '1px solid rgba(74, 93, 74, 0.15)',
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 2.5, py: 1.5,
                  bgcolor: '#4a5d4a',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px -3px rgba(74, 93, 74, 0.35)',
                  '&:hover': {
                    bgcolor: '#364036',
                    boxShadow: '0 8px 22px -4px rgba(74, 93, 74, 0.4)',
                  },
                }}
              >
                {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
              </Button>
            </Stack>
            
            {editingClient && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<Delete />}
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف العميل "${editingClient.name}"؟`)) {
                    deleteClient(editingClient.id);
                    handleCloseDialog();
                  }
                }}
                sx={{
                  mt: 2,
                  borderRadius: 2.5, py: 1.5, fontWeight: 700,
                  border: '1px solid rgba(211, 47, 47, 0.4)',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.04)', border: '1px solid rgba(211, 47, 47, 0.8)' },
                }}
              >
                حذف العميل
              </Button>
            )}
          </Box>
        </form>
      </Dialog>
    </>
  );
};
