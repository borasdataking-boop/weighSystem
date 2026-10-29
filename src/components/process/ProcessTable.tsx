import React from 'react';
import { ProcessStage } from '../../types/process.types';

interface ProcessTableProps {
  stages: ProcessStage[];
  onSelectStage: (stageId: string) => void;
  onEditStage: (stageId: string) => void;
  onDeleteStage?: (stageId: string) => void;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  stages,
  onSelectStage,
  onEditStage,
  onDeleteStage
}) => {
  if (stages.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
        <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="font-semibold text-slate-700">Không tìm thấy công đoạn nào</span>
        <span className="text-slate-400">Hãy thử tìm bằng từ khóa khác hoặc bấm "Đặt lại" bộ lọc.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs tracking-wider">
              <th className="py-3.5 px-6 w-[14%]">Mã Công Đoạn</th>
              <th className="py-3.5 px-6 w-[28%]">Tên Công Đoạn</th>
              <th className="py-3.5 px-6 w-[46%]">Mô Tả Quy Trình</th>
              <th className="py-3.5 px-6 w-[12%] text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stages.map(st => {
              const stageId = st.processId || st.id || '';

              return (
                <tr key={stageId} className="hover:bg-slate-50/75 transition-colors">
                  {/* 1. Mã Công Đoạn (18%) */}
                  <td className="py-4 px-6 font-mono font-semibold whitespace-nowrap">
                    <span className="h-8 px-3 bg-red-50 text-[#DE4444] border border-red-200 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0">
                      {stageId}
                    </span>
                  </td>

                  {/* 2. Tên Công Đoạn (36%) */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm leading-snug truncate" title={st.processName || st.name}>
                      {st.processName || st.name}
                    </div>
                  </td>

                  {/* 3. Mô Tả Quy Trình (34%) */}
                  <td className="py-4 px-6">
                    <span className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={st.desc || 'Tiêu chuẩn kiểm soát chất lượng và quy trình công nghệ'}>
                      {st.desc || 'Tiêu chuẩn kiểm soát chất lượng và quy trình công nghệ'}
                    </span>
                  </td>

                  {/* 4. Thao Tác (12%) */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {/* Tạm thời ẩn nút chấm than (chi tiết) theo yêu cầu */}
                      {/* <button
                        type="button"
                        onClick={() => onSelectStage(stageId)}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-[#DE4444] text-slate-600 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Xem chi tiết công đoạn"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </button> */}
                      <button
                        type="button"
                        onClick={() => onEditStage(stageId)}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Sửa thông tin công đoạn"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      {onDeleteStage && (
                        <button
                          type="button"
                          onClick={() => onDeleteStage(stageId)}
                          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-slate-600 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Xoá công đoạn"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
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
