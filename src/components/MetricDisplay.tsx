/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface MetricDisplayProps {
  title: string;
  value: string;
  change: string;
  subValue?: string;
  isPositive?: boolean;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  title,
  value,
  change,
  subValue,
  isPositive = true,
}) => {
  return (
    <div className="bg-[#1e293b] border border-slate-700/50 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all duration-300">
      <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <p className="text-slate-400 text-sm font-medium tracking-wide mb-1 uppercase">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</h3>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {isPositive ? "↑" : "↓"} {change}
        </span>
        {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
      </div>
    </div>
  );
};
