import React, { useState, useMemo, useEffect } from 'react';
import { StageWiPSummary, BatchSummary } from '../../types/log.types';
import { normService } from '../../services/normService';
import { NormSettingsModal } from './NormSettingsModal';

interface BatchStageDetailReportTableProps {
  stages: StageWiPSummary[];
  selectedBatchId: string;
  batches: BatchSummary[];
  onSelectBatch: (batchId: string) => void;
}

export const BatchStageDetailReportTable: React.FC<BatchStageDetailReportTableProps> = ({
  stages,
  selectedBatchId,
  batches,
  onSelectBatch
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL_LOW' | 'BOTTLENECK' | 'ACTIVE'>('ALL');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [tempNormValue, setTempNormValue] = useState<string>('');
  const [isNormModalOpen, setIsNormModalOpen] = useState<boolean>(false);

  // Đọc định mức tự động theo Lô được chọn (hoặc toàn xưởng)
  const [targetNorms, setTargetNorms] = useState<Record<string, number>>(() =>
    normService.getAllTargetNorms(selectedBatchId)
  );

  const [thresholds, setThresholds] = useState(() => normService.getThresholdSettings());

  // Cập nhật khi đổi Lô
  useEffect(() => {
    setTargetNorms(normService.getAllTargetNorms(selectedBatchId));
    setThresholds(normService.getThresholdSettings());
  }, [selectedBatchId]);

  const hasBatchCustomNorms = normService.hasBatchCustomNorms(selectedBatchId);

  const currentBatch = useMemo(() => {
    return batches.find(b => b.batchId === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Tính toán đánh giá cho từng bước
  const evaluatedStages = useMemo(() => {
    return stages.map(st => {
      const targetNorm = targetNorms[st.processId.toUpperCase()] ?? normService.getTargetNorm(st.processId, st.processName, selectedBatchId);
      const normEval = normService.evaluateNorm(st.inWeight, st.outWeight, targetNorm, thresholds);
      const bottleneckEval = normService.evaluateBottleneck(st.inWeight, st.outWeight, st.wipWeight, st.inCount, st.outCount, thresholds);

      return {
        ...st,
        targetNorm,
        normEval,
        bottleneckEval
      };
    });
  }, [stages, targetNorms, thresholds, selectedBatchId]);

  // Bộ đếm cảnh báo
  const counts = useMemo(() => {
    return {
      all: evaluatedStages.length,
      criticalLow: evaluatedStages.filter(s => s.normEval.status === 'CRITICAL_LOW').length,
      bottlenecks: evaluatedStages.filter(s => s.bottleneckEval.status === 'CRITICAL_BOTTLENECK').length,
      active: evaluatedStages.filter(s => s.inWeight > 0 || s.outWeight > 0 || s.wipWeight > 0).length
    };
  }, [evaluatedStages]);

  // Lọc dữ liệu theo tab
  const filteredStages = useMemo(() => {
    return evaluatedStages.filter(s => {
      if (filterMode === 'CRITICAL_LOW') return s.normEval.status === 'CRITICAL_LOW';
      if (filterMode === 'BOTTLENECK') return s.bottleneckEval.status === 'CRITICAL_BOTTLENECK';
      if (filterMode === 'ACTIVE') return s.inWeight > 0 || s.outWeight > 0 || s.wipWeight > 0;
      return true;
    });
  }, [evaluatedStages, filterMode]);

  // Cập nhật định mức đã set sẵn (Inline)
  const handleSaveNorm = (stageId: string) => {
    const num = parseFloat(tempNormValue);
    if (!isNaN(num) && num > 0) {
      // Lưu cho lô hiện tại nếu lô đang có định mức riêng, hoặc lưu cho lô nếu người dùng muốn
      normService.setTargetNorm(stageId, num, hasBatchCustomNorms ? selectedBatchId : undefined);
      setTargetNorms(normService.getAllTargetNorms(selectedBatchId));
    }
    setEditingStageId(null);
  };

  // Xuất file CSV chi tiết theo công đoạn
  const handleExportCSV = () => {
    const headers = [
      'Mã công đoạn',
      'Tên công đoạn',
      'Vào IN (kg)',
      'Số mẻ IN',
      'Ra OUT (kg)',
      'Số mẻ OUT',
      'Đang đọng WIP (kg)',
      'Định mức thực tế (%)',
      'Định mức đã set sẵn (%)',
      'Chênh lệch định mức (%)',
      'Đánh giá định mức',
      'Năng suất & Nghẽn chuyền'
    ];

    const rows = filteredStages.map(s => [
      `"${s.processId}"`,
      `"${s.processName}"`,
      s.inWeight.toFixed(2),
      s.inCount,
      s.outWeight.toFixed(2),
      s.outCount,
      s.wipWeight.toFixed(2),
      s.normEval.actualYield.toFixed(1),
      s.targetNorm.toFixed(1),
      s.normEval.diff.toFixed(1),
      `"${s.normEval.label}"`,
      `"${s.bottleneckEval.label} (${s.bottleneckEval.description})"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_chi_tiet_cong_doan_${selectedBatchId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="batch-stage-detail-section" className="bg-white border border-slate-200/90 rounded-xl shadow-2xs mb-8 overflow-hidden scroll-mt-6">
      {/* Header của Bảng 2 */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                BẢNG CHI TIẾT THEO TỪNG CÔNG ĐOẠN CỦA LÔ
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                Lô {selectedBatchId}
              </span>

              {/* Huy hiệu định mức riêng vs toàn xưởng */}
              {hasBatchCustomNorms ? (
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-red-50 text-[#DE4444] border border-red-200" title="Lô này đang có bộ định mức kỹ thuật riêng biệt">
                  🎯 Định mức riêng của Lô
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Đang áp dụng định mức chuẩn chung toàn nhà máy">
                  🏢 Chuẩn chung nhà máy
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phân tích 5 thành phần: <strong className="text-slate-700">IN</strong>, <strong className="text-slate-700">OUT</strong>, <strong className="text-slate-700">WIP</strong>, <strong className="text-slate-700">Định mức thực tế</strong>, <strong className="text-slate-700">Định mức đã set sẵn</strong>. Phát hiện ngay các bước bị hụt định mức nghiêm trọng và nghẽn chuyền.
            </p>
          </div>

          {/* Chọn Lô & Nút Cài đặt Định mức */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="font-semibold text-slate-500">Đang chọn lô:</span>
              <select
                value={selectedBatchId}
                onChange={e => onSelectBatch(e.target.value)}
                className="bg-transparent font-bold font-mono text-[#DE4444] focus:outline-none cursor-pointer"
              >
                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} - {b.batchName} ({b.status === 'COMPLETED' ? 'Đã xong' : 'Đang làm'})
                  </option>
                ))}
              </select>
            </div>

            {/* NÚT TỰ CÀI ĐẶT ĐỊNH MỨC NỔI BẬT */}
            <button
              type="button"
              onClick={() => setIsNormModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DE4444] hover:bg-[#C93333] rounded-lg shadow-sm transition-all cursor-pointer"
              title="Mở bảng điều khiển tự cài đặt định mức chuẩn cho từng công đoạn"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>⚙️ Cài đặt định mức</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Thẻ tóm tắt thông số Lô đang chọn */}
        {currentBatch && (
          <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="font-bold text-slate-900">
                {currentBatch.batchName}
                {currentBatch.origin && (
                  <span className="font-normal text-slate-500 ml-1.5">({currentBatch.origin})</span>
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                currentBatch.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : currentBatch.status === 'PENDING'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {currentBatch.status === 'COMPLETED' ? 'Đã xong' : currentBatch.status === 'PENDING' ? 'Chưa làm' : 'Đang làm'}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] flex-wrap">
              <div>
                <span className="text-slate-400 font-sans">Kế hoạch: </span>
                <strong className="text-slate-800">{formatKg(currentBatch.plannedWeight)} kg</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Vào (IN): </span>
                <strong className="text-blue-700">{formatKg(currentBatch.inWeight)} kg</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Ra (OUT): </span>
                <strong className="text-emerald-700">{formatKg(currentBatch.outWeight)} kg</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Đọng WIP: </span>
                <strong className="text-amber-800">{formatKg(currentBatch.wipWeight)} kg</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Thu hồi lô: </span>
                <strong className="text-slate-900">{currentBatch.yieldRate.toFixed(1)}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Thanh tab bộ lọc nhanh & cảnh báo */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Chế độ xem:</span>
          {[
            { key: 'ALL' as const, label: 'Tất cả các bước', count: counts.all, alert: false },
            {
              key: 'CRITICAL_LOW' as const,
              label: `⚠️ Hụt định mức nghiêm trọng (>${thresholds.criticalLossThreshold}%)`,
              count: counts.criticalLow,
              alert: counts.criticalLow > 0,
              alertClass: 'bg-red-50 text-red-700 border-red-300'
            },
            {
              key: 'BOTTLENECK' as const,
              label: `🚨 Điểm nghẽn chuyền (>${thresholds.bottleneckWipKg}kg)`,
              count: counts.bottlenecks,
              alert: counts.bottlenecks > 0,
              alertClass: 'bg-rose-50 text-rose-700 border-rose-300'
            },
            { key: 'ACTIVE' as const, label: 'Đang có sản lượng', count: counts.active, alert: false }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterMode(tab.key)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                filterMode === tab.key
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : tab.alert
                  ? `${tab.alertClass} border font-bold animate-pulse`
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterMode === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bảng phân tích 5 thành phần chi tiết */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-3 w-24">Mã bước</th>
              <th className="py-3 px-3">Tên công đoạn</th>
              <th className="py-3 px-3 text-right w-28 bg-blue-50/50">1. Vào (IN)</th>
              <th className="py-3 px-3 text-right w-28 bg-emerald-50/50">2. Ra (OUT)</th>
              <th className="py-3 px-3 text-right w-28 bg-amber-50/50">3. Đọng WIP</th>
              <th className="py-3 px-3 text-right w-32 bg-purple-50/40">4. Định mức thực tế</th>
              <th className="py-3 px-3 text-right w-40 bg-slate-50">5. Định mức đã set</th>
              <th className="py-3 px-3 text-center w-40">Đánh giá định mức</th>
              <th className="py-3 px-3 text-center w-44">Năng suất & Nghẽn chuyền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredStages.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                  {filterMode === 'CRITICAL_LOW'
                    ? '🎉 Xuất sắc! Không có công đoạn nào bị hụt định mức nghiêm trọng.'
                    : filterMode === 'BOTTLENECK'
                    ? '🎉 Tuyệt vời! Không phát hiện điểm nghẽn chuyền nào tại lô này.'
                    : 'Không tìm thấy công đoạn nào phù hợp.'}
                </td>
              </tr>
            ) : (
              filteredStages.map((stage, idx) => {
                const isEditing = editingStageId === stage.processId;
                const isCriticalLoss = stage.normEval.status === 'CRITICAL_LOW';
                const isBottleneck = stage.bottleneckEval.status === 'CRITICAL_BOTTLENECK';

                return (
                  <tr
                    key={stage.processId}
                    className={`transition-colors ${
                      isCriticalLoss
                        ? 'bg-red-50/60 hover:bg-red-50/80'
                        : isBottleneck
                        ? 'bg-rose-50/50 hover:bg-rose-50/70'
                        : stage.wipWeight > 0
                        ? 'bg-amber-50/20 hover:bg-amber-50/30'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* STT */}
                    <td className="py-3 px-3 text-center text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Mã bước */}
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {stage.processId}
                      </span>
                    </td>

                    {/* Tên công đoạn */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-900">
                        {stage.processName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {stage.isStartStage ? '🟢 Bước tiếp nhận gốc' : stage.isEndStage ? '🏁 Bước thành phẩm cuối' : stage.stageType}
                      </div>
                    </td>

                    {/* 1. Vào (IN) */}
                    <td className="py-3 px-3 text-right bg-blue-50/20">
                      <div className="font-bold text-blue-700">
                        {formatKg(stage.inWeight)}
                        <span className="text-[10px] text-blue-400 font-normal ml-0.5">kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal font-sans">
                        {stage.inCount} mẻ vào
                      </div>
                    </td>

                    {/* 2. Ra (OUT) */}
                    <td className="py-3 px-3 text-right bg-emerald-50/20">
                      <div className="font-bold text-emerald-700">
                        {formatKg(stage.outWeight)}
                        <span className="text-[10px] text-emerald-400 font-normal ml-0.5">kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal font-sans">
                        {stage.outCount} mẻ ra
                      </div>
                    </td>

                    {/* 3. Đang đọng WIP */}
                    <td className="py-3 px-3 text-right bg-amber-50/20">
                      <div className={`font-bold ${stage.wipWeight > 0 ? 'text-amber-800 font-black' : 'text-slate-300'}`}>
                        {formatKg(stage.wipWeight)}
                        <span className="text-[10px] text-amber-500 font-normal ml-0.5">kg</span>
                      </div>
                      {stage.wipWeight > 0 && (
                        <div className="text-[10px] text-amber-600 font-sans">
                          Còn trên chuyền
                        </div>
                      )}
                    </td>

                    {/* 4. Định mức thực tế (%) */}
                    <td className="py-3 px-3 text-right bg-purple-50/20">
                      <div className="font-black text-purple-900 text-sm">
                        {stage.inWeight > 0
                          ? `${stage.normEval.actualYield.toFixed(1)}%`
                          : stage.outWeight > 0
                          ? '100.0%'
                          : '—'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {stage.inWeight > 0 ? (
                          stage.outWeight > stage.inWeight
                            ? `Tăng +${(stage.outWeight - stage.inWeight).toFixed(1)} kg`
                            : `Hụt -${(stage.inWeight - stage.outWeight).toFixed(1)} kg`
                        ) : stage.outWeight > 0 ? (
                          `Xuất mẻ (${stage.outWeight.toFixed(1)} kg)`
                        ) : (
                          'Chưa có dữ liệu'
                        )}
                      </div>
                    </td>

                    {/* 5. Định mức đã set sẵn (%) - Cho phép sửa trực tiếp và có nút click mở modal */}
                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <input
                            type="number"
                            step="0.5"
                            value={tempNormValue}
                            onChange={e => setTempNormValue(e.target.value)}
                            className="w-16 px-1.5 py-0.5 border border-[#DE4444] rounded text-right font-mono text-xs focus:outline-none"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveNorm(stage.processId);
                              if (e.key === 'Escape') setEditingStageId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNorm(stage.processId)}
                            className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-medium"
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group">
                          <span className="font-bold text-slate-800 text-xs">
                            {stage.targetNorm.toFixed(1)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStageId(stage.processId);
                              setTempNormValue(stage.targetNorm.toString());
                            }}
                            className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-[#DE4444] transition-opacity p-0.5 cursor-pointer"
                            title="Sửa nhanh định mức cho công đoạn này"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-sans">
                        {hasBatchCustomNorms ? 'Riêng của lô' : 'Chuẩn xưởng'}
                      </div>
                    </td>

                    {/* ĐÁNH GIÁ ĐỊNH MỨC (Thực tế vs Set sẵn) */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${stage.normEval.badgeClass}`}>
                        {stage.normEval.label}
                      </span>
                    </td>

                    {/* NĂNG SUẤT & NGHẼN CHUYỀN (Bottleneck) */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] border ${stage.bottleneckEval.badgeClass}`}>
                        {stage.bottleneckEval.label}
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px] mx-auto mt-0.5 font-mono">
                        {stage.bottleneckEval.description}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Dòng Tổng kết các bước */}
          {filteredStages.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800 font-mono">
                <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px] font-sans">
                  Tổng hợp ({filteredStages.length} công đoạn):
                </td>
                <td className="py-3 px-3 text-right text-blue-800 bg-blue-100/40">
                  {formatKg(filteredStages.reduce((a, s) => a + s.inWeight, 0))} kg
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 bg-emerald-100/40">
                  {formatKg(filteredStages.reduce((a, s) => a + s.outWeight, 0))} kg
                </td>
                <td className="py-3 px-3 text-right text-amber-900 bg-amber-100/40 font-black">
                  {formatKg(filteredStages.reduce((a, s) => a + s.wipWeight, 0))} kg
                </td>
                <td colSpan={4} className="py-3 px-3 text-center font-sans text-xs text-slate-500">
                  Cảnh báo: <strong className="text-red-700 font-mono">{counts.criticalLow}</strong> bước hụt định mức • <strong className="text-rose-700 font-mono">{counts.bottlenecks}</strong> bước nghẽn chuyền
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MODAL CÀI ĐẶT ĐỊNH MỨC TOÀN DIỆN */}
      <NormSettingsModal
        isOpen={isNormModalOpen}
        onClose={() => setIsNormModalOpen(false)}
        selectedBatchId={selectedBatchId}
        stages={stages}
        onSaveSuccess={() => {
          setTargetNorms(normService.getAllTargetNorms(selectedBatchId));
          setThresholds(normService.getThresholdSettings());
        }}
      />
    </div>
  );
};
