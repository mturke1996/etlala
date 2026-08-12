import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CircleDollarSign,
  CreditCard,
  FileText,
  Home,
  Receipt,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { AppModule } from "../store/useAppLockStore";

export type NavItemDef = {
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  path: string;
  module?: AppModule;
  /** يظهر في شريط التنقل السفلي (جوال) */
  bottomNav?: boolean;
  /** يظهر في الشريط الجانبي (سطح المكتب) */
  sidebar?: boolean;
  sidebarSection?: "primary" | "management";
};

/** مصدر واحد للتنقل — جوال (سفلي) + سطح مكتب (جانبي) */
export const APP_NAV_ITEMS: NavItemDef[] = [
  {
    label: "الرئيسية",
    icon: Home,
    path: "/",
    bottomNav: true,
    sidebar: true,
    sidebarSection: "primary",
  },
  {
    label: "العملاء",
    subtitle: "إدارة بيانات العملاء",
    icon: Users,
    path: "/clients",
    module: "clients",
    bottomNav: true,
    sidebar: true,
    sidebarSection: "primary",
  },
  {
    label: "الفواتير",
    subtitle: "إدارة وإنشاء الفواتير",
    icon: FileText,
    path: "/invoices",
    module: "invoices",
    bottomNav: true,
    sidebar: true,
    sidebarSection: "primary",
  },
  {
    label: "المدفوعات",
    subtitle: "متابعة المدفوعات",
    icon: CreditCard,
    path: "/payments",
    module: "payments",
    bottomNav: true,
    sidebar: true,
    sidebarSection: "primary",
  },
  {
    label: "العهدة",
    subtitle: "الرصيد والحركات المالية",
    icon: Wallet,
    path: "/fund",
    module: "balances",
    bottomNav: true,
    sidebar: true,
    sidebarSection: "primary",
  },
  {
    label: "المصروفات",
    subtitle: "مصروفات الشركة العامة",
    icon: Receipt,
    path: "/expenses",
    module: "expenses",
    sidebar: true,
    sidebarSection: "management",
  },
  {
    label: "الديون",
    subtitle: "إدارة الديون والأطراف",
    icon: CircleDollarSign,
    path: "/debts",
    module: "debts",
    sidebar: true,
    sidebarSection: "management",
  },
  {
    label: "المستخدمين",
    subtitle: "الموظفين والصلاحيات",
    icon: UserCog,
    path: "/users",
    module: "users",
    sidebar: true,
    sidebarSection: "management",
  },
  {
    label: "التقارير",
    subtitle: "الرسائل الرسمية والتقارير",
    icon: FileText,
    path: "/letters",
    module: "letters",
    sidebar: true,
    sidebarSection: "management",
  },
  {
    label: "العهــود",
    subtitle: "سجل العقود والعهود",
    icon: Building2,
    path: "/contracts",
    module: "letters",
    sidebar: true,
    sidebarSection: "management",
  },
];

export const isNavPathActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
};
