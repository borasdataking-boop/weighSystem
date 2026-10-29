import React, { useState, useEffect } from 'react';
import { StationWeigh, StationIOType } from '../../types/station.types';
import { ProcessStage } from '../../types/process.types';

interface AddScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (station: StationWeigh) => void;
  editingStation: StationWeigh | null;
  stages: ProcessStage[];
  existingStationsCount: number;
}

export const AddScaleModal: React.FC<AddScaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStation,
  stages,
  existingStationsCount
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [processId, setProcessId] = useState('CD001');
  const [ioType, setIoType] = useState<StationIOType>('IN');

  useEffect(() => {
    if (editingStation) {
      setId(editingStation.id || editingStation.stationId || '');
      setName(editingStation.name || editingStation.stationName || '');
      setLocation(editingStation.location || '');
      setProcessId(editingStation.processId || editingStation.stageId || 'UNASSIGNED');
      setIoType(editingStation.ioType || editingStation.typeWeight || 'IN');
    } else {
      const nextNum = 10244156 + existingStationsCount;
      setId(String(nextNum));
      setName('');
      setLocation('');
      setProcessId('CD001');
      setIoType('IN');
    }
  }, [editingStation, existingStationsCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    const trimmedId = id.trim().toUpperCase();
    const trimmedName = name.trim();

    onSave({
      id: trimmedId,
      stationId: trimmedId,
      name: trimmedName,
      stationName: trimmedName,
      processId,
      stageId: processId,
      ioType,
      typeWeight: ioType,
      location: location.trim() || 'Chưa ghi ghi chú vị trí',
      model: editingStation?.model || 'DINI ARGEO DFWL',
      indicatorModel: editingStation?.indicatorModel || 'DINI_ARGEO',
      maxWeight: editingStation?.maxWeight || 150,
      division: editingStation?.division || 10,
      protocol: editingStation?.protocol || 'TCP/IP',
      address: editingStation?.address || '',
      status: editingStation?.status || 'ONLINE',
      isActive: true,
      hubId: editingStation?.hubId || null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {editingStation ? `Chỉnh sửa cân: ${editingStation.name || editingStation.stationName}` : 'Thêm trạm cân mới'}
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

        {/* Form Body - Chuẩn hoá 4 trường cốt lõi */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 flex flex-col gap-4 text-xs">
            {/* 1. Tên Cân & Mã Cân */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tên Cân <span className="text-[#DE4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cân tiếp nhận tôm 01"
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mã Cân <span className="text-[#DE4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  readOnly={!!editingStation}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="10244156"
                  className="w-full h-9.5 px-3 font-mono font-bold border border-red-200 bg-red-50/50 text-[#DE4444] rounded-lg text-xs focus:outline-none focus:border-[#DE4444] read-only:bg-slate-100 read-only:text-slate-600 read-only:border-slate-200"
                />
              </div>
            </div>

            {/* 2. Công đoạn & Vị trí xưởng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Công đoạn <span className="text-[#DE4444]">*</span>
                </label>
                <select
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444] bg-white cursor-pointer"
                >
                  {stages.map(st => {
                    const pId = st.id || st.processId;
                    return (
                      <option key={pId} value={pId}>
                        {pId ? `[${pId}] ` : ''}{st.name || st.processName}
                      </option>
                    );
                  })}
                  <option value="UNASSIGNED">[Chưa gán] Kho dự phòng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Vị trí đặt tại xưởng
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Cửa nhập số 1 - Khu sơ chế"
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                />
              </div>
            </div>

            {/* 3. Chiều cân */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Chiều cân <span className="text-[#DE4444]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIoType('IN')}
                  className={`h-11 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    ioType === 'IN'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>IN (Đầu vào)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIoType('OUT')}
                  className={`h-11 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    ioType === 'OUT'
                      ? 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>OUT (Đầu ra)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="h-9 px-5 bg-[#DE4444] hover:bg-[#C93333] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingStation ? 'Lưu thay đổi' : 'Thêm cân'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

