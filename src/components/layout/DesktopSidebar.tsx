import { Box, Button, Divider, Typography, alpha, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, Plus, Sun } from "lucide-react";
import {
  APP_NAV_ITEMS,
  isNavPathActive,
  type NavItemDef,
} from "../../layout/navConfig";
import { useAppLockStore } from "../../store/useAppLockStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { premiumTokens } from "../../theme/tokens";

const SIDEBAR_WIDTH = 272;

type DesktopSidebarProps = {
  onQuickExpense?: () => void;
  showQuickExpense?: boolean;
};

const SidebarLink = ({
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
  const activeColor = isDark ? "#D4C9A3" : premiumTokens.accent;

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      sx={{
        appearance: "none",
        border: "none",
        width: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.25,
        px: 1.35,
        py: 1.05,
        minHeight: 46,
        borderRadius: "12px",
        textAlign: "right",
        color: active
          ? isDark
            ? "#F4F1EC"
            : "#fff"
          : isDark
            ? alpha("#F4F1EC", 0.72)
            : alpha("#fff", 0.82),
        bgcolor: active
          ? isDark
            ? alpha("#D4C9A3", 0.14)
            : alpha("#fff", 0.12)
          : "transparent",
        borderInlineStart: active
          ? `3px solid ${activeColor}`
          : "3px solid transparent",
        transition: "background 180ms ease, color 180ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            bgcolor: active
              ? isDark
                ? alpha("#D4C9A3", 0.18)
                : alpha("#fff", 0.16)
              : isDark
                ? alpha("#fff", 0.06)
                : alpha("#fff", 0.08),
          },
        },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: active
            ? alpha(activeColor, isDark ? 0.22 : 0.28)
            : isDark
              ? alpha("#fff", 0.06)
              : alpha("#fff", 0.1),
        }}
      >
        <Icon size={17} strokeWidth={active ? 2.1 : 1.85} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.88rem",
            fontWeight: active ? 800 : 650,
            lineHeight: 1.25,
            letterSpacing: 0.02,
          }}
        >
          {item.label}
        </Typography>
        {item.subtitle ? (
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 500,
              opacity: 0.72,
              lineHeight: 1.3,
              mt: 0.15,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export const DESKTOP_SIDEBAR_WIDTH = SIDEBAR_WIDTH;

export function DesktopSidebar({
  onQuickExpense,
  showQuickExpense,
}: DesktopSidebarProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess } = useAppLockStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  const visible = (item: NavItemDef) =>
    !item.module || canAccess(item.module);

  const primaryItems = APP_NAV_ITEMS.filter(
    (i) => i.sidebar && i.sidebarSection === "primary" && visible(i),
  );
  const managementItems = APP_NAV_ITEMS.filter(
    (i) => i.sidebar && i.sidebarSection === "management" && visible(i),
  );

  return (
    <Box
      component="aside"
      aria-label="التنقل الرئيسي — سطح المكتب"
      dir="rtl"
      className="etlala-desktop-sidebar no-print"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(180deg, #141916 0%, #101512 55%, #0E1210 100%)"
          : `linear-gradient(180deg, ${premiumTokens.primary} 0%, ${premiumTokens.primaryDark} 100%)`,
        borderInlineStart: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#fff", 0.12)}`,
        boxShadow: isDark
          ? "4px 0 32px rgba(0,0,0,0.35)"
          : "4px 0 28px rgba(31, 37, 33, 0.12)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: isDark
            ? "radial-gradient(ellipse 90% 60% at 100% 0%, rgba(194,178,128,0.1) 0%, transparent 55%)"
            : "radial-gradient(ellipse 85% 55% at 100% 0%, rgba(255,255,255,0.12) 0%, transparent 52%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: 2,
          pt: "calc(env(safe-area-inset-top, 0px) + 22px)",
          pb: 2,
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
          <Box
            component="img"
            src="/logog.png"
            alt="إطلالة"
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              objectFit: "contain",
              bgcolor: alpha("#fff", 0.12),
              p: 0.5,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "#fff",
                letterSpacing: 0.04,
                lineHeight: 1.2,
              }}
            >
              إطلالة
            </Typography>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 500,
                color: alpha("#fff", 0.72),
                lineHeight: 1.3,
              }}
            >
              لوحة العمليات
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          overflowY: "auto",
          px: 1.25,
          pb: 1,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: alpha("#fff", 0.18),
            borderRadius: 4,
          },
        }}
      >
        <Box sx={{ display: "grid", gap: 0.35 }}>
          {primaryItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={isNavPathActive(item.path, location.pathname)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </Box>

        {managementItems.length > 0 ? (
          <>
            <Divider
              sx={{
                my: 1.5,
                borderColor: alpha("#fff", isDark ? 0.1 : 0.14),
              }}
            />
            <Typography
              sx={{
                px: 1.35,
                mb: 0.75,
                fontSize: "0.68rem",
                fontWeight: 750,
                letterSpacing: 0.12,
                textTransform: "uppercase",
                color: alpha("#fff", 0.55),
              }}
            >
              الإدارة
            </Typography>
            <Box sx={{ display: "grid", gap: 0.35 }}>
              {managementItems.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  active={isNavPathActive(item.path, location.pathname)}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </Box>
          </>
        ) : null}
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: 1.5,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
          pt: 1.25,
          borderTop: `1px solid ${alpha("#fff", isDark ? 0.08 : 0.12)}`,
          display: "grid",
          gap: 1,
        }}
      >
        {showQuickExpense ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus size={18} strokeWidth={2.2} />}
            onClick={onQuickExpense}
            sx={{
              minHeight: 44,
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "0.84rem",
              bgcolor: isDark ? alpha("#D4C9A3", 0.18) : alpha("#fff", 0.16),
              color: "#fff",
              border: `1px solid ${alpha("#fff", 0.22)}`,
              boxShadow: "none",
              "&:hover": {
                bgcolor: isDark ? alpha("#D4C9A3", 0.26) : alpha("#fff", 0.22),
                boxShadow: "none",
              },
            }}
          >
            مصروف جديد
          </Button>
        ) : null}

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 0.5,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user?.displayName || "مستخدم"}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: "0.68rem",
                color: alpha("#fff", 0.65),
              }}
            >
              {user?.role === "admin"
                ? "مسؤول"
                : user?.role === "editor"
                  ? "محرر"
                  : "موظف"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <Box
              component="button"
              type="button"
              aria-label={mode === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}
              onClick={toggleTheme}
              sx={{
                appearance: "none",
                border: `1px solid ${alpha("#fff", 0.16)}`,
                bgcolor: alpha("#fff", 0.08),
                borderRadius: "10px",
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                cursor: "pointer",
                "@media (hover: hover)": {
                  "&:hover": { bgcolor: alpha("#fff", 0.14) },
                },
              }}
            >
              {mode === "dark" ? (
                <Sun size={16} strokeWidth={1.9} />
              ) : (
                <Moon size={16} strokeWidth={1.9} />
              )}
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="خروج"
              onClick={() => logout()}
              sx={{
                appearance: "none",
                border: `1px solid ${alpha("#fff", 0.16)}`,
                bgcolor: alpha("#fff", 0.08),
                borderRadius: "10px",
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                color: alpha("#fff", 0.9),
                cursor: "pointer",
                "@media (hover: hover)": {
                  "&:hover": { bgcolor: alpha("#fff", 0.14) },
                },
              }}
            >
              <LogOut size={16} strokeWidth={1.9} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
