import type { ReactNode } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { DESKTOP_NUM_FONT, desktopPaperSx } from "./desktopChrome";

export type DesktopKpi = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "danger";
  icon?: ReactNode;
  featured?: boolean;
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
        p: featured ? 2.75 : 2,
        gridRow: featured ? "1 / span 2" : "auto",
        minHeight: featured ? 168 : 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": { transform: "translateY(-2px)" },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Typography
          sx={{
            fontSize: featured ? "0.8rem" : "0.72rem",
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          {item.label}
        </Typography>
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
            mt: 1,
          }}
        >
          {item.value}
        </Typography>
        {item.hint ? (
          <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.5 }}>
            {item.hint}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
