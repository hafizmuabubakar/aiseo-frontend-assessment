export const PRICE_TIERS: Record<number, { price: number; label: string; color: string }> = {
  1: { price: 150, label: 'Premium', color: '#f59e0b' },
  2: { price: 100, label: 'Standard', color: '#0ea5e9' },
  3: { price: 75, label: 'Economy', color: '#10b981' },
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const getPriceForTier = (tier: number): number => {
  return PRICE_TIERS[tier]?.price || 0;
};
