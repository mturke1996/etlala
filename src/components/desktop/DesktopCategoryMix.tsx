import { Box, Typography, alpha, useTheme } from "@mui/material";
import { formatCurrency, getExpenseCategoryLabel } from "../../utils/formatters";
import type { ExpenseMixItem, InvoiceExposure } from "../../utils/desktopAnalytics";
import { DESKTOP_NUM_FONT, desktopHairline, desktopPaperSx } from "./desktopChrome";
import { premiumTokens } from "../../theme/tokens";

type DesktopCategoryMixProps = {
  items: ExpenseMixItem[];
  exposure: InvoiceExposure;
};

export function DesktopCategoryMix({ items, exposure }: DesktopCategoryMixProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);
  const max = Math.max(...items.map((i) => i.amount), 1);

  return (
    <Box
      sx={{
        ...desktopPaperSx(isDark),
        p: 2.5,
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>توزيع المصروفات</Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.35 }}>
          أعلى التصنيفات في السجل الحالي
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 1.15, flex: 1 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              border: `1px dashed ${hairline}`,
            }}
          >
            <Typography sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
              لا توجد مصروفات للتحليل
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box key={item.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.45 }}>
                <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
                  {item.key === "other" ? "أخرى" : getExpenseCategoryLabel(item.key)}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", fontFamily: DESKTOP_NUM_FONT, fontWeight: 750, color: "text.secondary", flexShrink: 0 }}>
                  {formatCurrency(item.amount)}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 99,
                  bgcolor: isDark ? alpha("#fff", 0.06) : "rgba(47, 62, 52, 0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${Math.max(6, (item.amount / max) * 100)}%`,
                    borderRadius: 99,
                    bgcolor: premiumTokens.primary,
                    opacity: 0.55 + item.share * 0.45,
                  }}
                />
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box
        sx={{
          mt: "auto",
          pt: 1.75,
          borderTop: `1px solid ${hairline}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.25,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary" }}>
            فواتير مفتوحة
          </Typography>
          <Typography sx={{ fontFamily: DESKTOP_NUM_FONT, fontWeight: 800, fontSize: "1.05rem", mt: 0.35 }}>
            {exposure.openCount}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: DESKTOP_NUM_FONT }}>
            {formatCurrency(exposure.openAmount)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary" }}>
            متأخرة
          </Typography>
          <Typography
            sx={{
              fontFamily: DESKTOP_NUM_FONT,
              fontWeight: 800,
              fontSize: "1.05rem",
              mt: 0.35,
              color: exposure.overdueCount > 0 ? "#b54747" : "text.primary",
            }}
          >
            {exposure.overdueCount}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            تحتاج متابعة
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
