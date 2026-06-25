import { useState, useCallback } from "react";
import { 
  b3QuantApiService, 
  PythonAssetData, 
  ValuationOutput, 
  SentimentAnalysisOutput, 
  PortfolioOptimizationOutput 
} from "../services/api/b3QuantApi";
import { ValuationParameters } from "../types";

export function useB3Quant() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<PythonAssetData | null>(null);
  const [valuation, setValuation] = useState<ValuationOutput | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysisOutput | null>(null);
  const [optimizedPortfolio, setOptimizedPortfolio] = useState<PortfolioOptimizationOutput | null>(null);

  /**
   * Busca dados fundamentais do ativo via MetaTrader 5 / yfinance
   */
  const fetchAssetData = useCallback(async (ticker: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await b3QuantApiService.getAssetData(ticker);
      setAssetData(data);
      return data;
    } catch (err: any) {
      const errMsg = err.message || "Erro desconhecido ao buscar dados do ativo.";
      setError(errMsg);
      console.error("[useB3Quant] fetchAssetData error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calcula o valuation usando as estratégias modulares da API Python
   */
  const calculateValuation = useCallback(async (ticker: string, params: ValuationParameters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await b3QuantApiService.calculateValuation(ticker, params);
      setValuation(result);
      return result;
    } catch (err: any) {
      const errMsg = err.message || "Erro desconhecido ao calcular o valuation.";
      setError(errMsg);
      console.error("[useB3Quant] calculateValuation error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Executa análise de PDF (CVM) e NLP de sentimento / Red Flags
   */
  const analyzeFiling = useCallback(async (ticker: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await b3QuantApiService.analyzeFilingReport(ticker);
      setSentimentAnalysis(analysis);
      return analysis;
    } catch (err: any) {
      const errMsg = err.message || "Erro desconhecido ao analisar relatório financeiro.";
      setError(errMsg);
      console.error("[useB3Quant] analyzeFiling error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Otimiza a carteira de investimentos usando MPT / PyPortfolioOpt no backend
   */
  const optimizePortfolioWeights = useCallback(async (tickers: string[], targetReturn?: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await b3QuantApiService.optimizePortfolio(tickers, targetReturn);
      setOptimizedPortfolio(result);
      return result;
    } catch (err: any) {
      const errMsg = err.message || "Erro desconhecido ao otimizar carteira.";
      setError(errMsg);
      console.error("[useB3Quant] optimizePortfolio error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    assetData,
    valuation,
    sentimentAnalysis,
    optimizedPortfolio,
    fetchAssetData,
    calculateValuation,
    analyzeFiling,
    optimizePortfolioWeights,
    clearError
  };
}
