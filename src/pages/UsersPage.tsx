import { useState, useEffect, forwardRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Button,
  TextField, InputAdornment, useTheme, Avatar,
  Dialog, Slide, Fade, Grid as MuiGrid, alpha
} from '@mui/material';
import {
  BadgeCheck,
  KeyRound,
  Mail,
  Lock as LockIcon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { firebaseConfig } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { PageScaffold } from '../components/layout/PageScaffold';
import { etlalaHeroActionButtonSx } from '../components/etlala/EtlalaMobileUi';
import { TransitionProps } from '@mui/material/transitions';

const Grid = MuiGrid as any;

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const UsersPage = () => {
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
      toast.success('تم إرسال رابط التغيير إلى إيميله بنجاح');
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
    <>
    <PageScaffold
      title="الموظفون"
      subtitle="إدارة الحسابات والصلاحيات"
      backTo="/"
      rightAction={(
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} strokeWidth={2.2} />}
          onClick={() => {
            setEditingUserId(null);
            setFormData({ name: '', email: '', password: '', newPassword: '', role: 'editor' });
            setDialogOpen(true);
          }}
          sx={etlalaHeroActionButtonSx}
        >
          موظف جديد
        </Button>
      )}
      headerExtra={(
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ 
              px: 1.75, py: 1.5, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: 1.5 
            }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '13px', bgcolor: 'rgba(200,192,176,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <UsersIcon size={18} color="#c8c0b0" strokeWidth={2} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>إجمالي الحسابات</Typography>
                <Typography sx={{ fontSize: '1.05rem', color: 'white', fontWeight: 900, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{users.length}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ 
              px: 1.75, py: 1.5, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: 1.5 
            }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '13px', bgcolor: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} color="#fff" strokeWidth={2} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>المدراء</Typography>
                <Typography sx={{ fontSize: '1.05rem', color: 'white', fontWeight: 900, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{users.filter((u) => u.role === 'admin').length}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    >
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            placeholder="البحث السريع بالاسم أو الإيميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={19} color="#8b7e6a" strokeWidth={2} /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white', height: 52, borderRadius: '16px', fontSize: '0.95rem', fontWeight: 600,
                boxShadow: '0 4px 18px rgba(42,58,42,0.05)', border: '1px solid', borderColor: 'rgba(42,58,42,0.05)',
                '& fieldset': { border: 'none' },
                '&:focus-within': { boxShadow: '0 6px 24px rgba(42,58,42,0.1)' },
              }
            }}
          />
        </Box>

        <Stack spacing={1.25} sx={{ mb: 6 }}>
          {filteredUsers.map((user) => (
            <Box
              key={user.id}
              sx={{
                px: 2, py: 1.75, borderRadius: '22px', bgcolor: 'white',
                border: '1px solid', borderColor: 'rgba(31, 37, 33, 0.05)',
                boxShadow: '0 1px 2px rgba(31, 37, 33, 0.03), 0 6px 22px rgba(31, 37, 33, 0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 46, height: 46, borderRadius: '16px', 
                    bgcolor: user.role === 'admin' ? alpha('#2a3a2a', 0.08) : alpha('#8b7e6a', 0.08), 
                    color: user.role === 'admin' ? '#2a3a2a' : '#8b7e6a', 
                    fontWeight: 900, fontSize: '1.1rem' 
                  }}
                >
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75} mb={0.3}>
                    <Typography fontWeight={800} noWrap sx={{ fontSize: '0.95rem', color: '#1f291f' }}>
                      {user.displayName}
                    </Typography>
                    {user.role === 'admin' && (
                      <BadgeCheck size={15} color="#4a5d4a" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                    )}
                  </Stack>
                  <Typography noWrap sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b7e6a' }} dir="ltr">
                    {user.email}
                  </Typography>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                <IconButton 
                  onClick={() => handleEditClick(user)} 
                  aria-label="تعديل"
                  sx={{ 
                    width: 40, height: 40, borderRadius: '50%', bgcolor: '#f4f6f4', color: '#4a5d4a',
                    '&:hover': { bgcolor: '#e8ece8' } 
                  }}
                >
                  <Pencil size={16} strokeWidth={2} />
                </IconButton>
                <IconButton 
                  onClick={() => handleDeleteUser(user.id)} 
                  aria-label="حذف"
                  sx={{ 
                    width: 40, height: 40, borderRadius: '50%', bgcolor: '#fcf0f0', color: '#d64545',
                    '&:hover': { bgcolor: '#fae4e4' } 
                  }}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </IconButton>
              </Stack>
            </Box>
          ))}

          {!loading && filteredUsers.length === 0 && (
            <Fade in={true}>
              <Box textAlign="center" py={8} sx={{ bgcolor: 'white', borderRadius: '24px', border: '1px dashed rgba(31, 37, 33, 0.12)', mt: 2 }}>
                <UserPlus size={52} color={theme.palette.text.disabled} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: 16 }} />
                <Typography variant="h6" fontWeight={800} color="text.secondary" mb={1}>لا يوجد موظفين</Typography>
                <Typography variant="body2" color="text.disabled" fontWeight={500}>جرب البحث باسم آخر أو أضف موظف جديد</Typography>
              </Box>
            </Fade>
          )}
        </Stack>
    </PageScaffold>

      {/* ── Add / Edit Sheet ── */}
      <Dialog
        open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)}
        TransitionComponent={Transition} keepMounted fullWidth maxWidth="xs"
        PaperProps={{ 
          sx: { 
            borderRadius: { xs: '28px 28px 0 0', sm: '28px' }, m: { xs: 0, sm: 2 }, 
            position: { xs: 'fixed', sm: 'relative' }, bottom: { xs: 0, sm: 'auto' }, width: '100%',
            maxHeight: { xs: '92dvh', sm: 'calc(100dvh - 64px)' },
            boxShadow: '0 -12px 48px rgba(0,0,0,0.14)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          } 
        }}
      >
        {/* مقبض السحب */}
        <Box aria-hidden sx={{ display: { xs: 'block', sm: 'none' }, width: 40, height: 5, borderRadius: '999px', mx: 'auto', mt: 1, mb: 0, flexShrink: 0, bgcolor: 'rgba(31, 37, 33, 0.14)' }} />

        <Box sx={{ p: { xs: 2.75, sm: 3.5 }, pt: { xs: 1.75, sm: 3 }, pb: { xs: 'calc(env(safe-area-inset-bottom) + 24px)', sm: 3.5 }, position: 'relative' }}>
          
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={900} mb={0.25} color="#1f291f">
                {editingUserId ? 'تحديث السجلات' : 'إضافة موظف'}
              </Typography>
              <Typography variant="body2" color="#8b7e6a" fontWeight={600}>
                {editingUserId ? 'تعديل الصلاحيات أو البيانات الأساسية' : 'إنشاء حساب جديد لمنح الوصول'}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setDialogOpen(false)} 
              aria-label="إغلاق"
              sx={{ bgcolor: '#f4f6f4', color: '#1f291f', width: 38, height: 38, flexShrink: 0, '&:hover': { bgcolor: '#e8ece8' } }}
            >
              <X size={16} strokeWidth={2.2} />
            </IconButton>
          </Box>

          <Stack spacing={2.25}>
            {/* Input Groups */}
            <Box>
              <Typography fontWeight={800} fontSize="0.8rem" color="#4a5d4a" mb={1}>الاسم الكامل</Typography>
              <TextField
                fullWidth variant="outlined" placeholder="محمد أحمد..."
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} color="#8b7e6a" strokeWidth={2} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#f4f6f4', '& fieldset': { border: 'none' }, '&:focus-within': { bgcolor: 'white', boxShadow: '0 0 0 2px rgba(74,93,74,0.45)' } } }}
              />
            </Box>

            <Box>
              <Typography fontWeight={800} fontSize="0.8rem" color="#4a5d4a" mb={1}>البريد الإلكتروني</Typography>
              <TextField
                fullWidth type="email" variant="outlined" placeholder="email@example.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!!editingUserId}
                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#8b7e6a" strokeWidth={2} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#f4f6f4', '& fieldset': { border: 'none' }, '&.Mui-disabled': { opacity: 0.6 } } }}
              />
            </Box>

            {!editingUserId ? (
              <Box>
                <Typography fontWeight={800} fontSize="0.8rem" color="#4a5d4a" mb={1}>كلمة المرور الأولية</Typography>
                <TextField
                  fullWidth type="password" variant="outlined" placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon size={18} color="#8b7e6a" strokeWidth={2} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#f4f6f4', '& fieldset': { border: 'none' } } }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 2, borderRadius: '18px', bgcolor: '#f8f9f8', border: '1px solid rgba(31, 37, 33, 0.05)' }}>
                <Typography variant="body2" fontWeight={800} color="#1f291f" mb={1.5} display="flex" alignItems="center" gap={1}>
                  <KeyRound size={16} color="#4a5d4a" strokeWidth={2} /> إعادة تعيين كلمة المرور
                </Typography>
                <TextField
                  fullWidth placeholder="كلمة مرور جديدة (اختياري)" type="password" size="small"
                  value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'white' } }}
                />
                <Button 
                  fullWidth onClick={handleResetPasswordEmail} startIcon={<Mail size={16} strokeWidth={2} />}
                  sx={{ borderRadius: '14px', py: 1, fontWeight: 700, color: '#4a5d4a', bgcolor: 'rgba(74,93,74,0.08)' }}
                >
                  إرسال رابط استعادة للإيميل
                </Button>
              </Box>
            )}

            <Box>
              <Typography fontWeight={800} fontSize="0.8rem" color="#4a5d4a" mb={1}>الصلاحية</Typography>
              <Stack direction="row" spacing={1.25}>
                {[
                  { value: 'editor', label: 'موظف عادي', icon: <UserIcon size={22} strokeWidth={2} /> },
                  { value: 'admin', label: 'مدير نظام', icon: <ShieldCheck size={22} strokeWidth={2} /> },
                ].map((role) => (
                  <Box
                    key={role.value} onClick={() => setFormData({...formData, role: role.value})}
                    sx={{
                      flex: 1, py: 1.75, px: 1.5, borderRadius: '18px', cursor: 'pointer', textAlign: 'center',
                      border: formData.role === role.value ? '2px solid #2a3a2a' : '2px solid transparent',
                      bgcolor: formData.role === role.value ? alpha('#2a3a2a', 0.05) : '#f4f6f4',
                      WebkitTapHighlightColor: 'transparent',
                      '&:active': { transform: 'scale(0.97)' }
                    }}
                  >
                    <Box sx={{ color: formData.role === role.value ? '#2a3a2a' : '#8b7e6a', mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                      {role.icon}
                    </Box>
                    <Typography fontWeight={800} sx={{ fontSize: '0.8rem', color: formData.role === role.value ? '#1f291f' : '#8b7e6a' }}>
                      {role.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Button
              variant="contained" fullWidth onClick={handleCreateUser} disabled={submitting}
              sx={{
                py: 1.75, mt: 1.5, borderRadius: '18px', fontWeight: 900, fontSize: '1rem',
                bgcolor: '#2a3a2a', color: 'white', '&:hover': { bgcolor: '#151a15' },
                boxShadow: '0 8px 24px rgba(42,58,42,0.25)',
                '&:disabled': { opacity: 0.55 },
              }}
            >
              {submitting ? 'جاري المعالجة...' : (editingUserId ? 'حفظ التحديثات' : 'إضافة الموظف المعتمد')}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
};
