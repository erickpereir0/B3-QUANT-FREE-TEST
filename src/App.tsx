/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { useB3Quant } from "./hooks/useB3Quant";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  Filter,
  Download,
  Scale,
  Smile,
  Frown,
  Meh
} from "lucide-react";

import {
  initialStockPositions,
  initialAlerts,
  initialCVMFilings,
  initialNews,
  initialCorrelation,
  initialScreenerStocks as importedScreenerStocks,
  initialScreenerFIIs as importedScreenerFIIs,
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
  CumulativeLineGraph,
  CustomRadarChart,
  Stock12mPriceHistoryChart
} from "./components/Charts";

import { InteractiveMap } from "./components/InteractiveMap";

import {
  calculateGrahamPrice,
  calculateGordonPrice,
  calculateBazinPrice,
  calculateDCF
} from "./domain/valuation";

// Custom premium tooltip component for screener metrics
const ScreenerMetricLabel: React.FC<{ label: string; tooltip: string; dark?: boolean }> = ({ label, tooltip, dark }) => {
  return (
    <div className="flex items-center gap-1 group relative inline-block">
      <span className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"} uppercase font-semibold cursor-help border-b border-dashed border-slate-500/50 hover:text-white transition-colors`}>
        {label}
      </span>
      <div className="absolute bottom-full mb-1.5 left-0 scale-90 origin-bottom opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-50 w-56 bg-[#0e0e0e] border border-white/10 p-2.5 rounded shadow-xl text-left font-mono">
        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">{label.replace(/( Mín\.| Máx\.)/g, "")}</p>
        <p className="text-[10px] text-slate-300 leading-normal font-sans normal-case">{tooltip}</p>
      </div>
    </div>
  );
};

// UTF-8 CSV exporter utility
const exportToCsv = (filename: string, header: string[], rows: any[][]) => {
  const csvContent = "\uFEFF" + [
    header.join(";"),
    ...rows.map(e => e.map(val => {
      let str = String(val === null || val === undefined ? "" : val);
      if (str.includes(";") || str.includes("\n") || str.includes('"')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(";"))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function App() {
  // Integration with Python Quant Backend
  const { fetchAssetData, loading: apiLoading } = useB3Quant();
  const [screenerStocks, setScreenerStocks] = useState(importedScreenerStocks);
  const [screenerFIIs, setScreenerFIIs] = useState(importedScreenerFIIs);
  
  // Shadow legacy variables with dynamic state lists to automatically enable real-time updates everywhere
  const initialScreenerStocks = screenerStocks;
  const initialScreenerFIIs = screenerFIIs;

  const [customTickerInput, setCustomTickerInput] = useState("");

  // Navigation State
  // Organized into 6 Main Sections, each containing the specific screens
  const [activeSegment, setActiveSegment] = useState<"overview" | "valuation" | "analysis" | "screener" | "actions" | "ai">("overview");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // App global interactive states
  const [positions, setPositions] = useState(initialStockPositions);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [theses, setTheses] = useState(initialTheses);
  const [triggeredNotifications, setTriggeredNotifications] = useState<any[]>([
    { id: "1", message: "Gatilho FII HGLG11: P/VP atingiu 1.01 (Alvo: >= 1.00)", timestamp: "Hoje às 14:32", ticker: "HGLG11" },
    { id: "2", message: "Gatilho FII VGRI11: Vacância cruzou 19.60% (Alvo: >= 15.00%)", timestamp: "Ontem às 10:15", ticker: "VGRI11" }
  ]);
  const [newAlert, setNewAlert] = useState({ ticker: "ITUB4", metric: "Price", condition: "Greater than", value: "" });
  const [tickerHistoryToShow, setTickerHistoryToShow] = useState<string | null>(null);
  const thesisReportRef = useRef<HTMLDivElement>(null);
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

  const handleAddCustomAsset = async (typedTicker: string) => {
    const cleanTicker = typedTicker.trim().toUpperCase();
    if (!cleanTicker) return;

    const isFii = cleanTicker.endsWith("11");

    // Se já existe, apenas seleciona
    if (isFii) {
      const existing = screenerFIIs.find(f => f.ticker === cleanTicker);
      if (existing) {
        const calculatedVpa = existing.vpv > 0 ? existing.price / existing.vpv : existing.price;
        const dpa = (existing.price * existing.divYield) / 100;
        setValuationParams({
          ...valuationParams,
          ticker: existing.ticker,
          lpa: 0,
          vpa: calculatedVpa,
          dpa: dpa,
          currentDividend: dpa,
          gordonGrowth: 1.5,
          gordonDiscount: 8.5,
          requiredYield: 8.0,
        });
        setPtCurrentPrice(existing.price);
        return;
      }
    } else {
      const existing = screenerStocks.find(s => s.ticker === cleanTicker);
      if (existing) {
        setValuationParams({
          ...valuationParams,
          ticker: existing.ticker,
          lpa: existing.lpa || 3.38,
          vpa: existing.vpa || 47.92,
          dpa: (existing.price * existing.divYield) / 100,
          currentDividend: (existing.price * existing.divYield) / 100,
          gordonGrowth: existing.growthRate || 3.0,
          gordonDiscount: 14.5,
          requiredYield: 6.0,
        });
        setPtCurrentPrice(existing.price);
        return;
      }
    }

    try {
      const res = await fetchAssetData(cleanTicker);
      if (res) {
        if (isFii) {
          const newFii = {
            ticker: res.ticker,
            name: res.name || `${res.ticker} FII`,
            price: res.price || 100.0,
            divYield: res.price > 0 ? ((res.dividend * 12) / res.price) * 100 : 10.0,
            vpv: res.vpa > 0 ? res.price / res.vpa : 1.0,
            liquidity: 1500000.0,
            propertiesCount: 12,
            vacancy: 5.0,
            segment: "Híbrido"
          };
          setScreenerFIIs(prev => [newFii, ...prev]);
          
          const dpa = res.dividend;
          setValuationParams({
            ...valuationParams,
            ticker: res.ticker,
            lpa: 0,
            vpa: res.vpa || 100.0,
            dpa: dpa,
            currentDividend: dpa,
            gordonGrowth: 1.5,
            gordonDiscount: 8.5,
            requiredYield: 8.0,
          });
          setPtCurrentPrice(res.price);
        } else {
          const newStock = {
            ticker: res.ticker,
            name: res.name || `${res.ticker} S.A.`,
            price: res.price || 30.0,
            pl: res.lpa > 0 ? res.price / res.lpa : 8.0,
            roe: 15.0,
            divYield: res.price > 0 ? (res.dividend / res.price) * 100 : 6.0,
            marketCap: 15.0,
            evEbitda: 5.5,
            debtEquity: 0.5,
            dlEbitda: 1.2,
            netMargin: 12.0,
            liquidity: 25000000,
            vpv: res.vpa > 0 ? res.price / res.vpa : 1.1,
            lpa: res.lpa || 3.0,
            vpa: res.vpa || 25.0,
            growthRate: res.growth_rate || 3.0,
            sector: "Consumo Cíclico",
            var12m: 10.5
          };
          setScreenerStocks(prev => [newStock, ...prev]);
          
          setValuationParams({
            ...valuationParams,
            ticker: res.ticker,
            lpa: res.lpa || 3.0,
            vpa: res.vpa || 25.0,
            dpa: res.dividend,
            currentDividend: res.dividend,
            gordonGrowth: res.growth_rate || 3.0,
            gordonDiscount: 14.5,
            requiredYield: 6.0,
          });
          setPtCurrentPrice(res.price);
        }
      }
    } catch (err) {
      console.warn("Backend indisponível, usando estimativa de fallback quantitativo para " + cleanTicker);
      const simulatedPrice = isFii ? 89.50 : 32.80;
      const simulatedLpa = isFii ? 0 : 3.10;
      const simulatedVpa = isFii ? 95.20 : 28.50;
      const simulatedDividend = isFii ? 0.82 * 12 : 2.10;
      
      if (isFii) {
        const newFii = {
          ticker: cleanTicker,
          name: `${cleanTicker} - Fundo Imobiliário`,
          price: simulatedPrice,
          divYield: (simulatedDividend / simulatedPrice) * 100,
          vpv: simulatedPrice / simulatedVpa,
          liquidity: 1200000.0,
          propertiesCount: 8,
          vacancy: 4.5,
          segment: "Tijolo / Desenvolvimento"
        };
        setScreenerFIIs(prev => [newFii, ...prev]);
        
        setValuationParams({
          ...valuationParams,
          ticker: cleanTicker,
          lpa: 0,
          vpa: simulatedVpa,
          dpa: simulatedDividend,
          currentDividend: simulatedDividend,
          gordonGrowth: 1.5,
          gordonDiscount: 8.5,
          requiredYield: 8.0,
        });
        setPtCurrentPrice(simulatedPrice);
      } else {
        const newStock = {
          ticker: cleanTicker,
          name: `${cleanTicker} Corp S.A.`,
          price: simulatedPrice,
          pl: simulatedPrice / simulatedLpa,
          roe: 14.5,
          divYield: (simulatedDividend / simulatedPrice) * 100,
          marketCap: 12.4,
          evEbitda: 4.8,
          debtEquity: 0.6,
          dlEbitda: 1.1,
          netMargin: 11.2,
          liquidity: 15000000,
          vpv: simulatedPrice / simulatedVpa,
          lpa: simulatedLpa,
          vpa: simulatedVpa,
          growthRate: 3.5,
          sector: "Financeiro",
          var12m: 12.0
        };
        setScreenerStocks(prev => [newStock, ...prev]);
        
        setValuationParams({
          ...valuationParams,
          ticker: cleanTicker,
          lpa: simulatedLpa,
          vpa: simulatedVpa,
          dpa: simulatedDividend,
          currentDividend: simulatedDividend,
          gordonGrowth: 3.5,
          gordonDiscount: 14.5,
          requiredYield: 6.0,
        });
        setPtCurrentPrice(simulatedPrice);
      }
    }
  };

  const handleScreenerAddStock = async () => {
    const cleanTicker = newScreenerStockInput.trim().toUpperCase();
    if (!cleanTicker) return;
    
    const existing = screenerStocks.find(s => s.ticker === cleanTicker);
    if (existing) {
      setStockSearch(cleanTicker);
      setNewScreenerStockInput("");
      return;
    }

    try {
      const res = await fetchAssetData(cleanTicker);
      if (res) {
        const newStock = {
          ticker: res.ticker,
          name: res.name || `${res.ticker} S.A.`,
          price: res.price || 30.0,
          pl: res.lpa > 0 ? res.price / res.lpa : 8.0,
          roe: 15.0,
          divYield: res.price > 0 ? (res.dividend / res.price) * 100 : 6.0,
          marketCap: 15.0,
          evEbitda: 5.5,
          debtEquity: 0.5,
          dlEbitda: 1.2,
          netMargin: 12.0,
          liquidity: 25000000,
          vpv: res.vpa > 0 ? res.price / res.vpa : 1.1,
          lpa: res.lpa || 3.0,
          vpa: res.vpa || 25.0,
          growthRate: res.growth_rate || 3.0,
          sector: "Materiais",
          var12m: 10.5
        };
        setScreenerStocks(prev => [newStock, ...prev]);
        setStockSearch(cleanTicker);
        setNewScreenerStockInput("");
      }
    } catch (err) {
      const newStock = {
        ticker: cleanTicker,
        name: `${cleanTicker} Corp S.A.`,
        price: 32.80,
        pl: 8.5,
        roe: 14.2,
        divYield: 6.5,
        marketCap: 12.4,
        evEbitda: 5.2,
        debtEquity: 0.45,
        dlEbitda: 1.1,
        netMargin: 10.8,
        liquidity: 15000000,
        vpv: 1.15,
        lpa: 3.10,
        vpa: 28.50,
        growthRate: 3.0,
        sector: "Materiais",
        var12m: 8.2
      };
      setScreenerStocks(prev => [newStock, ...prev]);
      setStockSearch(cleanTicker);
      setNewScreenerStockInput("");
    }
  };

  const handleScreenerAddFii = async () => {
    const cleanTicker = newScreenerFiiInput.trim().toUpperCase();
    if (!cleanTicker) return;

    const existing = screenerFIIs.find(f => f.ticker === cleanTicker);
    if (existing) {
      setFiiSearch(cleanTicker);
      setNewScreenerFiiInput("");
      return;
    }

    try {
      const res = await fetchAssetData(cleanTicker);
      if (res) {
        const newFii = {
          ticker: res.ticker,
          name: res.name || `${res.ticker} FII`,
          price: res.price || 100.0,
          divYield: res.price > 0 ? ((res.dividend * 12) / res.price) * 100 : 10.0,
          vpv: res.vpa > 0 ? res.price / res.vpa : 1.0,
          liquidity: 1500000.0,
          propertiesCount: 12,
          vacancy: 5.0,
          segment: "Híbrido"
        };
        setScreenerFIIs(prev => [newFii, ...prev]);
        setFiiSearch(cleanTicker);
        setNewScreenerFiiInput("");
      }
    } catch (err) {
      const newFii = {
        ticker: cleanTicker,
        name: `${cleanTicker} FII`,
        price: 89.50,
        divYield: 11.20,
        vpv: 0.94,
        liquidity: 950000.0,
        propertiesCount: 8,
        vacancy: 4.5,
        segment: "Híbrido"
      };
      setScreenerFIIs(prev => [newFii, ...prev]);
      setFiiSearch(cleanTicker);
      setNewScreenerFiiInput("");
    }
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
  const [newScreenerStockInput, setNewScreenerStockInput] = useState("");
  const [newScreenerFiiInput, setNewScreenerFiiInput] = useState("");
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

  // Auto-fetch stocks dynamically if searched by ticker and not yet in the state lists
  React.useEffect(() => {
    const query = stockSearch.trim().toUpperCase();
    if (/^[A-Z]{4}[0-9]{1,2}$/.test(query)) {
      const alreadyExists = screenerStocks.some(s => s.ticker === query);
      if (!alreadyExists) {
        fetchAssetData(query).then(res => {
          if (res) {
            const isFii = query.endsWith("11");
            if (isFii) {
              const newFii = {
                ticker: res.ticker,
                name: res.name || `${res.ticker} FII`,
                price: res.price || 100.0,
                divYield: res.price > 0 ? ((res.dividend * 12) / res.price) * 100 : 10.0,
                vpv: res.vpa > 0 ? res.price / res.vpa : 1.0,
                liquidity: 1500000.0,
                propertiesCount: 12,
                vacancy: 5.0,
                segment: "Híbrido"
              };
              setScreenerFIIs(prev => [newFii, ...prev]);
            } else {
              const newStock = {
                ticker: res.ticker,
                name: res.name || `${res.ticker} S.A.`,
                price: res.price || 30.0,
                pl: res.lpa > 0 ? res.price / res.lpa : 8.0,
                roe: 15.0,
                divYield: res.price > 0 ? (res.dividend / res.price) * 100 : 6.0,
                marketCap: 15.0,
                evEbitda: 5.5,
                debtEquity: 0.5,
                dlEbitda: 1.2,
                netMargin: 12.0,
                liquidity: 25000000,
                vpv: res.vpa > 0 ? res.price / res.vpa : 1.1,
                lpa: res.lpa || 3.0,
                vpa: res.vpa || 25.0,
                growthRate: res.growth_rate || 3.0,
                sector: "Outros",
                var12m: 10.5
              };
              setScreenerStocks(prev => [newStock, ...prev]);
            }
          }
        }).catch(() => {
          // Fallback static object if API fails or backend is loading
          const isFii = query.endsWith("11");
          if (isFii) {
            const newFii = {
              ticker: query,
              name: `${query} FII`,
              price: 95.0,
              divYield: 10.5,
              vpv: 0.95,
              liquidity: 1200000.0,
              propertiesCount: 10,
              vacancy: 3.5,
              segment: "Híbrido"
            };
            setScreenerFIIs(prev => [newFii, ...prev]);
          } else {
            const newStock = {
              ticker: query,
              name: `${query} S.A.`,
              price: 25.0,
              pl: 10.0,
              roe: 12.0,
              divYield: 6.5,
              marketCap: 5.0,
              evEbitda: 6.0,
              debtEquity: 0.6,
              dlEbitda: 1.5,
              netMargin: 10.0,
              liquidity: 5000000,
              vpv: 1.2,
              lpa: 2.5,
              vpa: 20.8,
              growthRate: 3.5,
              sector: "Outros",
              var12m: 5.0
            };
            setScreenerStocks(prev => [newStock, ...prev]);
          }
        });
      }
    }
  }, [stockSearch, screenerStocks, fetchAssetData]);

  // Auto-fetch FIIs dynamically if searched by ticker and not yet in the state lists
  React.useEffect(() => {
    const query = fiiSearch.trim().toUpperCase();
    if (/^[A-Z]{4}[0-9]{1,2}$/.test(query)) {
      const alreadyExists = screenerFIIs.some(f => f.ticker === query);
      if (!alreadyExists) {
        fetchAssetData(query).then(res => {
          if (res) {
            const isFii = query.endsWith("11");
            if (isFii) {
              const newFii = {
                ticker: res.ticker,
                name: res.name || `${res.ticker} FII`,
                price: res.price || 100.0,
                divYield: res.price > 0 ? ((res.dividend * 12) / res.price) * 100 : 10.0,
                vpv: res.vpa > 0 ? res.price / res.vpa : 1.0,
                liquidity: 1500000.0,
                propertiesCount: 12,
                vacancy: 5.0,
                segment: "Híbrido"
              };
              setScreenerFIIs(prev => [newFii, ...prev]);
            } else {
              const newStock = {
                ticker: res.ticker,
                name: res.name || `${res.ticker} S.A.`,
                price: res.price || 30.0,
                pl: res.lpa > 0 ? res.price / res.lpa : 8.0,
                roe: 15.0,
                divYield: res.price > 0 ? (res.dividend / res.price) * 100 : 6.0,
                marketCap: 15.0,
                evEbitda: 5.5,
                debtEquity: 0.5,
                dlEbitda: 1.2,
                netMargin: 12.0,
                liquidity: 25000000,
                vpv: res.vpa > 0 ? res.price / res.vpa : 1.1,
                lpa: res.lpa || 3.0,
                vpa: res.vpa || 25.0,
                growthRate: res.growth_rate || 3.0,
                sector: "Outros",
                var12m: 10.5
              };
              setScreenerStocks(prev => [newStock, ...prev]);
            }
          }
        }).catch(() => {
          const isFii = query.endsWith("11");
          if (isFii) {
            const newFii = {
              ticker: query,
              name: `${query} FII`,
              price: 95.0,
              divYield: 10.5,
              vpv: 0.95,
              liquidity: 1200000.0,
              propertiesCount: 10,
              vacancy: 3.5,
              segment: "Híbrido"
            };
            setScreenerFIIs(prev => [newFii, ...prev]);
          } else {
            const newStock = {
              ticker: query,
              name: `${query} S.A.`,
              price: 25.0,
              pl: 10.0,
              roe: 12.0,
              divYield: 6.5,
              marketCap: 5.0,
              evEbitda: 6.0,
              debtEquity: 0.6,
              dlEbitda: 1.5,
              netMargin: 10.0,
              liquidity: 5000000,
              vpv: 1.2,
              lpa: 2.5,
              vpa: 20.8,
              growthRate: 3.5,
              sector: "Outros",
              var12m: 5.0
            };
            setScreenerStocks(prev => [newStock, ...prev]);
          }
        });
      }
    }
  }, [fiiSearch, screenerFIIs, fetchAssetData]);

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
  const [dcf2026Profit, setDcf2026Profit] = useState<number | null>(null);

  // Crescimentos projetados por ano editáveis, inicializados com base na ação avaliada
  const [dcfProjectedGrowths, setDcfProjectedGrowths] = useState<Record<number, number>>({
    2026: 0.74,
    2027: 0.74,
    2028: 0.74,
    2029: 0.74,
    2030: 0.74
  });

  // Sincronização automática das premissas e total de ações com o Ticker ativo para garantir coerência dos valuations
  useEffect(() => {
    const isFii = valuationParams.ticker.endsWith("11");
    if (!isFii) {
      const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                    importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
      if (stock) {
        // Calcular número total de ações baseado em Market Cap e Preço Atual para ser coerente e realista
        const computedShares = Math.round((stock.marketCap * 1_000_000_000) / stock.price);
        const total = computedShares > 0 ? computedShares : 2861782000;
        // Ex-tesouraria é tipicamente muito próximo ao total (geralmente >99.9%)
        const exTreasury = Math.round(total * 0.9996);

        setDcfTotalShares(total);
        setDcfSharesExTreasury(exTreasury);
        setDcf2026Profit(null); // Resetar premissa de lucro de 2026

        // ROE coerente com duas casas decimais
        const initialRoe = parseFloat((stock.roe || 15).toFixed(2));
        setDcfRoe(initialRoe);

        // Payout coerente derivado com duas casas decimais
        const divPerShare = (stock.price * stock.divYield) / 100;
        const lpa = stock.lpa || 3.38;
        const payout = lpa > 0 ? Math.min(100, Math.max(10, (divPerShare / lpa) * 100)) : 60;
        const initialPayout = parseFloat(payout.toFixed(2));
        setDcfPayout(initialPayout);

        // Taxa de crescimento reativa (g = ROE * (1 - Payout / 100)) com duas casas decimais
        const calculatedGrowth = parseFloat((initialRoe * (1 - initialPayout / 100)).toFixed(2));
        const finalGrowth = calculatedGrowth > 0 ? calculatedGrowth : parseFloat((stock.growthRate || 5).toFixed(2));
        setDcfGrowthRate(finalGrowth);

        // Inicializar os crescimentos dos anos seguintes na tabela com a taxa de crescimento decimal
        setDcfProjectedGrowths({
          2026: finalGrowth,
          2027: finalGrowth,
          2028: finalGrowth,
          2029: finalGrowth,
          2030: finalGrowth
        });

        // Sincronizar Preço Teto Projetivo (PT) para Ações
        setPtPayout(initialPayout);
        setPtCurrentPrice(stock.price);
        setPtNumberOfShares(total);
        setPtProjectionFactor(0.0);
        
        // Lucro Projetivo Base
        const baseProfit = lpa * total;
        setPtBaseProfit(baseProfit);
        setPtProjectiveProfit(baseProfit);
      }
    } else {
      const fii = screenerFIIs.find(f => f.ticker === valuationParams.ticker) ||
                  importedScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
      if (fii) {
        setPtCurrentPrice(fii.price);
        setPtProjectionFactor(0.0);
      }
    }
  }, [valuationParams.ticker, screenerStocks, screenerFIIs]);

  // Efeito reativo para recalcular a taxa de crescimento esperada quando o analista altera o Payout ou o ROE (g = ROE * (1 - Payout/100))
  // Mantemos com duas casas decimais para maior precisão
  useEffect(() => {
    const isFii = valuationParams.ticker.endsWith("11");
    if (!isFii) {
      const calculatedGrowth = dcfRoe * (1 - dcfPayout / 100);
      // Garante uma taxa de crescimento razoável
      const finalGrowth = parseFloat(Math.max(0, calculatedGrowth).toFixed(2));
      setDcfGrowthRate(finalGrowth);
      setDcfProjectedGrowths({
        2026: finalGrowth,
        2027: finalGrowth,
        2028: finalGrowth,
        2029: finalGrowth,
        2030: finalGrowth
      });
    }
  }, [dcfPayout, dcfRoe]);

  const [dcfPerpCrescimento, setDcfPerpCrescimento] = useState(3.0);

  // Estados para o Preço Teto Projetivo baseado na imagem 2
  const [ptDesiredYield, setPtDesiredYield] = useState(7.0);
  const [ptPayout, setPtPayout] = useState(60.0);
  const [ptBaseProfit, setPtBaseProfit] = useState(4190120000);
  const [ptProjectiveProfit, setPtProjectiveProfit] = useState(4190120000);
  const [ptProjectionFactor, setPtProjectionFactor] = useState(0.0);
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

  // Add extra loaders, tooltips, compare and presets for screeners
  const [isStocksFiltering, setIsStocksFiltering] = useState(false);
  const [isFiisFiltering, setIsFiisFiltering] = useState(false);
  const [selectedCompareTickers, setSelectedCompareTickers] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [savedStockFilters, setSavedStockFilters] = useState<Array<{ name: string; filters: any }>>(() => {
    try {
      const saved = localStorage.getItem("b3_saved_stock_filters");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        name: "Graham Value Investing",
        filters: {
          vBazin: 6.00, vGraham: 22.50, vPeterLynch: 3.00,
          stockPlMin: 0.00, stockPlMax: 12.00, stockDlEbitdaMin: "", stockDlEbitdaMax: 4.00,
          stockDyMin: 4.00, stockMostrar: "Todos", stockNetMargin: 12.00, stockRoe: 12.00,
          stockLiquidity: 500000, selectedSector: "Todos", stockRankMethod: "Graham"
        }
      },
      {
        name: "Bazin Dividendos Robustos",
        filters: {
          vBazin: 6.00, vGraham: 22.50, vPeterLynch: 3.00,
          stockPlMin: 3.00, stockPlMax: 15.00, stockDlEbitdaMin: "", stockDlEbitdaMax: 5.00,
          stockDyMin: 8.00, stockMostrar: "Com Dividendos", stockNetMargin: 8.00, stockRoe: 10.00,
          stockLiquidity: 1000000, selectedSector: "Todos", stockRankMethod: "Bazin"
        }
      },
      {
        name: "Crescimento Peter Lynch",
        filters: {
          vBazin: 6.00, vGraham: 22.50, vPeterLynch: 3.00,
          stockPlMin: 5.00, stockPlMax: 25.00, stockDlEbitdaMin: "", stockDlEbitdaMax: 3.00,
          stockDyMin: 2.00, stockMostrar: "Todos", stockNetMargin: 15.00, stockRoe: 15.00,
          stockLiquidity: 1000000, selectedSector: "Todos", stockRankMethod: "Peter Lynch"
        }
      }
    ];
  });

  const [savedFiiFilters, setSavedFiiFilters] = useState<Array<{ name: string; filters: any }>>(() => {
    try {
      const saved = localStorage.getItem("b3_saved_fii_filters");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        name: "Papel Alto Rendimento",
        filters: {
          fiiDyMin: 12.00, fiiLiquidityMin: 500000, fiiVacancyMax: 5.00,
          fiiVpvMin: 0.70, fiiVpvMax: 1.05, fiiSegment: "Papel CRI", fiiMostrar: "Todos"
        }
      },
      {
        name: "Tijolo Descontado",
        filters: {
          fiiDyMin: 6.00, fiiLiquidityMin: 300000, fiiVacancyMax: 20.00,
          fiiVpvMin: 0.50, fiiVpvMax: 0.95, fiiSegment: "", fiiMostrar: "Apenas Descontados"
        }
      }
    ];
  });

  const [newStockFilterName, setNewStockFilterName] = useState("");
  const [newFiiFilterName, setNewFiiFilterName] = useState("");
  const [showSaveStockDialog, setShowSaveStockDialog] = useState(false);
  const [showSaveFiiDialog, setShowSaveFiiDialog] = useState(false);

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

    // Evaluate live triggers for FII assets
    let fired = false;
    let firedMsg = "";
    const valInput = parseFloat(newAlert.value);
    
    if (newAlert.metric === "P/VP") {
      const fii = initialScreenerFIIs.find(f => f.ticker === alertItem.ticker);
      if (fii) {
        if (alertItem.condition === "Greater than" && fii.vpv >= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: P/VP atingiu ${fii.vpv.toFixed(2)} (Alvo: >= ${valInput.toFixed(2)})`;
        } else if (alertItem.condition === "Less than" && fii.vpv <= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: P/VP de ${fii.vpv.toFixed(2)} é menor que seu alvo ${valInput.toFixed(2)}`;
        } else if (alertItem.condition === "Crosses above" && fii.vpv >= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: P/VP cruzou ${valInput.toFixed(2)} (Atual: ${fii.vpv.toFixed(2)})`;
        }
      }
    } else if (newAlert.metric === "Vacancy") {
      const fii = initialScreenerFIIs.find(f => f.ticker === alertItem.ticker);
      if (fii) {
        if (alertItem.condition === "Greater than" && fii.vacancy >= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: Vacância atingiu ${fii.vacancy.toFixed(2)}% (Alvo: >= ${valInput.toFixed(2)}%)`;
        } else if (alertItem.condition === "Less than" && fii.vacancy <= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: Vacância de ${fii.vacancy.toFixed(2)}% é menor que o patamar de ${valInput.toFixed(2)}%`;
        } else if (alertItem.condition === "Crosses above" && fii.vacancy >= valInput) {
          fired = true;
          firedMsg = `Gatilho FII ${fii.ticker}: Vacância cruzou ${valInput.toFixed(2)}% (Atual: ${fii.vacancy.toFixed(2)}%)`;
        }
      }
    }

    if (fired) {
      setTriggeredNotifications(prev => [
        {
          id: Date.now().toString() + "-fired",
          message: firedMsg,
          timestamp: "Agora mesmo",
          ticker: alertItem.ticker
        },
        ...prev
      ]);
    }

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

  const handleExportPdf = async () => {
    if (!thesisReportRef.current) return;
    try {
      const element = thesisReportRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: "#0b0b0b",
        scale: 2
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Relatorio_Tese_${selectedThesis.ticker}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao exportar PDF. Por favor tente novamente.");
    }
  };

  // CSV EXPORT ACTIONS
  const handleExportStocksCsv = () => {
    const header = [
      "Ticker", "Nome", "Preço (R$)", "Dividend Yield (%)", "P/L", 
      "Margem Líquida (%)", "ROE (%)", "DL/EBITDA", 
      "Valuation Bazin", "Valuation Graham", "Valuation Peter Lynch"
    ];
    const rows = sortedAndFilteredStocks.map(s => {
      const bazinVal = calculateBazinPrice(s.price * s.divYield / 100, vBazin);
      const grahamVal = calculateGrahamPrice(s.lpa, s.vpa, vGraham);
      const lynchVal = ((s.growthRate || 3.0) + s.divYield) / s.pl;
      return [
        s.ticker, 
        s.name, 
        rFormat(s.price), 
        s.divYield.toFixed(2) + "%",
        s.pl.toFixed(2),
        s.netMargin.toFixed(2) + "%",
        s.roe.toFixed(2) + "%",
        s.dlEbitda.toFixed(2),
        rFormat(bazinVal),
        grahamVal ? rFormat(grahamVal) : "R$ 0,00",
        lynchVal.toFixed(2)
      ];
    });
    exportToCsv("b3_screener_acoes_export.csv", header, rows);
  };

  const handleExportFiisCsv = () => {
    const header = [
      "Ticker", "Nome", "Segmento", "Preço (R$)", "Dividend Yield (%)", 
      "P/VP", "Liquidez Média (R$)", "Quantidade de Imóveis", "Vacância (%)"
    ];
    const rows = sortedAndFilteredFIIs.map(f => [
      f.ticker,
      f.name,
      f.segment,
      rFormat(f.price),
      f.divYield.toFixed(2) + "%",
      f.vpv.toFixed(2) + "x",
      rFormat(f.liquidity),
      f.propertiesCount,
      f.vacancy.toFixed(2) + "%"
    ]);
    exportToCsv("b3_screener_fiis_export.csv", header, rows);
  };

  // FILTER PERSISTENCE LOGIC WITH LOCALSTORAGE
  const handleSaveStockFilter = () => {
    if (!newStockFilterName.trim()) {
      alert("Por favor, digite um nome para o filtro.");
      return;
    }
    const currentFiltersObj = {
      vBazin, vGraham, vPeterLynch,
      stockPlMin, stockPlMax, stockDlEbitdaMin, stockDlEbitdaMax,
      stockDyMin, stockMostrar, stockNetMargin, stockRoe,
      stockLiquidity, selectedSector, stockRankMethod
    };
    const updated = [...savedStockFilters, { name: newStockFilterName, filters: currentFiltersObj }];
    setSavedStockFilters(updated);
    localStorage.setItem("b3_saved_stock_filters", JSON.stringify(updated));
    setNewStockFilterName("");
    setShowSaveStockDialog(false);
    alert(`Filtro "${newStockFilterName}" salvo com sucesso!`);
  };

  const handleLoadStockFilter = (name: string) => {
    const found = savedStockFilters.find(f => f.name === name);
    if (found) {
      const f = found.filters;
      if (f.vBazin !== undefined) setVBazin(f.vBazin);
      if (f.vGraham !== undefined) setVGraham(f.vGraham);
      if (f.vPeterLynch !== undefined) setVPeterLynch(f.vPeterLynch);
      if (f.stockPlMin !== undefined) setStockPlMin(f.stockPlMin);
      if (f.stockPlMax !== undefined) setStockPlMax(f.stockPlMax);
      if (f.stockDlEbitdaMin !== undefined) setStockDlEbitdaMin(f.stockDlEbitdaMin);
      if (f.stockDlEbitdaMax !== undefined) setStockDlEbitdaMax(f.stockDlEbitdaMax);
      if (f.stockDyMin !== undefined) setStockDyMin(f.stockDyMin);
      if (f.stockMostrar !== undefined) setStockMostrar(f.stockMostrar);
      if (f.stockNetMargin !== undefined) setStockNetMargin(f.stockNetMargin);
      if (f.stockRoe !== undefined) setStockRoe(f.stockRoe);
      if (f.stockLiquidity !== undefined) setStockLiquidity(f.stockLiquidity);
      if (f.selectedSector !== undefined) setSelectedSector(f.selectedSector);
      if (f.stockRankMethod !== undefined) setStockRankMethod(f.stockRankMethod);
      alert(`Filtro "${name}" carregado!`);
    }
  };

  const handleDeleteStockFilter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmation = confirm(`Deseja realmente remover o filtro "${name}"?`);
    if (!confirmation) return;
    const updated = savedStockFilters.filter(f => f.name !== name);
    setSavedStockFilters(updated);
    localStorage.setItem("b3_saved_stock_filters", JSON.stringify(updated));
  };

  const handleSaveFiiFilter = () => {
    if (!newFiiFilterName.trim()) {
      alert("Por favor, digite um nome para o filtro.");
      return;
    }
    const currentFiltersObj = {
      fiiDyMin, fiiLiquidityMin, fiiVacancyMax,
      fiiVpvMin, fiiVpvMax, fiiSegment, fiiMostrar
    };
    const updated = [...savedFiiFilters, { name: newFiiFilterName, filters: currentFiltersObj }];
    setSavedFiiFilters(updated);
    localStorage.setItem("b3_saved_fii_filters", JSON.stringify(updated));
    setNewFiiFilterName("");
    setShowSaveFiiDialog(false);
    alert(`Filtro "${newFiiFilterName}" salvo com sucesso!`);
  };

  const handleLoadFiiFilter = (name: string) => {
    const found = savedFiiFilters.find(f => f.name === name);
    if (found) {
      const f = found.filters;
      if (f.fiiDyMin !== undefined) setFiiDyMin(f.fiiDyMin);
      if (f.fiiLiquidityMin !== undefined) setFiiLiquidityMin(f.fiiLiquidityMin);
      if (f.fiiVacancyMax !== undefined) setFiiVacancyMax(f.fiiVacancyMax);
      if (f.fiiVpvMin !== undefined) setFiiVpvMin(f.fiiVpvMin);
      if (f.fiiVpvMax !== undefined) setFiiVpvMax(f.fiiVpvMax);
      if (f.fiiSegment !== undefined) setFiiSegment(f.fiiSegment);
      if (f.fiiMostrar !== undefined) setFiiMostrar(f.fiiMostrar);
      alert(`Filtro "${name}" carregado!`);
    }
  };

  const handleDeleteFiiFilter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmation = confirm(`Deseja realmente remover o filtro "${name}"?`);
    if (!confirmation) return;
    const updated = savedFiiFilters.filter(f => f.name !== name);
    setSavedFiiFilters(updated);
    localStorage.setItem("b3_saved_fii_filters", JSON.stringify(updated));
  };

  // Sector calculations for asset breakdown donut
  const totalNetWorth = positions.reduce((sum, p) => sum + p.totalValue, 0);

  // Format currencies helper
  const rFormat = (num: number) => num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Computed Filtered Stocks List (Drives Count, Search, Table and Comparison render)
  const sortedAndFilteredStocks = React.useMemo(() => {
    return initialScreenerStocks
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
          const valA = calculateBazinPrice(a.price * a.divYield / 100, vBazin);
          const valB = calculateBazinPrice(b.price * b.divYield / 100, vBazin);
          return valB - valA;
        } else if (stockRankMethod === "Graham") {
          const valA = calculateGrahamPrice(a.lpa, a.vpa, vGraham);
          const valB = calculateGrahamPrice(b.lpa, b.vpa, vGraham);
          return valB - valA;
        } else if (stockRankMethod === "Peter Lynch") {
          const valA = ((a.growthRate || 3.0) + a.divYield) / a.pl;
          const valB = ((b.growthRate || 3.0) + b.divYield) / b.pl;
          return valB - valA;
        } else if (stockRankMethod === "Performance 12m") {
          const valA = (a as any).var12m ?? 0;
          const valB = (b as any).var12m ?? 0;
          return valB - valA;
        } else {
          // Rank GD or Joel
          const valA = (a.roe + a.netMargin) / a.pl;
          const valB = (b.roe + b.netMargin) / b.pl;
          return valB - valA;
        }
      });
  }, [
    selectedSector, stockPlMin, stockPlMax, stockDyMin, stockNetMargin, stockRoe,
    stockLiquidity, showOnlyFavorites, favoriteTickers, stockSearch, stockDlEbitdaMin,
    stockDlEbitdaMax, stockRankMethod, vBazin, vGraham, vPeterLynch
  ]);

  // Computed Filtered FIIs List
  const sortedAndFilteredFIIs = React.useMemo(() => {
    return initialScreenerFIIs
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
      .sort((a, b) => b.divYield - a.divYield);
  }, [
    fiiDyMin, fiiLiquidityMin, fiiVacancyMax, fiiVpvMin, fiiVpvMax, fiiSegment,
    fiiMostrar, fiiSearch, showOnlyFavorites, favoriteTickers
  ]);

  const currentAssetPriceForModels = (() => {
    const stock = initialScreenerStocks.find(s => s.ticker === valuationParams.ticker);
    if (stock) return stock.price;
    const fii = initialScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
    if (fii) return fii.price;
    return 72.30;
  })();

  const precoJustoGordon = calculateGordonPrice(
    valuationParams.currentDividend,
    valuationParams.gordonGrowth,
    valuationParams.gordonDiscount
  );

  const margemSegurancaGordon = currentAssetPriceForModels > 0 
    ? ((precoJustoGordon - currentAssetPriceForModels) / currentAssetPriceForModels) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden flex flex-col justify-between">
      
      {/* 1. Figured Top Header Frame - Pure Artistic Flair */}
      <header className="border-b border-white/10 bg-[#070707] px-6 py-4 transition-all">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
      </header>

      {/* 2. Secondary Tab Bar inside the Active Segment */}
      <section className="bg-[#0b0b0b] border-b border-white/5 py-2.5 px-6">
        <div className="max-w-[1600px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
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
        </div>
      </section>

      {/* 3. Main Workspace Grid Framework */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto self-center">

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
                      <optgroup label="Ações">
                        {initialScreenerStocks.map(s => (
                          <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Fundos Imobiliários (FIIs)">
                        {initialScreenerFIIs.map(f => (
                          <option key={f.ticker} value={f.ticker}>{f.ticker} - {f.name}</option>
                        ))}
                      </optgroup>
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
            {/* Seletor de Ativo para Precificação */}
            <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">VALUATION_ASSET_LOADER</span>
                <h4 className="text-white text-xs font-bold mt-1">Carregar Dados de Ativo da B3 (Ações ou FIIs)</h4>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1 border border-white/10 rounded bg-black/50 pl-2 pr-1 py-1">
                  <input
                    type="text"
                    placeholder="Buscar qualquer Ticker (WEGE3, MXRF11...)"
                    value={customTickerInput}
                    onChange={(e) => setCustomTickerInput(e.target.value)}
                    className="bg-transparent text-xs text-white uppercase outline-none w-48 font-sans"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomAsset(customTickerInput);
                        setCustomTickerInput("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      handleAddCustomAsset(customTickerInput);
                      setCustomTickerInput("");
                    }}
                    disabled={apiLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-black text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase font-sans flex items-center gap-1"
                  >
                    {apiLoading ? "..." : "Buscar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Graham / P/VP de Equilíbrio Valuation model formula */}
              {valuationParams.ticker.endsWith("11") ? (
                /* Card para FII: P/VP de Equilíbrio */
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 mb-1">VALUATION_FII_PVP</p>
                  <h4 className="text-white font-semibold text-sm mb-4">P/VP de Equilíbrio de FII</h4>
                  
                  <div className="space-y-3.5 text-xs mb-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[10px] uppercase">Valor Patrimonial por Cota (VPC)</label>
                      <input
                        type="number"
                        value={parseFloat(valuationParams.vpa.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, vpa: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[10px] uppercase">P/VP de Equilíbrio Alvo (x)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={parseFloat((valuationParams.lpa === 0 ? 1.00 : valuationParams.lpa).toFixed(2))} // Usamos lpa temporariamente como o P/VP alvo para FIIs
                        onChange={(e) => setValuationParams({ ...valuationParams, lpa: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  {(() => {
                    const vpcVal = valuationParams.vpa;
                    const pvpAlvo = valuationParams.lpa === 0 ? 1.00 : valuationParams.lpa;
                    const precoJustoPvp = vpcVal * pvpAlvo;
                    const currentAssetPrice = (() => {
                      const fii = initialScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
                      return fii ? fii.price : 100;
                    })();
                    const margemSeguranca = currentAssetPrice > 0 ? ((precoJustoPvp - currentAssetPrice) / currentAssetPrice) * 100 : 0;

                    return (
                      <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-orange-600">
                        <div className="flex justify-between items-center text-xs">
                          <span>Preço Justo por P/VP</span>
                          <span className="text-lg font-bold text-white">
                            {rFormat(precoJustoPvp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Margem de Segurança (vs R$ {currentAssetPrice.toFixed(2)}):</span>
                          <span className={`font-bold ${margemSeguranca >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {margemSeguranca >= 0 ? "+" : ""}{margemSeguranca.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Card para Ações: Graham */
                <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 mb-1">VALUATION_GRAHAM</p>
                  <h4 className="text-white font-semibold text-sm mb-4">Ajuste de Margem de Graham</h4>
                  
                  <div className="space-y-3.5 text-xs mb-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[10px] uppercase">Lucro Por Ação (LPA)</label>
                      <input
                        type="number"
                        value={parseFloat(valuationParams.lpa.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, lpa: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[10px] uppercase">Valor Patrimonial por Ação (VPA)</label>
                      <input
                        type="number"
                        value={parseFloat(valuationParams.vpa.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, vpa: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  {(() => {
                    const currentAssetPrice = (() => {
                      const stock = initialScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                      return stock ? stock.price : 72.30;
                    })();
                    const grahamVal = calculateGrahamPrice(valuationParams.lpa, valuationParams.vpa, 22.5);
                    const margemSeguranca = currentAssetPrice > 0 ? ((grahamVal - currentAssetPrice) / currentAssetPrice) * 100 : 0;

                    return (
                      <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-orange-600">
                        <div className="flex justify-between items-center text-xs">
                          <span>Preço Justo Graham</span>
                          <span className="text-lg font-bold text-white">
                            {rFormat(grahamVal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Margem de Segurança (vs R$ {currentAssetPrice.toFixed(2)}):</span>
                          <span className={`font-bold ${margemSeguranca >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {margemSeguranca >= 0 ? "+" : ""}{margemSeguranca.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Bazin Valuation model formula */}
              <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono relative">
                <p className="text-[10px] uppercase tracking-widest text-[#a855f7] mb-1">VALUATION_BAZIN</p>
                <h4 className="text-white font-semibold text-sm mb-4">Dividendo Inteligente de Bazin</h4>
                
                <div className="space-y-3.5 text-xs mb-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Dividendo Médio do Ativo (DPA)</label>
                    <input
                      type="number"
                      value={parseFloat(valuationParams.dpa.toFixed(2))}
                      onChange={(e) => setValuationParams({ ...valuationParams, dpa: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Dividend Yield Desejado (%)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={parseFloat(valuationParams.requiredYield.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, requiredYield: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white flex-1 font-mono"
                      />
                      <span className="bg-white/5 border border-white/10 px-2 flex items-center rounded text-slate-400 font-mono">%</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const currentAssetPrice = (() => {
                    const stock = initialScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                    if (stock) return stock.price;
                    const fii = initialScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
                    if (fii) return fii.price;
                    return 72.30;
                  })();
                  const priceBazin = valuationParams.requiredYield > 0 ? (valuationParams.dpa * 100) / valuationParams.requiredYield : 0;
                  const margemSeguranca = currentAssetPrice > 0 ? ((priceBazin - currentAssetPrice) / currentAssetPrice) * 100 : 0;

                  return (
                    <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-[#a855f7]">
                      <div className="flex justify-between items-center text-xs">
                        <span>Preço Teto Decisivo</span>
                        <span className="text-lg font-bold text-white">
                          {rFormat(priceBazin)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Margem de Segurança (vs R$ {currentAssetPrice.toFixed(2)}):</span>
                        <span className={`font-bold ${margemSeguranca >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {margemSeguranca >= 0 ? "+" : ""}{margemSeguranca.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })()}
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
                      value={parseFloat(valuationParams.currentDividend.toFixed(2))}
                      onChange={(e) => setValuationParams({ ...valuationParams, currentDividend: parseFloat(e.target.value) || 0 })}
                      className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Crescimento Perpétuo (g)</label>
                      <input
                        type="number"
                        value={parseFloat(valuationParams.gordonGrowth.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, gordonGrowth: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 text-[9px] uppercase">Taxa de Desconto (k)</label>
                      <input
                        type="number"
                        value={parseFloat(valuationParams.gordonDiscount.toFixed(2))}
                        onChange={(e) => setValuationParams({ ...valuationParams, gordonDiscount: parseFloat(e.target.value) || 0 })}
                        className="bg-black border border-white/10 rounded p-1.5 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded space-y-2 border-l-2 border-[#10b981]">
                  <div className="flex justify-between items-center text-xs">
                    <span>Preço Justo de Gordon</span>
                    <span className="text-lg font-bold text-white">
                      {rFormat(precoJustoGordon)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Margem de Segurança (vs R$ {currentAssetPriceForModels.toFixed(2)}):</span>
                    <span className={`font-bold ${margemSegurancaGordon >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {margemSegurancaGordon >= 0 ? "+" : ""}{margemSegurancaGordon.toFixed(2)}%
                    </span>
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
            
            {/* Sincronização do Ticker ativo */}
            <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none">
              <div>
                <span className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">VALUATION_ASSET_SITUATIONAL_CONTEXT</span>
                <h4 className="text-white text-xs font-bold mt-1">Análise de Fluxo para o Ativo: <span className="text-orange-500 font-black">{valuationParams.ticker}</span></h4>
              </div>
              <div className="text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded px-3 py-1 text-right">
                Método Ativo: <span className="text-white font-bold">{valuationParams.ticker.endsWith("11") ? "DDM de Proventos de FII" : "DCF de Lucro Corporativo"}</span>
              </div>
            </div>

            {valuationParams.ticker.endsWith("11") ? (
              /* ========================================================================= */
              /* METODOLOGIA DDM PARA FUNDOS IMOBILIÁRIOS                                  */
              /* ========================================================================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1: Premissas de FII */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                    <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Premissas do FII</h4>
                    
                    <div className="space-y-4">
                      {/* Rendimento Mensal do FII */}
                      <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-xs text-slate-400">Rendimento Mensal por Cota</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={parseFloat((valuationParams.dpa / 12).toFixed(2))}
                            onChange={(e) => setValuationParams({ ...valuationParams, dpa: (parseFloat(e.target.value) || 0) * 12 })}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Crescimento dos Rendimentos */}
                      <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-xs text-slate-400">Crescimento Anual Esperado</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.01"
                            value={parseFloat(valuationParams.gordonGrowth.toFixed(2))}
                            onChange={(e) => setValuationParams({ ...valuationParams, gordonGrowth: parseFloat(e.target.value) || 0 })}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                          />
                          <span className="text-[11px] text-slate-500">%</span>
                        </div>
                      </div>

                      {/* Taxa de Desconto */}
                      <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Taxa de Desconto (k)</span>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                            <div className="absolute left-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[10px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10">
                              Custo de Capital Exigido para o FII. Média de mercado de FIIs é de 8,0% a 10,0% a.a.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.01"
                            value={parseFloat(valuationParams.gordonDiscount.toFixed(2))}
                            onChange={(e) => setValuationParams({ ...valuationParams, gordonDiscount: parseFloat(e.target.value) || 0 })}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none"
                          />
                          <span className="text-[11px] text-slate-500">%</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-[10px] text-slate-500 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
                      ℹ️ O DDM para FIIs avalia o valor presente do fluxo futuro de proventos mensais e anuais distribuídos pelo fundo aos seus cotistas.
                    </p>
                  </div>

                  {/* Resultados do FII */}
                  {(() => {
                    const monthlyYield = valuationParams.dpa / 12;
                    const annualBase = monthlyYield * 12;
                    const growthRate = valuationParams.gordonGrowth / 100;
                    const discountRate = valuationParams.gordonDiscount / 100;

                    let sumVP = 0;
                    const years = dcfProjectionYears === 3 ? [1, 2, 3] : [1, 2, 3, 4, 5];
                    years.forEach((y) => {
                      const projDiv = annualBase * Math.pow(1 + growthRate, y);
                      const discountFactor = Math.pow(1 + discountRate, y);
                      sumVP += projDiv / discountFactor;
                    });

                    const lastProjDiv = annualBase * Math.pow(1 + growthRate, years.length);
                    const denominator = discountRate - growthRate;
                    const perpVal = denominator > 0 ? (lastProjDiv * (1 + growthRate)) / denominator : 0;
                    const perpVPL = perpVal / Math.pow(1 + discountRate, years.length);

                    const precoJustoFii = sumVP + perpVPL;
                    const currentAssetPrice = (() => {
                      const fii = initialScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
                      return fii ? fii.price : 100;
                    })();
                    const upsidePercent = currentAssetPrice > 0 ? ((precoJustoFii - currentAssetPrice) / currentAssetPrice) * 100 : 0;

                    return (
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                        <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Preço Justo Estimado</h4>
                        
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center p-2 rounded bg-blue-900/20 border border-blue-500/20">
                            <span className="text-xs text-blue-400 font-bold">Preço Justo por Cota</span>
                            <span className="text-sm font-black text-blue-400">{rFormat(precoJustoFii)}</span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded bg-black/40 text-xs">
                            <span className="text-slate-400">Cotação Atual</span>
                            <span className="text-white font-bold">R$ {currentAssetPrice.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs">
                            <span className="text-xs text-emerald-400 font-bold">Upside / Downside</span>
                            <span className={`text-xs font-black ${upsidePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {upsidePercent >= 0 ? "+" : ""}{upsidePercent.toFixed(2)}%
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => {
                                alert(`Preço Teto do FII ${valuationParams.ticker} salvo com sucesso: ${rFormat(precoJustoFii)}`);
                              }}
                              className="flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-black text-[10px] uppercase font-bold py-2 px-3 rounded transition-all"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Salvar Teto
                            </button>
                            <button
                              onClick={() => {
                                setValuationParams({
                                  ...valuationParams,
                                  dpa: (1.10 * 12),
                                  gordonGrowth: 1.5,
                                  gordonDiscount: 8.5
                                });
                              }}
                              className="border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] uppercase font-bold py-2 px-3 rounded transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Column 2: Tabela de Projeção de Proventos FII */}
                <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-3">
                    <h4 className="text-white text-xs uppercase tracking-widest font-bold">Fluxo de Dividendos por Cota</h4>
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
                          <th className="pb-2 text-right">Rendimento Projetado (Anual)</th>
                          <th className="pb-2 text-right">Crescimento Anual</th>
                          <th className="pb-2 text-right">Valor Presente Líquido (VPL)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {/* Históricos de Exemplo */}
                        <tr className="hover:bg-white/5 text-slate-550 select-none">
                          <td className="py-2.5 font-bold text-center text-slate-500">2024</td>
                          <td className="py-2.5 text-right">{rFormat(valuationParams.dpa * 0.95)}</td>
                          <td className="py-2.5 text-right text-emerald-600/70">+1.50%</td>
                          <td className="py-2.5 text-right font-bold text-slate-600">-</td>
                        </tr>
                        <tr className="hover:bg-white/5 text-slate-550 select-none">
                          <td className="py-2.5 font-bold text-center text-slate-500">2025</td>
                          <td className="py-2.5 text-right">{rFormat(valuationParams.dpa)}</td>
                          <td className="py-2.5 text-right text-emerald-600/70">+5.26%</td>
                          <td className="py-2.5 text-right font-bold text-slate-600">-</td>
                        </tr>

                        <tr className="bg-white/5 h-0.5 border-none"><td colSpan={4}></td></tr>

                        {/* Projeções de FII */}
                        {(() => {
                          const limit = dcfProjectionYears;
                          const annualBase = valuationParams.dpa;
                          const growthRate = valuationParams.gordonGrowth / 100;
                          const discountRate = valuationParams.gordonDiscount / 100;

                          const projYears = Array.from({ length: limit }, (_, i) => i + 1);
                          return (
                            <>
                              {projYears.map((y) => {
                                const yrLabel = 2025 + y;
                                const projVal = annualBase * Math.pow(1 + growthRate, y);
                                const vpl = projVal / Math.pow(1 + discountRate, y);

                                return (
                                  <tr key={yrLabel} className="hover:bg-orange-500/5 transition-colors">
                                    <td className="py-2.5 text-center font-bold text-orange-500">{yrLabel}</td>
                                    <td className="py-2.5 text-right text-white font-bold">{rFormat(projVal)}</td>
                                    <td className="py-2.5 text-right font-medium text-emerald-400">
                                      +{valuationParams.gordonGrowth.toFixed(2)}%
                                    </td>
                                    <td className="py-2.5 text-right font-bold text-blue-400">{rFormat(vpl)}</td>
                                  </tr>
                                );
                              })}

                              {/* Perpetuidade */}
                              {(() => {
                                const lastProjDiv = annualBase * Math.pow(1 + growthRate, limit);
                                const denominator = discountRate - growthRate;
                                const perpProfitVal = denominator > 0 ? (lastProjDiv * (1 + growthRate)) / denominator : 0;
                                const perpVPL = perpProfitVal / Math.pow(1 + discountRate, limit);

                                return (
                                  <tr className="hover:bg-indigo-550/5 transition-colors bg-indigo-950/15">
                                    <td className="py-3 text-center font-bold text-indigo-400">Perpétuo</td>
                                    <td className="py-3 text-right text-indigo-300 font-bold">{rFormat(perpProfitVal)}</td>
                                    <td className="py-3 text-right text-white font-semibold">
                                      g = {valuationParams.gordonGrowth.toFixed(1)}%
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

                  <div className="mt-6 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs select-none">
                    <span>
                      💡 Modelo de precificação adequado para ativos geradores de aluguel e rendimentos imobiliários recorrentes.
                    </span>
                    <span className="font-semibold text-orange-500">B3-Quant DDM FII Model</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* METODOLOGIA DCF TRADICIONAL PARA AÇÕES CORPORATIVAS                       */
              /* ========================================================================= */
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
                            onChange={(e) => {
                              const val = e.target.value.replace(",", ".");
                              setDcfPayout(parseFloat(val) || 0);
                            }}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none font-mono"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">%</span>
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
                            onChange={(e) => {
                              const val = e.target.value.replace(",", ".");
                              setDcfRoe(parseFloat(val) || 0);
                            }}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none font-mono"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">%</span>
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
                              const val = e.target.value.replace(",", ".");
                              const newRate = parseFloat(val) || 0;
                              setDcfGrowthRate(newRate);
                              setDcfProjectedGrowths({
                                2026: newRate,
                                2027: newRate,
                                2028: newRate,
                                2029: newRate,
                                2030: newRate
                              });
                            }}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none font-mono"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">%</span>
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
                            onChange={(e) => {
                              const val = e.target.value.replace(",", ".");
                              setDcfDiscountRate(parseFloat(val) || 0);
                            }}
                            className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white text-right w-20 focus:border-orange-500 outline-none font-mono"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">%</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-[10px] text-slate-500 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
                      ℹ️ Média histórica da Selic é 11,53% (9,80% ex IR15%) para taxa de desconto semestral livre de risco.
                    </p>
                  </div>

                  {/* Panel 2: Realidade Projetada */}
                  {(() => {
                    const isFii = valuationParams.ticker.endsWith("11");
                    const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                                  importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                    const currentLpa = stock ? stock.lpa || 3.38 : 3.38;
                    const base2025Profit = currentLpa * dcfTotalShares;

                    const dcfResult = calculateDCF({
                      base2025Profit,
                      dcf2026Profit,
                      dcfProjectedGrowths,
                      dcfGrowthRate,
                      dcfDiscountRate,
                      dcfProjectionYears,
                      dcfPerpCrescimento,
                      dcfSharesExTreasury,
                    });

                    const totalValuationVal = dcfResult.totalValuationVal;
                    const precoPorAcaoVal = dcfResult.precoPorAcaoVal;

                    const currentAssetPrice = (() => {
                      const s = initialScreenerStocks.find(st => st.ticker === valuationParams.ticker);
                      return s ? s.price : 11.27;
                    })();
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
                            <span className="text-slate-300 font-bold">{dcfTotalShares.toLocaleString("pt-BR")}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Nº ações ex-tesouraria</span>
                            <span className="text-slate-300 font-bold">{dcfSharesExTreasury.toLocaleString("pt-BR")}</span>
                          </div>

                          <hr className="border-white/5 my-2" />

                          <div className="flex justify-between items-center p-2 rounded bg-blue-900/20 border border-blue-500/20">
                            <span className="text-xs text-blue-400 font-bold">Preço por ação</span>
                            <span className="text-sm font-black text-blue-400">{rFormat(precoPorAcaoVal)}</span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded bg-black/40 text-xs">
                            <span className="text-slate-400">Cotação p/ Comparação</span>
                            <span className="text-xs font-bold text-white">R$ {currentAssetPrice.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs">
                            <span className="text-xs text-emerald-400 font-bold">Upside / Downside</span>
                            <span className={`text-xs font-black ${upsidePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {upsidePercent >= 0 ? "+" : ""}{upsidePercent.toFixed(2)}%
                            </span>
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
                              Salvar Teto
                            </button>
                            <button
                              onClick={() => {
                                const isFii = valuationParams.ticker.endsWith("11");
                                if (!isFii) {
                                  const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                                                importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                                  
                                  const rawRoe = stock ? parseFloat((stock.roe || 15).toFixed(2)) : 16.75;
                                  const divPerShare = stock ? (stock.price * stock.divYield) / 100 : 0;
                                  const lpa = stock ? stock.lpa || 3.38 : 3.38;
                                  const payout = stock ? (lpa > 0 ? Math.min(100, Math.max(10, (divPerShare / lpa) * 100)) : 60) : 68.84;
                                  const rawPayout = parseFloat(payout.toFixed(2));
                                  const calculatedGrowth = parseFloat((rawRoe * (1 - rawPayout / 100)).toFixed(2));
                                  const gRate = calculatedGrowth > 0 ? calculatedGrowth : parseFloat((stock?.growthRate || 5.22).toFixed(2));

                                  setDcfPayout(rawPayout);
                                  setDcfRoe(rawRoe);
                                  setDcfGrowthRate(gRate);
                                  setDcfDiscountRate(14.50);
                                  setDcfProjectionYears(3);
                                  setDcfPerpCrescimento(3.0);
                                  setDcf2026Profit(null);
                                  setDcfProjectedGrowths({
                                    2026: gRate,
                                    2027: gRate,
                                    2028: gRate,
                                    2029: gRate,
                                    2030: gRate
                                  });
                                }
                              }}
                              className="border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-[10px] uppercase font-bold py-2 px-3 rounded transition-all font-mono"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column: Fluxo de Caixa Descontado Table */}
                <div className="lg:col-span-8 bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-3">
                    <h4 className="text-white text-xs uppercase tracking-widest font-bold font-mono">Fluxo de Caixa Descontado</h4>
                    
                    {/* Selector years */}
                    <div className="flex bg-white/5 border border-white/10 rounded p-0.5">
                      <button
                        onClick={() => setDcfProjectionYears(3)}
                        className={`text-[10px] px-3 py-1 rounded transition-all font-bold ${dcfProjectionYears === 3 ? "bg-orange-600 text-black shadow" : "text-slate-400 hover:text-white"} font-mono`}
                      >
                        3 anos
                      </button>
                      <button
                        onClick={() => setDcfProjectionYears(5)}
                        className={`text-[10px] px-3 py-1 rounded transition-all font-bold ${dcfProjectionYears === 5 ? "bg-orange-600 text-black shadow" : "text-slate-400 hover:text-white"} font-mono`}
                      >
                        5 anos
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-left text-xs font-mono min-w-[700px]">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                          <th className="pb-2 text-center w-[15%]">Ano</th>
                          <th className="pb-2 text-right w-[45%]">Lucro Líquido</th>
                          <th className="pb-2 text-right w-[20%]">Crescimento</th>
                          <th className="pb-2 text-right w-[20%]">VPL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                        
                        {/* Históricos */}
                        {(() => {
                          const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                                        importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                          const currentLpa = stock ? stock.lpa || 3.38 : 3.38;
                          const base2025Profit = currentLpa * dcfTotalShares;

                          const dcfResult = calculateDCF({
                            base2025Profit,
                            dcf2026Profit,
                            dcfProjectedGrowths,
                            dcfGrowthRate,
                            dcfDiscountRate,
                            dcfProjectionYears,
                            dcfPerpCrescimento,
                            dcfSharesExTreasury,
                          });

                          return dcfResult.historicalProfits.map(({ yr, val, pctStr }) => (
                            <tr key={yr} className="hover:bg-white/5 text-slate-500">
                              <td className="py-3 font-bold text-center text-slate-500 font-mono">{yr}</td>
                              <td className="py-3 text-right font-mono">{rFormat(val)}</td>
                              <td className={`py-3 text-right font-mono ${pctStr.startsWith("-") ? "text-rose-600/70" : "text-emerald-600/70"}`}>{pctStr}</td>
                              <td className="py-3 text-right font-bold text-slate-600 font-mono">-</td>
                            </tr>
                          ));
                        })()}

                        {/* Line break spacer */}
                        <tr className="bg-white/5 h-0.5 border-none"><td colSpan={4}></td></tr>

                        {/* Projetados */}
                        {(() => {
                          const years = [2026, 2027, 2028];
                          if (dcfProjectionYears === 5) {
                            years.push(2029, 2030);
                          }

                          const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                                        importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                          const currentLpa = stock ? stock.lpa || 3.38 : 3.38;
                          const base2025Profit = currentLpa * dcfTotalShares;

                          const dcfResult = calculateDCF({
                            base2025Profit,
                            dcf2026Profit,
                            dcfProjectedGrowths,
                            dcfGrowthRate,
                            dcfDiscountRate,
                            dcfProjectionYears,
                            dcfPerpCrescimento,
                            dcfSharesExTreasury,
                          });

                          return (
                            <>
                              {years.map((y, idx) => {
                                const value = dcfResult.projectedProfits[y] || 0;
                                const growthPct = dcfResult.projectedGrowths[y] || 0;
                                const vp = dcfResult.presentValues[y] || 0;

                                return (
                                  <tr key={y} className="hover:bg-orange-500/5 transition-colors font-mono">
                                    <td className="py-2 text-center font-bold text-orange-500 font-mono">{y}</td>
                                    <td className="py-2 text-right font-mono text-white">
                                      {y === 2026 ? (
                                        <div className="inline-flex items-center gap-1 w-full justify-end font-mono">
                                          <span className="text-[10px] text-slate-500 font-mono">R$</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={dcf2026Profit === null ? "" : parseFloat(dcf2026Profit.toFixed(2))}
                                            onChange={(e) => {
                                              const rawVal = e.target.value;
                                              if (rawVal === "") {
                                                setDcf2026Profit(null);
                                              } else {
                                                const sanitized = rawVal.replace(",", ".");
                                                const profitVal = parseFloat(sanitized) || 0;
                                                setDcf2026Profit(profitVal);
                                                const computedGrowth = ((profitVal - base2025Profit) / base2025Profit) * 100;
                                                setDcfProjectedGrowths(prev => ({
                                                  ...prev,
                                                  [2026]: computedGrowth
                                                }));
                                              }
                                            }}
                                            placeholder={(base2025Profit * (1 + (dcfProjectedGrowths[2026] ?? dcfGrowthRate) / 100)).toFixed(2)}
                                            className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-emerald-400 text-right w-36 focus:border-orange-500 outline-none font-bold font-mono"
                                          />
                                        </div>
                                      ) : (
                                        rFormat(value)
                                      )}
                                    </td>
                                    <td className="py-2 text-right font-mono">
                                      <div className="inline-flex items-center gap-1.5 w-full justify-end font-mono">
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={parseFloat(growthPct.toFixed(2))}
                                          onChange={(e) => {
                                            const rawVal = e.target.value.replace(",", ".");
                                            const numVal = parseFloat(rawVal) || 0;
                                            setDcfProjectedGrowths(prev => ({
                                              ...prev,
                                              [y]: numVal
                                            }));
                                            if (y === 2026) {
                                              setDcf2026Profit(base2025Profit * (1 + numVal / 100));
                                            }
                                          }}
                                          className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-orange-500 text-right w-24 focus:border-orange-500 outline-none font-bold font-mono"
                                        />
                                        <span className="text-[10px] text-slate-500 font-mono">%</span>
                                      </div>
                                    </td>
                                    <td className="py-2 text-right font-bold text-blue-400 font-mono">{rFormat(vp)}</td>
                                  </tr>
                                );
                              })}

                              {/* Perpetuidade */}
                              {(() => {
                                const perpProfitVal = dcfResult.perpProfitVal;
                                const perpVPL = dcfResult.perpVPL;

                                return (
                                  <tr className="hover:bg-indigo-550/5 transition-colors bg-indigo-950/15 font-mono">
                                    <td className="py-3 text-center font-bold text-indigo-400 font-mono">Perpétuo</td>
                                    <td className="py-3 text-right text-indigo-300 font-bold font-mono">{rFormat(perpProfitVal)}</td>
                                    <td className="py-2 text-right font-mono">
                                      <div className="flex items-center justify-end gap-1.5 font-bold font-mono">
                                        <button
                                          onClick={() => setDcfPerpCrescimento(prev => Math.max(0, parseFloat((prev - 0.1).toFixed(2))))}
                                          className="w-5 h-5 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-xs font-mono"
                                        >
                                          -
                                        </button>
                                        <span className="text-white text-[11px] px-1 w-10 text-center font-mono">{dcfPerpCrescimento.toFixed(1)}%</span>
                                        <button
                                          onClick={() => setDcfPerpCrescimento(prev => parseFloat((prev + 0.1).toFixed(2)))}
                                          className="w-5 h-5 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-xs font-mono"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-3 text-right font-black text-emerald-400 font-mono">{rFormat(perpVPL)}</td>
                                  </tr>
                                );
                              })()}
                            </>
                          );
                        })()}

                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs font-mono">
                    <span>
                      💡 Nota: Os crescimentos dos anos de estimativa podem ser modificados para ajustar as projeções do analista.
                    </span>
                    <span className="font-semibold text-orange-500 font-mono">B3-Quant FCDE Model</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: preco_teto_projetivo (PREÇO TETO PROJETIVO) ----------------- */}
        {activeTab === "preco_teto_projetivo" && (
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-bold font-mono">VALUATION_PROJECTIVE_PRICE_CEILING</p>
            
            {/* Seletor de Ativo para Precificação */}
            <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none">
              <div>
                <span className="text-[10px] text-orange-500 uppercase tracking-widest font-bold">VALUATION_ASSET_SITUATIONAL_CONTEXT</span>
                <h4 className="text-white text-xs font-bold mt-1">Análise de Preço Teto para o Ativo: <span className="text-orange-500 font-black">{valuationParams.ticker}</span></h4>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1 border border-white/10 rounded bg-black/50 pl-2 pr-1 py-1">
                  <input
                    type="text"
                    placeholder="Buscar qualquer Ticker (WEGE3, MXRF11...)"
                    value={customTickerInput}
                    onChange={(e) => setCustomTickerInput(e.target.value)}
                    className="bg-transparent text-xs text-white uppercase outline-none w-48 font-sans"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomAsset(customTickerInput);
                        setCustomTickerInput("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      handleAddCustomAsset(customTickerInput);
                      setCustomTickerInput("");
                    }}
                    disabled={apiLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-black text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase font-sans flex items-center gap-1"
                  >
                    {apiLoading ? "..." : "Buscar"}
                  </button>
                </div>
              </div>
            </div>

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
                  {valuationParams.ticker.endsWith("11") ? (
                    <>
                      {/* Rendimento Mensal do FII */}
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400">Rendimento Mensal por Cota</label>
                        <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded px-2 py-1">
                          <span className="text-slate-500 text-xs font-bold">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={parseFloat((valuationParams.dpa / 12).toFixed(2))}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setValuationParams({ ...valuationParams, dpa: val * 12 });
                            }}
                            className="bg-transparent text-white text-xs font-bold w-full focus:outline-none"
                          />
                        </div>
                      </div>

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
                              }}
                              className="bg-transparent text-white text-sm font-bold text-center w-full focus:outline-none"
                            />
                            <span className="text-slate-500 font-bold">%</span>
                          </div>
                          <span className="text-xs text-slate-400 text-right">Yield Alvo</span>
                        </div>
                      </div>

                      {/* Projeção (Growth factor) */}
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400">Projeção de Crescimento do FII</label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-black border border-white/10 rounded p-1 w-[120px] justify-between">
                            <button
                              onClick={() => {
                                const val = parseFloat((ptProjectionFactor - 0.25).toFixed(2));
                                setPtProjectionFactor(val);
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
                              }}
                              className="w-6 h-6 bg-white/5 rounded hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-slate-400 text-right">Crescimento</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                        <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded px-2 py-1 font-mono">
                          <span className="text-slate-500 text-xs font-bold">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={ptProjectiveProfit === 0 ? "" : ptProjectiveProfit}
                            onChange={(e) => {
                              const rawVal = e.target.value.replace(",", ".");
                              const val = parseFloat(rawVal) || 0;
                              setPtProjectiveProfit(val);
                              setPtBaseProfit(val / (1 + ptProjectionFactor / 100));
                            }}
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
                                setPtProjectiveProfit(ptBaseProfit * (1 + val / 100));
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
                                setPtProjectiveProfit(ptBaseProfit * (1 + val / 100));
                              }}
                              className="w-6 h-6 bg-white/5 rounded hover:bg-white/10 text-slate-300 flex items-center justify-center font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-slate-400 text-right">Crescimento</span>
                        </div>
                      </div>
                    </>
                  )}
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
                      setPtDesiredYield(6.0); // Padrão Bazin para Yield desejado
                      setPtProjectionFactor(0.0);
                      
                      const isFii = valuationParams.ticker.endsWith("11");
                      if (!isFii) {
                        const stock = screenerStocks.find(s => s.ticker === valuationParams.ticker) ||
                                      importedScreenerStocks.find(s => s.ticker === valuationParams.ticker);
                        if (stock) {
                          const computedShares = Math.round((stock.marketCap * 1_000_000_000) / stock.price);
                          const total = computedShares > 0 ? computedShares : 2861782000;
                          
                          const divPerShare = (stock.price * stock.divYield) / 100;
                          const lpa = stock.lpa || 3.38;
                          const payout = lpa > 0 ? Math.min(100, Math.max(10, (divPerShare / lpa) * 100)) : 60;
                          const initialPayout = parseFloat(payout.toFixed(2));
                          
                          const baseProfit = lpa * total;

                          setPtPayout(initialPayout);
                          setPtCurrentPrice(stock.price);
                          setPtNumberOfShares(total);
                          setPtBaseProfit(baseProfit);
                          setPtProjectiveProfit(baseProfit);
                        }
                      } else {
                        const fii = screenerFIIs.find(f => f.ticker === valuationParams.ticker) ||
                                    importedScreenerFIIs.find(f => f.ticker === valuationParams.ticker);
                        if (fii) {
                          setPtCurrentPrice(fii.price);
                        }
                      }
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
                  const isFii = valuationParams.ticker.endsWith("11");
                  let dpaProjetivoVal = 0;
                  let precoTetoVal = 0;
                  let yieldProjetivoVal = 0;
                  let margemSegurancaVal = 0;

                  if (isFii) {
                    dpaProjetivoVal = valuationParams.dpa * (1 + ptProjectionFactor / 100);
                    precoTetoVal = dpaProjetivoVal / (ptDesiredYield / 100);
                    yieldProjetivoVal = (dpaProjetivoVal / ptCurrentPrice) * 100;
                    margemSegurancaVal = ((precoTetoVal - ptCurrentPrice) / ptCurrentPrice) * 100;
                  } else {
                    const totalProjectedDividends = ptProjectiveProfit * (ptPayout / 100);
                    dpaProjetivoVal = totalProjectedDividends / ptNumberOfShares;
                    precoTetoVal = dpaProjetivoVal / (ptDesiredYield / 100);
                    yieldProjetivoVal = (dpaProjetivoVal / ptCurrentPrice) * 100;
                    margemSegurancaVal = ((precoTetoVal - ptCurrentPrice) / ptCurrentPrice) * 100;
                  }

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

                      {/* CARD 2: RECURSO PROJETIVO (NÚMERO DE PAPÉIS OU RENDIMENTO MENSAL) */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        {isFii ? (
                          <>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Rend. Mensal Estimado</span>
                              <div className="group relative">
                                <Info className="w-3.5 h-3.5 text-slate-600 hover:text-white cursor-pointer" />
                                <div className="absolute right-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[9px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10 font-sans leading-relaxed">
                                  Projeção do rendimento mensal distribuído por cada cota do FII.
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-black text-white">{rFormat(dpaProjetivoVal / 12)}</p>
                              <span className="text-[9px] text-slate-500 uppercase block pl-1">Por cota</span>
                            </div>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>

                      {/* CARD 3: PREÇO TETO */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative border-l-2 border-orange-500">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-orange-400 tracking-wider font-bold">Preço Teto</span>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-600 hover:text-white cursor-pointer" />
                            <div className="absolute right-0 bottom-full mb-1 p-2 bg-black border border-white/10 text-[9px] text-slate-300 rounded shadow-xl hidden group-hover:block w-48 z-10 font-sans leading-relaxed">
                              Preço máximo de compra aceitável para garantir o retorno anual (yield alvo) desejado.
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-white">{rFormat(precoTetoVal)}</p>
                          <span className="text-[9px] text-slate-400 uppercase">Preço Máximo de Entrada</span>
                        </div>
                      </div>

                      {/* CARD 4: DPA (PROJETIVO) */}
                      <div className="bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono flex flex-col justify-between relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider">{isFii ? "Rendimento Anual" : "DPA (Projetivo)"}</span>
                          <Info className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-white">{rFormat(dpaProjetivoVal)}</p>
                          <span className="text-[9px] text-slate-500 uppercase">{isFii ? "Rendimento por Cota Projetado" : "Dividendo por Ação Estimado"}</span>
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
                          <span className="text-[9px] text-slate-500 uppercase">Diferença para o Preço Teto</span>
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
                    <ScreenerMetricLabel label="Taxa Bazin" tooltip="Estima o preço teto para obter rendimento projetado com base em proventos históricos (Método de Décio Bazin)." />
                    <input
                      type="number"
                      step="0.1"
                      value={vBazin}
                      onChange={(e) => setVBazin(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-1 font-sans font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                    <ScreenerMetricLabel label="Taxa Graham" tooltip="Estima o valor justo teórico intrínseco baseado no lucro (LPA) e valor patrimonial (VPA) com multiplicador limite de 22.5." />
                    <input
                      type="number"
                      step="0.1"
                      value={vGraham}
                      onChange={(e) => setVGraham(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-1 font-sans font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                    <ScreenerMetricLabel label="Taxa Peter Lynch" tooltip="Preço teto que avalia se a ação está barata considerando crescimento de lucros e dividendos relativos ao P/L." />
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
                  <ScreenerMetricLabel label="P/L Mín." tooltip="Limite mínimo para a relação entre Preço e Lucro por Ação. Evita distorções de lucro negativo." />
                  <input
                    type="number"
                    step="0.5"
                    value={stockPlMin}
                    onChange={(e) => setStockPlMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="P/L Máx." tooltip="Limite máximo de Preço/Lucro. Evita comprar empresas caras em relação à capacidade atual de gerar lucro." />
                  <input
                    type="number"
                    step="0.5"
                    value={stockPlMax}
                    onChange={(e) => setStockPlMax(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="DL/EBITDA Mín." tooltip="Limite mínimo de endividamento operacional (Dívida Líquida / EBITDA)." />
                  <input
                    type="text"
                    placeholder="DL/EBITDA Mínimo"
                    value={stockDlEbitdaMin}
                    onChange={(e) => setStockDlEbitdaMin(e.target.value)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans placeholder-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="DL/EBITDA Máx." tooltip="Teto aceitável de endividamento da empresa medido em múltiplos de geração de caixa operacional anual (EBITDA)." />
                  <input
                    type="number"
                    step="0.5"
                    value={stockDlEbitdaMax}
                    onChange={(e) => setStockDlEbitdaMax(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="Dividend Yield Mín." tooltip="A taxa percentual mínima de retorno em dividendos em relação à cotação atual da ação nos últimos 12 meses." />
                  <input
                    type="number"
                    step="0.5"
                    value={stockDyMin}
                    onChange={(e) => setStockDyMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="Mostrar" tooltip="Permite filtrar e exibir de forma segmentada apenas certos perfis de empresas selecionados secundariamente." />
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
                    <ScreenerMetricLabel label="Margem Líquida (%)" tooltip="Percentual de cada real de receita que sobra como lucro líquido após todas as despesas e impostos operacionais." dark={true} />
                    <input
                      type="number"
                      step="0.5"
                      value={stockNetMargin}
                      onChange={(e) => setStockNetMargin(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black/60 border border-white/5 p-2 rounded-lg">
                    <ScreenerMetricLabel label="ROE (%)" tooltip="Retorno sobre o Patrimônio Líquido. Mede a eficiência no uso do capital próprio para gerar lucros reais." dark={true} />
                    <input
                      type="number"
                      step="0.5"
                      value={stockRoe}
                      onChange={(e) => setStockRoe(parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none text-white text-xs outline-none p-1 font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1 bg-black/60 border border-white/5 p-2 rounded-lg">
                    <ScreenerMetricLabel label="Liquidez Mín. (R$)" tooltip="Média diária negociada na bolsa. Garante facilidade para entrar ou sair de posições volumosas." dark={true} />
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
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setIsStocksFiltering(true);
                      setTimeout(() => setIsStocksFiltering(false), 700);
                    }}
                    className="bg-[#0284c7] hover:bg-sky-600 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar</span>
                  </button>
                  
                  {/* Save current filters */}
                  <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded-lg px-2 py-1 text-slate-300">
                    <span className="text-[9px] uppercase px-1 text-slate-500 font-bold">Filtros Salvos</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleLoadStockFilter(e.target.value);
                      }}
                      className="bg-transparent border-none text-white text-[11px] outline-none cursor-pointer focus:ring-0 py-0.5 font-sans max-w-[120px]"
                      value=""
                    >
                      <option value="">Selecione...</option>
                      {savedStockFilters.map(f => (
                        <option key={f.name} value={f.name} className="bg-[#111]">{f.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowSaveStockDialog(true)}
                      className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-white/5 rounded transition-all"
                      title="Salvar Filtro Atual"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleResetStockFilters}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white font-sans text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
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
                    <option value="Performance 12m">Performance 12m</option>
                  </select>

                  <button
                    onClick={handleExportStocksCsv}
                    className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-sans text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Exportar dados para CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>

                {/* Quantitative results summary counter */}
                <span className="text-xs text-slate-400 font-sans tracking-wide">
                  Mostrando <strong className="text-[#0284c7] font-extrabold">{sortedAndFilteredStocks.length}</strong> de <strong className="text-white font-bold">{initialScreenerStocks.length}</strong> Ações
                </span>
              </div>

              {/* Research live Search Bar */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por ticker ou nome (ex: VALE3, WEGE3... Digite qualquer ticker da B3 para carregar na tabela)"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500/50 uppercase"
                />
                {apiLoading && stockSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 text-[10px] font-mono">
                    Carregando dados da B3...
                  </div>
                )}
              </div>

              {/* High precision Stocks Table */}
              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 bg-white/5 select-none">
                      <th className="py-3 px-3 w-10 text-center">Fav</th>
                      <th className="py-3 px-3 w-10 text-center text-orange-400" title="Selecionar para comparação direta Lado a Lado">Comp</th>
                      <th className="py-3 px-1">Rank</th>
                      <th className="py-3 px-2">Ticker</th>
                      <th className="py-3 px-2 text-right">Cotação</th>
                      <th className="py-3 px-2 text-right text-cyan-400 font-bold" title="Variação de Preço nos últimos 12 meses">Var. 12m</th>
                      <th className="py-3 px-2 text-right">Dividend Yield</th>
                      <th className="py-3 px-2 text-right">P/L</th>
                      <th className="py-3 px-2 text-right">Margem Líquida</th>
                      <th className="py-3 px-2 text-right">ROE</th>
                      <th className="py-3 px-2 text-right">DL/EBITDA</th>
                      <th className="py-3 px-2 text-center text-[#c084fc] font-bold" title="Score de sentimento das notícias gerado por IA">IA Score</th>
                      
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
                      <th className="py-3 px-2 text-center text-indigo-400 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isStocksFiltering ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`sk-${i}`} className="animate-pulse bg-white/[0.01]">
                          <td className="py-4 px-3"><div className="h-3.5 w-3.5 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-3"><div className="h-3.5 w-3.5 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-1"><div className="h-3.5 w-6 bg-white/10 rounded"></div></td>
                          <td className="py-4 px-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10"></div>
                            <div className="flex flex-col gap-1">
                              <div className="h-3 w-10 bg-white/10 rounded"></div>
                              <div className="h-2 w-14 bg-white/10 rounded"></div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-12 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-10 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-10 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-8 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-12 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-12 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-8 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-center"><div className="h-3 w-10 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-3 bg-amber-500/5 border-l border-white/5"><div className="h-3.5 w-16 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-3 bg-blue-500/5 border-l border-white/5"><div className="h-3.5 w-16 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-3 bg-purple-500/5 border-l border-white/5"><div className="h-3.5 w-16 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-3 bg-rose-500/5 border-l border border-r border-white/5"><div className="h-3.5 w-16 bg-[#fff5f5]/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-2 text-center"><div className="h-3.5 w-16 bg-white/10 rounded mx-auto"></div></td>
                        </tr>
                      ))
                    ) : sortedAndFilteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="py-8 text-center text-slate-500 font-sans">
                          Nenhuma ação encontrada para os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredStocks.map((s, idx) => {
                        const isFav = favoriteTickers.includes(s.ticker);
                        
                        // Compute calculations dynamically for live response
                        const bazinVal = calculateBazinPrice(s.price * s.divYield / 100, vBazin);
                        const grahamVal = calculateGrahamPrice(s.lpa, s.vpa, vGraham);
                        const lynchVal = ((s.growthRate || 3.0) + s.divYield) / s.pl;
                        const joelScoreVal = (s.roe + s.netMargin) / (s.pl * 25) * 0.1;

                        // Logo color
                        let logoColor = "bg-emerald-500";
                        if (s.ticker === "CMIN3") logoColor = "bg-blue-600";
                        else if (s.ticker === "ISAE4") logoColor = "bg-cyan-500";
                        else if (s.ticker === "VALE3") logoColor = "bg-[#a855f7]";

                        return (
                          <React.Fragment key={idx}>
                            <tr className="hover:bg-white/5 transition-all">
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => toggleFavorite(s.ticker)}
                                  className="text-slate-500 hover:text-amber-400 focus:outline-none transition-colors"
                                >
                                  <Star className={`w-4 h-4 mx-auto ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-500"}`} />
                                </button>
                              </td>

                              <td className="py-2 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedCompareTickers.includes(s.ticker)}
                                  disabled={!selectedCompareTickers.includes(s.ticker) && selectedCompareTickers.length >= 3}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCompareTickers(prev => [...prev, s.ticker]);
                                    } else {
                                      setSelectedCompareTickers(prev => prev.filter(t => t !== s.ticker));
                                    }
                                  }}
                                  className="rounded-sm bg-black border-white/20 text-[#a855f7] focus:ring-0 cursor-pointer"
                                />
                              </td>
                              
                              <td className="py-3 px-1 text-slate-400 font-sans">
                                #{idx + 1}
                              </td>
                              
                              <td 
                                onClick={() => setTickerHistoryToShow(tickerHistoryToShow === s.ticker ? null : s.ticker)}
                                className="py-3 px-2 font-mono flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded transition-all group"
                                title="Clique para ver o gráfico de histórico de preço de 12 meses"
                              >
                                <div className={`w-5 h-5 rounded-full ${logoColor} text-[8px] flex items-center justify-center font-bold text-black border border-white/10 shrink-0`}>
                                  {s.ticker.slice(0, 3)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-white text-orange-500 group-hover:underline flex items-center gap-1">
                                    {s.ticker}
                                    <span className="text-[9px] text-slate-500 font-sans group-hover:text-amber-400">📊</span>
                                  </span>
                                  <span className="text-[9px] text-slate-450 font-sans truncate max-w-[110px]">{s.name}</span>
                                </div>
                              </td>

                              <td className="py-3 px-2 text-right font-bold text-white font-mono">{rFormat(s.price)}</td>
                              <td className={`py-3 px-2 text-right font-mono font-bold ${((s as any).var12m || 0) >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                                {((s as any).var12m || 0) >= 0 ? "+" : ""}{((s as any).var12m || 0).toFixed(2)}%
                              </td>
                              <td className="py-3 px-2 text-right text-emerald-400 font-mono font-bold">{s.divYield.toFixed(2)}%</td>
                              <td className="py-3 px-2 text-right text-orange-500 font-mono">{s.pl.toFixed(2)}</td>
                              <td className="py-3 px-2 text-right text-slate-300 font-mono">{s.netMargin.toFixed(2)}%</td>
                              <td className="py-3 px-2 text-right text-emerald-400 font-mono">{s.roe.toFixed(2)}%</td>
                              <td className="py-3 px-2 text-right text-slate-300 font-mono">{s.dlEbitda.toFixed(2)}</td>
                              
                              {/* Sentiment column via custom icons */}
                              {(() => {
                                const tickerNews = newsList.filter(n => n.ticker === s.ticker);
                                let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
                                if (tickerNews.length > 0) {
                                  const positives = tickerNews.filter(n => n.sentiment === "Positive").length;
                                  const negatives = tickerNews.filter(n => n.sentiment === "Negative").length;
                                  if (positives > negatives) sentiment = "Positive";
                                  else if (negatives > positives) sentiment = "Negative";
                                } else {
                                  const fallbackSentiments: Record<string, "Positive" | "Neutral" | "Negative"> = {
                                    CMIG4: "Positive",
                                    CMIN3: "Positive",
                                    ISAE4: "Neutral",
                                    WEGE3: "Positive",
                                    JBSS3: "Positive",
                                    BBDC4: "Neutral",
                                    ABEV3: "Negative"
                                  };
                                  sentiment = fallbackSentiments[s.ticker] || "Neutral";
                                }

                                const sentimentStyles = {
                                  Positive: { icon: Smile, text: "Positivo", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                                  Neutral: { icon: Meh, text: "Neutro", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                                  Negative: { icon: Frown, text: "Negativo", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
                                }[sentiment];

                                const SentimentIcon = sentimentStyles.icon;

                                return (
                                  <td className="py-3 px-2 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${sentimentStyles.color}`}>
                                      <SentimentIcon className="w-3 h-3 shrink-0" />
                                      <span>{sentimentStyles.text}</span>
                                    </span>
                                  </td>
                                );
                              })()}

                              {/* Calculation cell highlights matching the image color tones */}
                              <td className="py-3 px-3 text-center bg-amber-500/5 border-l border-white/5">
                                <span className="font-bold text-amber-300 font-mono">{rFormat(bazinVal)}</span>
                                {(() => {
                                  const bazinSafety = bazinVal > 0 ? ((bazinVal - s.price) / bazinVal) * 100 : 0;
                                  return (
                                    <div className="mt-1 w-24 mx-auto flex flex-col gap-0.5">
                                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-300 ${bazinSafety > 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                                          style={{ width: `${Math.max(2, Math.min(Math.abs(bazinSafety), 100))}%` }}
                                        />
                                      </div>
                                      <span className={`text-[8.5px] font-mono block leading-none text-center ${bazinSafety > 0 ? "text-emerald-400 font-bold" : "text-rose-400"}`}>
                                        MS: {bazinSafety > 0 ? "+" : ""}{bazinSafety.toFixed(0)}%
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-3 text-center bg-blue-500/5 border-l border-white/5">
                                <span className="font-bold text-blue-300 font-mono">{grahamVal ? rFormat(grahamVal) : "R$ 0,00"}</span>
                                {(() => {
                                  const grahamSafety = grahamVal > 0 ? ((grahamVal - s.price) / grahamVal) * 100 : 0;
                                  return (
                                    <div className="mt-1 w-24 mx-auto flex flex-col gap-0.5">
                                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-300 ${grahamSafety > 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                                          style={{ width: `${Math.max(2, Math.min(Math.abs(grahamSafety), 100))}%` }}
                                        />
                                      </div>
                                      <span className={`text-[8.5px] font-mono block leading-none text-center ${grahamSafety > 0 ? "text-emerald-400 font-bold" : "text-rose-400"}`}>
                                        MS: {grahamSafety > 0 ? "+" : ""}{grahamSafety.toFixed(0)}%
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-purple-300 bg-purple-500/5 font-mono border-l border-white/5">
                                {lynchVal.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-rose-300 bg-rose-500/5 font-mono border-l border border-r border-white/5">
                                {joelScoreVal.toFixed(2)}%
                              </td>
                              
                              {/* Criar Alerta Action Column */}
                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => {
                                    setNewAlert({ ticker: s.ticker, metric: "Price", condition: "Greater than", value: String(Math.round(s.price * 1.1)) });
                                    setActiveTab("alerts_config");
                                  }}
                                  className="bg-indigo-600/10 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 font-bold text-[10px] px-2 py-1 rounded transition-all flex items-center gap-1 mx-auto"
                                  title={`Criar alerta de preço para ${s.ticker}`}
                                >
                                  <Bell className="w-3 h-3 shrink-0" />
                                  <span>Criar Alerta</span>
                                </button>
                              </td>
                            </tr>

                            {/* Collapse 12-Month Price History Chart Row */}
                            {tickerHistoryToShow === s.ticker && (
                              <tr className="bg-black/60">
                                <td colSpan={17} className="p-4 border-b border-white/10">
                                  <div className="max-w-4xl mx-auto">
                                    <Stock12mPriceHistoryChart 
                                      ticker={s.ticker} 
                                      currentPrice={s.price} 
                                      var12m={((s as any).var12m || 0)} 
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
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
                  <ScreenerMetricLabel label="Dividend Yield Mín." tooltip="A taxa de retorno anual esperada em proventos pagos pelo Fundo Imobiliário nos últimos 12 meses." />
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
                  <ScreenerMetricLabel label="Liquidez Mín." tooltip="Volume financeiro mínimo negociado por dia útil na Bolsa. Garante facilidade para negociações sem spread alto." />
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
                  <ScreenerMetricLabel label="Vacância Máx." tooltip="Percentual máximo aceitável de espaço não locado (vago) nos imóveis (portfólio físico) do Fundo Imobiliário." />
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
                  <ScreenerMetricLabel label="P/VP Mín." tooltip="Limite mínimo de Preço sobre Valor Patrimonial. Pode sinalizar fundos extremamente baratos ou com problemas graves." />
                  <input
                    type="number"
                    step="0.05"
                    value={fiiVpvMin}
                    onChange={(e) => setFiiVpvMin(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-white text-xs outline-none p-0.5 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-black border border-white/5 p-2 rounded-lg">
                  <ScreenerMetricLabel label="P/VP Máx." tooltip="Limite máximo do indicador Preço sobre Valor Patrimonial para evitar pagar caro em ágios desproporcionais." />
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
                  <ScreenerMetricLabel label="Segmento" tooltip="Especialidade do portfólio de imóveis ou recebíveis (Lajes Corporativas, Papel CRI, Logística, Shoppings, etc.)." />
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
                  <ScreenerMetricLabel label="Mostrar" tooltip="Filtros predefinidos rápidos (como Método 2em1 de dividendos altos com desconto patrimonial P/VP < 1.00)." />
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
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setIsFiisFiltering(true);
                      setTimeout(() => setIsFiisFiltering(false), 700);
                    }}
                    className="bg-[#0284c7] hover:bg-sky-600 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar</span>
                  </button>
                  
                  {/* Save current filters */}
                  <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded-lg px-2 py-1 text-slate-300">
                    <span className="text-[9px] uppercase px-1 text-slate-500 font-bold">Filtros Salvos</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleLoadFiiFilter(e.target.value);
                      }}
                      className="bg-transparent border-none text-white text-[11px] outline-none cursor-pointer focus:ring-0 py-0.5 font-sans max-w-[120px]"
                      value=""
                    >
                      <option value="">Selecione...</option>
                      {savedFiiFilters.map(f => (
                        <option key={f.name} value={f.name} className="bg-[#111]">{f.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowSaveFiiDialog(true)}
                      className="text-purple-400 hover:text-purple-300 p-1 hover:bg-white/5 rounded transition-all"
                      title="Salvar Filtro de FII Atual"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleResetFiiFilters}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white font-sans text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
                  </button>

                  <button
                    onClick={handleExportFiisCsv}
                    className="bg-purple-500/15 hover:bg-purple-500/25 text-[#a855f7] border border-purple-500/20 font-sans text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Exportar dados para CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>

                {/* Dyn counter of FIIs results */}
                <span className="text-xs text-slate-400 font-sans tracking-wide font-medium">
                  Mostrando <strong className="text-[#a855f7] font-extrabold">{sortedAndFilteredFIIs.length}</strong> de <strong className="text-white font-bold">{initialScreenerFIIs.length}</strong> FIIs
                </span>
              </div>

              {/* FII Live Research Input and Add dynamic ticker box */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por ticker ou nome (ex: MXRF11, HGLG11... Digite qualquer ticker da B3 para carregar na tabela)"
                  value={fiiSearch}
                  onChange={(e) => setFiiSearch(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#a855f7]/50 uppercase"
                />
                {apiLoading && fiiSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 text-[10px] font-mono">
                    Carregando dados da B3...
                  </div>
                )}
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
                    {isFiisFiltering ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`fii-sk-${i}`} className="animate-pulse bg-white/[0.01]">
                          <td className="py-4 px-3"><div className="h-3.5 w-3.5 bg-white/10 rounded mx-auto"></div></td>
                          <td className="py-4 px-1"><div className="h-3.5 w-6 bg-white/10 rounded"></div></td>
                          <td className="py-4 px-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10"></div>
                            <div className="flex flex-col gap-1">
                              <div className="h-3 w-12 bg-white/10 rounded"></div>
                              <div className="h-2 w-16 bg-white/10 rounded"></div>
                            </div>
                          </td>
                          <td className="py-4 px-2"><div className="h-3 w-16 bg-white/10 rounded"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-12 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-10 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-8 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-16 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-6 bg-white/10 rounded ml-auto"></div></td>
                          <td className="py-4 px-2 text-right"><div className="h-3 w-8 bg-white/10 rounded ml-auto"></div></td>
                        </tr>
                      ))
                    ) : sortedAndFilteredFIIs.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                          Nenhum fundo imobiliário encontrado para os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredFIIs.map((f, idx) => {
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
                      })
                    )}
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
                      <optgroup label="Ações">
                        {["ITUB4", "VALE3", "PETR4", "BBAS3", "BBDC4", "ABEV3"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Fundos Imobiliários (FIIs)">
                        {["VGRI11", "KIVO11", "RBVA11", "AAZQ11", "TRBL11", "HABT11", "RURA11", "EGAF11", "KNIP11", "HGLG11", "XPML11", "KNCR11", "HGRE11"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
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
                        <option value="P/VP">FII - P/VP</option>
                        <option value="Vacancy">FII - Vacância %</option>
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

                  {/* Visual Notifications Panel */}
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h5 className="text-[10px] uppercase tracking-wider font-mono">Histórico de Disparos / Painel de Notificações</h5>
                      </div>
                      {triggeredNotifications.length > 0 && (
                        <button 
                          onClick={() => setTriggeredNotifications([])} 
                          className="text-[10px] text-rose-500 hover:text-rose-400 hover:underline cursor-pointer font-sans"
                        >
                          Limpar Tudo
                        </button>
                      )}
                    </div>
                    {triggeredNotifications.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-2 font-sans">
                        Nenhum alerta disparado recentemente. Sistema monitorando em tempo real...
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {triggeredNotifications.map((n) => (
                          <div key={n.id} className="p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded flex items-start justify-between gap-2.5 text-[11px] font-sans">
                            <div className="flex items-start gap-2">
                              <span className="bg-red-500/10 text-red-400 px-1 py-0.5 rounded text-[8px] font-mono font-bold shrink-0">DISPARADO</span>
                              <div className="space-y-0.5">
                                <p className="text-white font-medium leading-tight">{n.message}</p>
                                <span className="text-[9px] text-slate-500 font-mono block">{n.timestamp}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setTriggeredNotifications(prev => prev.filter(item => item.id !== n.id))}
                              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-xs leading-none"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUpdateThesis}
                        className="bg-orange-600 hover:bg-orange-500 text-black font-bold text-xs uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
                      >
                        Salvar Tese
                      </button>
                      <button
                        onClick={handleExportPdf}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Exportar Relatório e Tese em PDF formatado"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Wrapper container for PDF rendering */}
                  <div ref={thesisReportRef} className="p-4 bg-[#0b0b0b] rounded-lg border border-white/5 space-y-4">
                    <div className="border-b border-white/10 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-orange-500 font-bold">B3-Quant IA Investment Report</p>
                          <h3 className="text-white text-base font-bold uppercase">Relatório de Análise Técnica & Fundamentalista</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-white/5 px-2..5 py-1 rounded font-mono font-bold text-cyan-400">{selectedThesis.ticker}</span>
                        </div>
                      </div>
                      <p className="text-[9.5px] text-slate-500 mt-1">Gerado automaticamente por B3-Quant Advisor em {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                    {/* Interactive 12m Stock Price Chart integrated directly inside the thesis */}
                    <div className="bg-black/35 border border-white/5 rounded p-3">
                      <p className="text-[10px] text-amber-500 uppercase font-bold mb-2">Desempenho Histórico Recente (12m)</p>
                      <div className="w-full">
                        {(() => {
                          const matchedStock = initialScreenerStocks.find(s => s.ticker === selectedThesis.ticker);
                          const priceVal = matchedStock ? matchedStock.price : (selectedThesis.fairPrice || 50);
                          const varVal = matchedStock ? ((matchedStock as any).var12m || 14.8) : 14.8;
                          return (
                            <Stock12mPriceHistoryChart 
                              ticker={selectedThesis.ticker} 
                              currentPrice={priceVal} 
                              var12m={varVal} 
                            />
                          );
                        })()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-[#a855f7] uppercase font-bold">Tese de Investimento (Editável)</p>
                      <textarea
                        value={thesisText}
                        onChange={(e) => setThesisText(e.target.value)}
                        rows={8}
                        className="w-full bg-black border border-white/10 rounded p-3 text-xs text-white outline-none focus:border-orange-500/50 leading-relaxed font-mono resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
                      <div className="space-y-2">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">💎 Vetores de Alta (Catalisadores)</span>
                        <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                          {selectedThesis.catalysts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-rose-400 uppercase font-bold block">🚨 Riscos & Contingência</span>
                        <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                          {selectedThesis.risks.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-right mt-6">
                  Suporta marcação de parágrafo livre, vetores de risco quantificados e exportação automatizada para PDF.
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
      <footer className="border-t border-white/10 bg-[#050505] py-4 px-6 text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>Painel: 51.5074° N, 0.1278° W</div>
          <div className="flex gap-4">
            <span className="text-emerald-400">● Conexão B3 Ativa</span>
            <span>©2026 B3-QUANT-FREE INTEGRATED</span>
          </div>
        </div>
      </footer>

      {/* Side-by-side comparative widgets */}
      {selectedCompareTickers.length > 0 && (
        <div className="fixed bottom-24 right-6 bg-[#0f0f0f] border border-[#a855f7]/40 shadow-2xl shadow-[#a855f7]/15 rounded-lg p-3.5 font-mono z-40 max-w-sm flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#a855f7]" />
              Comparar Lado a Lado ({selectedCompareTickers.length}/3)
            </span>
            <button 
              onClick={() => setSelectedCompareTickers([])}
              className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"
            >
              Limpar
            </button>
          </div>
          <div className="flex gap-1.5 text-[11px] font-bold text-orange-400">
            {selectedCompareTickers.map(t => (
              <span key={t} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowCompareModal(true)}
            className="w-full mt-1.5 bg-[#a855f7] hover:bg-purple-600 text-white font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Abrir Painel Comparativo</span>
          </button>
        </div>
      )}

      {showCompareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0b0b0b] border border-white/15 p-6 rounded-lg w-full max-w-4xl font-mono shadow-2xl relative my-8 text-left">
            <button 
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            
            <div className="mb-5">
              <span className="text-[10px] uppercase text-[#a855f7] tracking-widest font-extrabold">COMPARATIVE_MATRIX</span>
              <h3 className="text-white text-lg font-bold">Painel de Comparação Lado a Lado</h3>
              <p className="text-xs text-slate-400">Analise diretamente os indicadores de até 3 empresas para suas decisões quantitativas.</p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/60 mb-6">
              <table className="w-full text-left text-xs divide-y divide-white/5">
                <thead>
                  <tr className="bg-white/5 text-slate-300 font-bold select-none">
                    <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Métrica / Ativo</th>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <th key={ticker} className="py-3 px-4 text-center border-l border-white/5">
                          <span className="text-orange-500 font-extrabold text-sm block">{ticker}</span>
                          <span className="text-[10px] text-slate-400 font-normal block max-w-[150px] truncate mx-auto">{asset?.name}</span>
                        </th>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <th key={`empty-th-${i}`} className="py-3 px-4 text-center text-slate-600 italic border-l border-white/5">
                        Espaço Disponível vago
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-normal">
                  {/* Preço Row */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">Cotação Atual</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono font-bold text-white border-l border-white/5">
                          {asset ? rFormat(asset.price) : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-cote-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* Dividend Yield */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">Dividend Yield (DY)</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono text-emerald-400 font-bold border-l border-white/5">
                          {asset ? `${asset.divYield.toFixed(2)}%` : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-dy-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* P/L */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">Preço/Lucro (P/L)</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono font-bold text-orange-400 border-l border-white/5">
                          {asset ? asset.pl.toFixed(2) : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-pl-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* Margem Líquida */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">Margem Líquida (%)</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono text-blue-300 border-l border-white/5">
                          {asset ? `${asset.netMargin.toFixed(2)}%` : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-mg-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* ROE */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">ROE (%)</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono text-pink-300 font-bold border-l border-white/5">
                          {asset ? `${asset.roe.toFixed(2)}%` : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-roe-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* DL/EBITDA */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400 text-xs">Dívida Líquida / EBITDA</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono border-l border-white/5">
                          {asset ? asset.dlEbitda.toFixed(2) : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-dle-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* Valuation Bazin */}
                  <tr className="bg-amber-500/5 hover:bg-amber-500/10">
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-300 text-xs">Valuation Décio Bazin</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      const bazinVal = asset ? calculateBazinPrice(asset.price * asset.divYield / 100, vBazin) : 0;
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono font-bold text-amber-200 border-l border-white/5">
                          {asset ? rFormat(bazinVal) : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-bz-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* Valuation Graham */}
                  <tr className="bg-blue-500/5 hover:bg-blue-500/10">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-300 text-xs">Valuation Graham</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      const grahamVal = asset ? calculateGrahamPrice(asset.lpa, asset.vpa, vGraham) : null;
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono font-bold text-blue-200 border-l border-white/5">
                          {asset && grahamVal ? rFormat(grahamVal) : "R$ 0,00"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-gr-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                  {/* Valuation Peter Lynch */}
                  <tr className="bg-purple-500/5 hover:bg-purple-500/10">
                    <td className="py-2.5 px-4 font-mono font-bold text-purple-300 text-xs">Valuation Peter Lynch</td>
                    {selectedCompareTickers.map(ticker => {
                      const asset = initialScreenerStocks.find(s => s.ticker === ticker);
                      const lynchVal = asset ? ((asset.growthRate || 3.0) + asset.divYield) / asset.pl : 0;
                      return (
                        <td key={ticker} className="py-2.5 px-4 text-center font-mono font-bold text-purple-200 border-l border-white/5">
                          {asset ? lynchVal.toFixed(2) : "-"}
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 3 - selectedCompareTickers.length) }).map((_, i) => (
                      <td key={`empty-plh-${i}`} className="py-2.5 px-4 text-center text-slate-600 border-l border-white/5">-</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Radar Balance Graphic visualizer */}
            <div className="mb-6">
              <CustomRadarChart tickers={selectedCompareTickers} initialScreenerStocks={initialScreenerStocks} />
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowCompareModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Fechar Comparação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save presets dialogs */}
      {showSaveStockDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 rounded-lg w-full max-w-sm font-mono shadow-2xl text-left">
            <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Salvar Padrão de Filtros</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Insira um nome identificador para salvar as configurações de filtros de Ações atuais.
            </p>
            <input
              type="text"
              placeholder="Ex: Dividendos Altas Margens"
              value={newStockFilterName}
              onChange={(e) => setNewStockFilterName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-slate-600 outline-none mb-4 focus:border-emerald-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewStockFilterName("");
                  setShowSaveStockDialog(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStockFilter}
                className="px-4 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveFiiDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 rounded-lg w-full max-w-sm font-mono shadow-2xl">
            <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
              <Save className="w-4 h-4 text-[#a855f7]" />
              <span>Salvar Padrão de Filtros</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Insira um nome identificador para os filtros de FIIs de sua preferência.
            </p>
            <input
              type="text"
              placeholder="Ex: Descontados Tijolos"
              value={newFiiFilterName}
              onChange={(e) => setNewFiiFilterName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-slate-600 outline-none mb-4 focus:border-[#a855f7]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewFiiFilterName("");
                  setShowSaveFiiDialog(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFiiFilter}
                className="px-4 py-1.5 text-xs bg-[#a855f7] hover:bg-purple-400 text-white font-bold rounded transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
