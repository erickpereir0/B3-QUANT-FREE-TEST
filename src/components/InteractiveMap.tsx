/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  latY: number; // custom SVG relative coordinates
  lngX: number;
  area: string;
  tenant: string;
}

const realEstateProperties: Property[] = [
  { id: "p1", name: "HGLG Itupeva", city: "Itupeva", state: "SP", latY: 74, lngX: 62, area: "64.000 m²", tenant: "Mercado Livre" },
  { id: "p2", name: "HGLG Cabreúva", city: "Cabreúva", state: "SP", latY: 72, lngX: 61, area: "112.000 m²", tenant: "DHL Logistics" },
  { id: "p3", name: "HGLG Jundiaí", city: "Jundiaí", state: "SP", latY: 73, lngX: 64, area: "45.000 m²", tenant: "Ambev" },
  { id: "p4", name: "HGLG Duque de Caxias", city: "Duque de Caxias", state: "RJ", latY: 72, lngX: 74, area: "89.000 m²", tenant: "Amazon" },
  { id: "p5", name: "HGLG Ribeirão das Neves", city: "Ribeirão das Neves", state: "MG", latY: 59, lngX: 68, area: "56.000 m²", tenant: "Lojas Americanas" },
  { id: "p6", name: "HGLG Araucária", city: "Araucária", state: "PR", latY: 86, lngX: 48, area: "78.000 m²", tenant: "Boticário" }
];

export const InteractiveMap: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(realEstateProperties[0]);

  return (
    <div className="flex flex-col md:flex-row gap-5 p-4 bg-[#1e293b]/30 border border-slate-800 rounded-2xl">
      <div className="flex-1 relative aspect-square max-w-[340px] mx-auto bg-slate-950/80 rounded-xl overflow-hidden p-2 border border-slate-800/80">
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
            Property Map Matrix
          </span>
        </div>

        {/* Simplified Vector Map of Brazil Outline */}
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-slate-800 fill-slate-900/60 transition-transform hover:scale-105 duration-500">
          {/* Brazil Outline Approximation Map Path */}
          <path
            d="M 30 10 C 45 5, 78 8, 88 28 C 94 38, 98 48, 88 58 C 78 68, 70 88, 55 98 C 45 92, 44 80, 48 76 C 52 72, 40 68, 30 65 C 20 62, 10 50, 4 C 40, 10 32, 12 18 C 14 10, 22 15, 30 10 Z"
            strokeWidth="0.8"
            className="stroke-slate-700/60 fill-slate-900/20"
          />

          {/* Core States lines markers */}
          <path d="M 48 76 L 68 76" stroke="#475569" strokeWidth="0.4" strokeDasharray="1,1" />

          {/* Interactive Property Highlights Dots */}
          {realEstateProperties.map((p) => {
            const isSelected = selectedProperty?.id === p.id;
            return (
              <g
                key={p.id}
                className="cursor-pointer group"
                onClick={() => setSelectedProperty(p)}
              >
                {/* Outer ring */}
                <circle
                  cx={p.lngX}
                  cy={p.latY}
                  r={isSelected ? "4" : "2"}
                  fill="none"
                  stroke={isSelected ? "#a855f7" : "#10b981"}
                  strokeWidth="0.6"
                  className={isSelected ? "animate-pulse" : "group-hover:stroke-purple-400"}
                />
                {/* Inner core */}
                <circle
                  cx={p.lngX}
                  cy={p.latY}
                  r="1.5"
                  fill={isSelected ? "#a855f7" : "#10b981"}
                  className="group-hover:fill-purple-400"
                />
                {/* Tooltip on marker dot */}
                <text
                  x={p.lngX + 3}
                  y={p.latY + 1}
                  fill="#94a3b8"
                  fontSize="2.2"
                  fontWeight="bold"
                  className="font-sans opacity-60 group-hover:opacity-100 pointer-events-none"
                >
                  {p.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1.5 min-w-[180px]">
        <div>
          <h5 className="text-white font-semibold text-base mb-1.5">Distribuição Física</h5>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Empreendimentos logísticos e industriais triplo A (A+) de alta eficiência localizados em polos de escoamento.
          </p>

          {selectedProperty && (
            <div className="space-y-3 bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-purple-400">Ativo Comercial</span>
                <h6 className="text-white text-sm font-semibold">{selectedProperty.name}</h6>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Localização</span>
                  <span className="text-slate-300">{selectedProperty.city} ({selectedProperty.state})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Área Construída</span>
                  <span className="text-slate-300 font-mono">{selectedProperty.area}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Inquilino Principal</span>
                <span className="text-emerald-400 text-xs font-semibold">{selectedProperty.tenant}</span>
              </div>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-500 mt-3 block text-right font-mono">
          Suporte: 100% São Paulo & Rio Matrix
        </span>
      </div>
    </div>
  );
};
