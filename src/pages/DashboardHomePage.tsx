import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Drawer,
  FormControlLabel,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
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
  Moon,
  Receipt,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import {
  getNotificationPermission,
  getPwaNotificationsUserEnabled,
  isWebNotificationSupported,
  requestNotificationPermission,
  setPwaNotificationsUserEnabled,
} from "../lib/pwaNotifications";
import {
  filterUndismissedNotifications,
  loadDismissMap,
  mergeDismissAfterClear,
  saveDismissMap,
} from "../lib/notificationDismissals";
import { buildAppNotifications } from "../notifications/buildAppNotifications";
import type { AppNotificationItem } from "../notifications/buildAppNotifications";
import { usePwaNotificationBridge } from "../notifications/usePwaNotificationBridge";
import { registerDeviceForFcmPush } from "../lib/fcmWebPush";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useDataStore } from "../store/useDataStore";
import { useAppLockStore, type AppModule } from "../store/useAppLockStore";
import { AppLockSettingsDialog } from "../components/AppLockSettingsDialog";
import toast from "react-hot-toast";
import { useGlobalFundStore } from "../store/useGlobalFundStore";
import { computeUserFundAllocTotals } from "../utils/custodyFundAlloc";
import { formatCurrency } from "../utils/formatters";

dayjs.extend(relativeTime);
dayjs.locale("ar");

const COLORS = {
  primary: "#1E3F36",
  primary2: "#2D5246",
  primaryDeep: "#152E28",
  background: "#F7F6F1",
  accent: "#C4AE72",
  text: "#2A2E2C",
  muted: "#6E756F",
};

/**
 * مقياس زوايا موحّد للوحة الإشعارات (Swiss / minimal dashboard — ui-ux-pro-max):
 * ورقة علوية خفيفة، أسطح 12px، تحكم 10px، وسوم صغيرة 6px — بدل خلط 20–22px مع pills عشوائية.
 */
const NOTIF_R = {
  sheetTop: "14px",
  surface: "12px",
  control: "10px",
  meta: "6px",
  /** مقبض السحب: كبسولة (نصف ارتفاع الشريط تقريباً) */
  handle: "2.5px",
} as const;

/** بانر الصفحة الرئيسية — الملف: `public/home-hero-banner.png` */
const HOME_HERO_BANNER_SRC = "/home-hero-banner.png";

const numberFormatter = new Intl.NumberFormat("ar-LY-u-nu-latn", {
  maximumFractionDigits: 0,
});

/**
 * في بطاقة RTL: عرض المبلغ ككتلة ltr — «د.ل» يسار الأرقام (لاصقة بجانب المبلغ من ناحية الوسط/النهاية)،
 * وليست تُقرأ «قبل» الأرقام في جملة ltr.
 */
const MoneyLine = ({
  value,
  size = "md",
}: {
  value: number;
  size?: "md" | "lg";
}) => {
  const raw = numberFormatter.format(Math.round(value || 0));
  const fs =
    size === "lg"
      ? "clamp(1.35rem, 6.5vw, 1.95rem)"
      : "clamp(1.02rem, 4.2vw, 1.18rem)";
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "baseline",
        gap: 0.6,
        maxWidth: "100%",
        fontStyle: "normal",
        unicodeBidi: "embed",
      }}
    >
      <Box
        component="span"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          fontSize: size === "lg" ? "0.72rem" : "0.66rem",
          lineHeight: 1,
          whiteSpace: "nowrap",
          letterSpacing: 0.08,
        }}
      >
        د.ل
      </Box>
      <Box
        component="span"
        sx={{
          color: "text.primary",
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
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
  size = "lg",
}: {
  value: number;
  size?: "md" | "lg";
}) => {
  const neg = value < 0;
  const raw = numberFormatter.format(Math.round(Math.abs(value || 0)));
  const fs =
    size === "lg"
      ? "clamp(1.35rem, 6.5vw, 1.95rem)"
      : "clamp(1.02rem, 4.2vw, 1.18rem)";
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "baseline",
        gap: 0.6,
        maxWidth: "100%",
        fontStyle: "normal",
        unicodeBidi: "embed",
      }}
    >
      <Box
        component="span"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          fontSize: size === "lg" ? "0.72rem" : "0.66rem",
          lineHeight: 1,
          whiteSpace: "nowrap",
          letterSpacing: 0.08,
        }}
      >
        د.ل
      </Box>
      <Box
        component="span"
        sx={{
          color: neg ? "error.main" : "text.primary",
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
        }}
      >
        {neg ? "−" : ""}
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
  {
    title: "العملاء",
    subtitle: "إدارة بيانات العملاء",
    path: "/clients",
    icon: Users,
    module: "clients",
  },
  {
    title: "الفواتير",
    subtitle: "إدارة وإنشاء الفواتير",
    path: "/invoices",
    icon: FileText,
    module: "invoices",
  },
  {
    title: "المدفوعات",
    subtitle: "متابعة المدفوعات",
    path: "/payments",
    icon: CreditCard,
    module: "payments",
  },
];

const SHORTCUTS_MENU: MenuItem[] = [
  {
    title: "المصروفات",
    subtitle: "مصروفات الشركة العامة",
    path: "/expenses",
    icon: Receipt,
    module: "expenses",
  },
  {
    title: "الديون",
    subtitle: "إدارة الديون والأطراف",
    path: "/debts",
    icon: CircleDollarSign,
    module: "debts",
  },
  {
    title: "المستخدمين",
    subtitle: "الموظفين والصلاحيات",
    path: "/users",
    icon: UserCog,
    module: "users",
  },
  {
    title: "التقارير",
    subtitle: "الرسائل الرسمية والتقارير",
    path: "/letters",
    icon: FileText,
    module: "letters",
  },
  {
    title: "صندوق العهدة",
    subtitle: "الرصيد والحركات المالية",
    path: "/fund",
    icon: Wallet,
    module: "balances",
  },
  {
    title: "العهــود",
    subtitle: "سجل العقود والعهود",
    path: "/contracts",
    icon: Building2,
    module: "letters",
  },
];

export const DashboardHomePage = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeStore();
  const isThemeDark = mode === "dark";
  const theme = useTheme();
  const isMuiDark = theme.palette.mode === "dark";
  const { user, logout } = useAuthStore();
  const { clients, payments, expenses, invoices, isLoading } = useDataStore();
  const {
    transactions,
    getUserStats,
    initialize: initFund,
    isLoading: fundLoading,
  } = useGlobalFundStore();
  const { isLocked, isSessionUnlocked, canAccess } = useAppLockStore();
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pwaNotifEnabled, setPwaNotifEnabled] = useState(() =>
    getPwaNotificationsUserEnabled(),
  );
  const [browserNotifPerm, setBrowserNotifPerm] = useState(() =>
    getNotificationPermission(),
  );
  const [notifPermLoading, setNotifPermLoading] = useState(false);
  const [notifDismissMap, setNotifDismissMap] = useState(loadDismissMap);

  const canOpenFund = canAccess("balances");
  const canSeeStats = canAccess("stats");
  const isTeamCustodyViewer = canAccess("stats");
  const sessionUnlocked = isSessionUnlocked();

  useEffect(() => {
    const u = initFund();
    return u;
  }, [initFund]);

  /** نفس منطق صفحة المصروفات / ملف العميل: `computeUserFundAllocTotals` + fallback عند عدم وجود إيداعات */
  const myCustodyFund = useMemo(() => {
    if (!user) return null;
    const uid = user.id;
    const userName = user.displayName || "";

    const deposits = transactions.filter(
      (t) =>
        t.type === "deposit" &&
        ((uid && t.userId === uid) || (userName && t.userName === userName)),
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

    const depositRows = deposits.map((t) => ({
      createdAt: t.createdAt,
      amount: t.amount,
    }));
    const expenseRows = expenses
      .filter(
        (e) =>
          (uid && e.userId === uid) || (userName && e.createdBy === userName),
      )
      .map((e) => ({ createdAt: e.createdAt, amount: e.amount }));

    return computeUserFundAllocTotals(depositRows, expenseRows);
  }, [transactions, expenses, user, getUserStats]);

  const fundUserNameById = useMemo(() => {
    const m: Record<string, string> = {};
    transactions.forEach((t) => {
      if (t.type === "deposit" && t.userId) {
        m[t.userId] = t.userName || m[t.userId] || "مستخدم";
      }
    });
    return m;
  }, [transactions]);

  /** تنبيهات مبنية على بيانات فعلية + نشاط الفريق — لوحة جانبية وإشعارات PWA */
  const homeNotifications = useMemo(
    () =>
      buildAppNotifications({
        userId: user?.id,
        userDisplayName: user?.displayName,
        userEmail: user?.email,
        isLocked,
        sessionUnlocked,
        canSeeStats,
        canOpenFund,
        isTeamCustodyViewer,
        transactions,
        expenses,
        invoices,
        payments,
        clients,
        getUserStats,
        fundUserNameById,
      }),
    [
      user?.id,
      user?.displayName,
      user?.email,
      isLocked,
      sessionUnlocked,
      canSeeStats,
      canOpenFund,
      isTeamCustodyViewer,
      transactions,
      expenses,
      invoices,
      payments,
      clients,
      getUserStats,
      fundUserNameById,
    ],
  );

  usePwaNotificationBridge(homeNotifications);

  useEffect(() => {
    if (notifOpen) setBrowserNotifPerm(getNotificationPermission());
  }, [notifOpen]);

  const visibleNotifications = useMemo(() => {
    const v = filterUndismissedNotifications(homeNotifications, notifDismissMap);
    const core = v.filter((n) => n.id !== "all-clear");
    const hasBody = core.some(
      (n) => n.id !== "session-lock" && n.id !== "stats-hidden",
    );
    if (hasBody) return v;
    const meta = core.filter(
      (n) => n.id === "session-lock" || n.id === "stats-hidden",
    );
    const placeholder: AppNotificationItem = {
      id: "all-clear",
      kind: "success",
      title: "لا تنبيهات حالياً",
      body:
        meta.length > 0
          ? "لا يوجد تنبيه جديد بعد المسح. سيظهر أي تحديث تلقائياً."
          : "لا تنبيهات أو تم إخفاء المعروض. أي حدث جديد سيظهر هنا.",
    };
    return [...meta, placeholder];
  }, [homeNotifications, notifDismissMap]);

  const canBulkClearNotifications = useMemo(
    () =>
      visibleNotifications.some(
        (n) =>
          n.id !== "session-lock" &&
          n.id !== "stats-hidden" &&
          n.id !== "all-clear",
      ),
    [visibleNotifications],
  );

  const urgentNotifCount = useMemo(
    () =>
      visibleNotifications.filter(
        (n) =>
          n.kind === "urgent" ||
          (n.kind === "team" && n.id.includes("deficit")),
      ).length,
    [visibleNotifications],
  );

  const relevantNotifCount = useMemo(() => {
    if (urgentNotifCount > 0) return urgentNotifCount;
    return visibleNotifications.filter((n) => n.id !== "all-clear").length;
  }, [visibleNotifications, urgentNotifCount]);

  const primaryMenuVisible = useMemo(
    () => PRIMARY_MENU.filter((item) => canAccess(item.module)),
    [canAccess],
  );
  const shortcutsMenuVisible = useMemo(
    () => SHORTCUTS_MENU.filter((item) => canAccess(item.module)),
    [canAccess],
  );

  const stats = useMemo(() => {
    const collectedAmount = payments.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const expensesAmount = expenses.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    const netProfit = collectedAmount - expensesAmount;
    const hasData =
      clients.length > 0 || payments.length > 0 || expenses.length > 0;
    return {
      collectedAmount,
      expensesAmount,
      netProfit,
      hasData,
      clientsCount: clients.length,
    };
  }, [clients.length, expenses, payments]);

  const menuListCardSurface = isMuiDark
    ? "linear-gradient(165deg, #222A24 0%, #181E1A 100%)"
    : "linear-gradient(165deg, #FEFDFB 0%, #F5F3ED 100%)";

  const renderMenuList = (menu: MenuItem[]) => (
    <Stack spacing={1.35} sx={{ width: 1 }} useFlexGap>
      {menu.map((item) => {
        const Icon = item.icon;
        const p = theme.palette;
        return (
          <Box
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 3,
              px: 1.6,
              py: 1.4,
              minHeight: 64,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.25,
              direction: "rtl",
              cursor: "pointer",
              border: "none",
              bgcolor: isMuiDark ? alpha("#fff", 0.04) : alpha("#fff", 0.72),
              boxShadow: isMuiDark
                ? "0 2px 16px rgba(0,0,0,0.22)"
                : "0 2px 14px rgba(31, 61, 53, 0.06)",
              transition: "background 180ms ease, box-shadow 180ms ease",
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": {
                  bgcolor: isMuiDark
                    ? alpha("#fff", 0.08)
                    : alpha("#fff", 0.95),
                  boxShadow: isMuiDark
                    ? "0 6px 22px rgba(0,0,0,0.32)"
                    : "0 8px 24px rgba(31, 61, 53, 0.1)",
                  transform: "translateY(-1px)",
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1.35,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.25,
                  display: "grid",
                  placeItems: "center",
                  background: isMuiDark
                    ? `linear-gradient(145deg, ${alpha(COLORS.accent, 0.14)} 0%, ${alpha("#fff", 0.06)} 100%)`
                    : `linear-gradient(145deg, ${alpha(p.primary.main, 0.1)} 0%, ${alpha(COLORS.accent, 0.12)} 100%)`,
                  border: "none",
                  flexShrink: 0,
                  boxShadow: isMuiDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <Icon size={20} color={p.primary.main} strokeWidth={1.85} />
              </Box>
              <Box sx={{ textAlign: "right", minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.76rem" }}
                >
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 22,
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={17} color={p.text.disabled as string} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        background: isMuiDark
          ? "linear-gradient(180deg, #141916 0%, #0F1310 45%, #121814 100%)"
          : `linear-gradient(180deg, ${COLORS.background} 0%, #EEEBE4 55%, #E8E4DB 100%)`,
        /* المساحة فوق شريط التنقل تُدار من Layout فقط — لا padding إضافي يُضاعف الفراغ */
        pb: 0,
        direction: "rtl",
        textAlign: "right",
        fontFamily: '"Cairo","IBM Plex Sans Arabic","Tajawal",sans-serif',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: 2,
          pt: "calc(env(safe-area-inset-top, 0px) + 16px)",
          maxWidth: "100% !important",
        }}
      >
        {/* MUI Stack row = theme RTL: inner order was [text,avatar] so avatar sat on the **left**; use div+rtl+Avatar first = far right */}
        <Box
          dir="rtl"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: isMuiDark ? "primary.dark" : "#1F2A2A",
                fontWeight: 700,
                border: isMuiDark
                  ? "2px solid rgba(255,255,255,0.2)"
                  : "2px solid #fff",
                boxShadow: isMuiDark
                  ? "0 10px 18px rgba(0,0,0,0.4)"
                  : "0 10px 18px rgba(31,61,53,0.18)",
                flexShrink: 0,
              }}
            >
              {(user?.displayName || "محمد").charAt(0)}
            </Avatar>
            <Box sx={{ textAlign: "right", minWidth: 0 }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                }}
              >
                مرحباً
              </Typography>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                م. {user?.displayName || "محمد"}
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 2, sm: 2.75 }}
            sx={{
              direction: "rtl",
              flexShrink: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                flexShrink: 0,
                gap: { xs: 2.25, sm: 2.75 },
              }}
            >
              <IconButton
                onClick={() => setNotifOpen(true)}
                aria-label="الإشعارات"
                sx={{
                  marginInlineEnd: { xs: 0.25, sm: 0.5 },
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: isMuiDark ? "rgba(255,255,255,0.1)" : "#EFEFED",
                  color: isMuiDark ? "common.white" : "#1F2A2A",
                  border: `1px solid ${isMuiDark ? "rgba(255,255,255,0.14)" : "rgba(31,61,53,0.08)"}`,
                  boxShadow:
                    urgentNotifCount > 0
                      ? "0 0 0 2px rgba(198,40,40,0.2), 0 4px 14px rgba(198,40,40,0.12)"
                      : isMuiDark
                        ? "0 2px 12px rgba(0,0,0,0.35)"
                        : "0 2px 10px rgba(24,38,33,0.04)",
                  transition:
                    "background 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  "@media (hover: hover) and (pointer: fine)": {
                    "&:hover": {
                      bgcolor: isMuiDark ? "rgba(255,255,255,0.16)" : "#F6F6F4",
                      transform: "translateY(-1px)",
                    },
                  },
                  ...(urgentNotifCount > 0 && {
                    "@keyframes notifRing": {
                      "0%, 100%": { boxShadow: "0 0 0 0 rgba(198,40,40,0.35)" },
                      "50%": { boxShadow: "0 0 0 6px rgba(198,40,40,0)" },
                    },
                    animation: "notifRing 2.2s ease-in-out infinite",
                  }),
                }}
              >
                <Badge
                  color="error"
                  invisible={relevantNotifCount === 0}
                  badgeContent={
                    relevantNotifCount > 9 ? "9+" : relevantNotifCount
                  }
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <Bell size={18} />
                </Badge>
              </IconButton>
              <Tooltip
                title={isThemeDark ? "الوضع الفاتح" : "الوضع الليلي"}
                enterTouchDelay={400}
                placement="bottom"
              >
                <span>
                  <IconButton
                    onClick={toggleTheme}
                    aria-label={
                      isThemeDark
                        ? "التبديل إلى الوضع الفاتح"
                        : "التبديل إلى الوضع الليلي"
                    }
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: isMuiDark ? "rgba(255,255,255,0.1)" : "#EFEFED",
                      color: isMuiDark ? "common.white" : "#1F2A2A",
                      border: `1px solid ${isMuiDark ? "rgba(255,255,255,0.14)" : "rgba(31,61,53,0.08)"}`,
                      boxShadow: isMuiDark
                        ? "0 2px 12px rgba(0,0,0,0.35)"
                        : "0 2px 10px rgba(24,38,33,0.04)",
                      transition:
                        "background 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": {
                          bgcolor: isMuiDark
                            ? "rgba(255,255,255,0.16)"
                            : "#F6F6F4",
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  >
                    {isThemeDark ? (
                      <Sun size={18} strokeWidth={1.9} />
                    ) : (
                      <Moon size={18} strokeWidth={1.9} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            {(
              [
                {
                  label: "القفل",
                  icon:
                    isLocked && !isSessionUnlocked() ? (
                      <Lock size={18} />
                    ) : (
                      <LockOpen size={18} />
                    ),
                  action: () => setLockSettingsOpen(true),
                },
                {
                  label: "تسجيل الخروج",
                  icon: <LogOut size={18} />,
                  action: () => {
                    logout();
                    navigate("/login");
                  },
                },
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
                  bgcolor: isMuiDark ? "rgba(255,255,255,0.1)" : "#EFEFED",
                  color: isMuiDark ? "common.white" : "#1F2A2A",
                  border: `1px solid ${isMuiDark ? "rgba(255,255,255,0.14)" : "rgba(31,61,53,0.08)"}`,
                  boxShadow: isMuiDark
                    ? "0 2px 12px rgba(0,0,0,0.35)"
                    : "0 2px 10px rgba(24,38,33,0.04)",
                  transition:
                    "background 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  "@media (hover: hover) and (pointer: fine)": {
                    "&:hover": {
                      bgcolor: isMuiDark ? "rgba(255,255,255,0.16)" : "#F6F6F4",
                      transform: "translateY(-1px)",
                    },
                  },
                }}
              >
                {item.icon}
              </IconButton>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Box
            component="img"
            src={HOME_HERO_BANNER_SRC}
            alt="إطلالة — لوحة تحكم موحدة لعملائك والفواتير والمدفوعات"
            sx={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "24px",
              border: "1px solid",
              borderColor: alpha("#C8B27D", 0.12),
              boxShadow: isMuiDark
                ? "0 28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset"
                : "0 22px 50px rgba(4, 18, 14, 0.22)",
            }}
          />
        </Box>

        <Stack spacing={3.25} sx={{ width: 1, mt: 1.25 }} useFlexGap>
          {canAccess("stats") && (
            <Stack spacing={2.5} sx={{ width: 1 }} useFlexGap>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: 2.5,
                  overflow: "hidden",
                  position: "relative",
                  background: isMuiDark
                    ? "linear-gradient(180deg, #1E2620 0%, #1A211C 100%)"
                    : "linear-gradient(180deg, #FFFFFF 0%, #F9F9F6 100%)",
                  border: "none",
                  boxShadow: isMuiDark
                    ? "0 10px 36px rgba(0,0,0,0.35)"
                    : "0 10px 32px rgba(25, 34, 29, 0.08)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: 4,
                    height: "100%",
                    borderRadius: "0 22px 22px 0",
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
                  <Box sx={{ pr: 1, textAlign: "right" }}>
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.88rem",
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
                        display: "block",
                        textAlign: "right",
                        lineHeight: 1.2,
                      }}
                    >
                      <MoneyLine value={stats.netProfit} size="lg" />
                    </Box>
                  </Box>
                )}
              </Card>

              <Stack direction="row" spacing={2.5} sx={{ width: 1 }} useFlexGap>
                {(
                  [
                    {
                      key: "collected",
                      title: "المحصل",
                      value: stats.collectedAmount,
                      icon: (
                        <Wallet size={18} color="#fff" strokeWidth={1.85} />
                      ),
                    },
                    {
                      key: "expenses",
                      title: "المصروفات",
                      value: stats.expensesAmount,
                      icon: (
                        <CreditCard size={18} color="#fff" strokeWidth={1.85} />
                      ),
                    },
                  ] as const
                ).map((item) => (
                  <Card
                    key={item.key}
                    elevation={0}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      borderRadius: "20px",
                      p: 1.75,
                      overflow: "hidden",
                      position: "relative",
                      background: isMuiDark
                        ? "linear-gradient(165deg, #1C241E 0%, #181F1A 100%)"
                        : "linear-gradient(165deg, #FFFFFF 0%, #F6F5F0 100%)",
                      border: "none",
                      boxShadow: isMuiDark
                        ? "0 8px 28px rgba(0,0,0,0.32)"
                        : "0 8px 26px rgba(25, 34, 29, 0.08)",
                      textAlign: "right",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        boxShadow: isMuiDark
                          ? "0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 28px -8px rgba(0,0,0,0.5)"
                          : "0 1px 0 rgba(255,255,255,0.9) inset, 0 14px 28px -8px rgba(25,34,29,0.16)",
                      },
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
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            mb: 1.25,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.8rem",
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
                              display: "grid",
                              placeItems: "center",
                              background: `linear-gradient(145deg, ${COLORS.primary} 0%, ${COLORS.primary2} 100%)`,
                              boxShadow: "0 6px 16px rgba(31,61,53,0.24)",
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </Box>
                        </Box>
                        <Box
                          dir="rtl"
                          sx={{
                            textAlign: "right",
                            pr: 0.25,
                            lineHeight: 1.15,
                          }}
                        >
                          <MoneyLine value={item.value} size="md" />
                        </Box>
                      </Box>
                    )}
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}

          {user && !fundLoading && myCustodyFund && (
            <Card
              elevation={0}
              onClick={() => {
                if (canOpenFund) {
                  navigate("/fund");
                  return;
                }
                toast(
                  "للمتابعة التفصيلية في «صندوق العهدة» يلزم تفعيل هذه الصلاحية من إعدادات قفل التطبيق لحسابك.",
                  {
                    icon: "🔐",
                    duration: 4200,
                  },
                );
              }}
              sx={{
                borderRadius: "22px",
                p: 2.5,
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                background: isMuiDark
                  ? "linear-gradient(180deg, #1E2620 0%, #1A211C 100%)"
                  : "linear-gradient(180deg, #FFFFFF 0%, #F9F9F6 100%)",
                border: "none",
                boxShadow: isMuiDark
                  ? "0 12px 36px rgba(0,0,0,0.35)"
                  : "0 12px 32px rgba(25, 34, 29, 0.09)",
                transition: "box-shadow 0.2s ease",
                "@media (hover: hover) and (pointer: fine)": {
                  "&:hover": {
                    boxShadow: isMuiDark
                      ? "0 2px 0 rgba(255,255,255,0.05) inset, 0 16px 36px -6px rgba(0,0,0,0.5)"
                      : "0 2px 0 rgba(31,61,53,0.05) inset, 0 16px 36px -6px rgba(25,34,29,0.14)",
                    transform: "translateY(-1px)",
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: 4,
                  height: "100%",
                  borderRadius: "0 22px 22px 0",
                  background: `linear-gradient(180deg, ${alpha(COLORS.primary, 0.75)} 0%, ${alpha(COLORS.accent, 0.55)} 100%)`,
                },
              }}
            >
              <Box sx={{ pr: 1, textAlign: "right" }}>
                <Box
                  dir="rtl"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 1.25,
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      letterSpacing: 0.02,
                      lineHeight: 1.3,
                    }}
                  >
                    رصيد عهـدة صندوق العهـدة
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        opacity: 0.9,
                        mt: 0.35,
                      }}
                    >
                      {user?.displayName || "—"}
                    </Box>
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      background: `linear-gradient(145deg, ${alpha(COLORS.accent, 0.25)} 0%, ${alpha(COLORS.primary, 0.2)} 100%)`,
                      border: "none",
                      flexShrink: 0,
                      boxShadow: isMuiDark
                        ? "inset 0 1px 0 rgba(255,255,255,0.08)"
                        : "inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                  >
                    <Wallet
                      size={20}
                      color={theme.palette.primary.main}
                      strokeWidth={1.85}
                    />
                  </Box>
                </Box>
                <Box
                  dir="rtl"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    lineHeight: 1.2,
                  }}
                >
                  <CustodyMoneyLine value={myCustodyFund.remaining} size="lg" />
                </Box>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.72rem",
                    mt: 1.1,
                    fontWeight: 500,
                  }}
                >
                  {myCustodyFund.remaining >= 0
                    ? canOpenFund
                      ? "المتبقي لك بعد تخصيص مصروفاتك — اضغط للتفاصيل"
                      : "المتبقي لك بعد تخصيص مصروفاتك (عرض تفصيلي الصندوق يتطلب صلاحية)"
                    : canOpenFund
                      ? "عجز على عهدتك — اضغط لعرض التفاصيل في الصندوق"
                      : "عجز على عهدتك — اطلب من المسؤول تفعيل صلاحية صندوق العهدة للتفاصيل"}
                </Typography>
              </Box>
            </Card>
          )}

          {primaryMenuVisible.length > 0 && (
            <Box sx={{ width: 1 }}>
              <Box
                dir="rtl"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1.25,
                  px: 0.5,
                  mb: 1.75,
                }}
              >
                <Typography
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    fontSize: "1.35rem",
                    letterSpacing: 0.12,
                  }}
                >
                  القوائم الرئيسية
                </Typography>
                <Box
                  sx={{
                    width: 3,
                    height: 22,
                    borderRadius: 1.5,
                    bgcolor: alpha(COLORS.primary, isMuiDark ? 0.5 : 0.28),
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: 1.65,
                  background: menuListCardSurface,
                  border: "none",
                  boxShadow: isMuiDark
                    ? "0 12px 40px rgba(0,0,0,0.38)"
                    : "0 10px 36px rgba(31, 61, 53, 0.08)",
                }}
              >
                {renderMenuList(primaryMenuVisible)}
              </Card>
            </Box>
          )}

          {shortcutsMenuVisible.length > 0 && (
            <Box sx={{ width: 1 }}>
              <Box
                dir="rtl"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1.1,
                  px: 0.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    letterSpacing: 0.1,
                  }}
                >
                  اختصارات إضافية
                </Typography>
                <Box
                  sx={{
                    width: 3,
                    height: 18,
                    borderRadius: 1.5,
                    bgcolor: alpha(COLORS.accent, isMuiDark ? 0.55 : 0.4),
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: 1.65,
                  background: menuListCardSurface,
                  border: "none",
                  boxShadow: isMuiDark
                    ? "0 12px 40px rgba(0,0,0,0.38)"
                    : "0 10px 36px rgba(31, 61, 53, 0.08)",
                }}
              >
                {renderMenuList(shortcutsMenuVisible)}
              </Card>
            </Box>
          )}

          {primaryMenuVisible.length === 0 &&
            shortcutsMenuVisible.length === 0 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: 2.5,
                  bgcolor: "background.paper",
                  border: `1px dashed ${alpha(theme.palette.divider, 0.55)}`,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.92rem" }}
                >
                  لا تتوفر اختصارات لهذه الصلاحيات. اطلب من المسؤول تفعيل
                  الأقسام المطلوبة من إعدادات قفل التطبيق.
                </Typography>
              </Card>
            )}

          {canAccess("stats") && !isLoading && !stats.hasData && (
            <Card
              elevation={0}
              sx={{
                borderRadius: "22px",
                p: 2,
                bgcolor: "background.paper",
                border: `1px dashed ${alpha(theme.palette.divider, 0.55)}`,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ color: "text.primary", fontWeight: 700, mb: 0.4 }}
              >
                لا توجد بيانات مالية بعد
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
                سيتم تحديث صافي الأرباح والمصروفات والتحصيل تلقائياً بمجرد إضافة
                بيانات جديدة.
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 360 },
            maxWidth: "100vw",
            height: "100dvh",
            maxHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
            borderRadius: {
              xs: `${NOTIF_R.sheetTop} ${NOTIF_R.sheetTop} 0 0`,
              sm: 0,
            },
            borderLeft: {
              sm: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
            },
            boxShadow: isMuiDark
              ? "0 -8px 40px rgba(0,0,0,0.45)"
              : "0 -12px 48px rgba(31, 61, 53, 0.12)",
            pt: "max(8px, env(safe-area-inset-top, 0px))",
            background: isMuiDark
              ? "linear-gradient(165deg, #1c2420 0%, #141a17 48%, #0f1412 100%)"
              : "linear-gradient(180deg, #fbfbf9 0%, #f2f4f1 55%, #eef1ee 100%)",
            color: "text.primary",
          },
        }}
        ModalProps={{ keepMounted: false }}
      >
        {/* مقبض ورقة — مألوف على iOS */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "block", sm: "none" },
            width: 40,
            height: 5,
            borderRadius: NOTIF_R.handle,
            mx: "auto",
            mt: 0.5,
            mb: 0.25,
            flexShrink: 0,
            bgcolor: isMuiDark ? alpha("#fff", 0.12) : alpha("#1f3d35", 0.15),
          }}
        />
        <Box
          dir="rtl"
          sx={{
            flexShrink: 0,
            px: 2,
            pt: 1.35,
            pb: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.12 : 0.08)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: NOTIF_R.surface,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  background: isMuiDark
                    ? `linear-gradient(145deg, ${alpha(COLORS.accent, 0.22)} 0%, ${alpha(COLORS.primary, 0.35)} 100%)`
                    : `linear-gradient(145deg, ${alpha(COLORS.accent, 0.35)} 0%, ${alpha(COLORS.primary, 0.12)} 100%)`,
                  border: `1px solid ${alpha(COLORS.accent, isMuiDark ? 0.35 : 0.45)}`,
                  boxShadow: isMuiDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "0 4px 14px rgba(31, 61, 53, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <Bell
                  size={20}
                  color={isMuiDark ? COLORS.accent : COLORS.primaryDeep}
                  strokeWidth={2}
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.02em",
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  الإشعارات
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    mt: 0.35,
                    lineHeight: 1.45,
                    opacity: 0.92,
                  }}
                >
                  تحديثات العهدة والفريق والنشاط
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="مسح المعروض (لا يمس القفل ولا إخفاء الإحصائيات)">
              <span>
                <IconButton
                  size="small"
                  disabled={!canBulkClearNotifications}
                  onClick={() => {
                    const next = mergeDismissAfterClear(
                      visibleNotifications,
                      notifDismissMap,
                    );
                    saveDismissMap(next);
                    setNotifDismissMap(next);
                  }}
                  aria-label="مسح جميع الإشعارات المعروضة"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: NOTIF_R.surface,
                    bgcolor: canBulkClearNotifications
                      ? isMuiDark
                        ? alpha("#fff", 0.06)
                        : alpha(COLORS.primary, 0.06)
                      : "transparent",
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    color: canBulkClearNotifications
                      ? theme.palette.text.secondary
                      : theme.palette.action.disabled,
                    transition: "background 0.2s ease, transform 0.15s ease",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": {
                        bgcolor: isMuiDark
                          ? alpha("#fff", 0.1)
                          : alpha(COLORS.primary, 0.1),
                      },
                    },
                  }}
                >
                  <Trash2 size={18} strokeWidth={2} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.25,
            mx: 2,
            mb: 1,
            borderRadius: NOTIF_R.surface,
            border: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.14 : 0.1)}`,
            background: isMuiDark
              ? alpha("#fff", 0.04)
              : alpha("#fff", 0.72),
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: isMuiDark
              ? "none"
              : "0 4px 20px rgba(31, 61, 53, 0.06)",
          }}
        >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              {browserNotifPerm !== "granted" ? (
                <Button
                  variant="contained"
                  size="small"
                  disabled={notifPermLoading}
                  onClick={async () => {
                    setNotifPermLoading(true);
                    try {
                      if (!isWebNotificationSupported()) {
                        toast.error(
                          "لا يمكن طلب الإشعارات من هنا. استخدم رابطاً يبدأ بـ https، أو Chrome/Safari، وعلى آيفون أضف الموقع للشاشة الرئيسية.",
                        );
                        return;
                      }
                      if (Notification.permission === "denied") {
                        toast.error(
                          "الإشعارات محظورة لهذا الموقع. افتح إعدادات المتصفح أو الهاتف واسمح بالإشعارات ثم أعد المحاولة.",
                        );
                        return;
                      }
                      setPwaNotifEnabled(true);
                      setPwaNotificationsUserEnabled(true);

                      const r = await requestNotificationPermission();
                      setBrowserNotifPerm(r);

                      if (r !== "granted") {
                        if (r === "denied") {
                          toast.error("لم يُسمح بالإشعارات.");
                        } else {
                          toast("لم يُكمل طلب الإذن. يمكنك الضغط مرة أخرى.");
                        }
                        return;
                      }

                      if (!user?.id) {
                        toast.error("سجّل الدخول أولاً لتسجيل الجهاز.");
                        return;
                      }

                      const vapid = import.meta.env.VITE_FCM_VAPID_KEY;
                      if (!vapid || !String(vapid).trim()) {
                        toast.error(
                          "إشعارات الخلفية غير مهيأة على الخادم (مفتاح VAPID). أبلغ المطوّر لإضافة VITE_FCM_VAPID_KEY وإعادة النشر.",
                        );
                        return;
                      }

                      const ok = await registerDeviceForFcmPush(user.id, true);
                      if (ok) {
                        toast.success("تم تفعيل التنبيهات وتسجيل هذا الجهاز.");
                      } else {
                        toast.error(
                          "تعذّر تسجيل الجهاز. أعد تحميل الصفحة، أو تحقق من الاتصال وملف firebase-messaging-sw.js.",
                        );
                      }
                    } finally {
                      setNotifPermLoading(false);
                    }
                  }}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 0.6,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: NOTIF_R.control,
                    boxShadow: "0 4px 14px rgba(31, 61, 53, 0.2)",
                    bgcolor: COLORS.primary,
                    "&:hover": { bgcolor: COLORS.primaryDeep },
                  }}
                  startIcon={
                    notifPermLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : undefined
                  }
                >
                  تفعيل تنبيهات الجهاز
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: NOTIF_R.control,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.25)}`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "success.dark",
                    }}
                  >
                    التنبيهات مفعّلة
                  </Typography>
                </Box>
              )}
              <FormControlLabel
                sx={{ mr: 0, ml: 0, gap: 0.75 }}
                control={
                  <Switch
                    size="small"
                    checked={pwaNotifEnabled}
                    onChange={(_, c) => {
                      setPwaNotifEnabled(c);
                      setPwaNotificationsUserEnabled(c);
                      if (c && user?.id) void registerDeviceForFcmPush(user.id, true);
                    }}
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                    وضع الخلفية
                  </Typography>
                }
              />
            </Stack>
        </Box>
        <Box
          component="div"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            touchAction: "pan-y",
            px: 2,
            pt: 0.5,
            pb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              mb: 1.25,
              opacity: 0.85,
            }}
          >
            اليوم
          </Typography>
          <Stack spacing={1.15} sx={{ pb: 1 }}>
            {visibleNotifications.map((n) => {
              const kindStyles = {
                urgent: {
                  cardBg: isMuiDark
                    ? alpha("#ef5350", 0.1)
                    : alpha("#ffebee", 0.95),
                  cardBorder: alpha("#c62828", isMuiDark ? 0.35 : 0.22),
                  iconBg: alpha("#c62828", isMuiDark ? 0.2 : 0.12),
                  iconColor: "#c62828",
                  bar: "linear-gradient(180deg, #e53935 0%, #b71c1c 100%)",
                },
                info: {
                  cardBg: isMuiDark
                    ? alpha(COLORS.accent, 0.08)
                    : alpha("#f5f3ef", 0.98),
                  cardBorder: alpha(COLORS.primary, isMuiDark ? 0.22 : 0.12),
                  iconBg: alpha(COLORS.primary, isMuiDark ? 0.28 : 0.1),
                  iconColor: isMuiDark ? COLORS.accent : COLORS.primaryDeep,
                  bar: `linear-gradient(180deg, ${COLORS.accent} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
                },
                success: {
                  cardBg: isMuiDark
                    ? alpha("#66bb6a", 0.1)
                    : alpha("#e8f5e9", 0.92),
                  cardBorder: alpha("#2e7d32", isMuiDark ? 0.35 : 0.2),
                  iconBg: alpha("#2e7d32", isMuiDark ? 0.22 : 0.12),
                  iconColor: "#2e7d32",
                  bar: "linear-gradient(180deg, #43a047 0%, #2e7d32 100%)",
                },
                lock: {
                  cardBg: isMuiDark
                    ? alpha("#7986cb", 0.12)
                    : alpha("#e8eaf6", 0.95),
                  cardBorder: alpha("#3949ab", isMuiDark ? 0.35 : 0.2),
                  iconBg: alpha("#3949ab", isMuiDark ? 0.22 : 0.12),
                  iconColor: "#3949ab",
                  bar: "linear-gradient(180deg, #5c6bc0 0%, #3949ab 100%)",
                },
                team: {
                  cardBg: isMuiDark
                    ? alpha(COLORS.accent, 0.12)
                    : alpha("#faf8f3", 0.98),
                  cardBorder: alpha(COLORS.accent, isMuiDark ? 0.4 : 0.35),
                  iconBg: alpha(COLORS.accent, isMuiDark ? 0.22 : 0.18),
                  iconColor: isMuiDark ? COLORS.accent : "#7d6a44",
                  bar: `linear-gradient(180deg, ${COLORS.accent} 0%, ${alpha("#8d7b52", 0.9)} 100%)`,
                },
                activity: {
                  cardBg: isMuiDark
                    ? alpha("#5c6bc0", 0.12)
                    : alpha("#eef2ff", 0.95),
                  cardBorder: alpha("#4361ee", isMuiDark ? 0.35 : 0.18),
                  iconBg: alpha("#4361ee", isMuiDark ? 0.2 : 0.1),
                  iconColor: "#4361ee",
                  bar: "linear-gradient(180deg, #5c6bc0 0%, #3949ab 100%)",
                },
              } as const;
              const s = kindStyles[n.kind] ?? kindStyles.info;
              const leftIcon =
                n.kind === "urgent" ? (
                  <AlertTriangle size={18} color={s.iconColor} strokeWidth={2} />
                ) : n.kind === "success" ? (
                  <CheckCircle2 size={18} color={s.iconColor} strokeWidth={2} />
                ) : n.kind === "lock" ? (
                  <Shield size={18} color={s.iconColor} strokeWidth={2} />
                ) : n.kind === "team" ? (
                  <Users size={18} color={s.iconColor} strokeWidth={2} />
                ) : n.kind === "activity" ? (
                  <Sparkles size={18} color={s.iconColor} strokeWidth={2} />
                ) : (
                  <Sparkles
                    size={18}
                    color={s.iconColor}
                    strokeWidth={2}
                  />
                );
              return (
                <Box
                  key={n.id}
                  sx={{
                    position: "relative",
                    pl: 1.25,
                    pr: 1.35,
                    py: 1.35,
                    borderRadius: NOTIF_R.surface,
                    bgcolor: s.cardBg,
                    border: `1px solid ${s.cardBorder}`,
                    overflow: "hidden",
                    boxShadow: isMuiDark
                      ? "0 1px 4px rgba(0,0,0,0.28)"
                      : "0 1px 3px rgba(31, 61, 53, 0.08), 0 8px 24px rgba(31, 61, 53, 0.04)",
                    transition:
                      "box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      insetInlineStart: 0,
                      top: 12,
                      bottom: 12,
                      width: 3,
                      borderRadius: `0 ${NOTIF_R.meta} ${NOTIF_R.meta} 0`,
                      background: s.bar,
                      opacity: n.kind === "info" && n.id === "all-clear" ? 0.45 : 1,
                    },
                  }}
                >
                  <Stack direction="row" gap={1.25} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: NOTIF_R.control,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: s.iconBg,
                        border: `1px solid ${alpha(s.iconColor, 0.15)}`,
                      }}
                    >
                      {leftIcon}
                    </Box>
                    <Box sx={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.8125rem",
                          color: "text.primary",
                          lineHeight: 1.35,
                          letterSpacing: "-0.01em",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {n.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "text.secondary",
                          mt: 0.5,
                          lineHeight: 1.55,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          opacity: 0.95,
                        }}
                      >
                        {n.body}
                      </Typography>
                      {n.at && (
                        <Typography
                          component="span"
                          sx={{
                            display: "inline-block",
                            mt: 0.75,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            px: 1,
                            py: 0.25,
                            borderRadius: NOTIF_R.meta,
                            bgcolor: isMuiDark
                              ? alpha("#fff", 0.06)
                              : alpha(COLORS.primary, 0.06),
                          }}
                        >
                          {dayjs(n.at).fromNow()}
                        </Typography>
                      )}
                      {n.id === "custody-deficit-self" && canOpenFund && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate("/fund");
                          }}
                          sx={{
                            mt: 1.15,
                            py: 0.85,
                            minHeight: 44,
                            fontSize: "0.8rem",
                            borderRadius: NOTIF_R.control,
                            textTransform: "none",
                            fontWeight: 800,
                            bgcolor: COLORS.primary,
                            boxShadow: `0 6px 20px ${alpha(COLORS.primary, 0.35)}`,
                            "&:hover": {
                              bgcolor: COLORS.primaryDeep,
                              boxShadow: `0 8px 24px ${alpha(COLORS.primary, 0.4)}`,
                            },
                          }}
                        >
                          فتح صندوق العهدة
                        </Button>
                      )}
                      {n.actionPath &&
                        n.id !== "custody-deficit-self" &&
                        n.actionLabel && (
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate(n.actionPath!);
                            }}
                            sx={{
                              mt: 1,
                              py: 0.75,
                              minHeight: 42,
                              fontSize: "0.78rem",
                              borderRadius: NOTIF_R.control,
                              textTransform: "none",
                              fontWeight: 800,
                              borderWidth: 1.5,
                              borderColor: alpha(COLORS.primary, 0.35),
                              color: isMuiDark ? COLORS.accent : COLORS.primaryDeep,
                              "&:hover": {
                                borderWidth: 1.5,
                                borderColor: COLORS.primary,
                                bgcolor: alpha(COLORS.primary, 0.06),
                              },
                            }}
                          >
                            {n.actionLabel}
                          </Button>
                        )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            pt: 1,
            pb: "calc(14px + env(safe-area-inset-bottom, 0px))",
            borderTop: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.12 : 0.08)}`,
            background: isMuiDark
              ? alpha("#000", 0.2)
              : alpha("#fff", 0.55),
            backdropFilter: "blur(10px)",
          }}
        >
          <Button
            fullWidth
            onClick={() => setNotifOpen(false)}
            sx={{
              py: 1.1,
              borderRadius: NOTIF_R.control,
              fontWeight: 800,
              fontSize: "0.84rem",
              textTransform: "none",
              color: isMuiDark ? alpha("#fff", 0.88) : COLORS.primaryDeep,
              bgcolor: isMuiDark
                ? alpha("#fff", 0.08)
                : alpha(COLORS.primary, 0.08),
              border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
              "&:hover": {
                bgcolor: isMuiDark
                  ? alpha("#fff", 0.12)
                  : alpha(COLORS.primary, 0.12),
              },
            }}
          >
            إغلاق اللوحة
          </Button>
        </Box>
      </Drawer>

      <AppLockSettingsDialog
        open={lockSettingsOpen}
        onClose={() => setLockSettingsOpen(false)}
      />
    </Box>
  );
};
