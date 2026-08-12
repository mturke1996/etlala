import type { ReactNode } from "react";
import { Box, IconButton, Stack, Typography, alpha, useTheme } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useIsDesktopLayout } from "../../hooks/useIsDesktopLayout";
import { desktopHairline } from "./desktopChrome";

/** إطار داخلي لقوائم ملف العميل — يملأ لوحة سطح المكتب دون 100dvh */
export function ProfileWorkspaceFrame({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktopLayout();
  return (
    <Box
      className={isDesktop ? undefined : "etlala-fill-viewport"}
      sx={{
        bgcolor: "background.default",
        height: "100%",
        minHeight: isDesktop ? 0 : "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

type ProfileFormDialogHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  endAdornment?: ReactNode;
  mobileGradient: string;
};

/** رأس نموذج: هيرو جوال كما هو، شريط أوامر فاتح على سطح المكتب */
export function ProfileFormDialogHeader({
  title,
  subtitle,
  onBack,
  endAdornment,
  mobileGradient,
}: ProfileFormDialogHeaderProps) {
  const isDesktop = useIsDesktopLayout();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (isDesktop) {
    const hairline = desktopHairline(isDark);
    return (
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: isDark ? "#161C18" : "#FFFFFF",
          borderBottom: `1px solid ${hairline}`,
          px: 2.5,
          py: 1.75,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <IconButton
            onClick={onBack}
            aria-label="رجوع"
            sx={{
              width: 40,
              height: 40,
              borderRadius: "11px",
              border: `1px solid ${hairline}`,
              bgcolor: isDark ? alpha("#fff", 0.05) : "#F8F8F8",
              color: "text.primary",
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: "1.08rem", lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.25 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {endAdornment ? <Box sx={{ flexShrink: 0 }}>{endAdornment}</Box> : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        background: mobileGradient,
        color: "white",
        p: 2,
        pt: "calc(max(env(safe-area-inset-top), 50px) + 16px)",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <IconButton onClick={onBack} sx={{ color: "white" }} aria-label="رجوع">
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.75, fontWeight: 500 }} noWrap>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {endAdornment ? <Box sx={{ flexShrink: 0 }}>{endAdornment}</Box> : null}
      </Stack>
    </Box>
  );
}
