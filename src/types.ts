/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockPosition {
  ticker: string;
  averagePrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  plPercentage: number;
}

export interface MetricCard {
  title: string;
  value: string;
  change: string;
  subValue?: string;
  icon?: string;
}

export interface ValuationParameters {
  lpa: number; // Lucro Por Ação
  vpa: number; // Valor Patrimonial por Ação
  dpa: number; // Dividendo por Ação
  requiredYield: number; // Dividend Yield Desejado (Bazin)
  currentDividend: number; // Dividendo Atual (Gordon)
  gordonGrowth: number; // Crescimento Perpetuo (Gordon)
  gordonDiscount: number; // Taxa de Desconto (Gordon)
  payout: number;
  roe: number;
  growthRate: number;
  discountRate: number;
  projectionYears: number;
}

export interface Alert {
  id: string;
  ticker: string;
  metric: "Price" | "P/L" | "DY" | "RSI" | "ROE";
  condition: "Greater than" | "Less than" | "Crosses above" | "Crosses below";
  value: number;
  active: boolean;
   telegramBot: boolean;
  email: boolean;
  telegramChatId?: string;
  emailRecipient?: string;
}

export interface CVMFilings {
  id: string;
  date: string;
  type: string;
  status: "Processed" | "Pending" | "Error";
  company: string;
  contentSnippet: string;
}

export interface NewsItem {
  id: string;
  ticker: string;
  title: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  timestamp: string;
}

export interface AssetCorrelation {
  [ticker: string]: { [targetTicker: string]: number };
}

export interface RebalancingItem {
  ticker: string;
  currentWeight: number;
  currentValue: number;
  targetWeight: number;
  idealValue: number;
  delta: number;
  action: "BUY" | "SELL" | "HOLD";
}

export interface ThesisItem {
  ticker: string;
  fairPrice: number;
  currentPE: number;
  dividendYield: number;
  lastUpdated: string;
  thesisContent: string;
  catalysts: string[];
  risks: string[];
}
