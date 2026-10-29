import React, { useState } from 'react';
import { StageWiPSummary } from '../../types/log.types';

interface ProductionFlowChartProps {
  stageWiPList: StageWiPSummary[];
  overallYield: number;
}

export const ProductionFlowChart: React.FC<ProductionFlowChartProps> = ({
  stageWiPList
}) => {
  // 2 chế độ hiển thị số liệu trực tiếp: Thanh ngang so sánh hoặc Lưới Andon giám sát
  const [displayMode, setDisplayMode] = useState<'bars' | 'grid'>('bars');

  // Tìm giá trị max để tính tỷ lệ thanh ngang
  const maxWeight = Math.max(
    ...stageWiPList.map(s => Math.max(s.inWeight, s.outWeight, s.wipWeight)),
    10
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Thanh điều khiển trên biểu đồ: Chuyển dạng & Chú giải */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDisplayMode('bars')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              displayMode === 'bars'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Thanh Ngang Hiện Số
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('grid')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              displayMode === 'grid'
                ? 'bg-white text-[#DE4444] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Lưới Giám Sát (Andon)
          </button>
        </div>

        {/* Chú giải màu sắc ngắn gọn */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
            <span>Vào (IN)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span>Tồn (WiP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
            <span>Ra (OUT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-800" />
            <span>% Yield</span>
          </div>
        </div>
      </div>

      {/* CHẾ ĐỘ 1: BIỂU ĐỒ THANH NGANG IN SỐ TRỰC TIẾP (THẤY SỐ LIỀN) */}
      {displayMode === 'bars' && (
        <div className="flex flex-col divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
          {stageWiPList.map((st, idx) => {
            const inWidthPercent = Math.max(2, (st.inWeight / maxWeight) * 100);
            const wipWidthPercent = Math.max(0, (st.wipWeight / maxWeight) * 100);
            const outWidthPercent = Math.max(2, (st.outWeight / maxWeight) * 100);

            const hasWiP = st.wipWeight > 0;
            const isIncrease = st.yieldRate > 100;

            return (
              <div
                key={st.processId}
                className={`py-2 px-2 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  hasWiP ? 'bg-amber-50/30' : 'hover:bg-slate-50'
                }`}
              >
                {/* 1. Tên công đoạn & Số thứ tự */}
                <div className="sm:w-48 shrink-0 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-500 font-mono font-bold text-[10.5px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {st.processId}
                      </span>
                      {hasWiP && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Có tồn chuyền" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate" title={st.processName}>
                      {st.processName}
                    </div>
                  </div>
                </div>

                {/* 2. Thanh biểu đồ tỷ lệ có in số kg trực tiếp trên thanh */}
                <div className="flex-1 flex flex-col gap-1 min-w-[260px]">
                  {/* Dòng Vào (IN) */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-10 text-slate-400 font-sans text-[10px]">Vào:</span>
                    <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden flex items-center">
                      <div
                        className="bg-blue-600 h-full rounded transition-all duration-300 flex items-center px-1.5 min-w-[32px]"
                        style={{ width: `${st.inWeight > 0 ? inWidthPercent : 0}%` }}
                      >
                        {st.inWeight > 0 && (
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {st.inWeight.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {st.inWeight === 0 && (
                        <span className="text-[10px] text-slate-400 px-1.5">0.0 kg</span>
                      )}
                    </div>
                    <span className="w-14 text-right font-bold text-blue-700">
                      {st.inWeight.toFixed(1)} kg
                    </span>
                  </div>

                  {/* Dòng Tồn (WiP) */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-10 text-slate-400 font-sans text-[10px]">Tồn:</span>
                    <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden flex items-center">
                      <div
                        className="bg-amber-500 h-full rounded transition-all duration-300 flex items-center px-1.5 min-w-[32px]"
                        style={{ width: `${hasWiP ? wipWidthPercent : 0}%` }}
                      >
                        {hasWiP && (
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {st.wipWeight.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {!hasWiP && (
                        <span className="text-[10px] text-slate-400 px-1.5">0.0 kg</span>
                      )}
                    </div>
                    <span className={`w-14 text-right font-bold ${hasWiP ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
                      {st.wipWeight.toFixed(1)} kg
                    </span>
                  </div>

                  {/* Dòng Ra (OUT) */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-10 text-slate-400 font-sans text-[10px]">Ra:</span>
                    <div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden flex items-center">
                      <div
                        className="bg-emerald-600 h-full rounded transition-all duration-300 flex items-center px-1.5 min-w-[32px]"
                        style={{ width: `${st.outWeight > 0 ? outWidthPercent : 0}%` }}
                      >
                        {st.outWeight > 0 && (
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {st.outWeight.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {st.outWeight === 0 && (
                        <span className="text-[10px] text-slate-400 px-1.5">0.0 kg</span>
                      )}
                    </div>
                    <span className="w-14 text-right font-bold text-emerald-700">
                      {st.outWeight.toFixed(1)} kg
                    </span>
                  </div>
                </div>

                {/* 3. Tỷ lệ Yield in lớn ngay bên phải */}
                <div className="sm:w-20 shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans sm:mb-0.5">Yield:</span>
                  <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                    isIncrease
                      ? 'bg-purple-100 text-purple-800'
                      : st.yieldRate >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : st.yieldRate > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {st.inWeight > 0 ? `${st.yieldRate.toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHẾ ĐỘ 2: LƯỚI GIÁM SÁT ANDON 15 Ô (SỐ LIỆU TO RÕ, ĐẬP VÀO MẮT LIỀN) */}
      {displayMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stageWiPList.map((st, idx) => {
            const hasWiP = st.wipWeight > 0;
            const isIncrease = st.yieldRate > 100;

            return (
              <div
                key={st.processId}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all shadow-xs ${
                  hasWiP
                    ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Mã khâu & Cờ cảnh báo */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-slate-400">#{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      {hasWiP && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wide">
                          Tồn ứ
                        </span>
                      )}
                      <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {st.processId}
                      </span>
                    </div>
                  </div>

                  {/* Tên khâu */}
                  <div className="font-bold text-slate-900 text-xs mb-3 truncate" title={st.processName}>
                    {st.processName}
                  </div>

                  {/* 3 Số liệu chính in to rõ ràng */}
                  <div className="flex flex-col gap-1.5 font-mono text-xs pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans text-[11px]">Vào:</span>
                      <strong className="text-blue-700 text-sm">{st.inWeight.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span></strong>
                    </div>

                    <div className="flex items-center justify-between bg-amber-50/80 px-1 py-0.5 rounded">
                      <span className="text-amber-800 font-sans text-[11px] font-semibold">Tồn (WiP):</span>
                      <strong className={`text-sm ${hasWiP ? 'text-amber-700 font-black' : 'text-slate-400 font-normal'}`}>
                        {st.wipWeight.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span>
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-sans text-[11px]">Ra:</span>
                      <strong className="text-emerald-700 text-sm">{st.outWeight.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span></strong>
                    </div>
                  </div>
                </div>

                {/* Yield % dưới cùng in cực to */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Yield:</span>
                  <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                    isIncrease
                      ? 'bg-purple-100 text-purple-800'
                      : st.yieldRate >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : st.yieldRate > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {st.inWeight > 0 ? `${st.yieldRate.toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
