/**
 * Graham's formula for Fair Price: V = sqrt(multiplier * LPA * VPA)
 */
export function calculateGrahamPrice(lpa: number, vpa: number, multiplier: number = 22.5): number {
  if (lpa <= 0 || vpa <= 0 || multiplier <= 0) return 0;
  return Math.sqrt(multiplier * lpa * vpa);
}
