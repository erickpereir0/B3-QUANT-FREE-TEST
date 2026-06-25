import { baseApiClient } from "./base";
import { ValuationParameters, ThesisItem, RebalancingItem, NewsItem, ScreenerAssetsResponse } from "../../types";

export interface PythonAssetData {
  ticker: string;
  price: number;
  lpa: number;
  vpa: number;
  dividend: number;
  growth_rate: number;
  name: string;
  source: "MetaTrader5" | "yfinance" | "fallback";
  timestamp: string;
}

export interface ValuationOutput {
  ticker: string;
  price: number;
  graham: {
    fair_price: number;
    safety_margin: number;
    valid: boolean;
  };
  bazin: {
    fair_price: number;
    safety_margin: number;
    valid: boolean;
  };
  gordon: {
    fair_price: number;
    safety_margin: number;
    valid: boolean;
  };
  custom_anti_strap: {
    fair_price: number;
    safety_margin: number;
    confidence_score: number;
  };
}

export interface SentimentAnalysisOutput {
  ticker: string;
  company_name: string;
  source_pdf: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  risk_score: number; // 0 a 100
  red_flags: string[];
  positives: string[];
  summary: string;
  timestamp: string;
}

export interface PortfolioOptimizationOutput {
  weights: { [ticker: string]: number };
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

/**
 * Serviço de API de integração com o Backend B3-Quant-Free em Python
 */
export class B3QuantApiService {
  /**
   * Obtém cotação real-time e dados fundamentais de um ativo (Integrado com MT5 e Fallback yfinance)
   */
  public async getAssetData(ticker: string): Promise<PythonAssetData> {
    return baseApiClient.get<PythonAssetData>(`/api/asset/${ticker.toUpperCase()}`);
  }

  /**
   * Calcula múltiplos modelos de Valuation de forma flexível utilizando as estratégias do backend
   */
  public async calculateValuation(
    ticker: string,
    params: ValuationParameters
  ): Promise<ValuationOutput> {
    return baseApiClient.post<ValuationOutput>(`/api/valuation/${ticker.toUpperCase()}`, params);
  }

  /**
   * Aciona a esteira NLP de análise de PDF de relatórios financeiros mais recentes da CVM (via Groq/Llama-3)
   */
  public async analyzeFilingReport(ticker: string): Promise<SentimentAnalysisOutput> {
    return baseApiClient.post<SentimentAnalysisOutput>(`/api/nlp/analyze`, { ticker: ticker.toUpperCase() });
  }

  /**
   * Solicita a otimização de carteira usando a biblioteca PyPortfolioOpt no backend Python
   */
  public async optimizePortfolio(
    tickers: string[],
    targetReturn?: number
  ): Promise<PortfolioOptimizationOutput> {
    return baseApiClient.post<PortfolioOptimizationOutput>(`/api/portfolio/optimize`, {
      tickers: tickers.map(t => t.toUpperCase()),
      target_return: targetReturn,
    });
  }

  /**
   * Retorna os fatos relevantes e notícias mais recentes analisados por NLP
   */
  public async getRecentNews(ticker?: string): Promise<NewsItem[]> {
    const endpoint = ticker ? `/api/news?ticker=${ticker.toUpperCase()}` : "/api/news";
    return baseApiClient.get<NewsItem[]>(endpoint);
  }

  /**
   * Obtém teses fundamentalistas do ativo salvas ou geradas no backend
   */
  public async getThesis(ticker: string): Promise<ThesisItem> {
    return baseApiClient.get<ThesisItem>(`/api/thesis/${ticker.toUpperCase()}`);
  }

  /**
   * Obtém o universo completo de ativos da B3 com preços em lote em tempo real
   */
  public async getScreenerAssets(): Promise<ScreenerAssetsResponse> {
    return baseApiClient.get<ScreenerAssetsResponse>("/api/screener/assets");
  }
}

export const b3QuantApiService = new B3QuantApiService();
