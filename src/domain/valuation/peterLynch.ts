/**
 * Peter Lynch Valuation Model (PEG ratio modification with dividends):
 * Ratio = (Growth Rate + Dividend Yield) / P/E Ratio
 */
export function calculatePeterLynchRatio(growthRate: number, divYield: number, pl: number): number {
  if (pl <= 0) return 0;
  const growth = growthRate || 3.0;
  return (growth + divYield) / pl;
}
