import { useMediaQuery, useTheme } from "@mui/material";

/** ≥1200px — تخطيط سطح المكتب الاحترافي؛ أقل من ذلك يبقى إطار الجوال كما هو */
export const DESKTOP_LAYOUT_BREAKPOINT: "lg" = "lg";

export function useIsDesktopLayout() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(DESKTOP_LAYOUT_BREAKPOINT));
}
