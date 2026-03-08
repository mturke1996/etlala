import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Stack, IconButton, Button,
  TextField, InputAdornment, useTheme, Chip, Avatar,
  Dialog, Slide, Fade, Grid, Paper, alpha
} from '@mui/material';
import {
  ArrowBack, Add, Search, Delete, Person, Email, Lock, Edit,
  AdminPanelSettings, Close, PersonAdd, VpnKey, SupervisedUserCircle, VerifiedUser
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { firebaseConfig } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { forwardRef } from 'react';
import { TransitionProps } from '@mui/material/transitions';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const UsersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', newPassword: '', role: 'editor' });
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
    if (!formData.name || (!editingUserId && (!formData.email || !formData.password))) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSubmitting(true);

    if (editingUserId) {
      if (formData.newPassword && formData.newPassword.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        setSubmitting(false);
        return;
      }
      try {
        const currentUserData = users.find(u => u.id === editingUserId);
        const oldName = currentUserData?.displayName;
        const newName = formData.name;

        await updateDoc(doc(db, 'users', editingUserId), {
          displayName: newName,
          role: formData.role,
        });

        // Update all related balances and expenses if name changed
        if (oldName && oldName !== newName) {
          const batch = writeBatch(db);
          
          const ubQ = query(collection(db, 'userBalances'), where('userName', '==', oldName));
          const ubSnaps = await getDocs(ubQ);
          ubSnaps.forEach(docSnap => batch.update(docSnap.ref, { userName: newName }));

          const expQ = query(collection(db, 'expenses'), where('createdBy', '==', oldName));
          const expSnaps = await getDocs(expQ);
          expSnaps.forEach(docSnap => batch.update(docSnap.ref, { createdBy: newName }));

          await batch.commit();
        }

        // Try to update password if requested and it's the current user
        if (formData.newPassword) {
          if (auth.currentUser && auth.currentUser.email === formData.email) {
            const { updatePassword } = await import('firebase/auth');
            await updatePassword(auth.currentUser, formData.newPassword);
            toast.success('تم تحديث بياناتك وكلمة مرورك وارتباطاتك المالية بنجاح');
          } else {
            toast.error('لم يتم تغيير كلمة المرور: أنظمة الحماية (Firebase) تمنع تغيير رمز حساب شخص آخر مباشرة. أرسل له رابط التعيين.');
          }
        } else {
          toast.success('تم تحديث بيانات المستخدم وارتباطاته المالية بنجاح !');
        }
        
        setDialogOpen(false);
        setEditingUserId(null);
        setFormData({ name: '', email: '', password: '', newPassword: '', role: 'editor' });
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          toast.error('لتغيير كلمة مرورك، يرجى تسجيل الخروج والدخول مجدداً لتأكيد هويتك.');
        } else {
          toast.error('حدث خطأ أثناء التحديث');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

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
      setFormData({ name: '', email: '', password: '', newPassword: '', role: 'editor' });
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
    if (window.confirm('ملاحظة هامة جداً: الحذف من هنا سيحذف المستخدم، وسيتم مسح كافة سجلات الأرصدة التابعة له. هل أنت متأكد؟')) {
      try {
        const currentUserData = users.find(u => u.id === id);
        const oldName = currentUserData?.displayName;
        
        const batch = writeBatch(db);
        batch.delete(doc(db, 'users', id));

        if (oldName) {
           const ubQ = query(collection(db, 'userBalances'), where('userName', '==', oldName));
           const ubSnaps = await getDocs(ubQ);
           ubSnaps.forEach(docSnap => batch.delete(docSnap.ref));

           const expQ = query(collection(db, 'expenses'), where('createdBy', '==', oldName));
           const expSnaps = await getDocs(expQ);
           expSnaps.forEach(docSnap => batch.delete(docSnap.ref));
        }

        await batch.commit();
        toast.success('تم حذف المستخدم وكافة أرصدته ومصروفاته بنجاح');
      } catch (error: any) { 
        toast.error('حدث خطأ أثناء الحذف: ' + error.message); 
      }
    }
  };

  const handleResetPasswordEmail = async () => {
    if (!formData.email) return;
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success('تم إرسال رابط التغيير إلى إيميله بنجاح! 📧');
    } catch (error: any) {
      toast.error('حدث خطأ أثناء إرسال الرابط.');
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.displayName || '',
      email: user.email || '',
      password: '',
      newPassword: '',
      role: user.role || 'editor'
    });
    setDialogOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Header aligned with Brand Colors */}
      <Box
        sx={{
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #2a3a2a 0%, #364036 100%)'
            : 'linear-gradient(135deg, #1a221a 0%, #2a3a2a 100%)',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 6, sm: 8 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 80% 0%, rgba(200,192,176,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={900} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>إدارة الموظفين</Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Add sx={{ ml: 1, mr: 0.5 }} />}
              onClick={() => {
                setEditingUserId(null);
                setFormData({ name: '', email: '', password: '', newPassword: '', role: 'editor' });
                setDialogOpen(true);
              }}
              sx={{
                bgcolor: 'rgba(200,192,176,0.95)',
                color: '#2a3a2a',
                fontWeight: 800,
                borderRadius: 3,
                px: { xs: 2.5, sm: 3 },
                boxShadow: '0 4px 14px -3px rgba(200,192,176,0.4)',
                '&:hover': { bgcolor: '#e0d8c8', transform: 'translateY(-2px)' },
                transition: 'all 0.25s ease',
              }}
            >
              إضافة
            </Button>
          </Stack>

          {/* Premium Glassmorphism Stats Cards */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <SupervisedUserCircle sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>إجمالي حسابات</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={900} color="white">{users.length}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <VerifiedUser sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>المدراء (Admin)</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={900} color="white">{users.filter(u => u.role === 'admin').length}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ mt: -3 }}>
        {/* Search Field */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 10 }}>
          <TextField
            fullWidth
            placeholder="البحث بالاسم أو الإيميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}><Search sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4, bgcolor: 'background.paper', height: 50, fontSize: '0.95rem', fontWeight: 600,
                border: '1px solid', borderColor: 'rgba(0,0,0,0.04)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                '& fieldset': { border: 'none' }, '&:hover': { borderColor: 'rgba(0,0,0,0.1)' }, transition: 'all 0.2s ease',
              }
            }}
          />
        </Box>

        {/* Users List */}
        <Stack spacing={2}>
          {filteredUsers.map((user) => (
            <Paper
              key={user.id}
              sx={{
                p: { xs: 2.5, sm: 3 }, borderRadius: 4, 
                bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.04)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.palette.mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.6)' : '0 12px 28px rgba(0,0,0,0.08)' }
              }}
            >
              <Grid container alignItems="center" spacing={2} wrap="nowrap">
                <Grid sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                    <Avatar sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: user.role === 'admin' ? alpha('#4a5d4a', 0.1) : alpha('#8b7e6a', 0.1), color: user.role === 'admin' ? '#4a5d4a' : '#8b7e6a', border: `1px solid ${user.role === 'admin' ? alpha('#4a5d4a', 0.2) : alpha('#8b7e6a', 0.2)}`, fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 }}>
                      {user.displayName?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5} sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} sx={{ fontSize: '1rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis' }} noWrap>{user.displayName}</Typography>
                        <Chip
                          label={user.role === 'admin' ? 'مدير' : 'موظف'}
                          size="small"
                          sx={{
                            height: 20, fontSize: '0.65rem', fontWeight: 800,
                            bgcolor: user.role === 'admin' ? alpha('#4a5d4a', 0.1) : alpha('#8b7e6a', 0.1),
                            color: user.role === 'admin' ? '#4a5d4a' : '#8b7e6a',
                            borderRadius: 1.5, flexShrink: 0
                          }}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', minWidth: 0 }}>
                        <Email sx={{ fontSize: 13, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }} dir="ltr" noWrap>
                          {user.email}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>

                <Grid sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <IconButton onClick={() => handleEditClick(user)} sx={{ bgcolor: alpha('#4a5d4a', 0.05), color: '#4a5d4a', borderRadius: 2.5, width: 36, height: 36, '&:hover': { bgcolor: alpha('#4a5d4a', 0.15), transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                    <Edit sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main', borderRadius: 2.5, width: 36, height: 36, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15), transform: 'scale(1.05)', color: 'error.dark' }, transition: 'all 0.2s' }}>
                    <Delete sx={{ fontSize: 18 }} />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          {!loading && filteredUsers.length === 0 && (
            <Fade in={true}>
              <Box textAlign="center" py={10} sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed rgba(0,0,0,0.1)' }}>
                <PersonAdd sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" fontWeight={800} color="text.secondary" mb={1}>لا يوجد مستخدمين</Typography>
              </Box>
            </Fade>
          )}
        </Stack>
      </Container>

      {/* Modern Dialog for adding/Editing User */}
      <Dialog
        open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)}
        TransitionComponent={Transition} keepMounted fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: { xs: '24px 24px 0 0', sm: 4 }, m: { xs: 0, sm: 2 }, position: { xs: 'fixed', sm: 'relative' }, bottom: { xs: 0, sm: 'auto' }, width: '100%' } }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
          
          <Typography variant="h5" fontWeight={900} mb={1} color="text.primary">
            {editingUserId ? 'تحديث السجلات' : 'إضافة حساب 👤'}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600} mb={4}>
            {editingUserId ? 'قم بتعديل بيانات الحساب بشكل سريع' : 'أدخل بيانات الموظف بشكل دقيق'}
          </Typography>

          <Stack spacing={3}>
            {/* Name Field */}
            <TextField
              fullWidth label="الاسم الكامل" variant="outlined"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#4a5d4a', mr: 0.5, opacity: 0.8 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' } } }}
            />

            {/* Email Field */}
            <TextField
              fullWidth label="البريد الإلكتروني" type="email" variant="outlined"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={!!editingUserId}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8b7e6a', mr: 0.5, opacity: 0.8 }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' }, '&.Mui-disabled': { opacity: 0.7 } } }}
            />

            {/* Password Management */}
            {!editingUserId ? (
              <TextField
                fullWidth label="تعيين كلمة المرور الأولية" type="password" variant="outlined"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'error.main', mr: 0.5, opacity: 0.8 }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' } } }}
              />
            ) : (
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#4a5d4a', 0.04), border: `1px dashed ${alpha('#4a5d4a', 0.3)}` }}>
                <Typography variant="body2" fontWeight={700} color="#4a5d4a" mb={1.5} display="flex" alignItems="center" gap={1}>
                  <VpnKey fontSize="small"/> تغيير كلمة المرور
                </Typography>
                <TextField
                  fullWidth label="إدخال كلمة مرور جديدة (اختياري)" type="password" variant="outlined" size="small"
                  value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Edit sx={{ color: '#4a5d4a', mr: 0.5, opacity: 0.8, fontSize: 18 }} /></InputAdornment> }}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                />
                <Button 
                  variant="outlined" fullWidth onClick={handleResetPasswordEmail}
                  startIcon={<Email />}
                  sx={{ borderRadius: 2, py: 0.8, fontWeight: 700, color: '#4a5d4a', borderColor: alpha('#4a5d4a',0.2), borderWidth: 1, '&:hover': { borderWidth: 1, bgcolor: alpha('#4a5d4a', 0.05), borderColor: '#4a5d4a' } }}
                >
                  إرسال رابط تعيين للإيميل بدلاً من ذلك
                </Button>
              </Box>
            )}

            {/* Role Switcher */}
            <Box>
              <Typography fontWeight={800} sx={{ fontSize: '0.9rem', color: 'text.primary', mb: 1.5 }}>الصلاحية بالنظام</Typography>
              <Stack direction="row" spacing={1.5}>
                {[
                  { value: 'editor', label: 'موظف عادي', icon: <Person /> },
                  { value: 'admin', label: 'مسؤول نظام', icon: <AdminPanelSettings /> },
                ].map((role) => (
                  <Box
                    key={role.value} onClick={() => setFormData({...formData, role: role.value})}
                    sx={{
                      flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      border: formData.role === role.value ? '2px solid #4a5d4a' : '1px solid rgba(0,0,0,0.08)',
                      bgcolor: formData.role === role.value ? alpha('#4a5d4a', 0.05) : 'rgba(0,0,0,0.01)',
                      '&:hover': { bgcolor: formData.role === role.value ? alpha('#4a5d4a', 0.1) : 'rgba(0,0,0,0.03)' }
                    }}
                  >
                    <Box sx={{ color: formData.role === role.value ? '#4a5d4a' : 'text.disabled', mb: 0.5, transform: formData.role === role.value ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>
                      {role.icon}
                    </Box>
                    <Typography fontWeight={800} sx={{ fontSize: '0.8rem', color: formData.role === role.value ? '#364036' : 'text.secondary' }}>
                      {role.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Actions */}
            <Button
              variant="contained" fullWidth size="large" onClick={handleCreateUser} disabled={submitting}
              sx={{
                py: 2, borderRadius: 3, fontWeight: 900, fontSize: '1.05rem',
                bgcolor: '#4a5d4a', color: 'white', '&:hover': { bgcolor: '#364036', transform: 'translateY(-2px)' },
                boxShadow: '0 8px 24px rgba(74,93,74,0.2)', transition: 'all 0.2s ease', mt: 2
              }}
            >
              {submitting ? 'جاري الحفظ...' : (editingUserId ? 'حفظ التغييرات' : 'إنشاء الموظف')}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};
