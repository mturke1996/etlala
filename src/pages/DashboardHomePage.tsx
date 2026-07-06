import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  CreditCard,
  FileText,
  Home,
  Lock,
  LockOpen,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Receipt,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  UserCog,
  Users,
  Wallet,
  X,
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
  NOTIFICATION_IDS_EXCLUDED_FROM_CLEAR,
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
  background: "#F8F8F8",
  accent: "#C4AE72",
  text: "#2A2E2C",
  muted: "#6E756F",
  /** DESIGN.md success — محصّل / مكاسب */
  success: "#0d9668",
  successDeep: "#0a7a56",
  /** مصروفات — لون دافئ مميز */
  expense: "#8b5a2b",
  expenseDeep: "#5c3d1f",
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

type NotificationFilter = "all" | "urgent" | "team" | "activity";

/** هيرو الصفحة الرئيسية — `public/hero-main.png` (الهيرو الجديد) */
const HOME_HERO_SRC = "/hero-main.png";

const numberFormatter = new Intl.NumberFormat("ar-LY-u-nu-latn", {
  maximumFractionDigits: 0,
});

const percentDisplayFormatter = new Intl.NumberFormat("ar-LY-u-nu-latn", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const FINANCIAL_NUMBER_FONT = '"Sora","Montserrat","Outfit","Inter",sans-serif';
const FINANCIAL_NUMBER_SX = {
  fontFamily: FINANCIAL_NUMBER_FONT,
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
} as const;

/**
 * في بطاقة RTL: عرض المبلغ ككتلة ltr — «د.ل» يسار الأرقام (لاصقة بجانب المبلغ من ناحية الوسط/النهاية)،
 * وليست تُقرأ «قبل» الأرقام في جملة ltr.
 */
const MoneyLine = ({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) => {
  const raw = numberFormatter.format(Math.round(value || 0));
  const fs = size === "lg"
    ? "clamp(1.18rem, 5.9vw, 1.64rem)"
    : size === "md"
      ? "clamp(0.96rem, 4.1vw, 1.12rem)"
      : "clamp(0.88rem, 3.4vw, 1rem)";
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "baseline",
        gap: 0.52,
        maxWidth: "100%",
        fontStyle: "normal",
        unicodeBidi: "embed",
      }}
    >
      <Box
        component="span"
        sx={{
          color: "text.secondary",
          fontWeight: 650,
          fontSize:
            size === "lg"
              ? "0.68rem"
              : size === "md"
                ? "0.64rem"
                : "0.62rem",
          lineHeight: 1,
          whiteSpace: "nowrap",
          letterSpacing: 0.08,
          ...FINANCIAL_NUMBER_SX,
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
          letterSpacing: "0.01em",
          ...FINANCIAL_NUMBER_SX,
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
  size?: "sm" | "md" | "lg";
}) => {
  const neg = value < 0;
  const raw = numberFormatter.format(Math.round(Math.abs(value || 0)));
  const fs = size === "lg"
    ? "clamp(1.18rem, 5.9vw, 1.64rem)"
    : size === "md"
      ? "clamp(0.96rem, 4.1vw, 1.12rem)"
      : "clamp(0.88rem, 3.4vw, 1rem)";
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "baseline",
        gap: 0.52,
        maxWidth: "100%",
        fontStyle: "normal",
        unicodeBidi: "embed",
      }}
    >
      <Box
        component="span"
        sx={{
          color: "text.secondary",
          fontWeight: 650,
          fontSize:
            size === "lg"
              ? "0.68rem"
              : size === "md"
                ? "0.64rem"
                : "0.62rem",
          lineHeight: 1,
          whiteSpace: "nowrap",
          letterSpacing: 0.08,
          ...FINANCIAL_NUMBER_SX,
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
          letterSpacing: "0.01em",
          ...FINANCIAL_NUMBER_SX,
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
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [pwaNotifEnabled, setPwaNotifEnabled] = useState(() =>
    getPwaNotificationsUserEnabled(),
  );
  const [browserNotifPerm, setBrowserNotifPerm] = useState(() =>
    getNotificationPermission(),
  );
  const [notifPermLoading, setNotifPermLoading] = useState(false);
  const [notifDismissMap, setNotifDismissMap] = useState(loadDismissMap);
  const [notifFilter, setNotifFilter] = useState<NotificationFilter>("all");
  const reduceMotion = useReducedMotion();

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

  useEffect(() => {
    if (!notifOpen) setNotifFilter("all");
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

  const notifKindCounts = useMemo(
    () => ({
      all: visibleNotifications.filter((n) => n.id !== "all-clear").length,
      urgent: visibleNotifications.filter((n) => n.kind === "urgent").length,
      team: visibleNotifications.filter((n) => n.kind === "team").length,
      activity: visibleNotifications.filter((n) => n.kind === "activity").length,
    }),
    [visibleNotifications],
  );

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "all") return visibleNotifications;

    const filtered = visibleNotifications.filter((n) => {
      if (n.id === "all-clear") return false;
      if (notifFilter === "urgent") return n.kind === "urgent";
      if (notifFilter === "team") return n.kind === "team";
      return n.kind === "activity";
    });

    if (filtered.length > 0) return filtered;

    const emptyTitle =
      notifFilter === "urgent"
        ? "لا يوجد تنبيه عاجل الآن"
        : notifFilter === "team"
          ? "لا يوجد تنبيه فريق الآن"
          : "لا يوجد نشاط حديث الآن";

    return [
      {
        id: `empty-${notifFilter}`,
        kind: "info",
        title: emptyTitle,
        body: "أي تحديث جديد سيظهر هنا تلقائياً.",
      } satisfies AppNotificationItem,
    ];
  }, [notifFilter, visibleNotifications]);

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
    const netMarginPercent =
      collectedAmount > 0 ? (netProfit / collectedAmount) * 100 : null;
    const hasData =
      clients.length > 0 || payments.length > 0 || expenses.length > 0;

    /** مقارنة الشهر الحالي بالشهر الماضي (لشارة «عن الشهر الماضي») */
    const monthStart = dayjs().startOf("month");
    const prevMonthStart = monthStart.subtract(1, "month");
    const sumInMonth = (
      rows: { amount?: number }[],
      dates: (string | undefined)[],
      start: dayjs.Dayjs,
    ) =>
      rows.reduce((sum, item, i) => {
        const d = dates[i] ? dayjs(dates[i]) : null;
        if (d && d.isValid() && d.isAfter(start.subtract(1, "millisecond")) && d.isBefore(start.add(1, "month"))) {
          return sum + (item.amount || 0);
        }
        return sum;
      }, 0);
    const pctChange = (curr: number, prev: number) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : null;

    const paymentDates = payments.map((p: any) => p.paymentDate || p.createdAt);
    const expenseDates = expenses.map((e: any) => e.date || e.createdAt);
    const collectedTrend = pctChange(
      sumInMonth(payments, paymentDates, monthStart),
      sumInMonth(payments, paymentDates, prevMonthStart),
    );
    const expensesTrend = pctChange(
      sumInMonth(expenses, expenseDates, monthStart),
      sumInMonth(expenses, expenseDates, prevMonthStart),
    );

    return {
      collectedAmount,
      expensesAmount,
      netProfit,
      netMarginPercent,
      hasData,
      clientsCount: clients.length,
      collectedTrend,
      expensesTrend,
    };
  }, [clients.length, expenses, payments]);

  const allMenusVisible = useMemo(
    () => [...primaryMenuVisible, ...shortcutsMenuVisible],
    [primaryMenuVisible, shortcutsMenuVisible],
  );

  /** مجموعة قوائم عمودية موحّدة — مظهر نظيف بدون خطوط زخرفية جانبية */
  const renderMenuGroup = (menu: MenuItem[]) => (
    <Box
      sx={{
        borderRadius: "20px",
        p: 0.6,
        display: "grid",
        gap: 0.55,
        bgcolor: isMuiDark ? alpha("#fff", 0.04) : "#FFFFFF",
        border: `1px solid ${isMuiDark ? alpha("#fff", 0.07) : "rgba(31, 37, 33, 0.06)"}`,
        boxShadow: isMuiDark
          ? "0 4px 24px rgba(0,0,0,0.26)"
          : "0 1px 2px rgba(31, 37, 33, 0.04), 0 8px 28px rgba(31, 37, 33, 0.05)",
      }}
    >
      {menu.map((item) => {
        const Icon = item.icon;
        const p = theme.palette;
        return (
          <Box
            key={item.path}
            component={motion.div}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            onClick={() => navigate(item.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(item.path);
              }
            }}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.25,
              px: 1.35,
              py: 1.15,
              minHeight: 58,
              borderRadius: "14px",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              border: `1px solid ${isMuiDark ? alpha("#fff", 0.06) : alpha(COLORS.primary, 0.06)}`,
              backgroundColor: isMuiDark ? alpha("#fff", 0.02) : alpha("#fff", 0.74),
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": {
                  bgcolor: isMuiDark
                    ? alpha("#fff", 0.04)
                    : alpha(COLORS.primary, 0.03),
                },
              },
              "&:active": {
                bgcolor: isMuiDark
                  ? alpha("#fff", 0.06)
                  : alpha(COLORS.primary, 0.05),
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  background: isMuiDark
                    ? `linear-gradient(145deg, ${alpha(COLORS.accent, 0.14)} 0%, ${alpha("#fff", 0.06)} 100%)`
                    : `linear-gradient(145deg, ${alpha(p.primary.main, 0.09)} 0%, ${alpha(COLORS.accent, 0.13)} 100%)`,
                  boxShadow: isMuiDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <Icon size={18} color={p.primary.main} strokeWidth={1.9} />
              </Box>
              <Box sx={{ textAlign: "right", minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    mt: 0.15,
                  }}
                >
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>
            <ChevronLeft
              size={16}
              color={p.text.disabled as string}
              style={{ flexShrink: 0 }}
            />
          </Box>
        );
      })}
    </Box>
  );

  const renderMenuSection = (title: string, menu: MenuItem[]) => (
    <Box sx={{ width: 1 }}>
      <Typography
        sx={{
          color: "text.primary",
          fontWeight: 750,
          fontSize: "1.02rem",
          letterSpacing: 0.05,
          px: 0.45,
          mb: 1.25,
        }}
      >
        {title}
      </Typography>
      {renderMenuGroup(menu)}
    </Box>
  );

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        /* أبيض نظيف — iOS clean background */
        background: isMuiDark
          ? "linear-gradient(180deg, #141916 0%, #0F1310 45%, #121814 100%)"
          : COLORS.background,
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
              minWidth: 0,
              flex: 1,
            }}
          >
            <IconButton
              onClick={() => setSideMenuOpen(true)}
              aria-label="القائمة الجانبية"
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                bgcolor: isMuiDark
                  ? alpha("#fff", 0.08)
                  : alpha("#1F2521", 0.05),
                color: isMuiDark ? "common.white" : "#242B26",
                border: `1px solid ${isMuiDark ? alpha("#fff", 0.1) : alpha("#1F2521", 0.055)}`,
                boxShadow: "none",
                flexShrink: 0,
                "@media (hover: hover) and (pointer: fine)": {
                  "&:hover": {
                    bgcolor: isMuiDark
                      ? alpha("#fff", 0.13)
                      : alpha("#1F2521", 0.08),
                  },
                },
              }}
            >
              <MenuIcon size={20} strokeWidth={1.9} />
            </IconButton>
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: isMuiDark ? "primary.dark" : "#26332B",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  border: isMuiDark
                    ? "2px solid rgba(255,255,255,0.18)"
                    : "2px solid #fff",
                  boxShadow: isMuiDark
                    ? "0 4px 12px rgba(0,0,0,0.35)"
                    : "0 4px 12px rgba(31,61,53,0.14)",
                }}
              >
                {(user?.displayName || "محمد").charAt(0)}
              </Avatar>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  bottom: 1,
                  left: 1,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: COLORS.success,
                  border: `2.5px solid ${isMuiDark ? "#141916" : "#FFFFFF"}`,
                }}
              />
            </Box>
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
                noWrap
                sx={{
                  color: "text.primary",
                  fontSize: "0.98rem",
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
            spacing={{ xs: 1.25, sm: 1.5 }}
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
                gap: { xs: 1.25, sm: 1.5 },
              }}
            >
              <IconButton
                onClick={() => setNotifOpen(true)}
                aria-label="الإشعارات"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  bgcolor: isMuiDark
                    ? alpha("#fff", 0.08)
                    : alpha("#1F2521", 0.05),
                  color: isMuiDark ? "common.white" : "#242B26",
                  border: `1px solid ${
                    urgentNotifCount > 0
                      ? "rgba(198,40,40,0.35)"
                      : isMuiDark
                        ? alpha("#fff", 0.1)
                        : alpha("#1F2521", 0.055)
                  }`,
                  boxShadow: "none",
                  "@media (hover: hover) and (pointer: fine)": {
                    "&:hover": {
                      bgcolor: isMuiDark
                        ? alpha("#fff", 0.13)
                        : alpha("#1F2521", 0.08),
                    },
                  },
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
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      bgcolor: isMuiDark
                        ? alpha("#fff", 0.08)
                        : alpha("#1F2521", 0.05),
                      color: isMuiDark ? "common.white" : "#242B26",
                      border: `1px solid ${isMuiDark ? alpha("#fff", 0.1) : alpha("#1F2521", 0.055)}`,
                      boxShadow: "none",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": {
                          bgcolor: isMuiDark
                            ? alpha("#fff", 0.13)
                            : alpha("#1F2521", 0.08),
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
          </Stack>
        </Box>

        <Box
          component={motion.div}
          sx={{ mb: 3.35, mx: { xs: -1.2, sm: -0.95 } }}
          initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.55,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          {/* هيرو — الصورة كاملة بنسبتها الأصلية بلا قصّ ولا تغطية تعتيم (أقصى وضوح للنص) */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "1024 / 780",
              borderRadius: "26px",
              overflow: "hidden",
              isolation: "isolate",
              border: "1px solid",
              borderColor: isMuiDark
                ? alpha("#C8B27D", 0.16)
                : alpha(COLORS.primary, 0.08),
              boxShadow: isMuiDark
                ? "0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 14px 30px rgba(31, 61, 53, 0.13), 0 2px 8px rgba(31, 61, 53, 0.05)",
              backgroundColor: isMuiDark ? "#161C17" : "#EDF2F6",
            }}
          >
            <Box
              component="img"
              src={HOME_HERO_SRC}
              alt="إطلالة للخدمات الهندسية — نحو هندسة معمارية تلهم المستقبل: تصميم، إشراف، تنفيذ"
              fetchPriority="high"
              decoding="async"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                userSelect: "none",
                imageRendering: "auto",
                filter: "contrast(1.04) saturate(1.02)",
              }}
              draggable={false}
            />
          </Box>
        </Box>

        <Stack spacing={3} sx={{ width: 1, mt: 1 }} useFlexGap>
          {canAccess("stats") && (
            <Stack spacing={1.5} sx={{ width: 1 }} useFlexGap>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  p: 2.15,
                  pb: 2.5,
                  overflow: "hidden",
                  position: "relative",
                  background: isMuiDark
                    ? "linear-gradient(180deg, #1D251F 0%, #181F1A 100%)"
                    : "#FFFFFF",
                  border: isMuiDark
                    ? `1px solid ${alpha("#fff", 0.06)}`
                    : `1px solid ${alpha(COLORS.primary, 0.07)}`,
                  boxShadow: isMuiDark
                    ? "0 10px 36px rgba(0,0,0,0.35)"
                    : "0 1px 2px rgba(25, 34, 29, 0.03), 0 8px 26px rgba(25, 34, 29, 0.05)",
                }}
              >
                {isLoading ? (
                  <Box sx={{ pr: 0.5, position: "relative", zIndex: 1 }}>
                    <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" width={200} height={40} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      pr: 0.35,
                      textAlign: "right",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Box
                      dir="rtl"
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        mb: 0.9,
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            mb: 0.25,
                            letterSpacing: 0.02,
                          }}
                        >
                          صافي المحصّل
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "text.secondary",
                            opacity: 0.9,
                            fontWeight: 560,
                            fontSize: "0.67rem",
                            letterSpacing: 0.02,
                          }}
                        >
                          المحصّل ناقص المصروفات
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "11px",
                          display: "grid",
                          placeItems: "center",
                          background: isMuiDark
                            ? alpha(COLORS.accent, 0.2)
                            : alpha(COLORS.accent, 0.22),
                          border: `1px solid ${alpha(COLORS.accent, isMuiDark ? 0.28 : 0.32)}`,
                          flexShrink: 0,
                        }}
                      >
                        <CircleDollarSign
                          size={17}
                          color={isMuiDark ? COLORS.accent : COLORS.primaryDeep}
                          strokeWidth={1.9}
                        />
                      </Box>
                    </Box>
                    <Box
                      component={motion.div}
                      dir="rtl"
                      initial={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, y: 12, filter: "blur(6px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                      }
                      sx={{
                        display: "block",
                        textAlign: "right",
                        lineHeight: 1.2,
                      }}
                    >
                      <CustodyMoneyLine value={stats.netProfit} size="md" />
                    </Box>
                    {stats.netMarginPercent !== null ? (
                      <Box
                        component={motion.div}
                        initial={reduceMotion ? undefined : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: reduceMotion ? 0 : 0.2,
                          duration: 0.4,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.95,
                            mb: 0,
                            display: "block",
                            color: "text.secondary",
                            fontWeight: 700,
                            fontSize: "0.67rem",
                            letterSpacing: 0.02,
                            ...FINANCIAL_NUMBER_SX,
                          }}
                        >
                          هامش من المحصّل:{" "}
                          {stats.netMarginPercent < 0 ? "−" : ""}
                          {percentDisplayFormatter.format(
                            Math.abs(stats.netMarginPercent),
                          )}
                          %
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                )}
              </Card>

              <Stack direction="row" spacing={1.35} sx={{ width: 1 }} useFlexGap>
                {(
                  [
                    {
                      key: "collected",
                      title: "المحصل",
                      value: stats.collectedAmount,
                      trend: stats.collectedTrend,
                      trendColor: COLORS.success,
                      iconBg: `linear-gradient(145deg, ${COLORS.success} 0%, ${COLORS.successDeep} 100%)`,
                      iconShadow: `0 8px 22px ${alpha(COLORS.success, 0.35)}`,
                      icon: (
                        <Wallet size={17} color="#fff" strokeWidth={1.9} />
                      ),
                    },
                    {
                      key: "expenses",
                      title: "المصروفات",
                      value: stats.expensesAmount,
                      trend: stats.expensesTrend,
                      trendColor: COLORS.expense,
                      iconBg: `linear-gradient(145deg, ${COLORS.expense} 0%, ${COLORS.expenseDeep} 100%)`,
                      iconShadow: `0 8px 22px ${alpha(COLORS.expense, 0.28)}`,
                      icon: (
                        <CreditCard
                          size={17}
                          color="#fff"
                          strokeWidth={1.9}
                        />
                      ),
                    },
                  ] as const
                ).map((item, itemIdx) => (
                  <Box
                    key={item.key}
                    component={motion.div}
                    initial={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, y: 16, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            delay: 0.06 + itemIdx * 0.07,
                            duration: 0.48,
                            ease: [0.2, 0.8, 0.2, 1],
                          }
                    }
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: "20px",
                        p: 1.55,
                        overflow: "hidden",
                        position: "relative",
                        background: isMuiDark
                          ? "linear-gradient(165deg, #1D251F 0%, #181F1A 100%)"
                          : "#FFFFFF",
                        border: isMuiDark
                          ? `1px solid ${alpha("#fff", 0.06)}`
                          : `1px solid ${alpha(COLORS.primary, 0.07)}`,
                        boxShadow: isMuiDark
                          ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 32px rgba(0,0,0,0.34)"
                          : "0 1px 0 rgba(255,255,255,0.92) inset, 0 1px 2px rgba(25, 34, 29, 0.03), 0 8px 24px rgba(25, 34, 29, 0.05)",
                        textAlign: "right",
                        transition:
                          "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: isMuiDark
                              ? "0 1px 0 rgba(255,255,255,0.07) inset, 0 18px 36px -10px rgba(0,0,0,0.55)"
                              : "0 1px 0 rgba(255,255,255,1) inset, 0 18px 36px -10px rgba(25,34,29,0.14)",
                          },
                        },
                      }}
                    >
                      {isLoading ? (
                        <Stack spacing={1}>
                          <Skeleton variant="rounded" width={44} height={44} />
                          <Skeleton variant="text" width="55%" />
                          <Skeleton variant="text" width="80%" height={32} />
                        </Stack>
                      ) : (
                        <Box sx={{ position: "relative", zIndex: 1 }}>
                          <Box
                            dir="rtl"
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              mb: 1.05,
                            }}
                          >
                            <Typography
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.76rem",
                                fontWeight: 760,
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
                                borderRadius: "12px",
                                display: "grid",
                                placeItems: "center",
                                background: item.iconBg,
                                boxShadow: `${item.iconShadow}, 0 1px 0 rgba(255,255,255,0.22) inset`,
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
                            <MoneyLine value={item.value} size="sm" />
                          </Box>
                          {item.trend !== null &&
                          Number.isFinite(item.trend) ? (
                            <Box
                              dir="rtl"
                              sx={{
                                mt: 1.25,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 0.75,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                noWrap
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.6rem",
                                  fontWeight: 600,
                                  minWidth: 0,
                                }}
                              >
                                عن الشهر الماضي
                              </Typography>
                              <Box
                                dir="ltr"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.35,
                                  px: 0.85,
                                  py: 0.35,
                                  borderRadius: "999px",
                                  flexShrink: 0,
                                  bgcolor: alpha(
                                    item.trendColor,
                                    isMuiDark ? 0.2 : 0.12,
                                  ),
                                  border: `1px solid ${alpha(item.trendColor, 0.25)}`,
                                }}
                              >
                                {item.trend >= 0 ? (
                                  <ArrowUpRight
                                    size={12}
                                    strokeWidth={2.4}
                                    color={
                                      isMuiDark
                                        ? alpha(item.trendColor, 0.95)
                                        : item.trendColor
                                    }
                                  />
                                ) : (
                                  <ArrowDownRight
                                    size={12}
                                    strokeWidth={2.4}
                                    color={
                                      isMuiDark
                                        ? alpha(item.trendColor, 0.95)
                                        : item.trendColor
                                    }
                                  />
                                )}
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: "0.62rem",
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    color: isMuiDark
                                      ? alpha(item.trendColor, 0.95)
                                      : item.trendColor,
                                    ...FINANCIAL_NUMBER_SX,
                                  }}
                                >
                                  {percentDisplayFormatter.format(
                                    Math.min(Math.abs(item.trend), 999),
                                  )}
                                  %
                                </Typography>
                              </Box>
                            </Box>
                          ) : null}
                        </Box>
                      )}
                    </Card>
                  </Box>
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

          {allMenusVisible.length > 0 &&
            renderMenuSection("القوائم", allMenusVisible)}

          {allMenusVisible.length === 0 && (
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
                سيتم تحديث صافي النسبة والمصروفات والتحصيل تلقائياً بمجرد إضافة
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
            width: { xs: "100%", sm: 392 },
            maxWidth: "100vw",
            height: "100dvh",
            maxHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
            borderRadius: {
              xs: `${NOTIF_R.sheetTop} ${NOTIF_R.sheetTop} 0 0`,
              sm: "22px 0 0 22px",
            },
            borderLeft: {
              sm: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            },
            boxShadow: isMuiDark
              ? "0 -6px 36px rgba(0,0,0,0.52)"
              : "0 -14px 52px rgba(31, 61, 53, 0.14)",
            pt: "max(8px, env(safe-area-inset-top, 0px))",
            background: isMuiDark
              ? "linear-gradient(168deg, #1a221e 0%, #141a17 54%, #0f1412 100%)"
              : "linear-gradient(180deg, #fdfdfb 0%, #f5f6f3 58%, #f0f3ef 100%)",
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
            pt: 1.15,
            pb: 1.4,
            borderBottom: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.15 : 0.1)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1.25}
          >
            <Stack direction="row" alignItems="center" gap={1.15} sx={{ minWidth: 0 }}>
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
                  size={19}
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
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.35 }}>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "text.secondary",
                      lineHeight: 1.45,
                      opacity: 0.92,
                    }}
                  >
                    تحديثات العهدة والفريق والنشاط
                  </Typography>
                  {relevantNotifCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 99,
                        bgcolor:
                          urgentNotifCount > 0
                            ? alpha(theme.palette.error.main, isMuiDark ? 0.24 : 0.14)
                            : alpha(COLORS.primary, isMuiDark ? 0.22 : 0.1),
                        border: `1px solid ${
                          urgentNotifCount > 0
                            ? alpha(theme.palette.error.main, 0.35)
                            : alpha(COLORS.primary, 0.22)
                        }`,
                        color:
                          urgentNotifCount > 0
                            ? theme.palette.error.main
                            : isMuiDark
                              ? COLORS.accent
                              : COLORS.primaryDeep,
                        fontSize: "0.66rem",
                        fontWeight: 800,
                        lineHeight: 1.2,
                        fontFamily: FINANCIAL_NUMBER_FONT,
                      }}
                    >
                      {numberFormatter.format(relevantNotifCount)}
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setNotifOpen(false)}
              aria-label="إغلاق لوحة الإشعارات"
              sx={{
                width: 40,
                height: 40,
                borderRadius: NOTIF_R.control,
                bgcolor: isMuiDark ? alpha("#fff", 0.06) : alpha(COLORS.primary, 0.06),
                border: `1px solid ${alpha(theme.palette.divider, 0.52)}`,
                color: "text.secondary",
                flexShrink: 0,
                transition: "background-color .22s ease, transform .15s ease",
                "@media (hover: hover) and (pointer: fine)": {
                  "&:hover": {
                    bgcolor: isMuiDark ? alpha("#fff", 0.11) : alpha(COLORS.primary, 0.1),
                  },
                },
                "&:active": { transform: "scale(0.96)" },
              }}
            >
              <X size={18} />
            </IconButton>
          </Stack>
          <Tooltip title="مسح المعروض (لا يمس القفل ولا إخفاء الإحصائيات)">
            <span>
              <Button
                fullWidth
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
                startIcon={<Trash2 size={15} />}
                sx={{
                  mt: 1.15,
                  minHeight: 38,
                  borderRadius: NOTIF_R.control,
                  border: `1px solid ${alpha(theme.palette.divider, 0.48)}`,
                  bgcolor: canBulkClearNotifications
                    ? isMuiDark
                      ? alpha("#fff", 0.06)
                      : alpha(COLORS.primary, 0.06)
                    : "transparent",
                  color: canBulkClearNotifications
                    ? theme.palette.text.secondary
                    : theme.palette.action.disabled,
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  textTransform: "none",
                  justifyContent: "center",
                  "&:hover": {
                    bgcolor: canBulkClearNotifications
                      ? isMuiDark
                        ? alpha("#fff", 0.11)
                        : alpha(COLORS.primary, 0.11)
                      : "transparent",
                  },
                }}
              >
                مسح المعروض
              </Button>
            </span>
          </Tooltip>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.1,
            mx: 2,
            mb: 1.05,
            borderRadius: "16px",
            border: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.2 : 0.14)}`,
            background: isMuiDark
              ? alpha("#fff", 0.045)
              : alpha("#fff", 0.8),
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: isMuiDark
              ? "none"
              : "0 4px 18px rgba(31, 61, 53, 0.055)",
          }}
        >
          <Stack spacing={1.05}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "text.secondary",
                }}
              >
                إعدادات التنبيه
              </Typography>
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
                    px: 1.35,
                    py: 0.62,
                    fontSize: "0.73rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: NOTIF_R.control,
                    boxShadow: "0 4px 12px rgba(31, 61, 53, 0.2)",
                    bgcolor: COLORS.primary,
                    "&:hover": { bgcolor: COLORS.primaryDeep },
                  }}
                  startIcon={
                    notifPermLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : undefined
                  }
                >
                  تفعيل الجهاز
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.2,
                    py: 0.45,
                    borderRadius: NOTIF_R.control,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.26)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.24)}`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.71rem",
                      fontWeight: 750,
                      color: "success.dark",
                    }}
                  >
                    مفعّل
                  </Typography>
                </Box>
              )}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              <FormControlLabel
                sx={{ mr: 0, ml: 0, gap: 0.55 }}
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
                  <Typography sx={{ fontSize: "0.74rem", fontWeight: 750 }}>
                    إشعارات الخلفية
                  </Typography>
                }
              />
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "text.secondary",
                  fontFamily: FINANCIAL_NUMBER_FONT,
                }}
              >
                الإجمالي: {numberFormatter.format(notifKindCounts.all)}
              </Typography>
            </Stack>

            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {(
                [
                  { id: "all", label: "الكل", count: notifKindCounts.all },
                  { id: "urgent", label: "عاجل", count: notifKindCounts.urgent },
                  { id: "team", label: "الفريق", count: notifKindCounts.team },
                  { id: "activity", label: "النشاط", count: notifKindCounts.activity },
                ] as const
              ).map((f) => {
                const active = notifFilter === f.id;
                return (
                  <Button
                    key={f.id}
                    size="small"
                    onClick={() => setNotifFilter(f.id)}
                    sx={{
                      px: 1.15,
                      minHeight: 32,
                      borderRadius: NOTIF_R.control,
                      border: `1px solid ${
                        active
                          ? alpha(COLORS.primary, 0.42)
                          : alpha(theme.palette.divider, 0.5)
                      }`,
                      bgcolor: active
                        ? isMuiDark
                          ? alpha(COLORS.accent, 0.15)
                          : alpha(COLORS.primary, 0.09)
                        : isMuiDark
                          ? alpha("#fff", 0.03)
                          : alpha("#fff", 0.7),
                      color: active
                        ? isMuiDark
                          ? COLORS.accent
                          : COLORS.primaryDeep
                        : "text.secondary",
                      fontSize: "0.71rem",
                      fontWeight: active ? 800 : 700,
                      textTransform: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.55,
                      "&:hover": {
                        bgcolor: active
                          ? isMuiDark
                            ? alpha(COLORS.accent, 0.2)
                            : alpha(COLORS.primary, 0.13)
                          : isMuiDark
                            ? alpha("#fff", 0.06)
                            : alpha(COLORS.primary, 0.06),
                      },
                    }}
                  >
                    {f.label}
                    <Box
                      component="span"
                      sx={{
                        minWidth: 18,
                        px: 0.45,
                        py: 0.1,
                        borderRadius: 99,
                        bgcolor: active
                          ? alpha(theme.palette.common.black, isMuiDark ? 0.22 : 0.08)
                          : alpha(theme.palette.common.black, isMuiDark ? 0.16 : 0.05),
                        color: "inherit",
                        fontSize: "0.64rem",
                        lineHeight: 1.35,
                        fontFamily: FINANCIAL_NUMBER_FONT,
                      }}
                    >
                      {numberFormatter.format(f.count)}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
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
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              mb: 1.25,
              opacity: 0.85,
            }}
          >
            {notifFilter === "all"
              ? "اليوم"
              : notifFilter === "urgent"
                ? "العاجل"
                : notifFilter === "team"
                  ? "تنبيهات الفريق"
                  : "آخر النشاط"}
          </Typography>
          <Stack spacing={1.05} sx={{ pb: 1.2 }}>
            {filteredNotifications.map((n) => {
              const kindStyles = {
                urgent: {
                  cardBg: isMuiDark
                    ? alpha("#ef5350", 0.1)
                    : alpha("#ffebee", 0.95),
                  cardBorder: alpha("#c62828", isMuiDark ? 0.4 : 0.24),
                  iconBg: alpha("#c62828", isMuiDark ? 0.2 : 0.12),
                  iconColor: "#c62828",
                },
                info: {
                  cardBg: isMuiDark
                    ? alpha(COLORS.accent, 0.08)
                    : alpha("#f5f3ef", 0.98),
                  cardBorder: alpha(COLORS.primary, isMuiDark ? 0.22 : 0.12),
                  iconBg: alpha(COLORS.primary, isMuiDark ? 0.28 : 0.1),
                  iconColor: isMuiDark ? COLORS.accent : COLORS.primaryDeep,
                },
                success: {
                  cardBg: isMuiDark
                    ? alpha("#66bb6a", 0.1)
                    : alpha("#e8f5e9", 0.92),
                  cardBorder: alpha("#2e7d32", isMuiDark ? 0.35 : 0.2),
                  iconBg: alpha("#2e7d32", isMuiDark ? 0.22 : 0.12),
                  iconColor: "#2e7d32",
                },
                lock: {
                  cardBg: isMuiDark
                    ? alpha("#7986cb", 0.12)
                    : alpha("#e8eaf6", 0.95),
                  cardBorder: alpha("#3949ab", isMuiDark ? 0.35 : 0.2),
                  iconBg: alpha("#3949ab", isMuiDark ? 0.22 : 0.12),
                  iconColor: "#3949ab",
                },
                team: {
                  cardBg: isMuiDark
                    ? alpha(COLORS.accent, 0.12)
                    : alpha("#faf8f3", 0.98),
                  cardBorder: alpha(COLORS.accent, isMuiDark ? 0.4 : 0.35),
                  iconBg: alpha(COLORS.accent, isMuiDark ? 0.22 : 0.18),
                  iconColor: isMuiDark ? COLORS.accent : "#7d6a44",
                },
                activity: {
                  cardBg: isMuiDark
                    ? alpha("#5c6bc0", 0.12)
                    : alpha("#eef2ff", 0.95),
                  cardBorder: alpha("#4361ee", isMuiDark ? 0.35 : 0.18),
                  iconBg: alpha("#4361ee", isMuiDark ? 0.2 : 0.1),
                  iconColor: "#4361ee",
                },
              } as const;
              const s = kindStyles[n.kind] ?? kindStyles.info;
              const canDismiss =
                !NOTIFICATION_IDS_EXCLUDED_FROM_CLEAR.has(n.id) &&
                !n.id.startsWith("empty-");
              const kindLabel =
                n.kind === "urgent"
                  ? "عاجل"
                  : n.kind === "team"
                    ? "فريق"
                    : n.kind === "activity"
                      ? "نشاط"
                      : n.kind === "success"
                        ? "مكتمل"
                        : n.kind === "lock"
                          ? "أمان"
                          : "معلومة";
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
                    p: 0.5,
                    borderRadius: "16px",
                    bgcolor: isMuiDark ? alpha("#fff", 0.025) : alpha("#fff", 0.72),
                    border: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.14 : 0.09)}`,
                    boxShadow: isMuiDark
                      ? "0 1px 4px rgba(0,0,0,0.3)"
                      : "0 1px 2px rgba(31, 61, 53, 0.06), 0 10px 26px rgba(31, 61, 53, 0.05)",
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: "12px",
                      bgcolor: s.cardBg,
                      border: `1px solid ${s.cardBorder}`,
                      p: 1.1,
                    }}
                  >
                    <Stack direction="row" gap={1.05} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: NOTIF_R.control,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: s.iconBg,
                          border: `1px solid ${alpha(s.iconColor, 0.16)}`,
                        }}
                      >
                        {leftIcon}
                      </Box>
                      <Box sx={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          gap={0.8}
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.81rem",
                              color: "text.primary",
                              lineHeight: 1.34,
                              letterSpacing: "-0.01em",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {n.title}
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              px: 0.7,
                              py: 0.2,
                              borderRadius: 99,
                              bgcolor: alpha(s.iconColor, isMuiDark ? 0.2 : 0.12),
                              border: `1px solid ${alpha(s.iconColor, 0.22)}`,
                              color: s.iconColor,
                              fontSize: "0.64rem",
                              fontWeight: 800,
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {kindLabel}
                          </Box>
                        </Stack>

                        <Typography
                          sx={{
                            fontSize: "0.77rem",
                            color: "text.secondary",
                            mt: 0.45,
                            lineHeight: 1.55,
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            opacity: 0.95,
                          }}
                        >
                          {n.body}
                        </Typography>

                        {(n.at || canDismiss) && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={0.8}
                            flexWrap="wrap"
                            sx={{ mt: 0.72 }}
                          >
                            {n.at ? (
                              <Typography
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  fontSize: "0.67rem",
                                  fontWeight: 650,
                                  color: "text.secondary",
                                  px: 0.95,
                                  py: 0.24,
                                  borderRadius: 99,
                                  bgcolor: isMuiDark
                                    ? alpha("#fff", 0.06)
                                    : alpha(COLORS.primary, 0.06),
                                }}
                              >
                                {dayjs(n.at).fromNow()}
                              </Typography>
                            ) : (
                              <Box />
                            )}
                            {canDismiss && (
                              <Button
                                size="small"
                                onClick={() => {
                                  const next = {
                                    ...notifDismissMap,
                                    [n.id]: n.dismissSignature ?? n.id,
                                  };
                                  saveDismissMap(next);
                                  setNotifDismissMap(next);
                                }}
                                sx={{
                                  minHeight: 28,
                                  px: 0.9,
                                  py: 0.2,
                                  borderRadius: 99,
                                  color: "text.secondary",
                                  bgcolor: isMuiDark
                                    ? alpha("#fff", 0.05)
                                    : alpha(COLORS.primary, 0.05),
                                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                  fontSize: "0.67rem",
                                  fontWeight: 700,
                                  textTransform: "none",
                                  "&:hover": {
                                    bgcolor: isMuiDark
                                      ? alpha("#fff", 0.09)
                                      : alpha(COLORS.primary, 0.08),
                                  },
                                }}
                              >
                                تمت المراجعة
                              </Button>
                            )}
                          </Stack>
                        )}

                        {n.actionPath && n.actionLabel && (
                          <Stack direction="row" gap={0.7} sx={{ mt: 0.95 }}>
                            <Button
                              fullWidth
                              variant={
                                n.kind === "urgent" || n.kind === "team"
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() => {
                                setNotifOpen(false);
                                navigate(n.actionPath!);
                              }}
                              startIcon={<ArrowUpRight size={15} />}
                              sx={{
                                py: 0.7,
                                minHeight: 39,
                                fontSize: "0.76rem",
                                borderRadius: NOTIF_R.control,
                                textTransform: "none",
                                fontWeight: 800,
                                borderWidth: 1.4,
                                borderColor:
                                  n.kind === "urgent" || n.kind === "team"
                                    ? "transparent"
                                    : alpha(COLORS.primary, 0.35),
                                bgcolor:
                                  n.kind === "urgent" || n.kind === "team"
                                    ? COLORS.primary
                                    : "transparent",
                                color:
                                  n.kind === "urgent" || n.kind === "team"
                                    ? "#fff"
                                    : isMuiDark
                                      ? COLORS.accent
                                      : COLORS.primaryDeep,
                                boxShadow:
                                  n.kind === "urgent" || n.kind === "team"
                                    ? `0 6px 16px ${alpha(COLORS.primary, 0.32)}`
                                    : "none",
                                "&:hover": {
                                  borderWidth: 1.4,
                                  borderColor:
                                    n.kind === "urgent" || n.kind === "team"
                                      ? "transparent"
                                      : COLORS.primary,
                                  bgcolor:
                                    n.kind === "urgent" || n.kind === "team"
                                      ? COLORS.primaryDeep
                                      : alpha(COLORS.primary, 0.08),
                                },
                              }}
                            >
                              {n.actionLabel}
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </Box>
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
            borderTop: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.13 : 0.09)}`,
            background: isMuiDark
              ? alpha("#000", 0.2)
              : alpha("#fff", 0.58),
            backdropFilter: "blur(10px)",
          }}
        >
          <Button
            fullWidth
            onClick={() => setNotifOpen(false)}
            sx={{
              py: 1.02,
              borderRadius: NOTIF_R.control,
              fontWeight: 800,
              fontSize: "0.82rem",
              textTransform: "none",
              color: isMuiDark ? alpha("#fff", 0.9) : COLORS.primaryDeep,
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

      {/* القائمة الجانبية — Sidebar iOS style */}
      <Drawer
        anchor="right"
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        PaperProps={{
          sx: {
            width: "min(320px, 86vw)",
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "28px 0 0 28px",
            border: "none",
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            background: isMuiDark
              ? "linear-gradient(170deg, #1C2420 0%, #141A17 55%, #10150F 100%)"
              : "linear-gradient(180deg, #FCFBF8 0%, #F4F2EC 60%, #EFEDE6 100%)",
            boxShadow: isMuiDark
              ? "-16px 0 56px rgba(0,0,0,0.55)"
              : "-16px 0 56px rgba(31, 61, 53, 0.16)",
            pt: "max(12px, env(safe-area-inset-top, 0px))",
            pb: "max(12px, env(safe-area-inset-bottom, 0px))",
          },
        }}
      >
        <Box
          dir="rtl"
          sx={{
            px: 2,
            pt: 1,
            pb: 1.75,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.14 : 0.1)}`,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.25,
              minWidth: 0,
            }}
          >
            <Avatar
              src="/logo-icon.jpg"
              alt="شعار إطلالة"
              sx={{
                width: 46,
                height: 46,
                borderRadius: "15px",
                border: `1px solid ${alpha(COLORS.accent, 0.45)}`,
                boxShadow: isMuiDark
                  ? "0 8px 20px rgba(0,0,0,0.4)"
                  : "0 8px 20px rgba(31, 61, 53, 0.14)",
                bgcolor: "#fff",
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.02rem",
                  color: "text.primary",
                  lineHeight: 1.25,
                }}
              >
                إطلالة
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                للخدمات الهندسية
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setSideMenuOpen(false)}
            aria-label="إغلاق القائمة"
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: isMuiDark ? alpha("#fff", 0.07) : alpha(COLORS.primary, 0.06),
              color: "text.secondary",
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              flexShrink: 0,
            }}
          >
            <X size={17} strokeWidth={2} />
          </IconButton>
        </Box>

        <Box
          dir="rtl"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            px: 1.5,
            py: 1.5,
          }}
        >
          <Stack spacing={0.75}>
            {[
              {
                title: "الرئيسية",
                subtitle: "نظرة عامة وإحصائيات",
                path: "/",
                icon: Home,
                module: null,
              } as unknown as MenuItem,
              ...allMenusVisible,
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.path}
                  component={motion.div}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  onClick={() => {
                    setSideMenuOpen(false);
                    navigate(item.path);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSideMenuOpen(false);
                      navigate(item.path);
                    }
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 1.25,
                    py: 1.1,
                    minHeight: 58,
                    borderRadius: "18px",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": {
                        bgcolor: isMuiDark
                          ? alpha("#fff", 0.05)
                          : alpha(COLORS.primary, 0.05),
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
                        width: 42,
                        height: 42,
                        borderRadius: "14px",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        background: isMuiDark
                          ? `linear-gradient(145deg, ${alpha(COLORS.accent, 0.14)} 0%, ${alpha("#fff", 0.05)} 100%)`
                          : `linear-gradient(145deg, ${alpha(COLORS.primary, 0.09)} 0%, ${alpha(COLORS.accent, 0.14)} 100%)`,
                        boxShadow: isMuiDark
                          ? "inset 0 1px 0 rgba(255,255,255,0.06)"
                          : "inset 0 1px 0 rgba(255,255,255,0.85)",
                      }}
                    >
                      <Icon
                        size={19}
                        color={theme.palette.primary.main}
                        strokeWidth={1.85}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "text.primary",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          color: "text.secondary",
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronLeft
                    size={16}
                    color={theme.palette.text.disabled as string}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box
          dir="rtl"
          sx={{
            flexShrink: 0,
            px: 1.5,
            pt: 1.25,
            pb: 0.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, isMuiDark ? 0.14 : 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={1}>
            {(
              [
                {
                  label: isThemeDark ? "الوضع الفاتح" : "الوضع الليلي",
                  icon: isThemeDark ? (
                    <Sun size={18} strokeWidth={1.9} />
                  ) : (
                    <Moon size={18} strokeWidth={1.9} />
                  ),
                  action: () => toggleTheme(),
                  danger: false,
                },
                {
                  label: "قفل التطبيق",
                  icon:
                    isLocked && !isSessionUnlocked() ? (
                      <Lock size={18} strokeWidth={1.9} />
                    ) : (
                      <LockOpen size={18} strokeWidth={1.9} />
                    ),
                  action: () => {
                    setSideMenuOpen(false);
                    setLockSettingsOpen(true);
                  },
                  danger: false,
                },
                {
                  label: "خروج",
                  icon: <LogOut size={18} strokeWidth={1.9} />,
                  action: () => {
                    logout();
                    navigate("/login");
                  },
                  danger: true,
                },
              ] as const
            ).map((a) => (
              <Box
                key={a.label}
                component={motion.button}
                type="button"
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={a.action}
                sx={{
                  appearance: "none",
                  border: `1px solid ${
                    a.danger
                      ? alpha("#c73e3e", 0.3)
                      : alpha(theme.palette.divider, 0.6)
                  }`,
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  py: 1.1,
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: a.danger
                    ? "#c73e3e"
                    : theme.palette.text.secondary,
                  bgcolor: a.danger
                    ? alpha("#c73e3e", isMuiDark ? 0.12 : 0.06)
                    : isMuiDark
                      ? alpha("#fff", 0.05)
                      : alpha("#fff", 0.75),
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {a.icon}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "inherit",
                  }}
                >
                  {a.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Drawer>

      <AppLockSettingsDialog
        open={lockSettingsOpen}
        onClose={() => setLockSettingsOpen(false)}
      />
    </Box>
  );
};
