import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useAppLockStore } from "../store/useAppLockStore";
import { CreditCard, FileText, Home, Plus, Users, Wallet } from "lucide-react";
import { premiumTokens } from "../theme/tokens";
import { QuickExpenseSheet } from "./expense/QuickExpenseSheet";

/** إطار iPhone — التطبيق يتمركز على الشاشات الكبيرة بعرض جوال ثابت */
export const APP_FRAME_MAX_WIDTH = 430;

/** ارتفاع شريط التنقل السفلي (بدون المنطقة الآمنة) */
const NAV_HEIGHT = 64;

type NavItem = {
  label: string;
  icon: typeof Home;
  path: string;
};

/** ترتيب RTL: الرئيسية أقصى اليمين — خمسة عناصر متساوية */
const NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", icon: Home, path: "/" },
  { label: "العملاء", icon: Users, path: "/clients" },
  { label: "الفواتير", icon: FileText, path: "/invoices" },
  { label: "المدفوعات", icon: CreditCard, path: "/payments" },
  { label: "العهدة", icon: Wallet, path: "/fund" },
];

const isPathActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
};

const NavButton = ({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const Icon = item.icon;
  const activeColor = isDark ? "#D4C9A3" : premiumTokens.primary;
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      sx={{
        appearance: "none",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        flex: "1 1 0",
        minWidth: 0,
        minHeight: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        padding: "7px 2px 7px",
        borderRadius: "12px",
        color: active ? activeColor : theme.palette.text.secondary,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        transition: "background 220ms ease, transform 120ms ease, opacity 120ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            backgroundColor: isDark
              ? alpha("#fff", 0.04)
              : alpha(premiumTokens.primary, 0.045),
          },
        },
        "&:active": { transform: "scale(0.96)", opacity: 0.85 },
      }}
    >
      {/* حبة خلف الأيقونة عند التفعيل — نمط iOS الحديث */}
      <Box
        sx={{
          width: 44,
          height: 26,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          bgcolor: active
            ? isDark
              ? alpha("#D4C9A3", 0.14)
              : alpha(premiumTokens.primary, 0.1)
            : "transparent",
          border: active
            ? `1px solid ${isDark ? alpha("#D4C9A3", 0.3) : alpha(premiumTokens.primary, 0.18)}`
            : "1px solid transparent",
        }}
      >
        <Icon
          size={active ? 19 : 18}
          strokeWidth={active ? 2.1 : 1.8}
          style={{ display: "block" }}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: "0.64rem",
          fontWeight: active ? 800 : 650,
          lineHeight: 1,
          letterSpacing: 0.2,
          whiteSpace: "nowrap",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.label}
      </Typography>
    </Box>
  );
};

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { canAccess } = useAppLockStore();

  /** نافذة «مصروف جديد» تُفتح فوراً هنا — بدون أي تنقّل أو تحميل صفحة */
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  /** يُخفى الزر العائم في صفحات لها CTA سفلي ثابت (تفادي التصادم) */
  const routeHasStickyCta = location.pathname.startsWith("/invoices/new");
  const showCreate = canAccess("expenses") && !routeHasStickyCta;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        pb: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
        position: "relative",
        "@media print": { pb: 0 },
      }}
    >
      <Box
        className={
          isDark
            ? "etlala-app-ambient etlala-app-ambient--dark"
            : "etlala-app-ambient"
        }
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* إطار iPhone — يتمركز في منتصف الشاشات العريضة بدون تمديد المكونات */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: { xs: "100%", sm: `${APP_FRAME_MAX_WIDTH}px` },
          mx: "auto",
          minHeight: "inherit",
          boxShadow: {
            xs: "none",
            sm: isDark
              ? "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.55)"
              : "0 0 0 1px rgba(31, 37, 33, 0.05), 0 24px 80px rgba(31, 37, 33, 0.12)",
          },
          "@media print": { maxWidth: "100%", boxShadow: "none" },
        }}
      >
        <Outlet />
      </Box>

      {/* زر إضافة مصروف — عائم على يسار الصفحة، مرتفع فوق شريط التنقل */}
      {showCreate ? (
        <Box
          aria-hidden={false}
          className="no-print"
          dir="rtl"
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            mx: "auto",
            width: "100%",
            maxWidth: { xs: "100%", sm: `${APP_FRAME_MAX_WIDTH}px` },
            zIndex: 1190,
            pointerEvents: "none",
            height: 0,
            "@media print": { display: "none" },
          }}
        >
          <Box
            component={motion.button}
            type="button"
            onClick={() => setQuickExpenseOpen(true)}
            aria-label="مصروف جديد"
            whileTap={{ scale: 0.92 }}
            sx={{
              appearance: "none",
              border: `1px solid ${isDark ? alpha("#fff", 0.18) : alpha("#fff", 0.46)}`,
              cursor: "pointer",
              pointerEvents: "auto",
              position: "absolute",
              /* RTL: نهاية السطر = يسار الشاشة */
              insetInlineEnd: 16,
              bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 14px)`,
              width: 58,
              height: 58,
              borderRadius: "20px",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: `linear-gradient(180deg, ${isDark ? "#4A5E50" : "#3A4B40"} 0%, ${premiumTokens.primaryDark} 100%)`,
              boxShadow: isDark
                ? "0 14px 30px rgba(0,0,0,0.56), inset 0 1px 0 rgba(255,255,255,0.18)"
                : `0 14px 30px ${alpha(premiumTokens.primary, 0.35)}, 0 2px 8px ${alpha(premiumTokens.primary, 0.2)}, inset 0 1px 0 rgba(255,255,255,0.22)`,
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              transition: "transform 200ms ease, box-shadow 220ms ease",
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isDark
                    ? "0 18px 36px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : `0 18px 36px ${alpha(premiumTokens.primary, 0.4)}, 0 4px 10px ${alpha(premiumTokens.primary, 0.22)}, inset 0 1px 0 rgba(255,255,255,0.24)`,
                },
              },
            }}
          >
            <Plus size={26} strokeWidth={2.2} />
          </Box>
        </Box>
      ) : null}

      {/* شريط تنقل سفلي — iOS: زجاج مصنفر + خط شعري + 5 عناصر متساوية */}
      <Box
        component="nav"
        aria-label="التنقل الرئيسي"
        dir="rtl"
        className="no-print"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          mx: "auto",
          width: "100%",
          maxWidth: { xs: "100%", sm: `${APP_FRAME_MAX_WIDTH}px` },
          zIndex: 1200,
          height: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingInline: "4px",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          background: isDark
            ? "rgba(24, 32, 27, 0.9)"
            : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "saturate(1.8) blur(22px)",
          WebkitBackdropFilter: "saturate(1.8) blur(22px)",
          borderTop: `1px solid ${theme.palette.divider}`,
          borderInline: {
            xs: "none",
            sm: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          },
          boxShadow: isDark
            ? "0 -8px 32px rgba(0,0,0,0.35)"
            : "0 -8px 32px rgba(31, 37, 33, 0.05)",
          "@media print": { display: "none" },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            item={item}
            active={isPathActive(item.path, location.pathname)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Box>

      {/* نافذة «مصروف جديد» الفورية — من أي صفحة، بدون تنقّل */}
      <QuickExpenseSheet
        open={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
      />
    </Box>
  );
};
