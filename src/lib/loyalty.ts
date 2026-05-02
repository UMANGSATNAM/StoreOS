// ============================================================
// StoreOS - Loyalty Tier System
// ============================================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  multiplier: number;
  minSpend: number;
  maxSpend: number;
  benefits: string[];
}

export const LOYALTY_TIERS: LoyaltyTierInfo[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    multiplier: 1,
    minSpend: 0,
    maxSpend: 10000,
    benefits: ['1x points on all purchases', 'Birthday reward points', 'Exclusive member pricing'],
  },
  {
    tier: 'silver',
    name: 'Silver',
    icon: '🥈',
    color: 'text-gray-600 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
    multiplier: 1.5,
    minSpend: 10001,
    maxSpend: 50000,
    benefits: ['1.5x points on all purchases', '5% birthday discount', 'Priority customer support', 'Early access to sales'],
  },
  {
    tier: 'gold',
    name: 'Gold',
    icon: '🥇',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800/40',
    multiplier: 2,
    minSpend: 50001,
    maxSpend: 200000,
    benefits: ['2x points on all purchases', '10% birthday discount', 'Priority service', 'Free gift wrapping', 'Exclusive gold events'],
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    icon: '💎',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800/40',
    multiplier: 3,
    minSpend: 200001,
    maxSpend: Infinity,
    benefits: ['3x points on all purchases', '15% birthday discount', 'Free delivery', 'Priority service', 'Personal account manager', 'VIP exclusive offers'],
  },
];

/**
 * Returns loyalty tier info based on total spending amount.
 */
export function getLoyaltyTier(totalSpent: number): LoyaltyTierInfo {
  if (totalSpent >= 200001) {
    return LOYALTY_TIERS[3]; // Platinum
  }
  if (totalSpent >= 50001) {
    return LOYALTY_TIERS[2]; // Gold
  }
  if (totalSpent >= 10001) {
    return LOYALTY_TIERS[1]; // Silver
  }
  return LOYALTY_TIERS[0]; // Bronze
}

/**
 * Returns the next tier above the current one, or null if already at Platinum.
 */
export function getNextTier(currentTier: LoyaltyTier): LoyaltyTierInfo | null {
  const idx = LOYALTY_TIERS.findIndex((t) => t.tier === currentTier);
  if (idx < 0 || idx >= LOYALTY_TIERS.length - 1) return null;
  return LOYALTY_TIERS[idx + 1];
}

/**
 * Calculates progress percentage towards next tier.
 */
export function getTierProgress(totalSpent: number): { progress: number; amountToNext: number; nextTier: LoyaltyTierInfo | null } {
  const current = getLoyaltyTier(totalSpent);
  const next = getNextTier(current.tier);
  if (!next) {
    return { progress: 100, amountToNext: 0, nextTier: null };
  }
  const rangeStart = current.minSpend;
  const rangeEnd = next.minSpend;
  const progress = Math.min(((totalSpent - rangeStart) / (rangeEnd - rangeStart)) * 100, 100);
  const amountToNext = Math.max(next.minSpend - totalSpent, 0);
  return { progress, amountToNext, nextTier: next };
}

/**
 * Returns a pill-style CSS class set for a tier badge.
 */
export function getTierBadgeClasses(tier: LoyaltyTier): string {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
    case 'silver':
      return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600';
    case 'gold':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
    case 'platinum':
      return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700';
  }
}

/**
 * Recharts-friendly color for PieChart segments.
 */
export function getTierChartColor(tier: LoyaltyTier): string {
  switch (tier) {
    case 'bronze':
      return '#d97706';
    case 'silver':
      return '#6b7280';
    case 'gold':
      return '#eab308';
    case 'platinum':
      return '#9333ea';
  }
}
