/**
 * Bazin's valuation model: V = DPA / RequiredYield
 */
export function calculateBazinPrice(dpa: number, requiredYield: number): number {
  if (requiredYield <= 0) return 0;
  return dpa / (requiredYield / 100);
}
