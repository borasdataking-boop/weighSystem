import React, { useState } from 'react';
import { StageWiPSummary } from '../../types/log.types';

interface VisualFactoryPipelineProps {
  stageWiPList: StageWiPSummary[];
  selectedBatch: string;
}

interface ClusterData {
  id: string;
  name: string;
  stepRange: string;
  stageIds: string[];
  inWeight: number;
  outWeight: number;
  wipWeight: number;
  stages: StageWiPSummary[];
  note: string;
}

export const VisualFactoryPipeline: React.FC<VisualFactoryPipelineProps> = ({
  stageWiPList,
  selectedBatch
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  const formatWeight = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Định nghĩa 4 cụm công đoạn chuẩn nhà máy chế biến tôm
  const clusters: ClusterData[] = [
    {
      id: 'PREP',
      name: 'Tiếp nhận & Sơ chế',
      stepRange: 'CD001 → CD004',
      stageIds: ['CD001', 'CD002', 'CD003', 'CD004'],
      inWeight: 0,
      outWeight: 0,
      wipWeight: 0,
      stages: [],
      note: 'Tiếp nhận, phân cỡ, rửa và bóc vỏ'
    },
    {
      id: 'SOAKING',
      name: 'Ngâm quay & Tẩm bột',
      stepRange: 'CD005 → CD007',
      stageIds: ['CD005', 'CD006', 'CD007'],
      inWeight: 0,
      outWeight: 0,
      wipWeight: 0,
      stages: [],
      note: 'Ngấm nước/phụ gia & tẩm bột'
    },
    {
      id: 'COOK_FREEZE',
      name: 'Nấu hấp & Cấp đông',
      stepRange: 'CD008 → CD011',
      stageIds: ['CD008', 'CD009', 'CD010', 'CD011'],
      inWeight: 0,
      outWeight: 0,
      wipWeight: 0,
      stages: [],
      note: 'Hấp nhiệt, làm nguội & tách vỏ'
    },
    {
      id: 'PACKAGING',
      name: 'Đóng gói & Thành phẩm',
      stepRange: 'CD012 → CD015',
      stageIds: ['CD012', 'CD013', 'CD014', 'CD015'],
      inWeight: 0,
      outWeight: 0,
      wipWeight: 0,
      stages: [],
      note: 'Cấp đông IQF, đóng gói xuất kho'
    }
  ];

  // Map dữ liệu mẻ cân thực tế vào 4 cụm
  clusters.forEach(c => {
    c.stages = stageWiPList.filter(s => c.stageIds.includes(s.processId));
    // Vào cụm: lấy IN lớn nhất trong cụm hoặc đầu vào của bước đầu
    const firstActiveIn = c.stages.find(s => s.inWeight > 0);
    c.inWeight = firstActiveIn ? firstActiveIn.inWeight : 0;
    // Ra cụm: lấy OUT của bước cuối cùng trong cụm
    const lastActiveOut = [...c.stages].reverse().find(s => s.outWeight > 0);
    c.outWeight = lastActiveOut ? lastActiveOut.outWeight : 0;
    // Tổng WIP của cụm
    c.wipWeight = c.stages.reduce((acc, s) => acc + s.wipWeight, 0);
  });

  const activeCluster = clusters.find(c => c.id === selectedClusterId);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs mb-5">
      {/* Tiêu đề thanh sơ đồ */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-900" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
            Sơ đồ Chuyền Sản Xuất 4 Cụm Công Nghệ {selectedBatch !== 'ALL' ? `(Lô ${selectedBatch})` : ''}
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Bấm vào từng cụm để xem chi tiết các máy bên trong
        </span>
      </div>

      {/* 4 Cụm kết nối bằng luồng trực quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {clusters.map((c, idx) => {
          const isSelected = selectedClusterId === c.id;
          const hasWip = c.wipWeight > 0;
          const isActive = c.inWeight > 0 || c.outWeight > 0;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedClusterId(isSelected ? null : c.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 shadow-xs'
                  : hasWip
                  ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                  : isActive
                  ? 'border-slate-200 hover:border-slate-300 bg-white'
                  : 'border-slate-100 bg-slate-50/40 opacity-75'
              }`}
            >
              {/* Header Cụm */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {c.stepRange}
                    </span>
                  </div>

                  {hasWip ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Đọng {formatWeight(c.wipWeight)} kg
                    </span>
                  ) : isActive ? (
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Đang chạy
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Chờ
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 truncate" title={c.name}>
                  {c.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                  {c.note}
                </p>

                {/* 2 Con số Vào - Ra của cụm */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded border border-slate-100 text-xs font-mono mb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Vào cụm:</span>
                    <strong className="text-slate-900">{formatWeight(c.inWeight)}</strong> kg
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Ra cụm:</span>
                    <strong className="text-slate-900">{formatWeight(c.outWeight)}</strong> kg
                  </div>
                </div>
              </div>

              {/* Chân thẻ */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{c.stages.length} công đoạn</span>
                <span className="text-slate-700 font-semibold hover:underline">
                  {isSelected ? 'Đóng ▲' : 'Xem máy ▼'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chi tiết các bước con khi bấm vào 1 cụm */}
      {activeCluster && (
        <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Các công đoạn bên trong:</span>
              <span className="text-[#C53030]">{activeCluster.name} ({activeCluster.stepRange})</span>
            </h4>
            <button
              type="button"
              onClick={() => setSelectedClusterId(null)}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕ Đóng chi tiết
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {activeCluster.stages.map(st => {
              const diff = st.outWeight - st.inWeight;
              const hasWip = st.wipWeight > 0;

              return (
                <div
                  key={st.processId}
                  className={`p-2.5 rounded border text-xs font-mono ${
                    hasWip ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{st.processId}</span>
                    {hasWip && (
                      <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-1 py-0.2 rounded">
                        Đọng {formatWeight(st.wipWeight)} kg
                      </span>
                    )}
                  </div>
                  <div className="font-sans font-medium text-slate-800 text-xs truncate mb-1.5" title={st.processName}>
                    {st.processName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>V: <strong>{formatWeight(st.inWeight)}</strong></span>
                    <span>R: <strong>{formatWeight(st.outWeight)}</strong></span>
                    {st.inWeight > 0 && st.outWeight > 0 && (
                      <span className="font-bold text-slate-700">
                        {diff > 0 ? `+${formatWeight(diff)}` : formatWeight(diff)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualFactoryPipeline;
