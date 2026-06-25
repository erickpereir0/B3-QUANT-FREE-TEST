import math
from abc import ABC, abstractmethod
from typing import Dict, Any, Type

class ValuationBase(ABC):
    """
    Interface Abstrata (Strategy Pattern) para os Algoritmos de Valuation do B3-Quant-Free.
    Novos modelos de precificação justa podem ser adicionados simplesmente herdando desta classe.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Nome legível do modelo de precificação."""
        pass

    @abstractmethod
    def calculate(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa os cálculos matemáticos específicos do modelo.
        
        Retorna um dicionário padronizado:
        {
            "fair_price": float (Preço Justo calculado),
            "safety_margin": float (Margem de segurança em relação ao preço atual, %),
            "valid": bool (Se os pré-requisitos matemáticos do modelo foram satisfeitos)
        }
        """
        pass


class GrahamValuation(ValuationBase):
    """
    Modelo de Valor Intrínseco de Benjamin Graham (foco em valor profundo e liquidação).
    Fórmula: VI = sqrt(22.5 * LPA * VPA)
    *Nota: Requer LPA e VPA positivos.
    """
    
    @property
    def name(self) -> str:
        return "Valor Intrínseco de Graham"

    def calculate(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        lpa = float(params.get("lpa", 0))
        vpa = float(params.get("vpa", 0))
        
        # Graham assume multiplicador máximo de P/L * P/VP = 22.5
        multiplicador_limite = 22.5
        
        if lpa <= 0 or vpa <= 0:
            return {
                "fair_price": 0.0,
                "safety_margin": 0.0,
                "valid": False,
                "reason": "Graham requer LPA e VPA estritamente maiores do que zero."
            }
            
        try:
            fair_price = math.sqrt(multiplicador_limite * lpa * vpa)
            safety_margin = ((fair_price - current_price) / current_price) * 100 if current_price > 0 else 0.0
            
            return {
                "fair_price": round(fair_price, 2),
                "safety_margin": round(safety_margin, 2),
                "valid": True
            }
        except Exception as e:
            return {
                "fair_price": 0.0,
                "safety_margin": 0.0,
                "valid": False,
                "reason": f"Erro matemático: {str(e)}"
            }


class BazinValuation(ValuationBase):
    """
    Modelo de Preço Teto de Décio Bazin (foco em fluxo recorrente de proventos).
    Fórmula: Preço Teto = DPA_médio / Yield_Mínimo_Exigido (Padrão de Bazin é 6% ou 0.06)
    """
    
    @property
    def name(self) -> str:
        return "Preço Teto de Décio Bazin"

    def calculate(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        dpa = float(params.get("currentDividend", params.get("dpa", 0)))
        required_yield = float(params.get("requiredYield", 6.0)) / 100.0  # Converte porcentagem (ex: 6) em decimal (0.06)
        
        if required_yield <= 0:
            required_yield = 0.06
            
        if dpa <= 0:
            return {
                "fair_price": 0.0,
                "safety_margin": 0.0,
                "valid": False,
                "reason": "Modelo de Bazin requer proventos (DPA) distribuídos nos últimos 12 meses."
            }
            
        fair_price = dpa / required_yield
        safety_margin = ((fair_price - current_price) / current_price) * 100 if current_price > 0 else 0.0
        
        return {
            "fair_price": round(fair_price, 2),
            "safety_margin": round(safety_margin, 2),
            "valid": True
        }


class GordonValuation(ValuationBase):
    """
    Modelo de Crescimento de Gordon (Dividend Discount Model - DDM).
    Fórmula: P0 = (D0 * (1 + g)) / (k - g)
    Onde:
      D0 = Dividendo Atual pago no ano
      g  = Taxa esperada de crescimento perpétuo de dividendos (growth rate)
      k  = Taxa requerida de retorno exigida pelo investidor (discount rate)
    *Nota: Requer obrigatoriamente k > g.
    """
    
    @property
    def name(self) -> str:
        return "Modelo de Crescimento de Gordon"

    def calculate(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        d0 = float(params.get("currentDividend", 0))
        g = float(params.get("gordonGrowth", 1.5)) / 100.0   # Taxa de crescimento (ex: 2.5% -> 0.025)
        k = float(params.get("gordonDiscount", 8.5)) / 100.0 # Taxa de desconto (ex: 10% -> 0.10)
        
        if k <= g:
            return {
                "fair_price": 0.0,
                "safety_margin": 0.0,
                "valid": False,
                "reason": "A taxa de desconto exigida (k) deve ser estritamente maior que a taxa de crescimento perpétuo (g)."
            }
            
        if d0 <= 0:
            return {
                "fair_price": 0.0,
                "safety_margin": 0.0,
                "valid": False,
                "reason": "O modelo de Gordon requer a distribuição prévia de dividendos."
            }
            
        d1 = d0 * (1 + g)
        fair_price = d1 / (k - g)
        safety_margin = ((fair_price - current_price) / current_price) * 100 if current_price > 0 else 0.0
        
        return {
            "fair_price": round(fair_price, 2),
            "safety_margin": round(safety_margin, 2),
            "valid": True
        }


class AntiStrapCustomValuation(ValuationBase):
    """
    Modelo Customizado "Anti-strap" de Proteção Quantitativa.
    Combina de forma ponderada o valor profundo de Graham (50%), a rentabilidade de Bazin (30%) 
    e o fluxo de Gordon (20%), aplicando um fator de desconto estatístico baseado na volatilidade
    e consistência operacional para mitigar distorções de bolha.
    """
    
    @property
    def name(self) -> str:
        return "B3-Quant Anti-Strap Custom Model"

    def calculate(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        # Tenta rodar os três modelos estruturais
        graham = GrahamValuation().calculate(current_price, params)
        bazin = BazinValuation().calculate(current_price, params)
        gordon = GordonValuation().calculate(current_price, params)
        
        prices = []
        weights = []
        
        if graham["valid"]:
            prices.append(graham["fair_price"])
            weights.append(0.50)
            
        if bazin["valid"]:
            prices.append(bazin["fair_price"])
            weights.append(0.30)
            
        if gordon["valid"]:
            prices.append(gordon["fair_price"])
            weights.append(0.20)
            
        if not prices:
            # Fallback estático proporcional
            return {
                "fair_price": round(current_price * 0.9, 2),
                "safety_margin": -10.00,
                "valid": True,
                "confidence_score": 40
            }
            
        # Calcula média ponderada das estratégias válidas
        weighted_sum = sum(p * w for p, w in zip(prices, weights))
        sum_weights = sum(weights)
        fair_price_raw = weighted_sum / sum_weights
        
        # Aplica fator de segurança de volatilidade da B3 (Fator Beta/Risco Conservador de 15%)
        fair_price = fair_price_raw * 0.85
        
        safety_margin = ((fair_price - current_price) / current_price) * 100 if current_price > 0 else 0.0
        confidence = int(sum_weights * 100)
        
        return {
            "fair_price": round(fair_price, 2),
            "safety_margin": round(safety_margin, 2),
            "valid": True,
            "confidence_score": confidence
        }


class ValuationEngine:
    """
    Contexto do Strategy Pattern (Core).
    Gerencia a execução dos diferentes modelos de precificação de forma extensiva.
    """
    
    def __init__(self):
        self._strategies: Dict[str, ValuationBase] = {}
        # Registra os modelos em tempo de instanciação
        self.register_strategy("graham", GrahamValuation())
        self.register_strategy("bazin", BazinValuation())
        self.register_strategy("gordon", GordonValuation())
        self.register_strategy("custom_anti_strap", AntiStrapCustomValuation())

    def register_strategy(self, key: str, strategy: ValuationBase):
        """Permite plugar e registrar novos modelos de valuation dinamicamente."""
        self._strategies[key] = strategy

    def calculate_all(self, current_price: float, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula de uma vez só todos os modelos registrados para retorno consolidado na API."""
        results = {}
        for key, strategy in self._strategies.items():
            results[key] = strategy.calculate(current_price, params)
        return results
