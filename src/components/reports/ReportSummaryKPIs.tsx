import React from 'react';
import { BatchSummary } from '../../types/log.types';

export type ReportBatchFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';

interface ReportSummaryKPIsProps {
  batches: BatchSummary[];
  activeFilter: ReportBatchFilter;
  onFilterChange: (filter: ReportBatchFilter) => void;
}

export const ReportSummaryKPIs: React.FC<ReportSummaryKPIsProps> = ({
  batches,
  activeFilter,
  onFilterChange
}) => {
  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const totalBatches = batches.length;
  const inProgressBatches = batches.filter(b => b.status === 'IN_PROGRESS');
  const completedBatches = batches.filter(b => b.status === 'COMPLETED');
  const pendingBatches = batches.filter(b => b.status === 'PENDING');
  const todayBatches = batches.filter(b => b.isToday);

  // Tổng hợp khối lượng
  const totalWipInFactory = inProgressBatches.reduce((acc, b) => acc + b.wipWeight, 0);
  const totalOutCompleted = completedBatches.reduce((acc, b) => acc + b.outWeight, 0);
  const totalRemainingPending = pendingBatches.reduce((acc, b) => acc + (b.plannedWeight || b.remainingWeight), 0);
  const todayTotalWeight = todayBatches.reduce((acc, b) => acc + (b.todayInWeight + b.todayOutWeight), 0);

  // Gộp "Lô vận hành" & "Lô sản xuất" thành 1 thẻ thống nhất duy nhất: "LÔ ĐANG VẬN HÀNH"
  const cards = [
    {
      key: 'ALL' as const,
      title: 'TỔNG CỘNG LÔ NHÀ MÁY',
      count: totalBatches,
      unitText: 'lô toàn hệ thống',
      subText: `Kế hoạch: ${formatKg(batches.reduce((a, b) => a + b.plannedWeight, 0))} kg`,
      borderColor: 'border-slate-300',
      activeBg: 'bg-slate-900 text-white',
      badgeClass: 'bg-slate-100 text-slate-800'
    },
    {
      key: 'IN_PROGRESS' as const,
      title: 'LÔ ĐANG VẬN HÀNH',
      count: inProgressBatches.length,
      unitText: 'lô đang trên chuyền',
      subText: todayTotalWeight > 0
        ? `WIP: ${formatKg(totalWipInFactory)} kg • Hôm nay: ${formatKg(todayTotalWeight)} kg`
        : `Đọng WIP xưởng: ${formatKg(totalWipInFactory)} kg`,
      borderColor: 'border-blue-500',
      activeBg: 'bg-blue-600 text-white',
      badgeClass: 'bg-blue-50 text-blue-700',
      hasLivePulse: todayBatches.length > 0
    },
    {
      key: 'COMPLETED' as const,
      title: 'LÔ ĐÃ HOÀN THÀNH',
      count: completedBatches.length,
      unitText: 'lô đã xong xuất xưởng',
      subText: `Thành phẩm OUT: ${formatKg(totalOutCompleted)} kg`,
      borderColor: 'border-emerald-500',
      activeBg: 'bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-50 text-emerald-700'
    },
    {
      key: 'PENDING' as const,
      title: 'LÔ CHƯA LÀM (CHỜ NẠP)',
      count: pendingBatches.length,
      unitText: 'lô chờ nạp nguyên liệu',
      subText: `Chưa làm: ${formatKg(totalRemainingPending)} kg`,
      borderColor: 'border-amber-400',
      activeBg: 'bg-amber-600 text-white',
      badgeClass: 'bg-amber-50 text-amber-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => {
        const isActive = activeFilter === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onFilterChange(c.key)}
            className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
              isActive
                ? `${c.activeBg} shadow-sm border-transparent ring-2 ring-offset-1 ring-slate-400`
                : `bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs`
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold tracking-wider uppercase ${
                isActive ? 'text-white/90' : 'text-slate-500'
              }`}>
                {c.title}
              </span>
              {'hasLivePulse' in c && c.hasLivePulse && (
                <span className="flex h-2 w-2 relative" title="Có mẻ cân vận hành trong ngày">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-black font-mono leading-none tracking-tight">
                {c.count}
              </span>
              <span className={`text-[11px] font-medium truncate ${
                isActive ? 'text-white/80' : 'text-slate-400'
              }`}>
                {c.unitText}
              </span>
            </div>

            <div className={`text-[11px] font-mono mt-1 pt-1.5 border-t truncate ${
              isActive ? 'border-white/20 text-white/90' : 'border-slate-100 text-slate-600'
            }`}>
              {c.subText}
            </div>
          </button>
        );
      })}
    </div>
  );
};
