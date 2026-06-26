/**
 * Joel Greenblatt Magic Formula inspired score / simplified metric:
 * Score = (ROE + Net Margin) / (P/L * 25) * 0.1
 */
export function calculateGreenblattScore(roe: number, netMargin: number, pl: number): number {
  if (pl <= 0) return 0;
  return (roe + netMargin) / (pl * 25) * 0.1;
}
