import React, { useState } from 'react';
import { ProcessStage } from '../../types/process.types';
import { StationWeigh } from '../../types/station.types';
import { processService } from '../../services/processService';

interface ProcessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: ProcessStage | null;
  allStations: StationWeigh[];
  onAssignScale: (stationId: string, processId: string) => void;
  onUnassignScale: (stationId: string) => void;
}

export const ProcessDetailModal: React.FC<ProcessDetailModalProps> = ({
  isOpen,
  onClose,
  stage,
  allStations,
  onAssignScale,
  onUnassignScale
}) => {
  const [selectedScaleId, setSelectedScaleId] = useState('');

  if (!isOpen || !stage) return null;

  const stageId = stage.processId || stage.id || '';
  const assignedStations = allStations.filter(s => s.processId === stageId);
  const unassignedStations = allStations.filter(s => !s.processId || s.processId === 'UNASSIGNED');
  const otherStations = allStations.filter(s => s.processId && s.processId !== 'UNASSIGNED' && s.processId !== stageId);

  const { incoming, outgoing } = processService.getMappingsForStage(stageId);
  const allStages = processService.getProcesses();
  const getStageName = (id: string) => {
    const found = allStages.find(s => (s.processId || s.id) === id);
    return found ? (found.processName || found.name) : id;
  };

  const handleAssign = () => {
    if (!selectedScaleId) return;
    onAssignScale(selectedScaleId, stageId);
    setSelectedScaleId('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#DE4444] bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
              {stageId}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {stage.processName || stage.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Thông tin chuẩn */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Mô tả công đoạn
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {stage.desc || 'Kiểm soát trọng lượng và quy trình chế biến xuất khẩu.'}
            </div>
          </div>

          {/* Liên kết luồng quy trình */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DE4444]" />
                Liên kết luồng
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {incoming.length} vào • {outgoing.length} ra
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Incoming */}
              <div className="bg-white border border-slate-200/80 rounded-md p-2">
                <div className="text-[10px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <span>↓ Nhận từ (Công đoạn trước):</span>
                </div>
                {incoming.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">Điểm khởi đầu quy trình</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {incoming.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium" title={m.description}>
                        <span className="font-mono font-bold">{m.fromProcessId}</span>
                        <span className="text-blue-600 truncate max-w-[120px]">{getStageName(m.fromProcessId)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing */}
              <div className="bg-white border border-slate-200/80 rounded-md p-2">
                <div className="text-[10px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <span>↑ Chuyển đến (Công đoạn sau):</span>
                </div>
                {outgoing.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">Điểm kết thúc quy trình</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {outgoing.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium" title={m.description}>
                        <span className="font-mono font-bold">{m.toProcessId}</span>
                        <span className="text-amber-700 truncate max-w-[120px]">{getStageName(m.toProcessId)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách trạm cân đang phục vụ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">
                Trạm cân đang phục vụ ({assignedStations.length}):
              </span>
            </div>

            {assignedStations.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                Chưa có máy cân nào được gán cho khâu này.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {assignedStations.map(s => (
                  <div
                    key={s.stationId || s.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#DE4444] bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                        {s.stationId || s.id}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{s.stationName || s.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {s.location || 'Vị trí xưởng'} • Max {s.maxWeight || 150}kg
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUnassignScale(s.stationId || s.id || '')}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#DE4444] border border-red-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Gỡ cân
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Điều phối thêm cân */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
              Điều chuyển cân:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedScaleId}
                onChange={(e) => setSelectedScaleId(e.target.value)}
                className="flex-1 h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444] truncate"
              >
                <option value="">-- Chọn máy cân --</option>
                {unassignedStations.length > 0 && (
                  <optgroup label={`Kho dự phòng (${unassignedStations.length})`}>
                    {unassignedStations.map(s => (
                      <option key={s.stationId || s.id} value={s.stationId || s.id}>
                        [DỰ PHÒNG] {s.stationId || s.id} - {s.stationName || s.name} ({s.maxWeight || 150}kg)
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherStations.length > 0 && (
                  <optgroup label={`Công đoạn khác (${otherStations.length})`}>
                    {otherStations.map(s => (
                      <option key={s.stationId || s.id} value={s.stationId || s.id}>
                        [{s.processId}] {s.stationId || s.id} - {s.stationName || s.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedScaleId}
                className="h-9.5 px-4 bg-[#DE4444] hover:bg-[#C93333] disabled:opacity-40 text-white font-semibold rounded-lg transition-colors cursor-pointer shrink-0 text-xs"
              >
                Gán cân
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
