import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { ProductionKPICards } from '../components/overview/ProductionKPICards';
import { VisualPipelineFlow } from '../components/overview/VisualPipelineFlow';
import { ProductionLogTable } from '../components/overview/ProductionLogTable';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

import { logService } from '../services/logService';
import { processService } from '../services/processService';
import { stationService } from '../services/stationService';
import { productService } from '../services/productService';

import { ProductionWeightLog, ProductionMetrics, BatchSummary, StageWiPSummary } from '../types/log.types';
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

  // Tải dữ liệu trực tiếp từ PostgreSQL Database qua Backend API
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

  const handleDeleteLog = async (logId: number) => {
    await logService.deleteLogFromDatabase(logId);
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Header đỏ thương hiệu Phan Bach */}
      <Header activeTab="overview" onTabChange={onNavigate} />

      {/* 2. Main Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Hệ thống</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">Tổng quan</span>
        </div>

        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tổng Quan
          </h1>
        </div>

        {/* 3. Khối 4 Thẻ KPI: IN, WiP, OUT, % YIELD */}
        <ProductionKPICards
          metrics={metrics}
          selectedBatch={selectedBatch}
        />

        {/* 4. Sơ đồ Dòng chảy Chuyền sản xuất & Tỷ lệ Yield theo từng Lô */}
        <VisualPipelineFlow
          metrics={metrics}
          batchSummaries={batchSummaries}
          stageWiPList={stageWiPList}
          selectedBatch={selectedBatch}
          onSelectBatch={setSelectedBatch}
        />

        {/* 5. Bảng Nhật ký Cân Chi Tiết Khớp 100% pgAdmin 4 (production_weight_logs) */}
        <ProductionLogTable
          logs={logs}
          stages={stages}
          stations={stations}
          products={products}
          selectedBatch={selectedBatch}
          onSelectBatch={setSelectedBatch}
          onDeleteLog={handleDeleteLog}
        />
      </main>

      {/* Thông báo Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default OverviewPage;
