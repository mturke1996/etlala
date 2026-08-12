import type { ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { desktopHairline, desktopPaperSx } from "./desktopChrome";

export type DesktopTableColumn = {
  key: string;
  label: string;
  width?: string | number;
  align?: "start" | "end";
};

type DesktopRecordTableProps = {
  columns: DesktopTableColumn[];
  children: ReactNode;
  empty?: ReactNode;
};

export function DesktopRecordTable({
  columns,
  children,
  empty,
}: DesktopRecordTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);

  return (
    <Box sx={{ ...desktopPaperSx(isDark), overflow: "hidden" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: columns.map((c) => c.width || "minmax(0, 1fr)").join(" "),
          gap: 1.5,
          px: 2,
          py: 1.15,
          borderBottom: `1px solid ${hairline}`,
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(47, 62, 52, 0.03)",
        }}
      >
        {columns.map((col) => (
          <Typography
            key={col.key}
            sx={{
              fontSize: "0.68rem",
              fontWeight: 750,
              color: "text.secondary",
              textAlign: col.align === "end" ? "end" : "start",
            }}
          >
            {col.label}
          </Typography>
        ))}
      </Box>
      <Box>{children || empty}</Box>
    </Box>
  );
}

export function DesktopRecordRow({
  columns,
  cells,
  onClick,
}: {
  columns: DesktopTableColumn[];
  cells: ReactNode[];
  onClick?: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);

  return (
    <Box
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      sx={{
        appearance: "none",
        border: "none",
        width: "100%",
        display: "grid",
        gridTemplateColumns: columns.map((c) => c.width || "minmax(0, 1fr)").join(" "),
        gap: 1.5,
        px: 2,
        py: 1.35,
        bgcolor: "transparent",
        color: "inherit",
        textAlign: "inherit",
        cursor: onClick ? "pointer" : "default",
        borderBottom: `1px solid ${hairline}`,
        "&:last-child": { borderBottom: "none" },
        transition: "background 140ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(47, 62, 52, 0.035)",
          },
        },
      }}
    >
      {cells.map((cell, i) => (
        <Box
          key={columns[i]?.key || i}
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: columns[i]?.align === "end" ? "flex-end" : "flex-start",
          }}
        >
          {cell}
        </Box>
      ))}
    </Box>
  );
}
