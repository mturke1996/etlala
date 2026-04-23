import { Box } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

type HeroLogoProps = {
  size?: number;
  /** تخطٍ أقل للهيرو المدمج */ compact?: boolean;
  /** بدون حلقات ولا قرص أبيض — شعار فقط (يُناسب خلفية خضراء) */
  plain?: boolean;
};

/** شعار الهيرو — حلقات خفيفة، قرص زجاجي، حركة ناعمة (أو `plain` للعُرف البسيط) */
export function HeroLogo({ size = 200, compact = false, plain = false }: HeroLogoProps) {
  const reduce = useReducedMotion();
  const ringOuter = compact ? 48 : 100;
  const ringInner = compact ? 28 : 64;
  const discPad = compact ? 24 : 36;

  if (plain) {
    return (
      <Box
        className="etlala-hero-logo-root etlala-hero-logo-root--plain"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: 1, mb: compact ? 0.8 : 0.5 }}
      >
        <Logo size={size} variant="hero" showSubtitle={false} />
      </Box>
    );
  }

  return (
    <Box
      className="etlala-hero-logo-root"
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 1,
        py: compact ? 0 : { xs: 1, sm: 1.5 },
        mb: compact ? 0 : 0.5,
      }}
    >
      {/* حلقات خلفية نابضة */}
      <Box
        className="etlala-hero-logo-ring etlala-hero-logo-ring--1"
        aria-hidden
        sx={{
          position: "absolute",
          width: { xs: size + ringOuter, sm: size + ringOuter + 16 },
          height: { xs: size + ringOuter, sm: size + ringOuter + 16 },
          borderRadius: "50%",
          border: "1px solid rgba(200, 192, 176, 0.12)",
          boxShadow: "0 0 40px rgba(200, 192, 176, 0.06)",
        }}
      />
      <Box
        className="etlala-hero-logo-ring etlala-hero-logo-ring--2"
        aria-hidden
        sx={{
          position: "absolute",
          width: { xs: size + ringInner, sm: size + ringInner + 8 },
          height: { xs: size + ringInner, sm: size + ringInner + 8 },
          borderRadius: "50%",
          border: "1px solid rgba(130, 160, 130, 0.18)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: size + discPad, sm: size + discPad + 6 },
          height: { xs: size + discPad, sm: size + discPad + 6 },
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(0,0,0,0.12) 100%)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.25) inset,
            0 24px 56px -12px rgba(0,0,0,0.45),
            0 0 80px -20px rgba(200, 192, 176, 0.25)
          `,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(200, 192, 176, 0.2) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={false}
          animate={reduce ? {} : { y: [0, compact ? -3 : -5, 0] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: compact ? 5.2 : 4.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Logo size={size} variant="hero" showSubtitle={false} />
        </motion.div>
      </Box>
    </Box>
  );
}
