import { Box, Collapse, IconButton, Typography, alpha, useTheme } from "@mui/material";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { DESKTOP_NUM_FONT, desktopHairline, desktopPaperSx } from "./desktopChrome";
import { premiumTokens } from "../../theme/tokens";

export type DesktopCustodyExpense = {
  id?: string;
  description: string;
  clientName: string;
  date: string;
  category?: string;
  notes?: string;
  amount: number;
  usedAmount?: number;
};

export type DesktopCustodyRow = {
  id: string;
  ref: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  spent: number;
  remaining: number;
  carryOver?: number;
  expenses: DesktopCustodyExpense[];
  _raw?: unknown;
};

export type DesktopCustodyUserGroup = {
  name: string;
  uid: string;
  custodies: DesktopCustodyRow[];
};

const COLS =
  "minmax(0, 1.7fr) 108px minmax(110px, 0.85fr) minmax(110px, 0.85fr) minmax(110px, 0.9fr) 96px 92px";

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

const fmtDate = (d: string) => {
  const parts = String(d || "").slice(0, 10).split("-");
  if (parts.length !== 3) return d || "—";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function getStatus(remaining: number, amount: number, carryOver = 0) {
  const r = round2(remaining);
  const net = round2(Math.max(0, round2(amount) - round2(carryOver || 0)));
  if (r < 0) return { color: "#b54747", label: "متجاوزة" };
  if (r === 0) return { color: "#b45309", label: "منتهية" };
  if (net > 0 && r < net * 0.3) return { color: "#b45309", label: "منخفضة" };
  return { color: "#0d9668", label: "نشطة" };
}

type DesktopCustodyLedgerProps = {
  groups: DesktopCustodyUserGroup[];
  isAdmin: boolean;
  openId: string | null;
  onToggle: (id: string | null) => void;
  onEdit: (custody: DesktopCustodyRow) => void;
  onDelete: (id: string) => void;
};

export function DesktopCustodyLedger({
  groups,
  isAdmin,
  openId,
  onToggle,
  onEdit,
  onDelete,
}: DesktopCustodyLedgerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hairline = desktopHairline(isDark);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {groups.map((group) => {
        const userRemaining = group.custodies.reduce((s, c) => s + c.remaining, 0);
        const userDeposited = group.custodies.reduce((s, c) => s + c.amount, 0);
        const userSpent = group.custodies.reduce((s, c) => s + c.spent, 0);
        const deficit = userRemaining < 0;
        const usedPct = Math.min(100, Math.max(0, (userSpent / Math.max(userDeposited, 1)) * 100));

        return (
          <Box key={group.uid} sx={{ ...desktopPaperSx(isDark), overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(220px, 0.9fr) auto",
                alignItems: "center",
                gap: 2.5,
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${hairline}`,
                bgcolor: isDark ? "rgba(255,255,255,0.025)" : "rgba(47, 62, 52, 0.025)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    bgcolor: isDark ? alpha("#C2B280", 0.12) : alpha(premiumTokens.primary, 0.08),
                    color: isDark ? "#C2B280" : premiumTokens.primary,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                  }}
                >
                  {(group.name || "م").charAt(0)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 800, fontSize: "0.98rem", lineHeight: 1.2 }}>
                    {group.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.3 }}>
                    {group.custodies.length} عهدة · مودع {formatCurrency(userDeposited)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.55 }}>
                  <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: "text.secondary" }}>
                    استهلاك العهدة
                  </Typography>
                  <Typography sx={{ fontSize: "0.66rem", fontFamily: DESKTOP_NUM_FONT, fontWeight: 800 }}>
                    {Math.round(usedPct)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: isDark ? alpha("#fff", 0.06) : "rgba(47, 62, 52, 0.08)",
                    overflow: "hidden",
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
              </Box>

              <Box sx={{ textAlign: "start", minWidth: 140 }}>
                <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: "text.secondary" }}>
                  {deficit ? "عجز الرصيد" : "المتبقي المتاح"}
                </Typography>
                <Typography
                  dir="ltr"
                  sx={{
                    fontFamily: DESKTOP_NUM_FONT,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 800,
                    fontSize: "1.18rem",
                    color: deficit ? "#b54747" : "#0d9668",
                    mt: 0.25,
                  }}
                >
                  {deficit ? "−" : ""}
                  {formatCurrency(Math.abs(userRemaining))}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: 1.5,
                px: 2.25,
                py: 1.05,
                borderBottom: `1px solid ${hairline}`,
              }}
            >
              {["العهدة", "التاريخ", "المبلغ", "المنفّذ", "المتبقي", "الحالة", ""].map((label) => (
                <Typography
                  key={label || "actions"}
                  sx={{ fontSize: "0.66rem", fontWeight: 750, color: "text.secondary" }}
                >
                  {label}
                </Typography>
              ))}
            </Box>

            {group.custodies
              .slice()
              .reverse()
              .map((c) => {
                const st = getStatus(c.remaining, c.amount, c.carryOver || 0);
                const isOpen = openId === c.id;
                const rowDeficit = c.remaining < 0;

                return (
                  <Box key={c.id} sx={{ borderBottom: `1px solid ${hairline}`, "&:last-child": { borderBottom: "none" } }}>
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => onToggle(isOpen ? null : c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggle(isOpen ? null : c.id);
                        }
                      }}
                      sx={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: COLS,
                        gap: 1.5,
                        px: 2.25,
                        py: 1.45,
                        bgcolor: isOpen
                          ? isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(47, 62, 52, 0.04)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "background 140ms ease",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(47, 62, 52, 0.035)",
                          },
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 800, fontSize: "0.88rem" }}>
                          {c.description}
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.25 }}>
                          {c.ref}
                          {c.notes ? ` · ${c.notes}` : ""}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", alignSelf: "center" }}>
                        {fmtDate(c.date)}
                      </Typography>
                      <NumCell value={c.amount} />
                      <NumCell value={c.spent} />
                      <NumCell value={Math.abs(c.remaining)} danger={rowDeficit} prefix={rowDeficit ? "−" : ""} />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            px: 0.85,
                            py: 0.25,
                            borderRadius: 99,
                            bgcolor: alpha(st.color, isDark ? 0.16 : 0.1),
                            border: `1px solid ${alpha(st.color, 0.28)}`,
                          }}
                        >
                          <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, color: st.color }}>
                            {st.label}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
                        {isAdmin ? (
                          <>
                            <IconButton
                              size="small"
                              aria-label="تعديل العهدة"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(c);
                              }}
                              sx={{ color: "text.secondary" }}
                            >
                              <Pencil size={15} strokeWidth={2} />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="حذف العهدة"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(c.id);
                              }}
                              sx={{ color: "text.secondary" }}
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </IconButton>
                          </>
                        ) : null}
                        <IconButton
                          size="small"
                          aria-label={isOpen ? "طي العهدة" : "فتح العهدة"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(isOpen ? null : c.id);
                          }}
                          sx={{
                            color: "text.secondary",
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition: "transform 160ms ease",
                          }}
                        >
                          <ChevronDown size={16} strokeWidth={2.1} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Collapse in={isOpen} unmountOnExit>
                      <Box
                        sx={{
                          px: 2.25,
                          pb: 1.75,
                          bgcolor: isDark ? "rgba(0,0,0,0.16)" : "rgba(47, 62, 52, 0.03)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            color: "text.secondary",
                            py: 1.15,
                          }}
                        >
                          سجل مصروفات {c.ref} — {c.expenses.length} عملية
                        </Typography>
                        {c.expenses.length === 0 ? (
                          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", pb: 1 }}>
                            لا توجد مصروفات من هذه العهدة
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              border: `1px solid ${hairline}`,
                              borderRadius: "12px",
                              overflow: "hidden",
                              bgcolor: isDark ? "#1A221C" : "#fff",
                            }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) 110px 130px",
                                gap: 1.5,
                                px: 1.75,
                                py: 0.9,
                                borderBottom: `1px solid ${hairline}`,
                              }}
                            >
                              {["الوصف", "العميل", "التاريخ", "المبلغ"].map((label) => (
                                <Typography
                                  key={label}
                                  sx={{ fontSize: "0.64rem", fontWeight: 750, color: "text.secondary" }}
                                >
                                  {label}
                                </Typography>
                              ))}
                            </Box>
                            {c.expenses.map((exp, ei) => (
                              <Box
                                key={`${c.id}-exp-${ei}-${String(exp.id ?? "")}`}
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) 110px 130px",
                                  gap: 1.5,
                                  px: 1.75,
                                  py: 1.1,
                                  borderBottom: ei < c.expenses.length - 1 ? `1px solid ${hairline}` : "none",
                                }}
                              >
                                <Typography noWrap sx={{ fontWeight: 750, fontSize: "0.82rem" }}>
                                  {exp.description}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                  {exp.clientName}
                                </Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                  {fmtDate(exp.date)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: DESKTOP_NUM_FONT,
                                    fontVariantNumeric: "tabular-nums",
                                    fontWeight: 800,
                                    fontSize: "0.82rem",
                                    color: "#b54747",
                                  }}
                                >
                                  {formatCurrency(exp.usedAmount ?? exp.amount)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
          </Box>
        );
      })}
    </Box>
  );
}

function NumCell({
  value,
  danger,
  prefix = "",
}: {
  value: number;
  danger?: boolean;
  prefix?: string;
}) {
  return (
    <Typography
      dir="ltr"
      sx={{
        fontFamily: DESKTOP_NUM_FONT,
        fontVariantNumeric: "tabular-nums",
        fontWeight: 800,
        fontSize: "0.88rem",
        color: danger ? "#b54747" : "text.primary",
        alignSelf: "center",
      }}
    >
      {prefix}
      {formatCurrency(value)}
    </Typography>
  );
}
