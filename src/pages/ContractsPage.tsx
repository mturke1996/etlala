// @ts-nocheck
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, Paper, Grid as MuiGrid } from '@mui/material';
import { Gavel, Description, ChevronLeft } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useDataStore } from '../store/useDataStore';
import { PageScaffold } from '../components/layout/PageScaffold';
import { EtlalaAccentSurface, EtlalaEmptyState, EtlalaSectionTitle } from '../components/etlala/EtlalaMobileUi';
import type { LetterType } from '../types';
import { motion, useReducedMotion } from 'framer-motion';
import { premiumTokens } from '../theme/tokens';

const Grid = MuiGrid as any;

const typeLabels: Record<LetterType, string> = {
  official: 'خطاب رسمي',
  offer: 'عرض سعر',
  entitlement: 'مستخلص',
};

export const ContractsPage = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { letters, clients } = useDataStore();

  const sorted = useMemo(
    () => [...letters].sort((a, b) => (dayjs(b.date).isAfter(dayjs(a.date)) ? 1 : -1)),
    [letters],
  );

  return (
    <PageScaffold
      title="الوثائق والعقود"
      subtitle="خطابات وعروض مرتبطة بعملك"
      backTo="/"
      rightAction={(
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate('/letters')}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2,
            boxShadow: 'none',
          }}
        >
          المحرر
        </Button>
      )}
      headerExtra={(
        <Grid container spacing={1}>
          <Grid size={{ xs: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.12)',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', fontSize: '0.65rem' }}>
                الإجمالي
              </Typography>
              <Typography fontWeight={800} color="white" sx={{ fontSize: '0.85rem' }}>
                {letters.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    >
      <EtlalaSectionTitle title="سجل الوثائق" subtitle="عرض سريع — التعديل والـ PDF من صفحة الخطابات" />

      <Stack spacing={1.5}>
        {sorted.length === 0 ? (
          <EtlalaEmptyState
            icon={<Gavel />}
            title="لا توجد وثائق بعد"
            hint="أضف خطابات وعروض من صفحة الخطابات"
            actionLabel="فتح الخطابات"
            onAction={() => navigate('/letters')}
          />
        ) : (
          sorted.map((L, i) => {
            const client = L.clientId ? clients.find((c) => c.id === L.clientId) : null;
            return (
              <Box
                key={L.id}
                component={motion.div}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: reduceMotion ? 0 : i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <EtlalaAccentSurface
                  accent={premiumTokens.primary}
                  topGoldAccent={L.type === 'offer'}
                  onClick={() => navigate('/letters')}
                >
                  <Box sx={{ p: 2, pr: 1.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                      <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(47, 62, 52, 0.1)',
                          }}
                        >
                          <Description sx={{ color: premiumTokens.accent, fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} sx={{ fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.3 }}>
                            {L.subject || 'بدون عنوان'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, fontWeight: 500 }}>
                            {typeLabels[L.type]} · {L.refNumber}
                          </Typography>
                          {client && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                              {client.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <ChevronLeft sx={{ color: premiumTokens.textMuted, fontSize: 22, flexShrink: 0, mt: 0.5 }} />
                    </Stack>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary', fontWeight: 500 }}>
                      {dayjs(L.date).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </EtlalaAccentSurface>
              </Box>
            );
          })
        )}
      </Stack>
    </PageScaffold>
  );
};
