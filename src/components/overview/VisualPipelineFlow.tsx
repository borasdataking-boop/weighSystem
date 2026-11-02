import React from 'react';
import { StageWiPSummary } from '../../types/log.types';

interface VisualPipelineFlowProps {
  stageWiPList: StageWiPSummary[];
}

export const VisualPipelineFlow: React.FC<VisualPipelineFlowProps> = ({ stageWiPList }) => {
  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  // Đếm số công đoạn có hàng còn đọng (WIP > 0)
  const bottleneckStages = stageWiPList.filter(s => s.wipWeight > 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs mb-5 overflow-hidden">
      {/* Header thanh gọn */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DE4444]" />
          <h2 className="text-sm font-bold text-slate-900">
            Công đoạn sản xuất
          </h2>
        </div>

        <div>
          {bottleneckStages.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Có {bottleneckStages.length} công đoạn còn hàng đọng
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Tất cả công đoạn đều thông suốt
            </span>
          )}
        </div>
      </div>

      {/* Bảng tiến độ theo đúng 3 chỉ số: In, Out và WIP */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-3 w-20">Mã</th>
              <th className="py-2.5 px-3">Công đoạn</th>
              <th className="py-2.5 px-4 text-right text-blue-700 w-32">Vào (kg)</th>
              <th className="py-2.5 px-4 text-right text-emerald-700 w-32">Ra (kg)</th>
              <th className="py-2.5 px-4 text-right text-amber-700 w-36">Đọng lại (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {stageWiPList.map((st, idx) => {
              const hasWiP = st.wipWeight > 0;
              const hasIn = st.inWeight > 0;

              return (
                <tr
                  key={st.processId}
                  className={`transition-colors ${
                    hasWiP
                      ? 'bg-amber-50/40 hover:bg-amber-50/70'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* STT */}
                  <td className="py-2.5 px-4 text-center text-slate-400 font-sans">
                    {idx + 1}
                  </td>

                  {/* Mã CĐ */}
                  <td className="py-2.5 px-3 text-slate-700 font-bold">
                    {st.processId}
                  </td>

                  {/* Tên công đoạn */}
                  <td className="py-2.5 px-3 font-sans text-slate-900 truncate max-w-[280px]" title={st.processName}>
                    {st.processName}
                  </td>

                  {/* 1. Vào (IN) */}
                  <td className="py-2.5 px-4 text-right font-bold text-blue-700">
                    {hasIn ? formatWeight(st.inWeight) : <span className="text-slate-300 font-normal">0,0</span>}
                  </td>

                  {/* 2. Ra (OUT) */}
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                    {st.outWeight > 0 ? formatWeight(st.outWeight) : <span className="text-slate-300 font-normal">0,0</span>}
                  </td>

                  {/* 3. Đọng lại (WIP) */}
                  <td className="py-2.5 px-4 text-right">
                    {hasWiP ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-bold text-amber-800 bg-amber-100 border border-amber-300">
                        {formatWeight(st.wipWeight)}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal font-sans">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
