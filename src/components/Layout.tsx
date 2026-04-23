import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from "@mui/material";
import { useAppLockStore } from "../store/useAppLockStore";
import { CreditCard, FileText, Home, Users, Wallet } from "lucide-react";

const navItems = [
  { label: "الرئيسية", icon: <Home size={20} strokeWidth={1.9} />, path: "/", module: null },
  { label: "العملاء", icon: <Users size={20} strokeWidth={1.9} />, path: "/clients", module: "clients" },
  {
    label: "الفواتير",
    icon: <FileText size={20} strokeWidth={1.9} />,
    path: "/invoices",
    module: "invoices",
  },
  {
    label: "المدفوعات",
    icon: <CreditCard size={20} strokeWidth={1.9} />,
    path: "/payments",
    module: "payments",
  },
  {
    label: "صندوق العهدة",
    icon: <Wallet size={20} strokeWidth={1.9} />,
    path: "/fund",
    module: "fund",
  },
];

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  useAppLockStore();

  const currentIndex = navItems.findIndex((item) => {
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  });

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pb: "calc(72px + env(safe-area-inset-bottom))",
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
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Outlet />
      </Box>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        showLabels
        sx={{
          direction: "rtl",
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};
