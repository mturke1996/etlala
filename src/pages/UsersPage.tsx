import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Stack, IconButton, Button,
  TextField, InputAdornment, useTheme, MenuItem, alpha,
  Dialog, Chip,
} from '@mui/material';
import {
  ArrowBack, Add, Search, Delete, Person, Email, Lock,
  AdminPanelSettings, Close, PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { db } from '../config/firebase';
import { firebaseConfig } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const UsersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setSubmitting(true);
    let secondaryApp: any = null;
    try {
      secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      await updateProfile(userCred.user, { displayName: formData.name });
      await signOut(secondaryAuth);

      await addDoc(collection(db, 'users'), {
        uid: userCred.user.uid,
        displayName: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString()
      });

      toast.success('تم إضافة المستخدم بنجاح');
      setDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'editor' });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('البريد الإلكتروني مسجل بالفعل');
      } else {
        toast.error('حدث خطأ أثناء إضافة المستخدم');
      }
    } finally {
      if (secondaryApp) { try { await deleteApp(secondaryApp); } catch(e) {} }
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        toast.success('تم حذف المستخدم');
      } catch { toast.error('حدث خطأ'); }
    }
  };

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f3ef', pb: 8 }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)', pt: 2, pb: 3, px: 2, color: 'white' }}>
        <Container maxWidth="sm">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <ArrowBack />
              </IconButton>
              <Typography fontWeight={800} sx={{ fontSize: '1.2rem' }}>المستخدمين</Typography>
            </Stack>
            <Button
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: 'rgba(200,192,176,0.9)', color: '#2a3a2a',
                fontWeight: 700, borderRadius: 2, px: 2, fontSize: '0.8rem',
                '&:hover': { bgcolor: '#c8c0b0' },
              }}
            >
              إضافة
            </Button>
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={1} mb={2}>
            <Box sx={{ flex: 1, p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>الإجمالي</Typography>
              <Typography fontWeight={800} color="white" sx={{ fontSize: '1rem' }}>{users.length}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>مسؤولين</Typography>
              <Typography fontWeight={800} color="white" sx={{ fontSize: '1rem' }}>
                {users.filter(u => u.role === 'admin').length}
              </Typography>
            </Box>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth size="small" placeholder="بحث بالاسم أو البريد..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.92)', borderRadius: 2.5,
                height: 40, fontSize: '0.85rem',
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#4a5d4a', fontSize: 20 }} /></InputAdornment> }}
          />
        </Container>
      </Box>

      {/* Users List */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Stack spacing={1}>
          {filteredUsers.map((user) => (
            <Box
              key={user.id}
              sx={{
                bgcolor: 'white', borderRadius: 2.5, p: 2,
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2,
                      bgcolor: user.role === 'admin' ? alpha('#4a5d4a', 0.1) : alpha('#c8c0b0', 0.2),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Typography fontWeight={800} sx={{ 
                      color: user.role === 'admin' ? '#4a5d4a' : '#8b7e6a',
                      fontSize: '0.9rem',
                    }}>
                      {user.displayName?.[0] || 'U'}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <Typography fontWeight={700} sx={{ fontSize: '0.88rem' }} noWrap>{user.displayName}</Typography>
                      <Chip
                        label={user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                        size="small"
                        sx={{
                          height: 18, fontSize: '0.55rem', fontWeight: 700,
                          bgcolor: user.role === 'admin' ? alpha('#4a5d4a', 0.1) : alpha('#c8c0b0', 0.2),
                          color: user.role === 'admin' ? '#4a5d4a' : '#8b7e6a',
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                    <Typography sx={{ color: '#999', fontSize: '0.7rem', mt: 0.2 }} dir="ltr" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUser(user.id)}
                  sx={{
                    color: '#d64545', width: 32, height: 32, borderRadius: 2,
                    '&:hover': { bgcolor: alpha('#d64545', 0.08) },
                  }}
                >
                  <Delete sx={{ fontSize: 17 }} />
                </IconButton>
              </Stack>
            </Box>
          ))}
          {!loading && filteredUsers.length === 0 && (
            <Box textAlign="center" py={8}>
              <PersonAdd sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>لا يوجد مستخدمين</Typography>
              <Typography color="text.disabled" sx={{ fontSize: '0.75rem', mt: 0.5 }}>اضغط "إضافة" لإنشاء مستخدم جديد</Typography>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Add User Dialog */}
      <Dialog
        open={dialogOpen} onClose={() => setDialogOpen(false)}
        fullScreen PaperProps={{ sx: { bgcolor: '#f5f3ef' } }}
      >
        <Box sx={{ background: 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)', pt: 2, pb: 3, px: 2, color: 'white' }}>
          <Container maxWidth="sm">
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <Close />
              </IconButton>
              <Typography fontWeight={800} sx={{ fontSize: '1.2rem' }}>مستخدم جديد</Typography>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="sm" sx={{ mt: 3 }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 2 }}>
            <Typography fontWeight={700} sx={{ fontSize: '0.85rem', color: '#364036', mb: 2.5 }}>معلومات المستخدم</Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth size="small" label="الاسم الكامل"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#bbb', fontSize: 18 }} /></InputAdornment> }}
              />
              <TextField
                fullWidth size="small" label="البريد الإلكتروني" type="email"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#bbb', fontSize: 18 }} /></InputAdornment> }}
              />
              <TextField
                fullWidth size="small" label="كلمة المرور" type="password"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#bbb', fontSize: 18 }} /></InputAdornment> }}
              />
            </Stack>
          </Box>

          <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, mb: 3 }}>
            <Typography fontWeight={700} sx={{ fontSize: '0.85rem', color: '#364036', mb: 2 }}>الصلاحية</Typography>
            <Stack direction="row" spacing={1}>
              {[
                { value: 'editor', label: 'مستخدم عادي', icon: <Person sx={{ fontSize: 18 }} /> },
                { value: 'admin', label: 'مسؤول نظام', icon: <AdminPanelSettings sx={{ fontSize: 18 }} /> },
              ].map((role) => (
                <Box
                  key={role.value}
                  onClick={() => setFormData({...formData, role: role.value})}
                  sx={{
                    flex: 1, p: 2, borderRadius: 2.5, cursor: 'pointer',
                    textAlign: 'center',
                    border: formData.role === role.value ? '2px solid #4a5d4a' : '1px solid #eee',
                    bgcolor: formData.role === role.value ? alpha('#4a5d4a', 0.04) : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ color: formData.role === role.value ? '#4a5d4a' : '#bbb', mb: 0.5 }}>{role.icon}</Box>
                  <Typography fontWeight={formData.role === role.value ? 700 : 500} sx={{
                    fontSize: '0.8rem',
                    color: formData.role === role.value ? '#364036' : '#888',
                  }}>
                    {role.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button
            variant="contained" fullWidth size="large"
            onClick={handleCreateUser} disabled={submitting}
            sx={{
              py: 1.5, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem',
              bgcolor: '#4a5d4a', '&:hover': { bgcolor: '#364036' },
              boxShadow: '0 4px 14px rgba(74,93,74,0.4)',
            }}
          >
            {submitting ? 'جاري الإضافة...' : 'إضافة المستخدم'}
          </Button>
        </Container>
      </Dialog>
    </Box>
  );
};
