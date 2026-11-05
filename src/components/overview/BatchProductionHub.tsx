import React, { useState, useMemo } from 'react';
import { BatchSummary, BatchInfo } from '../../types/log.types';

interface BatchProductionHubProps {
  batchSummaries: BatchSummary[];
  selectedBatch: string;
  onSelectBatch: (batchId: string) => void;
  onOpenAddBatch: () => void;
  onOpenEditBatch: (batch: BatchInfo) => void;
  onToggleStatus: (batchId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING') => Promise<void>;
  onInspectStages?: (batchId: string) => void;
}

export const BatchProductionHub: React.FC<BatchProductionHubProps> = ({
  batchSummaries,
  selectedBatch,
  onSelectBatch,
  onOpenAddBatch,
  onOpenEditBatch,
  onToggleStatus,
  onInspectStages
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'TODAY' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Thống kê số lượng theo từng tab
  const counts = useMemo(() => {
    return {
      total: batchSummaries.length,
      today: batchSummaries.filter(b => b.isToday).length,
      inProgress: batchSummaries.filter(b => b.status === 'IN_PROGRESS').length,
      completed: batchSummaries.filter(b => b.status === 'COMPLETED').length
    };
  }, [batchSummaries]);

  // Lọc danh sách lô
  const filteredBatches = useMemo(() => {
    return batchSummaries.filter(b => {
      if (activeTab === 'TODAY' && !b.isToday) return false;
      if (activeTab === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return b.batchId.toLowerCase().includes(q) || b.batchName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [batchSummaries, activeTab, searchTerm]);

  // Chuyển đổi trạng thái nhanh (1-click)
  const handleQuickStatusToggle = async (e: React.MouseEvent, batch: BatchSummary) => {
    e.stopPropagation();
    const nextStatus = batch.status === 'IN_PROGRESS' ? 'COMPLETED' : 'IN_PROGRESS';
    try {
      setUpdatingId(batch.batchId);
      await onToggleStatus(batch.batchId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, batch: BatchSummary) => {
    e.stopPropagation();
    onOpenEditBatch({
      batchId: batch.batchId,
      batchName: batch.batchName,
      plannedWeight: batch.plannedWeight,
      origin: batch.origin,
      startDate: batch.startDate,
      status: batch.status,
      notes: batch.notes
    });
  };

  const handleViewStages = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation();
    onSelectBatch(batchId);
    if (onInspectStages) {
      onInspectStages(batchId);
    } else {
      const el = document.getElementById('pipeline-stages-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs mb-5 overflow-hidden">
      {/* THANH ĐIỀU HÀNH CHUẨN ENTERPRISE: TABS SEGMENTED CONTROL + TÌM KIẾM + NÚT THAO TÁC */}
      <div className="p-3 sm:px-4 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2.5 bg-slate-50/50">
        {/* Nhóm Tabs Segmented Control đồng nhất, không màu mè AI */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-lg gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Tất cả lô</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TODAY')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'TODAY'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Làm hôm nay</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
              {counts.today}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Đang làm</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
              {counts.inProgress}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Đã xong</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
              {counts.completed}
            </span>
          </button>
        </div>

        {/* Nhóm Tìm kiếm & Chuyển dạng xem & Thêm lô */}
        <div className="flex items-center gap-2">
          {/* Ô tìm kiếm gọn */}
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm mã hoặc tên lô..."
              className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 focus:border-slate-400 rounded-md text-slate-900 focus:outline-none w-40 sm:w-52"
            />
          </div>

          {/* Toggle dạng hiển thị */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng bảng"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng thẻ"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>

          {/* Nút Thêm lô mới */}
          <button
            type="button"
            onClick={onOpenAddBatch}
            className="h-8 px-3 text-xs font-semibold text-white bg-[#C53030] hover:bg-[#b02828] rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Thêm lô</span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG: BẢNG TINH GỌN (CHÍNH) HOẶC THẺ GỌN */}
      {filteredBatches.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Không tìm thấy lô sản xuất phù hợp
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================
           BẢNG ĐIỀU HÀNH LÔ SẢN XUẤT - SẠCH SẼ, ĐỒNG NHẤT, RÕ RÀNG
           ======================================================== */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 w-24">Mã lô</th>
                <th className="py-2.5 px-3">Tên lô sản xuất</th>
                <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right w-24">Chưa làm</th>
                <th className="py-2.5 px-3 text-right w-24">Đọng WIP</th>
                <th className="py-2.5 px-3 text-right w-24">Vào (IN)</th>
                <th className="py-2.5 px-3 text-right w-24">Ra (OUT)</th>
                <th className="py-2.5 px-3 w-32">Tiến độ</th>
                <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredBatches.map(batch => {
                const isSelected = selectedBatch === batch.batchId;
                const isCompleted = batch.status === 'COMPLETED';

                return (
                  <tr
                    key={batch.batchId}
                    onClick={() => onSelectBatch(batch.batchId)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/70 border-l-3 border-l-[#C53030]'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Mã lô */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {batch.batchId}
                        </span>
                        {batch.isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Hoạt động hôm nay" />
                        )}
                      </div>
                    </td>

                    {/* Tên lô */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 truncate max-w-[240px]" title={batch.batchName}>
                        {batch.batchName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[240px]">
                        {batch.origin ? `${batch.origin} • ` : ''}KH: {formatKg(batch.plannedWeight)} kg
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : batch.status === 'PENDING'
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isCompleted ? 'Đã xong' : batch.status === 'PENDING' ? 'Chờ sx' : 'Đang làm'}
                      </span>
                    </td>

                    {/* 1. Chưa làm */}
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                      {formatKg(batch.remainingWeight)}
                    </td>

                    {/* 2. Đọng WIP */}
                    <td className="py-2.5 px-3 text-right">
                      {batch.wipWeight > 0 ? (
                        <span className="text-amber-900 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80">
                          {formatKg(batch.wipWeight)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-normal">0,0</span>
                      )}
                    </td>

                    {/* 3. Vào (IN) */}
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                      {formatKg(batch.inWeight)}
                    </td>

                    {/* 4. Ra (OUT) */}
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                      {formatKg(batch.outWeight)}
                    </td>

                    {/* Tiến độ: % và thanh nhỏ */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden flex shrink-0">
                          <div
                            className="h-full bg-slate-800"
                            style={{ width: `${Math.min(100, (batch.outWeight / (batch.plannedWeight || batch.inWeight || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-700">
                          {batch.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={e => handleEditClick(e, batch)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Sửa thông tin lô"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Nút Toggle Trạng thái */}
                        <button
                          type="button"
                          disabled={updatingId === batch.batchId}
                          onClick={e => handleQuickStatusToggle(e, batch)}
                          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors border ${
                            isCompleted
                              ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
                              : 'text-slate-800 bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                          title={isCompleted ? 'Chuyển về Đang làm' : 'Đánh dấu Đã xong'}
                        >
                          {isCompleted ? 'Mở lại' : 'Xong'}
                        </button>

                        {/* Nút Xem 15 công đoạn */}
                        <button
                          type="button"
                          onClick={e => handleViewStages(e, batch.batchId)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Xem chi tiết 15 công đoạn của lô này"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
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
      ) : (
        /* ========================================================
           DẠNG THẺ GỌN (NẾU NGƯỜI DÙNG CHỌN CARDS)
           ======================================================== */
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBatches.map(batch => {
            const isSelected = selectedBatch === batch.batchId;
            const isCompleted = batch.status === 'COMPLETED';

            return (
              <div
                key={batch.batchId}
                onClick={() => onSelectBatch(batch.batchId)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-800 bg-slate-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                        isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {batch.batchId}
                      </span>
                      {batch.isToday && (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          Hôm nay
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {isCompleted ? 'Đã xong' : 'Đang làm'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 text-xs truncate" title={batch.batchName}>
                    {batch.batchName}
                  </h4>

                  {/* 4 Chỉ số cốt lõi */}
                  <div className="grid grid-cols-2 gap-2 my-2.5 text-xs font-mono">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">Chưa làm</span>
                      <strong className="text-slate-900">{formatKg(batch.remainingWeight)}</strong> kg
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">Đọng WIP</span>
                      <strong className="text-slate-900">{formatKg(batch.wipWeight)}</strong> kg
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">Vào (IN)</span>
                      <strong className="text-slate-900">{formatKg(batch.inWeight)}</strong> kg
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">Ra (OUT)</span>
                      <strong className="text-slate-900">{formatKg(batch.outWeight)}</strong> kg
                    </div>
                  </div>

                  {/* Thanh tiến độ */}
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-500 font-sans">Tiến độ:</span>
                    <strong className="text-slate-800">{batch.progressPercent}%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800"
                      style={{ width: `${Math.min(100, (batch.outWeight / (batch.plannedWeight || batch.inWeight || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                  <button
                    type="button"
                    onClick={e => handleEditClick(e, batch)}
                    className="text-slate-500 hover:text-slate-800 font-medium text-[11px]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={e => handleViewStages(e, batch.batchId)}
                    className="text-slate-700 hover:text-slate-900 font-semibold text-[11px] inline-flex items-center gap-0.5"
                  >
                    <span>15 bước</span>
                    <span>▼</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default BatchProductionHub;