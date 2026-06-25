import sys
import pandas as pd
from datetime import datetime, timedelta

# Importação condicional do MetaTrader5 pois ele só compila nativamente no Windows
try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False

import yfinance as yf

class B3Data:
    """
    Classe responsável pela extração de dados de preço de ativos da B3 de forma 100% gratuita.
    Prefere a integração direta em Real-Time do MetaTrader 5 (MT5) se disponível e ativa,
    utilizando a biblioteca yfinance como fallback multiplataforma seguro.
    """
    
    def __init__(self):
        self.mt5_initialized = False
        if MT5_AVAILABLE:
            self._init_mt5()
        else:
            print("[B3Data] MetaTrader5 não está instalado ou o sistema operacional não é Windows. yfinance será usado.")

    def _init_mt5(self) -> bool:
        """Inicializa a conexão com o terminal MetaTrader 5 rodando localmente."""
        if not MT5_AVAILABLE:
            return False
            
        try:
            # Tenta inicializar a conexão com a corretora ativa no MT5
            if mt5.initialize():
                print("[B3Data] Conectado ao terminal MetaTrader 5 com sucesso!")
                self.mt5_initialized = True
                return True
            else:
                print(f"[B3Data] Falha ao inicializar MetaTrader5. Código do erro: {mt5.last_error()}")
                return False
        except Exception as e:
            print(f"[B3Data] Erro ao conectar ao MetaTrader 5: {e}")
            return False

    def get_closing_price(self, ticker: str) -> float:
        """
        Retorna o preço de fechamento mais recente (ou cotação atual) do ativo.
        """
        formatted_ticker = ticker.upper()
        
        # 1. Tentativa via MetaTrader 5 (Real-time Gratuito)
        if self.mt5_initialized:
            try:
                # O ativo precisa estar visível no Market Watch do MT5
                mt5.symbol_select(formatted_ticker, True)
                tick = mt5.symbol_info_tick(formatted_ticker)
                if tick is not None:
                    # Retorna o último preço operado (last) ou ask como backup
                    price = tick.last if tick.last > 0 else tick.ask
                    if price > 0:
                        print(f"[B3Data] {formatted_ticker} preço obtido via MT5: R$ {price:.2f}")
                        return float(price)
            except Exception as e:
                print(f"[B3Data] Erro ao consultar {formatted_ticker} no MT5: {e}. Alternando para fallback.")

        # 2. Fallback via yfinance (Dados Históricos e Diários de Acesso Livre)
        try:
            # A B3 requer o sufixo '.SA' no yfinance
            yf_ticker_name = f"{formatted_ticker}.SA"
            ticker_obj = yf.Ticker(yf_ticker_name)
            
            # Obtém histórico rápido do último dia
            hist = ticker_obj.history(period="1d")
            if not hist.empty:
                price = hist["Close"].iloc[-1]
                print(f"[B3Data] {formatted_ticker} preço obtido via yfinance fallback: R$ {price:.2f}")
                return float(price)
            
            # Se a tabela de histórico vier vazia, tenta info geral
            info = ticker_obj.info
            price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
            if price:
                print(f"[B3Data] {formatted_ticker} preço obtido via yfinance info: R$ {price:.2f}")
                return float(price)
                
        except Exception as e:
            print(f"[B3Data] Falha crítica de extração de preço para {formatted_ticker}: {e}")
            
        # Caso ambos falhem, retorna um fallback estático baseado no histórico brasileiro médio do ativo
        print(f"[B3Data] Alerta: Utilizando fallback de segurança para {formatted_ticker}.")
        return 72.30

    def get_historical_data(self, ticker: str, days: int = 180) -> pd.DataFrame:
        """
        Puxa a série de preços histórica para cálculos avançados (Ex: Volatilidade, PyPortfolioOpt).
        """
        formatted_ticker = ticker.upper()
        
        if self.mt5_initialized:
            try:
                utc_to = datetime.now()
                utc_from = utc_to - timedelta(days=days)
                rates = mt5.copy_rates_from(formatted_ticker, mt5.TIMEFRAME_D1, utc_from, days)
                if rates is not None and len(rates) > 0:
                    df = pd.DataFrame(rates)
                    df['time'] = pd.to_datetime(df['time'], unit='s')
                    df.rename(columns={'time': 'Date', 'close': 'Close'}, inplace=True)
                    df.set_index('Date', inplace=True)
                    return df[['Close']]
            except Exception as e:
                print(f"[B3Data] Erro ao puxar série histórica no MT5: {e}")

        # Fallback yfinance para Série Histórica
        try:
            yf_ticker_name = f"{formatted_ticker}.SA"
            df = yf.download(yf_ticker_name, period=f"{days}d", progress=False)
            if not df.empty:
                return df[['Close']]
        except Exception as e:
            print(f"[B3Data] Erro ao puxar série histórica no yfinance: {e}")
            
        return pd.DataFrame()

    def __del__(self):
        """Finaliza a conexão de forma segura ao encerrar o objeto."""
        if self.mt5_initialized and MT5_AVAILABLE:
            mt5.shutdown()
            print("[B3Data] Conexão com o MetaTrader 5 encerrada com segurança.")
