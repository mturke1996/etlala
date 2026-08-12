import { Box, Typography, alpha, useTheme } from "@mui/material";
import { ChevronLeft, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { DESKTOP_NUM_FONT, desktopHairline, desktopPaperSx } from "./desktopChrome";
import { premiumTokens } from "../../theme/tokens";

type DesktopCustodyFundCardProps = {
  name: string;
  deposited: number;
  spent: number;
  remaining: number;
  canOpen: boolean;
  onOpen: () => void;
};

export function DesktopCustodyFundCard({
  name,
  deposited,
  spent,
  remaining,
  canOpen,
  onOpen,
}: DesktopCustodyFundCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);
  const deficit = remaining < 0;
  const base = Math.max(deposited, 1);
  const usedPct = Math.min(100, Math.max(0, (spent / base) * 100));
  const statusLabel = deficit ? "عجز" : remaining === 0 ? "منتهية" : "نشطة";
  const statusColor = deficit ? "#b54747" : remaining === 0 ? "#b45309" : "#0d9668";

  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      aria-label="صندوق العهدة"
      sx={{
        appearance: "none",
        width: "100%",
        textAlign: "inherit",
        cursor: "pointer",
        ...desktopPaperSx(isDark),
        p: 0,
        overflow: "hidden",
        color: "inherit",
        position: "relative",
        transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: isDark
              ? "0 12px 32px rgba(0,0,0,0.36)"
              : "0 2px 4px rgba(31, 37, 33, 0.04), 0 16px 36px rgba(31, 37, 33, 0.08)",
          },
        },
      }}
    >
      <Box
        sx={{
          height: 3,
          background: deficit
            ? "linear-gradient(90deg, #b54747, #d97777)"
            : `linear-gradient(90deg, ${premiumTokens.accent}, ${premiumTokens.primary})`,
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 1.15fr) minmax(200px, 1fr) minmax(240px, 1.45fr) auto",
          alignItems: "center",
          gap: 3,
          px: 2.75,
          py: 2.35,
          "@media (max-width: 1400px)": {
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
            "& > :nth-of-type(3)": { gridColumn: "1 / -1" },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              bgcolor: isDark ? alpha("#C2B280", 0.14) : alpha(premiumTokens.primary, 0.08),
              color: isDark ? "#C2B280" : premiumTokens.primary,
              flexShrink: 0,
            }}
          >
            <Wallet size={20} strokeWidth={1.9} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.02rem", lineHeight: 1.2 }}>
              صندوق العهدة
            </Typography>
            <Typography noWrap sx={{ fontSize: "0.76rem", color: "text.secondary", mt: 0.35 }}>
              {name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 750, color: "text.secondary", mb: 0.45 }}>
            الرصيد المتاح
          </Typography>
          <Typography
            dir="ltr"
            sx={{
              fontFamily: DESKTOP_NUM_FONT,
              fontVariantNumeric: "tabular-nums",
              fontWeight: 800,
              fontSize: "1.72rem",
              lineHeight: 1.1,
              color: deficit ? "#b54747" : "text.primary",
            }}
          >
            {deficit ? "−" : ""}
            {formatCurrency(Math.abs(remaining))}
          </Typography>
          <Box
            sx={{
              mt: 0.7,
              display: "inline-flex",
              alignItems: "center",
              px: 0.9,
              py: 0.2,
              borderRadius: 99,
              bgcolor: alpha(statusColor, isDark ? 0.16 : 0.1),
              border: `1px solid ${alpha(statusColor, 0.28)}`,
            }}
          >
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, color: statusColor }}>
              {statusLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary" }}>
              المنفّذ من المودع
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", fontFamily: DESKTOP_NUM_FONT, fontWeight: 800 }}>
              {Math.round(usedPct)}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 7,
              borderRadius: 99,
              bgcolor: isDark ? alpha("#fff", 0.06) : "rgba(47, 62, 52, 0.08)",
              overflow: "hidden",
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${usedPct}%`,
                bgcolor: deficit ? "#b54747" : premiumTokens.primary,
              }}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            {[
              { label: "المودع", value: formatCurrency(deposited) },
              { label: "المنفّذ", value: formatCurrency(spent) },
              {
                label: deficit ? "العجز" : "المتبقي",
                value: formatCurrency(Math.abs(remaining)),
                danger: deficit,
              },
            ].map((cell, i) => (
              <Box
                key={cell.label}
                sx={{
                  px: 1.1,
                  borderInlineEnd: i < 2 ? `1px solid ${hairline}` : "none",
                }}
              >
                <Typography sx={{ fontSize: "0.64rem", fontWeight: 700, color: "text.secondary" }}>
                  {cell.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: DESKTOP_NUM_FONT,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    mt: 0.35,
                    color: cell.danger ? "#b54747" : "text.primary",
                  }}
                >
                  {cell.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.45,
            color: "text.secondary",
            flexShrink: 0,
            fontSize: "0.8rem",
            fontWeight: 750,
            whiteSpace: "nowrap",
            pl: 0.5,
          }}
        >
          {canOpen ? "فتح الصندوق" : "عرض محدود"}
          <ChevronLeft size={16} strokeWidth={2.1} />
        </Box>
      </Box>
    </Box>
  );
}
