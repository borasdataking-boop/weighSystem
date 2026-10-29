import React from 'react';
import { StationWeigh, StationIOType } from '../../types/station.types';

interface StationTableProps {
  stations: StationWeigh[];
  onEdit: (station: StationWeigh) => void;
  onDelete: (station: StationWeigh) => void;
  onQuickChangeIO?: (stationId: string, ioType: StationIOType) => void;
}

export const StationTable: React.FC<StationTableProps> = ({
  stations,
  onEdit,
  onDelete,
  onQuickChangeIO
}) => {
  if (stations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <svg className="w-12 h-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <h3 className="text-base font-semibold text-slate-900">Không tìm thấy cân nào</h3>
        <p className="text-xs text-slate-500 max-w-sm">Hãy thử tìm bằng từ khóa khác hoặc bấm "Đặt lại" bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left text-xs min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-6 w-[18%]">Mã Cân</th>
              <th className="py-3.5 px-6 w-[68%]">Tên Cân</th>
              <th className="py-3.5 px-6 w-[14%] text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stations.map(station => {
              const stationCode = station.id || station.stationId;
              const stationTitle = station.name || station.stationName;

              return (
                <tr key={stationCode} className="hover:bg-slate-50/75 transition-colors">
                  {/* 1. Mã Cân (18%) */}
                  <td className="py-4 px-6 font-mono font-semibold whitespace-nowrap">
                    <span className="h-8 px-3 bg-red-50 text-[#DE4444] border border-red-200 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0">
                      {stationCode}
                    </span>
                  </td>

                  {/* 2. Tên Cân (68%) */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm leading-snug truncate" title={stationTitle}>
                      {stationTitle}
                    </div>
                  </td>

                  {/* 3. Thao Tác (14%) */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onEdit(station)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer shrink-0"
                        title="Sửa thông tin cân"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => onDelete(station)}
                        className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Xoá cân"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
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
