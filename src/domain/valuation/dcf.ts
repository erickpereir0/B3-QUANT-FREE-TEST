export interface DCFParams {
  base2025Profit: number;
  dcf2026Profit: number | null;
  dcfProjectedGrowths: Record<number, number>;
  dcfGrowthRate: number;
  dcfDiscountRate: number;
  dcfProjectionYears: number;
  dcfPerpCrescimento: number;
  dcfSharesExTreasury: number;
}

export interface DCFResult {
  historicalProfits: { yr: string; val: number; pctStr: string }[];
  projectedProfits: Record<number, number>;
  projectedGrowths: Record<number, number>;
  presentValues: Record<number, number>;
  sumVP: number;
  perpProfitVal: number;
  perpVPL: number;
  totalValuationVal: number;
  precoPorAcaoVal: number;
}

export function calculateDCF(params: DCFParams): DCFResult {
  const {
    base2025Profit,
    dcf2026Profit,
    dcfProjectedGrowths,
    dcfGrowthRate,
    dcfDiscountRate,
    dcfProjectionYears,
    dcfPerpCrescimento,
    dcfSharesExTreasury,
  } = params;

  // Historical calculation
  const hist2025 = base2025Profit;
  const hist2024 = hist2025 / (1 + -31.18 / 100);
  const hist2023 = hist2024 / (1 + 23.45 / 100);
  const hist2022 = hist2023 / (1 + 40.85 / 100);
  const hist2021 = hist2022 / (1 + 9.10 / 100);

  const historicalProfits = [
    { yr: "2021", val: hist2021, pctStr: "30,98%" },
    { yr: "2022", val: hist2022, pctStr: "9,10%" },
    { yr: "2023", val: hist2023, pctStr: "40,85%" },
    { yr: "2024", val: hist2024, pctStr: "23,45%" },
    { yr: "2025", val: hist2025, pctStr: "-31,18%" },
  ];

  // Projected Profits
  const projectedProfits: Record<number, number> = {};
  const active2026Profit = dcf2026Profit !== null ? dcf2026Profit : base2025Profit * (1 + (dcfProjectedGrowths[2026] ?? dcfGrowthRate) / 100);
  projectedProfits[2026] = active2026Profit;

  let currentProfit = active2026Profit;
  const remainingProjYears = [2027, 2028, 2029, 2030];
  remainingProjYears.forEach(year => {
    const growth = dcfProjectedGrowths[year] ?? dcfGrowthRate;
    currentProfit = currentProfit * (1 + growth / 100);
    projectedProfits[year] = currentProfit;
  });

  // Growths
  const projectedGrowths: Record<number, number> = {};
  projectedGrowths[2026] = (((active2026Profit - base2025Profit) / base2025Profit) * 100);
  remainingProjYears.forEach(year => {
    projectedGrowths[year] = dcfProjectedGrowths[year] ?? dcfGrowthRate;
  });

  // Present Value (VP) & SumVP
  const presentValues: Record<number, number> = {};
  let sumVP = 0;

  const projYears = [2026, 2027, 2028];
  if (dcfProjectionYears === 5) {
    projYears.push(2029, 2030);
  }

  projYears.forEach((y, idx) => {
    const profit = projectedProfits[y] || 0;
    const discountFactor = Math.pow(1 + dcfDiscountRate / 100, idx + 1);
    const vp = profit / discountFactor;
    presentValues[y] = vp;
    sumVP += vp;
  });

  const lastYear = projYears[projYears.length - 1];
  const lastProfit = projectedProfits[lastYear] || 0;
  const denominator = (dcfDiscountRate - dcfPerpCrescimento) / 100;
  const perpProfitVal = denominator > 0 ? (lastProfit * (1 + dcfPerpCrescimento / 100)) / denominator : 0;
  const perpVPL = perpProfitVal / Math.pow(1 + dcfDiscountRate / 100, dcfProjectionYears);

  const totalValuationVal = sumVP + perpVPL;
  const precoPorAcaoVal = dcfSharesExTreasury > 0 ? totalValuationVal / dcfSharesExTreasury : 0;

  return {
    historicalProfits,
    projectedProfits,
    projectedGrowths,
    presentValues,
    sumVP,
    perpProfitVal,
    perpVPL,
    totalValuationVal,
    precoPorAcaoVal,
  };
}
