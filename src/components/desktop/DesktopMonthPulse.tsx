import { Box, Typography, alpha, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils/formatters";
import type { MonthPulse } from "../../utils/desktopAnalytics";
import { DESKTOP_NUM_FONT, desktopHairline, desktopPaperSx } from "./desktopChrome";

const deltaLabel = (value: number | null) => {
  if (value === null) return "لا مقارنة";
  const abs = Math.abs(value).toFixed(0);
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `−${abs}%`;
  return "0%";
};

type DesktopMonthPulseProps = {
  pulse: MonthPulse;
};

export function DesktopMonthPulse({ pulse }: DesktopMonthPulseProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);
  const coveragePct = pulse.coverage === null ? 0 : Math.min(100, pulse.coverage * 100);

  return (
    <Box
      sx={{
        ...desktopPaperSx(isDark),
        p: 2.5,
        height: "100%",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.75,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.02rem" }}>نبض هذا الشهر</Typography>
        <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", mt: 0.3 }}>
          مقارنة بالشهر السابق
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.25 }}>
        {[
          { label: "المحصّل", value: pulse.collected, delta: pulse.collectedDelta, ok: true },
          { label: "المصروف", value: pulse.spent, delta: pulse.spentDelta, ok: false },
          { label: "الصافي", value: pulse.net, delta: null, ok: pulse.net >= 0 },
        ].map((cell) => (
          <Box key={cell.label}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary" }}>
              {cell.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: DESKTOP_NUM_FONT,
                fontWeight: 800,
                fontSize: "0.98rem",
                mt: 0.4,
                color: cell.label === "الصافي" ? (pulse.net >= 0 ? "#0d9668" : "#b54747") : "text.primary",
              }}
            >
              {formatCurrency(cell.value)}
            </Typography>
            {cell.delta !== undefined && cell.label !== "الصافي" ? (
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  mt: 0.25,
                  color:
                    cell.delta === null
                      ? "text.secondary"
                      : cell.ok
                        ? cell.delta >= 0
                          ? "#0d9668"
                          : "#b54747"
                        : cell.delta > 0
                          ? "#b54747"
                          : "#0d9668",
                }}
              >
                {deltaLabel(cell.delta)}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "text.secondary" }}>
            تغطية المصروف من المحصّل
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", fontFamily: DESKTOP_NUM_FONT, fontWeight: 800 }}>
            {pulse.coverage === null ? "—" : `${Math.round(coveragePct)}%`}
          </Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: 99,
            bgcolor: isDark ? alpha("#fff", 0.06) : "rgba(47, 62, 52, 0.08)",
            overflow: "hidden",
            border: `1px solid ${hairline}`,
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${coveragePct}%`,
              bgcolor: coveragePct > 100 ? "#b54747" : "#2F3E34",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
