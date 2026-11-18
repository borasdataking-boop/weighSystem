import { ProductionWeightLog, ProductionMetrics, BatchSummary, StageWiPSummary, WeightIOType, BatchInfo } from '../types/log.types';
import { ProcessStage, ProcessMapping } from '../types/process.types';
import { stationService } from './stationService';
import { productService } from './productService';

const STORAGE_KEY = 'pb_logs_db_cache_v1';

export const logService = {
  /**
   * Tải nhật ký mẻ cân trực tiếp từ PostgreSQL Database qua Backend API
   */
  async fetchLogs(batchId?: string): Promise<ProductionWeightLog[]> {
    try {
      const url = batchId && batchId !== 'ALL' ? `/api/logs?batch_id=${encodeURIComponent(batchId)}` : '/api/logs';
      const res = await fetch(url);
      if (res.ok) {
        const data: ProductionWeightLog[] = await res.json();
        this.saveLogs(data);
        return data;
      }
    } catch (err) {
      console.warn('[logService] Lỗi kết nối API Backend /api/logs, dùng dữ liệu cache:', err);
    }
    return this.getLogs(batchId);
  },

  /**
   * Gửi mẻ cân mới lưu trực tiếp vào PostgreSQL / SQLite Database
   */
  async createLogInDatabase(input: {
    station_id: string;
    value_weight: number;
    tare_weight: number;
    batch_id?: string;
    product_id?: string;
    employee_id?: string | null;
    process_id?: string;
    type_weight?: WeightIOType;
    source_method?: string;
  }): Promise<ProductionWeightLog> {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (res.ok) {
        const created: ProductionWeightLog = await res.json();
        const list = this.getLogs();
        this.saveLogs([created, ...list]);
        return created;
      }
    } catch (err) {
      console.warn('[logService] Lỗi khi gọi API /api/logs, tự động lưu vào storage cục bộ:', err);
    }
    const createdList = this.addLog(input);
    return createdList[0];
  },

  /**
   * Lưu hàng loạt mẻ cân cùng lúc (Batch Ingestion giải quyết 200 - 300 requests/lần)
   */
  async createLogsBatchInDatabase(inputs: Array<{
    station_id: string;
    value_weight: number;
    tare_weight: number;
    batch_id?: string;
    product_id?: string;
    employee_id?: string | null;
  }>): Promise<ProductionWeightLog[]> {
    try {
      const res = await fetch('/api/logs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (res.ok) {
        const json = await res.json();
        const createdList: ProductionWeightLog[] = json.items || [];
        const current = this.getLogs();
        const updated = [...createdList, ...current];
        this.saveLogs(updated);
        return createdList;
      }
    } catch (err) {
      console.warn('[logService] Lỗi gọi API /api/logs/batch, chuyển sang lưu bộ đệm:', err);
    }
    return this.addLogsBatch(inputs);
  },

  /**
   * Xoá mẻ cân trực tiếp trong PostgreSQL
   */
  async deleteLogFromDatabase(logId: number): Promise<void> {
    try {
      await fetch(`/api/logs/${logId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[logService] Lỗi khi xoá mẻ cân trong DB:', err);
    }
    this.deleteLog(logId);
  },

  getLogs(batchId?: string): ProductionWeightLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed: ProductionWeightLog[] = JSON.parse(data);
      const filtered = batchId && batchId !== 'ALL'
        ? parsed.filter(l => l.batch_id === batchId)
        : parsed;

      return filtered.map(log => ({
        ...log,
        net_weight: Number((log.value_weight - log.tare_weight).toFixed(3))
      }));
    } catch {
      return [];
    }
  },

  saveLogs(logs: ProductionWeightLog[]): void {
    if (typeof window !== 'undefined') {
      try {
        // Chỉ lưu tối đa 500 bản ghi gần nhất vào localStorage để tránh QuotaExceededError khi dữ liệu lên tới hàng triệu dòng
        const toCache = logs.length > 500 ? logs.slice(0, 500) : logs;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toCache));
      } catch (e) {
        console.warn('[logService] Không thể lưu vào LocalStorage (vượt quá dung lượng cho phép):', e);
      }
    }
  },

  /**
   * Ghi nhận mẻ cân mới từ đầu cân
   * Nguyên tắc thiết kế (Core Architecture Rule):
   * - Bảng log BẮT BUỘC lấy dữ liệu metadata từ các bảng khác:
   *   + station_weigh: suy luận ra process_id, type_weight (IN/OUT), source_method
   *   + product: suy luận/validate product_id thuộc đúng công đoạn
   *   + batch: lấy lô hàng active
   * - Thứ DUY NHẤT thiết bị tự sinh ra là: tare_weight và value_weight (gross weight từ loadcell).
   * - net_weight được tính toán tức thời: value_weight - tare_weight.
   */
  addLog(newLog: Partial<ProductionWeightLog> & { station_id: string; value_weight: number; tare_weight: number }): ProductionWeightLog[] {
    const list = this.getLogs();
    const nextId = list.length > 0 ? Math.max(...list.map(l => l.log_id)) + 1 : 1;
    
    // 1. Dữ liệu thuần túy từ phần cứng cân
    const val = Number(newLog.value_weight) || 0;
    const tare = Number(newLog.tare_weight) || 0;
    const net = Number((val - tare).toFixed(3));

    // 2. Tra cứu suy luận từ bảng station_weigh
    const stations = stationService.getStations();
    const station = stations.find(s => (s.stationId || s.id) === newLog.station_id);
    const assignedProcessId = station?.processId || station?.stageId || newLog.process_id || 'CD001';
    const assignedIOType = station?.ioType || station?.typeWeight || newLog.type_weight || 'IN';
    const sourceMethod = newLog.source_method || station?.protocol || 'TCP/IP';

    // 3. Tra cứu suy luận từ bảng product (ưu tiên khớp cả công đoạn và chiều IN/OUT)
    const products = productService.getProducts();
    let assignedProductId = newLog.product_id;
    if (!assignedProductId || !products.some(p => p.id === assignedProductId)) {
      const exactStageProd = products.find(p =>
        productService.isProductAssignedTo(p, assignedProcessId, assignedIOType)
      );
      const anyStageProd = products.find(p =>
        productService.isProductAssignedTo(p, assignedProcessId)
      );
      assignedProductId = exactStageProd?.id || anyStageProd?.id || 'TOM001';
    }

    // 4. Lấy mã lô hàng
    const assignedBatchId = newLog.batch_id || this.getBatches()[0] || 'L0001';

    const item: ProductionWeightLog = {
      log_id: nextId,
      batch_id: assignedBatchId,
      station_id: newLog.station_id,
      process_id: assignedProcessId,
      product_id: assignedProductId,
      type_weight: assignedIOType,
      value_weight: val,
      tare_weight: tare,
      net_weight: net,
      time_action: newLog.time_action || new Date().toISOString(),
      employee_id: newLog.employee_id || 'NV001',
      source_method: sourceMethod
    };

    const updated = [item, ...list];
    this.saveLogs(updated);
    return updated;
  },

  /**
   * Thêm hàng loạt mẻ cân cùng lúc qua bộ đệm micro-batch (chống giật lag khi 200 - 300 requests tới cùng lúc)
   */
  addLogsBatch(inputs: Array<Partial<ProductionWeightLog> & { station_id: string; value_weight: number; tare_weight: number }>): ProductionWeightLog[] {
    const list = this.getLogs();
    let nextId = list.length > 0 ? Math.max(...list.map(l => l.log_id)) + 1 : 1;
    const stations = stationService.getStations();
    const products = productService.getProducts();
    const defaultBatch = this.getBatches()[0] || 'L0001';

    const newItems: ProductionWeightLog[] = inputs.map(input => {
      const val = Number(input.value_weight) || 0;
      const tare = Number(input.tare_weight) || 0;
      const net = Number((val - tare).toFixed(3));
      const station = stations.find(s => (s.stationId || s.id) === input.station_id);
      const assignedProcessId = station?.processId || station?.stageId || input.process_id || 'CD001';
      const assignedIOType = station?.ioType || station?.typeWeight || input.type_weight || 'IN';
      const sourceMethod = input.source_method || station?.protocol || 'TCP/IP';

      let assignedProductId = input.product_id;
      if (!assignedProductId || !products.some(p => p.id === assignedProductId)) {
        const exactStageProd = products.find(p =>
          productService.isProductAssignedTo(p, assignedProcessId, assignedIOType)
        );
        const anyStageProd = products.find(p =>
          productService.isProductAssignedTo(p, assignedProcessId)
        );
        assignedProductId = exactStageProd?.id || anyStageProd?.id || 'TOM001';
      }

      return {
        log_id: nextId++,
        batch_id: input.batch_id || defaultBatch,
        station_id: input.station_id,
        process_id: assignedProcessId,
        product_id: assignedProductId,
        type_weight: assignedIOType,
        value_weight: val,
        tare_weight: tare,
        net_weight: net,
        time_action: input.time_action || new Date().toISOString(),
        employee_id: input.employee_id || 'NV001',
        source_method: sourceMethod
      };
    });

    const updated = [...newItems, ...list];
    this.saveLogs(updated);
    return updated;
  },

  /**
   * API chuyên dụng nhận dữ liệu IoT từ STM32 / Dini Argeo
   */
  createLogFromHardwareScale(input: {
    station_id: string;
    value_weight: number;
    tare_weight: number;
    batch_id?: string;
    product_id?: string;
    employee_id?: string | null;
  }): ProductionWeightLog[] {
    return this.addLog(input);
  },

  deleteLog(logId: number): ProductionWeightLog[] {
    const list = this.getLogs();
    const updated = list.filter(l => l.log_id !== logId);
    this.saveLogs(updated);
    return updated;
  },

  /**
   * Phân tích đồ thị quy trình động (Dynamic Process Flow Topology)
   * Tự động xác định công đoạn đầu vào (Start Stages) và công đoạn thành phẩm đầu ra (End Stages)
   * Dựa trên danh sách công đoạn và quan hệ chuyển tiếp (mappings), HOÀN TOÀN KHÔNG CỐ ĐỊNH mã CDxxx.
   * Khi người dùng thêm, bớt, sửa công đoạn, hệ thống tự động nhận diện và tính toán chuẩn xác.
   */
  resolveProcessTopology(
    stages?: ProcessStage[],
    mappings?: ProcessMapping[]
  ): {
    startStageIds: Set<string>;
    endStageIds: Set<string>;
    orderedStages: ProcessStage[];
  } {
    let list = stages && stages.length > 0 ? [...stages] : [];

    // Nếu chưa truyền stages, lấy từ cache đã đồng bộ DB
    if (list.length === 0 && typeof window !== 'undefined') {
      try {
        list = JSON.parse(localStorage.getItem('pb_process_stages_db_cache_v1') || '[]');
      } catch (e) {
        list = [];
      }
    }

    // Sắp xếp thứ tự công đoạn theo tiến trình luồng: row trước, col sau (hoặc theo thứ tự khai báo)
    list.sort((a, b) => {
      const rowA = a.row ?? 1;
      const rowB = b.row ?? 1;
      if (rowA !== rowB) return rowA - rowB;
      const colA = a.col ?? 1;
      const colB = b.col ?? 1;
      return colA - colB;
    });

    const startStageIds = new Set<string>();
    const endStageIds = new Set<string>();

    let activeMappings = (mappings || []).filter(m => m.isActive !== false);
    if (activeMappings.length === 0 && typeof window !== 'undefined') {
      try {
        const cached = JSON.parse(localStorage.getItem('pb_process_mappings_db_cache_v1') || '[]');
        activeMappings = (cached || []).filter((m: any) => m.isActive !== false);
      } catch (e) {
        activeMappings = [];
      }
    }

    if (activeMappings.length > 0 && list.length > 0) {
      // Dùng đồ thị có hướng (Directed Graph):
      // - Công đoạn không có luồng nào trỏ tới (in-degree == 0): Là công đoạn bắt đầu tiếp nhận nguyên liệu
      // - Công đoạn không trỏ tới công đoạn nào khác (out-degree == 0): Là công đoạn thành phẩm hoàn tất
      const inDegree = new Map<string, number>();
      const outDegree = new Map<string, number>();

      list.forEach(s => {
        const id = s.processId || s.id || '';
        inDegree.set(id, 0);
        outDegree.set(id, 0);
      });

      activeMappings.forEach(m => {
        if (m.fromProcessId) {
          outDegree.set(m.fromProcessId, (outDegree.get(m.fromProcessId) || 0) + 1);
        }
        if (m.toProcessId) {
          inDegree.set(m.toProcessId, (inDegree.get(m.toProcessId) || 0) + 1);
        }
      });

      list.forEach(s => {
        const id = s.processId || s.id || '';
        if ((inDegree.get(id) || 0) === 0) {
          startStageIds.add(id);
        }
        if ((outDegree.get(id) || 0) === 0) {
          endStageIds.add(id);
        }
      });
    }

    // Nếu không có mappings hoặc không tìm ra công đoạn đầu/cuối từ đồ thị:
    // Dựa vào hàng (row) hoặc vị trí đầu/cuối của quy trình
    if (startStageIds.size === 0 && list.length > 0) {
      const minRow = Math.min(...list.map(s => s.row ?? 1));
      list.filter(s => (s.row ?? 1) === minRow).forEach(s => startStageIds.add(s.processId || s.id || ''));
    }

    if (endStageIds.size === 0 && list.length > 0) {
      const maxRow = Math.max(...list.map(s => s.row ?? 1));
      list.filter(s => (s.row ?? 1) === maxRow).forEach(s => endStageIds.add(s.processId || s.id || ''));
    }

    // Fallback an toàn nếu vẫn rỗng
    if (startStageIds.size === 0 && list.length > 0) {
      startStageIds.add(list[0].processId || list[0].id || '');
    }
    if (endStageIds.size === 0 && list.length > 0) {
      endStageIds.add(list[list.length - 1].processId || list[list.length - 1].id || '');
    }

    return { startStageIds, endStageIds, orderedStages: list };
  },

  /**
   * Tính toán toàn diện các chỉ số IN, OUT, WiP, % Yield HOÀN TOÀN ĐỘNG
   * - Tự động nhận diện công đoạn đầu vào và các công đoạn thành phẩm đầu ra
   * - Xử lý bóc tách từng công đoạn, không tính gộp mù quáng
   * - Tự động phân tách công đoạn Tăng trọng vs Hao hụt
   * - Trả về danh sách bottleneckStages để quản lý nắm rõ quy trình
   */
  getMetrics(
    batchId?: string,
    customLogs?: ProductionWeightLog[],
    stages?: ProcessStage[],
    mappings?: ProcessMapping[]
  ): ProductionMetrics {
    const allLogs = customLogs || this.getLogs();
    const filtered = batchId && batchId !== 'ALL'
      ? allLogs.filter(l => l.batch_id === batchId)
      : allLogs;

    // Lấy stageWiPList hoàn toàn động theo stages và mappings
    const stageWiPList = this.getStageWiPSummaries(stages, batchId, customLogs, mappings);

    // 1. Đầu vào gốc (Tổng nguyên liệu nạp vào tại các công đoạn bắt đầu)
    const startStages = stageWiPList.filter(s => s.isStartStage);
    let rawInWeight = startStages.reduce((acc, s) => acc + s.inWeight, 0);

    if (rawInWeight === 0) {
      // Nếu các start stages chưa có mẻ cân IN, tìm công đoạn đầu tiên trong luồng có mẻ cân IN
      const firstActive = stageWiPList.find(s => s.inWeight > 0);
      rawInWeight = firstActive ? firstActive.inWeight : 0;
    }

    // 2. Thành phẩm đầu ra hoàn thành xuất xưởng (Tổng OUT tại các công đoạn kết thúc quy trình)
    const endStages = stageWiPList.filter(s => s.isEndStage);
    let finishedOutWeight = endStages.reduce((acc, s) => acc + s.outWeight, 0);

    if (finishedOutWeight === 0) {
      // Nếu chưa có mẻ OUT ở bước cuối (lô đang chạy ở giữa), lấy OUT ở công đoạn xa nhất đã hoàn tất
      const activeOuts = stageWiPList.filter(s => s.outWeight > 0);
      if (activeOuts.length > 0) {
        finishedOutWeight = activeOuts[activeOuts.length - 1].outWeight;
      }
    }

    // 3. Tổng WIP thực tế trên toàn chuyền = Tổng WIP từng công đoạn (KHÔNG bao giờ bị âm do tăng trọng)
    const totalWip = stageWiPList.reduce((acc, s) => acc + s.wipWeight, 0);

    // 4. Danh sách các công đoạn đang bị đọng hàng (WIP > 0) để người quản lý nắm bắt toàn diện
    const bottleneckStages = stageWiPList
      .filter(s => s.wipWeight > 0)
      .map(s => `${s.processName} (${s.wipWeight.toFixed(1)} kg)`);
    const bottleneckCount = bottleneckStages.length;

    // 5. Tổng khối lượng tăng trọng & hao hụt
    const totalGain = stageWiPList.filter(s => s.isGain).reduce((acc, s) => acc + (s.outWeight - s.inWeight), 0);
    const totalLoss = stageWiPList.filter(s => s.isLoss).reduce((acc, s) => acc + (s.inWeight - s.outWeight), 0);

    // Số lần cân
    let inCount = 0;
    let outCount = 0;
    filtered.forEach(log => {
      if (log.type_weight === 'IN') inCount++;
      else if (log.type_weight === 'OUT') outCount++;
    });

    const uniqueBatches = new Set(filtered.map(l => l.batch_id));

    // Kế hoạch & Còn chưa làm
    let plannedWeight = 0;
    let remainingWeight = 0;
    const batchesInfo = this.getBatchesInfo();
    if (batchId && batchId !== 'ALL') {
      const info = batchesInfo.find(b => b.batchId === batchId);
      plannedWeight = info?.plannedWeight || 0;
      remainingWeight = plannedWeight > 0 ? Math.max(0, plannedWeight - rawInWeight) : 0;
    } else {
      const activeBatches = batchesInfo.filter(b => !b.isDeleted && b.status !== 'CANCELLED');
      plannedWeight = activeBatches.reduce((acc, b) => acc + (b.plannedWeight || 0), 0);
      remainingWeight = plannedWeight > 0 ? Math.max(0, plannedWeight - rawInWeight) : 0;
    }

    const yieldRate = rawInWeight > 0 ? (finishedOutWeight / rawInWeight) * 100 : 0;

    return {
      totalInWeight: Number(rawInWeight.toFixed(3)),
      totalOutWeight: Number(finishedOutWeight.toFixed(3)),
      wipWeight: Number(totalWip.toFixed(3)),
      yieldRate: Number(yieldRate.toFixed(1)),
      inCount,
      outCount,
      activeBatchesCount: uniqueBatches.size,
      plannedWeight: Number(plannedWeight.toFixed(3)),
      remainingWeight: Number(remainingWeight.toFixed(3)),
      totalGainWeight: Number(totalGain.toFixed(3)),
      totalLossWeight: Number(totalLoss.toFixed(3)),
      bottleneckCount,
      bottleneckStages
    };
  },

  /**
   * Danh sách tóm tắt toàn diện theo từng Lô hàng (Batch) HOÀN TOÀN ĐỘNG
   * - Hoạt động độc lập với số lượng và mã công đoạn (thêm/bớt thoải mái)
   * - Tính toán chính xác: Chưa làm (kg), WIP (kg), IN (kg), OUT (kg)
   * - Tính toán tỷ lệ % tiến độ hoàn thành cho thanh tiến độ
   */
  getBatchSummaries(
    customLogs?: ProductionWeightLog[],
    stages?: ProcessStage[],
    mappings?: ProcessMapping[]
  ): BatchSummary[] {
    const logs = customLogs || this.getLogs();
    const batchesInfo = this.getBatchesInfo();
    const infoMap = new Map<string, BatchInfo>();
    batchesInfo.forEach(b => infoMap.set(b.batchId, b));

    // Tập hợp tất cả batchId (loại trừ các lô đã bị xoá mềm)
    const deletedBatchIds = new Set(
      batchesInfo.filter(b => b.isDeleted || b.status === 'CANCELLED').map(b => b.batchId)
    );

    const allBatchIds = new Set<string>();
    batchesInfo.forEach(b => {
      if (!b.isDeleted && b.status !== 'CANCELLED') {
        allBatchIds.add(b.batchId);
      }
    });
    logs.forEach(l => {
      if (l.batch_id && !deletedBatchIds.has(l.batch_id)) {
        allBatchIds.add(l.batch_id);
      }
    });

    const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
    const summaries: BatchSummary[] = [];

    allBatchIds.forEach(batchId => {
      const info = infoMap.get(batchId);
      const batchLogs = logs.filter(l => l.batch_id === batchId);

      // Phân tích chi tiết theo từng bước công đoạn động của riêng lô này
      const stageList = this.getStageWiPSummaries(stages, batchId, logs, mappings);

      // 1. Đầu vào gốc (Tổng IN của các công đoạn bắt đầu)
      const startStages = stageList.filter(s => s.isStartStage);
      let rawIn = startStages.reduce((acc, s) => acc + s.inWeight, 0);
      if (rawIn === 0) {
        const firstActive = stageList.find(s => s.inWeight > 0);
        rawIn = firstActive ? firstActive.inWeight : 0;
      }

      // 2. Thành phẩm đầu ra hoàn thành xuất xưởng (Tổng OUT của các công đoạn kết thúc)
      const endStages = stageList.filter(s => s.isEndStage);
      let finishedOut = endStages.reduce((acc, s) => acc + s.outWeight, 0);
      if (finishedOut === 0) {
        const activeOuts = stageList.filter(s => s.outWeight > 0);
        if (activeOuts.length > 0) {
          finishedOut = activeOuts[activeOuts.length - 1].outWeight;
        }
      }

      // 3. Tổng WIP trên chuyền = Tổng WIP thực tế từng công đoạn
      const batchWip = stageList.reduce((acc, s) => acc + s.wipWeight, 0);

      // 4. Tổng tăng trọng & hao hụt qua các công đoạn
      const totalGain = stageList.filter(s => s.isGain).reduce((acc, s) => acc + (s.outWeight - s.inWeight), 0);
      const totalLoss = stageList.filter(s => s.isLoss).reduce((acc, s) => acc + (s.inWeight - s.outWeight), 0);
      const activeStagesCount = stageList.filter(s => s.inWeight > 0 || s.outWeight > 0).length;

      // 5. Thống kê hôm nay
      let todayInWeight = 0;
      let todayOutWeight = 0;
      let todayLogCount = 0;
      let lastTime = '';
      let hasTodayLogs = false;
      let inCount = 0;
      let outCount = 0;

      batchLogs.forEach(log => {
        const net = log.net_weight ?? (log.value_weight - log.tare_weight);
        const isTodayLog = log.time_action ? log.time_action.slice(0, 10) === todayStr : false;

        if (log.type_weight === 'IN') {
          inCount++;
          if (isTodayLog) {
            todayInWeight += net;
            todayLogCount++;
          }
        } else {
          outCount++;
          if (isTodayLog) {
            todayOutWeight += net;
            todayLogCount++;
          }
        }

        if (isTodayLog) hasTodayLogs = true;
        if (!lastTime || new Date(log.time_action) > new Date(lastTime)) {
          lastTime = log.time_action;
        }
      });

      const plannedW = info?.plannedWeight ? Number(info.plannedWeight) : 0;
      const inW = Number(rawIn.toFixed(3));
      const outW = Number(finishedOut.toFixed(3));
      const wipW = Number(batchWip.toFixed(3));
      const remainingW = plannedW > 0 ? Math.max(0, Number((plannedW - inW).toFixed(3))) : 0;
      const yieldRate = inW > 0 ? Number(((outW / inW) * 100).toFixed(1)) : 0;

      // Trạng thái lô: Ưu tiên BatchInfo do người dùng điều chỉnh
      let status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' = 'IN_PROGRESS';
      if (info?.status === 'COMPLETED') {
        status = 'COMPLETED';
      } else if (info?.status === 'PENDING') {
        status = 'PENDING';
      } else if (info?.status === 'IN_PROGRESS') {
        status = 'IN_PROGRESS';
      } else {
        if (outW > 0 && wipW <= 5) status = 'COMPLETED';
        else if (inW === 0) status = 'PENDING';
        else status = 'IN_PROGRESS';
      }

      // Phần trăm tiến độ hoàn thành (%):
      let progressPercent = 0;
      if (status === 'COMPLETED') {
        progressPercent = 100;
      } else if (plannedW > 0) {
        progressPercent = Math.min(100, Number(((outW / plannedW) * 100).toFixed(1)));
      } else if (inW > 0) {
        progressPercent = Math.min(100, Number(((outW / inW) * 100).toFixed(1)));
      }

      const isToday = hasTodayLogs || (info?.startDate === todayStr) || (status === 'IN_PROGRESS');

      summaries.push({
        batchId,
        batchName: info?.batchName || `Lô ${batchId}`,
        plannedWeight: plannedW,
        inWeight: inW,
        outWeight: outW,
        wipWeight: wipW,
        remainingWeight: remainingW,
        yieldRate,
        progressPercent,
        status,
        origin: info?.origin || '',
        startDate: info?.startDate || '',
        notes: info?.notes || '',
        lastAction: lastTime || info?.startDate || '',
        isToday,
        todayInWeight: Number(todayInWeight.toFixed(3)),
        todayOutWeight: Number(todayOutWeight.toFixed(3)),
        todayLogCount,
        inCount,
        outCount,
        totalGainWeight: Number(totalGain.toFixed(3)),
        totalLossWeight: Number(totalLoss.toFixed(3)),
        activeStagesCount
      });
    });

    // Sắp xếp: Lô hôm nay và Đang làm lên trước
    return summaries.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
      if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
      return a.batchId.localeCompare(b.batchId);
    });
  },

  /**
   * Phân bổ hàng dở dang (WiP), Tăng trọng và Hao hụt theo TỪNG CÔNG ĐOẠN ĐỘNG
   * - Hoàn toàn không cố định mã CDxxx: Thêm, sửa, xoá công đoạn thì thuật toán vẫn tự thích ứng
   * - Tự động phát hiện công đoạn Tăng trọng (khi OUT > IN) và Hao hụt (khi OUT < IN)
   */
  getStageWiPSummaries(
    stages?: ProcessStage[],
    selectedBatch?: string,
    customLogs?: ProductionWeightLog[],
    mappings?: ProcessMapping[]
  ): StageWiPSummary[] {
    const allLogs = customLogs || this.getLogs();
    const logs = selectedBatch && selectedBatch !== 'ALL'
      ? allLogs.filter(l => l.batch_id === selectedBatch)
      : allLogs;

    // 1. Phân tích đồ thị quy trình động (Topological Resolution)
    const { startStageIds, endStageIds, orderedStages } = this.resolveProcessTopology(stages, mappings);

    // 2. Tính khối lượng nạp vào (IN) và lấy ra (OUT) của từng công đoạn
    const stageMap = new Map<string, { inWeight: number; outWeight: number; inCount: number; outCount: number }>();

    orderedStages.forEach(st => {
      const sId = st.processId || st.id || '';
      stageMap.set(sId, { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 });
    });

    // Bổ sung các processId có trong logs nhưng chưa khai báo trong danh mục
    logs.forEach(log => {
      if (log.process_id && !stageMap.has(log.process_id)) {
        stageMap.set(log.process_id, { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 });
      }
    });

    logs.forEach(log => {
      const net = log.net_weight ?? (log.value_weight - log.tare_weight);
      const cur = stageMap.get(log.process_id) || { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 };
      if (log.type_weight === 'IN') {
        cur.inWeight += net;
        cur.inCount += 1;
      } else {
        cur.outWeight += net;
        cur.outCount += 1;
      }
      stageMap.set(log.process_id, cur);
    });

    const results: StageWiPSummary[] = [];

    // Duyệt qua tất cả công đoạn đã sắp xếp theo thứ tự luồng
    const allStageIds = Array.from(stageMap.keys());
    allStageIds.forEach(sId => {
      const st = orderedStages.find(s => (s.processId || s.id) === sId);
      const data = stageMap.get(sId) || { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 };
      const inW = Number(data.inWeight.toFixed(3));
      const outW = Number(data.outWeight.toFixed(3));
      const weightDiff = Number((outW - inW).toFixed(3));

      const isStart = startStageIds.has(sId);
      const isEnd = endStageIds.has(sId);

      let yieldRate = 0;
      let gainRate = 0;
      let lossRate = 0;
      let isGain = false;
      let isLoss = false;
      let wip = 0;
      let stageType: StageWiPSummary['stageType'] = 'GENERAL';
      let statusText = 'Chưa hoạt động';

      if (isStart) {
        // CÔNG ĐOẠN ĐẦU VÀO TIẾP NHẬN NGUYÊN LIỆU GỐC
        stageType = 'RECEIVING';
        yieldRate = 100;
        wip = 0;
        statusText = inW > 0 ? `Tiếp nhận nguyên liệu (${inW.toFixed(1)} kg)` : 'Chưa nhận nguyên liệu';
      } else if (isEnd && inW === 0 && outW > 0) {
        // CÔNG ĐOẠN THÀNH PHẨM XUẤT XƯỞNG
        stageType = 'END_PRODUCT';
        yieldRate = 100;
        wip = 0;
        statusText = `Xuất thành phẩm (${outW.toFixed(1)} kg)`;
      } else if (inW > 0) {
        yieldRate = Number(((outW / inW) * 100).toFixed(1));

        if (outW > inW) {
          // HIỆN TƯỢNG TĂNG TRỌNG (Ngâm quay tôm, tẩm bột, bổ sung phụ gia)
          isGain = true;
          gainRate = Number((((outW - inW) / inW) * 100).toFixed(1));
          stageType = 'SOAKING_GAIN';
          wip = 0; // Mẻ đã lấy ra khỏi máy và tăng thêm trọng lượng -> Không còn hàng đọng
          statusText = `Tăng trọng (+${(outW - inW).toFixed(1)} kg • +${gainRate}%)`;
        } else if (outW < inW) {
          // HIỆN TƯỢNG HAO HỤT HOẶC CÒN HÀNG ĐỌNG TRÊN CHUYỀN
          isLoss = true;
          lossRate = Number((((inW - outW) / inW) * 100).toFixed(1));
          stageType = 'LOSS_PEEL';

          // Tự động nhận diện công đoạn có tính chất hao hụt phụ phẩm (bóc vỏ, tách vỏ, làm sạch, sơ chế)
          const nameLower = (st?.processName || st?.flowTitle || '').toLowerCase();
          const isPeelOrLossStage = nameLower.includes('bóc') ||
            nameLower.includes('tách') ||
            nameLower.includes('peel') ||
            nameLower.includes('sơ chế') ||
            nameLower.includes('rút chỉ');

          // Nếu là bước bóc tách vỏ mà tỷ lệ thu hồi đã đạt định mức (>= 50%): mẻ đã hoàn tất, phần hụt là vỏ thải bỏ
          if (isPeelOrLossStage && yieldRate >= 50) {
            wip = 0;
            statusText = `Hao hụt phụ phẩm (-${(inW - outW).toFixed(1)} kg • -${lossRate}%)`;
          } else {
            wip = Math.max(0, Number((inW - outW).toFixed(3)));
            statusText = wip > 0 ? `Đang xử lý (${wip.toFixed(1)} kg đọng)` : `Hao hụt (-${lossRate}%)`;
          }
        } else {
          // BẢO TOÀN TRỌNG LƯỢNG (IN == OUT)
          yieldRate = 100;
          wip = 0;
          statusText = 'Bảo toàn (100%)';
        }
      } else if (inW === 0 && outW > 0) {
        yieldRate = 100;
        wip = 0;
        statusText = `Xuất mẻ (${outW.toFixed(1)} kg)`;
      } else {
        statusText = 'Chưa hoạt động';
      }

      results.push({
        processId: sId,
        processName: st?.processName || st?.name || `Công đoạn ${sId}`,
        inWeight: inW,
        outWeight: outW,
        wipWeight: wip,
        yieldRate,
        weightDiff,
        gainRate,
        lossRate,
        isGain,
        isLoss,
        inCount: data.inCount,
        outCount: data.outCount,
        stageType,
        statusText,
        isStartStage: isStart,
        isEndStage: isEnd
      });
    });

    return results;
  },

  /**
   * Lấy danh sách các mã lô hàng duy nhất (chỉ trả về các lô chưa bị xoá mềm)
   */
  getBatches(customLogs?: ProductionWeightLog[]): string[] {
    const batchesInfo = this.getBatchesInfo();
    const deletedBatchIds = new Set(
      batchesInfo.filter(b => b.isDeleted || b.status === 'CANCELLED').map(b => b.batchId)
    );

    const logs = customLogs || this.getLogs();
    const fromLogs = Array.from(new Set(logs.map(l => l.batch_id))).filter(Boolean);
    const fromMeta = batchesInfo.filter(b => !b.isDeleted && b.status !== 'CANCELLED').map(b => b.batchId);

    const all = Array.from(new Set([...fromMeta, ...fromLogs]));
    return all.filter(id => !deletedBatchIds.has(id));
  },

  /**
   * Tải danh sách chi tiết các Lô sản xuất trực tiếp từ Database
   */
  async fetchBatchesInfo(): Promise<BatchInfo[]> {
    try {
      const res = await fetch('/api/batches/details');
      if (res.ok) {
        const data: BatchInfo[] = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('pb_batches_info_v1', JSON.stringify(data));
        }
        return data;
      }
    } catch (err) {
      console.warn('[logService] Không kết nối được /api/batches/details, dùng cache:', err);
    }
    return this.getBatchesInfo();
  },

  /**
   * Quản lý thông tin chi tiết các Lô sản xuất (BatchInfo) từ cache đã đồng bộ DB
   */
  getBatchesInfo(): BatchInfo[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('pb_batches_info_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  },

  getBatchInfo(batchId: string): BatchInfo | undefined {
    const list = this.getBatchesInfo();
    return list.find(b => b.batchId === batchId);
  },

  async saveBatch(batch: BatchInfo): Promise<BatchInfo> {
    const list = this.getBatchesInfo();
    const existingIndex = list.findIndex(b => b.batchId === batch.batchId);
    const isEdit = existingIndex >= 0;
    if (isEdit) {
      list[existingIndex] = { ...list[existingIndex], ...batch };
    } else {
      list.push(batch);
    }
    try {
      localStorage.setItem('pb_batches_info_v1', JSON.stringify(list));
    } catch {
      // ignore
    }

    // Gửi lên backend API nếu có kết nối
    try {
      if (isEdit) {
        await fetch(`/api/batches/${encodeURIComponent(batch.batchId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch)
        });
      } else {
        await fetch('/api/batches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch)
        });
      }
    } catch {
      // ignore
    }

    return batch;
  },

  async toggleBatchStatus(batchId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING'): Promise<BatchInfo> {
    return this.updateBatch(batchId, { status: newStatus });
  },

  async updateBatch(batchId: string, updates: Partial<BatchInfo>): Promise<BatchInfo> {
    const list = this.getBatchesInfo();
    const existingIndex = list.findIndex(b => b.batchId === batchId);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...updates };
      try {
        localStorage.setItem('pb_batches_info_v1', JSON.stringify(list));
      } catch {
        // ignore
      }

      try {
        await fetch(`/api/batches/${encodeURIComponent(batchId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch {
        // ignore
      }

      return list[existingIndex];
    }
    const newBatch: BatchInfo = {
      batchId,
      batchName: updates.batchName || `Lô ${batchId}`,
      status: updates.status || 'IN_PROGRESS',
      ...updates
    };
    return this.saveBatch(newBatch);
  },

  /**
   * XOÁ MỀM LÔ SẢN XUẤT (SOFT DELETE):
   * Tuyệt đối KHÔNG xoá cứng (hard delete) dữ liệu để bảo toàn 100% lịch sử cân,
   * ngăn ngừa hiện tượng mồ côi dữ liệu (orphaned logs) trong bảng nhật ký mẻ cân.
   */
  async deleteBatch(batchId: string): Promise<boolean> {
    const list = this.getBatchesInfo();
    const target = list.find(b => b.batchId === batchId);
    if (target) {
      target.isDeleted = true;
      target.deletedAt = new Date().toISOString();
      target.status = 'CANCELLED';
    } else {
      list.push({
        batchId,
        batchName: `Lô ${batchId}`,
        status: 'CANCELLED',
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
    }

    try {
      localStorage.setItem('pb_batches_info_v1', JSON.stringify(list));
    } catch {
      // ignore
    }

    // Bảo toàn toàn bộ dữ liệu nhật ký mẻ cân trong database/storage (không xoá log)

    // Gửi yêu cầu xoá mềm lên backend API
    try {
      await fetch(`/api/batches/${encodeURIComponent(batchId)}`, {
        method: 'DELETE'
      });
    } catch {
      // ignore
    }

    return true;
  }
};
