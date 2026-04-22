export type ProfileSessionModule = 'expenses' | 'payments' | 'debts' | 'workers' | 'balances';

/**
 * Etlala — جلسات الملف الشخصي (B2B fintech: Swiss + ألوان واضحة، بدون تدرجات AI)
 */
export const PROFILE_MODULE: Record<
  ProfileSessionModule,
  {
    accent: string;
    overline: string;
    listAccent: string;
  }
> = {
  expenses: {
    accent: '#c43d3d',
    overline: 'سجل الصرف',
    listAccent: '#c73e3e',
  },
  payments: {
    accent: '#0d9668',
    overline: 'سجل التحصيل',
    listAccent: '#0d9668',
  },
  debts: {
    accent: '#b45309',
    overline: 'الالتزامات',
    listAccent: '#b8860b',
  },
  workers: {
    accent: '#4a5d4a',
    overline: 'الفريق والمقاولون',
    listAccent: '#5a6d5a',
  },
  balances: {
    accent: '#a67c2e',
    overline: 'العهد والأرصدة',
    listAccent: '#8b6914',
  },
};
