import { lazy, Suspense, type ElementType } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  CreditCard,
  FileText,
  Pencil,
  Phone,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { buildMonthlyTrend } from "../../utils/desktopAnalytics";
import { premiumTokens } from "../../theme/tokens";
import { DesktopKpiBento } from "./DesktopKpiBento";
import { ClientDeficitAlerts } from "../client/ClientDeficitAlerts";
import {
  DESKTOP_NUM_FONT,
  desktopHairline,
  desktopPaperSx,
} from "./desktopChrome";

const DesktopTrendChart = lazy(() => import("./DesktopTrendChart"));

type MenuItem = {
  title: string;
  icon: ElementType;
  color: string;
  onClick: () => void;
};

type ClientLike = {
  name: string;
  phone: string;
  address?: string;
  type: "company" | "individual";
};

type SummaryLike = {
  totalPaid: number;
  totalExpenses: number;
  totalDebts: number;
  remaining: number;
  profit: number;
  profitPercentage: number;
  clientDeficit: number;
  agreedPercentageDeficit: number;
  requiredCollection: number;
};

type PaymentLike = {
  id: string;
  amount: number;
  paymentDate?: string;
  createdAt?: string;
  notes?: string;
};

type ExpenseLike = {
  id: string;
  amount: number;
  description?: string;
  date?: string;
  createdAt?: string;
};

type ClientProfileDesktopProps = {
  client: ClientLike;
  activitySummary: string;
  summary: SummaryLike;
  canSeeStats: boolean;
  overspent: boolean;
  negativeRemaining: boolean;
  depletedNames: string[];
  menuItems: MenuItem[];
  payments: PaymentLike[];
  expenses: ExpenseLike[];
  onBack: () => void;
  onEdit: () => void;
};

export function ClientProfileDesktop({
  client,
  activitySummary,
  summary,
  canSeeStats,
  overspent,
  negativeRemaining,
  depletedNames,
  menuItems,
  payments,
  expenses,
  onBack,
  onEdit,
}: ClientProfileDesktopProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isCo = client.type === "company";
  const hairline = desktopHairline(isDark);
  const trend = buildMonthlyTrend(payments, expenses, 6);
  const recentPay = [...payments]
    .sort(
      (a, b) =>
        new Date(b.paymentDate || b.createdAt || 0).getTime() -
        new Date(a.paymentDate || a.createdAt || 0).getTime(),
    )
    .slice(0, 5);
  const recentExp = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0).getTime() -
        new Date(a.date || a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", pb: 5 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: isDark ? alpha("#141A16", 0.92) : alpha("#F8F8F8", 0.92),
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${hairline}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            px: 3.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.75,
          }}
        >
          <IconButton
            onClick={onBack}
            aria-label="رجوع للعملاء"
            sx={{
              width: 40,
              height: 40,
              borderRadius: "11px",
              border: `1px solid ${hairline}`,
              bgcolor: isDark ? alpha("#fff", 0.05) : "#fff",
            }}
          >
            <ArrowRight size={18} />
          </IconButton>
          <Avatar
            sx={{
              width: 46,
              height: 46,
              borderRadius: "13px",
              bgcolor: isCo
                ? alpha(premiumTokens.accent, 0.22)
                : alpha(premiumTokens.primary, 0.12),
              color: premiumTokens.primaryDark,
            }}
          >
            {isCo ? <Building2 size={20} /> : <User size={20} />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                {client.name}
              </Typography>
              <Chip
                size="small"
                label={isCo ? "شركة" : "فرد"}
                sx={{ height: 22, fontWeight: 750, fontSize: "0.68rem" }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 0.4 }}>
              <Typography
                component="a"
                href={`tel:${client.phone}`}
                dir="ltr"
                sx={{
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Phone size={13} />
                {client.phone}
              </Typography>
              {client.address ? (
                <Typography noWrap sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  {client.address}
                </Typography>
              ) : null}
            </Stack>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<Pencil size={14} />}
            onClick={onEdit}
            sx={{
              minHeight: 40,
              borderRadius: "11px",
              bgcolor: premiumTokens.primary,
              fontWeight: 800,
            }}
          >
            تعديل
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: "auto", px: 3.5, pt: 3 }}>
        {activitySummary ? (
          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", mb: 2 }}>
            {activitySummary}
          </Typography>
        ) : null}

        <Stack spacing={1.25} sx={{ mb: 2.5 }}>
          {canSeeStats && (negativeRemaining || overspent) ? (
            <ClientDeficitAlerts
              clientDeficit={summary.clientDeficit}
              agreedPercentageDeficit={summary.agreedPercentageDeficit}
              requiredCollection={summary.requiredCollection}
              profitPercentage={summary.profitPercentage}
              overspent={overspent}
              surface="light"
            />
          ) : null}
          {depletedNames.map((name) => (
            <Alert key={name} severity="warning" sx={{ borderRadius: "12px", fontWeight: 700 }}>
              نفد رصيد العهدة الخاص بـ {name}
            </Alert>
          ))}
        </Stack>

        {canSeeStats ? (
          <Box sx={{ mb: 3 }}>
            <DesktopKpiBento
              items={[
                {
                  key: "remain",
                  label: "المتبقي",
                  value:
                    summary.remaining < 0
                      ? `−${formatCurrency(Math.abs(summary.remaining))}`
                      : formatCurrency(summary.remaining),
                  hint:
                    summary.remaining < 0
                      ? "عجز مالي بعد الالتزامات"
                      : "رصيد متاح بعد الالتزامات",
                  tone: summary.remaining < 0 ? "danger" : "ok",
                  featured: true,
                  icon: <Wallet size={18} />,
                  badge: summary.remaining < 0 ? "عجز" : undefined,
                },
                {
                  key: "paid",
                  label: "المدفوعات",
                  value: formatCurrency(summary.totalPaid),
                  icon: <CreditCard size={16} />,
                },
                {
                  key: "exp",
                  label: "المصروفات",
                  value: formatCurrency(summary.totalExpenses),
                  icon: <Receipt size={16} />,
                },
                {
                  key: "debts",
                  label: "الديون المتبقية",
                  value: formatCurrency(summary.totalDebts),
                  icon: <CircleDollarSign size={16} />,
                },
                {
                  key: "profit",
                  label: "النسبة المتفق عليها",
                  // النسبة رقم بارز، والمبلغ يظهر صغيراً في السطر السفلي
                  value:
                    summary.profitPercentage > 0
                      ? `${summary.profitPercentage}%`
                      : "غير محددة",
                  tone: "default",
                  hintTone: summary.agreedPercentageDeficit > 0 ? "warn" : "default",
                  hint:
                    summary.profitPercentage <= 0
                      ? "حدّد النسبة من الإجراءات"
                      : `صافي النسبة ${formatCurrency(summary.profit)}`,
                  icon: <FileText size={16} />,
                },
              ]}
            />
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 0.9fr)",
            gap: 2,
            mb: 3,
            alignItems: "stretch",
          }}
        >
          <Suspense fallback={<Skeleton variant="rounded" height={320} sx={{ borderRadius: "16px" }} />}>
            <DesktopTrendChart
              data={trend}
              title="حركة المشروع"
              subtitle="تحصيل ومصروفات هذا العميل لآخر 6 أشهر"
            />
          </Suspense>
          <Box sx={{ ...desktopPaperSx(isDark), p: 1.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", px: 1, pt: 1, pb: 1.25 }}>
              الإجراءات
            </Typography>
            <Box sx={{ display: "grid", gap: 0.35 }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.title}
                    component="button"
                    type="button"
                    onClick={item.onClick}
                    sx={{
                      appearance: "none",
                      border: "none",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.15,
                      px: 1.15,
                      py: 1,
                      borderRadius: "11px",
                      bgcolor: "transparent",
                      cursor: "pointer",
                      color: "text.primary",
                      textAlign: "right",
                      transition: "background 140ms ease",
                      "@media (hover: hover)": {
                        "&:hover": {
                          bgcolor: isDark
                            ? alpha("#fff", 0.05)
                            : alpha(premiumTokens.primary, 0.05),
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "9px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(item.color, 0.12),
                        color: item.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 750, fontSize: "0.84rem", flex: 1 }}>
                      {item.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <ActivityList
            title="آخر المدفوعات"
            empty="لا مدفوعات بعد"
            isDark={isDark}
            rows={recentPay.map((p) => ({
              id: p.id,
              title: p.notes || "دفعة",
              meta: formatDate(p.paymentDate || p.createdAt || ""),
              amount: p.amount,
              positive: true,
            }))}
          />
          <ActivityList
            title="آخر المصروفات"
            empty="لا مصروفات بعد"
            isDark={isDark}
            rows={recentExp.map((e) => ({
              id: e.id,
              title: e.description || "مصروف",
              meta: formatDate(e.date || e.createdAt || ""),
              amount: e.amount,
              positive: false,
            }))}
          />
        </Box>
      </Box>
    </Box>
  );
}

function ActivityList({
  title,
  empty,
  rows,
  isDark,
}: {
  title: string;
  empty: string;
  isDark: boolean;
  rows: { id: string; title: string; meta: string; amount: number; positive: boolean }[];
}) {
  return (
    <Box sx={{ ...desktopPaperSx(isDark), overflow: "hidden" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", px: 2, pt: 1.75, pb: 1 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography sx={{ px: 2, pb: 2, color: "text.secondary", fontSize: "0.82rem" }}>
          {empty}
        </Typography>
      ) : (
        rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1.5,
              px: 2,
              py: 1.2,
              borderTop: `1px solid ${desktopHairline(isDark)}`,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.84rem" }}>
                {row.title}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                {row.meta}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: DESKTOP_NUM_FONT,
                fontVariantNumeric: "tabular-nums",
                fontWeight: 800,
                fontSize: "0.88rem",
                color: row.positive ? "#0d9668" : "#8b5a2b",
                flexShrink: 0,
              }}
            >
              {row.positive ? "+" : "-"}
              {formatCurrency(row.amount)}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}
