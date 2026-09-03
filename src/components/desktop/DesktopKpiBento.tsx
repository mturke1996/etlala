import type { ReactNode } from "react";
import { Box, Chip, Typography, alpha, useTheme } from "@mui/material";
import { DESKTOP_NUM_FONT, desktopPaperSx } from "./desktopChrome";

export type DesktopKpiBreakdown = {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "default" | "ok" | "warn" | "danger";
};

export type DesktopKpi = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  hintTone?: "default" | "ok" | "warn" | "danger";
  tone?: "default" | "ok" | "warn" | "danger";
  icon?: ReactNode;
  featured?: boolean;
  badge?: string;
  breakdown?: DesktopKpiBreakdown[];
};

const toneColor = (tone: DesktopKpi["tone"], isDark: boolean) => {
  if (tone === "ok") return isDark ? "#6ee7b7" : "#0d9668";
  if (tone === "warn") return isDark ? "#fbbf24" : "#b45309";
  if (tone === "danger") return isDark ? "#fda4a4" : "#b54747";
  return undefined;
};

export function DesktopKpiBento({ items }: { items: DesktopKpi[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const featured = items.find((i) => i.featured) ?? items[0];
  const rest = items.filter((i) => i.key !== featured?.key);

  if (!featured) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr)",
        gridTemplateRows: "auto auto",
        gap: 1.5,
      }}
    >
      <KpiTile item={featured} featured isDark={isDark} />
      {rest.map((item) => (
        <KpiTile key={item.key} item={item} isDark={isDark} />
      ))}
    </Box>
  );
}

function KpiTile({
  item,
  featured,
  isDark,
}: {
  item: DesktopKpi;
  featured?: boolean;
  isDark: boolean;
}) {
  const color = toneColor(item.tone, isDark);
  return (
    <Box
      sx={{
        ...desktopPaperSx(isDark),
        p: featured ? 2.5 : 2,
        gridRow: featured ? "1 / span 2" : "auto",
        minHeight: featured ? 168 : 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: featured ? 1.5 : 1,
        transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": { transform: "translateY(-2px)" },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography
            sx={{
              fontSize: featured ? "0.82rem" : "0.72rem",
              fontWeight: 750,
              color: "text.secondary",
            }}
          >
            {item.label}
          </Typography>
          {item.badge ? (
            <Chip
              size="small"
              label={item.badge}
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 750,
                bgcolor:
                  item.tone === "danger"
                    ? isDark
                      ? alpha("#fda4a4", 0.14)
                      : alpha("#b54747", 0.08)
                    : isDark
                    ? alpha("#fff", 0.08)
                    : alpha("#000", 0.05),
                color:
                  item.tone === "danger"
                    ? isDark
                      ? "#fda4a4"
                      : "#b54747"
                    : "text.secondary",
                border: `1px solid ${
                  item.tone === "danger"
                    ? isDark
                      ? alpha("#fda4a4", 0.28)
                      : alpha("#b54747", 0.18)
                    : "transparent"
                }`,
              }}
            />
          ) : null}
        </Box>
        {item.icon ? (
          <Box
            sx={{
              width: featured ? 40 : 32,
              height: featured ? 40 : 32,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: isDark ? alpha("#fff", 0.06) : alpha("#2F3E34", 0.06),
              color: color || "text.primary",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>
        ) : null}
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: DESKTOP_NUM_FONT,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 800,
            fontSize: featured ? "1.85rem" : "1.12rem",
            lineHeight: 1.2,
            color: color || "text.primary",
            mt: featured ? 0.25 : 1,
          }}
        >
          {item.value}
        </Typography>
        {item.hint ? (
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: toneColor(item.hintTone, isDark) || "text.secondary",
              fontWeight: item.hintTone && item.hintTone !== "default" ? 700 : 400,
              mt: 0.5,
            }}
          >
            {item.hint}
          </Typography>
        ) : null}
      </Box>

      {item.breakdown && item.breakdown.length > 0 ? (
        <Box
          sx={{
            mt: "auto",
            pt: 1.25,
            pb: 1.25,
            px: 1.5,
            borderRadius: "12px",
            bgcolor:
              item.tone === "danger"
                ? isDark
                  ? alpha("#fda4a4", 0.06)
                  : alpha("#b54747", 0.04)
                : isDark
                ? alpha("#fff", 0.04)
                : alpha("#2F3E34", 0.03),
            border: `1px solid ${
              item.tone === "danger"
                ? isDark
                  ? alpha("#fda4a4", 0.18)
                  : alpha("#b54747", 0.12)
                : isDark
                ? alpha("#fff", 0.06)
                : alpha("#2F3E34", 0.07)
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          {item.breakdown.map((b, idx) => {
            const bColor =
              toneColor(b.tone, isDark) || (b.highlight ? color : undefined);
            return (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  borderInlineStart:
                    idx > 0
                      ? `1px solid ${
                          item.tone === "danger"
                            ? isDark
                              ? alpha("#fda4a4", 0.2)
                              : alpha("#b54747", 0.15)
                            : isDark
                            ? alpha("#fff", 0.08)
                            : alpha("#000", 0.08)
                        }`
                      : "none",
                  ps: idx > 0 ? 1.5 : 0,
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.68rem",
                    color: b.highlight && bColor ? bColor : "text.secondary",
                    fontWeight: b.highlight ? 750 : 600,
                    mb: 0.25,
                  }}
                >
                  {b.label}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontFamily: DESKTOP_NUM_FONT,
                    fontVariantNumeric: "tabular-nums",
                    fontSize: b.highlight ? "1rem" : "0.9rem",
                    fontWeight: b.highlight ? 850 : 750,
                    color: bColor || "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  {b.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
