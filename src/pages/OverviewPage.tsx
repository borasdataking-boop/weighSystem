import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { ProductionKPICards } from '../components/overview/ProductionKPICards';
import { VisualPipelineFlow } from '../components/overview/VisualPipelineFlow';
import { ProductionLogTable } from '../components/overview/ProductionLogTable';
import { BatchModal } from '../components/overview/BatchModal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

import { logService } from '../services/logService';
import { processService } from '../services/processService';
import { stationService } from '../services/stationService';
import { productService } from '../services/productService';

import { ProductionWeightLog, ProductionMetrics, BatchSummary, StageWiPSummary, BatchInfo } from '../types/log.types';
import { ProcessStage } from '../types/process.types';
import { StationWeigh } from '../types/station.types';
import { ProductItem } from '../types/product.types';

interface OverviewPageProps {
  onNavigate?: (tabKey: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<ProductionWeightLog[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [stations, setStations] = useState<StationWeigh[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');

  // Mặc định ẩn hoàn toàn bảng nhật ký cân để giao diện gọn gàng
  const [isLogTableVisible, setIsLogTableVisible] = useState<boolean>(false);

  // Quản lý Modal Lô: Thêm mới, Chỉnh sửa thông tin ban đầu, Xoá lô
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchModalMode, setBatchModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [editingBatchData, setEditingBatchData] = useState<BatchInfo | null>(null);

  const [metrics, setMetrics] = useState<ProductionMetrics>({
    totalInWeight: 0,
    totalOutWeight: 0,
    wipWeight: 0,
    yieldRate: 0,
    inCount: 0,
    outCount: 0,
    activeBatchesCount: 0
  });

  const [batchSummaries, setBatchSummaries] = useState<BatchSummary[]>([]);
  const [stageWiPList, setStageWiPList] = useState<StageWiPSummary[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tải dữ liệu trực tiếp từ Database & Service
  const loadAllData = async () => {
    try {
      const [rawLogs, procData, stns, prods] = await Promise.all([
        logService.fetchLogs(selectedBatch),
        processService.fetchProcesses(),
        stationService.fetchStations(),
        productService.fetchProducts()
      ]);

      const stgs = procData.stages || [];
      setLogs(rawLogs);
      setStages(stgs);
      setStations(stns);
      setProducts(prods);

      setMetrics(logService.getMetrics(selectedBatch, rawLogs));
      setBatchSummaries(logService.getBatchSummaries(rawLogs));
      setStageWiPList(logService.getStageWiPSummaries(stgs, selectedBatch, rawLogs));
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu từ database:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedBatch]);

  // Cập nhật ngầm thời gian thực (Live Polling mỗi 3 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedBatch]);

  const handleDeleteLog = async (logId: number) => {
    await logService.deleteLogFromDatabase(logId);
    await loadAllData();
  };

  // --- CÁC HÀM XỬ LÝ QUẢN LÝ LÔ (THÊM, SỬA THÔNG TIN BAN ĐẦU, XOÁ) ---
  const handleOpenAddBatch = () => {
    setBatchModalMode('add');
    setEditingBatchData(null);
    setIsBatchModalOpen(true);
  };

  const handleOpenEditBatch = () => {
    if (selectedBatch === 'ALL') return;
    const found = logService.getBatchInfo(selectedBatch) || {
      batchId: selectedBatch,
      batchName: `Lô ${selectedBatch}`,
      status: 'IN_PROGRESS'
    };
    setBatchModalMode('edit');
    setEditingBatchData(found);
    setIsBatchModalOpen(true);
  };

  const handleOpenDeleteBatch = () => {
    if (selectedBatch === 'ALL') return;
    const found = logService.getBatchInfo(selectedBatch) || {
      batchId: selectedBatch,
      batchName: `Lô ${selectedBatch}`,
      status: 'IN_PROGRESS'
    };
    setBatchModalMode('delete');
    setEditingBatchData(found);
    setIsBatchModalOpen(true);
  };

  const handleSaveBatch = async (batch: BatchInfo) => {
    await logService.saveBatch(batch);
    setSelectedBatch(batch.batchId);
    await loadAllData();
    setToasts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'success',
        title: batchModalMode === 'add' ? 'Đã tạo Lô sản xuất mới!' : 'Đã cập nhật thông tin ban đầu của Lô!',
        message: `Mã: ${batch.batchId} - ${batch.batchName}`
      }
    ]);
  };

  const handleDeleteBatch = async (batchIdToDelete: string) => {
    await logService.deleteBatch(batchIdToDelete);
    setSelectedBatch('ALL');
    await loadAllData();
    setToasts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'success',
        title: 'Đã xoá Lô sản xuất!',
        message: `Đã xoá thành công lô ${batchIdToDelete} khỏi hệ thống.`
      }
    ]);
  };

  // Danh sách các lô hàng hợp nhất từ logs và metadata
  const uniqueBatches = logService.getBatches(logs);

  // Thông tin chi tiết ban đầu của lô đang được chọn
  const activeBatchInfo = selectedBatch !== 'ALL' ? logService.getBatchInfo(selectedBatch) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Header đỏ thương hiệu Phan Bách */}
      <Header activeTab="overview" onTabChange={onNavigate} />

      {/* 2. Main Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Hệ thống</span>
          <span>/</span>
          <span className="font-semibold text-slate-700">Tổng quan</span>
        </div>

        {/* 3. THANH ĐIỀU HÀNH TRUNG TÂM */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Tổng quan
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trực tiếp
            </span>
          </div>

          {/* Cụm điều khiển Lô: Dropdown + Sửa thông tin + Xoá + Thêm Lô mới */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ chọn Lô - Thiết kế nguyên khối, cân đối & mượt mà */}
            <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/70 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs transition-all focus-within:ring-2 focus-within:ring-[#DE4444]/15 focus-within:border-[#DE4444]">
              {/* Icon & Nhãn Lô */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0 mr-2">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Lô:</span>
              </div>

              {/* Select native với custom chevron */}
              <div className="relative flex items-center">
                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer tracking-tight"
                >
                  <option value="ALL">Tất cả lô</option>
                  {uniqueBatches.map(b => (
                    <option key={b} value={b}>Lô {b}</option>
                  ))}
                </select>

                <svg className="w-3.5 h-3.5 text-slate-400 absolute right-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Các nút Chỉnh sửa thông tin ban đầu & Xoá lô (chỉ hiện khi đang chọn 1 lô cụ thể) */}
            {selectedBatch !== 'ALL' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenEditBatch}
                  className="h-8.5 px-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Chỉnh sửa thông tin ban đầu của lô này"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Sửa lô</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenDeleteBatch}
                  className="h-8.5 px-2.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Xoá lô này"
                >
                  <svg className="w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Xoá lô</span>
                </button>
              </div>
            )}

            {/* Nút Thêm lô mới (Luôn hiển thị) */}
            <button
              type="button"
              onClick={handleOpenAddBatch}
              className="h-8.5 px-3 text-xs font-bold text-white bg-[#DE4444] hover:bg-[#c93636] rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Tạo mới một lô sản xuất"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Thêm lô</span>
            </button>
          </div>
        </div>

        {/* THÔNG TIN BAN ĐẦU CỦA LÔ ĐƯỢC CHỌN (Khối thông tin trực quan cho quản lý) */}
        {activeBatchInfo && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs mb-5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded font-mono border border-slate-200">
                {activeBatchInfo.batchId}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {activeBatchInfo.batchName}
              </span>
              {activeBatchInfo.plannedWeight && activeBatchInfo.plannedWeight > 0 ? (
                <span className="text-slate-500">
                  • Kế hoạch ban đầu: <strong className="font-mono text-blue-700 font-bold">{activeBatchInfo.plannedWeight.toLocaleString('vi-VN')} kg</strong> (≈ {(activeBatchInfo.plannedWeight / 1000).toFixed(1)} tấn)
                </span>
              ) : null}
              {activeBatchInfo.origin && (
                <span className="text-slate-500">
                  • Xuất xứ: <span className="text-slate-700 font-medium">{activeBatchInfo.origin}</span>
                </span>
              )}
              {activeBatchInfo.startDate && (
                <span className="text-slate-500">
                  • Bắt đầu: <span className="font-mono text-slate-700">{activeBatchInfo.startDate}</span>
                </span>
              )}
              {activeBatchInfo.notes && (
                <span className="text-slate-400 italic">
                  ({activeBatchInfo.notes})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeBatchInfo.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeBatchInfo.status === 'PENDING'
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {activeBatchInfo.status === 'COMPLETED' ? 'Đã hoàn thành' : activeBatchInfo.status === 'PENDING' ? 'Chờ sản xuất' : 'Đang sản xuất'}
              </span>
            </div>
          </div>
        )}

        {/* 4. BA CON SỐ CỐT LÕI MÀ QUẢN LÝ CẦN BIẾT: ĐẦU VÀO -> ĐẦU RA -> ĐỌNG LẠI */}
        <ProductionKPICards
          metrics={metrics}
          selectedBatch={selectedBatch}
        />

        {/* 5. CÁC CÔNG ĐOẠN SẢN XUẤT */}
        <VisualPipelineFlow
          stageWiPList={stageWiPList}
        />

        {/* 6. NHẬT KÝ CÂN (ẨN MẶC ĐỊNH, CHỈ MỞ KHI CẦN XEM) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsLogTableVisible(prev => !prev)}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Nhật ký cân ({logs.length.toLocaleString('vi-VN')} lần cân)</span>
            </div>

            <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
              {isLogTableVisible ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
            </span>
          </button>

          {isLogTableVisible && (
            <div className="mt-3">
              <ProductionLogTable
                logs={logs}
                stages={stages}
                stations={stations}
                products={products}
                selectedBatch={selectedBatch}
                onSelectBatch={setSelectedBatch}
                onDeleteLog={handleDeleteLog}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modal Quản Lý Lô (Thêm lô / Sửa thông tin ban đầu / Xoá lô) */}
      <BatchModal
        isOpen={isBatchModalOpen}
        mode={batchModalMode}
        batchData={editingBatchData}
        onClose={() => setIsBatchModalOpen(false)}
        onSave={handleSaveBatch}
        onDelete={handleDeleteBatch}
      />

      {/* Thông báo Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default OverviewPage;
