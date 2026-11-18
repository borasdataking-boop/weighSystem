import React, { useState, useMemo } from 'react';
import { BatchSummary } from '../../types/log.types';
import { ReportBatchFilter } from './ReportSummaryKPIs';

interface OverallBatchReportTableProps {
  batches: BatchSummary[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  activeFilter: ReportBatchFilter;
  onFilterChange: (filter: ReportBatchFilter) => void;
}

export const OverallBatchReportTable: React.FC<OverallBatchReportTableProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  activeFilter,
  onFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (activeFilter === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return false;
      if (activeFilter === 'COMPLETED' && b.status !== 'COMPLETED') return false;
      if (activeFilter === 'PENDING' && b.status !== 'PENDING') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          b.batchId.toLowerCase().includes(q) ||
          b.batchName.toLowerCase().includes(q) ||
          (b.origin && b.origin.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [batches, activeFilter, searchTerm]);

  // Tổng hợp chân bảng
  const totals = useMemo(() => {
    return filteredBatches.reduce(
      (acc, b) => {
        acc.planned += b.plannedWeight;
        acc.inWeight += b.inWeight;
        acc.outWeight += b.outWeight;
        acc.wipWeight += b.wipWeight;
        acc.remaining += b.remainingWeight;
        acc.todayIn += b.todayInWeight;
        acc.todayOut += b.todayOutWeight;
        return acc;
      },
      { planned: 0, inWeight: 0, outWeight: 0, wipWeight: 0, remaining: 0, todayIn: 0, todayOut: 0 }
    );
  }, [filteredBatches]);

  // Xuất file CSV báo cáo tổng quát
  const handleExportCSV = () => {
    const headers = [
      'Mã lô',
      'Tên lô sản xuất',
      'Trạng thái',
      'Vận hành hôm nay',
      'Kế hoạch (kg)',
      'Tổng IN (kg)',
      'IN hôm nay (kg)',
      'Tổng OUT (kg)',
      'OUT hôm nay (kg)',
      'Đọng WIP (kg)',
      'Chưa làm (kg)',
      'Tiến độ (%)',
      'Tỷ lệ thu hồi (%)'
    ];

    const rows = filteredBatches.map(b => [
      `"${b.batchId}"`,
      `"${b.batchName}"`,
      `"${b.status === 'COMPLETED' ? 'Đã xong' : b.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm'}"`,
      `"${b.isToday ? 'Có' : 'Không'}"`,
      b.plannedWeight.toFixed(2),
      b.inWeight.toFixed(2),
      b.todayInWeight.toFixed(2),
      b.outWeight.toFixed(2),
      b.todayOutWeight.toFixed(2),
      b.wipWeight.toFixed(2),
      b.remainingWeight.toFixed(2),
      b.progressPercent.toFixed(1),
      b.yieldRate.toFixed(1)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_tong_quat_lo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs mb-8 overflow-hidden">
      {/* Header của Bảng 1 */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-[#DE4444] text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                BẢNG BÁO CÁO TỔNG QUÁT LÔ SẢN XUẤT
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                {filteredBatches.length} / {batches.length} lô
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi toàn cảnh tiến độ nạp nguyên liệu (IN), hoàn thành (OUT), tồn đọng chuyền (WIP) của các lô trong nhà máy.
            </p>
          </div>

          {/* Công cụ tìm kiếm & Xuất báo cáo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm mã lô, tên lô..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-56 pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DE4444] focus:border-transparent"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
              title="Xuất file CSV"
            >
              <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Thanh tab bộ lọc: Đã gom "Lô vận hành" và "Lô sản xuất" thành 1 mục thống nhất */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Lọc theo:</span>
          {[
            { key: 'ALL' as const, label: 'Tất cả lô', count: batches.length },
            {
              key: 'IN_PROGRESS' as const,
              label: 'Đang vận hành',
              count: batches.filter(b => b.status === 'IN_PROGRESS').length,
              hasPulse: batches.some(b => b.isToday)
            },
            { key: 'COMPLETED' as const, label: 'Đã xong (Hoàn thành)', count: batches.filter(b => b.status === 'COMPLETED').length },
            { key: 'PENDING' as const, label: 'Chưa làm (Chờ nạp)', count: batches.filter(b => b.status === 'PENDING').length }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                activeFilter === tab.key
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {'hasPulse' in tab && tab.hasPulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Có mẻ cân hôm nay" />
              )}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bảng dữ liệu chi tiết */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-3 w-32">Mã lô</th>
              <th className="py-3 px-3">Tên lô sản xuất</th>
              <th className="py-3 px-3 text-center w-28">Trạng thái</th>
              <th className="py-3 px-3 text-right w-24">Kế hoạch</th>
              <th className="py-3 px-3 text-right w-28 bg-blue-50/50">Vào (IN)</th>
              <th className="py-3 px-3 text-right w-28 bg-emerald-50/50">Ra (OUT)</th>
              <th className="py-3 px-3 text-right w-28 bg-amber-50/50">Đọng WIP</th>
              <th className="py-3 px-3 text-right w-24">Chưa làm</th>
              <th className="py-3 px-3 w-32 text-center">Tiến độ & Yield</th>
              <th className="py-3 px-3 text-center w-28">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 font-sans">
                  Không tìm thấy lô nào thỏa mãn điều kiện lọc.
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch, index) => {
                const isSelected = selectedBatchId === batch.batchId;
                const isDone = batch.status === 'COMPLETED';
                const isPending = batch.status === 'PENDING';
                const hasWip = batch.wipWeight > 0;

                return (
                  <tr
                    key={batch.batchId}
                    onClick={() => onSelectBatch(batch.batchId)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/70 border-l-4 border-l-[#DE4444]'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* STT */}
                    <td className="py-3 px-3 text-center text-slate-400">
                      {index + 1}
                    </td>

                    {/* Mã lô */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm tracking-tight text-[#DE4444]">
                          {batch.batchId}
                        </span>
                        {batch.isToday && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-red-100 text-[#DE4444]"
                            title="Lô có hoạt động cân hôm nay"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tên lô sản xuất */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-900 truncate max-w-[220px]" title={batch.batchName}>
                        {batch.batchName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {batch.origin ? `${batch.origin} • ` : ''}
                        {batch.startDate ? `Bắt đầu: ${batch.startDate}` : ''}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isPending
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isDone ? 'bg-emerald-500' : isPending ? 'bg-slate-400' : 'bg-blue-500'
                        }`} />
                        {isDone ? 'Đã xong' : isPending ? 'Chưa làm' : 'Đang làm'}
                      </span>
                    </td>

                    {/* Kế hoạch (Planned) */}
                    <td className="py-3 px-3 text-right text-slate-700 font-semibold">
                      {formatKg(batch.plannedWeight)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">kg</span>
                    </td>

                    {/* IN - Nạp vào */}
                    <td className="py-3 px-3 text-right bg-blue-50/20">
                      <div className="font-bold text-blue-700">
                        {formatKg(batch.inWeight)}
                        <span className="text-[10px] text-blue-400 font-normal ml-0.5">kg</span>
                      </div>
                      {batch.todayInWeight > 0 && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          Hôm nay: +{formatKg(batch.todayInWeight)} kg
                        </div>
                      )}
                    </td>

                    {/* OUT - Đầu ra */}
                    <td className="py-3 px-3 text-right bg-emerald-50/20">
                      <div className="font-bold text-emerald-700">
                        {formatKg(batch.outWeight)}
                        <span className="text-[10px] text-emerald-400 font-normal ml-0.5">kg</span>
                      </div>
                      {batch.todayOutWeight > 0 && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          Hôm nay: +{formatKg(batch.todayOutWeight)} kg
                        </div>
                      )}
                    </td>

                    {/* WIP - Đang đọng */}
                    <td className="py-3 px-3 text-right bg-amber-50/20">
                      <div className={`font-bold ${hasWip ? 'text-amber-800 font-black' : 'text-slate-400'}`}>
                        {formatKg(batch.wipWeight)}
                        <span className="text-[10px] text-amber-500 font-normal ml-0.5">kg</span>
                      </div>
                      {hasWip && (
                        <div className="text-[10px] text-amber-700 font-sans">
                          {batch.activeStagesCount ? `${batch.activeStagesCount} bước đọng` : 'Trên chuyền'}
                        </div>
                      )}
                    </td>

                    {/* Chưa làm */}
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatKg(batch.remainingWeight)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">kg</span>
                    </td>

                    {/* Tiến độ & Thu hồi (Yield) */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Tiến độ:</span>
                        <span className="font-bold font-mono text-slate-800">{batch.progressPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-emerald-500' : 'bg-[#DE4444]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, batch.progressPercent))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>Yield:</span>
                        <span className="text-slate-700 font-semibold">{batch.yieldRate.toFixed(1)}%</span>
                      </div>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-3 px-3 text-center font-sans">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectBatch(batch.batchId);
                          const el = document.getElementById('batch-stage-detail-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#DE4444] text-white shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {isSelected ? 'Đang xem' : 'Soi bước'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Dòng Tổng cộng chân bảng */}
          {filteredBatches.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800 font-mono">
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] font-sans">
                  Tổng cộng ({filteredBatches.length} lô):
                </td>
                <td className="py-3 px-3 text-right">
                  {formatKg(totals.planned)} kg
                </td>
                <td className="py-3 px-3 text-right text-blue-800 bg-blue-100/40">
                  {formatKg(totals.inWeight)} kg
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 bg-emerald-100/40">
                  {formatKg(totals.outWeight)} kg
                </td>
                <td className="py-3 px-3 text-right text-amber-900 bg-amber-100/40 font-black">
                  {formatKg(totals.wipWeight)} kg
                </td>
                <td className="py-3 px-3 text-right text-slate-700">
                  {formatKg(totals.remaining)} kg
                </td>
                <td colSpan={2} className="py-3 px-3 text-center font-sans text-xs text-slate-500">
                  Đang soi lô: <strong className="text-[#DE4444] font-mono">{selectedBatchId}</strong>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
