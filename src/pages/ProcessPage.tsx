import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { ProcessTable } from '../components/process/ProcessTable';
import { ProcessGraphView } from '../components/process/ProcessGraphView';
import { AddProcessModal } from '../components/process/AddProcessModal';
import { ProcessDetailModal } from '../components/process/ProcessDetailModal';
import { Toast, ToastMessage } from '../components/common/Toast';
import { stationService } from '../services/stationService';
import { processService } from '../services/processService';
import { ProcessStage } from '../types/process.types';
import { StationWeigh } from '../types/station.types';

interface ProcessPageProps {
  onNavigate?: (tabKey: string) => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({ onNavigate }) => {
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [stations, setStations] = useState<StationWeigh[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'node'>('list');

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [scaleStatusFilter, setScaleStatusFilter] = useState<'ALL' | 'HAS_SCALE' | 'NO_SCALE'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProcessStage | null>(null);
  const [activeDetailStage, setActiveDetailStage] = useState<ProcessStage | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tải dữ liệu ban đầu trực tiếp từ Database
  useEffect(() => {
    const load = async () => {
      try {
        const [procData, stns] = await Promise.all([
          processService.fetchProcesses(),
          stationService.fetchStations()
        ]);
        setStages(procData.stages || []);
        setStations(stns);
      } catch (e) {
        console.error('Lỗi khi tải công đoạn từ DB:', e);
      }
    };
    load();
  }, []);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = { id: Date.now().toString(), type, title, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Lọc
  const filteredStages = stages.filter(st => {
    const stageId = st.processId || st.id || '';
    const name = st.processName || st.name || '';
    const desc = st.desc || '';

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        name.toLowerCase().includes(term) ||
        desc.toLowerCase().includes(term) ||
        stageId.toLowerCase().includes(term);
      if (!match) return false;
    }

    return true;
  });

  const handleSaveStage = async (stageData: ProcessStage) => {
    const targetId = stageData.processId || stageData.id;
    const exists = stages.some(s => (s.processId || s.id) === targetId);

    if (exists && editingStage) {
      await processService.addProcessToDatabase(stageData);
      const procData = await processService.fetchProcesses();
      setStages(procData.stages || []);
      addToast('success', 'Đã cập nhật', `Công đoạn ${stageData.processName || stageData.name} đã được lưu.`);
    } else {
      const updated = await processService.addProcessToDatabase(stageData);
      setStages(updated);
      addToast('success', 'Thêm thành công', `Công đoạn ${targetId} đã được đăng ký vào quy trình.`);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const stage = stages.find(s => (s.processId || s.id) === stageId);
    const stageName = stage ? (stage.processName || stage.name) : stageId;
    if (window.confirm(`Bạn có chắc muốn xoá công đoạn "${stageName}" (${stageId})? Các máy cân đang phục vụ sẽ được chuyển về Kho dự phòng.`)) {
      const updated = await processService.deleteProcessFromDatabase(stageId);
      setStages(updated);
      const stns = await stationService.fetchStations();
      setStations(stns);
      addToast('success', 'Đã xoá công đoạn', `Công đoạn ${stageName} đã được xoá thành công.`);
    }
  };

  const handleSelectStage = (stageId: string) => {
    const stage = stages.find(s => (s.processId || s.id) === stageId);
    if (stage) {
      setActiveDetailStage(stage);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditStage = (stageId: string) => {
    const stage = stages.find(s => (s.processId || s.id) === stageId);
    if (stage) {
      setEditingStage(stage);
      setIsAddModalOpen(true);
    }
  };

  const handleAssignScale = (stationId: string, processId: string) => {
    const updated = stationService.assignToProcess(stationId, processId);
    setStations(updated);
    addToast('success', 'Điều chuyển thành công', `Đã phân bổ trạm cân ${stationId} vào công đoạn ${processId}.`);
  };

  const handleUnassignScale = (stationId: string) => {
    const updated = stationService.assignToProcess(stationId, 'UNASSIGNED');
    setStations(updated);
    addToast('info', 'Đã thu hồi', `Đã chuyển trạm cân ${stationId} về kho dự phòng.`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setScaleStatusFilter('ALL');
    addToast('info', 'Đã đặt lại', 'Hiển thị đầy đủ tất cả công đoạn chế biến.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* 1. Header đỏ chuẩn Design System, Tab 'process' Active */}
      <Header
        activeTab="process"
        onTabChange={(tabKey) => {
          if (onNavigate) {
            onNavigate(tabKey);
          } else if (tabKey === 'weighStation') {
            window.location.href = 'weighStation.html';
          }
        }}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>Hệ thống</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700">Quy trình</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Quy trình chế biến
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setEditingStage(null);
                setIsAddModalOpen(true);
              }}
              className="h-10 px-4.5 bg-[#DE4444] hover:bg-[#C93333] text-white text-xs font-semibold rounded-lg shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Thêm công đoạn
            </button>
          </div>
        </div>

        {/* Thanh chuyển đổi chế độ xem: List View vs Node View */}
        <div className="flex items-center justify-end gap-4 mb-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#DE4444] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Danh sách</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('node')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'node'
                  ? 'bg-white text-[#DE4444] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Sơ đồ</span>
            </button>
          </div>
        </div>

        {/* Nội dung theo chế độ xem */}
        {viewMode === 'list' ? (
          <>
            {/* Filter Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="relative min-w-[280px] max-w-md flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo mã công đoạn, tên công đoạn..."
                  className="w-full h-9.5 pl-9 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#DE4444]"
                />
              </div>

              <div className="flex items-center gap-3">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-9.5 px-3 text-xs font-medium text-slate-500 hover:text-[#DE4444] border border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Đặt lại bộ lọc"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Đặt lại
                  </button>
                )}

                <div className="text-xs font-semibold text-slate-500">
                  Tổng cộng: <strong className="text-slate-900 font-mono text-sm">{filteredStages.length}</strong> công đoạn
                </div>
              </div>
            </div>

            {/* Table View */}
            <ProcessTable
              stages={filteredStages}
              onSelectStage={handleSelectStage}
              onEditStage={handleEditStage}
              onDeleteStage={handleDeleteStage}
            />
          </>
        ) : (
          /* Node View: Đồ thị có hướng chuẩn processflow.jpg */
          <ProcessGraphView
            stages={stages}
            onSelectStage={(stageId) => {
              handleEditStage(stageId);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AddProcessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveStage}
        editingStage={editingStage}
        existingStagesCount={stages.length}
      />

      <ProcessDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        stage={activeDetailStage}
        allStations={stations}
        onAssignScale={handleAssignScale}
        onUnassignScale={handleUnassignScale}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
};
