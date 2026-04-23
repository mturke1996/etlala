import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  CreditCard,
  FileText,
  Lock,
  LockOpen,
  LogOut,
  MapPin,
  Phone,
  Receipt,
  Shield,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { useAppLockStore, type AppModule } from '../store/useAppLockStore';
import { AppLockSettingsDialog } from '../components/AppLockSettingsDialog';
import { HeroLogo } from '../components/HeroLogo';
import toast from 'react-hot-toast';
import { useGlobalFundStore } from '../store/useGlobalFundStore';
import { computeUserFundAllocTotals } from '../utils/custodyFundAlloc';
import { formatCurrency } from '../utils/formatters';

const COLORS = {
  primary: '#1F3D35',
  primary2: '#2C4A42',
  background: '#F5F5F3',
  accent: '#C8B27D',
  text: '#2B2B2B',
  muted: '#7A7A7A',
};

/** صورة مباني (محلية داخل /public) — مُنزَّلة من Unsplash: أبراج / واجهة حداثية */
const HERO_ARCHITECTURE_IMAGE = '/hero-architecture.jpg';

const numberFormatter = new Intl.NumberFormat('ar-LY-u-nu-latn', {
  maximumFractionDigits: 0,
});

/**
 * في بطاقة RTL: عرض المبلغ ككتلة ltr — «د.ل» يسار الأرقام (لاصقة بجانب المبلغ من ناحية الوسط/النهاية)،
 * وليست تُقرأ «قبل» الأرقام في جملة ltr.
 */
const MoneyLine = ({
  value,
  size = 'md',
}: {
  value: number;
  size?: 'md' | 'lg';
}) => {
  const raw = numberFormatter.format(Math.round(value || 0));
  const fs =
    size === 'lg' ? 'clamp(1.35rem, 6.5vw, 1.95rem)' : 'clamp(1.02rem, 4.2vw, 1.18rem)';
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 0.6,
        maxWidth: '100%',
        fontStyle: 'normal',
        unicodeBidi: 'embed',
      }}
    >
      <Box
        component="span"
        sx={{
          color: alpha(COLORS.muted, 0.9),
          fontWeight: 700,
          fontSize: size === 'lg' ? '0.72rem' : '0.66rem',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          letterSpacing: 0.08,
        }}
      >
        د.ل
      </Box>
      <Box
        component="span"
        sx={{
          color: COLORS.text,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.01em',
        }}
      >
        {raw}
      </Box>
    </Box>
  );
};

/** مبلغ عهدة يدعم السالب (عجز) بألوان واضحة — يطابق عرض `MoneyLine` (د.ل يسار الرقم) */
const CustodyMoneyLine = ({
  value,
  size = 'lg',
}: {
  value: number;
  size?: 'md' | 'lg';
}) => {
  const neg = value < 0;
  const raw = numberFormatter.format(Math.round(Math.abs(value || 0)));
  const fs =
    size === 'lg' ? 'clamp(1.35rem, 6.5vw, 1.95rem)' : 'clamp(1.02rem, 4.2vw, 1.18rem)';
  const mainColor = neg ? '#C62828' : COLORS.text;
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 0.6,
        maxWidth: '100%',
        fontStyle: 'normal',
        unicodeBidi: 'embed',
      }}
    >
      <Box
        component="span"
        sx={{
          color: alpha(COLORS.muted, 0.9),
          fontWeight: 700,
          fontSize: size === 'lg' ? '0.72rem' : '0.66rem',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          letterSpacing: 0.08,
        }}
      >
        د.ل
      </Box>
      <Box
        component="span"
        sx={{
          color: mainColor,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.01em',
        }}
      >
        {neg ? '−' : ''}
        {raw}
      </Box>
    </Box>
  );
};

type MenuItem = {
  title: string;
  subtitle: string;
  path: string;
  icon: any;
  module: AppModule;
};

const PRIMARY_MENU: MenuItem[] = [
  { title: 'العملاء', subtitle: 'إدارة بيانات العملاء', path: '/clients', icon: Users, module: 'clients' },
  { title: 'الفواتير', subtitle: 'إدارة وإنشاء الفواتير', path: '/invoices', icon: FileText, module: 'invoices' },
  { title: 'المدفوعات', subtitle: 'متابعة المدفوعات', path: '/payments', icon: CreditCard, module: 'payments' },
];

const SHORTCUTS_MENU: MenuItem[] = [
  { title: 'المصروفات', subtitle: 'مصروفات الشركة العامة', path: '/expenses', icon: Receipt, module: 'expenses' },
  { title: 'الديون', subtitle: 'إدارة الديون والأطراف', path: '/debts', icon: CircleDollarSign, module: 'debts' },
  { title: 'المستخدمين', subtitle: 'الموظفين والصلاحيات', path: '/users', icon: UserCog, module: 'users' },
  { title: 'التقارير', subtitle: 'الرسائل الرسمية والتقارير', path: '/letters', icon: FileText, module: 'letters' },
  { title: 'صندوق العهدة', subtitle: 'الرصيد والحركات المالية', path: '/fund', icon: Wallet, module: 'balances' },
  { title: 'العهــود', subtitle: 'سجل العقود والعهود', path: '/contracts', icon: Building2, module: 'letters' },
];

export const DashboardHomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { clients, payments, expenses, isLoading } = useDataStore();
  const { transactions, getUserStats, initialize: initFund, isLoading: fundLoading } = useGlobalFundStore();
  const { isLocked, isSessionUnlocked, canAccess } = useAppLockStore();
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const canOpenFund = canAccess('balances');
  const canSeeStats = canAccess('stats');
  const sessionUnlocked = isSessionUnlocked();

  useEffect(() => {
    const u = initFund();
    return u;
  }, [initFund]);

  /** نفس منطق صفحة المصروفات / ملف العميل: `computeUserFundAllocTotals` + fallback عند عدم وجود إيداعات */
  const myCustodyFund = useMemo(() => {
    if (!user) return null;
    const uid = user.id;
    const userName = user.displayName || '';

    const deposits = transactions.filter(
      (t) =>
        t.type === 'deposit' &&
        ((uid && t.userId === uid) || (userName && t.userName === userName))
    );

    if (deposits.length === 0) {
      const storeStats = uid ? getUserStats(uid) : null;
      if (storeStats && storeStats.deposited > 0) {
        return {
          deposited: storeStats.deposited,
          spent: storeStats.withdrawn,
          remaining: storeStats.remaining,
        };
      }
      return null;
    }

    const depositRows = deposits.map((t) => ({ createdAt: t.createdAt, amount: t.amount }));
    const expenseRows = expenses
      .filter((e) => (uid && e.userId === uid) || (userName && e.createdBy === userName))
      .map((e) => ({ createdAt: e.createdAt, amount: e.amount }));

    return computeUserFundAllocTotals(depositRows, expenseRows);
  }, [transactions, expenses, user, getUserStats]);

  /** تنبيهات مبنية على بيانات فعلية — تُفتح في لوحة جانبية */
  const homeNotifications = useMemo(() => {
    const list: {
      id: string;
      kind: 'urgent' | 'info' | 'success' | 'lock';
      title: string;
      body: string;
    }[] = [];

    if (isLocked && !sessionUnlocked) {
      list.push({
        id: 'session-lock',
        kind: 'lock',
        title: 'جلسة القفل',
        body: 'أدخل رمز التطبيق للوصول للأقسام المحمية (العملاء، الصندوق، وغيرها) إن وُجدت بصلاحيتك.',
      });
    }
    if (!canSeeStats) {
      list.push({
        id: 'stats-hidden',
        kind: 'info',
        title: 'إحصائيات الشاشة الرئيسية',
        body: 'مؤشرات صافي الأرباح والمحصّل وعموم المصروفات معطّلة بإعدادات الأمان. يبقى بإمكانك استخدام باقي الأقسام المفعّلة لك وعرض عهدتك عندما تظهر أدناه.',
      });
    }
    if (myCustodyFund && myCustodyFund.remaining < 0) {
      list.push({
        id: 'custody-deficit',
        kind: 'urgent',
        title: 'عجز في عهدة صندوق العهدة',
        body: `المتبقي المطلوب تسويته: ‎${formatCurrency(Math.abs(myCustodyFund.remaining))}‎. راجع العهدات في صندوق العهدة عند تفعيل صلاحيتك أو التواصل مع المسؤول.`,
      });
    } else if (myCustodyFund && myCustodyFund.remaining > 0 && myCustodyFund.remaining < 300) {
      list.push({
        id: 'custody-low',
        kind: 'info',
        title: 'تنبيه ميزانية عهدة',
        body: `رصيدك المتبقي أقل من 300 ‎د.ل‎. خطط لإعادة التمويل عند الحاجة.`,
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'all-clear',
        kind: 'success',
        title: 'لا عناوين صادرة',
        body: 'لا إشعارات مالية مخصصة حالياً. سيتم إظهار تنبيهات عند تغيّر وضع عهادتك أو عند اصطفاف مهم.',
      });
    }
    return list;
  }, [isLocked, sessionUnlocked, canSeeStats, myCustodyFund]);

  const urgentNotifCount = useMemo(
    () => homeNotifications.filter((n) => n.kind === 'urgent').length,
    [homeNotifications],
  );

  const relevantNotifCount = useMemo(() => {
    if (urgentNotifCount > 0) return urgentNotifCount;
    return homeNotifications.filter((n) => n.id !== 'all-clear').length;
  }, [homeNotifications, urgentNotifCount]);

  const primaryMenuVisible = useMemo(
    () => PRIMARY_MENU.filter((item) => canAccess(item.module)),
    [canAccess],
  );
  const shortcutsMenuVisible = useMemo(
    () => SHORTCUTS_MENU.filter((item) => canAccess(item.module)),
    [canAccess],
  );

  const stats = useMemo(() => {
    const collectedAmount = payments.reduce((sum, item) => sum + (item.amount || 0), 0);
    const expensesAmount = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = collectedAmount - expensesAmount;
    const hasData = clients.length > 0 || payments.length > 0 || expenses.length > 0;
    return { collectedAmount, expensesAmount, netProfit, hasData, clientsCount: clients.length };
  }, [clients.length, expenses, payments]);

  const renderMenuList = (menu: MenuItem[]) =>
    menu.map((item, index) => {
      const Icon = item.icon;
      return (
        <Box
          key={item.title}
          onClick={() => navigate(item.path)}
          sx={{
            // Important: do NOT set `direction: rtl` on a flex row here — it mirrors flex item placement
            // in ways that make icons look "on the wrong side" next to the text.
            // Visual target (RTL): [chevron (far start)] ... [text] [icon (far end)]
            minHeight: 60,
            px: 1.4,
            py: 1.25,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexDirection: 'row',
            direction: 'ltr',
            cursor: 'pointer',
            transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': { bgcolor: alpha(COLORS.primary, 0.04) },
            '&:not(:last-of-type)': {
              borderBottom: index < menu.length - 1 ? '1px solid rgba(31,61,53,0.08)' : 'none',
            },
          }}
        >
          <Box sx={{ width: 22, display: 'grid', placeItems: 'center' }}>
            <ChevronLeft size={16} color={COLORS.muted} />
          </Box>
          {/* Box + explicit LTR: MUI `Stack` row follows theme direction (rtl) and flips [text, icon] */}
          <Box
            dir="ltr"
            sx={{
              minWidth: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1.15,
            }}
          >
            <Box sx={{ textAlign: 'right', minWidth: 0 }}>
              <Typography sx={{ color: COLORS.text, fontWeight: 600, fontSize: '0.93rem' }}>{item.title}</Typography>
              <Typography sx={{ color: COLORS.muted, fontSize: '0.73rem' }}>{item.subtitle}</Typography>
            </Box>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(COLORS.primary, 0.1),
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={COLORS.primary} strokeWidth={1.9} />
            </Box>
          </Box>
        </Box>
      );
    });

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100dvh',
        bgcolor: COLORS.background,
        pb: 4,
        direction: 'rtl',
        textAlign: 'right',
        fontFamily: '"Cairo","IBM Plex Sans Arabic","Tajawal",sans-serif',
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        {/* MUI Stack row = theme RTL: inner order was [text,avatar] so avatar sat on the **left**; use div+rtl+Avatar first = far right */}
        <Box
          dir="rtl"
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2.5 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.25 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#1F2A2A',
                fontWeight: 700,
                border: '2px solid #fff',
                boxShadow: '0 10px 18px rgba(31,61,53,0.18)',
                flexShrink: 0,
              }}
            >
              {(user?.displayName || 'محمد').charAt(0)}
            </Avatar>
            <Box sx={{ textAlign: 'right', minWidth: 0 }}>
              <Typography sx={{ color: COLORS.muted, fontSize: '0.78rem', fontWeight: 500 }}>مرحباً</Typography>
              <Typography sx={{ color: COLORS.text, fontSize: '1.05rem', fontWeight: 700 }}>م. {user?.displayName || 'محمد'}</Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ direction: 'rtl' }}>
            <IconButton
              onClick={() => setNotifOpen(true)}
              aria-label="الإشعارات"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: '#EFEFED',
                color: '#1F2A2A',
                border: '1px solid rgba(31,61,53,0.08)',
                boxShadow: urgentNotifCount > 0
                  ? '0 0 0 2px rgba(198,40,40,0.2), 0 4px 14px rgba(198,40,40,0.12)'
                  : '0 2px 10px rgba(24,38,33,0.04)',
                transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': { bgcolor: '#F6F6F4', transform: 'translateY(-1px)' },
                ...(urgentNotifCount > 0 && {
                  '@keyframes notifRing': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(198,40,40,0.35)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(198,40,40,0)' },
                  },
                  animation: 'notifRing 2.2s ease-in-out infinite',
                }),
              }}
            >
              <Badge
                color="error"
                invisible={relevantNotifCount === 0}
                badgeContent={relevantNotifCount > 9 ? '9+' : relevantNotifCount}
                sx={{
                  '& .MuiBadge-badge': {
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <Bell size={18} />
              </Badge>
            </IconButton>
            {(
              [
                {
                  label: 'القفل',
                  icon: isLocked && !isSessionUnlocked() ? <Lock size={18} /> : <LockOpen size={18} />,
                  action: () => setLockSettingsOpen(true),
                },
                { label: 'تسجيل الخروج', icon: <LogOut size={18} />, action: () => { logout(); navigate('/login'); } },
              ] as const
            ).map((item) => (
              <IconButton
                key={item.label}
                onClick={item.action}
                aria-label={item.label}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: '#EFEFED',
                  color: '#1F2A2A',
                  border: '1px solid rgba(31,61,53,0.08)',
                  boxShadow: '0 2px 10px rgba(24,38,33,0.04)',
                  transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  '&:hover': { bgcolor: '#F6F6F4', transform: 'translateY(-1px)' },
                }}
              >
                {item.icon}
              </IconButton>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Card
            sx={{
              borderRadius: '24px',
              p: 2.5,
              color: '#F7FAF8',
              background: `linear-gradient(165deg, ${COLORS.primary} 0%, ${COLORS.primary2} 100%)`,
              boxShadow: '0 16px 30px rgba(24,41,35,0.24)',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 320,
            }}
          >
            {/* مبنى: فوق تدرج البطاقة + mixBlendMode = يظهر بخفاء دون طبقة ساترة كاملة */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: { xs: '64%', sm: '58%' },
                maxWidth: 460,
                zIndex: 0,
                backgroundImage: `url('${HERO_ARCHITECTURE_IMAGE}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'left 18% 45%',
                opacity: 0.34,
                mixBlendMode: 'soft-light',
                filter: 'blur(2.5px) saturate(0.5) contrast(0.9) brightness(0.95)',
                pointerEvents: 'none',
                maskImage: 'linear-gradient(100deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 88%)',
                WebkitMaskImage: 'linear-gradient(100deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 88%)',
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                background: `linear-gradient(100deg, rgba(0,0,0,0.12) 0%, transparent 40%, ${alpha(COLORS.primary, 0.2)} 72%, ${alpha(COLORS.primary, 0.45)} 100%)`,
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: '40%',
                zIndex: 0,
                opacity: 0.18,
                backgroundImage: [
                  'radial-gradient(circle, rgba(200, 192, 176, 0.18) 0.5px, rgba(0,0,0,0) 0.6px)',
                ].join(', '),
                backgroundSize: '10px 10px',
                backgroundPosition: 'right top',
                mixBlendMode: 'soft-light',
                maskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0) 100%)',
                pointerEvents: 'none',
              }}
            />

            <Stack sx={{ position: 'relative', zIndex: 1, alignItems: 'center', textAlign: 'center', mt: 1 }}>
              {!logoFailed ? (
                <Box
                  component="img"
                  src="/logo.png"
                  alt="ETLAA"
                  onError={() => setLogoFailed(true)}
                  sx={{
                    width: 112,
                    height: 112,
                    objectFit: 'contain',
                    mb: 0.8,
                    display: 'block',
                    borderRadius: 0,
                    filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.35))',
                  }}
                />
              ) : (
                <HeroLogo size={100} compact plain />
              )}

              <Typography sx={{ fontSize: '0.64rem', letterSpacing: 0.8, fontWeight: 500, opacity: 0.92 }}>
                ETLAA ARCHITECTURAL & ENGINEERING CONSULTANCY
              </Typography>
              <Typography sx={{ mt: 1, fontSize: '0.93rem', lineHeight: 1.7, fontWeight: 500 }}>
                لوحة تحكم موحدة لعملائك والفواتير والمدفوعات
              </Typography>

              <Divider sx={{ width: '78%', my: 1.6, borderColor: 'rgba(255,255,255,0.2)' }} />

              <Stack spacing={1.1} alignItems="center" sx={{ width: 1, mt: 0.5 }}>
                <Box
                  dir="ltr"
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.9,
                    borderRadius: 99,
                    bgcolor: 'rgba(0,0,0,0.22)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    maxWidth: '100%',
                  }}
                >
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4, textAlign: 'right' }}>
                    شارع الجرابة، طرابلس، ليبيا
                  </Typography>
                  <MapPin size={16} color={alpha('#fff', 0.95)} />
                </Box>

                <Box
                  component="a"
                  href="tel:0913033331"
                  dir="ltr"
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.85,
                    borderRadius: 99,
                    bgcolor: 'rgba(0,0,0,0.22)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    textDecoration: 'none',
                    color: 'inherit',
                    maxWidth: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '1.02rem', fontWeight: 700, letterSpacing: 0.35 }}>0913033331</Typography>
                  <Phone size={16} color={alpha('#fff', 0.95)} />
                </Box>
              </Stack>
            </Stack>
          </Card>

        </Box>

        {canAccess('stats') && (
          <>
            <Card
              elevation={0}
              sx={{
                borderRadius: '22px',
                p: 2.5,
                mb: 2,
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F6 100%)',
                border: '1px solid rgba(31,61,53,0.09)',
                boxShadow: '0 2px 0 rgba(31,61,53,0.04) inset, 0 12px 32px -8px rgba(25,34,29,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: 4,
                  height: '100%',
                  borderRadius: '0 22px 22px 0',
                  background: `linear-gradient(180deg, ${alpha(COLORS.accent, 0.9)} 0%, ${alpha(COLORS.primary, 0.55)} 100%)`,
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ pr: 0.5 }}>
                  <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width={200} height={40} />
                </Box>
              ) : (
                <Box sx={{ pr: 1, textAlign: 'right' }}>
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      mb: 1,
                      letterSpacing: 0.02,
                    }}
                  >
                    صافي الأرباح
                  </Typography>
                  <Box
                    dir="rtl"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      lineHeight: 1.2,
                    }}
                  >
                    <MoneyLine value={stats.netProfit} size="lg" />
                  </Box>
                </Box>
              )}
            </Card>

            <Stack direction="row" spacing={1.25} sx={{ mb: 2 }}>
              {(
                [
                  {
                    key: 'collected',
                    title: 'المحصل',
                    value: stats.collectedAmount,
                    icon: <Wallet size={18} color="#fff" strokeWidth={1.85} />,
                  },
                  {
                    key: 'expenses',
                    title: 'المصروفات',
                    value: stats.expensesAmount,
                    icon: <CreditCard size={18} color="#fff" strokeWidth={1.85} />,
                  },
                ] as const
              ).map((item) => (
                <Card
                  key={item.key}
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    borderRadius: '20px',
                    p: 1.75,
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(165deg, #FFFFFF 0%, #F6F5F0 100%)',
                    border: '1px solid rgba(31,61,53,0.08)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 24px -10px rgba(25,34,29,0.12)',
                    textAlign: 'right',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 14px 28px -8px rgba(25,34,29,0.16)' },
                  }}
                >
                  {isLoading ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" width={40} height={40} />
                      <Skeleton variant="text" width="55%" />
                      <Skeleton variant="text" width="80%" height={32} />
                    </Stack>
                  ) : (
                    <Box>
                      <Box
                        dir="rtl"
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          mb: 1.25,
                        }}
                      >
                        <Typography
                          sx={{
                            color: COLORS.muted,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: 0.03,
                            lineHeight: 1.2,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.25,
                            display: 'grid',
                            placeItems: 'center',
                            background: `linear-gradient(145deg, ${COLORS.primary} 0%, ${COLORS.primary2} 100%)`,
                            boxShadow: '0 6px 16px rgba(31,61,53,0.24)',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>
                      </Box>
                      <Box dir="rtl" sx={{ textAlign: 'right', pr: 0.25, lineHeight: 1.15 }}>
                        <MoneyLine value={item.value} size="md" />
                      </Box>
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          </>
        )}

        {user && !fundLoading && myCustodyFund && (
          <Card
            elevation={0}
            onClick={() => {
              if (canOpenFund) {
                navigate('/fund');
                return;
              }
              toast('للمتابعة التفصيلية في «صندوق العهدة» يلزم تفعيل هذه الصلاحية من إعدادات قفل التطبيق لحسابك.', {
                icon: '🔐',
                duration: 4200,
              });
            }}
            sx={{
              borderRadius: '22px',
              p: 2.5,
              mb: 2,
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F6 100%)',
              border: '1px solid rgba(31,61,53,0.09)',
              boxShadow: '0 2px 0 rgba(31,61,53,0.04) inset, 0 12px 32px -8px rgba(25,34,29,0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 2px 0 rgba(31,61,53,0.05) inset, 0 16px 36px -6px rgba(25,34,29,0.14)',
                transform: 'translateY(-1px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: 0,
                width: 4,
                height: '100%',
                borderRadius: '0 22px 22px 0',
                background: `linear-gradient(180deg, ${alpha(COLORS.primary, 0.75)} 0%, ${alpha(COLORS.accent, 0.55)} 100%)`,
              },
            }}
          >
            <Box sx={{ pr: 1, textAlign: 'right' }}>
              <Box
                dir="rtl"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    letterSpacing: 0.02,
                    lineHeight: 1.3,
                  }}
                >
                  رصيد عهـدة صندوق العهـدة
                  <Box component="span" sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, opacity: 0.9, mt: 0.35 }}>
                    {user?.displayName || '—'}
                  </Box>
                </Typography>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    background: `linear-gradient(145deg, ${alpha(COLORS.accent, 0.25)} 0%, ${alpha(COLORS.primary, 0.2)} 100%)`,
                    border: '1px solid rgba(31,61,53,0.1)',
                    flexShrink: 0,
                  }}
                >
                  <Wallet size={20} color={COLORS.primary} strokeWidth={1.85} />
                </Box>
              </Box>
              <Box
                dir="rtl"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  lineHeight: 1.2,
                }}
              >
                <CustodyMoneyLine value={myCustodyFund.remaining} size="lg" />
              </Box>
              <Typography sx={{ color: COLORS.muted, fontSize: '0.72rem', mt: 1.1, fontWeight: 500 }}>
                {myCustodyFund.remaining >= 0
                  ? canOpenFund
                    ? 'المتبقي لك بعد تخصيص مصروفاتك — اضغط للتفاصيل'
                    : 'المتبقي لك بعد تخصيص مصروفاتك (عرض تفصيلي الصندوق يتطلب صلاحية)'
                  : canOpenFund
                    ? 'عجز على عهدتك — اضغط لعرض التفاصيل في الصندوق'
                    : 'عجز على عهدتك — اطلب من المسؤول تفعيل صلاحية صندوق العهدة للتفاصيل'}
              </Typography>
            </Box>
          </Card>
        )}

        {primaryMenuVisible.length > 0 && (
          <>
            <Box
              dir="rtl"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
                px: 0.6,
                mb: 1,
              }}
            >
              <Typography sx={{ color: COLORS.text, fontWeight: 700, fontSize: '1.95rem', letterSpacing: 0.2 }}>القوائم الرئيسية</Typography>
              <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.35), flexShrink: 0 }} />
            </Box>
            <Card sx={{ borderRadius: '20px', p: 1, bgcolor: '#fff', border: '1px solid rgba(31,61,53,0.08)', boxShadow: '0 8px 20px rgba(25,34,31,0.06)' }}>
              {renderMenuList(primaryMenuVisible)}
            </Card>
          </>
        )}

        {shortcutsMenuVisible.length > 0 && (
          <>
            <Box
              dir="rtl"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
                px: 0.6,
                my: 1.2,
              }}
            >
              <Typography sx={{ color: COLORS.text, fontWeight: 700, fontSize: '1rem', letterSpacing: 0.15 }}>اختصارات إضافية</Typography>
              <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.7), flexShrink: 0 }} />
            </Box>
            <Card sx={{ borderRadius: '20px', p: 1, bgcolor: '#fff', border: '1px solid rgba(31,61,53,0.08)', boxShadow: '0 8px 20px rgba(25,34,31,0.06)' }}>
              {renderMenuList(shortcutsMenuVisible)}
            </Card>
          </>
        )}

        {primaryMenuVisible.length === 0 && shortcutsMenuVisible.length === 0 && (
          <Card
            sx={{
              mt: 1,
              borderRadius: '20px',
              p: 2.5,
              bgcolor: '#fff',
              border: '1px dashed rgba(31,61,53,0.2)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: COLORS.muted, fontSize: '0.92rem' }}>
              لا تتوفر اختصارات لهذه الصلاحيات. اطلب من المسؤول تفعيل الأقسام المطلوبة من إعدادات قفل التطبيق.
            </Typography>
          </Card>
        )}

        {canAccess('stats') && !isLoading && !stats.hasData && (
          <Card
            sx={{
              mt: 1.5,
              borderRadius: '20px',
              p: 2,
              bgcolor: '#fff',
              border: '1px dashed rgba(31,61,53,0.22)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: COLORS.text, fontWeight: 700, mb: 0.4 }}>لا توجد بيانات مالية بعد</Typography>
            <Typography sx={{ color: COLORS.muted, fontSize: '0.84rem' }}>
              سيتم تحديث صافي الأرباح والمصروفات والتحصيل تلقائياً بمجرد إضافة بيانات جديدة.
            </Typography>
          </Card>
        )}
      </Container>

      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            maxWidth: '100vw',
            borderRadius: { xs: '20px 20px 0 0', sm: '0' },
            borderLeft: { sm: '1px solid rgba(31,61,53,0.08)' },
            background: 'linear-gradient(180deg, #FDFDFB 0%, #F5F5F2 100%)',
          },
        }}
      >
        <Box
          dir="rtl"
          sx={{
            p: 2.25,
            borderBottom: '1px solid rgba(31,61,53,0.08)',
            background: `linear-gradient(120deg, ${alpha(COLORS.primary, 0.08)} 0%, transparent 55%)`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: COLORS.text }}>الإشعارات</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.muted, mt: 0.35 }}>مُحدَّثة من بياناتك الحالية</Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(COLORS.accent, 0.2),
                border: `1px solid ${alpha(COLORS.accent, 0.35)}`,
              }}
            >
              <Bell size={20} color={COLORS.primary} strokeWidth={1.9} />
            </Box>
          </Stack>
        </Box>
        <Box sx={{ p: 2, pb: 3, maxHeight: 'calc(100dvh - 120px)', overflow: 'auto' }}>
          <Stack spacing={1.5}>
            {homeNotifications.map((n) => {
              const kindStyles = {
                urgent: { bg: 'rgba(198, 40, 40, 0.08)', border: 'rgba(198, 40, 40, 0.18)' },
                info: { bg: 'rgba(200, 192, 176, 0.2)', border: 'rgba(31, 61, 53, 0.1)' },
                success: { bg: 'rgba(46, 125, 50, 0.08)', border: 'rgba(46, 125, 50, 0.15)' },
                lock: { bg: 'rgba(92, 107, 192, 0.1)', border: 'rgba(92, 107, 192, 0.2)' },
              } as const;
              const s = kindStyles[n.kind] ?? kindStyles.info;
              const leftIcon =
                n.kind === 'urgent' ? (
                  <AlertTriangle size={22} color="#B71C1C" />
                ) : n.kind === 'success' ? (
                  <CheckCircle2 size={22} color="#2E7D32" />
                ) : n.kind === 'lock' ? (
                  <Shield size={22} color="#3949AB" />
                ) : (
                  <Sparkles size={22} color={alpha(COLORS.primary, 0.85)} />
                );
              return (
                <Box
                  key={n.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    bgcolor: s.bg,
                    border: `1px solid ${s.border}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after':
                      n.kind === 'urgent'
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            bgcolor: '#c62828',
                            borderRadius: '0 2px 2px 0',
                          }
                        : {},
                  }}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Box sx={{ pt: 0.15, flexShrink: 0 }}>{leftIcon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: COLORS.text, lineHeight: 1.35 }}>
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: COLORS.muted, mt: 0.75, lineHeight: 1.6 }}>
                        {n.body}
                      </Typography>
                      {n.id === 'custody-deficit' && canOpenFund && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate('/fund');
                          }}
                          sx={{
                            mt: 1.25,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 800,
                            bgcolor: COLORS.primary,
                            '&:hover': { bgcolor: COLORS.primary2 },
                          }}
                        >
                          فتح صندوق العهدة
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
        <Box sx={{ p: 2, pt: 0, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
          <Button
            fullWidth
            onClick={() => setNotifOpen(false)}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', color: COLORS.muted, border: '1px solid rgba(31,61,53,0.12)' }}
          >
            إغلاق
          </Button>
        </Box>
      </Drawer>

      <AppLockSettingsDialog open={lockSettingsOpen} onClose={() => setLockSettingsOpen(false)} />
    </Box>
  );
};
