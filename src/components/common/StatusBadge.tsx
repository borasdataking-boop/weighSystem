import React from 'react';
import { StationStatus } from '../../types/station.types';

interface StatusBadgeProps {
  status: StationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  if (status === 'ONLINE') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
        Đang kết nối
      </span>
    );
  }

  if (status === 'CALIBRATING') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-amber-50 text-amber-800 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Hiệu chuẩn
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-slate-100 text-slate-600 ${
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Mất kết nối
    </span>
  );
};
