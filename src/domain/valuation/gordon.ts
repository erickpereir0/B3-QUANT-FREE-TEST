/**
 * Gordon Growth Model (Dividend Discount Model): V = D0 * (1 + g) / (k - g)
 */
export function calculateGordonPrice(currentDividend: number, gordonGrowth: number, gordonDiscount: number): number {
  const g = gordonGrowth / 100;
  const k = gordonDiscount / 100;
  if (k - g <= 0) return 0;
  return (currentDividend * (1 + g)) / (k - g);
}
