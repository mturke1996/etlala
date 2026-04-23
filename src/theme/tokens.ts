/**
 * Etlala — Premium architecture UI tokens (light-first; dark is derived)
 */
export const premiumTokens = {
  primary: '#2F3E34',
  primaryDark: '#243028',
  background: '#F7F7F5',
  paper: '#FFFFFF',
  accent: '#C2B280',
  text: '#1F2521',
  textMuted: '#6B736E',
} as const;

export type PremiumTokenKey = keyof typeof premiumTokens;
