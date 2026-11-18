import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { ReportSummaryKPIs } from '../components/reports/ReportSummaryKPIs';
import { OverallBatchReportTable } from '../components/reports/OverallBatchReportTable';
import { BatchStageDetailReportTable } from '../components/reports/BatchStageDetailReportTable';
import { ReportBatchFilter } from '../components/reports/ReportSummaryKPIs';

import { logService } from '../services/logService';
import { processService } from '../services/processService';
import { stationService } from '../services/stationService';
import { productService } from '../services/productService';
import { normService } from '../services/normService';

import { ProductionWeightLog, BatchSummary, StageWiPSummary } from '../types/log.types';
import { ProcessStage, ProcessMapping } from '../types/process.types';

interface ReportsPageProps {
  onNavigate?: (tabKey: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<ProductionWeightLog[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [mappings, setMappings] = useState<ProcessMapping[]>([]);
  const [batchSummaries, setBatchSummaries] = useState<BatchSummary[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('L0001');
  const [activeFilter, setActiveFilter] = useState<ReportBatchFilter>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tải dữ liệu toàn diện từ hệ thống
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rawLogs, procData] = await Promise.all([
        logService.fetchLogs(),
        processService.fetchProcesses(),
        stationService.fetchStations(),
        productService.fetchProducts(),
        logService.fetchBatchesInfo(),
        normService.fetchNorms()
      ]);

      const stgs = procData.stages || [];
      const mps = procData.mappings || [];
      setLogs(rawLogs);
      setStages(stgs);
      setMappings(mps);

      const summaries = logService.getBatchSummaries(rawLogs, stgs, mps);
      setBatchSummaries(summaries);

      // Nếu batch đang chọn chưa hợp lệ hoặc là ALL, chọn lô đầu tiên đang hoạt động
      if (summaries.length > 0) {
        setSelectedBatchId(prev => {
          const exists = summaries.some(b => b.batchId === prev);
          if (exists) return prev;
          const todayBatch = summaries.find(b => b.isToday);
          if (todayBatch) return todayBatch.batchId;
          const activeBatch = summaries.find(b => b.status === 'IN_PROGRESS');
          if (activeBatch) return activeBatch.batchId;
          return summaries[0].batchId;
        });
      }

      setLastRefreshed(new Date().toLocaleTimeString('vi-VN'));
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tự động làm mới dữ liệu nền mỗi 15 giây
  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Tính toán dữ liệu các công đoạn cho riêng Lô được chọn ở Bảng 2
  const stageWiPList: StageWiPSummary[] = React.useMemo(() => {
    return logService.getStageWiPSummaries(stages, selectedBatchId, logs, mappings);
  }, [stages, selectedBatchId, logs, mappings]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header activeTab="reports" onTabChange={onNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* THANH ĐIỀU HƯỚNG & TIÊU ĐỀ TRANG BÁO CÁO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200/90 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Hệ thống quản lý cân sản xuất</span>
              <span>/</span>
              <span className="font-semibold text-slate-700">Trung tâm Báo cáo & Thống kê</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>BÁO CÁO VẬN HÀNH SẢN XUẤT & ĐỊNH MỨC CHUYỀN</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-[#DE4444] border border-red-200">
                Live Data
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {lastRefreshed && (
              <span className="text-xs text-slate-500 font-mono hidden md:inline">
                Cập nhật: {lastRefreshed}
              </span>
            )}

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>In báo cáo</span>
            </button>
          </div>
        </div>

        {/* THẺ TỔNG HỢP KPI TRẢ LỜI CÂU HỎI SỐ LƯỢNG LÔ (Tổng, Đang làm, Đã xong, Chưa làm, Hôm nay) */}
        <ReportSummaryKPIs
          batches={batchSummaries}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* BẢNG 1: BÁO CÁO TỔNG QUÁT LÔ SẢN XUẤT */}
        <OverallBatchReportTable
          batches={batchSummaries}
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* BẢNG 2: BÁO CÁO CHI TIẾT TỪNG LÔ THEO CÔNG ĐOẠN */}
        <BatchStageDetailReportTable
          stages={stageWiPList}
          selectedBatchId={selectedBatchId}
          batches={batchSummaries}
          onSelectBatch={setSelectedBatchId}
        />
      </main>
    </div>
  );
};
