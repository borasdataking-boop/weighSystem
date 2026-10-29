import React from 'react';
import { StationWeigh } from '../../types/station.types';

interface DeleteScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  station: StationWeigh | null;
}

export const DeleteScaleModal: React.FC<DeleteScaleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  station
}) => {
  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Xác nhận xoá trạm cân</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3 text-xs">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex gap-3 items-start">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="text-red-900 leading-relaxed">
              <strong className="block text-red-950 font-bold mb-1">Hành động này không thể hoàn tác!</strong>
              Bạn có chắc chắn muốn xoá trạm cân <strong>{station.name}</strong> (<span className="font-mono font-semibold">{station.id}</span>) khỏi hệ thống không?
            </div>
          </div>
          <p className="text-slate-500">
            Trạm cân này sẽ bị gỡ bỏ khỏi công đoạn chế biến hiện tại và ngừng nhận tín hiệu cân mẻ thời gian thực.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Xác nhận xoá
          </button>
        </div>
      </div>
    </div>
  );
};
