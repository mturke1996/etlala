import { alpha } from "@mui/material";
import { premiumTokens } from "../../theme/tokens";

export const DESKTOP_NUM_FONT =
  '"Sora","Montserrat","Outfit","Cairo",sans-serif';

export const desktopPaperSx = (isDark: boolean) => ({
  bgcolor: isDark ? "#1A221C" : "#FFFFFF",
  border: `1px solid ${isDark ? alpha("#fff", 0.08) : "rgba(31, 37, 33, 0.07)"}`,
  borderRadius: "16px",
  boxShadow: isDark
    ? "0 8px 28px rgba(0,0,0,0.28)"
    : "0 1px 2px rgba(31, 37, 33, 0.04), 0 10px 28px rgba(31, 37, 33, 0.05)",
});

export const desktopHairline = (isDark: boolean) =>
  isDark ? alpha("#fff", 0.08) : "rgba(31, 37, 33, 0.07)";

export const desktopMuted = (isDark: boolean) =>
  isDark ? alpha("#F4F1EC", 0.58) : alpha(premiumTokens.text, 0.58);
