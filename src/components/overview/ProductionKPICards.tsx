import React from 'react';
import { ProductionMetrics } from '../../types/log.types';

interface ProductionKPICardsProps {
  metrics: ProductionMetrics;
  selectedBatch: string;
}

export const ProductionKPICards: React.FC<ProductionKPICardsProps> = ({ metrics }) => {
  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const totalIn = metrics.totalInWeight;
  const outPercent = totalIn > 0 ? Math.min(100, Number(((metrics.totalOutWeight / totalIn) * 100).toFixed(1))) : 0;
  const wipPercent = totalIn > 0 ? Math.min(100 - outPercent, Number(((metrics.wipWeight / totalIn) * 100).toFixed(1))) : 0;
  const lossPercent = totalIn > 0 ? Math.max(0, Number((100 - outPercent - wipPercent).toFixed(1))) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs mb-3">
      {/* 4 THẺ CHỈ SỐ GỌN GÀNG, TẬP TRUNG SỐ LIỆU */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        
        {/* 1. NGUYÊN LIỆU VÀO */}
        <div className="px-2 pt-1 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Vào (IN)
            </span>
            <span className="font-mono text-[10px] text-slate-400 font-normal">{metrics.inCount} mẻ</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
              {formatWeight(metrics.totalInWeight)}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>

        {/* 2. THÀNH PHẨM RA */}
        <div className="px-2 pt-1 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Ra (OUT)
            </span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded text-[10px] font-bold">
              {metrics.yieldRate}% thu hồi
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-800 tracking-tight">
              {formatWeight(metrics.totalOutWeight)}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>

        {/* 3. ĐỌNG TRÊN CHUYỀN (WIP) */}
        <div className="px-2 pt-1 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Đọng (WIP)
            </span>
            <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-medium">
              {metrics.bottleneckCount || 0} bước
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold font-mono tracking-tight ${
              metrics.wipWeight > 0 ? 'text-amber-700' : 'text-slate-800'
            }`}>
              {formatWeight(metrics.wipWeight)}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>

        {/* 4. CHƯA LÀM (REMAINING) */}
        <div className="px-2 pt-1 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Còn lại
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              KH: {formatWeight(metrics.plannedWeight || 0)}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-slate-800 tracking-tight">
              {formatWeight(metrics.remainingWeight ?? 0)}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>

      </div>

      {/* THANH TỶ LỆ CÂN BẰNG TỐI GIẢN */}
      {totalIn > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${outPercent}%` }}
              title={`Ra: ${outPercent}%`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${wipPercent}%` }}
              title={`Đọng: ${wipPercent}%`}
            />
            <div
              className="h-full bg-slate-300 transition-all duration-300"
              style={{ width: `${lossPercent}%` }}
              title={`Hao: ${lossPercent}%`}
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0 font-medium">
            <span className="text-emerald-700 font-bold">{outPercent}% Ra</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{wipPercent}% Đọng</span>
            <span>•</span>
            <span>{lossPercent}% Hao</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionKPICards;