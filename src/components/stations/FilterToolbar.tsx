import React from 'react';
import { ViewMode } from '../../types/station.types';

interface FilterToolbarProps {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onResetFilters: () => void;
  totalCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  viewMode = 'table',
  onViewModeChange,
  searchKeyword,
  onSearchChange,
  onResetFilters,
  totalCount
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Tìm kiếm tên cân, mã cân */}
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã cân, tên cân..."
            className="w-full h-9.5 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444] focus:ring-2 focus:ring-[#DE4444]/10 transition-all"
          />
        </div>

        {/* Nút đặt lại */}
        {searchKeyword && (
          <button
            onClick={onResetFilters}
            className="h-9.5 px-3 text-xs font-medium text-slate-500 hover:text-[#DE4444] border border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Đặt lại
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 self-center">
        {onViewModeChange && (
          <div className="inline-flex bg-slate-100 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#DE4444] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('pipeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white text-[#DE4444] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Sơ đồ Kanban</span>
            </button>
          </div>
        )}

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng: <strong className="text-slate-900 font-mono text-sm">{totalCount}</strong> trạm cân
        </div>
      </div>
    </div>
  );
};
