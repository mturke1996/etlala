import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useAppLockStore } from "../store/useAppLockStore";
import { Plus } from "lucide-react";
import { premiumTokens } from "../theme/tokens";
import { QuickExpenseSheet } from "./expense/QuickExpenseSheet";
import { useIsDesktopLayout } from "../hooks/useIsDesktopLayout";
import {
  DesktopSidebar,
  DESKTOP_SIDEBAR_WIDTH,
} from "./layout/DesktopSidebar";
import {
  APP_NAV_ITEMS,
  isNavPathActive,
  type NavItemDef,
} from "../layout/navConfig";

/** إطار iPhone — التطبيق يتمركز على الشاشات المتوسطة بعرض جوال ثابت (أقل من lg) */
export const APP_FRAME_MAX_WIDTH = 430;

/** ارتفاع شريط التنقل السفلي (بدون المنطقة الآمنة) */
const NAV_HEIGHT = 64;

const NavButton = ({
  item,
  active,
  onClick,
}: {
  item: NavItemDef;
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
  const isDesktop = useIsDesktopLayout();
  const { canAccess } = useAppLockStore();

  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  const routeHasStickyCta = location.pathname.startsWith("/invoices/new");
  const showCreate = canAccess("expenses") && !routeHasStickyCta;

  const bottomNavItems = APP_NAV_ITEMS.filter(
    (item) =>
      item.bottomNav && (!item.module || canAccess(item.module)),
  );

  if (isDesktop) {
    return (
      <Box
        className="etlala-desktop-shell"
        dir="rtl"
        sx={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100dvh",
          width: "100%",
          bgcolor: "background.default",
          "@media print": { display: "block" },
        }}
      >
        <DesktopSidebar
          showQuickExpense={showCreate}
          onQuickExpense={() => setQuickExpenseOpen(true)}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            minHeight: "100dvh",
            overflow: "auto",
            "@media print": { width: "100%" },
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
              position: "fixed",
              inset: 0,
              left: DESKTOP_SIDEBAR_WIDTH,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
        <QuickExpenseSheet
          open={quickExpenseOpen}
          onClose={() => setQuickExpenseOpen(false)}
        />
      </Box>
    );
  }

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
        {bottomNavItems.map((item) => (
          <NavButton
            key={item.path}
            item={item}
            active={isNavPathActive(item.path, location.pathname)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Box>

      <QuickExpenseSheet
        open={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
      />
    </Box>
  );
};
