import { Avatar, Box, Chip, Divider, Stack, Typography, alpha } from '@mui/material';
import { Business, Person, Phone, Place } from '@mui/icons-material';
import type { Client } from '../../types';

export type ClientProfileHeroProps = {
  client: Client;
  activitySummary?: string;
  totalExpenses?: number;
  totalExpensesCount?: number;
  expenses?: any[];
  onAddExpenseClick?: () => void;
};

export function ClientProfileHero({ client, activitySummary }: ClientProfileHeroProps) {
  const isCo = client.type === 'company';

  return (
    <Box sx={{ mt: 0.5, mb: 1.5 }}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `1px solid ${alpha('#fff', 0.14)}`,
          background: `linear-gradient(150deg, ${alpha('#fff', 0.1)} 0%, ${alpha('#fff', 0.03)} 50%, ${alpha('#000', 0.1)} 100%)`,
          backdropFilter: 'blur(18px)',
          boxShadow: `0 12px 40px -16px ${alpha('#000', 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: isCo ? alpha('#C2B280', 0.32) : alpha('#E2E8F0', 0.18),
              color: '#fff',
              border: `1px solid ${alpha('#fff', 0.18)}`,
            }}
          >
            {isCo ? <Business sx={{ fontSize: 28 }} /> : <Person sx={{ fontSize: 28 }} />}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Chip
                size="small"
                label={isCo ? 'شركة' : 'فرد'}
                sx={{
                  height: 22,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: alpha('#fff', 0.1),
                  color: alpha('#fff', 0.95),
                  border: `1px solid ${alpha('#fff', 0.16)}`,
                }}
              />
            </Stack>

            <Stack spacing={0.4}>
              <Stack direction="row" alignItems="center" gap={0.6} sx={{ color: alpha('#fff', 0.9) }}>
                <Phone sx={{ fontSize: 15, opacity: 0.7 }} />
                <Typography
                  component="a"
                  href={`tel:${client.phone}`}
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    direction: 'ltr',
                  }}
                >
                  {client.phone}
                </Typography>
              </Stack>

              {client.address ? (
                <Stack direction="row" alignItems="flex-start" gap={0.6} sx={{ color: alpha('#fff', 0.55) }}>
                  <Place sx={{ fontSize: 14, opacity: 0.75, mt: 0.1, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ lineHeight: 1.45, fontWeight: 500, fontSize: '0.72rem' }}>
                    {client.address}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

            {activitySummary ? (
              <>
                <Divider sx={{ my: 1, borderColor: alpha('#fff', 0.1) }} />
                <Typography
                  variant="caption"
                  sx={{ color: alpha('#fff', 0.5), fontWeight: 600, fontSize: '0.65rem', letterSpacing: 0.2, display: 'block', lineHeight: 1.5 }}
                >
                  {activitySummary}
                </Typography>
              </>
            ) : null}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
