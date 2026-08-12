import { Box, Button, Typography, alpha, useTheme } from "@mui/material";
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

const SIDEBAR_WIDTH = 260;

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

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      sx={{
        appearance: "none",
        width: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.15,
        px: 1.1,
        py: 0.85,
        minHeight: 42,
        borderRadius: "10px",
        textAlign: "right",
        position: "relative",
        color: active
          ? isDark
            ? "#F4F1EC"
            : premiumTokens.primaryDark
          : isDark
            ? alpha("#F4F1EC", 0.68)
            : alpha(premiumTokens.text, 0.78),
        bgcolor: active
          ? isDark
            ? alpha("#D4C9A3", 0.12)
            : "#FFFFFF"
          : "transparent",
        boxShadow: active
          ? isDark
            ? "none"
            : "0 1px 2px rgba(31, 37, 33, 0.04), 0 4px 14px rgba(31, 37, 33, 0.05)"
          : "none",
        border: active
          ? `1px solid ${isDark ? alpha("#D4C9A3", 0.22) : "rgba(31, 37, 33, 0.07)"}`
          : "1px solid transparent",
        transition:
          "background 160ms cubic-bezier(0.2, 0.8, 0.2, 1), color 160ms ease, box-shadow 160ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          insetInlineStart: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: "0 3px 3px 0",
          bgcolor: active ? premiumTokens.accent : "transparent",
        },
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            bgcolor: active
              ? isDark
                ? alpha("#D4C9A3", 0.16)
                : "#FFFFFF"
              : isDark
                ? alpha("#fff", 0.05)
                : alpha("#fff", 0.7),
          },
        },
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "8px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: active
            ? isDark
              ? alpha("#D4C9A3", 0.2)
              : alpha(premiumTokens.primary, 0.1)
            : isDark
              ? alpha("#fff", 0.05)
              : alpha(premiumTokens.primary, 0.05),
          color: active
            ? isDark
              ? "#D4C9A3"
              : premiumTokens.primary
            : "inherit",
        }}
      >
        <Icon size={16} strokeWidth={active ? 2.15 : 1.8} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.84rem",
            fontWeight: active ? 800 : 650,
            lineHeight: 1.25,
          }}
        >
          {item.label}
        </Typography>
        {item.subtitle ? (
          <Typography
            sx={{
              fontSize: "0.64rem",
              fontWeight: 500,
              opacity: 0.62,
              lineHeight: 1.25,
              mt: 0.1,
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

  const hairline = isDark ? alpha("#fff", 0.08) : "rgba(31, 37, 33, 0.07)";
  const muted = isDark ? alpha("#F4F1EC", 0.52) : alpha(premiumTokens.text, 0.52);

  return (
    <Box
      component="aside"
      aria-label="التنقل الرئيسي — سطح المكتب"
      dir="rtl"
      className="etlala-desktop-sidebar no-print"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        alignSelf: "stretch",
        height: "100%",
        maxHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: isDark ? "#141A16" : "#F3F4F2",
        borderInlineEnd: `1px solid ${hairline}`,
      }}
    >
      <Box
        sx={{
          px: 1.75,
          pt: "calc(env(safe-area-inset-top, 0px) + 18px)",
          pb: 1.75,
          borderBottom: `1px solid ${hairline}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.15,
          }}
        >
          <Box
            component="img"
            src="/logog.png"
            alt="إطلالة"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              objectFit: "contain",
              bgcolor: isDark ? alpha("#fff", 0.08) : "#FFFFFF",
              border: `1px solid ${hairline}`,
              p: 0.4,
              boxShadow: isDark
                ? "none"
                : "0 1px 2px rgba(31, 37, 33, 0.04)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.98rem",
                color: isDark ? "#F4F1EC" : premiumTokens.primaryDark,
                lineHeight: 1.2,
              }}
            >
              إطلالة
            </Typography>
            <Typography
              sx={{
                fontSize: "0.66rem",
                fontWeight: 600,
                color: muted,
                lineHeight: 1.3,
                mt: 0.15,
              }}
            >
              لوحة العمليات
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.15,
          py: 1.25,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? alpha("#fff", 0.16) : alpha(premiumTokens.primary, 0.18),
            borderRadius: 4,
          },
        }}
      >
        <Box sx={{ display: "grid", gap: 0.25 }}>
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
          <Box sx={{ mt: 1.75 }}>
            <Typography
              sx={{
                px: 1.15,
                mb: 0.65,
                fontSize: "0.64rem",
                fontWeight: 750,
                letterSpacing: 0.08,
                color: muted,
              }}
            >
              الإدارة
            </Typography>
            <Box sx={{ display: "grid", gap: 0.25 }}>
              {managementItems.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  active={isNavPathActive(item.path, location.pathname)}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          px: 1.35,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          pt: 1.15,
          borderTop: `1px solid ${hairline}`,
          display: "grid",
          gap: 1,
        }}
      >
        {showQuickExpense ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus size={16} strokeWidth={2.3} />}
            onClick={onQuickExpense}
            sx={{
              minHeight: 42,
              borderRadius: "11px",
              fontWeight: 800,
              fontSize: "0.82rem",
              bgcolor: premiumTokens.primary,
              color: "#fff",
              boxShadow: isDark
                ? "none"
                : "0 1px 2px rgba(47, 62, 52, 0.18), 0 6px 16px rgba(47, 62, 52, 0.16)",
              "&:hover": {
                bgcolor: premiumTokens.primaryDark,
                boxShadow: isDark
                  ? "none"
                  : "0 2px 8px rgba(47, 62, 52, 0.22)",
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
            px: 0.35,
            py: 0.35,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: "0.8rem",
                fontWeight: 750,
                color: isDark ? "#F4F1EC" : premiumTokens.text,
              }}
            >
              {user?.displayName || "مستخدم"}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: "0.64rem",
                fontWeight: 600,
                color: muted,
              }}
            >
              {user?.role === "admin"
                ? "مسؤول"
                : user?.role === "editor"
                  ? "محرر"
                  : "موظف"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.45, flexShrink: 0 }}>
            <Box
              component="button"
              type="button"
              aria-label={mode === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}
              onClick={toggleTheme}
              sx={{
                appearance: "none",
                border: `1px solid ${hairline}`,
                bgcolor: isDark ? alpha("#fff", 0.06) : "#FFFFFF",
                borderRadius: "9px",
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                color: isDark ? "#F4F1EC" : premiumTokens.primary,
                cursor: "pointer",
                "@media (hover: hover)": {
                  "&:hover": {
                    bgcolor: isDark ? alpha("#fff", 0.1) : alpha(premiumTokens.primary, 0.06),
                  },
                },
              }}
            >
              {mode === "dark" ? (
                <Sun size={15} strokeWidth={1.9} />
              ) : (
                <Moon size={15} strokeWidth={1.9} />
              )}
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="خروج"
              onClick={() => logout()}
              sx={{
                appearance: "none",
                border: `1px solid ${hairline}`,
                bgcolor: isDark ? alpha("#fff", 0.06) : "#FFFFFF",
                borderRadius: "9px",
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                color: isDark ? alpha("#F4F1EC", 0.85) : alpha(premiumTokens.text, 0.72),
                cursor: "pointer",
                "@media (hover: hover)": {
                  "&:hover": {
                    bgcolor: isDark ? alpha("#fff", 0.1) : alpha(premiumTokens.primary, 0.06),
                  },
                },
              }}
            >
              <LogOut size={15} strokeWidth={1.9} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
