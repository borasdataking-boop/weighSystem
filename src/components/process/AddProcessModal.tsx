import React, { useState, useEffect } from 'react';
import { ProcessStage } from '../../types/process.types';

interface AddProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: ProcessStage) => void;
  editingStage?: ProcessStage | null;
  existingStagesCount: number;
}

export const AddProcessModal: React.FC<AddProcessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStage,
  existingStagesCount
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [flowTitle, setFlowTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (editingStage) {
      setId(editingStage.processId || editingStage.id || '');
      setName(editingStage.processName || editingStage.name || '');
      setFlowTitle(editingStage.flowTitle || '');
      setDesc(editingStage.desc || '');
    } else {
      const nextNum = existingStagesCount + 1;
      setId(`CD${String(nextNum).padStart(3, '0')}`);
      setName('');
      setFlowTitle('');
      setDesc('');
    }
  }, [editingStage, existingStagesCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    onSave({
      processId: id.trim().toUpperCase(),
      id: id.trim().toUpperCase(),
      processName: name.trim(),
      name: name.trim(),
      flowTitle: flowTitle.trim() || name.trim(),
      col: editingStage?.col || 1,
      row: editingStage?.row || 1,
      desc: desc.trim(),
      color: editingStage?.color || { bg: '#F8FAFC', border: '#CBD5E1', text: '#0F172A' }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#DE4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            {editingStage ? `Sửa công đoạn ${editingStage.processId || editingStage.id}` : 'Thêm công đoạn chế biến mới'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Đóng"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 sm:p-5 flex flex-col gap-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mã Công Đoạn <span className="text-[#DE4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  readOnly={!!editingStage}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="CD016"
                  className="w-full h-9.5 px-3 font-mono font-bold border border-red-200 bg-red-50/50 text-[#DE4444] rounded-lg text-xs focus:outline-none focus:border-[#DE4444] read-only:bg-slate-100 read-only:text-slate-600 read-only:border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={flowTitle}
                  onChange={(e) => setFlowTitle(e.target.value)}
                  placeholder="Ví dụ: Metal Detection"
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Tên Công Đoạn <span className="text-[#DE4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Kiểm tra tạp chất & Cân mẻ"
                className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Mô tả quy trình
              </label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn quy trình thao tác..."
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="h-9 px-4.5 bg-[#DE4444] hover:bg-[#C93333] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingStage ? 'Cập nhật thay đổi' : 'Lưu công đoạn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
