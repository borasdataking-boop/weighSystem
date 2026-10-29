import React, { useState } from 'react';
import { WeightIOType } from '../../types/log.types';
import { ProcessStage } from '../../types/process.types';
import { StationWeigh } from '../../types/station.types';
import { ProductItem } from '../../types/product.types';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: ProcessStage[];
  stations: StationWeigh[];
  products: ProductItem[];
  existingBatches: string[];
  onSave: (logData: {
    batch_id: string;
    station_id: string;
    process_id: string;
    product_id: string;
    type_weight: WeightIOType;
    value_weight: number;
    tare_weight: number;
    employee_id?: string;
    source_method?: string;
  }) => void;
}

export const AddLogModal: React.FC<AddLogModalProps> = ({
  isOpen,
  onClose,
  stages,
  stations,
  products,
  existingBatches,
  onSave
}) => {
  const [batchId, setBatchId] = useState('L0001');
  const [isCustomBatch, setIsCustomBatch] = useState(false);
  const [processId, setProcessId] = useState(stages[0]?.processId || stages[0]?.id || 'CD001');
  const [stationId, setStationId] = useState(stations[0]?.stationId || stations[0]?.id || '10244156');
  const [productId, setProductId] = useState(products[0]?.id || 'SP-TN-01');
  const [typeWeight, setTypeWeight] = useState<WeightIOType>('IN');
  const [valueWeight, setValueWeight] = useState('25.500');
  const [tareWeight, setTareWeight] = useState('0.500');
  const [employeeId, setEmployeeId] = useState('NV001');
  const [sourceMethod, setSourceMethod] = useState('TCP/IP');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueWeight);
    const tare = parseFloat(tareWeight) || 0;

    if (isNaN(val) || val <= 0) {
      alert('Vui lòng nhập trọng lượng hợp lệ (> 0 kg)');
      return;
    }

    onSave({
      batch_id: batchId.trim().toUpperCase(),
      process_id: processId,
      station_id: stationId,
      product_id: productId,
      type_weight: typeWeight,
      value_weight: val,
      tare_weight: tare,
      employee_id: employeeId.trim() || undefined,
      source_method: sourceMethod.trim() || undefined
    });

    onClose();
  };

  const net = (parseFloat(valueWeight) || 0) - (parseFloat(tareWeight) || 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DE4444]" />
            <h3 className="text-base font-bold text-slate-900">
              Ghi Nhận Mẻ Cân
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 flex flex-col gap-4 text-xs">
            {/* 1. Mã Lô hàng (Batch ID) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">
                  Mã Lô Hàng (batch_id) <span className="text-[#DE4444]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomBatch(!isCustomBatch)}
                  className="text-[11px] text-[#DE4444] hover:underline font-medium cursor-pointer"
                >
                  {isCustomBatch ? 'Chọn từ lô có sẵn' : '+ Nhập lô mới'}
                </button>
              </div>

              {isCustomBatch ? (
                <input
                  type="text"
                  required
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  placeholder="Ví dụ: L0004, L0005..."
                  className="w-full h-9.5 px-3 font-mono font-bold border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                />
              ) : (
                <select
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  className="w-full h-9.5 px-3 font-mono font-bold border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                >
                  {existingBatches.map(b => (
                    <option key={b} value={b}>Lô: {b}</option>
                  ))}
                  <option value="L0004">+ Lô mới: L0004</option>
                </select>
              )}
            </div>

            {/* 2. Hướng cân IN / OUT */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Hướng cân (type_weight) <span className="text-[#DE4444]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTypeWeight('IN')}
                  className={`h-10 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    typeWeight === 'IN'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>IN (Cân Đầu Vào)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeWeight('OUT')}
                  className={`h-10 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    typeWeight === 'OUT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>OUT (Cân Thành Phẩm Ra)</span>
                </button>
              </div>
            </div>

            {/* 3. Công đoạn & Trạm Cân */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Công đoạn (process_id) <span className="text-[#DE4444]">*</span>
                </label>
                <select
                  value={processId}
                  onChange={e => setProcessId(e.target.value)}
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                >
                  {stages.map(st => {
                    const sId = st.processId || st.id || '';
                    return (
                      <option key={sId} value={sId}>[{sId}] {st.processName || st.name}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Trạm cân (station_id) <span className="text-[#DE4444]">*</span>
                </label>
                <select
                  value={stationId}
                  onChange={e => setStationId(e.target.value)}
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                >
                  {stations.map(st => {
                    const sId = st.stationId || st.id || '';
                    return (
                      <option key={sId} value={sId}>[{sId}] {st.stationName || st.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 4. Sản phẩm & Nhân viên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mặt hàng (product_id) <span className="text-[#DE4444]">*</span>
                </label>
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>[{p.id}] {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mã nhân viên (employee_id)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  placeholder="NV001"
                  className="w-full h-9.5 px-3 font-mono border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                />
              </div>
            </div>

            {/* 5. Cân Tổng (Gross) & Cân Bì (Tare) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Cân Tổng Gross (kg) <span className="text-[#DE4444]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={valueWeight}
                    onChange={e => setValueWeight(e.target.value)}
                    className="w-full h-9 px-3 font-mono font-bold text-slate-900 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                    Cân Bì Tare (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={tareWeight}
                    onChange={e => setTareWeight(e.target.value)}
                    className="w-full h-9 px-3 font-mono text-slate-600 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="font-semibold text-slate-600">Khối lượng tịnh (Net):</span>
                <span className="font-mono font-black text-sm text-[#DE4444]">
                  {net.toFixed(3)} kg
                </span>
              </div>
            </div>

            {/* 6. Nguồn gửi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giao thức thiết bị (source_method)
              </label>
              <input
                type="text"
                value={sourceMethod}
                onChange={e => setSourceMethod(e.target.value)}
                placeholder="TCP/IP, COM3, SIM_f7422..."
                className="w-full h-9 px-3 font-mono text-[11px] border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
              />
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
              Lưu mẻ cân
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
