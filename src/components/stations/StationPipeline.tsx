import React, { useState } from 'react';
import { StationWeigh } from '../../types/station.types';
import { ProcessStage } from '../../types/process.types';
import { StationCard } from './StationCard';

interface StationPipelineProps {
  stations: StationWeigh[];
  stages: ProcessStage[];
  onAddNewScale: () => void;
  onEditScale: (station: StationWeigh) => void;
  onDeleteScale: (station: StationWeigh) => void;
  onMoveStageModal: (station: StationWeigh) => void;
  onDropScaleToStage: (stationId: string, stageId: string) => void;
}

const STAGE_GROUPS = [
  { id: 'ALL', label: 'Tất cả công đoạn' },
  { id: 'PREP', label: 'Tiếp nhận & Sơ chế', stageIds: ['CD001', 'CD002', 'CD003', 'CD004'] },
  { id: 'SEASONING', label: 'Ngâm & Tẩm bột', stageIds: ['CD005', 'CD006', 'CD009'] },
  { id: 'FREEZE_COOK', label: 'Nấu & Cấp đông', stageIds: ['CD007', 'CD008', 'CD010', 'CD011'] },
  { id: 'PACKING', label: 'Đóng gói & Kho', stageIds: ['CD012', 'CD013', 'CD014', 'CD015'] },
  { id: 'UNASSIGNED', label: 'Kho dự phòng', stageIds: ['UNASSIGNED'] }
];

export const StationPipeline: React.FC<StationPipelineProps> = ({
  stations,
  stages,
  onAddNewScale,
  onEditScale,
  onDeleteScale,
  onMoveStageModal,
  onDropScaleToStage
}) => {
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const handleDragStart = (e: React.DragEvent, stationId: string) => {
    e.dataTransfer.setData('text/plain', stationId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const stationId = e.dataTransfer.getData('text/plain');
    if (stationId) {
      onDropScaleToStage(stationId, stageId);
    }
  };

  // Filter stages based on selected group
  const activeGroupConfig = STAGE_GROUPS.find(g => g.id === selectedGroup);
  const visibleStages = stages.filter(st => {
    if (selectedGroup === 'ALL') return true;
    if (selectedGroup === 'UNASSIGNED') return false;
    const sId = st.id || st.processId;
    return activeGroupConfig?.stageIds?.includes(sId);
  });

  const showUnassigned = selectedGroup === 'ALL' || selectedGroup === 'UNASSIGNED';

  return (
    <div className="flex flex-col gap-4">
      {/* Banner Hướng dẫn & Bộ lọc nhanh nhóm công đoạn */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-[#DE4444] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          Kéo-thả thẻ cân giữa các cột để điều chuyển vị trí tại xưởng.
        </div>
        <button
          onClick={onAddNewScale}
          className="h-8.5 px-3 bg-[#DE4444] hover:bg-[#C93333] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm trạm cân
        </button>
      </div>

      {/* Filter Chips cho nhóm công đoạn */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {STAGE_GROUPS.map(g => {
          const isActive = selectedGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#DE4444] border-[#DE4444] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Vùng cuộn ngang hiển thị các cột công đoạn dạng Kanban */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-4 items-start min-w-max">
          {/* Cột các công đoạn */}
          {visibleStages.map(st => {
            const stageId = st.id || st.processId;
            const stageScales = stations.filter(s => (s.processId === stageId || s.stageId === stageId));
            const isOver = dragOverStageId === stageId;

            return (
              <div
                key={stageId}
                onDragOver={(e) => handleDragOver(e, stageId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stageId)}
                className={`w-[290px] min-w-[290px] bg-white border rounded-xl shadow-xs flex flex-col min-h-[420px] transition-all shrink-0 ${
                  isOver ? 'border-[#DE4444] bg-red-50/30 ring-2 ring-[#DE4444]/20' : 'border-slate-200'
                }`}
              >
                {/* Header cột */}
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#DE4444] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase">
                      {stageId}
                    </span>
                    <span className="font-mono text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {stageScales.length} cân
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2" title={st.name || st.processName}>
                    {st.name || st.processName}
                  </h4>
                </div>

                {/* Danh sách thẻ cân */}
                <div className="p-3 flex flex-col gap-2.5 flex-1">
                  {stageScales.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 flex-1 min-h-[140px]">
                      <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 5v14m-7-7h14" />
                      </svg>
                      <span>Kéo thả trạm cân vào đây</span>
                    </div>
                  ) : (
                    stageScales.map(station => (
                      <StationCard
                        key={station.id || station.stationId}
                        station={station}
                        onEdit={onEditScale}
                        onDelete={onDeleteScale}
                        onMoveStage={onMoveStageModal}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Cột Dự phòng / Chưa phân bổ */}
          {showUnassigned && (() => {
            const unassignedScales = stations.filter(s => !s.processId || s.processId === 'UNASSIGNED');
            const isOver = dragOverStageId === 'UNASSIGNED';

            return (
              <div
                onDragOver={(e) => handleDragOver(e, 'UNASSIGNED')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'UNASSIGNED')}
                className={`w-[290px] min-w-[290px] bg-slate-50/80 border border-dashed rounded-xl flex flex-col min-h-[420px] transition-all shrink-0 ${
                  isOver ? 'border-[#DE4444] bg-red-50/40 ring-2 ring-[#DE4444]/20' : 'border-slate-300'
                }`}
              >
                <div className="p-3.5 border-b border-slate-200 rounded-t-xl bg-slate-100/50">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kho thiết bị
                    </span>
                    <span className="font-mono text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {unassignedScales.length} cân
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Dự phòng / Chưa gán</h4>
                </div>

                <div className="p-3 flex flex-col gap-2.5 flex-1">
                  {unassignedScales.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg bg-white/60 flex flex-col items-center justify-center gap-1.5 flex-1 min-h-[140px]">
                      <span>Kho dự phòng trống</span>
                    </div>
                  ) : (
                    unassignedScales.map(station => (
                      <StationCard
                        key={station.id || station.stationId}
                        station={station}
                        onEdit={onEditScale}
                        onDelete={onDeleteScale}
                        onMoveStage={onMoveStageModal}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
