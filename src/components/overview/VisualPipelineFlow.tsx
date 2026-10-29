import React, { useState } from 'react';
import { ProductionMetrics, BatchSummary, StageWiPSummary } from '../../types/log.types';

interface VisualPipelineFlowProps {
  metrics: ProductionMetrics;
  batchSummaries: BatchSummary[];
  stageWiPList: StageWiPSummary[];
  selectedBatch: string;
  onSelectBatch: (batchId: string) => void;
}

export const VisualPipelineFlow: React.FC<VisualPipelineFlowProps> = ({
  metrics,
  stageWiPList,
  selectedBatch,
  onSelectBatch,
  batchSummaries
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Danh sách các lô
  const uniqueBatches = Array.from(new Set(batchSummaries.map(b => b.batchId))).filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-5">
      {/* Header thanh gọn: Chỉ có Tiêu đề, Lọc lô, và Chuyển chế độ xem */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DE4444]" />
          <h2 className="text-sm font-bold text-slate-900">15 Công Đoạn</h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Lọc theo Lô */}
          <select
            value={selectedBatch}
            onChange={e => onSelectBatch(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#DE4444] cursor-pointer"
          >
            <option value="ALL">Tất cả lô</option>
            {uniqueBatches.map(b => (
              <option key={b} value={b}>Lô: {b}</option>
            ))}
          </select>

          {/* Chuyển chế độ xem */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Bảng Số Liệu
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#DE4444] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Lưới Thẻ
            </button>
          </div>
        </div>
      </div>

      {/* CHẾ ĐỘ 1: BẢNG SỐ LIỆU TRỰC QUAN (15 DÒNG GỌN GÀNG, SỐ HIỆN TỨC THÌ) */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-2 px-3 w-10 text-center">#</th>
                <th className="py-2 px-3 w-20">Mã</th>
                <th className="py-2 px-3">Công đoạn</th>
                <th className="py-2 px-3 text-right text-blue-700 w-28">Vào (kg)</th>
                <th className="py-2 px-3 text-right text-amber-700 w-28">Tồn (kg)</th>
                <th className="py-2 px-3 text-right text-emerald-700 w-28">Ra (kg)</th>
                <th className="py-2 px-3 text-right w-24">Yield</th>
                <th className="py-2 px-3 w-44">Tỷ lệ tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {stageWiPList.map((st, idx) => {
                const hasWiP = st.wipWeight > 0;
                const hasIn = st.inWeight > 0;
                const isIncrease = st.yieldRate > 100;

                // Tỷ lệ đồ họa thanh ngang
                const outPercent = hasIn ? Math.min(100, (st.outWeight / st.inWeight) * 100) : (st.outWeight > 0 ? 100 : 0);
                const wipPercent = hasIn ? Math.min(100 - outPercent, (st.wipWeight / st.inWeight) * 100) : 0;

                return (
                  <tr
                    key={st.processId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasWiP ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {st.processId}
                    </td>

                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 truncate max-w-[200px]" title={st.processName}>
                      {st.processName}
                    </td>

                    {/* Vào (kg) */}
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                      {st.inWeight.toFixed(1)}
                    </td>

                    {/* Tồn (kg) */}
                    <td className="py-2.5 px-3 text-right">
                      {hasWiP ? (
                        <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {st.wipWeight.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>

                    {/* Ra (kg) */}
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {st.outWeight.toFixed(1)}
                    </td>

                    {/* Yield */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isIncrease
                          ? 'bg-purple-100 text-purple-800'
                          : st.yieldRate >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.yieldRate > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-400'
                      }`}>
                        {hasIn ? `${st.yieldRate.toFixed(1)}%` : '-'}
                      </span>
                    </td>

                    {/* Thanh tỷ lệ trực quan đơn giản */}
                    <td className="py-2.5 px-3">
                      <div className="w-full h-2.5 bg-slate-100 rounded overflow-hidden flex items-center">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${outPercent}%` }}
                          title={`Hoàn thành: ${outPercent.toFixed(0)}%`}
                        />
                        <div
                          className="bg-amber-500 h-full transition-all"
                          style={{ width: `${wipPercent}%` }}
                          title={`Tồn: ${wipPercent.toFixed(0)}%`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CHẾ ĐỘ 2: LƯỚI 15 Ô THẺ GỌN GÀNG */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {stageWiPList.map((st, idx) => {
            const hasWiP = st.wipWeight > 0;
            const isIncrease = st.yieldRate > 100;

            return (
              <div
                key={st.processId}
                className={`border rounded-lg p-2.5 flex flex-col justify-between ${
                  hasWiP ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-400">#{idx + 1}</span>
                    <span className="font-mono font-bold text-slate-800">{st.processId}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate mb-2" title={st.processName}>
                    {st.processName}
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-[11px] pb-1.5 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Vào:</span>
                      <strong className="text-blue-700">{st.inWeight.toFixed(1)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Tồn:</span>
                      <strong className={hasWiP ? 'text-amber-700 font-black' : 'text-slate-400'}>
                        {st.wipWeight.toFixed(1)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Ra:</span>
                      <strong className="text-emerald-700">{st.outWeight.toFixed(1)}</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-1.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400 font-sans text-[10px]">Yield:</span>
                  <span className={`font-bold ${
                    isIncrease ? 'text-purple-700' : st.yieldRate >= 70 ? 'text-emerald-700' : 'text-slate-700'
                  }`}>
                    {st.inWeight > 0 ? `${st.yieldRate.toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DÒNG TỔNG KẾT 1 DÒNG DUY NHẤT */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-sans text-slate-500">Hiệu suất:</span>
          <span className="font-bold text-sm text-[#DE4444] bg-red-50 px-2 py-0.5 rounded border border-red-200">
            {metrics.yieldRate.toFixed(1)}% Yield
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Vào: <strong className="text-blue-700">{metrics.totalInWeight.toFixed(1)} kg</strong></span>
          <span>Tồn: <strong className="text-amber-700">{metrics.wipWeight.toFixed(1)} kg</strong></span>
          <span>Ra: <strong className="text-emerald-700">{metrics.totalOutWeight.toFixed(1)} kg</strong></span>
        </div>
      </div>
    </div>
  );
};
