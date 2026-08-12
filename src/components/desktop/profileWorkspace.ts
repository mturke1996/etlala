import type { DialogProps } from "@mui/material";

const LIST_PAPER_DESKTOP = {
  m: 2,
  width: "min(1280px, calc(100vw - 48px))",
  maxWidth: 1280,
  height: "min(90dvh, 940px)",
  maxHeight: "90dvh",
  borderRadius: "16px",
  overflow: "hidden",
  bgcolor: "background.default",
  boxShadow: "0 28px 80px rgba(20, 28, 22, 0.22)",
} as const;

const LIST_PAPER_MOBILE = {
  m: 0,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "100%",
  overflow: "hidden",
  bgcolor: "transparent",
  boxShadow: "none",
} as const;

export function profileListDialogSlotProps(isDesktop: boolean): DialogProps["slotProps"] {
  return {
    paper: {
      className: isDesktop ? "etlala-profile-workspace" : "etlala-fill-viewport",
      sx: isDesktop ? LIST_PAPER_DESKTOP : LIST_PAPER_MOBILE,
    },
  };
}

/** قوائم داخل ملف العميل: جوال = شاشة كاملة، سطح المكتب = لوحة عمل عريضة */
export function profileListDialogProps(isDesktop: boolean): Pick<
  DialogProps,
  "fullScreen" | "maxWidth" | "fullWidth" | "slotProps"
> {
  return {
    fullScreen: !isDesktop,
    maxWidth: false,
    fullWidth: true,
    slotProps: profileListDialogSlotProps(isDesktop),
  };
}

/** نماذج إضافة/تعديل: جوال = شاشة كاملة، سطح المكتب = نافذة متمركزة */
export function profileFormDialogProps(
  isDesktop: boolean,
  size: "sm" | "md" = "sm",
): Pick<DialogProps, "fullScreen" | "maxWidth" | "fullWidth" | "slotProps"> {
  return {
    fullScreen: !isDesktop,
    maxWidth: isDesktop ? size : false,
    fullWidth: true,
    slotProps: {
      paper: {
        className: isDesktop
          ? size === "md"
            ? "etlala-profile-form etlala-profile-form--wide"
            : "etlala-profile-form"
          : undefined,
        sx: isDesktop
          ? {
              borderRadius: "16px",
              maxHeight: "88dvh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }
          : undefined,
      },
    },
  };
}
