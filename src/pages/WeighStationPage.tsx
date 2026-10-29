import React, { useState, useEffect } from 'react';
import { StationWeigh, StationIOType, ViewMode } from '../types/station.types';
import { ProcessStage } from '../types/process.types';
import { stationService } from '../services/stationService';
import { processService } from '../services/processService';

import { Header } from '../components/layout/Header';
import { FilterToolbar } from '../components/stations/FilterToolbar';
import { StationTable } from '../components/stations/StationTable';
import { StationPipeline } from '../components/stations/StationPipeline';
import { AddScaleModal } from '../components/stations/AddScaleModal';
import { DeleteScaleModal } from '../components/stations/DeleteScaleModal';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

interface WeighStationPageProps {
  onNavigate?: (tabKey: string) => void;
}

export const WeighStationPage: React.FC<WeighStationPageProps> = ({ onNavigate }) => {
  // State quản lý danh sách cân & công đoạn
  const [stations, setStations] = useState<StationWeigh[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // State bộ lọc & tìm kiếm (Tên cân, Đang ở đâu, IN hay OUT)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedIO, setSelectedIO] = useState('ALL');

  // State modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<StationWeigh | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<StationWeigh | null>(null);

  // State thông báo Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tải dữ liệu ban đầu trực tiếp từ Database
  useEffect(() => {
    const load = async () => {
      try {
        const [stns, procData] = await Promise.all([
          stationService.fetchStations(),
          processService.fetchProcesses()
        ]);
        setStations(stns);
        setStages(procData.stages || []);
      } catch (e) {
        console.error('Lỗi tải trạm cân từ DB:', e);
      }
    };
    load();
  }, []);

  const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      title,
      desc,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3500);
  };

  // Lọc dữ liệu theo Tên cân, Vị trí công đoạn, IN/OUT
  const filteredStations = stations.filter(scale => {
    const scaleCode = scale.id || scale.stationId || '';
    const scaleTitle = scale.name || scale.stationName || '';
    const scaleLoc = scale.location || '';
    const scaleIO = scale.ioType || scale.typeWeight || 'IN';

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const match =
        scaleCode.toLowerCase().includes(kw) ||
        scaleTitle.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Xử lý thêm / sửa cân
  const handleSaveStation = async (station: StationWeigh) => {
    const stationCode = station.id || station.stationId;
    const stationTitle = station.name || station.stationName;

    if (editingStation) {
      const updated = await stationService.updateStationInDatabase(station);
      setStations(updated);
      showToast('Đã lưu thay đổi', `Cân "${stationTitle}" (${stationCode}) đã được cập nhật.`);
    } else {
      const updated = await stationService.addStationToDatabase(station);
      setStations(updated);
      showToast('Thêm cân thành công', `Đã thêm "${stationTitle}" (${stationCode}) vào xưởng.`);
    }
  };

  // Xử lý xoá cân
  const handleConfirmDelete = async () => {
    if (!stationToDelete) return;
    const delCode = stationToDelete.id || stationToDelete.stationId;
    const delTitle = stationToDelete.name || stationToDelete.stationName;
    const updated = await stationService.deleteStationFromDatabase(delCode);
    setStations(updated);
    setIsDeleteModalOpen(false);
    showToast('Đã xoá cân', `Đã xoá "${delTitle}" (${delCode}) khỏi danh sách.`);
    setStationToDelete(null);
  };

  // Đổi vị trí công đoạn của cân
  const handleAssignStage = (stationId: string, stageId: string) => {
    const updated = stationService.assignToProcess(stationId, stageId);
    setStations(updated);
    const stageInfo = stages.find(s => (s.id || s.processId) === stageId);
    showToast(
      'Đã đổi vị trí công đoạn',
      `Cân ${stationId} hiện đặt tại: ${stageInfo ? stageInfo.name : 'Kho dự phòng'}.`
    );
  };

  // Đổi nhanh hướng cân IN / OUT
  const handleQuickChangeIO = (stationId: string, ioType: StationIOType) => {
    const target = stations.find(s => (s.id || s.stationId) === stationId);
    if (!target) return;
    const updated = stationService.updateStation({
      ...target,
      ioType,
      typeWeight: ioType
    });
    setStations(updated);
    showToast(
      'Đã đổi chiều cân',
      `Cân ${target.name || stationId} đã chuyển thành: ${ioType === 'IN' ? 'Cân IN (Đầu vào)' : 'Cân OUT (Đầu ra)'}.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header đỏ chuẩn */}
      <Header activeTab="weighStation" onTabChange={onNavigate} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Hệ thống</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">Quản lý trạm cân</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý trạm cân</h1>
          </div>

          {/* Nút Thêm cân nổi bật duy nhất */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingStation(null);
                setIsAddModalOpen(true);
              }}
              className="h-10 px-5 bg-[#DE4444] hover:bg-[#C93333] text-white text-xs font-semibold rounded-lg shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Thêm cân
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm & Chuyển chế độ xem */}
        <FilterToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onResetFilters={() => setSearchKeyword('')}
          totalCount={filteredStations.length}
        />

        {/* Chế độ xem: Bảng danh sách hoặc Sơ đồ vị trí công đoạn */}
        {viewMode === 'table' ? (
          <StationTable
            stations={filteredStations}
            onEdit={(st) => {
              setEditingStation(st);
              setIsAddModalOpen(true);
            }}
            onDelete={(st) => {
              setStationToDelete(st);
              setIsDeleteModalOpen(true);
            }}
            onQuickChangeIO={handleQuickChangeIO}
          />
        ) : (
          <StationPipeline
            stations={filteredStations}
            stages={stages}
            onAddNewScale={() => {
              setEditingStation(null);
              setIsAddModalOpen(true);
            }}
            onEditScale={(st) => {
              setEditingStation(st);
              setIsAddModalOpen(true);
            }}
            onDeleteScale={(st) => {
              setStationToDelete(st);
              setIsDeleteModalOpen(true);
            }}
            onMoveStageModal={(st) => {
              setEditingStation(st);
              setIsAddModalOpen(true);
            }}
            onDropScaleToStage={handleAssignStage}
          />
        )}
      </main>

      {/* Modals */}
      <AddScaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveStation}
        editingStation={editingStation}
        stages={stages}
        existingStationsCount={stations.length}
      />

      <DeleteScaleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        station={stationToDelete}
      />

      {/* Thông báo Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

