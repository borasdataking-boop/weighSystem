import React from 'react';
import { ProductionMetrics } from '../../types/log.types';

interface ProductionKPICardsProps {
  metrics: ProductionMetrics;
  selectedBatch: string;
}

export const ProductionKPICards: React.FC<ProductionKPICardsProps> = ({ metrics }) => {
  const isTargetMet = metrics.yieldRate >= 70;
  const wipPercent = metrics.totalInWeight > 0
    ? ((metrics.wipWeight / metrics.totalInWeight) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* 1. VÀO (IN) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs border-l-4 border-l-blue-600 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vào (IN)</span>
          <span className="text-xs text-slate-400 font-mono">{metrics.inCount} mẻ</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
            {metrics.totalInWeight.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-slate-400">kg</span>
        </div>
      </div>

      {/* 2. TỒN (WiP) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs border-l-4 border-l-amber-500 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tồn (WiP)</span>
          <span className="text-xs text-amber-700 font-mono font-semibold">{wipPercent}%</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 tracking-tight">
            {metrics.wipWeight.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-slate-400">kg</span>
        </div>
      </div>

      {/* 3. RA (OUT) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs border-l-4 border-l-emerald-600 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ra (OUT)</span>
          <span className="text-xs text-slate-400 font-mono">{metrics.outCount} mẻ</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 tracking-tight">
            {metrics.totalOutWeight.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-slate-400">kg</span>
        </div>
      </div>

      {/* 4. YIELD (%) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs border-l-4 border-l-[#DE4444] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yield</span>
          <span className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded ${
            isTargetMet ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isTargetMet ? 'Đạt' : 'Chưa đạt'}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#DE4444] tracking-tight">
            {metrics.yieldRate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-mono ml-auto">Chuẩn: 70%</span>
        </div>
      </div>
    </div>
  );
};
