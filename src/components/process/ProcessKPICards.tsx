import React from 'react';
import { ProcessStage } from '../../types/process.types';

interface ProcessKPICardsProps {
  stages: ProcessStage[];
}

export const ProcessKPICards: React.FC<ProcessKPICardsProps> = ({ stages }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Thẻ 1: Tổng số công đoạn */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>Tổng số công đoạn</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#DE4444]">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-slate-900 leading-none mb-1">{stages.length}</div>
        <div className="text-xs text-slate-500">
          Các mắt xích chế biến trong toàn bộ chuỗi
        </div>
      </div>

      {/* Thẻ 2: Kiểm soát dòng chảy liên tục */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>Cơ chế kiểm soát Node</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
        <div className="text-xl font-bold text-slate-900 leading-tight mb-1">IN • WIP • OUT</div>
        <div className="text-xs text-slate-500">
          Mỗi công đoạn xử lý vật tư vào, bán thành phẩm & ra
        </div>
      </div>

      {/* Thẻ 3: Tiêu chuẩn chất lượng */}
      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>Tiêu chuẩn công nghệ</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-700 leading-tight mb-1">HACCP / ISO</div>
        <div className="text-xs text-slate-500">
          Quy chuẩn kỹ thuật kiểm soát chất lượng xuất khẩu
        </div>
      </div>
    </div>
  );
};
