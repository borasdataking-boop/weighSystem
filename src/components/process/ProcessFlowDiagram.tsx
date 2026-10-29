import React from 'react';
import { ProcessStage } from '../../types/process.types';
import { StationWeigh } from '../../types/station.types';

const FLOW_ROWS = [
  { row: 1, label: 'Khâu 1', bg: '#FCE4C8', border: '#E6A760', text: '#7C440B' },
  { row: 2, label: 'Khâu 2', bg: '#FCD2D8', border: '#DF8A97', text: '#8B1D2C' },
  { row: 3, label: 'Khâu 3', bg: '#E8DDF2', border: '#BE9FD8', text: '#59267C' },
  { row: 4, label: 'Khâu 4', bg: '#D6F2D6', border: '#8ACB8A', text: '#1B631B' },
  { row: 5, label: 'Khâu 5', bg: '#FCD5CF', border: '#EA8A7C', text: '#8A2417' },
  { row: 6, label: 'Khâu 6', bg: '#DBE7FA', border: '#98BBEA', text: '#1C4D8C' },
  { row: 7, label: 'Khâu 7', bg: '#D5DBE4', border: '#8E9BB0', text: '#2B3D52' },
  { row: 8, label: 'Khâu 8', bg: '#CBF1F1', border: '#67CCCC', text: '#0D5F5F' },
  { row: 9, label: 'Khâu 9', bg: '#FCF4B8', border: '#DBC64A', text: '#715E0A' },
  { row: 10, label: 'Khâu 10', bg: '#FCE4C8', border: '#E6A760', text: '#7C440B' }
];

interface ProcessFlowDiagramProps {
  stages: ProcessStage[];
  stations: StationWeigh[];
  filteredStageIds: Set<string>;
  onSelectStage: (stageId: string) => void;
}

export const ProcessFlowDiagram: React.FC<ProcessFlowDiagramProps> = ({
  stages,
  stations,
  filteredStageIds,
  onSelectStage
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs overflow-x-auto flex flex-col gap-4">
      {/* Banner đỏ tiêu chuẩn */}
      <div className="bg-[#DE4444] text-white px-4 py-2.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Sơ đồ ma trận luồng chế biến (10 Khâu x 4 Nhánh chuyền)
        </div>
        <div className="text-xs text-white/90 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Bấm vào công đoạn để xem trạm cân hoặc điều chuyển máy
        </div>
      </div>

      {/* Board 10 dòng x 4 cột */}
      <div className="flex flex-col gap-3 min-w-[1020px] pt-2">
        {/* Header 4 Nhánh Chuyền */}
        <div className="grid grid-cols-[130px_repeat(4,1fr)] gap-3.5 items-center pb-2 border-b border-slate-200 text-xs font-bold text-slate-600">
          <div className="text-center text-[11px] uppercase tracking-wider text-slate-400">Tiến trình</div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-center text-slate-700">
            Nhánh 1: Tiếp Nhận & Sơ Chế
          </div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-center text-slate-700">
            Nhánh 2: Phân Loại & Định Hình
          </div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-center text-slate-700">
            Nhánh 3: Chế Biến & Tẩm Gia Vị
          </div>
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-center text-slate-700">
            Nhánh 4: Cấp Đông & Đóng Gói
          </div>
        </div>

        {FLOW_ROWS.map(rowInfo => {
          const rowStages = stages.filter(s => s.row === rowInfo.row);

          return (
            <div key={rowInfo.row} className="grid grid-cols-[130px_repeat(4,1fr)] gap-3.5 items-center">
              {/* Step Pill */}
              <div
                className="h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs uppercase tracking-wider border shadow-xs select-none"
                style={{
                  backgroundColor: rowInfo.bg,
                  borderColor: rowInfo.border,
                  color: rowInfo.text
                }}
              >
                <span>{rowInfo.label}</span>
              </div>

              {/* 4 Cột */}
              {[1, 2, 3, 4].map(col => {
                const stage = rowStages.find(s => s.col === col);
                if (!stage) {
                  return (
                    <div
                      key={col}
                      className="min-h-[84px] rounded-lg border border-dashed border-slate-200/70 bg-slate-50/30 flex items-center justify-center select-none"
                    >
                      <span className="text-[10px] text-slate-300 font-mono tracking-wider">—</span>
                    </div>
                  );
                }

                const stageId = stage.processId || stage.id || '';
                const isMatch = filteredStageIds.has(stageId);
                const assignedScales = stations.filter(s => s.processId === stageId);
                const scaleCount = assignedScales.length;

                const bg = stage.color?.bg || '#F8FAFC';
                const border = stage.color?.border || '#E2E8F0';
                const text = stage.color?.text || '#0F172A';

                return (
                  <div
                    key={col}
                    onClick={() => onSelectStage(stageId)}
                    className={`min-h-[84px] rounded-lg border-[1.5px] p-2.5 flex flex-col justify-between gap-1.5 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#DE4444] ${
                      isMatch ? 'opacity-100' : 'opacity-25'
                    }`}
                    style={{
                      backgroundColor: bg,
                      borderColor: border,
                      color: text
                    }}
                    title={`Bấm để xem danh sách trạm cân tại khâu ${stage.processName || stage.name}`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 truncate" title={stage.flowTitle}>
                        {stage.flowTitle}
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-white/70 px-1.5 py-0.5 rounded border border-black/10 shrink-0">
                        {stageId}
                      </span>
                    </div>

                    <div className="text-xs font-bold leading-snug line-clamp-2" title={stage.processName || stage.name}>
                      {stage.processName || stage.name}
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed border-black/10 text-[11px]">
                      <div
                        className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full border text-[10px] truncate ${
                          scaleCount > 0
                            ? 'bg-white border-black/10 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {scaleCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        )}
                        <span className="truncate">{scaleCount > 0 ? `${scaleCount} cân` : 'Chưa có'}</span>
                      </div>
                      <span className="text-[10px] font-semibold opacity-75 shrink-0">Chi tiết ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
