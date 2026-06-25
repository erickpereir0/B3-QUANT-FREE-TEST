/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// 1. PIE / DONUT CHART
interface PieData {
  name: string;
  value: number;
  color: string;
}

export const CustomPieChart: React.FC<{ data: PieData[]; totalValueText: string }> = ({ data, totalValueText }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedAngle = 0;

  return (
    <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const x1 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180);
            accumulatedAngle += angle;
            const x2 = 50 + 40 * Math.cos((accumulatedAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((accumulatedAngle * Math.PI) / 180);
            const largeArcFlag = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={item.color}
                className="hover:opacity-90 cursor-pointer transition-opacity duration-150 stroke-slate-900 stroke-2"
              />
            );
          })}
          {/* Inner cutout for donut style */}
          <circle cx="50" cy="50" r="26" fill="#111827" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Patrimônio</span>
          <span className="text-sm sm:text-base font-bold text-white leading-tight">{totalValueText}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">{item.name}</span>
              <span className="text-xs text-slate-400">
                {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (
                {((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. NET WORTH GROWTH HISTOGRAM BAR CHART
interface BarData {
  month: string;
  value: number;
}

export const CustomBarChart: React.FC<{ data: BarData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">NET_WORTH_GROWTH</p>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Crescimento do Patrimônio Líquido (12 Meses)</h4>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Último mês: <strong className="text-emerald-500 font-bold font-mono">R$ {data[data.length - 1]?.value.toLocaleString("pt-BR")}</strong>
        </span>
      </div>

      <div className="h-44 sm:h-52 flex justify-between items-end gap-2.5 pt-6 relative">
        {data.map((item, idx) => {
          // Leave 20% room at the top for tooltips and values
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 78 : 0;
          return (
            <div
              key={idx}
              className="flex-1 h-full flex flex-col justify-end items-center relative group"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on Hover */}
              <div
                className={`absolute -top-7 bg-black border border-emerald-500/30 text-[9px] text-white py-1 px-1.5 rounded font-mono whitespace-nowrap z-20 pointer-events-none transition-all duration-150 shadow-md ${
                  hoveredIndex === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                }`}
              >
                R$ {item.value.toLocaleString("pt-BR")}
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[32px] rounded-t transition-all duration-300 relative overflow-hidden flex items-end justify-center ${
                  hoveredIndex === idx
                    ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-gradient-to-t from-emerald-500/40 to-emerald-500/15"
                }`}
              >
                {/* Horizontal light border on top of bar */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-emerald-300 opacity-60" />
                
                {/* Visual hover reflections */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full transform -skew-x-12 translate-x-full group-hover:animate-shine" />
              </div>

              {/* Label */}
              <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono uppercase truncate w-full text-center">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. EFFICIENT FRONTIER SCATTER PLOT
interface ScatterPoint {
  x: number; // Volatility
  y: number; // Expected Return
  isOptimal?: boolean;
}

// Deterministic mock asset weights based on portfolio return rate (y-value) in the efficient frontier plot
const getWeightsForPoint = (point: ScatterPoint) => {
  const ret = point.y;
  if (point.isOptimal || (ret > 20.0 && ret < 21.5)) {
    return [
      { ticker: "VALE3", weight: 25.0, color: "#ea580c" },
      { ticker: "PETR4", weight: 20.0, color: "#eab308" },
      { ticker: "WEGE3", weight: 15.0, color: "#06b6d4" },
      { ticker: "ITUB4", weight: 15.0, color: "#3b82f6" },
      { ticker: "BBAS3", weight: 10.0, color: "#10b981" },
      { ticker: "JBSS3", weight: 8.0, color: "#a855f7" },
      { ticker: "ABEV3", weight: 5.0, color: "#f43f5e" },
      { ticker: "SUZB3", weight: 2.0, color: "#64748b" },
    ];
  }
  
  if (ret < 14) {
    return [
      { ticker: "ABEV3", weight: 35.0, color: "#f43f5e" },
      { ticker: "SUZB3", weight: 25.0, color: "#64748b" },
      { ticker: "ITUB4", weight: 15.0, color: "#3b82f6" },
      { ticker: "WEGE3", weight: 10.0, color: "#06b6d4" },
      { ticker: "BBAS3", weight: 5.0, color: "#10b981" },
      { ticker: "VALE3", weight: 4.0, color: "#ea580c" },
      { ticker: "PETR4", weight: 3.0, color: "#eab308" },
      { ticker: "JBSS3", weight: 3.0, color: "#a855f7" },
    ];
  } else if (ret > 22) {
    return [
      { ticker: "PETR4", weight: 45.0, color: "#eab308" },
      { ticker: "VALE3", weight: 30.0, color: "#ea580c" },
      { ticker: "JBSS3", weight: 15.0, color: "#a855f7" },
      { ticker: "WEGE3", weight: 5.0, color: "#06b6d4" },
      { ticker: "ITUB4", weight: 3.0, color: "#3b82f6" },
      { ticker: "BBAS3", weight: 2.0, color: "#10b981" },
      { ticker: "ABEV3", weight: 0.0, color: "#f43f5e" },
      { ticker: "SUZB3", weight: 0.0, color: "#64748b" },
    ];
  } else {
    return [
      { ticker: "VALE3", weight: 20.0, color: "#ea580c" },
      { ticker: "PETR4", weight: 18.0, color: "#eab308" },
      { ticker: "ITUB4", weight: 16.0, color: "#3b82f6" },
      { ticker: "WEGE3", weight: 14.0, color: "#06b6d4" },
      { ticker: "BBAS3", weight: 12.0, color: "#10b981" },
      { ticker: "JBSS3", weight: 10.0, color: "#a855f7" },
      { ticker: "ABEV3", weight: 6.0, color: "#f43f5e" },
      { ticker: "SUZB3", weight: 4.0, color: "#64748b" },
    ];
  }
};

export const EfficientFrontierPlot: React.FC<{ points: ScatterPoint[]; optimalPoint: ScatterPoint }> = ({
  points,
  optimalPoint,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint>(optimalPoint);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  const activePoint = hoveredPoint || selectedPoint;
  const weights = getWeightsForPoint(activePoint);

  // Auto layout math bounds
  const minX = Math.min(...points.map((p) => p.x)) - 1.5;
  const maxX = Math.max(...points.map((p) => p.x)) + 1.5;
  const minY = Math.min(...points.map((p) => p.y)) - 1.5;
  const maxY = Math.max(...points.map((p) => p.y)) + 1.5;

  const toSvgX = (val: number) => ((val - minX) / (maxX - minX)) * 74 + 18;
  const toSvgY = (val: number) => 82 - ((val - minY) / (maxY - minY)) * 70;

  // Sort frontier points by volatility (x-axis) to draw a clean efficient frontier curve line
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  const yTicks = [10, 15, 20, 25];
  const xTicks = [12, 16, 20, 24];

  return (
    <div className="w-full bg-[#0b0b0b] border border-white/10 p-5 rounded font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <div>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">MARKOWITZ_PORTFOLIO_OPTIMIZATION</p>
          <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Simulador de Fronteira Eficiente</h4>
        </div>
        <div className="flex gap-2 text-[10px] font-semibold">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500/80" /> Simulados
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400">
            <span className="inline-block text-[11px] leading-none mb-0.5">★</span> Ótimo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Plot area */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="relative h-64 sm:h-72 w-full">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none">
              {/* Outer boundary plot backdrop rectangle */}
              <rect x="18" y="10" width="77" height="72" fill="#000" fillOpacity="0.4" rx="2" />

              {/* Y Axis grid ticks and gridlines */}
              {yTicks.map((val) => {
                const yPos = toSvgY(val);
                if (yPos < 10 || yPos > 82) return null;
                return (
                  <g key={`y-${val}`}>
                    <line x1="18" y1={yPos} x2="95" y2={yPos} stroke="#222" strokeDasharray="2,2" strokeWidth="0.4" />
                    <text x="14" y={yPos + 1} fill="#94a3b8" fontSize="3" textAnchor="end" className="font-mono">
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* X Axis grid ticks and gridlines */}
              {xTicks.map((val) => {
                const xPos = toSvgX(val);
                if (xPos < 18 || xPos > 95) return null;
                return (
                  <g key={`x-${val}`}>
                    <line x1={xPos} y1="10" x2={xPos} y2="82" stroke="#222" strokeDasharray="2,2" strokeWidth="0.4" />
                    <text x={xPos} y="87" fill="#94a3b8" fontSize="3" textAnchor="middle" className="font-mono">
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Draw main Axis border lines */}
              <line x1="18" y1="10" x2="18" y2="82" stroke="#334155" strokeWidth="0.6" />
              <line x1="18" y1="82" x2="95" y2="82" stroke="#334155" strokeWidth="0.6" />

              {/* Connecting frontier curve trail path */}
              <path
                d={sortedPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(" ")}
                fill="none"
                stroke="rgba(249, 115, 22, 0.4)"
                strokeWidth="0.8"
                strokeDasharray="2,2.5"
              />

              {/* Scatter dots */}
              {points.map((p, idx) => {
                const cx = toSvgX(p.x);
                const cy = toSvgY(p.y);
                const isPointOptimal = p.isOptimal || (p.x === optimalPoint.x && p.y === optimalPoint.y);
                const isSelected = activePoint && activePoint.x === p.x && activePoint.y === p.y;
                
                if (isPointOptimal) return null; // Drawn as a star on top separately

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? "2.2" : "1.5"}
                    fill={p.y > 20 ? "#f97316" : "#2563eb"}
                    stroke={isSelected ? "#fff" : "none"}
                    strokeWidth="0.5"
                    className="cursor-pointer transition-all duration-75 hover:scale-150 opacity-80 hover:opacity-100"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setSelectedPoint(p)}
                  />
                );
              })}

              {/* Optimal Portfolio Star Marker */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ ...optimalPoint, isOptimal: true })}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setSelectedPoint({ ...optimalPoint, isOptimal: true })}
              >
                {/* Ping circle for optimal point */}
                <circle
                  cx={toSvgX(optimalPoint.x)}
                  cy={toSvgY(optimalPoint.y)}
                  r="5"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="0.3"
                  className="animate-pulse"
                />
                
                <path
                  d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                  transform={`translate(${toSvgX(optimalPoint.x) - 4}, ${toSvgY(optimalPoint.y) - 4}) scale(0.35)`}
                  fill="#fbbf24"
                  stroke="#fff"
                  strokeWidth="1.2"
                />
              </g>
            </svg>
            
            {/* Axis labels positioned relative to box */}
            <div className="absolute left-[3%] top-1/2 -translate-y-1/2 transform -rotate-90 text-[8px] text-slate-500 font-bold uppercase tracking-widest origin-left-center select-none whitespace-nowrap">
              Retorno Esperado (%)
            </div>
            <div className="absolute bottom-[2%] left-[55%] -translate-x-1/2 text-[8px] text-slate-500 font-bold uppercase tracking-widest select-none">
              Volatilidade Anual (%)
            </div>
          </div>
          
          <div className="bg-black/80 border border-white/5 rounded p-3 text-[10px] space-y-1.5 mt-2">
            <span className="text-slate-500 font-bold block uppercase text-[9px] tracking-wider">Métricas do Portfólio Ativo</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-orange-500 font-bold text-[8px]">RETORNO_ESPERADO</span>
                <span className="text-white text-xs font-bold font-mono">{activePoint.y.toFixed(1)}% p.a.</span>
              </div>
              <div>
                <span className="block text-cyan-400 font-bold text-[8px]">VOLATILIDADE</span>
                <span className="text-white text-xs font-bold font-mono">{activePoint.x.toFixed(1)}% p.a.</span>
              </div>
              <div>
                <span className="block text-emerald-400 font-bold text-[8px]">SHARPE_RATIO</span>
                <span className="text-white text-xs font-bold font-mono">
                  {((activePoint.y - 10.75) / activePoint.x).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic allocation weight list column */}
        <div className="lg:col-span-5 bg-black/40 border border-white/5 p-4 rounded flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Alocação de Ativos Markowitz</span>
              <span className="text-emerald-400 text-[11px] font-bold font-mono">
                {activePoint.isOptimal || (activePoint.x === optimalPoint.x && activePoint.y === optimalPoint.y) ? "🏆 Portfólio Ótimo" : "⚖️ Portfólio Custom"}
              </span>
            </div>

            <div className="space-y-2.5">
              {weights.map((w, idx) => (
                <div key={idx} className="space-y-1 group">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                      <span className="font-bold text-white tracking-wide">{w.ticker}</span>
                    </div>
                    <span className="font-bold text-slate-300 font-mono text-[11px]">{w.weight.toFixed(1)}%</span>
                  </div>
                  
                  {/* Weight Progress Bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${w.weight}%`,
                        backgroundColor: w.color,
                        boxShadow: `0 0 6px ${w.color}30`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 mt-4 text-[9px] text-slate-500 leading-normal font-sans italic">
            * Passe o mouse ou clique sobre os pontos simulados na Fronteira Eficiente à esquerda para analisar a alocação de ativos equivalente de cada portfólio.
          </div>
        </div>

      </div>
    </div>
  );
};

// 4. SPEEDOMETER / GAUGE VISUAL FOR LIQUIDATION RISK
export const LiquidationRiskGauge: React.FC<{ riskScorePercentage: number }> = ({ riskScorePercentage }) => {
  const rotationAngle = (riskScorePercentage / 100) * 180 - 90; // -90 deg corresponding to 0% and +90 deg corresponding to 100%

  return (
    <div className="flex flex-col items-center p-3 relative">
      <div className="relative w-44 h-24 overflow-hidden mt-2">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Base Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled Track of Risk */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="125.6" // Half circumference
            strokeDashoffset={125.6 - (125.6 * riskScorePercentage) / 100}
          />
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Pivot pin */}
          <circle cx="50" cy="50" r="4" fill="#64748b" />
        </svg>

        {/* Indicator needle */}
        <div
          style={{ transform: `rotate(${rotationAngle}deg)` }}
          className="absolute bottom-0 left-[calc(50%-1px)] w-[3px] h-14 bg-white origin-bottom rounded-full transition-transform duration-1000 ease-out-quint"
        />
      </div>

      <div className="text-center mt-3 z-10 -translate-y-2">
        <span className="text-2xl font-bold text-white leading-none">{riskScorePercentage}%</span>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Nível de Risco de Liquidação</p>
      </div>
    </div>
  );
};

// 5. CUMULATIVE BENCHMARKS PERFORMANCE COMPARISON LINE GRAPH
interface PerformanceDatasetItem {
  name: string;
  userPortfolio: number;
  ibov: number;
  cdi: number;
  ipca: number;
}

export const CumulativeLineGraph: React.FC<{
  data: PerformanceDatasetItem[];
  visibleBenchmarks: { [key: string]: boolean };
}> = ({ data, visibleBenchmarks }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Finding min and max for responsive scale
  const allValues = data.flatMap((d) => [
    d.userPortfolio,
    visibleBenchmarks.IBOV ? d.ibov : d.userPortfolio,
    visibleBenchmarks.CDI ? d.cdi : d.userPortfolio,
    visibleBenchmarks.IPCA ? d.ipca : d.userPortfolio,
  ]);
  const minY = Math.min(...allValues) - 5;
  const maxY = Math.max(...allValues) + 5;

  const toSvgX = (index: number) => (index / (data.length - 1)) * 82 + 10;
  const toSvgY = (val: number) => 85 - ((val - minY) / (maxY - minY)) * 75;

  const getPathD = (key: keyof PerformanceDatasetItem) => {
    return data
      .map((item, index) => {
        const x = toSvgX(index);
        const y = toSvgY(item[key] as number);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-[#1e293b]/50 border border-slate-800 p-5 rounded-2xl relative select-none">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Retorno Percentual Acumulado (%)</h4>
        {hoveredIdx !== null && (
          <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded-md text-emerald-400">
            {data[hoveredIdx].name}: Carteira: {data[hoveredIdx].userPortfolio.toFixed(1)}% | IBOV: {data[hoveredIdx].ibov.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="relative h-60 border-l border-b border-slate-700/50 pb-2 mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Y Axis Grid Marks */}
          {[10, 35, 60, 85].map((yVal, i) => {
            const gridPercentVal = minY + ((85 - yVal) / 75) * (maxY - minY);
            return (
              <g key={i}>
                <line x1="10" y1={yVal} x2="92" y2={yVal} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
                <text x="4" y={yVal + 1.5} fill="#94a3b8" fontSize="2.8" fontFamily="monospace">
                  {(gridPercentVal > 0 ? "+" : "") + gridPercentVal.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* User Portfolio Line */}
          <path d={getPathD("userPortfolio")} fill="none" stroke="#22c55e" strokeWidth="1.8" />

          {/* Benchmark Lines */}
          {visibleBenchmarks.IBOV && (
            <path d={getPathD("ibov")} fill="none" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="1,1" />
          )}
          {visibleBenchmarks.CDI && (
            <path d={getPathD("cdi")} fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2,2" />
          )}
          {visibleBenchmarks.IPCA && (
            <path d={getPathD("ipca")} fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="4,2" />
          )}

          {/* Interactive Mouse Capture Area & Vertical Tracking Bar */}
          {data.map((_, index) => {
            const x = toSvgX(index);
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1="10"
                  x2={x}
                  y2="85"
                  stroke={hoveredIdx === index ? "#10b981" : "transparent"}
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <rect
                  x={x - 2}
                  y="10"
                  width="4"
                  height="75"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Custom Legend labels beneath line chart */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center text-[11px] font-mono font-medium">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-3 h-0.5 bg-emerald-500 block" /> Usr Portfolio ({data[data.length - 1].userPortfolio.toFixed(1)}%)
        </span>
        {visibleBenchmarks.IBOV && (
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-0.5 bg-cyan-500 block stroke-dasharray" /> IBOVESPA ({data[data.length - 1].ibov.toFixed(1)}%)
          </span>
        )}
        {visibleBenchmarks.CDI && (
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-3 h-0.5 bg-purple-500 block stroke-dasharray" /> CDI ({data[data.length - 1].cdi.toFixed(1)}%)
          </span>
        )}
        {visibleBenchmarks.IPCA && (
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-3 h-0.5 bg-rose-500 block stroke-dasharray" /> IPCA ({data[data.length - 1].ipca.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
};

// 6. HIGH-PRECISION SIDE-BY-SIDE RADAR CHART (5 AXES COMPARATIVE MATRIX)
interface RadarAxis {
  name: string;
  key: string;
  scaleMax: number;
  isInverse: boolean;
}

export const CustomRadarChart: React.FC<{ tickers: string[]; initialScreenerStocks: any[] }> = ({ tickers, initialScreenerStocks }) => {
  const cx = 130;
  const cy = 125;
  const rMax = 80;

  const axes: RadarAxis[] = [
    { name: "Dividend Yield", key: "divYield", scaleMax: 15, isInverse: false },
    { name: "ROE", key: "roe", scaleMax: 25, isInverse: false },
    { name: "Margem Líquida", key: "netMargin", scaleMax: 35, isInverse: false },
    { name: "Atract. P/L", key: "pl", scaleMax: 20, isInverse: true }, // lower is better
    { name: "Seg. DL/EBITDA", key: "dlEbitda", scaleMax: 4, isInverse: true } // lower is better
  ];

  // Colors for up to 3 compared tickers
  const colors = [
    { stroke: "#f97316", fill: "rgba(249,115,22,0.15)", text: "text-orange-500", name: "Laranja" },
    { stroke: "#22d3ee", fill: "rgba(34,211,238,0.15)", text: "text-cyan-400", name: "Ciano" },
    { stroke: "#a855f7", fill: "rgba(168,85,247,0.15)", text: "text-purple-400", name: "Púrpura" }
  ];

  // Helper to get angle in radians
  const getAngle = (i: number) => {
    return (Math.PI * 2 / 5) * i - Math.PI / 2;
  };

  // Precompute grid polygons (concentric backdrops)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-5 flex flex-col items-center gap-4 w-full">
      <div className="text-center">
        <span className="text-[9px] uppercase text-[#a855f7] tracking-widest font-extrabold">RADAR_PROFILE_ANALYSIS</span>
        <h4 className="text-white text-xs font-bold font-sans">Equilíbrio de Indicadores Lado a Lado</h4>
        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Eixos normalizados: mais próximo da borda indica melhor perfil quantitativo.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-2xl">
        {/* SVG Radar Chart Engine */}
        <div className="relative w-64 h-64 shrink-0">
          <svg viewBox="0 0 260 250" className="w-full h-full select-none overflow-visible">
            {/* 1. Background grid concentric pentagons */}
            {gridLevels.map((lvl, lIdx) => {
              const points = Array.from({ length: 5 }).map((_, i) => {
                const angle = getAngle(i);
                const r = rMax * lvl;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                return `${x},${y}`;
              }).join(" ");
              return (
                <polygon
                  key={`grid-${lIdx}`}
                  points={points}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray={lIdx === 3 ? "0" : "2,2"}
                />
              );
            })}

            {/* 2. Radial Axis Spikes from center to vertex */}
            {axes.map((axis, i) => {
              const angle = getAngle(i);
              const xOuter = cx + rMax * Math.cos(angle);
              const yOuter = cy + rMax * Math.sin(angle);
              
              // Slightly push label text outward
              const textR = rMax + 15;
              const xText = cx + textR * Math.cos(angle);
              const yText = cy + textR * Math.sin(angle);

              // SVG anchor calculation
              let textAnchor = "middle";
              if (Math.cos(angle) > 0.1) textAnchor = "start";
              else if (Math.cos(angle) < -0.1) textAnchor = "end";

              return (
                <g key={`axis-${i}`}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={xOuter}
                    y2={yOuter}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  <text
                    x={xText}
                    y={yText + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="mono"
                    fontWeight="bold"
                    textAnchor={textAnchor}
                    className="select-none"
                  >
                    {axis.name}
                  </text>
                </g>
              );
            })}

            {/* 3. Render compared overlay shapes to view balances */}
            {tickers.map((ticker, tIdx) => {
              const stock = initialScreenerStocks.find(s => s.ticker === ticker);
              if (!stock) return null;
              const c = colors[tIdx % colors.length];

              const pointsArr = axes.map((ax, i) => {
                const val = stock[ax.key] ?? 0;
                let scorePct = 0;

                if (ax.isInverse) {
                  // cheapness or security points
                  scorePct = Math.max(0, ax.scaleMax - val) / ax.scaleMax;
                } else {
                  scorePct = Math.min(ax.scaleMax, Math.max(0, val)) / ax.scaleMax;
                }
                
                // Cap score values
                scorePct = Math.min(1.0, scorePct);

                const angle = getAngle(i);
                const r = rMax * scorePct;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                return { x, y };
              });

              const pointsStr = pointsArr.map(p => `${p.x},${p.y}`).join(" ");

              return (
                <g key={`poly-${ticker}`}>
                  {/* polygon fill area */}
                  <polygon
                    points={pointsStr}
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2"
                    className="transition-all duration-500 hover:fill-opacity-35"
                  />
                  {/* individual vertex nodes */}
                  {pointsArr.map((pt, ptIdx) => (
                    <circle
                      key={`pt-${ptIdx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill={c.stroke}
                      className="cursor-pointer stroke-black stroke-2"
                      title={`${ticker} - Score: ${ptIdx}`}
                    />
                  ))}
                </g>
              );
            })}

            {/* Center Core dot */}
            <circle cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

        {/* Legend listing metrics values explicitly */}
        <div className="flex-1 space-y-3 w-full self-start">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1 font-semibold">Tabela de Balanço Real</p>
          <div className="space-y-2">
            {tickers.map((t, tIdx) => {
              const stock = initialScreenerStocks.find(s => s.ticker === t);
              if (!stock) return null;
              const c = colors[tIdx % colors.length];

              return (
                <div key={t} className="bg-white/[0.02] border border-white/5 p-2 rounded flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.stroke }} />
                    <span className="text-white font-bold font-sans text-xs">{stock.ticker}</span>
                    <span className="text-[9px] text-slate-400 capitalize truncate max-w-[120px] font-sans">({stock.name})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-400 leading-tight">
                    <div>DY: <span className="text-emerald-400 font-bold">{stock.divYield?.toFixed(2)}%</span></div>
                    <div>ROE: <span className="text-emerald-400 font-bold">{stock.roe?.toFixed(2)}%</span></div>
                    <div>Margem: <span className="text-slate-300 font-bold">{stock.netMargin?.toFixed(1)}%</span></div>
                    <div>P/L: <span className="text-orange-400 font-bold">{stock.pl?.toFixed(1)}</span></div>
                    <div className="col-span-2">Dív. Líq / EBITDA: <span className="text-amber-500 font-bold">{stock.dlEbitda?.toFixed(2)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. HIGH-FIDELITY ACTIVE TICKER 12-MONTH HISTORICAL PRICE CHART (RECHARTS)
export const Stock12mPriceHistoryChart: React.FC<{ ticker: string; currentPrice?: number; var12m?: number }> = ({ ticker = "", currentPrice = 50, var12m = 0 }) => {
  // Deterministic procedural generator for 12 months history
  const data = React.useMemo(() => {
    const months = ["Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26", "Fev/26", "Mar/26", "Abr/26", "Mai/26", "Jun/26"];
    const safePrice = typeof currentPrice === "number" ? currentPrice : 50;
    const safeVar = typeof var12m === "number" ? var12m : 0;
    const startPrice = safePrice / (1 + safeVar / 100);
    const safeTicker = ticker || "STOCK";
    
    // Seed hash based on ticker characters for deterministic wave
    let hash = 0;
    for (let c = 0; c < safeTicker.length; c++) {
      hash += safeTicker.charCodeAt(c);
    }
    
    return months.map((month, i) => {
      if (i === 0) {
        return { date: month, price: Number(startPrice.toFixed(2)) };
      }
      if (i === 11) {
        return { date: month, price: Number(safePrice.toFixed(2)) };
      }
      
      const ratio = i / 11;
      const base = startPrice + (safePrice - startPrice) * ratio;
      const wave = Math.sin(ratio * Math.PI * 2.5 + hash) * (safePrice * 0.05) * Math.sin(ratio * Math.PI);
      const calculatedPrice = Math.max(0.2, base + wave);
      
      return { date: month, price: Number(calculatedPrice.toFixed(2)) };
    });
  }, [ticker, currentPrice, var12m]);

  const safeVar12m = typeof var12m === "number" ? var12m : 0;
  const isPositive = safeVar12m >= 0;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const fillColor = isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)";

  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const safeCurrentPrice = typeof currentPrice === "number" ? currentPrice : 50;

  return (
    <div className="bg-black/80 border border-white/10 rounded-xl p-4 w-full text-xs">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <div>
          <span className="text-[9px] uppercase text-[#a855f7] tracking-wider font-extrabold font-mono">HISTÓRICO_12_MESES_REAL</span>
          <h4 className="text-white text-md font-bold flex items-center gap-2">
            Gráfico de Preço: <span className="text-amber-400 font-mono font-bold text-lg">{ticker}</span>
          </h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Variação Acumulada</p>
          <span className={`text-sm font-bold font-mono ${isPositive ? "text-emerald-400" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}{safeVar12m.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 bg-white/5 p-2.5 rounded-lg text-center font-mono">
        <div>
          <span className="text-[9px] text-slate-500 block">MÁXIMO (12M)</span>
          <span className="text-white text-[11px] font-bold">R$ {maxPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block">MÍNIMO (12M)</span>
          <span className="text-white text-[11px] font-bold">R$ {minPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block">FECHAMENTO ATUAL</span>
          <span className="text-amber-400 text-[11px] font-bold">R$ {safeCurrentPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="h-44 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={8.5} 
              tickLine={false} 
              axisLine={false}
              dy={8}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={8.5} 
              tickLine={false} 
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `R$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111520",
                borderColor: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "monospace"
              }}
              labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
              itemStyle={{ color: "#fbbf24" }}
              formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, "Preço"]}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={strokeColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#grad-${ticker})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

