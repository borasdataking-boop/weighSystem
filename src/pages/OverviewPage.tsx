import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { BatchProductionHub } from '../components/overview/BatchProductionHub';
import { ProductionKPICards } from '../components/overview/ProductionKPICards';
import { ProductionVisualCharts } from '../components/overview/ProductionVisualCharts';
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

  // Ngăn quản lý Lô & Nhật ký dạng bảng: Mặc định thu gọn để ưu tiên 100% không gian cho Biểu đồ
  const [isManagementDrawerOpen, setIsManagementDrawerOpen] = useState<boolean>(false);
  const [isLogTableVisible, setIsLogTableVisible] = useState<boolean>(false);
  const [isPipelineExpanded, setIsPipelineExpanded] = useState<boolean>(false);

  // Quản lý Modal Lô
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
      const mappings = procData.mappings || [];
      setLogs(rawLogs);
      setStages(stgs);
      setStations(stns);
      setProducts(prods);

      setMetrics(logService.getMetrics(selectedBatch, rawLogs, stgs, mappings));
      setBatchSummaries(logService.getBatchSummaries(rawLogs, stgs, mappings));
      setStageWiPList(logService.getStageWiPSummaries(stgs, selectedBatch, rawLogs, mappings));
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

  const handleOpenAddBatch = () => {
    setBatchModalMode('add');
    setEditingBatchData(null);
    setIsBatchModalOpen(true);
  };

  const handleOpenEditBatchSpecific = (batch: BatchInfo) => {
    setBatchModalMode('edit');
    setEditingBatchData(batch);
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
        title: batchModalMode === 'add' ? 'Đã tạo Lô mới!' : 'Đã cập nhật Lô!',
        message: `${batch.batchId} - ${batch.batchName}`
      }
    ]);
  };

  const handleDeleteBatch = async (batchIdToDelete: string) => {
    await logService.deleteBatch(batchIdToDelete);
    if (selectedBatch === batchIdToDelete) {
      setSelectedBatch('ALL');
    }
    await loadAllData();
    setToasts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'success',
        title: 'Đã xoá Lô!',
        message: `Mã ${batchIdToDelete}`
      }
    ]);
  };

  const handleToggleBatchStatus = async (batchId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING') => {
    await logService.toggleBatchStatus(batchId, newStatus);
    await loadAllData();
    setToasts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'success',
        title: 'Cập nhật trạng thái Lô',
        message: `${batchId} → ${newStatus}`
      }
    ]);
  };

  const handleInspectStages = (batchId: string) => {
    setSelectedBatch(batchId);
    setIsManagementDrawerOpen(true);
    setIsPipelineExpanded(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Header điều hướng chính */}
      <Header activeTab="overview" onTabChange={onNavigate} />

      {/* 2. Không gian làm việc - Trọng tâm là Biểu đồ */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-3">

        {/* THANH ĐIỀU HƯỚNG TỐI GIẢN (CHỮ SIÊU NHỎ, TẬP TRUNG CHỌN LÔ & TRẠNG THÁI) */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-tight text-slate-800">
              Tổng quan biểu đồ
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">
              Live
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Bộ chọn Lô nhỏ gọn */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedBatch('ALL')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  selectedBatch === 'ALL'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn xưởng
              </button>
              {batchSummaries.slice(0, 5).map(b => (
                <button
                  key={b.batchId}
                  type="button"
                  onClick={() => setSelectedBatch(b.batchId)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-mono font-medium ${
                    selectedBatch === b.batchId
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b.batchId}
                </button>
              ))}
            </div>

            {/* Nút mở rộng bảng quản trị lô khi cần */}
            <button
              type="button"
              onClick={() => setIsManagementDrawerOpen(prev => !prev)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                isManagementDrawerOpen
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
              title="Mở bảng số liệu quản trị lô và nhật ký"
            >
              <span>Quản trị lô</span>
              <span className="text-[9px]">{isManagementDrawerOpen ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* 3. THẺ SỐ LIỆU TỐI GIẢN (CHỮ NHỎ, KHÔNG CHIẾM DIỆN TÍCH) */}
        <ProductionKPICards
          metrics={metrics}
          selectedBatch={selectedBatch}
        />

        {/* 4. TRUNG TÂM BIỂU ĐỒ - VẼ ĐA DẠNG 8 BIỂU ĐỒ VỚI CHÚ THÍCH SẮC NÉT */}
        <ProductionVisualCharts
          stageWiPList={stageWiPList}
          metrics={metrics}
          logs={logs}
          selectedBatch={selectedBatch}
          batchSummaries={batchSummaries}
          stations={stations}
          products={products}
          stages={stages}
        />

        {/* 5. KHỐI QUẢN TRỊ DẠNG BẢNG (MẶC ĐỊNH THU GỌN Ở DƯỚI CÙNG) */}
        {isManagementDrawerOpen && (
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bảng quản lý lô & Chi tiết công đoạn
              </span>
              <button
                type="button"
                onClick={() => setIsManagementDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Thu gọn ▲
              </button>
            </div>

            {/* Quản lý các lô */}
            <BatchProductionHub
              batchSummaries={batchSummaries}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
              onOpenAddBatch={handleOpenAddBatch}
              onOpenEditBatch={handleOpenEditBatchSpecific}
              onToggleStatus={handleToggleBatchStatus}
              onInspectStages={handleInspectStages}
            />

            {/* Chi tiết 15 công đoạn */}
            <VisualPipelineFlow
              stageWiPList={stageWiPList}
              selectedBatch={selectedBatch}
              isExpanded={isPipelineExpanded}
              onToggleExpand={() => setIsPipelineExpanded(prev => !prev)}
            />

            {/* Nhật ký cân chi tiết */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsLogTableVisible(prev => !prev)}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
              >
                <span>Nhật ký từng mẻ cân ({logs.length.toLocaleString('vi-VN')} mẻ)</span>
                <span className="text-slate-400 text-xs">
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
          </div>
        )}

      </main>

      {/* Modal Quản Lý Lô */}
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
