/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockPosition, Alert, CVMFilings, NewsItem, AssetCorrelation, RebalancingItem, ThesisItem } from "./types";

export const initialStockPositions: StockPosition[] = [
  { ticker: "VALE3", averagePrice: 68.50, currentPrice: 72.30, quantity: 500, totalValue: 36150.00, plPercentage: 5.55 },
  { ticker: "PETR4", averagePrice: 28.50, currentPrice: 34.10, quantity: 800, totalValue: 27280.00, plPercentage: 19.65 },
  { ticker: "ITUB4", averagePrice: 24.50, currentPrice: 28.95, quantity: 1200, totalValue: 34740.00, plPercentage: 18.16 },
  { ticker: "BBAS3", averagePrice: 36.40, currentPrice: 41.20, quantity: 600, totalValue: 24720.00, plPercentage: 13.19 },
  { ticker: "BBDC4", averagePrice: 13.10, currentPrice: 14.50, quantity: 1100, totalValue: 15950.00, plPercentage: 10.69 },
  { ticker: "WEGE3", averagePrice: 34.00, currentPrice: 40.00, quantity: 450, totalValue: 18000.00, plPercentage: 17.65 },
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
  { ticker: "CMIG4", name: "Cemig PN", price: 10.35, pl: 4.16, roe: 26.00, divYield: 13.36, marketCap: 18.5, evEbitda: 3.8, debtEquity: 0.45, dlEbitda: 0.91, netMargin: 17.88, liquidity: 35000000, vpv: 1.05, lpa: 2.48, vpa: 9.85, growthRate: 3.0, sector: "Energia Elétrica" },
  { ticker: "CMIN3", name: "CSN Mineração ON", price: 5.65, pl: 6.78, roe: 44.09, divYield: 13.76, marketCap: 31.2, evEbitda: 4.2, debtEquity: -0.32, dlEbitda: -0.85, netMargin: 27.45, liquidity: 25000000, vpv: 1.55, lpa: 0.83, vpa: 3.64, growthRate: 4.0, sector: "Materiais" },
  { ticker: "ISAE4", name: "ISA CTEEP PN", price: 22.39, pl: 4.15, roe: 17.70, divYield: 10.54, marketCap: 14.8, evEbitda: 5.1, debtEquity: 0.92, dlEbitda: 2.15, netMargin: 44.60, liquidity: 18000000, vpv: 0.95, lpa: 5.39, vpa: 23.56, growthRate: 3.5, sector: "Energia Elétrica" },
  { ticker: "VALE3", name: "Vale S.A.", price: 65.42, pl: 4.5, roe: 22.1, divYield: 9.8, marketCap: 305.2, evEbitda: 3.2, debtEquity: 0.8, dlEbitda: 1.25, netMargin: 18.25, liquidity: 145000000, vpv: 1.45, lpa: 14.53, vpa: 45.11, growthRate: 12.0, sector: "Materiais" },
  { ticker: "PETR4", name: "Petrobras PN", price: 34.10, pl: 2.8, roe: 28.5, divYield: 12.4, marketCap: 450.1, evEbitda: 2.1, debtEquity: 0.7, dlEbitda: 0.72, netMargin: 22.10, liquidity: 350000000, vpv: 1.10, lpa: 12.17, vpa: 31.00, growthRate: 15.0, sector: "Materiais" },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", price: 28.95, pl: 8.2, roe: 18.9, divYield: 5.1, marketCap: 270.5, evEbitda: 5.8, debtEquity: 0.5, dlEbitda: 0.35, netMargin: 15.40, liquidity: 120000000, vpv: 1.83, lpa: 3.53, vpa: 15.82, growthRate: 8.0, sector: "Financeiro" },
  { ticker: "BBDC4", name: "Bradesco PN", price: 14.50, pl: 9.1, roe: 14.2, divYield: 6.3, marketCap: 145.8, evEbitda: 4.9, debtEquity: 0.6, dlEbitda: 0.40, netMargin: 12.50, liquidity: 65000000, vpv: 1.12, lpa: 1.59, vpa: 12.94, growthRate: 6.0, sector: "Financeiro" },
  { ticker: "BBAS3", name: "Banco do Brasil ON", price: 41.20, pl: 5.3, roe: 19.8, divYield: 7.5, marketCap: 118.2, evEbitda: 4.5, debtEquity: 0.4, dlEbitda: 0.22, netMargin: 16.80, liquidity: 95000000, vpv: 0.85, lpa: 7.77, vpa: 48.47, growthRate: 10.0, sector: "Financeiro" },
  { ticker: "WEGE3", name: "Weg ON", price: 40.00, pl: 22.5, roe: 21.2, divYield: 2.8, marketCap: 84.0, evEbitda: 14.3, debtEquity: 0.2, dlEbitda: -0.15, netMargin: 16.20, liquidity: 45000000, vpv: 4.10, lpa: 1.77, vpa: 9.75, growthRate: 18.0, sector: "Materiais" },
  { ticker: "JBSS3", name: "JBS ON", price: 22.15, pl: 7.4, roe: 16.0, divYield: 5.5, marketCap: 49.3, evEbitda: 4.1, debtEquity: 1.1, dlEbitda: 1.95, netMargin: 4.50, liquidity: 35000000, vpv: 1.25, lpa: 2.99, vpa: 17.72, growthRate: 5.0, sector: "Consumo Cíclico" },
  { ticker: "ABEV3", name: "Ambev S.A.", price: 13.05, pl: 12.8, roe: 15.6, divYield: 6.8, marketCap: 205.5, evEbitda: 8.1, debtEquity: 0.1, dlEbitda: -0.85, netMargin: 18.50, liquidity: 85000000, vpv: 2.45, lpa: 1.01, vpa: 5.32, growthRate: 7.0, sector: "Consumo Cíclico" }
];

export const initialScreenerFIIs = [
  { ticker: "VGRI11", name: "Valora G R I FII", price: 7.82, divYield: 22.63, vpv: 0.74, liquidity: 552102.73, propertiesCount: 6, vacancy: 19.60, segment: "Lajes Corporativas" },
  { ticker: "KIVO11", name: "Kinea Oportunidades CRI", price: 67.41, divYield: 16.94, vpv: 0.77, liquidity: 591849.09, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RBVA11", name: "Rio Bravo Varejo Ativo FII", price: 79.23, divYield: 14.64, vpv: 0.74, liquidity: 1761635.23, propertiesCount: 82, vacancy: 4.80, segment: "Renda Urbana" },
  { ticker: "AAZQ11", name: "AZ Quest Fiagro", price: 7.17, divYield: 17.36, vpv: 0.83, liquidity: 590710.70, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "TRBL11", name: "TRX Logística FII", price: 67.60, divYield: 13.39, vpv: 0.71, liquidity: 526705.06, propertiesCount: 5, vacancy: 0.00, segment: "Logística" },
  { ticker: "HABT11", name: "Habitat Recebíveis Imob.", price: 79.00, divYield: 15.67, vpv: 0.84, liquidity: 864746.34, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "RURA11", name: "Itaú Asset Rural Fiagro", price: 7.79, divYield: 13.71, vpv: 0.77, liquidity: 2926515.49, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "EGAF11", name: "Ecoagro Fiagro", price: 85.80, divYield: 16.54, vpv: 0.87, liquidity: 798399.15, propertiesCount: 0, vacancy: 0.00, segment: "FIAgro" },
  { ticker: "KNIP11", name: "Kinea Índice de Preços", price: 94.40, divYield: 10.85, vpv: 0.94, liquidity: 5200000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "HGLG11", name: "CGG Logística FII", price: 162.50, divYield: 8.20, vpv: 1.01, liquidity: 3500000.00, propertiesCount: 18, vacancy: 4.20, segment: "Logística" },
  { ticker: "XPML11", name: "XP Malls FII", price: 116.80, divYield: 8.50, vpv: 1.03, liquidity: 2800000.00, propertiesCount: 12, vacancy: 2.80, segment: "Shopping" },
  { ticker: "KNCR11", name: "Kinea Rendimentos Imob.", price: 104.20, divYield: 11.10, vpv: 0.99, liquidity: 4100000.00, propertiesCount: 0, vacancy: 0.00, segment: "Papel CRI" },
  { ticker: "HGRE11", name: "CSHG Real Estate FII", price: 118.50, divYield: 7.10, vpv: 0.82, liquidity: 1200000.00, propertiesCount: 14, vacancy: 18.20, segment: "Lajes Corporativas" }
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
