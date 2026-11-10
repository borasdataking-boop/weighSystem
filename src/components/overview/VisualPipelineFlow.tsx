import React, { useState } from 'react';
import { StageWiPSummary } from '../../types/log.types';

interface VisualPipelineFlowProps {
  stageWiPList: StageWiPSummary[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  selectedBatch?: string;
}

export const VisualPipelineFlow: React.FC<VisualPipelineFlowProps> = ({
  stageWiPList,
  isExpanded: controlledExpanded,
  onToggleExpand,
  selectedBatch = 'ALL'
}) => {
  const [localExpanded, setLocalExpanded] = useState<boolean>(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;

  const toggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded(prev => !prev);
    }
  };

  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Tổng đọng trên các bước
  const totalWip = stageWiPList.reduce((acc, s) => acc + s.wipWeight, 0);
  const stagesWithWip = stageWiPList.filter(s => s.wipWeight > 0).length;

  return (
    <div id="pipeline-stages-section" className="bg-white border border-slate-200/90 rounded-lg shadow-2xs mb-5 overflow-hidden transition-all scroll-mt-4">
      {/* Tiêu đề xem chi tiết công đoạn */}
      <button
        type="button"
        onClick={toggle}
        className="w-full p-3.5 sm:px-4 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <span className="font-bold text-slate-900">
            Chi tiết {stageWiPList.length} công đoạn quy trình {selectedBatch !== 'ALL' ? `(Lô ${selectedBatch})` : ''}
          </span>

          {stagesWithWip > 0 ? (
            <span className="text-xs text-slate-500 font-normal">
              • <strong className="text-amber-800 font-semibold">{stagesWithWip} công đoạn</strong> đang có hàng đọng ({formatWeight(totalWip)} kg)
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">
              • Chuyền thông suốt
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
          <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Nội dung chi tiết các bước */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-20">Mã bước</th>
                  <th className="py-2.5 px-3">Tên công đoạn</th>
                  <th className="py-2.5 px-3 text-right w-24">Vào (kg)</th>
                  <th className="py-2.5 px-3 text-right w-24">Ra (kg)</th>
                  <th className="py-2.5 px-3 text-right w-24">Đang đọng (kg)</th>
                  <th className="py-2.5 px-3 text-right w-24">Chênh lệch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stageWiPList.map((st, idx) => {
                  const hasWiP = st.wipWeight > 0;
                  const hasIn = st.inWeight > 0;
                  const hasOut = st.outWeight > 0;
                  const diff = st.outWeight - st.inWeight;

                  return (
                    <tr
                      key={st.processId}
                      className={`transition-colors ${hasWiP ? 'bg-amber-50/15 hover:bg-amber-50/30' : 'hover:bg-slate-50/70'}`}
                    >
                      {/* STT */}
                      <td className="py-2 px-3 text-center text-slate-400 font-sans text-xs">
                        {idx + 1}
                      </td>

                      {/* Mã bước */}
                      <td className="py-2 px-3 font-semibold text-slate-700">
                        {st.processId}
                      </td>

                      {/* Tên công đoạn */}
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        {st.processName}
                      </td>

                      {/* Vào */}
                      <td className="py-2 px-3 text-right font-medium text-slate-800">
                        {hasIn ? formatWeight(st.inWeight) : <span className="text-slate-300 font-normal">0,0</span>}
                      </td>

                      {/* Ra */}
                      <td className="py-2 px-3 text-right font-medium text-slate-800">
                        {hasOut ? formatWeight(st.outWeight) : <span className="text-slate-300 font-normal">0,0</span>}
                      </td>

                      {/* Đang đọng */}
                      <td className="py-2 px-3 text-right">
                        {hasWiP ? (
                          <span className="text-amber-900 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80">
                            {formatWeight(st.wipWeight)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal font-sans">0,0</span>
                        )}
                      </td>

                      {/* Chênh lệch */}
                      <td className="py-2 px-3 text-right font-sans">
                        {hasIn && hasOut ? (
                          diff > 0 ? (
                            <span className="font-semibold text-slate-800 font-mono">
                              +{formatWeight(diff)}
                            </span>
                          ) : diff < 0 ? (
                            <span className="font-semibold text-slate-700 font-mono">
                              {formatWeight(diff)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0,0</span>
                          )
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualPipelineFlow;