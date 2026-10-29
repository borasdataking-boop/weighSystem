import React from 'react';
import { StationWeigh } from '../../types/station.types';

interface KPICardsProps {
  stations: StationWeigh[];
}

export const KPICards: React.FC<KPICardsProps> = ({ stations }) => {
  const total = stations.length;
  const inCount = stations.filter(s => (s.ioType || s.typeWeight || 'IN') === 'IN').length;
  const outCount = stations.filter(s => (s.ioType || s.typeWeight) === 'OUT').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Thẻ 1: Tổng số cân */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Tổng số trạm cân</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-[#DE4444] shrink-0">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-slate-900 leading-none mb-1">{total}</div>
        <div className="text-xs text-slate-500 truncate">Hệ thống cân đo lường toàn nhà máy</div>
      </div>

      {/* Thẻ 2: Cân IN (Đầu vào) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Cân Đầu Vào (IN)</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700 shrink-0">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-blue-700 leading-none mb-1">{inCount}</div>
        <div className="text-xs text-slate-500 truncate">Tiếp nhận vật tư, tôm nguyên liệu vào</div>
      </div>

      {/* Thẻ 3: Cân OUT (Đầu ra) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Cân Đầu Ra (OUT)</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-700 shrink-0">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-amber-700 leading-none mb-1">{outCount}</div>
        <div className="text-xs text-slate-500 truncate">Cân thành phẩm, kiểm tra xuất xưởng</div>
      </div>
    </div>
  );
};
