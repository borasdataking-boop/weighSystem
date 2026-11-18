import { StationWeigh, StationIOType } from '../types/station.types';
import { ProcessStage, FlowConnection, ProcessMapping } from '../types/process.types';
import { processService } from './processService';

const STORAGE_KEY = 'pb_stations_db_cache_v1';

export const stationService = {
  // ==========================================
  // QUẢN LÝ TRẠM CÂN (BẢNG station_weigh TRONG DB)
  // ==========================================
  /**
   * Tải danh sách trạm cân trực tiếp từ PostgreSQL Database qua Backend API
   */
  async fetchStations(): Promise<StationWeigh[]> {
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        const data: StationWeigh[] = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.warn('[stationService] Không kết nối được API Backend, dùng cache:', err);
    }
    return this.getStations();
  },

  async addStationToDatabase(station: StationWeigh): Promise<StationWeigh[]> {
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station)
      });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi lưu trạm cân vào DB:', err);
    }
    return this.addStation(station);
  },

  async updateStationInDatabase(station: StationWeigh): Promise<StationWeigh[]> {
    try {
      const sId = station.stationId || station.id;
      const res = await fetch(`/api/stations/${sId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station)
      });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi cập nhật trạm cân trong DB:', err);
    }
    return this.updateStation(station);
  },

  async deleteStationFromDatabase(stationId: string): Promise<StationWeigh[]> {
    try {
      const res = await fetch(`/api/stations/${stationId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi xoá trạm cân trong DB:', err);
    }
    return this.deleteStation(stationId);
  },

  getStations(): StationWeigh[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed: StationWeigh[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveStations(stations: StationWeigh[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
    }
  },

  addStation(station: StationWeigh): StationWeigh[] {
    const list = this.getStations();
    const sId = station.stationId || station.id || `ST-${Date.now()}`;
    const sName = station.stationName || station.name || 'Trạm cân mới';
    const newStation: StationWeigh = {
      ...station,
      stationId: sId,
      stationName: sName,
      id: sId,
      name: sName,
      indicatorModel: station.indicatorModel || 'DINI_ARGEO',
      isActive: station.status === 'ONLINE',
      createdAt: new Date().toISOString()
    };
    const updated = [...list, newStation];
    this.saveStations(updated);
    return updated;
  },

  updateStation(updatedStation: StationWeigh): StationWeigh[] {
    const list = this.getStations();
    const targetId = updatedStation.stationId || updatedStation.id || '';
    const updated: StationWeigh[] = list.map(s => {
      const currentId = s.stationId || s.id;
      if (currentId === targetId) {
        return {
          ...s,
          ...updatedStation,
          stationId: targetId,
          stationName: updatedStation.stationName || updatedStation.name || s.stationName,
          id: targetId,
          name: updatedStation.stationName || updatedStation.name || s.name,
          isActive: updatedStation.status === 'ONLINE'
        };
      }
      return s;
    });
    this.saveStations(updated);
    return updated;
  },

  deleteStation(stationId: string): StationWeigh[] {
    const list = this.getStations();
    const updated = list.filter(s => (s.stationId || s.id) !== stationId);
    this.saveStations(updated);
    return updated;
  },

  assignToProcess(stationId: string, processId: string): StationWeigh[] {
    const validation = this.validateStationAssignment(stationId, processId);
    if (!validation.isValid) {
      console.warn(`[StationService] Cảnh báo gán công đoạn: ${validation.error}`);
      return this.getStations();
    }
    const list = this.getStations();
    const updated = list.map(s => {
      if ((s.stationId || s.id) === stationId) {
        return { ...s, processId, stageId: processId };
      }
      return s;
    });
    this.saveStations(updated);
    return updated;
  },

  /**
   * Thu hồi các cân gắn tại một công đoạn về kho UNASSIGNED (Dùng khi xoá hoặc tạm ngưng khâu)
   */
  unassignFromProcess(stageId: string): StationWeigh[] {
    const list = this.getStations();
    const updated = list.map(s => (s.processId === stageId || s.stageId === stageId ? { ...s, processId: 'UNASSIGNED', stageId: 'UNASSIGNED' } : s));
    this.saveStations(updated);
    return updated;
  },

  validateStationAssignment(stationId: string, processId: string): { isValid: boolean; error?: string } {
    if (!stationId) {
      return { isValid: false, error: 'Mã trạm cân không được để trống.' };
    }
    if (processId && processId !== 'UNASSIGNED') {
      const stages = processService.getProcesses();
      const stageExists = stages.some(s => (s.processId || s.id) === processId);
      if (!stageExists) {
        return { isValid: false, error: `Công đoạn [${processId}] không tồn tại trong hệ thống quy trình.` };
      }
    }
    return { isValid: true };
  },

  // ==========================================
  // HÀM HỖ TRỢ TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY)
  // Các cuộc gọi liên quan đến process/mapping sẽ ủy thác sang processService
  // ==========================================
  getProcesses(): ProcessStage[] {
    return processService.getProcesses();
  },

  saveProcesses(stages: ProcessStage[]): void {
    processService.saveProcesses(stages);
  },

  addProcess(stage: ProcessStage): ProcessStage[] {
    return processService.addProcess(stage);
  },

  updateProcess(stage: ProcessStage, oldStageId?: string): ProcessStage[] {
    return processService.updateProcess(stage, oldStageId);
  },

  deleteProcess(stageId: string): ProcessStage[] {
    return processService.deleteProcess(stageId, (sId) => {
      this.unassignFromProcess(sId);
    });
  },

  getConnections(): FlowConnection[] {
    return processService.getConnections();
  },

  getProcessMappings(): ProcessMapping[] {
    return processService.getProcessMappings();
  },

  saveProcessMappings(mappings: ProcessMapping[]): void {
    processService.saveProcessMappings(mappings);
  },

  getMappingsForStage(processId: string): { outgoing: ProcessMapping[]; incoming: ProcessMapping[] } {
    return processService.getMappingsForStage(processId);
  }
};
