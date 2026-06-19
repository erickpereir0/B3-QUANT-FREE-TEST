/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  TrendingUp,
  LayoutDashboard,
  Percent,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Compass,
  Bell,
  Sliders,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  FileText,
  Globe,
  Settings,
  Calculator,
  BookOpen,
  Maximize2,
  Trash2,
  Plus,
  Minus,
  Info,
  Save,
  Moon,
  Sun,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
  MessageCircle,
  Cpu,
  Bookmark,
  Star,
  Upload,
  X,
  Paperclip,
  ChevronUp,
  ChevronDown,
  Filter
} from "lucide-react";

import {
  initialStockPositions,
  initialAlerts,
  initialCVMFilings,
  initialNews,
  initialCorrelation,
  initialScreenerStocks,
  initialScreenerFIIs,
  netWorthHistory,
  initialRebalancingList,
  initialTheses,
  lendingFeesHistory
} from "./data";

import {
  CustomPieChart,
  CustomBarChart,
  EfficientFrontierPlot,
  LiquidationRiskGauge,
  CumulativeLineGraph
} from "./components/Charts";

import { InteractiveMap } from "./components/InteractiveMap";

export default function App() {
  // Navigation State
  // Organized into 6 Main Sections, each containing the specific screens
  const [activeSegment, setActiveSegment] = useState<"overview" | "valuation" | "analysis" | "screener" | "actions" | "ai">("overview");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // App global interactive states
  const [positions, setPositions] = useState(initialStockPositions);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [theses, setTheses] = useState(initialTheses);
  const [newAlert, setNewAlert] = useState({ ticker: "ITUB4", metric: "Price", condition: "Greater than", value: "" });
  const [selectedThesis, setSelectedThesis] = useState(initialTheses[0]);
  const [thesisText, setThesisText] = useState(initialTheses[0].thesisContent);

  // Favorites States & Helper
  const [favoriteTickers, setFavoriteTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("b3_favorites_list");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const toggleFavorite = (ticker: string) => {
    setFavoriteTickers((prev) => {
      const updated = prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker];
      try {
        localStorage.setItem("b3_favorites_list", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Advanced Screener State (Stocks & FIIs)
  const [screenerMode, setScreenerMode] = useState<"stocks" | "fiis">("stocks");
  
  // Taxas de Valuation (Ações)
  const [vBazin, setVBazin] = useState(6.00);
  const [vGraham, setVGraham] = useState(22.50);
  const [vPeterLynch, setVPeterLynch] = useState(3.00);
  
  // Filtros Principais (Ações)
  const [stockPlMin, setStockPlMin] = useState(3.00);
  const [stockPlMax, setStockPlMax] = useState(15.00);
  const [stockDlEbitdaMin, setStockDlEbitdaMin] = useState("");
  const [stockDlEbitdaMax, setStockDlEbitdaMax] = useState(5.00);
  const [stockDyMin, setStockDyMin] = useState(6.00);
  const [stockMostrar, setStockMostrar] = useState("Todos");
  const [stockSearch, setStockSearch] = useState("");
  const [stockRankMethod, setStockRankMethod] = useState("Rank GD");
  
  // Filtros Extras de Ações (Collapsible)
  const [stockExtraExpanded, setStockExtraExpanded] = useState(true);
  const [stockNetMargin, setStockNetMargin] = useState(10.00);
  const [stockRoe, setStockRoe] = useState(10.00);
  const [stockLiquidity, setStockLiquidity] = useState(1000000);

  // Filtros de FIIs
  const [fiiDyMin, setFiiDyMin] = useState(7.00);
  const [fiiLiquidityMin, setFiiLiquidityMin] = useState(500000);
  const [fiiVacancyMax, setFiiVacancyMax] = useState(30.00);
  const [fiiVpvMin, setFiiVpvMin] = useState(0.70);
  const [fiiVpvMax, setFiiVpvMax] = useState(1.05);
  const [fiiSegment, setFiiSegment] = useState("");
  const [fiiMostrar, setFiiMostrar] = useState("Método 2em1");
  const [fiiSearch, setFiiSearch] = useState("");

  const [selectedSector, setSelectedSector] = useState("Todos");
  const [plFilter, setPlFilter] = useState(15);
  const [roeFilter, setRoeFilter] = useState(12);
  const [dyFilter, setDyFilter] = useState(4);
  const [mcapFilter, setMcapFilter] = useState(400);

  // Valuation simulation state (VALE3 default)
  const [valuationParams, setValuationParams] = useState({
    ticker: "VALE3",
    lpa: 3.38,
    vpa: 47.92,
    dpa: 6.34,
    requiredYield: 6.0,
    currentDividend: 0.90,
    gordonGrowth: 3.0,
    gordonDiscount: 14.50,
    payout: 96.54,
    roe: 21.38,
    growthRate: 0.74,
    discountRate: 14.50,
    projectionYears: 5,
    projectionGrowth: 5.0
  });

  // Estados para o fluxo de caixa descontado baseado na imagem 1
  const [dcfPayout, setDcfPayout] = useState(68.84);
  const [dcfRoe, setDcfRoe] = useState(16.75);
  const [dcfGrowthRate, setDcfGrowthRate] = useState(5.22);
  const [dcfDiscountRate, setDcfDiscountRate] = useState(14.50);
  const [dcfProjectionYears, setDcfProjectionYears] = useState<3 | 5>(3);
  const [dcfSharesExTreasury, setDcfSharesExTreasury] = useState(2860682000);
  const [dcfTotalShares, setDcfTotalShares] = useState(2861782000);

  // Lucros líquidos projetados (editáveis), inicializados conforme a Imagem 1
  const [dcfProjectedProfits, setDcfProjectedProfits] = useState<Record<number, number>>({
    2026: 4000000000,
    2027: 4208800000,
    2028: 4428499360,
    2029: 4659667026,
    2030: 4902901645
  });

  const [dcfPerpCrescimento, setDcfPerpCrescimento] = useState(3.0);

  // Estados para o Preço Teto Projetivo baseado na imagem 2
  const [ptDesiredYield, setPtDesiredYield] = useState(7.0);
  const [ptPayout, setPtPayout] = useState(60.0);
  const [ptProjectiveProfit, setPtProjectiveProfit] = useState(4190120000);
  const [ptProjectionFactor, setPtProjectionFactor] = useState(7.0);
  const [ptCurrentPrice, setPtCurrentPrice] = useState(11.51);
  const [ptNumberOfShares, setPtNumberOfShares] = useState(2860682000);

  // Short selling simulation state
  const [shortTicker, setShortTicker] = useState("PETR4");
  const [shortQuantity, setShortQuantity] = useState(1000);
  const [collateralCdb, setCollateralCdb] = useState(true);
  const [collateralStocks, setCollateralStocks] = useState(true);
  const [collateralBonds, setCollateralBonds] = useState(false);

  // Performance benchmark toggles
  const [visibleBenchmarks, setVisibleBenchmarks] = useState({
    IBOV: true,
    CDI: true,
    IPCA: false
  });

  // Report Analyzer Uploaded/Draft Content
  const [reportText, setReportText] = useState(
    "VALE S.A. - Relatório da Administração 2025\n\n1. DESEMPENHO OPERACIONAL E FINANCEIRO\nA Vale reportou EBITDA ajustado proforma de US$ 15,3 bilhões em 2025, impulsionado pelo recorde anual de produção em S11D e recuperação dos preços internacionais de pelotas e finos com prêmio de alta qualidade de US$ 8,5/ton.\nO custo de produção de minério de ferro caixa FOB C1 de Carajás manteve-se resiliente a US$ 23,4/t. Os novos acordos com acionistas internacionais garantem uma distribuição consistente de dividendos payout na ordem de 96.5%.\n\n2. SEGURANÇA E AMBIENTAL (ESG)\nA companhia destinou R$ 2.5 bilhões adicionais a provisionamentos pós-reparação estrutural preventivas de barragens de rejeitos na região de Mariana e Brumadinho, mitigando novos perigos jurídicos.\nAs margens de lucro mantiveram o ROE de 15.52% sob endividamento saudável equilibrado."
  );
  const [attachedPdf, setAttachedPdf] = useState<{ name: string; size: number; mimeType: string; data: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // AI News sentiment
  const [newsList, setNewsList] = useState(initialNews);
  const [newsSummaryLoading, setNewsSummaryLoading] = useState(false);
  const [newsSummaryText, setNewsSummaryText] = useState(
    "Resumo de Sentimento do Mercado: O mercado de ações brasileiro demonstra consolidação das commodities lideradas pela Vale (VALE3) com suporte de alta internacional. O setor de bancos de grande capitalização reage de forma mista a novas diretrizes do Copom, compensado pela performance de crédito rural positiva do Banco do Brasil (BBAS3)."
  );

  // Chat/Advisor Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Olá! Sou o assistente B3-Quant Advisor. Posso lhe auxiliar em estratégias quantitativas, cálculos de Valuation ou otimização de portfólios." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Manual transaction input state
  const [manualEntry, setManualEntry] = useState({ ticker: "VALE3", type: "BUY", price: "", qty: "" });

  // Floating Mockup Overlay View for User Reference
  const [showFigmaOverlay, setShowFigmaOverlay] = useState(false);
  const [selectedOverlayImage, setSelectedOverlayImage] = useState<string>("");

  // Handler functions
  const handleAddManualPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.price || !manualEntry.qty) return;
    const price = parseFloat(manualEntry.price);
    const qty = parseInt(manualEntry.qty);
    const existing = positions.find(p => p.ticker === manualEntry.ticker.toUpperCase());
    
    if (existing) {
      const newQty = existing.quantity + (manualEntry.type === "BUY" ? qty : -qty);
      if (newQty <= 0) {
        setPositions(positions.filter(p => p.ticker !== manualEntry.ticker));
      } else {
        const totalCost = (existing.averagePrice * existing.quantity) + (price * qty * (manualEntry.type === "BUY" ? 1 : -1));
        const newAvg = totalCost / newQty;
        setPositions(positions.map(p => {
          if (p.ticker === existing.ticker) {
            return {
              ...p,
              quantity: newQty,
              averagePrice: isNaN(newAvg) ? price : parseFloat(newAvg.toFixed(2)),
              totalValue: newQty * p.currentPrice,
              plPercentage: parseFloat((((p.currentPrice - (isNaN(newAvg) ? price : newAvg)) / (isNaN(newAvg) ? price : newAvg)) * 100).toFixed(2))
            };
          }
          return p;
        }));
      }
    } else if (manualEntry.type === "BUY") {
      const value = price * qty;
      const newPos = {
        ticker: manualEntry.ticker.toUpperCase(),
        averagePrice: price,
        currentPrice: price * 1.05, // simulate slight initial profit
        quantity: qty,
        totalValue: value * 1.05,
        plPercentage: 5.0
      };
      setPositions([...positions, newPos]);
    }
    setManualEntry({ ticker: "VALE3", type: "BUY", price: "", qty: "" });
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.value) return;
    const alertItem = {
      id: Date.now().toString(),
      ticker: newAlert.ticker.toUpperCase(),
      metric: newAlert.metric as any,
      condition: newAlert.condition as any,
      value: parseFloat(newAlert.value),
      active: true,
      telegramBot: true,
      email: false,
    };
    setAlerts([alertItem, ...alerts]);
    setNewAlert({ ticker: "ITUB4", metric: "Price", condition: "Greater than", value: "" });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleCallAIAnalyze = async () => {
    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reportText, 
          ticker: valuationParams.ticker,
          pdfFile: attachedPdf 
        })
      });
      const data = await response.json();
      if (data.error) {
        alert("Erro na análise da IA: " + data.error);
      } else {
        setAiAnalysisResult(data);
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao comunicar com o servidor de IA.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handlePdfUpload = (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Por favor, selecione apenas arquivos em formato PDF.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande! Por favor, acrescente um PDF de no máximo 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setAttachedPdf({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.onerror = (error) => {
      console.error("Erro ao ler o PDF:", error);
      alert("Falha ao abrir ou ler o PDF.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  };

  const handleResetStockFilters = () => {
    setVBazin(6.00);
    setVGraham(22.50);
    setVPeterLynch(3.00);
    setStockPlMin(3.00);
    setStockPlMax(15.00);
    setStockDlEbitdaMin("");
    setStockDlEbitdaMax(5.00);
    setStockDyMin(6.00);
    setStockMostrar("Todos");
    setStockSearch("");
    setStockNetMargin(10.00);
    setStockRoe(10.00);
    setStockLiquidity(1000000);
    setSelectedSector("Todos");
    setStockRankMethod("Rank GD");
  };

  const handleResetFiiFilters = () => {
    setFiiDyMin(7.00);
    setFiiLiquidityMin(500000);
    setFiiVacancyMax(30.00);
    setFiiVpvMin(0.70);
    setFiiVpvMax(1.05);
    setFiiSegment("");
    setFiiMostrar("Método 2em1");
    setFiiSearch("");
  };

  const handleCallNewsSummary = async () => {
    setNewsSummaryLoading(true);
    try {
      const response = await fetch("/api/ai/news-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsList })
      });
      const data = await response.json();
      if (data.summary) {
        setNewsSummaryText(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsSummaryLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const historyToSend = chatMessages;
      const response = await fetch("/api/ai/chat-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: historyToSend })
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: "bot", text: "Não foi possível conectar ao servidor AI no momento. Usando simulação: Recomenda-se diversificar com pelo menos 20% em fundos de tijolos imobiliários para suavizar a volatilidade cíclica da carteira." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUpdateThesis = () => {
    setTheses(theses.map(t => t.ticker === selectedThesis.ticker ? { ...t, thesisContent: thesisText } : t));
    alert(`Tese salvada com sucesso para ${selectedThesis.ticker}!`);
  };

  // Sector calculations for asset breakdown donut
  const totalNetWorth = positions.reduce((sum, p) => sum + p.totalValue, 0);

  // Format currencies helper
  const rFormat = (num: number) => num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden flex flex-col justify-between">
      
      {/* 1. Figured Top Header Frame - Pure Artistic Flair */}
      <header className="border-b border-white/10 bg-[#070707] px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-sm flex items-center justify-center shadow-lg shadow-orange-600/30">
            <TrendingUp className="w-5 h-5 text-black stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-[#ef4444] font-bold">LIVE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase font-mono text-white flex items-center gap-1.5">
              B3-Quant-Free <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-orange-500 border border-white/10 font-sans tracking-normal">V2.40</span>
            </h1>
          </div>
        </div>

        {/* Dynamic Category Nav Selector with Artistic flair design */}
        <nav className="flex flex-wrap gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "valuation", label: "Valuation", icon: Calculator },
            { id: "analysis", label: "Rastreadores", icon: Sliders },
            { id: "screener", label: "Alocação", icon: PieIcon },
            { id: "ai", label: "Cúpula AI", icon: Sparkles },
            { id: "actions", label: "Notas & Alertas", icon: Bell }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSel = activeSegment === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveSegment(cat.id as any);
                  if (cat.id === "overview") setActiveTab("dashboard");
                  if (cat.id === "valuation") setActiveTab("models");
                  if (cat.id === "analysis") setActiveTab("screener_stocks");
                  if (cat.id === "screener") setActiveTab("efficient_frontier");
                  if (cat.id === "ai") setActiveTab("report_analyzer");
                  if (cat.id === "actions") setActiveTab("alerts_config");
                }}
                className={`py-1.5 px-3 rounded-md text-xs font-mono font-medium tracking-tight uppercase flex items-center gap-1.5 transition-all outline-none ${
                  isSel
                    ? "bg-orange-600 text-black shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFigmaOverlay(!showFigmaOverlay)}
            className="px-3 py-1.5 border border-orange-500/30 hover:border-orange-500/60 text-orange-500 rounded bg-orange-600/5 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Figma Reference screens</span>
          </button>
          
          <div className="hidden lg:flex flex-col items-end font-mono text-[10px] opacity-50">
            <span>UTC Local: 2026-06-19</span>
            <span>Estátus: Operacional Nom</span>
          </div>
        </div>
      </header>

      {/* 2. Secondary Tab Bar inside the Active Segment */}
      <section className="bg-[#0b0b0b] border-b border-white/5 py-2.5 px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {activeSegment === "overview" && (
            <>
              {[
                { id: "dashboard", label: "1. Dashboard de Patrimônio" },
                { id: "performance", label: "2. Comparativo de Performance" },
                { id: "dividends", label: "3. Retorno de Dividendos & YoC" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {activeSegment === "valuation" && (
            <>
              {[
                { id: "models", label: "4. Fórmulas de Precificação" },
                { id: "dcf_valuation", label: "5. Fluxo de Caixa Descontado" },
                { id: "preco_teto_projetivo", label: "6. Preço Teto Projetivo" },
                { id: "margin", label: "7. Aluguel & Alavancagem Short" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {activeSegment === "analysis" && (
            <>
              {[
                { id: "screener_stocks", label: "12. Rastreador de Ações" },
                { id: "screener_fiis", label: "13. FIIs Map & Analytics" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {activeSegment === "screener" && (
            <>
              {[
                { id: "efficient_frontier", label: "6. Markowitz Otimização" },
                { id: "correlations", label: "7. Matrizes de Correlação & Treemap" },
                { id: "rebalancing", label: "8. Rebalanceamento de Ativos" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {activeSegment === "ai" && (
            <>
              {[
                { id: "report_analyzer", label: "9. Analisador CVM IA" },
                { id: "news_sentiment", label: "10. Notícias & Sentimento" },
                { id: "governance", label: "11. Governança e Arquivos CVM" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {activeSegment === "actions" && (
            <>
              {[
                { id: "alerts_config", label: "14. Gerenciador de Alertas" },
                { id: "notes_theses", label: "15. Teses de Investimento" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-mono px-3 py-1 border transition-all ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span>Active core: {activeTab.toUpperCase()}_PIPELINE</span>
        </div>
      </section>

      {/* 3. Main Workspace Grid Framework */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto self-center">

        {/* ----------------- TAB 1: DASHBOARD FINANCEIRO ----------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold mb-1">TOTAL_NET_WORTH</p>
                <h3 className="text-3xl font-mono font-bold">{rFormat(totalNetWorth)}</h3>
                <span className="text-xs text-[#10b981] font-semibold mt-1 block">↑ +4.5% (Últimos 30 Dias)</span>
              </div>
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a855f7] font-bold mb-1">PORTFOLIO_PROFIT_LOSS</p>
                <h3 className="text-3xl font-mono font-bold text-[#10b981]">+22.1%</h3>
                <span className="text-xs text-slate-400 font-medium mt-1 block">R$ 152,430.00 Acumulado</span>
              </div>
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-1">MONTHLY_PASSIVE_INCOME</p>
                <h3 className="text-3xl font-mono font-bold text-emerald-400">R$ 4,100.25</h3>
                <span className="text-xs text-slate-400 font-medium mt-1 block">Dividendos recebidos</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Asset Allocation Donut */}
              <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded">
                <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Composição da Carteira</h4>
                <CustomPieChart
                  totalValueText={rFormat(totalNetWorth)}
                  data={[
                    { name: "Ações", value: totalNetWorth * 0.55, color: "#ea580c" },
                    { name: "FIIs", value: totalNetWorth * 0.25, color: "#a855f7" },
                    { name: "Renda Fixa", value: totalNetWorth * 0.15, color: "#10b981" },
                    { name: "Caixa", value: totalNetWorth * 0.05, color: "#3b82f6" }
                  ]}
                />
              </div>

              {/* Active Portfolio Positions */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold">Posições de Ativos</h4>
                  <form onSubmit={handleAddManualPosition} className="flex flex-wrap items-center gap-2">
                    <select
                      value={manualEntry.ticker}
                      onChange={(e) => setManualEntry({ ...manualEntry, ticker: e.target.value })}
                      className="bg-black border border-white/10 rounded p-1 text-xs text-white uppercase outline-none"
                    >
                      {["VALE3", "PETR4", "ITUB4", "BBAS3", "BBDC4", "WEGE3", "HGLG11", "KNIP11"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={manualEntry.type}
                      onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                      className="bg-black border border-white/10 rounded p-1 text-xs text-white outline-none"
                    >
                      <option value="BUY">COMPRA (+)</option>
                      <option value="SELL">VENDA (-)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Preço R$"
                      value={manualEntry.price}
                      onChange={(e) => setManualEntry({ ...manualEntry, price: e.target.value })}
                      className="bg-black border border-white/10 rounded px-1.5 py-1 text-xs text-white w-20 font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={manualEntry.qty}
                      onChange={(e) => setManualEntry({ ...manualEntry, qty: e.target.value })}
                      className="bg-black border border-white/10 rounded px-1.5 py-1 text-xs text-white w-14 font-mono"
                    />
                    <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-black font-semibold text-xs rounded px-2.5 py-1 transition-all">
                      Adicionar
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500">
                        <th className="pb-2">Ativo</th>
                        <th className="pb-2 text-right">Preço Médio</th>
                        <th className="pb-2 text-right">Preço Atual</th>
                        <th className="pb-2 text-right">Quantidade</th>
                        <th className="pb-2 text-right">Valor Total</th>
                        <th className="pb-2 text-right">P/L (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {positions.map((p, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-all">
                          <td className="py-2.5 font-bold text-white">{p.ticker}</td>
                          <td className="py-2.5 text-right">{rFormat(p.averagePrice)}</td>
                          <td className="py-2.5 text-right">{rFormat(p.currentPrice)}</td>
                          <td className="py-2.5 text-right">{p.quantity}</td>
                          <td className="py-2.5 text-right font-bold text-orange-500">{rFormat(p.totalValue)}</td>
                          <td className={`py-2.5 text-right font-bold ${p.plPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {p.plPercentage >= 0 ? "+" : ""}{p.plPercentage.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Historical Growth Bar Chart */}
            <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded">
              <CustomBarChart data={netWorthHistory} />
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: BENCHMARK PERFORMANCE ----------------- */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold">BENCHMARK_ANALYSIS</p>
                  <h4 className="text-white text-base font-semibold">Carteira vs Principais Índices do Mercado</h4>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <label className="flex items-center gap-1.5 text-cyan-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleBenchmarks.IBOV}
                      onChange={(e) => setVisibleBenchmarks({ ...visibleBenchmarks, IBOV: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>IBOVESPA</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-purple-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleBenchmarks.CDI}
                      onChange={(e) => setVisibleBenchmarks({ ...visibleBenchmarks, CDI: e.target.checked })}
                      className="accent-purple-500"
                    />
                    <span>CDI</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-rose-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleBenchmarks.IPCA}
                      onChange={(e) => setVisibleBenchmarks({ ...visibleBenchmarks, IPCA: e.target.checked })}
                      className="accent-rose-500"
                    />
                    <span>IPCA</span>
                  </label>
                </div>
              </div>

              <CumulativeLineGraph
                visibleBenchmarks={visibleBenchmarks}
                data={[
                  { name: "Jan 22", userPortfolio: 0, ibov: 0, cdi: 0, ipca: 0 },
                  { name: "Mar 22", userPortfolio: 8.5, ibov: 3.2, cdi: 2.1, ipca: 1.5 },
                  { name: "Mai 22", userPortfolio: 4.2, ibov: -2.1, cdi: 4.0, ipca: 2.3 },
                  { name: "Jul 22", userPortfolio: 12.5, ibov: 1.5, cdi: 6.2, ipca: 3.8 },
                  { name: "Set 22", userPortfolio: 16.0, ibov: -4.2, cdi: 8.5, ipca: 4.9 },
                  { name: "Nov 22", userPortfolio: 18.2, ibov: 2.8, cdi: 10.1, ipca: 5.5 },
                  { name: "Jan 23", userPortfolio: 22.4, ibov: 6.5, cdi: 11.8, ipca: 6.1 },
                  { name: "Mar 23", userPortfolio: 25.1, ibov: -1.2, cdi: 13.9, ipca: 6.9 },
                  { name: "Mai 23", userPortfolio: 32.8, ibov: 8.4, cdi: 15.2, ipca: 7.2 },
                  { name: "Jul 23", userPortfolio: 38.2, ibov: 11.2, cdi: 16.5, ipca: 8.1 },
                  { name: "Set 23", userPortfolio: 42.1, ibov: 14.1, cdi: 17.2, ipca: 8.9 },
                  { name: "Dez 23", userPortfolio: 45.2, ibov: 12.5, cdi: 18.1, ipca: 9.3 }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Performance Desde Início</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-emerald-400 font-bold">Sua Carteira</span>
                    <span className="font-bold">+45.2%</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1 opacity-80">
                    <span className="text-cyan-400">IBOVESPA</span>
                    <span>+12.5%</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-80">
                    <span className="text-purple-400">CDI Bruto</span>
                    <span>+18.1%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Ano Corrente (YTD)</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-emerald-400 font-bold">Sua Carteira</span>
                    <span className="font-bold">+18.4%</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1 opacity-80">
                    <span className="text-cyan-400">IBOVESPA</span>
                    <span>+6.2%</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-80">
                    <span className="text-purple-400">CDI Bruto</span>
                    <span>+10.4%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Metas e Ajuste Alfa</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span>Alpha de Treynor</span>
                    <span className="text-emerald-400 font-bold">+5.8%</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span>Beta vs IBOV</span>
                    <span>0.82</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Sore de Sharpe</span>
                    <span className="text-emerald-400">1.45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: RETORNO DE DIVIDENDOS & YIELD ON COST ----------------- */}
        {activeTab === "dividends" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <p className="text-[10px] uppercase tracking-widest text-[#a855f7] mb-1">TOTAL_DIVIDENDS_LTM</p>
                <h3 className="text-2xl font-bold">R$ 24,567.89</h3>
                <span className="text-[10px] text-emerald-400">+12.5% YoY Growth</span>
              </div>
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">AVERAGE_PORTFOLIO_YIELD</p>
                <h3 className="text-2xl font-bold">8.75%</h3>
                <span className="text-[10px] text-slate-500">Média ponderada do portfólio</span>
              </div>
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <p className="text-[10px] uppercase tracking-widest text-orange-500 mb-1">OVERALL_YIELD_ON_COST</p>
                <h3 className="text-2xl font-bold">11.40%</h3>
                <span className="text-[10px] text-emerald-400">+2.1% vs Yield Corrente</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-[#0b0b0b] border border-white/10 p-5 rounded">
                <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4">Yield Corrente vs Yield on Cost por Ativo</h4>
                
                {/* Horizontal custom bar list chart */}
                <div className="space-y-4">
                  {[
                    { ticker: "PETR4", cy: 12.4, yoc: 14.8 },
                    { ticker: "VALE3", cy: 9.8, yoc: 11.2 },
                    { ticker: "BBAS3", cy: 7.5, yoc: 9.2 },
                    { ticker: "ITUB4", cy: 5.1, yoc: 6.4 },
                    { ticker: "BBDC4", cy: 6.3, yoc: 7.0 }
                  ].map((ticker, index) => (
                    <div key={index} className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">{ticker.ticker}</span>
                        <div className="flex gap-4">
                          <span className="text-amber-500">Yield Corrente: {ticker.cy}%</span>
                          <span className="text-emerald-400">Yield on Cost: {ticker.yoc}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-sm overflow-hidden flex">
                        <div style={{ width: `${(ticker.cy / 20) * 100}%` }} className="bg-amber-500 h-full" />
                        <div style={{ width: `${((ticker.yoc - ticker.cy) / 20) * 100}%` }} className="bg-emerald-400 h-full border-l border-black/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Year Dividend Dividend Growth Simulator */}
              <div className="lg:col-span-5 bg-[#0b0b0b] border border-white/10 p-5 rounded flex flex-col justify-between">
                <div>
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-3">Histórico de Crescimento (5 Anos)</h4>
                  <p className="text-xs text-slate-400 mb-4 font-sans">Visualização simulada de distribuição de proventos de R$ por ação sob taxas capitalizadas compostas.</p>
                  
                  <div className="h-28 flex items-end justify-between gap-3 font-mono text-center">
                    {[
                      { year: "2021", dividend: 1.80 },
                      { year: "2022", dividend: 2.05 },
                      { year: "2023", dividend: 2.40 },
                      { year: "2024", dividend: 2.85 },
                      { year: "2025", dividend: 3.20 }
                    ].map((y, idx) => {
                      const heightPct = (y.dividend / 4) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] text-orange-500 mb-1">R$ {y.dividend}</span>
                          <div style={{ height: `${heightPct}px` }} className="w-full bg-orange-600/60 hover:bg-orange-600 rounded-t-sm" />
                          <span className="text-[10px] text-slate-500 mt-1">{y.year}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded mt-4 text-[11px] font-mono flex items-center justify-between text-emerald-400">
                  <span>🚀 TAXA DE CRESCIMENTO COMPOSTA (LTM):</span>
                  <span className="font-bold">+77.8% (5 anos)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: MODELOS DE VALUATION ----------------- */}
        {activeTab === "models" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Graham Valuation model formula */}
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                <p className="text-[10px] uppercase tracking-widest text-orange-500 mb-1">VALUATION_GRAHAM</p>
                <h4 className="text-white font-semibold text-sm mb-4">Ajuste de Margem de Graham</h4>
                
                <div className="space-y-3.5 text-xs mb-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Lucro Por Ação (LPA)</label>
                    <input
                      type="number"
                      value={valuationParams.lpa}
                      onChange={(e) => setValuationParams({ ...valuationParams, lpa: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Valor Patrimonial por Ação (VPA)</label>
                    <input
                      type="number"
                      value={valuationParams.vpa}
                      onChange={(e) => setValuationParams({ ...valuationParams, vpa: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-orange-600">
                  <div className="flex justify-between items-center text-xs">
                    <span>Preço Justo Graham</span>
                    <span className="text-lg font-bold text-white">
                      {valuationParams.lpa * valuationParams.vpa > 0
                        ? rFormat(Math.sqrt(22.5 * valuationParams.lpa * valuationParams.vpa))
                        : "R$ 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Margem de Segurança (vs Preço Atual R$ 72.30):</span>
                    <span className="text-rose-400 font-bold">-26.91%</span>
                  </div>
                </div>
              </div>

              {/* Bazin Valuation model formula */}
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                <p className="text-[10px] uppercase tracking-widest text-[#a855f7] mb-1">VALUATION_BAZIN</p>
                <h4 className="text-white font-semibold text-sm mb-4">Dividendo Inteligente de Bazin</h4>
                
                <div className="space-y-3.5 text-xs mb-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Dividendo Médio do Ativo (DPA)</label>
                    <input
                      type="number"
                      value={valuationParams.dpa}
                      onChange={(e) => setValuationParams({ ...valuationParams, dpa: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Dividend Yield Desejado (%)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={valuationParams.requiredYield}
                        onChange={(e) => setValuationParams({ ...valuationParams, requiredYield: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white flex-1"
                      />
                      <span className="bg-white/5 border border-white/10 px-2 flex items-center rounded text-slate-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-[#a855f7]">
                  <div className="flex justify-between items-center text-xs">
                    <span>Preço Teto Decisivo</span>
                    <span className="text-lg font-bold text-white">
                      {valuationParams.requiredYield > 0
                        ? rFormat((valuationParams.dpa * 100) / valuationParams.requiredYield)
                        : "R$ 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Margem de Segurança (vs R$ 72.30):</span>
                    <span className="text-emerald-400 font-bold">+46.37%</span>
                  </div>
                </div>
              </div>

              {/* Gordon Growth model formula */}
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                <p className="text-[10px] uppercase tracking-widest text-[#10b981] mb-1">VALUATION_GORDON</p>
                <h4 className="text-white font-semibold text-sm mb-4">Modelo Gordon de Crescimento</h4>
                
                <div className="space-y-3.5 text-xs mb-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Dividendo Atual Distribuído (D_0)</label>
                    <input
                      type="number"
                      value={valuationParams.currentDividend}
                      onChange={(e) => setValuationParams({ ...valuationParams, currentDividend: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Crescimento Perpétuo (g)</label>
                      <input
                        type="number"
                        value={valuationParams.gordonGrowth}
                        onChange={(e) => setValuationParams({ ...valuationParams, gordonGrowth: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Taxa de Desconto (k)</label>
                      <input
                        type="number"
                        value={valuationParams.gordonDiscount}
                        onChange={(e) => setValuationParams({ ...valuationParams, gordonDiscount: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-[#10b981]">
                  <div className="flex justify-between items-center text-xs">
                    <span>Preço Justo de Gordon</span>
                    <span className="text-lg font-bold text-white">
                      {(valuationParams.gordonDiscount - valuationParams.gordonGrowth) > 0
                        ? rFormat((valuationParams.currentDividend * (1 + valuationParams.gordonGrowth / 100)) / ((valuationParams.gordonDiscount - valuationParams.gordonGrowth) / 100))
                        : "R$ 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Margem de Segurança (vs R$ 72.30):</span>
                    <span className="text-rose-400 font-bold">-24.58%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: dcf_valuation (FLUXO DE CAIXA DESCONTADO APRIMORADO) ----------------- */}
        {activeTab === "dcf_valuation" && (
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-bold font-mono">VALUATION_DISCOUNTED_CASH_FLOW_PRO</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Premissas & Realidade Projetada */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Panel 1: Premissas */}
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Premissas</h4>
                  
                  <div className="space-y-4">
                    {/* Payout Médio */}
                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-xs text-slate-400">Payout médio</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dcfPayout}
                          onChange={(e) => setDcfPayout(parseFloat(e.target.value) || 0)}
                          className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                        />
                        <span className="text-[11px] text-slate-500">%</span>
                      </div>
                    </div>

                    {/* ROE */}
                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-xs text-slate-400">ROE</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dcfRoe}
                          onChange={(e) => setDcfRoe(parseFloat(e.target.value) || 0)}
                          className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                        />
                        <span className="text-[11px] text-slate-500">%</span>
                      </div>
                    </div>

                    {/* Taxa Esperada de Crescimento */}
                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-xs text-slate-400">Taxa Esperada de Crescimento</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dcfGrowthRate}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            setDcfGrowthRate(newRate);
                            setDcfProjectedProfits(prev => {
                              const updated = { ...prev };
                              updated[2027] = Math.round(updated[2026] * (1 + newRate / 100));
                              updated[2028] = Math.round(updated[2027] * (1 + newRate / 100));
                              updated[2029] = Math.round(updated[2028] * (1 + newRate / 100));
                              updated[2030] = Math.round(updated[2029] * (1 + newRate / 100));
                              return updated;
                            });
                          }}
                          className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                        />
                        <span className="text-[11px] text-slate-500">%</span>
                      </div>
                    </div>

                    {/* Taxa de Desconto */}
                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">Taxa de desconto</span>
                        <div className="group relative">
                          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                          <div className="absolute left-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[10px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10">
                            Custo de Capital Mínimo Esperado. Média histórica da Selic é de 11,53% (9,80% ex IR15%).
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dcfDiscountRate}
                          onChange={(e) => setDcfDiscountRate(parseFloat(e.target.value) || 0)}
                          className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                        />
                        <span className="text-[11px] text-slate-500">%</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[10px] text-slate-500 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
                    ℹ️ Média histórica da Selic é 11,53% (9,80% ex IR15%) para taxa de desconto semestral livre de risco.
                  </p>
                </div>

                {/* Panel 2: Realidade Projetada */}
                {(() => {
                  const vps: Record<number, number> = {};
                  let sumVP = 0;

                  const projYears = [2026, 2027, 2028];
                  if (dcfProjectionYears === 5) {
                    projYears.push(2029, 2030);
                  }

                  projYears.forEach((y, idx) => {
                    const profit = dcfProjectedProfits[y] || 0;
                    const discountFactor = Math.pow(1 + dcfDiscountRate / 100, idx + 1);
                    const vp = profit / discountFactor;
                    vps[y] = vp;
                    sumVP += vp;
                  });

                  const lastYear = projYears[projYears.length - 1];
                  const lastProfit = dcfProjectedProfits[lastYear] || 0;
                  const denominator = (dcfDiscountRate - dcfPerpCrescimento) / 100;
                  const perpProfitVal = denominator > 0 ? (lastProfit * (1 + dcfPerpCrescimento / 100)) / denominator : 0;
                  const perpVPL = perpProfitVal / Math.pow(1 + dcfDiscountRate / 100, dcfProjectionYears);

                  const totalValuationVal = sumVP + perpVPL;
                  const precoPorAcaoVal = totalValuationVal / dcfSharesExTreasury;

                  const currentAssetPrice = 11.27; // Custom para alinhar ao upside de 22,38% da Imagem 1
                  const upsidePercent = ((precoPorAcaoVal - currentAssetPrice) / currentAssetPrice) * 100;

                  return (
                    <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                      <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Realidade Projetada</h4>
                      
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Market cap justo</span>
                          <span className="text-white font-bold">{rFormat(totalValuationVal)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Nº total de ações</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={dcfTotalShares}
                              onChange={(e) => setDcfTotalShares(parseInt(e.target.value) || 0)}
                              className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs text-white text-right w-32 focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Nº ações ex-tesouraria</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={dcfSharesExTreasury}
                              onChange={(e) => setDcfSharesExTreasury(parseInt(e.target.value) || 0)}
                              className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs text-white text-right w-32 focus:border-orange-500 outline-none"
                            />
                          </div>
                        </div>

                        <hr className="border-white/5 my-2" />

                        <div className="flex justify-between items-center p-2 rounded bg-blue-900/20 border border-blue-500/20">
                          <span className="text-xs text-blue-400 font-bold">Preço por ação</span>
                          <span className="text-sm font-black text-blue-400">{rFormat(precoPorAcaoVal)}</span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-black/40">
                          <span className="text-xs text-slate-400">Cotação p/ Comparação</span>
                          <span className="text-xs font-bold text-white">R$ {currentAssetPrice.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
                          <span className="text-xs text-emerald-400 font-bold">Upside / Downside</span>
                          <span className={`text-xs font-black ${upsidePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {upsidePercent >= 0 ? "+" : ""}{upsidePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            const savedData = { dcfPayout, dcfRoe, dcfGrowthRate, dcfDiscountRate, dcfProjectionYears, totalValuationVal, precoPorAcaoVal };
                            localStorage.setItem("b3_saved_dcf_pro", JSON.stringify(savedData));
                            alert(`Fluxo de Caixa Descontado Salvo! Preço Justo Calculado: ${rFormat(precoPorAcaoVal)}`);
                          }}
                          className="flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-black text-[10px] uppercase font-bold py-2 px-3 rounded transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Salvar Preço Teto
                        </button>
                        <button
                          onClick={() => {
                            setDcfPayout(68.84);
                            setDcfRoe(16.75);
                            setDcfGrowthRate(5.22);
                            setDcfDiscountRate(14.50);
                            setDcfProjectionYears(3);
                            setDcfTotalShares(2861782000);
                            setDcfSharesExTreasury(2860682000);
                            setDcfProjectedProfits({
                              2026: 4000000000,
                              2027: 4208800000,
                              2028: 4428499360,
                              2029: 4659667026,
                              2030: 4902901645
                            });
                            setDcfPerpCrescimento(3.0);
                          }}
                          className="border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] uppercase font-bold py-2 px-3 rounded transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Fluxo de Caixa Descontado Table */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-3">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold">Fluxo de Caixa Descontado</h4>
                  
                  {/* Selector years */}
                  <div className="flex bg-white/5 border border-white/10 rounded p-0.5">
                    <button
                      onClick={() => setDcfProjectionYears(3)}
                      className={`text-[10px] px-3 py-1 rounded transition-all font-bold ${dcfProjectionYears === 3 ? "bg-orange-600 text-black shadow" : "text-slate-400 hover:text-white"}`}
                    >
                      3 anos
                    </button>
                    <button
                      onClick={() => setDcfProjectionYears(5)}
                      className={`text-[10px] px-3 py-1 rounded transition-all font-bold ${dcfProjectionYears === 5 ? "bg-orange-600 text-black shadow" : "text-slate-400 hover:text-white"}`}
                    >
                      5 anos
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="pb-2 text-center w-14">Ano</th>
                        <th className="pb-2 text-right">Lucro Líquido</th>
                        <th className="pb-2 text-right">Crescimento</th>
                        <th className="pb-2 text-right">VPL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      
                      {/* Históricos */}
                      {Object.entries({
                        2021: 3752869000,
                        2022: 4094367000,
                        2023: 5766835000,
                        2024: 7119287000,
                        2025: 4899617000
                      }).map(([yr, val]) => {
                        let pctStr = "-";
                        if (yr === "2021") pctStr = "30,98%";
                        if (yr === "2022") pctStr = "9,10%";
                        if (yr === "2023") pctStr = "40,85%";
                        if (yr === "2024") pctStr = "23,45%";
                        if (yr === "2025") pctStr = "-31,18%";

                        return (
                          <tr key={yr} className="hover:bg-white/5 text-slate-500">
                            <td className="py-3 font-bold text-center text-slate-500">{yr}</td>
                            <td className="py-3 text-right">{rFormat(val)}</td>
                            <td className={`py-3 text-right ${pctStr.startsWith("-") ? "text-rose-600/70" : "text-emerald-600/70"}`}>{pctStr}</td>
                            <td className="py-3 text-right font-bold text-slate-600">-</td>
                          </tr>
                        );
                      })}

                      {/* Line break spacer */}
                      <tr className="bg-white/5 h-0.5 border-none"><td colSpan={4}></td></tr>

                      {/* Projetados */}
                      {(() => {
                        const years = [2026, 2027, 2028];
                        if (dcfProjectionYears === 5) {
                          years.push(2029, 2030);
                        }

                        return (
                          <>
                            {years.map((y, idx) => {
                              const value = dcfProjectedProfits[y] || 0;
                              
                              let growthPct = dcfGrowthRate;
                              if (y === 2026) {
                                growthPct = ((value - 4899617000) / 4899617000) * 100;
                              } else {
                                const prevValue = dcfProjectedProfits[y - 1] || 1;
                                growthPct = ((value - prevValue) / prevValue) * 100;
                              }

                              const discountFactor = Math.pow(1 + dcfDiscountRate / 100, idx + 1);
                              const vp = value / discountFactor;

                              return (
                                <tr key={y} className="hover:bg-orange-500/5 transition-colors">
                                  <td className="py-2 text-center font-bold text-orange-500">{y}</td>
                                  <td className="py-2 text-right">
                                    <div className="inline-flex items-center gap-1.5 w-full justify-end">
                                      <span className="text-[10px] text-slate-600">R$</span>
                                      <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                          const numVal = parseInt(e.target.value) || 0;
                                          setDcfProjectedProfits(prev => ({
                                            ...prev,
                                            [y]: numVal
                                          }));
                                        }}
                                        className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-44 focus:border-orange-500 outline-none font-bold"
                                      />
                                    </div>
                                  </td>
                                  <td className={`py-2 text-right font-medium ${growthPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}%
                                  </td>
                                  <td className="py-2 text-right font-bold text-blue-400">{rFormat(vp)}</td>
                                </tr>
                              );
                            })}

                            {/* Perpetuo */}
                            {(() => {
                              const lastYear = years[years.length - 1];
                              const lastProfit = dcfProjectedProfits[lastYear] || 0;
                              const denominator = (dcfDiscountRate - dcfPerpCrescimento) / 100;
                              const perpProfitVal = denominator > 0 ? (lastProfit * (1 + dcfPerpCrescimento / 100)) / denominator : 0;
                              const perpVPL = perpProfitVal / Math.pow(1 + dcfDiscountRate / 100, dcfProjectionYears);

                              return (
                                <tr className="hover:bg-indigo-550/5 transition-colors bg-indigo-950/15">
                                  <td className="py-3 text-center font-bold text-indigo-400">Perpétuo</td>
                                  <td className="py-3 text-right text-indigo-300 font-bold">{rFormat(perpProfitVal)}</td>
                                  <td className="py-2 text-right">
                                    <div className="flex items-center justify-end gap-1.5 font-bold">
                                      <button
                                        onClick={() => setDcfPerpCrescimento(prev => Math.max(0, parseFloat((prev - 0.1).toFixed(2))))}
                                        className="w-5 h-5 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-xs"
                                      >
                                        -
                                      </button>
                                      <span className="text-white text-[11px] px-1 w-10 text-center">{dcfPerpCrescimento.toFixed(1)}%</span>
                                      <button
                                        onClick={() => setDcfPerpCrescimento(prev => parseFloat((prev + 0.1).toFixed(2)))}
                                        className="w-5 h-5 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-xs"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right font-black text-emerald-400">{rFormat(perpVPL)}</td>
                                </tr>
                              );
                            })()}
                          </>
                        );
                      })()}

                    </tbody>
                  </table>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs">
                  <span>
                    💡 Nota: Os lucros projetados dos anos de estimativa podem ser modificados digitando novos valores.
                  </span>
                  <span className="font-semibold text-orange-500">B3-Quant FCDE Model</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: preco_teto_projetivo (PREÇO TETO PROJETIVO) ----------------- */}
        {activeTab === "preco_teto_projetivo" && (
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-bold font-mono">VALUATION_PROJECTIVE_PRICE_CEILING</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Sidebar Preço Teto */}
              <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold">Preço Teto</h4>
                  <button 
                    onClick={() => alert("Influenciadores de Investimento de Curto e Longo Prazo ativos nas projeções.")}
                    className="text-[10px] bg-white/5 px-2.5 py-1 rounded text-orange-500 border border-white/10 hover:bg-orange-500/10 flex items-center gap-1 hover:text-white transition-all font-bold"
                  >
                    <span>ℹ️ Influenciadores</span>
                  </button>
                </div>

                <div className="bg-orange-600/5 border border-orange-500/20 text-[10px] text-orange-500 rounded p-2.5 mb-5 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preço teto salvo • ver valores atuais</span>
                </div>

                <div className="space-y-4">
                  {/* Dividend Yield desejado */}
                  <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Dividend Yield desejado</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-black border border-white/10 rounded px-2 py-1 flex-1 max-w-[120px]">
                        <input
                          type="number"
                          step="0.1"
                          value={ptDesiredYield}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPtDesiredYield(val);
                            setPtProjectionFactor(val); // Sincroniza conforme lógica mapeada do seletor duplo na Imagem 2
                          }}
                          className="bg-transparent text-white text-sm font-bold text-center w-full focus:outline-none"
                        />
                        <span className="text-slate-500 font-bold">%</span>
                      </div>
                      <span className="text-xs text-slate-400 text-right">Yield Alvo</span>
                    </div>
                  </div>

                  {/* Payout da empresa */}
                  <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Payout da empresa</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-black border border-white/10 rounded px-2 py-1 flex-1 max-w-[120px]">
                        <input
                          type="number"
                          step="1"
                          value={ptPayout}
                          onChange={(e) => setPtPayout(parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-white text-sm font-bold text-center w-full focus:outline-none"
                        />
                        <span className="text-slate-500 font-bold">%</span>
                      </div>
                      <span className="text-xs text-slate-400 text-right">Distribuição</span>
                    </div>
                  </div>

                  {/* Lucro Projetivo */}
                  <div className="p-3 bg-[#0c0c0c] rounded border border-white/5 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Lucro Projetivo</label>
                    <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded px-2 py-1">
                      <span className="text-slate-500 text-xs font-bold">R$</span>
                      <input
                        type="number"
                        value={ptProjectiveProfit}
                        onChange={(e) => setPtProjectiveProfit(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-white text-xs font-bold w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Projeção (Growth factor) */}
                  <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Projeção</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-black border border-white/10 rounded p-1 w-[120px] justify-between">
                        <button
                          onClick={() => {
                            const val = parseFloat((ptProjectionFactor - 0.25).toFixed(2));
                            setPtProjectionFactor(val);
                            setPtDesiredYield(val); // Sincroniza com seletor esquerdo
                          }}
                          className="w-6 h-6 bg-white/5 rounded hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="text-white text-xs px-1 font-bold">{ptProjectionFactor.toFixed(2)}%</span>
                        <button
                          onClick={() => {
                            const val = parseFloat((ptProjectionFactor + 0.25).toFixed(2));
                            setPtProjectionFactor(val);
                            setPtDesiredYield(val); // Sincroniza com seletor esquerdo
                          }}
                          className="w-6 h-6 bg-white/5 rounded hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-400 text-right">Sincronizado</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      alert(`Configuração de dividendos salvos para este ativo!`);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-black text-[10px] uppercase font-bold py-2.5 rounded transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-orange-600/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setPtDesiredYield(7.0);
                      setPtPayout(60.0);
                      setPtProjectiveProfit(4190120000);
                      setPtProjectionFactor(7.0);
                      setPtCurrentPrice(11.51);
                      setPtNumberOfShares(2860682000);
                    }}
                    className="border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] uppercase font-bold py-2.5 rounded transition-all"
                  >
                    Reiniciar filtros
                  </button>
                </div>
              </div>

              {/* Right Column: 6 Valuation Cards Grid */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                {(() => {
                  // Calcular valores do Preço Teto Projetivo conforme Imagem 2
                  // DPA (PROJETIVO) = Lucro Projetivo * Payout / Número de papéis (sem tesouraria)
                  const totalProjectedDividends = ptProjectiveProfit * (ptPayout / 100);
                  const dpaProjetivoVal = totalProjectedDividends / ptNumberOfShares;
                  const precoTetoVal = dpaProjetivoVal / (ptDesiredYield / 100);
                  const yieldProjetivoVal = (dpaProjetivoVal / ptCurrentPrice) * 100;
                  const margemSegurancaVal = ((precoTetoVal - ptCurrentPrice) / ptCurrentPrice) * 100;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      
                      {/* CARD 1: COTAÇÃO ATUAL */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">Cotação Atual</span>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-600 hover:text-white cursor-pointer" />
                            <div className="absolute right-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[9px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10 font-sans leading-relaxed">
                              Cotação atual de mercado do ativo para cálculos comparativos.
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-2.5 py-1 rounded">
                            <span className="text-slate-500 font-bold text-sm">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={ptCurrentPrice}
                              onChange={(e) => setPtCurrentPrice(parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-white text-xl font-black focus:outline-none w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: NÚMERO DE PAPÉIS */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">Número de Papéis</span>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-600 hover:text-white cursor-pointer" />
                            <div className="absolute right-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[9px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10 font-sans leading-relaxed">
                              Quantidade de papéis em circulação para distribuição do dividendo de forma equilibrada.
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-2.5 py-1 rounded">
                            <input
                              type="number"
                              value={ptNumberOfShares}
                              onChange={(e) => setPtNumberOfShares(parseInt(e.target.value) || 0)}
                              className="bg-transparent text-white text-base font-black focus:outline-none w-full text-right"
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 uppercase block pl-1">Sem tesouraria</span>
                        </div>
                      </div>

                      {/* CARD 3: PREÇO TETO */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative border-l-2 border-orange-500">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-orange-400 tracking-wider font-bold">Preço Teto</span>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-600 hover:text-white cursor-pointer" />
                            <div className="absolute right-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[9px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10 font-sans leading-relaxed">
                              Preço máximo aceitável para entrada de posição garantindo o retorno mínimo exigido (Bazin/Graham).
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-white">{rFormat(precoTetoVal)}</p>
                          <span className="text-[9px] text-slate-400 uppercase">Preço Justo Projetado</span>
                        </div>
                      </div>

                      {/* CARD 4: DPA (PROJETIVO) */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">DPA (Projetivo)</span>
                          <Info className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-white">{rFormat(dpaProjetivoVal)}</p>
                          <span className="text-[9px] text-slate-500 uppercase">Dividendo por Ação Estimado</span>
                        </div>
                      </div>

                      {/* CARD 5: YIELD (PROJETIVO) */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">Yield (Projetivo)</span>
                          <Info className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-emerald-400">{yieldProjetivoVal.toFixed(2)}%</p>
                          <span className="text-[9px] text-slate-500 uppercase">Yield Estimado na Cotação Atual</span>
                        </div>
                      </div>

                      {/* CARD 6: MARGEM SEGURANÇA */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">Margem de Segurança</span>
                          <Info className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-2xl font-black ${margemSegurancaVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {margemSegurancaVal.toFixed(2)}%
                          </p>
                          <span className="text-[9px] text-slate-500 uppercase">Diferença de Valorização</span>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded text-xs leading-relaxed text-slate-400 font-sans">
                  📌 <strong>Nota Geral:</strong> O modelo de <em>Preço Teto Projetivo</em> é calibrado para simular o comportamento de dividendos. Alterações nos lucros projetados ou taxas de retornos influenciam integralmente o limite ideal de compras e de acúmulo saudável do ativo listado na B3.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: ALUGUEL & ALAVANCAGEM SHORT ----------------- */}
        {activeTab === "margin" && (
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-bold font-mono">SHORT_SELLING_AND_MARGIN_CALCULATOR</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Core Simulator Panel */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Simulador de Posição Vendida</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase">Selecione Ativo B3</label>
                    <select
                      value={shortTicker}
                      onChange={(e) => setShortTicker(e.target.value)}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    >
                      <option value="PETR4">PETR4 - PETROBRAS ON</option>
                      <option value="VALE3">VALE3 - VALE S.A.</option>
                      <option value="ITUB4">ITUB4 - ITAÚ UNIBANCO PN</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase">Quantidade Alugada</label>
                    <input
                      type="number"
                      step="100"
                      value={shortQuantity}
                      onChange={(e) => setShortQuantity(parseInt(e.target.value) || 100)}
                      className="bg-black border border-white/10 rounded p-1.5 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase">Preço de Entrada</label>
                    <input
                      type="number"
                      readOnly
                      value={shortTicker === "PETR4" ? 30.00 : 72.30}
                      className="bg-[#111] text-slate-400 border border-white/5 rounded p-1.5 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded border-l-2 border-orange-600">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">MARKET_VALUE_SHORTED</span>
                    <h5 className="text-xl font-bold">{rFormat(shortQuantity * (shortTicker === "PETR4" ? 30.0 : 72.3))}</h5>
                    <span className="text-[10px] text-slate-500 block">Exigência mínima de cobertura local de Bolsa (140%)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">TOTAL_MARGIN_REQUIRED</span>
                    <h5 className="text-xl font-bold text-orange-500">{rFormat(shortQuantity * (shortTicker === "PETR4" ? 30.0 : 72.3) * 1.4)}</h5>
                    <span className="text-[10px] text-rose-400 block font-bold">Risco de Margin Call sob alta de 15%</span>
                  </div>
                </div>

                {/* Sub lender costs fees */}
                <div className="mt-8">
                  <h5 className="text-white text-xs uppercase tracking-widest font-bold mb-3">Custos Recorrentes de Aluguel (B3 Fee)</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500">
                          <th>Data</th>
                          <th>Ref. Tx Anual</th>
                          <th>Custo Diário Estimado</th>
                          <th>Tendência B3</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {lendingFeesHistory.map((fee, i) => (
                          <tr key={i}>
                            <td className="py-2">{fee.date}</td>
                            <td className="py-2 text-white">{fee.feeRate.toFixed(2)}% p.a.</td>
                            <td className="py-2 text-rose-400">R$ {fee.dailyCost.toFixed(2)}</td>
                            <td className="py-2 text-slate-400">{fee.trend}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Collateral requirements side cards */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-3">Margem e Liquidação</h4>
                  
                  {/* Gauge Risk chart */}
                  <LiquidationRiskGauge riskScorePercentage={65} />
                  
                  <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 rounded mt-4 text-[10px] text-[#ef4444] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
                    <span>ALERTA DE ALTA VOLATILIDADE EXCEDIDA</span>
                  </div>
                </div>

                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-3">Ativos em Garantia (Cover)</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <label className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={collateralCdb}
                          onChange={(e) => setCollateralCdb(e.target.checked)}
                          className="accent-orange-500"
                        />
                        <span>CDBs Líquidos</span>
                      </div>
                      <span className="text-slate-400 font-mono">R$ 20,000.00</span>
                    </label>
                    <label className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={collateralStocks}
                          onChange={(e) => setCollateralStocks(e.target.checked)}
                          className="accent-orange-500"
                        />
                        <span>Ações da Carteira</span>
                      </div>
                      <span className="text-slate-400 font-mono">R$ 25,000.00</span>
                    </label>
                    <label className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={collateralBonds}
                          onChange={(e) => setCollateralBonds(e.target.checked)}
                          className="accent-orange-500"
                        />
                        <span>Títulos do Tesouro</span>
                      </div>
                      <span className="text-slate-400 font-mono">R$ 0.00</span>
                    </label>

                    <div className="pt-2 border-t border-white/5">
                      <div className="flex justify-between text-xs font-bold text-emerald-400">
                        <span>Total Garantias Ativas:</span>
                        <span>{rFormat((collateralCdb ? 20000 : 0) + (collateralStocks ? 25000 : 0) + (collateralBonds ? 30000 : 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: FRONTEIRA EFICIENTE DE MARKOWITZ ----------------- */}
        {activeTab === "efficient_frontier" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Parameters input config on Left side */}
              <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Parâmetros de Otimização</h4>
                
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block uppercase text-[10px]">Taxa Livre de Risco (% p.a.)</label>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="5"
                        max="14"
                        step="0.25"
                        defaultValue="10.75"
                        className="w-full accent-orange-600"
                      />
                      <span className="text-white font-bold w-12 text-right">10.75%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Ativos Qualificados</span>
                    <div className="grid grid-cols-2 gap-2">
                      {["PETR4", "VALE3", "ABEV3", "ITUB4", "WEGE3", "BBAS3", "JBSS3", "SUZB3"].map((ticker) => (
                        <label key={ticker} className="flex items-center gap-2 p-1.5 bg-black border border-white/5 rounded cursor-pointer hover:border-orange-500/30">
                          <input type="checkbox" defaultChecked className="accent-orange-500" />
                          <span>{ticker}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block uppercase text-[10px]">Objetivo do Algoritmo</label>
                    <select className="bg-black border border-white/10 rounded p-1.5 w-full text-white outline-none">
                      <option value="max_sharpe">Max Sharpe Ratio (Max Retorno / Risco)</option>
                      <option value="min_vol">Mínima Volatilidade Histórica</option>
                    </select>
                  </div>

                  <button className="w-full bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase text-xs py-2 rounded shadow-md shadow-orange-600/10 transition-all font-mono">
                     Simular Fronteira Eficiente
                  </button>
                </div>
              </div>

              {/* Frontier Chart display on Right side */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded">
                <EfficientFrontierPlot
                  optimalPoint={{ x: 16.5, y: 20.8 }}
                  points={[
                    { x: 14.2, y: 13.5 },
                    { x: 15.1, y: 15.2 },
                    { x: 15.8, y: 18.0 },
                    { x: 16.5, y: 20.8, isOptimal: true },
                    { x: 17.5, y: 21.2 },
                    { x: 19.0, y: 22.1 },
                    { x: 21.4, y: 23.5 },
                    { x: 13.8, y: 11.2 },
                    { x: 16.0, y: 14.5 },
                    { x: 18.2, y: 19.8 },
                    { x: 20.5, y: 22.0 },
                    { x: 24.2, y: 25.0 }
                  ]}
                />
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 7: HEATMAPS DE CORRELAÇÃO & SECTORS ----------------- */}
        {activeTab === "correlations" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Asset correlations heat matrix list */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] text-orange-500 uppercase font-bold tracking-widest">ASSET_CORRELATION_HEATMAP</p>
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Matriz de Correlação do Portfólio (B3)</h4>
                  </div>
                  <span className="text-[10px] text-emerald-400">Dados recalculados LTM</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-[10px] font-mono border-collapse">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/10">
                        <th className="p-2 text-left">Ativo</th>
                        {Object.keys(initialCorrelation).map(t => <th key={t} className="p-2">{t}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(initialCorrelation).map(([ticker, row]) => (
                        <tr key={ticker} className="hover:bg-white/5">
                          <td className="p-2 text-left font-bold text-white border-r border-white/5">{ticker}</td>
                          {Object.keys(initialCorrelation).map((col) => {
                            const val = row[col] ?? 0;
                            let cellBg = "";
                            if (val === 1) cellBg = "bg-orange-600/80 text-black font-bold";
                            else if (val > 0.8) cellBg = "bg-orange-900/35 text-orange-400";
                            else if (val > 0.5) cellBg = "bg-orange-950/20 text-orange-500/80";
                            else if (val < 0) cellBg = "bg-blue-950/30 text-blue-400";
                            else cellBg = "bg-white/5 text-slate-400";

                            return (
                              <td key={col} className={`p-2 transition-all ${cellBg}`}>
                                {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Treemap Sector breakdown side widget */}
              <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded flex flex-col justify-between">
                <div>
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-3 border-b border-white/5 pb-2">Dividido por Setores (B3 Treemap)</h4>
                  
                  {/* Visual mockup representation of Sector Treemaps */}
                  <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                    <div className="bg-orange-950/50 border border-orange-500/20 p-3 h-16 rounded flex flex-col justify-between">
                      <span className="font-bold text-orange-400">Financeiro (40%)</span>
                      <span className="text-[10px] text-orange-500/80">BBAS3, ITUB4, BBDC3</span>
                    </div>
                    <div className="bg-emerald-950/50 border border-emerald-500/20 p-3 h-16 rounded flex flex-col justify-between">
                      <span className="font-bold text-emerald-400">Materiais Básicos (30%)</span>
                      <span className="text-[10px] text-emerald-500/80">VALE3, CSNA3, GGBR4</span>
                    </div>
                    <div className="bg-purple-950/50 border border-purple-500/20 p-3 h-16 rounded flex flex-col justify-between">
                      <span className="font-bold text-purple-400">Utilidade Pública (20%)</span>
                      <span className="text-[10px] text-purple-500/80">ELET3, TAEE11</span>
                    </div>
                    <div className="bg-blue-950/50 border border-blue-500/20 p-3 h-16 rounded flex flex-col justify-between">
                      <span className="font-bold text-blue-400">Consumo Cíclico (10%)</span>
                      <span className="text-[10px] text-blue-500/80">MGLU3, LREN3</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded text-[10px] text-slate-500 leading-relaxed font-mono mt-4">
                  💡 A diversificação setorial reduz em até 38% a volatilidade sistemática em cenários de alta de juros do cupom.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 8: PLANOS DE REBALANCEAMENTO ----------------- */}
        {activeTab === "rebalancing" && (
          <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a855f7] font-bold">PORTFOLIO_REBALANCING_CALCULATOR</p>
                <h4 className="text-white text-base font-semibold">Ordem e Alocações Recomendadas para Rebalancear</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Aporte Simulado (Nova Capital):</span>
                <input
                  type="number"
                  placeholder="R$ 10.000,00"
                  className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white max-w-[120px]"
                />
                <button className="bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded transition-all">Rebalancear</button>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500">
                    <th className="pb-2">Ativo</th>
                    <th className="pb-2 text-right">Peso Atual (%)</th>
                    <th className="pb-2 text-right">Peso Alvo (%)</th>
                    <th className="pb-2 text-right">Valor Alvo</th>
                    <th className="pb-2 text-right">Aporte / Delta</th>
                    <th className="pb-2 text-center">Operação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {initialRebalancingList.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="py-2.5 font-bold text-white">{item.ticker}</td>
                      <td className="py-2.5 text-right">{item.currentWeight}%</td>
                      <td className="py-2.5 text-right">{item.targetWeight}%</td>
                      <td className="py-2.5 text-right">{rFormat(item.idealValue)}</td>
                      <td className={`py-2.5 text-right font-bold ${item.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.delta >= 0 ? "+" : ""}{rFormat(item.delta)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.action === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                        }`}>
                          {item.action === "BUY" ? "🟢 COMPRAR" : "🔴 VENDER"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-white/5 pt-4">
              <button
                onClick={() => alert("Histórico de ordens exportado em formato CSV corporativo.")}
                className="px-4 py-2 border border-white/10 hover:border-white/25 rounded text-xs select-none transition-all uppercase"
              >
                Exportar Ordens (.CSV)
              </button>
              <button
                onClick={() => alert("Simulação de ordens em corretor enviada com sucesso ao painel integrado!")}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded text-xs select-none transition-all uppercase"
              >
                Executar Rebalanceamento Inteligente
              </button>
            </div>
          </div>
        )}

        {/* ----------------- TAB 9: ANALISADOR CVM IA ----------------- */}
        {activeTab === "report_analyzer" && (
          <div className="space-y-6">
            <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
              <p className="text-[10px] uppercase tracking-widest text-[#a855f7] mb-1">AI_FINANCIAL_REPORT_ANALYZER</p>
              <h4 className="text-white text-base font-semibold">Análise de Relatórios de Empresas B3 via IA</h4>
              <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
                Insira o relatório oficial da empresa (PDF) e adicione um comentário, contexto ou discussão para processar na IA Gemini 3.5-Flash e extrair métricas, pontos críticos do relatório e avaliação de sentimentos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 select-none">
                {/* Left Column: Drag & Drop PDF */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-450 block font-semibold text-purple-400">1. Anexo do Relatório da Empresa (PDF)</span>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("pdf-file-input")?.click()}
                    className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all h-[170px] cursor-pointer text-center relative ${
                      dragActive
                        ? "border-[#a855f7] bg-[#a855f7]/5"
                        : attachedPdf
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-white/10 hover:border-white/25 bg-black"
                    }`}
                  >
                    <input
                      id="pdf-file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {attachedPdf ? (
                      <div className="space-y-3 font-sans w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 gap-2 mx-auto max-w-xs transition-transform hover:scale-102">
                          <Paperclip className="w-4 h-4 shrink-0 text-emerald-300 animate-bounce" />
                          <span className="text-xs font-bold truncate max-w-[160px]" title={attachedPdf.name}>
                            {attachedPdf.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {(attachedPdf.size / (1024 * 1024)).toFixed(2)} MB • Carregado com sucesso
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedPdf(null);
                          }}
                          className="mt-1 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 rounded text-[10px] transition-all inline-flex items-center gap-1 uppercase"
                        >
                          <X className="w-3 h-3" />
                          <span>Remover Arquivo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="font-sans space-y-2.5 text-slate-450 text-[#94a3b8]">
                        <Upload className="w-8 h-8 mx-auto text-slate-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">Arraste e solte o PDF da empresa aqui</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ou dê um clique para navegar nos locais locais</p>
                        </div>
                        <span className="inline-block text-[10px] bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                          Formatos suportados: .PDF • Máx 15MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Discussion Input */}
                <div className="space-y-2 flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-450 block font-semibold text-purple-400">2. Discussão / Contextualização Adicional</span>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Cole aqui observações, dúvidas sobre o relatório ou discussões adicionais com a administração que queira relacionar com o PDF..."
                    className="flex-1 w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-orange-500/50 resize-none font-sans min-h-[170px]"
                  />
                </div>
              </div>

              <button
                onClick={handleCallAIAnalyze}
                disabled={analysisLoading || (!reportText.trim() && !attachedPdf)}
                className="w-full bg-[#a855f7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500 text-white font-bold py-2.5 rounded text-xs uppercase cursor-pointer hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {analysisLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando e estruturando dados...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>Analisar com IA Gemini 3.5</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured IA Analytics output Results section */}
            {aiAnalysisResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sentiment side card dial */}
                <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded flex flex-col justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">RESULT_SENTIMENT</span>
                    <h5 className="text-white text-sm font-semibold uppercase">{valuationParams.ticker} Sentiment Analysis</h5>
                  </div>
                  
                  <div className="py-4 flex flex-col items-center">
                    <span className={`text-4xl font-bold ${
                      aiAnalysisResult?.sentiment === "Positive" ? "text-emerald-400" : aiAnalysisResult?.sentiment === "Negative" ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {aiAnalysisResult?.sentiment || "NEUTRAL"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Score: {aiAnalysisResult?.sentimentScore ?? 0.15} / 1.0</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal mb-2 bg-white/5 p-3 rounded">
                    {aiAnalysisResult?.sentimentReason}
                  </p>
                </div>

                {/* Bullets lists of keys items on Right */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Highlights and red flags panel */}
                  <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-2">🍀 HIGHLIGHTS (PONTOS CHAVE)</span>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                          {aiAnalysisResult?.highlights?.map((h: string, idx: number) => (
                            <li key={idx} className="leading-snug">{h}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 uppercase font-bold block mb-2">⚠️ RED FLAGS (INDÍCIOS DE PERIGOS)</span>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                          {aiAnalysisResult?.redFlags?.map((r: string, idx: number) => (
                            <li key={idx} className="leading-snug">{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Financial KPI metrics parsed and rendered cleanly */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Margem EBITDA</span>
                      <span className="text-base font-bold text-white mt-1 block">{aiAnalysisResult?.metrics?.ebitdaMargin || "33.33%"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Dív. Líquida / EBITDA</span>
                      <span className="text-base font-bold text-white mt-1 block">{aiAnalysisResult?.metrics?.netDebtEbitda || "1.30x"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">ROE</span>
                      <span className="text-base font-bold text-white mt-1 block">{aiAnalysisResult?.metrics?.roe || "15.52%"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Fluxo de Caixa Livre</span>
                      <span className="text-base font-bold text-rose-400 mt-1 block">{aiAnalysisResult?.metrics?.freeCashFlow || "-R$ 2.0B"}</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 p-10 text-center rounded text-slate-500 font-sans">
                Aguardando execução da análise inteligente... Clique no botão acima para ver a IA em ação!
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 10: NOTÍCIAS & SENTIMENTO ----------------- */}
        {activeTab === "news_sentiment" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Live Feed column */}
              <div className="lg:col-span-5 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold">Resumos Diários & Feed</h4>
                  <span className="text-[10px] text-orange-500">Real-time B3 Feed</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto">
                  {newsList.map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded relative hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-1 text-[10px]">
                        <span className="text-orange-500 font-bold">{item.ticker}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            item.sentiment === "Positive" ? "bg-emerald-500/20 text-emerald-400" : item.sentiment === "Negative" ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-slate-300"
                          }`}>
                            {item.sentiment}
                          </span>
                          <span className="text-slate-500">{item.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white leading-snug">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Summary Dashboard generator */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                
                {/* News Sentiment Executive outlook summary card */}
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-[#a855f7] uppercase font-bold tracking-widest">AI_NEWS_EXECUTIVE_SUMMARY</span>
                    <button
                      onClick={handleCallNewsSummary}
                      disabled={newsSummaryLoading}
                      className="px-2.5 py-1 border border-orange-500/30 text-orange-500 text-[10px] uppercase font-bold hover:bg-orange-600/5 transition-all outline-none rounded"
                    >
                      {newsSummaryLoading ? "Carregando..." : "Regerar Sumário de Notícias"}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-white/5 p-4 rounded border-l border-orange-500">
                    {newsSummaryText}
                  </p>
                </div>

                {/* Sentiment trend block */}
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-3">Tendência de Sentimento L30 vs Preço B3</h4>
                  
                  {/* Simplified mock path chart for sentimento trend */}
                  <div className="h-28 relative border-b border-l border-white/10 pb-1 pt-2">
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                      {/* Price curve path line */}
                      <path d="M 0 25 Q 25 15 50 18 T 100 5" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                      {/* Sentiment area below */}
                      <path d="M 0 30 L 0 25 Q 25 15 50 18 T 100 5 L 100 30 Z" fill="url(#feedTrendGrad)" opacity="0.1" />
                      <defs>
                        <linearGradient id="feedTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute top-2 left-2 text-[9px] text-emerald-400">VALE3 Preço vs Sentimento Geral da Mídia</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 11: GOVERNANÇA E ARQUIVOS CVM ----------------- */}
        {activeTab === "governance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column CVM filings list logs */}
              <div className="lg:col-span-5 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold">Arquivos CVM Recebidos (Atos)</h4>
                  <span className="text-[10px] text-orange-500">CVM Pipeline</span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {initialCVMFilings.map((file) => (
                    <div key={file.id} className="p-3 bg-white/5 border border-white/5 rounded text-xs select-none hover:border-orange-500/35 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white shrink-0">{file.date}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                          file.status === "Processed" ? "bg-emerald-500/25 text-emerald-400" : file.status === "Pending" ? "bg-amber-500/25 text-amber-400" : "bg-rose-500/25 text-rose-400"
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#a855f7] block mb-1 font-semibold">{file.company}</span>
                      <p className="text-[11px] text-slate-400 leading-snug">{file.contentSnippet}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Governance scoreboard details */}
              <div className="lg:col-span-7 bg-[#0b0b0b] border border-white/10 p-5 rounded flex flex-col justify-between font-mono">
                <div>
                  <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Placar AI de Governança Corporativa (B3)</h4>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                      <div>
                        <span className="font-bold block text-white">Conselho de Administração Independente</span>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Participação superior a 60% de diretores independentes sem vinculo de controle direto.</p>
                      </div>
                      <span className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">A-</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                      <div>
                        <span className="font-bold block text-white">Alinhamento de Remuneração Executiva (SOP)</span>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Planos de remunerações baseados em opções atreladas a cumprimento de metas de EBITDA proforma acumulado no triênio.</p>
                      </div>
                      <span className="text-xl font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded">B+</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#111] rounded border border-white/5">
                      <div>
                        <span className="font-bold block text-white">Direitos dos minoritários e Tag Along</span>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Tag along de 100% garantido para ações ordinárias e preferenciais sob ofertas públicas de aquisição (OPAs).</p>
                      </div>
                      <span className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">A</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <span className="text-[10px] text-[#ef4444] font-bold block mb-1">MÉTRICAS DE RISCO RELEVADAS:</span>
                  <p className="text-xs text-slate-400 font-sans tracking-wide">
                    ⚠️ Mentions de ações coletivas de reparação ambiental e mudanças abruptas imprevistas na diretoria fiscal nos últimos 12 meses são as principais bandeiras de risco.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 12: RASTREADOR DE AÇÕES (SCREENER) ----------------- */}
        {activeTab === "screener_stocks" && (
          <div className="space-y-6">
            <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
              
              {/* Slogan and Favoriting segment */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#a855f7]">ASSET_DASHBOARD</p>
                  <h4 className="text-white text-base font-semibold">Filtros Quantitativos de Ações (Screener)</h4>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded flex items-center gap-1.5 transition-all outline-none border ${
                      showOnlyFavorites
                        ? "bg-amber-500 border-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                        : "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-black text-black" : "text-amber-500"}`} />
                    <span>Apenas Favoritos</span>
                  </button>

                  <div className="flex gap-1.5 bg-black/40 p-1 border border-white/5 rounded">
                    {["Todos", "Financeiro", "Energia Elétrica", "Consumo Cíclico", "Materiais"].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSelectedSector(sec)}
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all outline-none ${
                          selectedSector === sec
                            ? "bg-[#a855f7] text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Taxas de Valuation Section */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxas de valuation</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Taxa Bazin</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vBazin}
                      onChange={(e) => setVBazin(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-1 font-sans font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Taxa Graham</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vGraham}
                      onChange={(e) => setVGraham(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-1 font-sans font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Taxa Peter Lynch</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vPeterLynch}
                      onChange={(e) => setVPeterLynch(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-1 font-sans font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Filtros principais de Ações */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">P/L Mín.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stockPlMin}
                    onChange={(e) => setStockPlMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">P/L Máx.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stockPlMax}
                    onChange={(e) => setStockPlMax(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">DL/EBITDA Mín.</label>
                  <input
                    type="text"
                    placeholder="DL/EBITDA Mínimo"
                    value={stockDlEbitdaMin}
                    onChange={(e) => setStockDlEbitdaMin(e.target.value)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans placeholder-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">DL/EBITDA Máx.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stockDlEbitdaMax}
                    onChange={(e) => setStockDlEbitdaMax(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Dividend Yield Mín.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stockDyMin}
                    onChange={(e) => setStockDyMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Mostrar</label>
                  <select
                    value={stockMostrar}
                    onChange={(e) => setStockMostrar(e.target.value)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans cursor-pointer focus:ring-0"
                  >
                    <option value="Todos" className="bg-[#111]">Todos</option>
                    <option value="Com Dividendos" className="bg-[#111]">Com Dividendos</option>
                    <option value="Altamente Lucrativas" className="bg-[#111]">Altamente Lucrativas</option>
                  </select>
                </div>
              </div>

              {/* 3. Collapsible bar for Extra Filters */}
              <div 
                onClick={() => setStockExtraExpanded(!stockExtraExpanded)}
                className="w-full bg-[#e6f4fc] hover:bg-[#d0eaf8] border border-sky-200/50 text-[#0284c7] font-sans rounded-md p-2.5 mb-5 flex items-center justify-between cursor-pointer select-none transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {stockExtraExpanded ? "Clique para recolher filtros extras" : "Clique para expandir filtros extras"}
                </span>
                {stockExtraExpanded ? <ChevronUp className="w-4 h-4 text-[#0284c7]" /> : <ChevronDown className="w-4 h-4 text-[#0284c7]" />}
              </div>

              {/* 4. Extra Filters Section (Collapsible) */}
              {stockExtraExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-lg select-none">
                  <div className="flex flex-col gap-1 bg-black/60 border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Margem Líquida (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={stockNetMargin}
                      onChange={(e) => setStockNetMargin(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black/60 border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">ROE (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={stockRoe}
                      onChange={(e) => setStockRoe(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black/60 border border-white/5 p-2 rounded-lg">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Liquidez Mín. (R$)</label>
                    <input
                      type="number"
                      step="100000"
                      value={stockLiquidity}
                      onChange={(e) => setStockLiquidity(parseInt(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* 5. Action Row with Filtering and Rank selectors */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {}}
                    className="bg-[#0284c7] hover:bg-sky-600 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar</span>
                  </button>
                  
                  <div className="bg-[#111] hover:bg-white/5 border border-white/10 rounded-lg p-2 text-slate-300 transition-all cursor-pointer">
                    <Save className="w-3.5 h-3.5" />
                  </div>
                  
                  <button
                    onClick={handleResetStockFilters}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white font-sans text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar filtros</span>
                  </button>

                  <select
                    value={stockRankMethod}
                    onChange={(e) => setStockRankMethod(e.target.value)}
                    className="bg-[#111] border border-white/10 text-white text-xs font-sans rounded-lg px-3.5 py-2 cursor-pointer outline-none focus:border-purple-500"
                  >
                    <option value="Rank GD">Rank GD</option>
                    <option value="Bazin">Valoration Bazin</option>
                    <option value="Graham">Valoration Graham</option>
                    <option value="Peter Lynch">Valoration Peter Lynch</option>
                    <option value="Joel">Valoration Joel</option>
                  </select>
                </div>

                {/* Quantitative results summary counter */}
                <span className="text-xs text-slate-400 font-sans tracking-wide">
                  Mostrando <strong className="text-[#0284c7] font-extrabold">{
                    initialScreenerStocks.filter((s) => {
                      const matchesSector = selectedSector === "Todos" || s.sector === selectedSector;
                      const matchesPl = s.pl >= stockPlMin && s.pl <= stockPlMax;
                      const matchesDy = s.divYield >= stockDyMin;
                      const matchesNetMargin = s.netMargin >= stockNetMargin;
                      const matchesRoe = s.roe >= stockRoe;
                      const matchesLiquidity = s.liquidity >= stockLiquidity;
                      const matchFavorites = !showOnlyFavorites || favoriteTickers.includes(s.ticker);
                      const matchesSearch = !stockSearch.trim() || s.ticker.toLowerCase().includes(stockSearch.toLowerCase()) || s.name.toLowerCase().includes(stockSearch.toLowerCase());
                      
                      let matchesDlE = s.dlEbitda <= stockDlEbitdaMax;
                      if (stockDlEbitdaMin !== "") matchesDlE = matchesDlE && s.dlEbitda >= Number(stockDlEbitdaMin);

                      return matchesSector && matchesPl && matchesDy && matchesNetMargin && matchesRoe && matchesLiquidity && matchFavorites && matchesSearch && matchesDlE;
                    }).length
                  }</strong> de <strong className="text-white font-bold">{initialScreenerStocks.length}</strong> Ações
                </span>
              </div>

              {/* Research live Search Bar */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/50"
                />
              </div>

              {/* High precision Stocks Table */}
              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 bg-white/5 select-none">
                      <th className="py-3 px-3 w-10 text-center">Fav</th>
                      <th className="py-3 px-1">Rank</th>
                      <th className="py-3 px-2">Ticker</th>
                      <th className="py-3 px-2 text-right">Cotação</th>
                      <th className="py-3 px-2 text-right">Dividend Yield</th>
                      <th className="py-3 px-2 text-right">P/L</th>
                      <th className="py-3 px-2 text-right">Margem Líquida</th>
                      <th className="py-3 px-2 text-right">ROE</th>
                      <th className="py-3 px-2 text-right">DL/EBITDA</th>
                      
                      {/* Valuation Column Highlights exactly like the image */}
                      <th className="bg-[#fefcbf] text-amber-950 font-bold text-center py-2.5 px-3 uppercase text-[9px] w-28 tracking-wide border-l border-white/10">
                        Valuation Bazin
                      </th>
                      <th className="bg-[#ebf8ff] text-blue-950 font-bold text-center py-2.5 px-3 uppercase text-[9px] w-28 tracking-wide border-l border-white/10">
                        Valuation Graham
                      </th>
                      <th className="bg-[#faf5ff] text-purple-950 font-bold text-center py-2.5 px-3 uppercase text-[9px] w-28 tracking-wide border-l border-white/10">
                        Valuation Peter Lynch
                      </th>
                      <th className="bg-[#fff5f5] text-[#991b1b] font-bold text-center py-2.5 px-3 uppercase text-[9px] w-28 tracking-wide border-l border border-r border-white/10">
                        Valuation Joel
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {initialScreenerStocks
                      .filter((s) => {
                        const matchesSector = selectedSector === "Todos" || s.sector === selectedSector;
                        const matchesPl = s.pl >= stockPlMin && s.pl <= stockPlMax;
                        const matchesDy = s.divYield >= stockDyMin;
                        const matchesNetMargin = s.netMargin >= stockNetMargin;
                        const matchesRoe = s.roe >= stockRoe;
                        const matchesLiquidity = s.liquidity >= stockLiquidity;
                        const matchFavorites = !showOnlyFavorites || favoriteTickers.includes(s.ticker);
                        const matchesSearch = !stockSearch.trim() || s.ticker.toLowerCase().includes(stockSearch.toLowerCase()) || s.name.toLowerCase().includes(stockSearch.toLowerCase());
                        
                        let matchesDlE = s.dlEbitda <= stockDlEbitdaMax;
                        if (stockDlEbitdaMin !== "") matchesDlE = matchesDlE && s.dlEbitda >= Number(stockDlEbitdaMin);

                        return matchesSector && matchesPl && matchesDy && matchesNetMargin && matchesRoe && matchesLiquidity && matchFavorites && matchesSearch && matchesDlE;
                      })
                      .sort((a, b) => {
                        if (stockRankMethod === "Bazin") {
                          const valA = (a.price * a.divYield / 100) / (vBazin / 100);
                          const valB = (b.price * b.divYield / 100) / (vBazin / 100);
                          return valB - valA;
                        } else if (stockRankMethod === "Graham") {
                          const valA = Math.sqrt(vGraham * a.lpa * a.vpa);
                          const valB = Math.sqrt(vGraham * b.lpa * b.vpa);
                          return valB - valA;
                        } else if (stockRankMethod === "Peter Lynch") {
                          const valA = ((a.growthRate || 3.0) + a.divYield) / a.pl;
                          const valB = ((b.growthRate || 3.0) + b.divYield) / b.pl;
                          return valB - valA;
                        } else {
                          // Rank GD or Joel
                          const valA = (a.roe + a.netMargin) / a.pl;
                          const valB = (b.roe + b.netMargin) / b.pl;
                          return valB - valA;
                        }
                      })
                      .map((s, idx) => {
                        const isFav = favoriteTickers.includes(s.ticker);
                        
                        // Compute calculations dynamically for live response
                        const bazinVal = (s.price * s.divYield / 100) / (vBazin / 100);
                        const grahamVal = Math.sqrt(vGraham * s.lpa * s.vpa);
                        const lynchVal = ((s.growthRate || 3.0) + s.divYield) / s.pl;
                        const joelScoreVal = (s.roe + s.netMargin) / (s.pl * 25) * 0.1;

                        // Logo color
                        let logoColor = "bg-emerald-500";
                        if (s.ticker === "CMIN3") logoColor = "bg-blue-600";
                        else if (s.ticker === "ISAE4") logoColor = "bg-cyan-500";
                        else if (s.ticker === "VALE3") logoColor = "bg-[#a855f7]";

                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-all">
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => toggleFavorite(s.ticker)}
                                className="text-slate-500 hover:text-amber-400 focus:outline-none transition-colors"
                              >
                                <Star className={`w-4 h-4 mx-auto ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-500"}`} />
                              </button>
                            </td>
                            
                            <td className="py-3 px-1 text-slate-400 font-sans">
                              #{idx + 1}
                            </td>
                            
                            <td className="py-3 px-2 font-mono flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full ${logoColor} text-[8px] flex items-center justify-center font-bold text-black border border-white/10 shrink-0`}>
                                {s.ticker.slice(0, 3)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-orange-500">{s.ticker}</span>
                                <span className="text-[9px] text-slate-400 font-sans truncate max-w-[110px]">{s.name}</span>
                              </div>
                            </td>

                            <td className="py-3 px-2 text-right font-bold text-white font-mono">{rFormat(s.price)}</td>
                            <td className="py-3 px-2 text-right text-emerald-400 font-mono font-bold">{s.divYield.toFixed(2)}%</td>
                            <td className="py-3 px-2 text-right text-orange-500 font-mono">{s.pl.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right text-slate-300 font-mono">{s.netMargin.toFixed(2)}%</td>
                            <td className="py-3 px-2 text-right text-emerald-400 font-mono">{s.roe.toFixed(2)}%</td>
                            <td className="py-3 px-2 text-right text-slate-300 font-mono">{s.dlEbitda.toFixed(2)}</td>
                            
                            {/* Calculation cell highlights matching the image color tones */}
                            <td className="py-3 px-3 text-center font-bold text-amber-300 bg-amber-500/5 font-mono border-l border-white/5">
                              {rFormat(bazinVal)}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-blue-300 bg-blue-500/5 font-mono border-l border-white/5">
                              {grahamVal ? rFormat(grahamVal) : "R$ 0,00"}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-purple-300 bg-purple-500/5 font-mono border-l border-white/5">
                              {lynchVal.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-rose-300 bg-rose-500/5 font-mono border-l border border-r border-white/5">
                              {joelScoreVal.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between text-xs text-slate-500 font-sans">
                <span>
                  Dados de Fechamento B3 de Fechamento Média.
                </span>
                <span>Filtro e Valuation assistidos por IA em Real-Time</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 13: SCREENER DE FIIS & MAPA INTERATIVO ----------------- */}
        {activeTab === "screener_fiis" && (
          <div className="space-y-6">
            <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#a855f7]">ASSET_DASHBOARD</p>
                  <h4 className="text-white text-base font-semibold">Filtros Quantitativos de FIIs</h4>
                </div>
                
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded flex items-center gap-1.5 transition-all outline-none border ${
                    showOnlyFavorites
                      ? "bg-[#a855f7] border-[#a855f7] text-white font-bold shadow-md shadow-purple-500/10"
                      : "border-purple-500/30 text-[#a855f7] hover:bg-[#a855f7]/10"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-white text-white" : "text-[#a855f7]"}`} />
                  <span>Apenas Favoritos</span>
                </button>
              </div>

              {/* FII Filtering Form (Aligned with Image 2) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Dividend Yield Mín.</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={fiiDyMin}
                      onChange={(e) => setFiiDyMin(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans w-full"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Liquidez Mín.</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-sans">R$</span>
                    <input
                      type="number"
                      step="100000"
                      value={fiiLiquidityMin}
                      onChange={(e) => setFiiLiquidityMin(parseInt(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Vacância Máx.</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      value={fiiVacancyMax}
                      onChange={(e) => setFiiVacancyMax(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans w-full"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">P/VP Mín.</label>
                  <input
                    type="number"
                    step="0.05"
                    value={fiiVpvMin}
                    onChange={(e) => setFiiVpvMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">P/VP Máx.</label>
                  <input
                    type="number"
                    step="0.05"
                    value={fiiVpvMax}
                    onChange={(e) => setFiiVpvMax(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans"
                  />
                </div>
              </div>

              {/* Secondary row for select segments & dropdown options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Segmento</label>
                  <select
                    value={fiiSegment}
                    onChange={(e) => setFiiSegment(e.target.value)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans cursor-pointer focus:ring-0"
                  >
                    <option value="" className="bg-[#111]">Todos</option>
                    <option value="Lajes Corporativas" className="bg-[#111]">Lajes Corporativas</option>
                    <option value="Papel CRI" className="bg-[#111]">Papel CRI</option>
                    <option value="Renda Urbana" className="bg-[#111]">Renda Urbana</option>
                    <option value="FIAgro" className="bg-[#111]">FIAgro</option>
                    <option value="Logística" className="bg-[#111]">Logística</option>
                    <option value="Shopping" className="bg-[#111]">Shopping</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Mostrar</label>
                  <select
                    value={fiiMostrar}
                    onChange={(e) => setFiiMostrar(e.target.value)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans cursor-pointer focus:ring-0"
                  >
                    <option value="Todos" className="bg-[#111]">Todos</option>
                    <option value="Método 2em1" className="bg-[#111]">Método 2em1</option>
                    <option value="Apenas Descontados" className="bg-[#111]">Apenas Descontados</option>
                  </select>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {}}
                    className="bg-[#0284c7] hover:bg-sky-600 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar</span>
                  </button>
                  
                  <div className="bg-[#111] hover:bg-white/5 border border-white/10 rounded-lg p-2 text-slate-300 transition-all cursor-pointer">
                    <Save className="w-3.5 h-3.5" />
                  </div>
                  
                  <button
                    onClick={handleResetFiiFilters}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white font-sans text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar filtros</span>
                  </button>
                </div>

                {/* Dyn counter of FIIs results */}
                <span className="text-xs text-slate-400 font-sans tracking-wide">
                  Mostrando <strong className="text-[#a855f7] font-extrabold">{
                    initialScreenerFIIs.filter((f) => {
                      const matchesDy = f.divYield >= fiiDyMin;
                      const matchesLiquidity = f.liquidity >= fiiLiquidityMin;
                      const matchesVacancy = f.vacancy <= fiiVacancyMax;
                      const matchesVpv = f.vpv >= fiiVpvMin && f.vpv <= fiiVpvMax;
                      const matchesSegment = !fiiSegment || f.segment === fiiSegment;
                      
                      let matchesMostrar = true;
                      if (fiiMostrar === "Método 2em1") {
                        matchesMostrar = f.vpv < 1.00 && f.divYield >= 8.5;
                      } else if (fiiMostrar === "Apenas Descontados") {
                        matchesMostrar = f.vpv < 1.00;
                      }
                      
                      const matchesSearch = !fiiSearch.trim() || f.ticker.toLowerCase().includes(fiiSearch.toLowerCase());
                      const matchesFav = !showOnlyFavorites || favoriteTickers.includes(f.ticker);
                      
                      return matchesDy && matchesLiquidity && matchesVacancy && matchesVpv && matchesSegment && matchesMostrar && matchesSearch && matchesFav;
                    }).length
                  }</strong> de <strong className="text-white font-bold">{initialScreenerFIIs.length}</strong> FIIs
                </span>
              </div>

              {/* FII Live Research Input */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={fiiSearch}
                  onChange={(e) => setFiiSearch(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#a855f7]/50"
                />
              </div>
              
              {/* Clean FII Results Table */}
              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40 mb-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 bg-white/5 select-none">
                      <th className="py-3 px-3 w-10 text-center">Fav</th>
                      <th className="py-3 px-1">Rank</th>
                      <th className="py-3 px-2">Fundo</th>
                      <th className="py-3 px-2">Segmento</th>
                      <th className="py-3 px-2 text-right">Cotação</th>
                      <th className="py-3 px-2 text-right">Dividend Yield</th>
                      <th className="py-3 px-2 text-right">P/VP</th>
                      <th className="py-3 px-2 text-right">Liquidez Média (2m)</th>
                      <th className="py-3 px-2 text-right">Qtd de Imóveis</th>
                      <th className="py-3 px-2 text-right">Vacância Média</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {initialScreenerFIIs
                      .filter((f) => {
                        const matchesDy = f.divYield >= fiiDyMin;
                        const matchesLiquidity = f.liquidity >= fiiLiquidityMin;
                        const matchesVacancy = f.vacancy <= fiiVacancyMax;
                        const matchesVpv = f.vpv >= fiiVpvMin && f.vpv <= fiiVpvMax;
                        const matchesSegment = !fiiSegment || f.segment === fiiSegment;
                        
                        let matchesMostrar = true;
                        if (fiiMostrar === "Método 2em1") {
                          matchesMostrar = f.vpv < 1.00 && f.divYield >= 8.5;
                        } else if (fiiMostrar === "Apenas Descontados") {
                          matchesMostrar = f.vpv < 1.00;
                        }
                        
                        const matchesSearch = !fiiSearch.trim() || f.ticker.toLowerCase().includes(fiiSearch.toLowerCase());
                        const matchesFav = !showOnlyFavorites || favoriteTickers.includes(f.ticker);
                        
                        return matchesDy && matchesLiquidity && matchesVacancy && matchesVpv && matchesSegment && matchesMostrar && matchesSearch && matchesFav;
                      })
                      .sort((a, b) => b.divYield - a.divYield) // Sort descending by yield rank
                      .map((f, idx) => {
                        const isFav = favoriteTickers.includes(f.ticker);
                        
                        // Style segment pills uniquely
                        let segmentPillStyle = "bg-purple-500/10 text-purple-400";
                        if (f.segment === "Papel CRI") segmentPillStyle = "bg-blue-500/10 text-blue-400";
                        else if (f.segment === "Renda Urbana") segmentPillStyle = "bg-emerald-500/10 text-emerald-400";
                        else if (f.segment === "FIAgro") segmentPillStyle = "bg-amber-500/10 text-amber-500";
                        else if (f.segment === "Logística") segmentPillStyle = "bg-cyan-500/10 text-cyan-400";
                        else if (f.segment === "Shopping") segmentPillStyle = "bg-rose-500/10 text-rose-400";

                        // Standardized circle logos matching stock screener colors
                        let logoColor = "bg-[#a855f7]";
                        if (f.segment === "Papel CRI") logoColor = "bg-blue-600";
                        else if (f.segment === "Renda Urbana") logoColor = "bg-emerald-500";
                        else if (f.segment === "FIAgro") logoColor = "bg-amber-500";
                        else if (f.segment === "Logística") logoColor = "bg-cyan-500";
                        else if (f.segment === "Shopping") logoColor = "bg-rose-500";

                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-all">
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => toggleFavorite(f.ticker)}
                                className="text-slate-500 hover:text-amber-400 focus:outline-none transition-colors"
                              >
                                <Star className={`w-4 h-4 mx-auto ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-500"}`} />
                              </button>
                            </td>
                            
                            <td className="py-3 px-1 text-slate-400 font-sans">
                              #{idx + 1}
                            </td>

                            <td className="py-3 px-2 font-mono flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full ${logoColor} text-[8px] flex items-center justify-center font-bold text-black border border-white/10 shrink-0`}>
                                {f.ticker.slice(0, 4)}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-white text-orange-500">{f.ticker}</span>
                                <span className="text-[9px] text-slate-400 font-sans truncate max-w-[130px]">{f.name}</span>
                              </div>
                            </td>
                            
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${segmentPillStyle}`}>
                                {f.segment}
                              </span>
                            </td>

                            <td className="py-3 px-2 text-right font-medium text-white font-mono">{rFormat(f.price)}</td>
                            
                            <td className="py-3 px-2 text-right font-bold text-emerald-400 font-mono">
                              {f.divYield.toFixed(2)}%
                            </td>
                            
                            <td className={`py-3 px-2 text-right font-bold font-mono ${f.vpv < 1 ? "text-emerald-400" : "text-rose-400"}`}>
                              {f.vpv.toFixed(2)}x
                            </td>
                            
                            <td className="py-3 px-2 text-right text-slate-300 font-mono">
                              {rFormat(f.liquidity)}
                            </td>
                            
                            <td className="py-3 px-2 text-right text-slate-300 font-mono">
                              {f.propertiesCount}
                            </td>

                            <td className="py-3 px-2 text-right text-[#f43f5e] font-mono font-semibold">
                              {f.vacancy.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 14: GERENCIADOR DE ALERTAS ----------------- */}
        {activeTab === "alerts_config" && (
          <div className="space-y-6 font-mono">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Alert Creation Form on Left */}
              <div className="lg:col-span-5 bg-[#0b0b0b] border border-white/10 p-5 rounded">
                <p className="text-[10px] uppercase tracking-widest text-[#a855f7] mb-1">ALERT_CREATION_DAEMON</p>
                <h4 className="text-white text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Criar Novo Alivio / Alerta</h4>
                
                <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Ticker Ativo</label>
                    <select
                      value={newAlert.ticker}
                      onChange={(e) => setNewAlert({ ...newAlert, ticker: e.target.value })}
                      className="bg-black border border-white/10 rounded p-2 text-white"
                    >
                      {["ITUB4", "VALE3", "PETR4", "BBAS3", "BBDC4", "ABEV3"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Métrica de Gatilho</label>
                      <select
                        value={newAlert.metric}
                        onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
                        className="bg-black border border-white/10 rounded p-2 text-white"
                      >
                        <option value="Price">Preço R$</option>
                        <option value="P/L">Múltiplo P/L</option>
                        <option value="DY">Yield %</option>
                        <option value="RSI">I.F.R (RSI)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Condição de cruzamento</label>
                      <select
                        value={newAlert.condition}
                        onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                        className="bg-black border border-white/10 rounded p-2 text-white"
                      >
                        <option value="Greater than">Maior que (&gt;)</option>
                        <option value="Less than">Menor que (&lt;)</option>
                        <option value="Crosses above">Cruza Acima</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Valor de Gatilho (Target)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 32.50 ou 12.0"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                      className="bg-black border border-white/10 rounded p-2 text-white font-mono"
                    />
                  </div>

                  {/* Delivery channels config checkboxes */}
                  <div className="bg-white/5 p-3 rounded space-y-2">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Canais de Entrega de Mensagem</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-orange-500" />
                      <span>Integração Telegram Bot</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer opacity-70">
                      <input type="checkbox" className="accent-orange-500" />
                      <span>Mensagem via Email Corporativo</span>
                    </label>
                  </div>

                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase py-2 rounded text-xs transition-all tracking-wider">
                     Criar Alerta Ativo
                  </button>
                </form>
              </div>

              {/* Active Alerts List list on Right */}
              <div className="lg:col-span-7 bg-[#0b0b0b] border border-white/10 p-5 rounded flex flex-col justify-between">
                <div>
                  <h4 className="text-white text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Fila de Triggers de Alertas Ativos</h4>
                  
                  <div className="space-y-3 max-h-[340px] overflow-y-auto">
                    {alerts.map((al) => (
                      <div key={al.id} className={`p-3 bg-white/5 border rounded flex items-center justify-between text-xs transition-all ${
                        al.active ? "border-orange-500/20" : "border-white/5 opacity-55"
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{al.ticker}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{al.metric}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Gatilho: {al.condition === "Greater than" ? "Maior que" : al.condition === "Less than" ? "Menor que" : "Cruzamento de"} {al.value}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Toggle active switch button */}
                          <button
                            onClick={() => handleToggleAlert(al.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              al.active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {al.active ? "ON" : "OFF"}
                          </button>
                          
                          {/* Delete item click */}
                          <button
                            onClick={() => handleDeleteAlert(al.id)}
                            className="text-slate-500 hover:text-rose-400 transition-all outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded mt-4 text-[11px] text-slate-400 leading-normal font-mono">
                  🔥 Integrado com o Webhook de cotação em tempo real da B3. Gatilhos enviados sob execução de milissegundos.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB 15: CADERNO DE NOTAS E TESES ----------------- */}
        {activeTab === "notes_theses" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Tickers selector on left Column */}
              <div className="lg:col-span-4 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                <span className="text-[10px] text-orange-500 uppercase font-bold block mb-1">THESIS_DIRECTORY</span>
                <h4 className="text-white text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Carteira de Teses de Investimento</h4>
                
                <div className="space-y-2.5">
                  {theses.map((th) => (
                    <button
                      key={th.ticker}
                      onClick={() => {
                        setSelectedThesis(th);
                        setThesisText(th.thesisContent);
                      }}
                      className={`w-full text-left p-3 rounded border text-xs select-none transition-all flex justify-between items-center ${
                        selectedThesis.ticker === th.ticker
                          ? "border-orange-500 bg-orange-500/5"
                          : "border-white/5 hover:border-white/15 bg-white/5"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white block">{th.ticker}</span>
                        <span className="text-[10px] text-slate-500">Atualizado: {th.lastUpdated}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold block">Preço Teto {rFormat(th.fairPrice)}</span>
                        <span className="text-[10px] text-slate-400">P/L Médio: {th.currentPE}x</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rich thesis editor workspace on Right column */}
              <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h4 className="text-white text-xs uppercase tracking-widest font-bold">Edição de Estudos - {selectedThesis.ticker}</h4>
                    <button
                      onClick={handleUpdateThesis}
                      className="bg-orange-600 hover:bg-orange-500 text-black font-bold text-xs uppercase px-3 py-1.5 rounded transition-all"
                    >
                      Salvar tese de estudos
                    </button>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      value={thesisText}
                      onChange={(e) => setThesisText(e.target.value)}
                      rows={10}
                      className="w-full bg-black border border-white/10 rounded p-3 text-xs text-white outline-none focus:border-orange-500/50 leading-relaxed font-mono"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                      <div className="space-y-2">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">💎 Vetores de Alta (Catalisadores)</span>
                        <ul className="space-y-1 list-disc list-inside text-slate-400">
                          {selectedThesis.catalysts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-rose-400 uppercase font-bold block">🚨 Riscos & Contingência</span>
                        <ul className="space-y-1 list-disc list-inside text-slate-400">
                          {selectedThesis.risks.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-right mt-6">
                  Suporta marcação de parágrafo livre e vetores de risco quantificados.
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 4. Brand New Floating AI Advisor Chat Drawer - Fully Interactive */}
      <div className="fixed bottom-6 right-6 z-40">
        {isChatOpen ? (
          <div className="bg-[#0b0b0b] border border-white/15 w-[310px] sm:w-[350px] h-[420px] rounded-lg shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Advisor Chat header */}
            <div className="bg-orange-600 p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black animate-spin" />
                <span className="font-mono text-xs font-bold text-black uppercase">B3-Quant AI Advisor</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-black hover:text-black/70 font-bold outline-none text-xs uppercase"
              >
                Fechar [x]
              </button>
            </div>

            {/* Message logs scroll bar */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#050505]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded text-xs leading-normal max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-orange-600/10 border border-orange-500/25 ml-auto text-orange-200"
                      : "bg-white/5 border border-white/5 text-slate-300 mr-auto"
                  }`}
                >
                  <p className="font-sans whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="text-[10px] text-slate-500 font-mono italic animate-pulse">
                  Advisor está gerando resposta...
                </div>
              )}
            </div>

            {/* Input message form bottom fields */}
            <div className="p-2 border-t border-white/10 bg-[#0c0c0c] flex gap-2">
              <input
                type="text"
                placeholder="Questione sobre Valuation, Sharpe..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                className="flex-1 bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-500/50"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={chatLoading}
                className="bg-orange-600 hover:bg-orange-500 text-black px-3 py-1 font-bold text-xs uppercase rounded transition-all shrink-0"
              >
                Enviar
              </button>
            </div>

          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider outline-none cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Consultor AI</span>
          </button>
        )}
      </div>

      {/* 5. Figma References overlay links helper */}
      {showFigmaOverlay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-6">
          <div className="bg-[#0b0b0b] border border-white/15 w-full max-w-4xl rounded-lg p-6 space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Diretrizes das Telas de Mockups (Figma original B3-Quant)</h4>
              <button
                onClick={() => setShowFigmaOverlay(false)}
                className="text-slate-400 hover:text-white uppercase font-bold text-xs"
              >
                Voltar [x]
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Encontre abaixo links diretos de referência visual e descrição funcional de cada uma das 15 telas desenhadas no Figma. Você pode visualizar a nossa réplica interativa navegando no menu principal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              {[
                { n: "1", title: "Dashboard de Patrimônio", link: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f" },
                { n: "2", title: "Valuation Graham Bazin Gordon", link: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3" },
                { n: "3", title: "Fronteira Eficiente de Markowitz", link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71" },
                { n: "4", title: "Gerenciador de Alertas", link: "https://images.unsplash.com/photo-1551836022-d5d88e9218df" },
                { n: "5", title: "Relatório Analítico via Llama", link: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3" },
                { n: "6", title: "Comparador vs Benchmarks", link: "https://images.unsplash.com/photo-1460925895917-afdab827c52f" },
                { n: "7", title: "Análise Concorrentes e Múltiplos", link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71" },
                { n: "8", title: "Correlação Heatmap e Setores", link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71" },
                { n: "9", title: "Resumos de Mídia Notícias", link: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3" },
                { n: "10", title: "Governação CVM Scoreboard", link: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40" },
                { n: "11", title: "Dividend Yield vs Yield on Cost", link: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e" },
                { n: "12", title: "Rebalançador de Carteira", link: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f" },
                { n: "13", title: "Investments Logbook & Teses", link: "https://images.unsplash.com/photo-1517841905240-472988babdf9" },
                { n: "14", title: "Aluguel & Margem Short Simulator", link: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485" },
                { n: "15", title: "Market-Wide Sliders Screener", link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71" }
              ].map((item) => (
                <div key={item.n} className="p-3 bg-white/5 border border-white/5 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-[#a855f7] font-bold block">Tela #{item.n}</span>
                    <span className="text-white font-semibold leading-snug">{item.title}</span>
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer shadow"
                    className="mt-3 inline-flex items-center gap-1.5 text-orange-500 font-bold hover:text-orange-400 font-mono transition-all text-[11px]"
                  >
                    <span>Abrir figma de estudo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Pitch Black Minimalist Footer - Pure Geometric Aesthetic */}
      <footer className="border-t border-white/10 bg-[#050505] py-4 px-6 text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div>Painel: 51.5074° N, 0.1278° W</div>
        <div className="flex gap-4">
          <span className="text-emerald-400">● Conexão B3 Ativa</span>
          <span>©2026 B3-QUANT-FREE INTEGRATED</span>
        </div>
      </footer>

    </div>
  );
}
