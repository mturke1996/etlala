import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
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
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useDataStore } from "../store/useDataStore";
import { useAppLockStore, type AppModule } from "../store/useAppLockStore";
import { AppLockSettingsDialog } from "../components/AppLockSettingsDialog";
import toast from "react-hot-toast";
import { useGlobalFundStore } from "../store/useGlobalFundStore";
import { computeUserFundAllocTotals } from "../utils/custodyFundAlloc";
import { formatCurrency } from "../utils/formatters";

const COLORS = {
  primary: "#1E3F36",
  primary2: "#2D5246",
  primaryDeep: "#152E28",
  background: "#F7F6F1",
  accent: "#C4AE72",
  text: "#2A2E2C",
  muted: "#6E756F",
};

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
  const { clients, payments, expenses, isLoading } = useDataStore();
  const {
    transactions,
    getUserStats,
    initialize: initFund,
    isLoading: fundLoading,
  } = useGlobalFundStore();
  const { isLocked, isSessionUnlocked, canAccess } = useAppLockStore();
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const canOpenFund = canAccess("balances");
  const canSeeStats = canAccess("stats");
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

  /** تنبيهات مبنية على بيانات فعلية — تُفتح في لوحة جانبية */
  const homeNotifications = useMemo(() => {
    const list: {
      id: string;
      kind: "urgent" | "info" | "success" | "lock";
      title: string;
      body: string;
    }[] = [];

    if (isLocked && !sessionUnlocked) {
      list.push({
        id: "session-lock",
        kind: "lock",
        title: "جلسة القفل",
        body: "أدخل رمز التطبيق للوصول للأقسام المحمية (العملاء، الصندوق، وغيرها) إن وُجدت بصلاحيتك.",
      });
    }
    if (!canSeeStats) {
      list.push({
        id: "stats-hidden",
        kind: "info",
        title: "إحصائيات الشاشة الرئيسية",
        body: "مؤشرات صافي الأرباح والمحصّل وعموم المصروفات معطّلة بإعدادات الأمان. يبقى بإمكانك استخدام باقي الأقسام المفعّلة لك وعرض عهدتك عندما تظهر أدناه.",
      });
    }
    if (myCustodyFund && myCustodyFund.remaining < 0) {
      list.push({
        id: "custody-deficit",
        kind: "urgent",
        title: "عجز في عهدة صندوق العهدة",
        body: `المتبقي المطلوب تسويته: ‎${formatCurrency(Math.abs(myCustodyFund.remaining))}‎. راجع العهدات في صندوق العهدة عند تفعيل صلاحيتك أو التواصل مع المسؤول.`,
      });
    } else if (
      myCustodyFund &&
      myCustodyFund.remaining > 0 &&
      myCustodyFund.remaining < 300
    ) {
      list.push({
        id: "custody-low",
        kind: "info",
        title: "تنبيه ميزانية عهدة",
        body: `رصيدك المتبقي أقل من 300 ‎د.ل‎. خطط لإعادة التمويل عند الحاجة.`,
      });
    }

    if (list.length === 0) {
      list.push({
        id: "all-clear",
        kind: "success",
        title: "لا عناوين صادرة",
        body: "لا إشعارات مالية مخصصة حالياً. سيتم إظهار تنبيهات عند تغيّر وضع عهادتك أو عند اصطفاف مهم.",
      });
    }
    return list;
  }, [isLocked, sessionUnlocked, canSeeStats, myCustodyFund]);

  const urgentNotifCount = useMemo(
    () => homeNotifications.filter((n) => n.kind === "urgent").length,
    [homeNotifications],
  );

  const relevantNotifCount = useMemo(() => {
    if (urgentNotifCount > 0) return urgentNotifCount;
    return homeNotifications.filter((n) => n.id !== "all-clear").length;
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
            spacing={2.5}
            sx={{
              direction: "rtl",
              flexShrink: 0,
            }}
          >
            {/* مسافة بسيطة جداً بين الإشعارات ووضع الليلي — ثم فراغ أوضح قبل القفل والخروج */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ flexShrink: 0 }}
            >
              <IconButton
                onClick={() => setNotifOpen(true)}
                aria-label="الإشعارات"
                sx={{
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
            width: { xs: "100%", sm: 380 },
            maxWidth: "100vw",
            borderRadius: { xs: "20px 20px 0 0", sm: "0" },
            borderLeft: {
              sm: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            },
            background: isMuiDark
              ? "linear-gradient(180deg, #1A1F1B 0%, #121814 100%)"
              : "linear-gradient(180deg, #FDFDFB 0%, #F5F5F2 100%)",
            color: "text.primary",
          },
        }}
      >
        <Box
          dir="rtl"
          sx={{
            p: 2.25,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            background: `linear-gradient(120deg, ${alpha(COLORS.primary, 0.08)} 0%, transparent 55%)`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "text.primary",
                }}
              >
                الإشعارات
              </Typography>
              <Typography
                sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.35 }}
              >
                مُحدَّثة من بياناتك الحالية
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(COLORS.accent, 0.2),
                border: `1px solid ${alpha(COLORS.accent, 0.35)}`,
              }}
            >
              <Bell
                size={20}
                color={theme.palette.primary.main}
                strokeWidth={1.9}
              />
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            p: 2,
            pb: 3,
            maxHeight: "calc(100dvh - 120px)",
            overflow: "auto",
          }}
        >
          <Stack spacing={1.5}>
            {homeNotifications.map((n) => {
              const kindStyles = {
                urgent: {
                  bg: "rgba(198, 40, 40, 0.08)",
                  border: "rgba(198, 40, 40, 0.18)",
                },
                info: {
                  bg: "rgba(200, 192, 176, 0.2)",
                  border: "rgba(31, 61, 53, 0.1)",
                },
                success: {
                  bg: "rgba(46, 125, 50, 0.08)",
                  border: "rgba(46, 125, 50, 0.15)",
                },
                lock: {
                  bg: "rgba(92, 107, 192, 0.1)",
                  border: "rgba(92, 107, 192, 0.2)",
                },
              } as const;
              const s = kindStyles[n.kind] ?? kindStyles.info;
              const leftIcon =
                n.kind === "urgent" ? (
                  <AlertTriangle size={22} color="#B71C1C" />
                ) : n.kind === "success" ? (
                  <CheckCircle2 size={22} color="#2E7D32" />
                ) : n.kind === "lock" ? (
                  <Shield size={22} color="#3949AB" />
                ) : (
                  <Sparkles
                    size={22}
                    color={alpha(theme.palette.primary.main, 0.9)}
                  />
                );
              return (
                <Box
                  key={n.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    bgcolor: s.bg,
                    border: `1px solid ${s.border}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::after":
                      n.kind === "urgent"
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            bgcolor: "#c62828",
                            borderRadius: "0 2px 2px 0",
                          }
                        : {},
                  }}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Box sx={{ pt: 0.15, flexShrink: 0 }}>{leftIcon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.88rem",
                          color: "text.primary",
                          lineHeight: 1.35,
                        }}
                      >
                        {n.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: "text.secondary",
                          mt: 0.75,
                          lineHeight: 1.6,
                        }}
                      >
                        {n.body}
                      </Typography>
                      {n.id === "custody-deficit" && canOpenFund && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate("/fund");
                          }}
                          sx={{
                            mt: 1.25,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 800,
                            bgcolor: "primary.main",
                            "&:hover": { bgcolor: "primary.dark" },
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
        <Box
          sx={{
            p: 2,
            pt: 0,
            pb: "calc(16px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Button
            fullWidth
            onClick={() => setNotifOpen(false)}
            sx={{
              borderRadius: 2,
              fontWeight: 800,
              textTransform: "none",
              color: "text.secondary",
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            }}
          >
            إغلاق
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
