/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockPosition, Alert, CVMFilings, NewsItem, AssetCorrelation, RebalancingItem, ThesisItem } from "./types";

export const initialStockPositions: StockPosition[] = [
  { ticker: "VALE3", averagePrice: 68.50, currentPrice: 61.20, quantity: 500, totalValue: 30600.00, plPercentage: -10.66 },
  { ticker: "PETR4", averagePrice: 28.50, currentPrice: 38.06, quantity: 800, totalValue: 30448.00, plPercentage: 33.54 },
  { ticker: "ITUB4", averagePrice: 24.50, currentPrice: 33.50, quantity: 1200, totalValue: 40200.00, plPercentage: 36.73 },
  { ticker: "BBAS3", averagePrice: 18.20, currentPrice: 26.50, quantity: 1200, totalValue: 31800.00, plPercentage: 45.60 },
  { ticker: "BBDC4", averagePrice: 13.10, currentPrice: 13.80, quantity: 1100, totalValue: 15180.00, plPercentage: 5.34 },
  { ticker: "WEGE3", averagePrice: 34.00, currentPrice: 48.50, quantity: 450, totalValue: 21825.00, plPercentage: 42.65 },
  { ticker: "HGLG11", averagePrice: 160.00, currentPrice: 162.50, quantity: 150, totalValue: 24375.00, plPercentage: 1.56 },
  { ticker: "KNIP11", averagePrice: 91.20, currentPrice: 94.40, quantity: 200, totalValue: 18880.00, plPercentage: 3.51 }
];

export const initialAlerts: Alert[] = [
  { id: "1", ticker: "PETR4", metric: "Price", condition: "Less than", value: 32.00, active: true, telegramBot: true, email: false, telegramChatId: "123456789" },
  { id: "2", ticker: "VALE3", metric: "P/L", condition: "Less than", value: 4.0, active: true, telegramBot: true, email: false, telegramChatId: "123456789" },
  { id: "3", ticker: "BBAS3", metric: "DY", condition: "Greater than", value: 8.5, active: false, telegramBot: false, email: true, emailRecipient: "your.email@example.com" },
  { id: "4", ticker: "ABEV3", metric: "RSI", condition: "Greater than", value: 70, active: true, telegramBot: true, email: true, telegramChatId: "123456789", emailRecipient: "your.email@example.com" }
];

export const initialCVMFilings: CVMFilings[] = [
  {
    id: "f1",
    date: "15/05/2026",
    type: "Ata de Assembleia Geral",
    status: "Processed",
    company: "PETR4 - Petróleo Brasileiro S.A.",
    contentSnippet: "Deliberação sobre dividendos extraordinários complementares no montante de R$ 1,25 por ação ordinária e preferencial baseada no lucro remanescente acumulado..."
  },
  {
    id: "f2",
    date: "14/05/2026",
    type: "Formulário de Referência 2026",
    status: "Pending",
    company: "VALE3 - Vale S.A.",
    contentSnippet: "VALE S.A. - Relatório da Administração 2025. Seção 10: Discussão dos Administradores sobre Desempenho Operacional e Financeiro e novas metas ESG..."
  },
  {
    id: "f3",
    date: "14/05/2026",
    type: "Ata de Reunião de CA",
    status: "Processed",
    company: "ITUB4 - Itaú Unibanco Holding S.A.",
    contentSnippet: "Aprovação do aumento do Capital Social com bonificação em ações de 10% aos acionistas baseada em reservas de lucros e integralização de dividendos juros sobre capital..."
  },
  {
    id: "f4",
    date: "13/05/2026",
    type: "Demonstrações Financeiras",
    status: "Processed",
    company: "ABEV3 - Ambev S.A.",
    contentSnippet: "Resultados do 1T 2026 mostrando receita líquida de R$ 20,2 Bilhões com crescimento orgânico impulsionado pelos volumes de marcas premium e resiliência de canais..."
  },
  {
    id: "f5",
    date: "13/05/2026",
    type: "Demonstrações Consolidadas",
    status: "Error",
    company: "BBDC4 - Banco Bradesco S.A.",
    contentSnippet: "Falha de validação dos quadros financeiros auxiliares de Basileia III no sistema recebido da CVM. Aguardando reenvio oficial corrigido..."
  }
];

export const initialNews: NewsItem[] = [
  { id: "n1", ticker: "VALE3", title: "Iron Ore Prices Surge, Analysts Upgrade Target to Positive in London", sentiment: "Positive", timestamp: "Hoje, 09:14" },
  { id: "n2", ticker: "PETR4", title: "Quarterly Earnings Report Shows Robust Operational Cash Flow but Mixed Results on Refining Rates", sentiment: "Neutral", timestamp: "Hoje, 08:30" },
  { id: "n3", ticker: "ITUB4", title: "Central Bank Policy Update Impacts Banking Net Margins for the Coming Year", sentiment: "Negative", timestamp: "Ontem, 16:45" },
  { id: "n4", ticker: "ITUB4", title: "Credit Default Swap Drop Stimulates Bank Lending Prospects for Mid-Sized Enterprises", sentiment: "Positive", timestamp: "Ontem, 14:15" },
  { id: "n5", ticker: "VALE3", title: "New Environmental Injunction Near Minas Gerais Complex Suspends Output Partially", sentiment: "Negative", timestamp: "17 de Junho" },
  { id: "n6", ticker: "BBAS3", title: "Banco do Brasil Reports All-Time High ROE of 21.4% Driven by Agribusiness Loans", sentiment: "Positive", timestamp: "16 de Junho" },
  { id: "n7", ticker: "ABEV3", title: "Input Cost Inflation and Packaging Material Constraints Limit Margin Improvements", sentiment: "Negative", timestamp: "15 de Junho" }
];

export const initialCorrelation: AssetCorrelation = {
  PETR4: { PETR4: 1.00, VALE3: 0.59, ITUB4: 0.84, BBDC4: 0.82, ABEV3: 0.32, BBAS3: 0.92, PRIO3: -1.00, ELET3: 0.83 },
  VALE3: { PETR4: 0.59, VALE3: 1.00, ITUB4: 0.89, BBDC4: -0.04, ABEV3: -0.13, BBAS3: -0.25, PRIO3: -0.86, ELET3: 0.55 },
  ITUB4: { PETR4: 0.84, VALE3: 0.89, ITUB4: 1.00, BBDC4: 0.87, ABEV3: -0.05, BBAS3: 0.84, PRIO3: -0.85, ELET3: 0.84 },
  BBDC4: { PETR4: 0.82, VALE3: -0.04, ITUB4: 0.87, BBDC4: 1.00, ABEV3: 0.00, BBAS3: -0.05, PRIO3: -0.04, ELET3: 0.72 },
  ABEV3: { PETR4: 0.32, VALE3: -0.13, ITUB4: -0.05, BBDC4: 0.00, ABEV3: 1.00, BBAS3: 0.57, PRIO3: 0.73, ELET3: 0.33 },
  BBAS3: { PETR4: 0.92, VALE3: -0.25, ITUB4: 0.84, BBDC4: -0.05, ABEV3: 0.57, BBAS3: 1.00, PRIO3: 0.29, ELET3: 0.85 },
  PRIO3: { PETR4: -1.00, VALE3: -0.86, ITUB4: -0.85, BBDC4: -0.04, ABEV3: 0.73, BBAS3: 0.29, PRIO3: 1.00, ELET3: 0.85 },
  ELET3: { PETR4: 0.83, VALE3: 0.55, ITUB4: 0.84, BBDC4: 0.72, ABEV3: 0.33, BBAS3: 0.85, PRIO3: 0.85, ELET3: 1.00 }
};

export const initialScreenerStocks = [
  { ticker: "VALE3", name: "Vale S.A.", price: 61.20, pl: 4.21, roe: 22.1, divYield: 9.8, marketCap: 305.2, evEbitda: 3.2, debtEquity: 0.8, dlEbitda: 1.25, netMargin: 18.25, liquidity: 145000000, vpv: 1.35, lpa: 14.53, vpa: 45.11, growthRate: 12.0, sector: "Materiais", var12m: -6.45 },
  { ticker: "PETR4", name: "Petrobras PN", price: 38.06, pl: 3.12, roe: 28.5, divYield: 12.4, marketCap: 450.1, evEbitda: 2.1, debtEquity: 0.7, dlEbitda: 0.72, netMargin: 22.10, liquidity: 350000000, vpv: 1.23, lpa: 12.17, vpa: 31.00, growthRate: 15.0, sector: "Materiais", var12m: 48.70 },
  { ticker: "PETR3", name: "Petrobras ON", price: 40.80, pl: 3.32, roe: 28.5, divYield: 11.5, marketCap: 450.1, evEbitda: 2.2, debtEquity: 0.7, dlEbitda: 0.72, netMargin: 22.10, liquidity: 95000000, vpv: 1.31, lpa: 12.26, vpa: 31.18, growthRate: 14.0, sector: "Materiais", var12m: 45.20 },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", price: 33.50, pl: 9.49, roe: 18.9, divYield: 5.1, marketCap: 270.5, evEbitda: 5.8, debtEquity: 0.5, dlEbitda: 0.35, netMargin: 15.40, liquidity: 120000000, vpv: 2.12, lpa: 3.53, vpa: 15.82, growthRate: 8.0, sector: "Financeiro", var12m: 24.15 },
  { ticker: "BBDC4", name: "Bradesco PN", price: 13.80, pl: 8.68, roe: 14.2, divYield: 6.3, marketCap: 145.8, evEbitda: 4.9, debtEquity: 0.6, dlEbitda: 0.40, netMargin: 12.50, liquidity: 65000000, vpv: 1.07, lpa: 1.59, vpa: 12.94, growthRate: 6.0, sector: "Financeiro", var12m: -10.80 },
  { ticker: "BBDC3", name: "Bradesco ON", price: 12.30, pl: 7.74, roe: 14.2, divYield: 7.1, marketCap: 145.8, evEbitda: 4.5, debtEquity: 0.6, dlEbitda: 0.40, netMargin: 12.50, liquidity: 15000000, vpv: 0.95, lpa: 1.59, vpa: 12.90, growthRate: 5.5, sector: "Financeiro", var12m: -12.40 },
  { ticker: "BBAS3", name: "Banco do Brasil ON", price: 26.50, pl: 6.8, roe: 19.8, divYield: 7.5, marketCap: 118.2, evEbitda: 4.5, debtEquity: 0.4, dlEbitda: 0.22, netMargin: 16.80, liquidity: 95000000, vpv: 1.09, lpa: 3.88, vpa: 24.23, growthRate: 10.0, sector: "Financeiro", var12m: 29.40 },
  { ticker: "WEGE3", name: "Weg ON", price: 48.50, pl: 27.40, roe: 21.2, divYield: 2.8, marketCap: 84.0, evEbitda: 14.3, debtEquity: 0.2, dlEbitda: -0.15, netMargin: 16.20, liquidity: 45000000, vpv: 4.97, lpa: 1.77, vpa: 9.75, growthRate: 18.0, sector: "Materiais", var12m: 15.60 },
  { ticker: "ABEV3", name: "Ambev S.A.", price: 12.20, pl: 12.08, roe: 15.6, divYield: 6.8, marketCap: 205.5, evEbitda: 8.1, debtEquity: 0.1, dlEbitda: -0.85, netMargin: 18.50, liquidity: 85000000, vpv: 2.29, lpa: 1.01, vpa: 5.32, growthRate: 7.0, sector: "Consumo Cíclico", var12m: -4.10 },
  { ticker: "ITSA4", name: "Itaúsa PN", price: 10.15, pl: 7.15, roe: 17.5, divYield: 6.5, marketCap: 98.4, evEbitda: 5.2, debtEquity: 0.3, dlEbitda: 0.15, netMargin: 14.20, liquidity: 55000000, vpv: 1.29, lpa: 1.42, vpa: 7.88, growthRate: 7.5, sector: "Financeiro", var12m: 11.20 },
  { ticker: "JBSS3", name: "JBS ON", price: 22.15, pl: 7.4, roe: 16.0, divYield: 5.5, marketCap: 49.3, evEbitda: 4.1, debtEquity: 1.1, dlEbitda: 1.95, netMargin: 4.50, liquidity: 35000000, vpv: 1.25, lpa: 2.99, vpa: 17.72, growthRate: 5.0, sector: "Consumo Cíclico", var12m: 38.20 },
  { ticker: "SUZB3", name: "Suzano ON", price: 54.20, pl: 8.5, roe: 18.2, divYield: 4.5, marketCap: 72.8, evEbitda: 6.2, debtEquity: 1.5, dlEbitda: 2.80, netMargin: 14.50, liquidity: 42000000, vpv: 1.80, lpa: 6.37, vpa: 30.11, growthRate: 8.0, sector: "Materiais", var12m: 12.30 },
  { ticker: "GGBR4", name: "Gerdau PN", price: 21.50, pl: 5.8, roe: 13.5, divYield: 8.2, marketCap: 38.5, evEbitda: 3.5, debtEquity: 0.4, dlEbitda: 0.85, netMargin: 10.20, liquidity: 38000000, vpv: 0.88, lpa: 3.70, vpa: 24.43, growthRate: 5.0, sector: "Materiais", var12m: -5.20 },
  { ticker: "CSNA3", name: "Siderúrgica Nacional ON", price: 14.80, pl: 12.5, roe: 8.5, divYield: 9.1, marketCap: 19.6, evEbitda: 4.8, debtEquity: 2.2, dlEbitda: 3.50, netMargin: 5.40, liquidity: 22000000, vpv: 1.05, lpa: 1.18, vpa: 14.09, growthRate: 3.0, sector: "Materiais", var12m: -15.40 },
  { ticker: "USIM5", name: "Usiminas PN", price: 7.20, pl: 14.2, roe: 4.2, divYield: 3.5, marketCap: 9.2, evEbitda: 5.1, debtEquity: 0.5, dlEbitda: 1.10, netMargin: 2.80, liquidity: 18000000, vpv: 0.45, lpa: 0.50, vpa: 16.00, growthRate: 1.5, sector: "Materiais", var12m: -22.10 },
  { ticker: "KLBN11", name: "Klabin Unit", price: 21.80, pl: 7.8, roe: 19.4, divYield: 7.2, marketCap: 24.5, evEbitda: 6.8, debtEquity: 1.8, dlEbitda: 2.95, netMargin: 13.80, liquidity: 28000000, vpv: 2.10, lpa: 2.79, vpa: 10.38, growthRate: 6.0, sector: "Materiais", var12m: 8.40 },
  { ticker: "RENT3", name: "Localiza ON", price: 58.50, pl: 18.4, roe: 12.5, divYield: 3.2, marketCap: 62.4, evEbitda: 11.2, debtEquity: 1.4, dlEbitda: 2.50, netMargin: 11.20, liquidity: 75000000, vpv: 2.80, lpa: 3.17, vpa: 20.89, growthRate: 14.0, sector: "Consumo Cíclico", var12m: 5.60 },
  { ticker: "LREN3", name: "Lojas Renner ON", price: 16.20, pl: 10.5, roe: 10.8, divYield: 5.8, marketCap: 15.6, evEbitda: 6.5, debtEquity: 0.4, dlEbitda: 1.05, netMargin: 8.90, liquidity: 32000000, vpv: 1.35, lpa: 1.54, vpa: 12.00, growthRate: 6.5, sector: "Consumo Cíclico", var12m: -18.20 },
  { ticker: "MGLU3", name: "Magazine Luiza ON", price: 12.50, pl: -18.0, roe: -5.4, divYield: 0.0, marketCap: 8.4, evEbitda: 15.2, debtEquity: 1.8, dlEbitda: 4.80, netMargin: -1.20, liquidity: 45000000, vpv: 1.85, lpa: -0.69, vpa: 6.75, growthRate: 15.0, sector: "Consumo Cíclico", var12m: -45.00 },
  { ticker: "BHIA3", name: "Casas Bahia ON", price: 6.80, pl: -4.5, roe: -24.0, divYield: 0.0, marketCap: 1.2, evEbitda: 12.1, debtEquity: 3.5, dlEbitda: 6.50, netMargin: -4.80, liquidity: 14000000, vpv: 0.35, lpa: -1.51, vpa: 19.42, growthRate: 2.0, sector: "Consumo Cíclico", var12m: -78.00 },
  { ticker: "COSAN3", name: "Cosan ON", price: 14.20, pl: 11.5, roe: 9.4, divYield: 4.2, marketCap: 26.5, evEbitda: 6.1, debtEquity: 2.1, dlEbitda: 3.20, netMargin: 4.10, liquidity: 21000000, vpv: 1.45, lpa: 1.23, vpa: 9.79, growthRate: 8.5, sector: "Materiais", var12m: -12.30 },
  { ticker: "EQTL3", name: "Equatorial ON", price: 31.40, pl: 10.8, roe: 15.2, divYield: 4.1, marketCap: 35.8, evEbitda: 6.5, debtEquity: 1.6, dlEbitda: 2.60, netMargin: 10.50, liquidity: 39000000, vpv: 1.95, lpa: 2.90, vpa: 16.10, growthRate: 11.0, sector: "Energia Elétrica", var12m: 14.50 },
  { ticker: "CPLE6", name: "Copel PNB", price: 9.80, pl: 9.5, roe: 11.8, divYield: 6.2, marketCap: 28.4, evEbitda: 5.8, debtEquity: 0.8, dlEbitda: 1.95, netMargin: 12.10, liquidity: 24000000, vpv: 1.15, lpa: 1.03, vpa: 8.52, growthRate: 6.0, sector: "Energia Elétrica", var12m: 10.20 },
  { ticker: "CMIG4", name: "Cemig PN", price: 10.35, pl: 4.16, roe: 26.00, divYield: 13.36, marketCap: 18.5, evEbitda: 3.8, debtEquity: 0.45, dlEbitda: 0.91, netMargin: 17.88, liquidity: 35000000, vpv: 1.05, lpa: 2.48, vpa: 9.85, growthRate: 3.0, sector: "Energia Elétrica", var12m: 18.35 },
  { ticker: "CMIN3", name: "CSN Mineração ON", price: 5.65, pl: 6.78, roe: 44.09, divYield: 13.76, marketCap: 31.2, evEbitda: 4.2, debtEquity: -0.32, dlEbitda: -0.85, netMargin: 27.45, liquidity: 25000000, vpv: 1.55, lpa: 0.83, vpa: 3.64, growthRate: 4.0, sector: "Materiais", var12m: 35.12 },
  { ticker: "ISAE4", name: "ISA CTEEP PN", price: 22.39, pl: 4.15, roe: 17.70, divYield: 10.54, marketCap: 14.8, evEbitda: 5.1, debtEquity: 0.92, dlEbitda: 2.15, netMargin: 44.60, liquidity: 18000000, vpv: 0.95, lpa: 5.39, vpa: 23.56, growthRate: 3.5, sector: "Energia Elétrica", var12m: 12.40 },
  { ticker: "TAEE11", name: "Taesa Unit", price: 34.50, pl: 8.5, roe: 18.9, divYield: 10.2, marketCap: 11.8, evEbitda: 5.9, debtEquity: 1.4, dlEbitda: 2.80, netMargin: 38.50, liquidity: 31000000, vpv: 1.65, lpa: 4.05, vpa: 20.90, growthRate: 4.0, sector: "Energia Elétrica", var12m: 5.40 },
  { ticker: "ALUP11", name: "Alupar Unit", price: 29.80, pl: 7.2, roe: 14.5, divYield: 8.4, marketCap: 8.9, evEbitda: 5.4, debtEquity: 1.1, dlEbitda: 2.30, netMargin: 22.40, liquidity: 12000000, vpv: 1.18, lpa: 4.13, vpa: 25.25, growthRate: 5.0, sector: "Energia Elétrica", var12m: 12.10 },
  { ticker: "TRPL4", name: "ISA CTEEP PN", price: 24.20, pl: 4.5, roe: 17.7, divYield: 9.8, marketCap: 15.9, evEbitda: 5.2, debtEquity: 0.9, dlEbitda: 2.10, netMargin: 44.60, liquidity: 20000000, vpv: 0.98, lpa: 5.37, vpa: 24.69, growthRate: 3.5, sector: "Energia Elétrica", var12m: 11.50 },
  { ticker: "RADL3", name: "RaiaDrogasil ON", price: 26.50, pl: 28.5, roe: 16.5, divYield: 1.8, marketCap: 45.6, evEbitda: 15.8, debtEquity: 0.5, dlEbitda: 1.20, netMargin: 3.80, liquidity: 48000000, vpv: 4.20, lpa: 0.92, vpa: 6.30, growthRate: 15.0, sector: "Saúde", var12m: 14.20 },
  { ticker: "BBSE3", name: "BB Seguridade ON", price: 32.10, pl: 8.1, roe: 48.2, divYield: 9.4, marketCap: 64.2, evEbitda: 7.2, debtEquity: 0.0, dlEbitda: 0.00, netMargin: 85.00, liquidity: 51000000, vpv: 6.50, lpa: 3.96, vpa: 4.93, growthRate: 8.0, sector: "Financeiro", var12m: 12.30 },
  { ticker: "EGIE3", name: "Engie Brasil ON", price: 42.40, pl: 10.2, roe: 28.5, divYield: 7.8, marketCap: 34.6, evEbitda: 7.1, debtEquity: 1.6, dlEbitda: 2.40, netMargin: 20.10, liquidity: 22000000, vpv: 3.10, lpa: 4.15, vpa: 13.67, growthRate: 5.5, sector: "Energia Elétrica", var12m: 9.50 },
  { ticker: "PRIO3", name: "PetroRio ON", price: 44.20, pl: 8.9, roe: 24.5, divYield: 0.0, marketCap: 39.2, evEbitda: 4.8, debtEquity: 0.8, dlEbitda: 1.10, netMargin: 32.10, liquidity: 110000000, vpv: 2.10, lpa: 4.96, vpa: 21.04, growthRate: 25.0, sector: "Materiais", var12m: 22.40 },
  { ticker: "RECV3", name: "PetroReconcavo ON", price: 18.50, pl: 7.1, roe: 16.5, divYield: 8.5, marketCap: 5.4, evEbitda: 3.8, debtEquity: 0.4, dlEbitda: 0.95, netMargin: 19.80, liquidity: 14000000, vpv: 1.20, lpa: 2.60, vpa: 15.41, growthRate: 12.0, sector: "Materiais", var12m: -5.40 },
  { ticker: "RRRP3", name: "Brava Energia ON", price: 26.10, pl: 11.2, roe: 9.8, divYield: 1.5, marketCap: 11.4, evEbitda: 5.2, debtEquity: 1.1, dlEbitda: 2.20, netMargin: 8.40, liquidity: 35000000, vpv: 0.95, lpa: 2.33, vpa: 27.47, growthRate: 18.0, sector: "Materiais", var12m: -18.50 },
  { ticker: "ENEV3", name: "Eneva ON", price: 11.80, pl: 18.2, roe: 6.2, divYield: 0.0, marketCap: 18.5, evEbitda: 8.5, debtEquity: 1.9, dlEbitda: 3.80, netMargin: 5.20, liquidity: 26000000, vpv: 1.05, lpa: 0.64, vpa: 11.23, growthRate: 10.0, sector: "Energia Elétrica", var12m: 5.30 },
  { ticker: "VBBR3", name: "Vibra Energia ON", price: 22.40, pl: 9.8, roe: 14.5, divYield: 6.2, marketCap: 25.9, evEbitda: 6.8, debtEquity: 1.1, dlEbitda: 2.10, netMargin: 3.50, liquidity: 45000000, vpv: 1.80, lpa: 2.28, vpa: 12.44, growthRate: 7.0, sector: "Consumo Cíclico", var12m: 24.10 },
  { ticker: "CCRO3", name: "CCR ON", price: 12.10, pl: 11.5, roe: 10.5, divYield: 5.4, marketCap: 24.4, evEbitda: 5.9, debtEquity: 1.8, dlEbitda: 2.70, netMargin: 8.20, liquidity: 28000000, vpv: 1.50, lpa: 1.05, vpa: 8.06, growthRate: 5.0, sector: "Consumo Cíclico", var12m: -5.10 },
  { ticker: "RAIL3", name: "Rumo ON", price: 21.50, pl: 15.4, roe: 8.9, divYield: 2.1, marketCap: 39.8, evEbitda: 7.8, debtEquity: 1.5, dlEbitda: 2.65, netMargin: 6.40, liquidity: 32000000, vpv: 1.45, lpa: 1.39, vpa: 14.82, growthRate: 12.0, sector: "Consumo Cíclico", var12m: 11.20 },
  { ticker: "MULT3", name: "Multiplan ON", price: 24.80, pl: 11.2, roe: 13.5, divYield: 5.2, marketCap: 14.5, evEbitda: 7.9, debtEquity: 0.8, dlEbitda: 1.95, netMargin: 21.50, liquidity: 21000000, vpv: 1.35, lpa: 2.21, vpa: 18.37, growthRate: 8.0, sector: "Financeiro", var12m: -2.30 },
  { ticker: "IGTI11", name: "Iguatemi Unit", price: 21.20, pl: 13.5, roe: 9.2, divYield: 5.8, marketCap: 9.4, evEbitda: 8.1, debtEquity: 0.9, dlEbitda: 2.20, netMargin: 12.80, liquidity: 14000000, vpv: 0.92, lpa: 1.57, vpa: 23.04, growthRate: 7.0, sector: "Financeiro", var12m: -4.50 },
  { ticker: "CYRE3", name: "Cyrela ON", price: 19.50, pl: 7.5, roe: 12.8, divYield: 7.8, marketCap: 7.8, evEbitda: 5.9, debtEquity: 0.6, dlEbitda: 1.40, netMargin: 14.50, liquidity: 23000000, vpv: 0.95, lpa: 2.60, vpa: 20.52, growthRate: 8.0, sector: "Consumo Cíclico", var12m: -8.50 },
  { ticker: "MRVE3", name: "MRV ON", price: 7.10, pl: -12.4, roe: -3.8, divYield: 0.0, marketCap: 3.8, evEbitda: 11.2, debtEquity: 1.2, dlEbitda: 3.90, netMargin: -1.80, liquidity: 19000000, vpv: 0.42, lpa: -0.57, vpa: 16.90, growthRate: 6.0, sector: "Consumo Cíclico", var12m: -38.50 },
  { ticker: "EZTC3", name: "EZTec ON", price: 14.20, pl: 8.9, roe: 8.2, divYield: 6.5, marketCap: 3.1, evEbitda: 6.1, debtEquity: 0.1, dlEbitda: 0.25, netMargin: 16.40, liquidity: 9000000, vpv: 0.68, lpa: 1.59, vpa: 20.88, growthRate: 5.0, sector: "Consumo Cíclico", var12m: -15.40 },
  { ticker: "BRFS3", name: "BRF S.A. ON", price: 18.20, pl: -14.5, roe: -6.4, divYield: 0.0, marketCap: 30.5, evEbitda: 6.8, debtEquity: 1.6, dlEbitda: 3.10, netMargin: -2.10, liquidity: 49000000, vpv: 2.10, lpa: -1.25, vpa: 8.66, growthRate: 4.0, sector: "Consumo Cíclico", var12m: 45.20 },
  { ticker: "BEEF3", name: "Minerva ON", price: 6.90, pl: 5.1, roe: 24.5, divYield: 8.9, marketCap: 4.1, evEbitda: 4.2, debtEquity: 2.8, dlEbitda: 3.40, netMargin: 2.50, liquidity: 16000000, vpv: 2.50, lpa: 1.35, vpa: 2.76, growthRate: 5.0, sector: "Consumo Cíclico", var12m: -28.40 },
  { ticker: "MRFG3", name: "Marfrig ON", price: 9.50, pl: 4.2, roe: 31.2, divYield: 11.2, marketCap: 8.9, evEbitda: 3.9, debtEquity: 3.1, dlEbitda: 3.95, netMargin: 1.80, liquidity: 22000000, vpv: 1.95, lpa: 2.26, vpa: 4.87, growthRate: 6.0, sector: "Consumo Cíclico", var12m: -10.50 },
  { ticker: "CRFB3", name: "Carrefour Brasil ON", price: 10.50, pl: 12.8, roe: 7.2, divYield: 4.8, marketCap: 21.8, evEbitda: 5.1, debtEquity: 1.2, dlEbitda: 2.40, netMargin: 1.50, liquidity: 27000000, vpv: 0.95, lpa: 0.82, vpa: 11.05, growthRate: 4.0, sector: "Consumo Cíclico", var12m: -14.20 },
  { ticker: "ASAI3", name: "Assaí ON", price: 11.40, pl: 14.5, roe: 18.2, divYield: 3.1, marketCap: 15.4, evEbitda: 6.2, debtEquity: 2.5, dlEbitda: 2.80, netMargin: 2.10, liquidity: 54000000, vpv: 4.10, lpa: 0.78, vpa: 2.78, growthRate: 12.5, sector: "Consumo Cíclico", var12m: -12.10 },
  { ticker: "NTCO3", name: "Natura ON", price: 15.80, pl: -6.2, roe: -4.5, divYield: 0.0, marketCap: 21.9, evEbitda: 8.4, debtEquity: 0.8, dlEbitda: 1.90, netMargin: -3.20, liquidity: 38000000, vpv: 1.10, lpa: -2.54, vpa: 14.36, growthRate: 8.0, sector: "Consumo Cíclico", var12m: -8.40 },
  { ticker: "SLCE3", name: "SLC Agrícola ON", price: 18.90, pl: 6.8, roe: 14.8, divYield: 7.1, marketCap: 8.5, evEbitda: 4.1, debtEquity: 0.8, dlEbitda: 1.50, netMargin: 11.40, liquidity: 17000000, vpv: 1.15, lpa: 2.77, vpa: 16.43, growthRate: 10.0, sector: "Consumo Cíclico", var12m: -11.20 },
  { ticker: "SMTO3", name: "São Martinho ON", price: 29.50, pl: 9.4, roe: 15.2, divYield: 4.8, marketCap: 10.2, evEbitda: 5.2, debtEquity: 0.9, dlEbitda: 1.80, netMargin: 13.50, liquidity: 15000000, vpv: 1.45, lpa: 3.13, vpa: 20.34, growthRate: 8.0, sector: "Consumo Cíclico", var12m: 5.40 },
  { ticker: "YDUQ3", name: "Yduqs ON", price: 13.50, pl: 10.5, roe: 8.2, divYield: 3.8, marketCap: 4.1, evEbitda: 5.8, debtEquity: 1.3, dlEbitda: 2.50, netMargin: 5.40, liquidity: 18000000, vpv: 1.20, lpa: 1.28, vpa: 11.25, growthRate: 6.0, sector: "Serviços", var12m: -22.40 },
  { ticker: "COGN3", name: "Cogna ON", price: 2.10, pl: -8.4, roe: -2.1, divYield: 0.0, marketCap: 3.9, evEbitda: 6.1, debtEquity: 0.9, dlEbitda: 2.95, netMargin: -1.50, liquidity: 25000000, vpv: 0.35, lpa: -0.25, vpa: 6.00, growthRate: 3.0, sector: "Serviços", var12m: -35.20 },
  { ticker: "AZUL4", name: "Azul PN", price: 9.80, pl: -1.5, roe: -85.0, divYield: 0.0, marketCap: 3.4, evEbitda: 5.2, debtEquity: -4.5, dlEbitda: 4.80, netMargin: -5.40, liquidity: 32000000, vpv: -0.80, lpa: -6.53, vpa: -12.25, growthRate: 15.0, sector: "Consumo Cíclico", var12m: -42.10 },
  { ticker: "EMBR3", name: "Embraer ON", price: 38.50, pl: 16.5, roe: 10.5, divYield: 1.2, marketCap: 28.5, evEbitda: 8.5, debtEquity: 0.8, dlEbitda: 1.50, netMargin: 4.20, liquidity: 85000000, vpv: 1.95, lpa: 2.33, vpa: 19.74, growthRate: 20.0, sector: "Bens Industriais", var12m: 85.40 },
  { ticker: "B3SA3", name: "B3 ON", price: 11.20, pl: 12.4, roe: 18.5, divYield: 6.2, marketCap: 62.4, evEbitda: 8.9, debtEquity: 0.6, dlEbitda: 1.30, netMargin: 42.10, liquidity: 140000000, vpv: 2.80, lpa: 0.90, vpa: 4.00, growthRate: 5.0, sector: "Financeiro", var12m: -15.40 },
  { ticker: "SANB11", name: "Santander Unit", price: 27.50, pl: 9.2, roe: 13.4, divYield: 7.2, marketCap: 102.5, evEbitda: 6.5, debtEquity: 0.5, dlEbitda: 0.30, netMargin: 12.10, liquidity: 42000000, vpv: 1.15, lpa: 2.98, vpa: 23.91, growthRate: 6.5, sector: "Financeiro", var12m: 4.50 },
  { ticker: "ELET3", name: "Eletrobras ON", price: 38.20, pl: 14.5, roe: 6.8, divYield: 3.5, marketCap: 88.5, evEbitda: 7.1, debtEquity: 1.2, dlEbitda: 2.85, netMargin: 8.50, liquidity: 65000000, vpv: 0.82, lpa: 2.63, vpa: 46.58, growthRate: 8.0, sector: "Energia Elétrica", var12m: 12.30 }
];

export const initialScreenerFIIs = [
  { ticker: "MXRF11", name: "Maxi Renda FII", price: 10.15, divYield: 12.45, vpv: 1.02, liquidity: 8500000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "HGLG11", name: "CGG Logística FII", price: 162.50, divYield: 8.20, vpv: 1.01, liquidity: 3500000.00, propertiesCount: 18, vacancy: 4.20, segment: "Logística" },
  { ticker: "XPML11", name: "XP Malls FII", price: 116.80, divYield: 8.50, vpv: 1.03, liquidity: 2800000.00, propertiesCount: 12, vacancy: 2.80, segment: "Shopping" },
  { ticker: "KNCR11", name: "Kinea Rendimentos Imob.", price: 104.20, divYield: 11.10, vpv: 0.99, liquidity: 4100000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "KNIP11", name: "Kinea Índice de Preços", price: 94.40, divYield: 10.85, vpv: 0.94, liquidity: 5200000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "HCTR11", name: "Hectare CE FII", price: 32.50, divYield: 18.20, vpv: 0.35, liquidity: 1400000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "DEVA11", name: "Devant Recebíveis FII", price: 42.10, divYield: 16.50, vpv: 0.44, liquidity: 950000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RECR11", name: "Fator Verità FII", price: 82.40, divYield: 12.10, vpv: 0.88, liquidity: 1200000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "BCFF11", name: "BTG Pactual FOF FII", price: 8.95, divYield: 10.20, vpv: 0.91, liquidity: 1800000.00, propertiesCount: 0, vacancy: 0.00, segment: "Fundo de Fundos" },
  { ticker: "BRCR11", name: "BTG Pactual Corporate FII", price: 54.50, divYield: 8.90, vpv: 0.55, liquidity: 850000.00, propertiesCount: 11, vacancy: 22.40, segment: "Lajes Corporativas" },
  { ticker: "VISC11", name: "Vinci Shopping FII", price: 112.40, divYield: 8.40, vpv: 0.96, liquidity: 1900000.00, propertiesCount: 15, vacancy: 3.50, segment: "Shopping" },
  { ticker: "MALL11", name: "Malls Brasil Plural FII", price: 115.20, divYield: 8.10, vpv: 0.98, liquidity: 1100000.00, propertiesCount: 8, vacancy: 2.10, segment: "Shopping" },
  { ticker: "HSML11", name: "HTS Malls FII", price: 92.50, divYield: 8.80, vpv: 0.94, liquidity: 1400000.00, propertiesCount: 7, vacancy: 1.80, segment: "Shopping" },
  { ticker: "BTLG11", name: "BTG Pactual Logística FII", price: 102.50, divYield: 8.90, vpv: 1.01, liquidity: 2900000.00, propertiesCount: 16, vacancy: 2.40, segment: "Logística" },
  { ticker: "XPLG11", name: "XP Logística FII", price: 108.40, divYield: 8.20, vpv: 0.96, liquidity: 2400000.00, propertiesCount: 14, vacancy: 3.80, segment: "Logística" },
  { ticker: "VILG11", name: "Vinci Logística FII", price: 92.10, divYield: 8.80, vpv: 0.84, liquidity: 1100000.00, propertiesCount: 10, vacancy: 4.10, segment: "Logística" },
  { ticker: "GGRC11", name: "GGR Copevi Renda FII", price: 112.50, divYield: 9.40, vpv: 0.95, liquidity: 950000.00, propertiesCount: 12, vacancy: 0.00, segment: "Logística" },
  { ticker: "ALZR11", name: "Alianza Trust Estuda FII", price: 114.20, divYield: 8.15, vpv: 1.05, liquidity: 1300000.00, propertiesCount: 15, vacancy: 0.00, segment: "Híbrido" },
  { ticker: "TGAR11", name: "TG Ativa Real FII", price: 118.50, divYield: 11.80, vpv: 0.98, liquidity: 1600000.00, propertiesCount: 22, vacancy: 5.50, segment: "Híbrido" },
  { ticker: "IRDM11", name: "Iridium Recebíveis FII", price: 78.40, divYield: 12.80, vpv: 0.85, liquidity: 2100000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "CPTS11", name: "Capitânia Securities II FII", price: 8.20, divYield: 11.20, vpv: 0.92, liquidity: 3200000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "URPR11", name: "Urca Prime Renda FII", price: 88.50, divYield: 15.40, vpv: 0.89, liquidity: 1400000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "VGIR11", name: "Valora RE FII", price: 9.40, divYield: 13.80, vpv: 0.98, liquidity: 1800000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "VGIA11", name: "Valora Fiagro", price: 8.85, divYield: 15.80, vpv: 0.94, liquidity: 2400000.00, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "KNSC11", name: "Kinea Securities FII", price: 89.20, divYield: 11.40, vpv: 0.96, liquidity: 1500000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "HGBS11", name: "Hedge Brasil Shopping FII", price: 222.40, divYield: 8.10, vpv: 1.01, liquidity: 2100000.00, propertiesCount: 17, vacancy: 4.10, segment: "Shopping" },
  { ticker: "VRTA11", name: "Fator Verità FII", price: 89.50, divYield: 11.50, vpv: 0.94, liquidity: 1300000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RECT11", name: "REC Renda Imobiliária FII", price: 42.50, divYield: 12.40, vpv: 0.44, liquidity: 450000.00, propertiesCount: 8, vacancy: 14.50, segment: "Lajes Corporativas" },
  { ticker: "JSRE11", name: "Safra Reais FII", price: 72.10, divYield: 8.50, vpv: 0.64, liquidity: 1100000.00, propertiesCount: 6, vacancy: 12.80, segment: "Lajes Corporativas" },
  { ticker: "PVBI11", name: "VBI Prime Offices FII", price: 101.40, divYield: 7.90, vpv: 0.99, liquidity: 1700000.00, propertiesCount: 4, vacancy: 2.10, segment: "Lajes Corporativas" },
  { ticker: "LVBI11", name: "VBI Logística FII", price: 114.50, divYield: 8.10, vpv: 0.98, liquidity: 1500000.00, propertiesCount: 10, vacancy: 1.50, segment: "Logística" },
  { ticker: "VINO11", name: "Vinci Offices FII", price: 7.85, divYield: 10.40, vpv: 0.72, liquidity: 900000.00, propertiesCount: 9, vacancy: 8.50, segment: "Lajes Corporativas" },
  { ticker: "PATL11", name: "Pátria Logística FII", price: 68.40, divYield: 9.80, vpv: 0.74, liquidity: 550000.00, propertiesCount: 4, vacancy: 4.80, segment: "Logística" },
  { ticker: "BARI11", name: "Barigui Rendimentos FII", price: 82.50, divYield: 13.50, vpv: 0.86, liquidity: 350000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "VGHF11", name: "Valora Hedge Fund FII", price: 9.15, divYield: 13.20, vpv: 0.97, liquidity: 4200000.00, propertiesCount: 0, vacancy: 0.00, segment: "Fundo de Fundos" },
  { ticker: "BCIA11", name: "Bradesco Carteira Imob. FII", price: 98.40, divYield: 9.20, vpv: 0.88, liquidity: 450000.00, propertiesCount: 0, vacancy: 0.00, segment: "Fundo de Fundos" },
  { ticker: "VGRI11", name: "Valora G R I FII", price: 7.82, divYield: 22.63, vpv: 0.74, liquidity: 552102.73, propertiesCount: 6, vacancy: 19.60, segment: "Lajes Corporativas" },
  { ticker: "KIVO11", name: "Kinea Oportunidades CRI", price: 67.41, divYield: 16.94, vpv: 0.77, liquidity: 591849.09, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RBVA11", name: "Rio Bravo Varejo Ativo FII", price: 79.23, divYield: 14.64, vpv: 0.74, liquidity: 1761635.23, propertiesCount: 82, vacancy: 4.80, segment: "Renda Urbana" },
  { ticker: "AAZQ11", name: "AZ Quest Fiagro", price: 7.17, divYield: 17.36, vpv: 0.83, liquidity: 590710.70, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "TRBL11", name: "TRX Logística FII", price: 67.60, divYield: 13.39, vpv: 0.71, liquidity: 526705.06, propertiesCount: 5, vacancy: 0.00, segment: "Logística" },
  { ticker: "HABT11", name: "Habitat Recebíveis Imob.", price: 79.00, divYield: 15.67, vpv: 0.84, liquidity: 864746.34, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RURA11", name: "Itaú Asset Rural Fiagro", price: 7.79, divYield: 13.71, vpv: 0.77, liquidity: 2926515.49, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "EGAF11", name: "Ecoagro Fiagro", price: 85.80, divYield: 16.54, vpv: 0.87, liquidity: 798399.15, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "HGRE11", name: "CSHG Real Estate FII", price: 118.50, divYield: 7.10, vpv: 0.82, liquidity: 1200000.00, propertiesCount: 14, vacancy: 18.20, segment: "Lajes Corporativas" },
  { ticker: "RBRR11", name: "RBR Rendimentos FII", price: 92.50, divYield: 10.80, vpv: 0.98, liquidity: 1800000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RBRF11", name: "RBR Alpha Multiestratégia FII", price: 75.80, divYield: 9.50, vpv: 0.89, liquidity: 1100000.00, propertiesCount: 0, vacancy: 0.00, segment: "Fundo de Fundos" },
  { ticker: "BRCO11", name: "Bresco Logística FII", price: 118.90, divYield: 8.10, vpv: 1.02, liquidity: 1400000.00, propertiesCount: 11, vacancy: 0.50, segment: "Logística" },
  { ticker: "GALG11", name: "Guardian Logística FII", price: 9.12, divYield: 10.50, vpv: 0.98, liquidity: 2200000.00, propertiesCount: 5, vacancy: 0.00, segment: "Logística" }
];

export const netWorthHistory = [
  { month: "Jan", value: 162600 },
  { month: "Fev", value: 267150 },
  { month: "Mar", value: 345630 },
  { month: "Abr", value: 383390 },
  { month: "Mai", value: 473040 },
  { month: "Jun", value: 541284 },
  { month: "Jul", value: 507990 },
  { month: "Ago", value: 687530 },
  { month: "Set", value: 798870 },
  { month: "Out", value: 850310 },
  { month: "Nov", value: 845230 },
  { month: "Dez", value: 845230 }
];

export const initialRebalancingList: RebalancingItem[] = [
  { ticker: "VALE3", currentWeight: 12.50, currentValue: 25000.00, targetWeight: 10.00, idealValue: 20000.00, delta: -5000.00, action: "SELL" },
  { ticker: "PETR4", currentWeight: 18.00, currentValue: 36000.00, targetWeight: 15.00, idealValue: 30000.00, delta: -6000.00, action: "SELL" },
  { ticker: "ITUB4", currentWeight: 9.00, currentValue: 18000.00, targetWeight: 10.00, idealValue: 20000.00, delta: 2000.00, action: "BUY" },
  { ticker: "BBDC4", currentWeight: 10.50, currentValue: 21000.00, targetWeight: 10.00, idealValue: 20000.00, delta: -1000.00, action: "SELL" },
  { ticker: "WEGE3", currentWeight: 7.00, currentValue: 14000.00, targetWeight: 8.00, idealValue: 16000.00, delta: 2000.00, action: "BUY" },
  { ticker: "JBSS3", currentWeight: 6.00, currentValue: 12000.00, targetWeight: 5.00, idealValue: 10000.00, delta: -2000.00, action: "SELL" },
  { ticker: "MGLU3", currentWeight: 4.00, currentValue: 8000.00, targetWeight: 6.00, idealValue: 12000.00, delta: 4000.00, action: "BUY" },
  { ticker: "BBAS3", currentWeight: 8.00, currentValue: 16000.00, targetWeight: 10.00, idealValue: 20000.00, delta: 4000.00, action: "BUY" }
];

export const initialTheses: ThesisItem[] = [
  {
    ticker: "VALE3",
    fairPrice: 75.00,
    currentPE: 6.5,
    dividendYield: 12.5,
    lastUpdated: "Há 2 minutos",
    thesisContent: "# Tese de Investimento Vale VALE3\n\nA Vale é um dos maiores produtores de minério de ferro de alta qualidade do mundo, operando no sistema de baixo custo de S11D. Acreditamos que a demanda secular chinesa por descarbonização do aço aumentará o prêmio por pelotização de alta concentração.\n\nPrincipais vetores: dividendyield previsível elevado, caixa gerado estritamente livre, margens de ebitda resilientes a patamares de minério a US$ 90/tonelada.",
    catalysts: [
      "Reabertura econômica da China e fomento à habitação cooperativa",
      "Demanda recorde global por minério de ferro verde de alto teor de ferro",
      "Redução gradual de provisionamentos de barragens históricas"
    ],
    risks: [
      "Alterações governamentais e insegurança jurídica na tributação de royalties mineiros em Minas Gerais",
      "Recessão global de manufaturas puxando o consumo do aço bruto para baixo",
      "Fortalecimento cambial do Real prejudicando as receitas globais dolarizadas das exportações"
    ]
  },
  {
    ticker: "PETR4",
    fairPrice: 42.00,
    currentPE: 4.2,
    dividendYield: 14.8,
    lastUpdated: "Há 5 minutos",
    thesisContent: "# Tese de Investimento Petrobras PETR4\n\nProdução do Pré-Sal continua a ter custos de extração extremely competitivos (lifting cost abaixo de US$ 35/barril). Fluxo de caixa de investimentos livres suportam dividendos consistentes.",
    catalysts: [
      "Preço de petróleo Brent mantido no patamar de US$ 75-85",
      "Exploração com sucesso da Margem Equatorial brasileira"
    ],
    risks: [
      "Mudanças na política doméstica de preço de paridade de importação de refino",
      "Intervenções políticas em projetos de fusões e aquisições industriais"
    ]
  },
  {
    ticker: "ITUB4",
    fairPrice: 35.00,
    currentPE: 8.9,
    dividendYield: 6.2,
    lastUpdated: "Ontem 17:30",
    thesisContent: "# Tese Itaú Unibanco ITUB4\n\nLíder de banco privado da América Latina, com menor índice de inadimplência corporativa e maior capacidade de repasse de taxas pós-crise. Eficiência digital gerando ganhos de ROE marginais.",
    catalysts: [
      "Aumento no spread de crédito varejo de menor risco",
      "Rápida digitalização de canais com otimização estrutural de agências físicas"
    ],
    risks: [
      "Novas regulamentações tributárias sobre a dedução de Juros Sobre Capital Próprio (JCP)",
      "Aumento acelerado de fintechs e bancos digitais agressivos em tarifas corporativas"
    ]
  }
];

export const lendingFeesHistory = [
  { date: "2026-06-19", feeRate: 2.50, dailyCost: 2.05, trend: "Stable →" },
  { date: "2026-06-18", feeRate: 2.45, dailyCost: 2.01, trend: "Slight Increase ↗" },
  { date: "2026-06-17", feeRate: 2.40, dailyCost: 1.97, trend: "Stable →" }
];
