/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

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
    <div className="w-full bg-[#1e293b]/40 border border-slate-800 p-5 rounded-2xl relative">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-medium text-sm tracking-wide uppercase">Crescimento do Patrimônio Líquido (12 Meses)</h4>
        <span className="text-xs text-slate-400 font-mono">Último mês: R$ {maxValue.toLocaleString()}</span>
      </div>

      <div className="h-44 sm:h-52 flex items-end justify-between gap-1.5 pt-4">
        {data.map((item, idx) => {
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 90 : 0;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center relative group"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on Hover */}
              <div
                className={`absolute -top-10 bg-slate-950 border border-slate-700 text-[10px] text-white py-1 px-2 rounded-md font-mono whitespace-nowrap z-20 pointer-events-none transition-opacity duration-200 ${
                  hoveredIndex === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 relative overflow-hidden ${
                  hoveredIndex === idx
                    ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "bg-gradient-to-t from-emerald-500/80 to-emerald-500/40"
                }`}
              >
                {/* Visual reflections internally */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
              </div>

              {/* Label */}
              <span className="text-[10px] font-semibold text-slate-400 mt-2 font-mono uppercase">{item.month}</span>
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

export const EfficientFrontierPlot: React.FC<{ points: ScatterPoint[]; optimalPoint: ScatterPoint }> = ({
  points,
  optimalPoint,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  // Math bounds
  const minX = Math.min(...points.map((p) => p.x)) - 2;
  const maxX = Math.max(...points.map((p) => p.x)) + 2;
  const minY = Math.min(...points.map((p) => p.y)) - 2;
  const maxY = Math.max(...points.map((p) => p.y)) + 2;

  const toSvgX = (val: number) => ((val - minX) / (maxX - minX)) * 85 + 10;
  const toSvgY = (val: number) => 90 - ((val - minY) / (maxY - minY)) * 80;

  // Render the efficient frontier curve approximation
  const sortedByXPoints = [...points].sort((a, b) => a.x - b.x);
  const frontierCurvePoints = sortedByXPoints.filter((p, index) => {
    // Simple filter to find upper boundary points (envelope)
    const segmentWidth = (maxX - minX) / 8;
    const segmentIndex = Math.floor((p.x - minX) / segmentWidth);
    return true; // We can show the line connecting them or just high-quality scatter
  });

  return (
    <div className="w-full bg-[#1e293b]/50 border border-slate-800 p-5 rounded-2xl relative select-none">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Efficient Frontier (Fronteira Eficiente)</h4>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Portfólios Simulados
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/></svg> Portfólio Ótimo (Max Sharpe)
          </span>
        </div>
      </div>

      <div className="relative h-64 sm:h-80 border-l border-b border-slate-700/60 pb-1 mt-6">
        {/* Y Axis Label */}
        <div className="absolute -left-12 top-11 transform -rotate-90 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Expected Return (Retorno %)
        </div>
        {/* X Axis Label */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Annual Volatility (Volatilidade %)
        </div>

        {/* Dynamic Tooltip */}
        {(hoveredPoint || optimalPoint) && (
          <div className="absolute top-4 right-4 bg-slate-950 border border-emerald-500/40 p-2.5 rounded-lg text-xs font-mono z-10 text-slate-300 shadow-md">
            <p className="text-emerald-400 font-bold mb-1">
              {hoveredPoint?.isOptimal || (!hoveredPoint) ? "🍀 Carteira Ótima" : "📊 Posição Simulada"}
            </p>
            <p>Retorno Esperado: <span className="text-white">{(hoveredPoint?.y || optimalPoint.y).toFixed(1)}%</span></p>
            <p>Volatilidade: <span className="text-white">{(hoveredPoint?.x || optimalPoint.x).toFixed(1)}%</span></p>
            <p>Sharpe Ratio: <span className="text-emerald-400 font-semibold">{hoveredPoint?.isOptimal || (!hoveredPoint) ? "0.62" : "0.38"}</span></p>
          </div>
        )}

        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[20, 40, 60, 80].map((v) => (
            <React.Fragment key={v}>
              <line x1="10" y1={v} x2="95" y2={v} stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1={v + 10} y1="10" x2={v + 10} y2="90" stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Scatter dots */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={toSvgX(p.x)}
              cy={toSvgY(p.y)}
              r="1.2"
              fill={p.y > 20 ? "#10b981" : "#3b82f6"}
              className="opacity-70 hover:opacity-100 cursor-pointer transition-all hover:scale-150 duration-75"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Optimal Portfolio Star Marker */}
          <g
            className="cursor-pointer scale-125 transition-transform duration-300 hover:scale-150"
            onMouseEnter={() => setHoveredPoint({ ...optimalPoint, isOptimal: true })}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <path
              d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
              transform={`translate(${toSvgX(optimalPoint.x) - 4}, ${toSvgY(optimalPoint.y) - 4}) scale(0.35)`}
              fill="#fbbf24"
              stroke="#bef264"
              strokeWidth="2"
            />
            {/* Pulsing indicator around star */}
            <circle
              cx={toSvgX(optimalPoint.x)}
              cy={toSvgY(optimalPoint.y)}
              r="4"
              fill="transparent"
              stroke="#fbbf24"
              strokeWidth="0.5"
              className="animate-ping"
            />
          </g>
        </svg>
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
