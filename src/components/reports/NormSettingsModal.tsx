import React, { useState, useEffect } from 'react';
import { normService, NORM_PRESETS, NormThresholdSettings } from '../../services/normService';
import { StageWiPSummary } from '../../types/log.types';

interface NormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBatchId: string;
  stages: StageWiPSummary[];
  onSaveSuccess: () => void;
}

export const NormSettingsModal: React.FC<NormSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedBatchId,
  stages,
  onSaveSuccess
}) => {
  // Phạm vi áp dụng: 'GLOBAL' (Toàn xưởng) hoặc 'BATCH' (Riêng lô đang chọn)
  const [scope, setScope] = useState<'GLOBAL' | 'BATCH'>('GLOBAL');

  // Bản sao cục bộ của định mức
  const [norms, setNorms] = useState<Record<string, number>>({});

  // Ngưỡng cảnh báo
  const [thresholds, setThresholds] = useState<NormThresholdSettings>({
    criticalLossThreshold: 5.0,
    warningLossThreshold: 2.0,
    bottleneckWipKg: 40.0
  });

  const [activeTab, setActiveTab] = useState<'NORMS' | 'THRESHOLDS'>('NORMS');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Khởi tạo dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const hasBatchCustom = normService.hasBatchCustomNorms(selectedBatchId);
      const initialScope = hasBatchCustom ? 'BATCH' : 'GLOBAL';
      setScope(initialScope);
      loadNormsForScope(initialScope);
      setThresholds(normService.getThresholdSettings());
    }
  }, [isOpen, selectedBatchId]);

  const loadNormsForScope = (currentScope: 'GLOBAL' | 'BATCH') => {
    if (currentScope === 'BATCH' && selectedBatchId && selectedBatchId !== 'ALL') {
      setNorms(normService.getAllTargetNorms(selectedBatchId));
    } else {
      setNorms(normService.getGlobalTargetNorms());
    }
  };

  const handleScopeChange = (newScope: 'GLOBAL' | 'BATCH') => {
    setScope(newScope);
    loadNormsForScope(newScope);
  };

  const handleNormChange = (stageId: string, val: number) => {
    setNorms(prev => ({
      ...prev,
      [stageId.toUpperCase()]: Number(val)
    }));
  };

  const handleQuickStep = (stageId: string, delta: number) => {
    const sId = stageId.toUpperCase();
    const current = norms[sId] ?? normService.getTargetNorm(sId);
    const updated = Math.max(1, Number((current + delta).toFixed(1)));
    handleNormChange(sId, updated);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = NORM_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setNorms({ ...preset.norms });
    showToast(`Đã nạp mẫu: "${preset.name}"! Hãy bấm "Lưu & Áp dụng" để kích hoạt.`);
  };

  const handleSave = () => {
    const targetBatchId = scope === 'BATCH' ? selectedBatchId : undefined;
    normService.saveAllTargetNorms(norms, targetBatchId);
    normService.saveThresholdSettings(thresholds);

    showToast('Đã lưu cấu hình định mức thành công!');
    setTimeout(() => {
      onSaveSuccess();
      onClose();
    }, 400);
  };

  const handleResetToFactoryDefault = () => {
    if (window.confirm('Khôi phục toàn bộ định mức về chuẩn mặc định ban đầu của nhà máy chế biến tôm?')) {
      if (scope === 'BATCH') {
        normService.resetBatchToGlobal(selectedBatchId);
        setScope('GLOBAL');
      } else {
        normService.resetTargetNorms();
      }
      setNorms(normService.getGlobalTargetNorms());
      setThresholds(normService.getThresholdSettings());
      showToast('Đã khôi phục định mức chuẩn mặc định!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Lọc công đoạn theo tìm kiếm
  const filteredStages = stages.filter(st => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return st.processId.toLowerCase().includes(q) || st.processName.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER MODAL */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DE4444] border border-red-200 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                CÀI ĐẶT & THIẾT LẬP ĐỊNH MỨC SẢN XUẤT
              </h2>
              <p className="text-xs text-slate-500">
                Tự do thiết lập định mức chuẩn (%) cho từng công đoạn và cấu hình các ngưỡng báo động hụt định mức / nghẽn chuyền.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* THÔNG BÁO TOAST NẾU CÓ */}
        {toastMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {toastMessage}
          </div>
        )}

        {/* CHỌN PHẠM VI ÁP DỤNG & TABS CHÍNH */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Radio Switch: Toàn nhà máy vs Riêng lô */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleScopeChange('GLOBAL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                scope === 'GLOBAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Toàn nhà máy (Chung)
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange('BATCH')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                scope === 'BATCH'
                  ? 'bg-[#DE4444] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 Riêng Lô: <span className="font-mono">{selectedBatchId}</span>
            </button>
          </div>

          {/* Tab chọn Cài Định mức vs Cài Ngưỡng Cảnh báo */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('NORMS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'NORMS'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Định mức các công đoạn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('THRESHOLDS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'THRESHOLDS'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ngưỡng cảnh báo & Nghẽn
            </button>
          </div>
        </div>

        {/* NỘI DUNG CUỘN CHÍNH */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'NORMS' ? (
            <>
              {/* THANH GỢI Ý MẪU CHUẨN (PRESETS) */}
              <div className="mb-4 p-3.5 bg-gradient-to-r from-red-50/70 via-slate-50 to-blue-50/70 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>⚡ Nạp nhanh bộ mẫu định mức chuẩn ngành thủy sản:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">1-click điền sẵn toàn bộ công đoạn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {NORM_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      className="text-left p-2.5 bg-white border border-slate-200/90 hover:border-[#DE4444] rounded-lg transition-all hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-[#DE4444]">
                          {preset.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-red-50 text-[#DE4444]">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* TÌM KIẾM CÔNG ĐOẠN */}
              <div className="flex items-center justify-between mb-3 gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  Danh sách {stages.length} công đoạn đang áp dụng {scope === 'BATCH' ? `(cho Lô ${selectedBatchId})` : '(toàn xưởng)'}:
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo mã hoặc tên công đoạn..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-64 px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#DE4444]"
                />
              </div>

              {/* BẢNG CÀI ĐẶT ĐỊNH MỨC CHI TIẾT */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 w-20">Mã bước</th>
                      <th className="py-2.5 px-3">Tên công đoạn</th>
                      <th className="py-2.5 px-3 w-32">Tính chất kỹ thuật</th>
                      <th className="py-2.5 px-3 w-64 text-center">Định mức đã set sẵn (%)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Mặc định gốc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredStages.map(stage => {
                      const sId = stage.processId.toUpperCase();
                      const currentVal = norms[sId] ?? normService.getTargetNorm(sId, stage.processName, scope === 'BATCH' ? selectedBatchId : undefined);
                      const defaultVal = normService.getTargetNorm(sId, stage.processName);
                      const isModified = currentVal !== defaultVal;

                      return (
                        <tr key={stage.processId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Mã bước */}
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {stage.processId}
                            </span>
                          </td>

                          {/* Tên công đoạn */}
                          <td className="py-2.5 px-3 font-sans">
                            <span className="font-semibold text-slate-900">{stage.processName}</span>
                          </td>

                          {/* Tính chất kỹ thuật */}
                          <td className="py-2.5 px-3 font-sans text-[11px]">
                            {currentVal > 100 ? (
                              <span className="text-blue-700 font-medium">Tăng trọng (+{Number((currentVal - 100).toFixed(1))}%)</span>
                            ) : currentVal < 100 ? (
                              <span className="text-amber-700 font-medium">Hao hụt (-{Number((100 - currentVal).toFixed(1))}%)</span>
                            ) : (
                              <span className="text-slate-400 font-normal">Bảo toàn (100%)</span>
                            )}
                          </td>

                          {/* Ô nhập Định mức (%) */}
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickStep(stage.processId, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                                title="Giảm 1%"
                              >
                                -
                              </button>

                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  max="300"
                                  value={currentVal}
                                  onChange={e => handleNormChange(stage.processId, parseFloat(e.target.value) || 0)}
                                  className={`w-20 px-2 py-1 text-center font-bold font-mono text-xs rounded-md border focus:outline-none focus:ring-2 focus:ring-[#DE4444] ${
                                    isModified
                                      ? 'bg-red-50/70 border-red-300 text-[#DE4444]'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                />
                                <span className="absolute right-1.5 top-1.5 text-[10px] text-slate-400 font-sans pointer-events-none">
                                  %
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleQuickStep(stage.processId, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                                title="Tăng 1%"
                              >
                                +
                              </button>

                              {/* Nút reset riêng dòng */}
                              {isModified && (
                                <button
                                  type="button"
                                  onClick={() => handleNormChange(stage.processId, defaultVal)}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 underline ml-1 cursor-pointer font-sans"
                                  title="Đặt về mặc định gốc"
                                >
                                  Mặc định
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Mặc định gốc */}
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-xs">
                            {defaultVal.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* TAB CÀI ĐẶT NGƯỠNG CẢNH BÁO */
            <div className="space-y-5 max-w-2xl mx-auto py-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Ngưỡng Báo Động Hụt Định Mức Nghiêm Trọng (Màu Đỏ)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Khi tỷ lệ thu hồi thực tế thấp hơn định mức đã set sẵn vượt quá ngưỡng này, hệ thống sẽ kích hoạt báo động khẩn cấp để quản đốc xử lý ngay.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-700">Báo động khi hụt quá:</span>
                  <div className="relative w-32">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="50"
                      value={thresholds.criticalLossThreshold}
                      onChange={e => setThresholds({ ...thresholds, criticalLossThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-center font-bold font-mono text-sm border border-red-300 bg-red-50 text-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-red-500 font-bold pointer-events-none">%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">(Mặc định: 5.0%)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Ngưỡng Cảnh Báo Cận Định Mức (Màu Vàng)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Khi tỷ lệ thực tế thấp hơn định mức trong khoảng từ ngưỡng này đến ngưỡng nghiêm trọng (cần theo dõi thêm).
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-700">Cảnh báo khi hụt từ:</span>
                  <div className="relative w-32">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="20"
                      value={thresholds.warningLossThreshold}
                      onChange={e => setThresholds({ ...thresholds, warningLossThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-center font-bold font-mono text-sm border border-amber-300 bg-amber-50 text-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-amber-700 font-bold pointer-events-none">%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">(Mặc định: 2.0%)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                  Ngưỡng Phát Hiện Nghẽn Chuyền (Bottleneck WIP)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Khối lượng hàng dở dang (WIP) tồn đọng tại 1 công đoạn vượt quá mức này sẽ được gắn cờ là Điểm Nghẽn Chuyền.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-700">Báo nghẽn khi WIP vượt:</span>
                  <div className="relative w-32">
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="1000"
                      value={thresholds.bottleneckWipKg}
                      onChange={e => setThresholds({ ...thresholds, bottleneckWipKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-center font-bold font-mono text-sm border border-rose-300 bg-rose-50 text-rose-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-rose-700 font-bold pointer-events-none">kg</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">(Mặc định: 40.0 kg)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToFactoryDefault}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 bg-white border border-slate-300 rounded-lg hover:border-red-300 transition-colors cursor-pointer"
          >
            Khôi phục chuẩn mặc định gốc
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 text-xs font-bold text-white bg-[#DE4444] hover:bg-[#C93333] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Lưu & Áp dụng ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
