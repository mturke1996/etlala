import { Box, Typography, alpha, useTheme } from "@mui/material";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";
import type { MonthlyTrendPoint } from "../../utils/desktopAnalytics";
import { premiumTokens } from "../../theme/tokens";
import { DESKTOP_NUM_FONT, desktopPaperSx } from "./desktopChrome";

type DesktopTrendChartProps = {
  data: MonthlyTrendPoint[];
  title?: string;
  subtitle?: string;
};

export default function DesktopTrendChart({
  data,
  title = "حركة الاثني عشر شهراً",
  subtitle = "المحصّل، المصروف، والصافي",
}: DesktopTrendChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hasSignal = data.some((d) => d.collected > 0 || d.spent > 0);
  const hairline = isDark ? alpha("#fff", 0.1) : "rgba(31, 37, 33, 0.08)";

  return (
    <Box sx={{ ...desktopPaperSx(isDark), p: 2.5, height: "100%", minHeight: 380 }}>
      <Box sx={{ mb: 1.75, display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-end" }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "text.primary" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.35 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {!hasSignal ? (
        <Box
          sx={{
            height: 280,
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            border: `1px dashed ${isDark ? alpha("#fff", 0.12) : "rgba(31, 37, 33, 0.12)"}`,
          }}
        >
          <Typography sx={{ color: "text.secondary", fontSize: "0.86rem" }}>
            لا توجد حركة كافية لرسم التحليل بعد
          </Typography>
        </Box>
      ) : (
        <Box dir="ltr" sx={{ height: 318, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="etlalaCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={premiumTokens.primary} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={premiumTokens.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke={isDark ? alpha("#fff", 0.08) : "rgba(31, 37, 33, 0.07)"}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: isDark ? alpha("#F4F1EC", 0.55) : "#6B736E", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? alpha("#F4F1EC", 0.45) : "#6B736E", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "collected" ? "المحصّل" : name === "spent" ? "المصروفات" : "الصافي",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${hairline}`,
                  background: isDark ? "#1A221C" : "#fff",
                  fontFamily: DESKTOP_NUM_FONT,
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "collected" ? "المحصّل" : value === "spent" ? "المصروفات" : "الصافي"
                }
                wrapperStyle={{ fontSize: 12, fontFamily: "Cairo, Tajawal, sans-serif" }}
              />
              <Bar
                dataKey="spent"
                fill={isDark ? "#a67c52" : "#8b5a2b"}
                radius={[4, 4, 0, 0]}
                barSize={14}
                name="spent"
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke={premiumTokens.primary}
                strokeWidth={2.2}
                fill="url(#etlalaCollected)"
                name="collected"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke={premiumTokens.accent}
                strokeWidth={2}
                dot={false}
                name="net"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
