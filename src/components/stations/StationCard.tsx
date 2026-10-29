import React from 'react';
import { StationWeigh } from '../../types/station.types';

interface StationCardProps {
  station: StationWeigh;
  onEdit: (station: StationWeigh) => void;
  onDelete: (station: StationWeigh) => void;
  onMoveStage: (station: StationWeigh) => void;
  onDragStart?: (e: React.DragEvent, stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onEdit,
  onDelete,
  onMoveStage,
  onDragStart
}) => {
  const stationCode = station.id || station.stationId;
  const stationTitle = station.name || station.stationName;
  const isOut = station.ioType === 'OUT' || station.typeWeight === 'OUT';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, stationCode)}
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header thẻ: Mã cân & Hướng cân IN / OUT */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <span className="font-mono font-semibold bg-red-50 text-[#DE4444] border border-red-200 px-2 py-0.5 rounded text-[11px] shrink-0">
          {stationCode}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${
            isOut
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {isOut ? 'OUT (Ra)' : 'IN (Vào)'}
        </span>
      </div>

      {/* Tên cân */}
      <div className="text-xs font-bold text-slate-900 leading-snug break-words">
        {stationTitle}
      </div>

      {/* Vị trí đặt cân tại xưởng */}
      <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 border border-slate-200/80 rounded text-[11px] text-slate-600 min-w-0">
        <svg className="w-3.5 h-3.5 text-[#DE4444] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="truncate leading-tight font-medium" title={station.location || 'Chưa ghi vị trí'}>
          {station.location || 'Chưa ghi vị trí'}
        </span>
      </div>

      {/* Hành động */}
      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
        <button
          onClick={() => onMoveStage(station)}
          className="flex-1 min-w-0 h-7 text-[11px] font-medium text-slate-600 hover:text-[#DE4444] hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded inline-flex items-center justify-center gap-1 transition-colors cursor-pointer px-1.5"
          title="Đổi vị trí công đoạn"
        >
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          <span className="truncate">Đổi chỗ</span>
        </button>

        <button
          onClick={() => onEdit(station)}
          className="w-7 h-7 shrink-0 rounded border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="Sửa cân"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(station)}
          className="w-7 h-7 shrink-0 rounded border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
          title="Xoá cân"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
