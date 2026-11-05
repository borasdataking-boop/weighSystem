import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { BatchProductionHub } from '../components/overview/BatchProductionHub';
import { ProductionKPICards } from '../components/overview/ProductionKPICards';
import { ProductionVisualCharts } from '../components/overview/ProductionVisualCharts';
import { VisualFactoryPipeline } from '../components/overview/VisualFactoryPipeline';
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

  // Mở rộng chi tiết dòng chảy 15 công đoạn (theo yêu cầu on-demand)
  const [isPipelineExpanded, setIsPipelineExpanded] = useState<boolean>(false);

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

  // --- CÁC HÀM XỬ LÝ QUẢN LÝ LÔ ---
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
        title: batchModalMode === 'add' ? 'Đã tạo Lô sản xuất mới!' : 'Đã cập nhật thông tin Lô!',
        message: `Mã: ${batch.batchId} - ${batch.batchName}`
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
        title: 'Đã xoá / ngừng hoạt động Lô!',
        message: `Đã cập nhật thành công lô ${batchIdToDelete}.`
      }
    ]);
  };

  // Chuyển đổi trạng thái nhanh (1-click: Đang làm <-> Đã xong) từ bảng
  const handleToggleBatchStatus = async (batchId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING') => {
    await logService.toggleBatchStatus(batchId, newStatus);
    await loadAllData();
    setToasts(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'success',
        title: 'Đã cập nhật trạng thái Lô!',
        message: `Lô ${batchId} hiện chuyển sang: ${
          newStatus === 'COMPLETED' ? 'Đã làm xong' : newStatus === 'IN_PROGRESS' ? 'Đang làm' : 'Chờ sản xuất'
        }`
      }
    ]);
  };

  // Xem chi tiết 15 công đoạn của 1 lô cụ thể
  const handleInspectStages = (batchId: string) => {
    setSelectedBatch(batchId);
    setIsPipelineExpanded(true);
    setTimeout(() => {
      const el = document.getElementById('pipeline-stages-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // Thông tin chi tiết của lô đang được chọn
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
          <span className="font-semibold text-slate-700">Tổng quan sản xuất</span>
        </div>

        {/* 3. THANH TIÊU ĐỀ TRUNG TÂM - PHONG CÁCH DOANH NGHIỆP GỌN GÀNG */}
        <div className="bg-white border border-slate-200/90 rounded-lg px-4 py-3 shadow-2xs mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Tổng quan sản xuất
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Hệ thống trực tiếp
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedBatch !== 'ALL' ? (
              <button
                type="button"
                onClick={() => setSelectedBatch('ALL')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Bỏ lọc, xem toàn bộ nhà máy"
              >
                <span>Đang lọc: <strong>Lô {selectedBatch}</strong></span>
                <span className="text-slate-400 font-bold ml-1">✕</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                Dữ liệu toàn nhà máy
              </span>
            )}
          </div>
        </div>

        {/* THẺ THÔNG TIN LÔ ĐANG CHỌN (NỀN TRẮNG, VIỀN XÁM CHUẨN MỰC) */}
        {activeBatchInfo && (
          <div className="bg-white border border-slate-200/90 rounded-lg px-4 py-2.5 shadow-2xs mb-4 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded font-mono text-xs">
                {activeBatchInfo.batchId}
              </span>
              <span className="font-bold text-slate-900">
                {activeBatchInfo.batchName}
              </span>
              {activeBatchInfo.plannedWeight && activeBatchInfo.plannedWeight > 0 ? (
                <span className="text-slate-500">
                  • KH: <strong className="font-mono text-slate-800 font-bold">{activeBatchInfo.plannedWeight.toLocaleString('vi-VN')} kg</strong>
                </span>
              ) : null}
              {activeBatchInfo.origin && (
                <span className="text-slate-500">
                  • Xuất xứ: <span className="text-slate-700 font-medium">{activeBatchInfo.origin}</span>
                </span>
              )}
              {activeBatchInfo.notes && (
                <span className="text-slate-400 italic">
                  ({activeBatchInfo.notes})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                activeBatchInfo.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : activeBatchInfo.status === 'PENDING'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {activeBatchInfo.status === 'COMPLETED' ? 'Đã hoàn thành' : activeBatchInfo.status === 'PENDING' ? 'Chờ sản xuất' : 'Đang sản xuất'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedBatch('ALL')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer ml-2 hover:underline"
              >
                Xem toàn nhà máy
              </button>
            </div>
          </div>
        )}

        {/* 4. TẦNG CHÍNH 1: 4 CHỈ SỐ CỐT LÕI & THANH CÂN ĐỐI NGUYÊN LIỆU TRỰC QUAN */}
        <ProductionKPICards
          metrics={metrics}
          selectedBatch={selectedBatch}
        />

        {/* 4.1. BIỂU ĐỒ TRỰC QUAN HOÁ DỮ LIỆU SẢN XUẤT (CỘT / TRÒN / VÙNG THEO GIỜ) */}
        <ProductionVisualCharts
          stageWiPList={stageWiPList}
          metrics={metrics}
          logs={logs}
          selectedBatch={selectedBatch}
        />

        {/* 5. TẦNG CHÍNH 2: TRUNG TÂM THEO DÕI VÀ ĐIỀU HÀNH CÁC LÔ SẢN XUẤT */}
        <BatchProductionHub
          batchSummaries={batchSummaries}
          selectedBatch={selectedBatch}
          onSelectBatch={setSelectedBatch}
          onOpenAddBatch={handleOpenAddBatch}
          onOpenEditBatch={handleOpenEditBatchSpecific}
          onToggleStatus={handleToggleBatchStatus}
          onInspectStages={handleInspectStages}
        />

        {/* 6. CHI TIẾT 15 CÔNG ĐOẠN (THU GỌN MẶC ĐỊNH) */}
        <VisualPipelineFlow
          stageWiPList={stageWiPList}
          selectedBatch={selectedBatch}
          isExpanded={isPipelineExpanded}
          onToggleExpand={() => setIsPipelineExpanded(prev => !prev)}
        />

        {/* 7. TẦNG PHỤ THEO YÊU CẦU: NHẬT KÝ CÂN (THU GỌN MẶC ĐỊNH) */}
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
              <span>Nhật ký chi tiết từng lần cân ({logs.length.toLocaleString('vi-VN')} mẻ)</span>
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
