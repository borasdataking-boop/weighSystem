import React from 'react';
import { ProductionMetrics } from '../../types/log.types';

interface ProductionKPICardsProps {
  metrics: ProductionMetrics;
  selectedBatch: string;
}

export const ProductionKPICards: React.FC<ProductionKPICardsProps> = ({ metrics }) => {
  const wipPercent = metrics.totalInWeight > 0
    ? ((metrics.wipWeight / metrics.totalInWeight) * 100).toFixed(1)
    : '0';

  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  const getTonText = (val: number) => {
    if (val >= 1000) {
      return `≈ ${(val / 1000).toFixed(2)} tấn`;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* 1. ĐẦU VÀO (IN) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs border-l-4 border-l-blue-600 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Đầu vào
            </span>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono font-semibold">
            IN • {metrics.inCount.toLocaleString('vi-VN')} lần
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
            {formatWeight(metrics.totalInWeight)}
          </span>
          <span className="text-sm font-bold text-slate-400">kg</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tổng vào</span>
          {getTonText(metrics.totalInWeight) && (
            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {getTonText(metrics.totalInWeight)}
            </span>
          )}
        </div>
      </div>

      {/* 2. ĐẦU RA (OUT) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs border-l-4 border-l-emerald-600 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Đầu ra
            </span>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
            OUT • {metrics.outCount.toLocaleString('vi-VN')} lần
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 tracking-tight">
            {formatWeight(metrics.totalOutWeight)}
          </span>
          <span className="text-sm font-bold text-slate-400">kg</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tổng ra</span>
          {getTonText(metrics.totalOutWeight) && (
            <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {getTonText(metrics.totalOutWeight)}
            </span>
          )}
        </div>
      </div>

      {/* 3. ĐỌNG LẠI (WIP) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs border-l-4 border-l-amber-500 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Đọng lại
            </span>
          </div>
          <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono font-semibold">
            WIP • {wipPercent}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono text-amber-700 tracking-tight">
            {formatWeight(metrics.wipWeight)}
          </span>
          <span className="text-sm font-bold text-slate-400">kg</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Chưa xử lý xong</span>
          {getTonText(metrics.wipWeight) && (
            <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {getTonText(metrics.wipWeight)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
