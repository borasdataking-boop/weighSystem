import React from 'react';
import { ProductionMetrics } from '../../types/log.types';

interface ProductionKPICardsProps {
  metrics: ProductionMetrics;
  selectedBatch: string;
}

export const ProductionKPICards: React.FC<ProductionKPICardsProps> = ({ metrics, selectedBatch }) => {
  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const getTonText = (val: number) => {
    if (val >= 1000) {
      return `≈ ${(val / 1000).toFixed(1)} tấn`;
    }
    return null;
  };

  const hasPlanned = (metrics.plannedWeight || 0) > 0;
  const remainingVal = metrics.remainingWeight ?? 0;

  // Tính tỷ lệ thanh cân đối trực quan
  const totalIn = metrics.totalInWeight;
  const outPercent = totalIn > 0 ? Math.min(100, Number(((metrics.totalOutWeight / totalIn) * 100).toFixed(1))) : 0;
  const wipPercent = totalIn > 0 ? Math.min(100 - outPercent, Number(((metrics.wipWeight / totalIn) * 100).toFixed(1))) : 0;
  const lossPercent = totalIn > 0 ? Math.max(0, Number((100 - outPercent - wipPercent).toFixed(1))) : 0;
  const lossWeight = Math.max(0, totalIn - metrics.totalOutWeight - metrics.wipWeight);

  return (
    <div className="mb-5">
      {/* 4 THẺ SỐ CỐT LÕI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. NGUYÊN LIỆU VÀO (IN) */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Nguyên liệu vào (IN)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {metrics.inCount} mẻ
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatWeight(metrics.totalInWeight)}
            </span>
            <span className="text-xs font-medium text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            {getTonText(metrics.totalInWeight) ? `${getTonText(metrics.totalInWeight)} • ` : ''}Tiếp nhận đầu chuyền
          </div>
        </div>

        {/* 2. THÀNH PHẨM RA (OUT) */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Thành phẩm ra (OUT)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {metrics.outCount} mẻ
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatWeight(metrics.totalOutWeight)}
            </span>
            <span className="text-xs font-medium text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center justify-between">
            <span>{getTonText(metrics.totalOutWeight) || 'Xuất xưởng'}</span>
            <span className="font-medium text-slate-600">
              Thu hồi: <strong className="text-slate-800 font-mono">{metrics.yieldRate}%</strong>
            </span>
          </div>
        </div>

        {/* 3. ĐỌNG TRÊN CHUYỀN (WIP) */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Đọng trên chuyền (WIP)
            </span>
            <span className="text-slate-400 text-[11px]">
              {metrics.bottleneckCount ? `${metrics.bottleneckCount} bước` : 'Các máy'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatWeight(metrics.wipWeight)}
            </span>
            <span className="text-xs font-medium text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            {metrics.wipWeight > 0 ? (
              <span className="text-amber-800 font-medium">Hàng đang chế biến dở dang</span>
            ) : (
              'Không có hàng đọng'
            )}
          </div>
        </div>

        {/* 4. CÒN CHƯA LÀM */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Còn chưa làm
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {selectedBatch !== 'ALL' ? `Lô ${selectedBatch}` : 'Toàn bộ'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatWeight(remainingVal)}
            </span>
            <span className="text-xs font-medium text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            {hasPlanned ? `Kế hoạch: ${formatWeight(metrics.plannedWeight || 0)} kg` : 'Chưa đặt kế hoạch'}
          </div>
        </div>
      </div>

      {/* THANH CÂN ĐỐI NGUYÊN LIỆU TRỰC QUAN (NHÌN PHÁT BIẾT HÀNG ĐI ĐÂU) */}
      {totalIn > 0 && (
        <div className="mt-3 bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-2">
            <span className="font-bold text-slate-800">
              Cân đối nguyên liệu đầu vào ({formatWeight(totalIn)} kg):
            </span>
            <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 shrink-0" />
                <span>Thành phẩm: <strong>{formatWeight(metrics.totalOutWeight)} kg</strong> ({outPercent}%)</span>
              </span>
              {metrics.wipWeight > 0 && (
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
                  <span>Đọng trên chuyền: <strong>{formatWeight(metrics.wipWeight)} kg</strong> ({wipPercent}%)</span>
                </span>
              )}
              {lossPercent > 0 && (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 shrink-0" />
                  <span>Hao hụt sơ chế vỏ: <strong>{formatWeight(lossWeight)} kg</strong> ({lossPercent}%)</span>
                </span>
              )}
            </div>
          </div>

          {/* Thanh phân bổ ngang tỷ lệ */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${outPercent}%` }}
              title={`Thành phẩm ra: ${outPercent}%`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${wipPercent}%` }}
              title={`Đọng trên chuyền: ${wipPercent}%`}
            />
            <div
              className="h-full bg-slate-300 transition-all duration-300"
              style={{ width: `${lossPercent}%` }}
              title={`Hao hụt sơ chế vỏ: ${lossPercent}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductionKPICards;
