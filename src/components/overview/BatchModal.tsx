import React, { useState, useEffect } from 'react';
import { BatchInfo } from '../../types/log.types';

interface BatchModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'delete';
  batchData?: BatchInfo | null;
  onClose: () => void;
  onSave: (batch: BatchInfo) => Promise<void>;
  onDelete: (batchId: string) => Promise<void>;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  mode,
  batchData,
  onClose,
  onSave,
  onDelete
}) => {
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [plannedWeight, setPlannedWeight] = useState<number | ''>(200000);
  const [origin, setOrigin] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED'>('IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (mode === 'edit' && batchData) {
        setBatchId(batchData.batchId);
        setBatchName(batchData.batchName || '');
        setPlannedWeight(batchData.plannedWeight ?? '');
        setOrigin(batchData.origin || '');
        setStartDate(batchData.startDate || new Date().toISOString().slice(0, 10));
        setStatus(batchData.status || 'IN_PROGRESS');
        setNotes(batchData.notes || '');
      } else if (mode === 'add') {
        const todayStr = new Date().toISOString().slice(0, 10);
        setBatchId('');
        setBatchName('');
        setPlannedWeight(200000);
        setOrigin('');
        setStartDate(todayStr);
        setStatus('IN_PROGRESS');
        setNotes('');
      } else if (mode === 'delete' && batchData) {
        setBatchId(batchData.batchId);
      }
    }
  }, [isOpen, mode, batchData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'delete') {
      setIsSubmitting(true);
      try {
        await onDelete(batchId);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi xoá lô');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const trimmedId = batchId.trim().toUpperCase();
    const trimmedName = batchName.trim();

    if (!trimmedId) {
      setErrorMessage('Vui lòng nhập Mã lô sản xuất (VD: L0004).');
      return;
    }
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập Tên lô sản xuất.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        batchId: trimmedId,
        batchName: trimmedName,
        plannedWeight: plannedWeight === '' ? 0 : Number(plannedWeight),
        origin: origin.trim(),
        startDate: startDate || new Date().toISOString().slice(0, 10),
        status,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu thông tin lô');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${mode === 'delete' ? 'bg-rose-500' : 'bg-[#DE4444]'}`} />
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'add' && 'Thêm Lô Sản Xuất Mới'}
              {mode === 'edit' && `Chỉnh Sửa Thông Tin Ban Đầu: ${batchData?.batchId}`}
              {mode === 'delete' && `Xác Nhận Ngừng / Xoá Mềm Lô: ${batchData?.batchId}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 flex flex-col gap-4 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            {mode === 'delete' ? (
              <div className="flex flex-col gap-3 py-2">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <p className="font-bold text-amber-900 mb-1">Cơ chế xoá mềm an toàn (Soft Delete)</p>
                    <p className="text-amber-800 leading-relaxed">
                      Lô sản xuất <strong>{batchId}</strong> ({batchData?.batchName || 'Không tên'}) sẽ được chuyển sang trạng thái <strong>Ngừng hoạt động</strong> và ẩn khỏi danh sách lựa chọn.
                    </p>
                    <p className="text-emerald-800 font-semibold mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                      Toàn bộ nhật ký các mẻ cân trong quá khứ được BẢO TOÀN NGUYÊN VẸN, không bị mất mát hay mồ côi dữ liệu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Mã Lô & Tên Lô */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-slate-700 mb-1">
                      Mã lô <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={mode === 'edit'}
                      value={batchId}
                      onChange={e => setBatchId(e.target.value.toUpperCase())}
                      placeholder="VD: L0004"
                      className="w-full h-9 px-3 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444] disabled:bg-slate-100 disabled:text-slate-500 uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Tên lô sản xuất <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={e => setBatchName(e.target.value)}
                      placeholder="VD: Tôm thẻ chân trắng xuất Nhật"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444]"
                    />
                  </div>
                </div>

                {/* 2. Khối lượng kế hoạch ban đầu & Xuất xứ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kế hoạch ban đầu (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={plannedWeight}
                        onChange={e => setPlannedWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="200000"
                        className="w-full h-9 pl-3 pr-8 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[11px]">
                        kg
                      </span>
                    </div>
                    {typeof plannedWeight === 'number' && plannedWeight >= 1000 && (
                      <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
                        ≈ {(plannedWeight / 1000).toFixed(1)} tấn
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nhà cung ứng / Xuất xứ
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      placeholder="VD: Cà Mau - HTX Minh Phú"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444]"
                    />
                  </div>
                </div>

                {/* 3. Ngày bắt đầu & Trạng thái */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Trạng thái lô
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full h-9 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444] cursor-pointer"
                    >
                      <option value="IN_PROGRESS">Đang sản xuất</option>
                      <option value="COMPLETED">Đã hoàn thành</option>
                      <option value="PENDING">Chờ sản xuất</option>
                    </select>
                  </div>
                </div>

                {/* 4. Ghi chú ban đầu */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi chú ban đầu
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="VD: Cấp đông IQF, quy chuẩn vệ sinh xuất khẩu..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444] resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Modal */}
          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5">
            {mode === 'edit' ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn ngừng hoạt động / xoá mềm lô ${batchId}? Toàn bộ nhật ký cân của lô vẫn sẽ được lưu trữ an toàn.`)) {
                    onDelete(batchId);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Xoá hoặc ngừng lô này"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Xoá lô</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 ${
                  mode === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#DE4444] hover:bg-[#c93636]'
                }`}
              >
                {isSubmitting && (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                )}
                <span>
                  {mode === 'add' && 'Tạo lô sản xuất'}
                  {mode === 'edit' && 'Lưu thông tin'}
                  {mode === 'delete' && 'Xác nhận xoá mềm'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
