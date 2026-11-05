import { ProductionWeightLog, ProductionMetrics, BatchSummary, StageWiPSummary, WeightIOType, BatchInfo } from '../types/log.types';
import { ProcessStage } from '../types/process.types';
import { stationService } from './stationService';
import { productService } from './productService';

const STORAGE_KEY = 'pb_production_weight_logs_v2';

// Seed logs khởi tạo khớp 100% với ảnh chụp pgAdmin 4 (bảng public.production_weight_logs)
export const DEFAULT_WEIGHT_LOGS: ProductionWeightLog[] = [
  // --- Các mẻ cân từ ảnh chụp pgAdmin 4 ---
  {
    log_id: 1,
    batch_id: 'test',
    station_id: '10244156',
    process_id: 'CD001',
    product_id: 'TOM001',
    type_weight: 'IN',
    value_weight: 15.000,
    tare_weight: 1.000,
    net_weight: 14.000,
    time_action: '2026-10-03T07:52:20.369Z',
    employee_id: 'NV001',
    source_method: null
  },
  {
    log_id: 2,
    batch_id: 'test',
    station_id: '10244156',
    process_id: 'CD001',
    product_id: 'TOM001',
    type_weight: 'IN',
    value_weight: 15.000,
    tare_weight: 1.000,
    net_weight: 14.000,
    time_action: '2026-10-03T07:52:33.253Z',
    employee_id: 'NV001',
    source_method: null
  },
  {
    log_id: 3,
    batch_id: 'test',
    station_id: '10244156',
    process_id: 'CD001',
    product_id: 'TOM001',
    type_weight: 'IN',
    value_weight: 15.000,
    tare_weight: 1.000,
    net_weight: 14.000,
    time_action: '2026-10-03T07:52:41.285Z',
    employee_id: 'NV001',
    source_method: null
  },
  {
    log_id: 4,
    batch_id: 'loconc',
    station_id: '10244156',
    process_id: 'CD001',
    product_id: 'TOM001',
    type_weight: 'IN',
    value_weight: 19.195,
    tare_weight: 1.120,
    net_weight: 18.075,
    time_action: '2026-10-05T02:57:34.753Z',
    employee_id: '123441',
    source_method: 'SIM_f7422'
  },
  {
    log_id: 5,
    batch_id: 'L0001',
    station_id: 'CAN001',
    process_id: 'CD001',
    product_id: 'TP001',
    type_weight: 'IN',
    value_weight: 25.500,
    tare_weight: 0.500,
    net_weight: 25.000,
    time_action: '2026-10-05T10:20:30.000Z',
    employee_id: 'NV001',
    source_method: 'TEST-PC-01'
  },
  {
    log_id: 6,
    batch_id: 'L0001',
    station_id: 'CAN001',
    process_id: 'CD001',
    product_id: 'TP001',
    type_weight: 'IN',
    value_weight: 25.500,
    tare_weight: 0.500,
    net_weight: 25.000,
    time_action: '2026-10-05T10:20:30.000Z',
    employee_id: 'NV003',
    source_method: 'TEST-PC-01'
  },
  {
    log_id: 7,
    batch_id: 'L0001',
    station_id: 'CAN002',
    process_id: 'CD001',
    product_id: 'TP001',
    type_weight: 'IN',
    value_weight: 25.500,
    tare_weight: 0.500,
    net_weight: 25.000,
    time_action: '2026-10-05T10:20:30.000Z',
    employee_id: 'NV003',
    source_method: 'TEST-PC-01'
  },
  {
    log_id: 8,
    batch_id: 'L0003',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP002',
    type_weight: 'IN',
    value_weight: 6.013,
    tare_weight: 0.735,
    net_weight: 5.278,
    time_action: '2026-10-05T12:05:03.000Z',
    employee_id: 'NV003',
    source_method: '7779460-2'
  },
  {
    log_id: 9,
    batch_id: 'L0002',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP002',
    type_weight: 'IN',
    value_weight: 32.374,
    tare_weight: 0.457,
    net_weight: 31.917,
    time_action: '2026-10-05T12:05:09.000Z',
    employee_id: 'NV003',
    source_method: '7779460-2'
  },
  {
    log_id: 10,
    batch_id: 'L0003',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP002',
    type_weight: 'IN',
    value_weight: 31.244,
    tare_weight: 0.366,
    net_weight: 30.878,
    time_action: '2026-10-05T12:05:12.000Z',
    employee_id: 'NV002',
    source_method: '7779460-2'
  },
  {
    log_id: 11,
    batch_id: 'L0002',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP002',
    type_weight: 'IN',
    value_weight: 30.496,
    tare_weight: 0.864,
    net_weight: 29.632,
    time_action: '2026-10-05T12:05:16.000Z',
    employee_id: 'NV002',
    source_method: '7779460-2'
  },
  {
    log_id: 12,
    batch_id: 'L0002',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP003',
    type_weight: 'IN',
    value_weight: 49.966,
    tare_weight: 0.786,
    net_weight: 49.180,
    time_action: '2026-10-05T12:05:27.000Z',
    employee_id: 'NV002',
    source_method: '7779460-2'
  },

  // --- Các mẻ cân đầu ra (OUT) và mẻ cân bổ sung để tính toán WiP và % Yield chuẩn xác ---
  {
    log_id: 13,
    batch_id: 'L0001',
    station_id: '10244161',
    process_id: 'CD006',
    product_id: 'SP-DH-01',
    type_weight: 'OUT',
    value_weight: 22.800,
    tare_weight: 0.800,
    net_weight: 22.000,
    time_action: '2026-10-05T13:40:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 14,
    batch_id: 'L0001',
    station_id: '10244167',
    process_id: 'CD012',
    product_id: 'SP-CX-01',
    type_weight: 'OUT',
    value_weight: 34.200,
    tare_weight: 1.200,
    net_weight: 33.000,
    time_action: '2026-10-05T15:10:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 15,
    batch_id: 'L0002',
    station_id: '10244163',
    process_id: 'CD008',
    product_id: 'SP-CN-01',
    type_weight: 'OUT',
    value_weight: 42.500,
    tare_weight: 1.500,
    net_weight: 41.000,
    time_action: '2026-10-05T16:00:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  },
  {
    log_id: 16,
    batch_id: 'L0002',
    station_id: '10244168',
    process_id: 'CD013',
    product_id: 'SP-CC-01',
    type_weight: 'OUT',
    value_weight: 38.600,
    tare_weight: 1.200,
    net_weight: 37.400,
    time_action: '2026-10-05T17:30:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 17,
    batch_id: 'L0003',
    station_id: '10244170',
    process_id: 'CD015',
    product_id: 'SP-IC-01',
    type_weight: 'OUT',
    value_weight: 27.200,
    tare_weight: 1.000,
    net_weight: 26.200,
    time_action: '2026-10-05T18:15:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 18,
    batch_id: 'test',
    station_id: '10244167',
    process_id: 'CD012',
    product_id: 'SP-CX-01',
    type_weight: 'OUT',
    value_weight: 31.500,
    tare_weight: 1.500,
    net_weight: 30.000,
    time_action: '2026-10-03T11:20:00.000Z',
    employee_id: 'NV001',
    source_method: 'SIM_f7422'
  },
  // CD002: Rửa 1 & Phân cỡ sơ bộ
  {
    log_id: 19,
    batch_id: 'L0001',
    station_id: '10244157',
    process_id: 'CD002',
    product_id: 'SP-PC-01',
    type_weight: 'IN',
    value_weight: 48.500,
    tare_weight: 1.500,
    net_weight: 47.000,
    time_action: '2026-10-05T11:00:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 20,
    batch_id: 'L0001',
    station_id: '10244173',
    process_id: 'CD002',
    product_id: 'SP-PC-01',
    type_weight: 'OUT',
    value_weight: 46.200,
    tare_weight: 1.200,
    net_weight: 45.000,
    time_action: '2026-10-05T11:30:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  // CD003: Xếp khuôn & Định lượng
  {
    log_id: 21,
    batch_id: 'L0001',
    station_id: '10244158',
    process_id: 'CD003',
    product_id: 'SP-XK-01',
    type_weight: 'IN',
    value_weight: 45.000,
    tare_weight: 1.000,
    net_weight: 44.000,
    time_action: '2026-10-05T11:45:00.000Z',
    employee_id: 'NV003',
    source_method: 'RS-232'
  },
  {
    log_id: 22,
    batch_id: 'L0001',
    station_id: '10244174',
    process_id: 'CD003',
    product_id: 'SP-XK-01',
    type_weight: 'OUT',
    value_weight: 44.000,
    tare_weight: 1.000,
    net_weight: 43.000,
    time_action: '2026-10-05T12:15:00.000Z',
    employee_id: 'NV003',
    source_method: 'RS-232'
  },
  // CD004: Sơ chế (Bóc vỏ & Rút chỉ)
  {
    log_id: 23,
    batch_id: 'L0001',
    station_id: '10244159',
    process_id: 'CD004',
    product_id: 'SP-BV-01',
    type_weight: 'IN',
    value_weight: 43.000,
    tare_weight: 1.000,
    net_weight: 42.000,
    time_action: '2026-10-05T12:30:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 24,
    batch_id: 'L0001',
    station_id: '10244175',
    process_id: 'CD004',
    product_id: 'SP-BV-01',
    type_weight: 'OUT',
    value_weight: 34.500,
    tare_weight: 1.000,
    net_weight: 33.500,
    time_action: '2026-10-05T13:15:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  // CD005: Ngâm xử lý phụ gia
  {
    log_id: 25,
    batch_id: 'L0001',
    station_id: '10244160',
    process_id: 'CD005',
    product_id: 'SP-PG-01',
    type_weight: 'IN',
    value_weight: 34.500,
    tare_weight: 1.500,
    net_weight: 33.000,
    time_action: '2026-10-05T13:30:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 26,
    batch_id: 'L0001',
    station_id: '10244176',
    process_id: 'CD005',
    product_id: 'SP-PG-01',
    type_weight: 'OUT',
    value_weight: 37.000,
    tare_weight: 1.500,
    net_weight: 35.500,
    time_action: '2026-10-05T14:15:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  // CD007: Tẩm bột chiên xù
  {
    log_id: 27,
    batch_id: 'L0002',
    station_id: '10244162',
    process_id: 'CD007',
    product_id: 'SP-TB-01',
    type_weight: 'IN',
    value_weight: 31.000,
    tare_weight: 1.000,
    net_weight: 30.000,
    time_action: '2026-10-05T14:45:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  },
  {
    log_id: 28,
    batch_id: 'L0002',
    station_id: '10244177',
    process_id: 'CD007',
    product_id: 'SP-TB-01',
    type_weight: 'OUT',
    value_weight: 43.500,
    tare_weight: 1.500,
    net_weight: 42.000,
    time_action: '2026-10-05T15:30:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  },
  // CD009: Luộc / Hấp nõn PD
  {
    log_id: 29,
    batch_id: 'L0003',
    station_id: '10244164',
    process_id: 'CD009',
    product_id: 'SP-PD-01',
    type_weight: 'IN',
    value_weight: 26.000,
    tare_weight: 1.000,
    net_weight: 25.000,
    time_action: '2026-10-05T15:00:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 30,
    batch_id: 'L0003',
    station_id: '10244178',
    process_id: 'CD009',
    product_id: 'SP-PD-01',
    type_weight: 'OUT',
    value_weight: 23.000,
    tare_weight: 1.000,
    net_weight: 22.000,
    time_action: '2026-10-05T15:40:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  // CD010: Luộc / Hấp vỏ HLSO
  {
    log_id: 31,
    batch_id: 'L0003',
    station_id: '10244165',
    process_id: 'CD010',
    product_id: 'SP-HL-01',
    type_weight: 'IN',
    value_weight: 29.000,
    tare_weight: 1.000,
    net_weight: 28.000,
    time_action: '2026-10-05T16:00:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 32,
    batch_id: 'L0003',
    station_id: '10244179',
    process_id: 'CD010',
    product_id: 'SP-HL-01',
    type_weight: 'OUT',
    value_weight: 27.200,
    tare_weight: 1.000,
    net_weight: 26.200,
    time_action: '2026-10-05T16:45:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  // CD011: Tách vỏ sau luộc
  {
    log_id: 33,
    batch_id: 'L0003',
    station_id: '10244166',
    process_id: 'CD011',
    product_id: 'SP-TV-01',
    type_weight: 'IN',
    value_weight: 27.000,
    tare_weight: 1.000,
    net_weight: 26.000,
    time_action: '2026-10-05T17:00:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  },
  {
    log_id: 34,
    batch_id: 'L0003',
    station_id: '10244180',
    process_id: 'CD011',
    product_id: 'SP-TV-01',
    type_weight: 'OUT',
    value_weight: 21.800,
    tare_weight: 1.000,
    net_weight: 20.800,
    time_action: '2026-10-05T17:45:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  },
  // CD014: Cấp đông IQF tươi
  {
    log_id: 35,
    batch_id: 'L0002',
    station_id: '10244169',
    process_id: 'CD014',
    product_id: 'SP-IQ-01',
    type_weight: 'IN',
    value_weight: 31.000,
    tare_weight: 1.000,
    net_weight: 30.000,
    time_action: '2026-10-05T18:00:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 36,
    batch_id: 'L0002',
    station_id: '10244181',
    process_id: 'CD014',
    product_id: 'SP-IQ-01',
    type_weight: 'OUT',
    value_weight: 30.600,
    tare_weight: 1.200,
    net_weight: 29.400,
    time_action: '2026-10-05T18:40:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  // --- Các mẻ cân phát sinh hôm nay (2026-11-05) ---
  {
    log_id: 37,
    batch_id: 'L0001',
    station_id: 'CAN001',
    process_id: 'CD001',
    product_id: 'TP001',
    type_weight: 'IN',
    value_weight: 52.500,
    tare_weight: 1.500,
    net_weight: 51.000,
    time_action: '2026-11-05T07:15:00.000Z',
    employee_id: 'NV001',
    source_method: 'TCP/IP'
  },
  {
    log_id: 38,
    batch_id: 'L0001',
    station_id: '10244161',
    process_id: 'CD006',
    product_id: 'SP-DH-01',
    type_weight: 'OUT',
    value_weight: 46.200,
    tare_weight: 1.200,
    net_weight: 45.000,
    time_action: '2026-11-05T07:45:00.000Z',
    employee_id: 'NV002',
    source_method: 'TCP/IP'
  },
  {
    log_id: 39,
    batch_id: 'L0002',
    station_id: '7779460',
    process_id: 'CD001',
    product_id: 'TP002',
    type_weight: 'IN',
    value_weight: 64.000,
    tare_weight: 2.000,
    net_weight: 62.000,
    time_action: '2026-11-05T07:30:00.000Z',
    employee_id: 'NV003',
    source_method: '7779460-2'
  },
  {
    log_id: 40,
    batch_id: 'L0002',
    station_id: '10244163',
    process_id: 'CD008',
    product_id: 'SP-CN-01',
    type_weight: 'OUT',
    value_weight: 58.500,
    tare_weight: 1.500,
    net_weight: 57.000,
    time_action: '2026-11-05T08:00:00.000Z',
    employee_id: 'NV003',
    source_method: 'TCP/IP'
  }
];

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
    if (typeof window === 'undefined') return DEFAULT_WEIGHT_LOGS;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveLogs(DEFAULT_WEIGHT_LOGS);
      return DEFAULT_WEIGHT_LOGS;
    }
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
      return DEFAULT_WEIGHT_LOGS;
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

    // 3. Tra cứu suy luận từ bảng product
    const products = productService.getProducts();
    let assignedProductId = newLog.product_id;
    if (!assignedProductId || !products.some(p => p.id === assignedProductId)) {
      const stageProd = products.find(p => p.stageId === assignedProcessId);
      assignedProductId = stageProd?.id || 'TOM001';
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
        const stageProd = products.find(p => p.stageId === assignedProcessId);
        assignedProductId = stageProd?.id || 'TOM001';
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
   * Tính toán toàn diện các chỉ số IN, OUT, WiP, % Yield
   * ĐẶC BIỆT: Phân tách theo từng công đoạn, không tính tổng gộp mù quáng
   * để tránh sai lệch khi công đoạn có TĂNG TRỌNG (Ngâm quay tôm 100kg -> 105kg)
   * hoặc HAO HỤT (Sơ chế bóc vỏ tôm 100kg -> 60kg).
   */
  getMetrics(batchId?: string, customLogs?: ProductionWeightLog[]): ProductionMetrics {
    const allLogs = customLogs || this.getLogs();
    const filtered = batchId && batchId !== 'ALL'
      ? allLogs.filter(l => l.batch_id === batchId)
      : allLogs;

    // Lấy danh sách công đoạn để phân tích từng bước
    const stages = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('pb_process_stages_v3') || '[]')
      : [];
    const stageWiPList = this.getStageWiPSummaries(stages, batchId, customLogs);

    // 1. Đầu vào gốc (Tiếp nhận nguyên liệu ban đầu tại CD001 hoặc công đoạn đầu)
    const cd001 = stageWiPList.find(s => s.processId === 'CD001');
    let rawInWeight = cd001 ? cd001.inWeight : 0;
    if (rawInWeight === 0) {
      // Nếu không có mẻ cân tại CD001, tìm công đoạn đầu tiên có mẻ cân IN
      const firstActive = stageWiPList.find(s => s.inWeight > 0);
      rawInWeight = firstActive ? firstActive.inWeight : 0;
    }

    // 2. Thành phẩm đầu ra hoàn thành xuất xưởng (tại các công đoạn cuối CD006, CD008, CD012..CD015)
    const endStages = new Set(['CD006', 'CD008', 'CD012', 'CD013', 'CD014', 'CD015']);
    let finishedOutWeight = stageWiPList
      .filter(s => endStages.has(s.processId))
      .reduce((acc, s) => acc + s.outWeight, 0);

    if (finishedOutWeight === 0) {
      finishedOutWeight = stageWiPList.reduce((acc, s) => acc + s.outWeight, 0);
    }

    // 3. Tổng WIP thực tế trên toàn chuyền = Tổng WIP từng công đoạn (KHÔNG bao giờ bị âm hay bị bù trừ bởi tăng trọng)
    const totalWip = stageWiPList.reduce((acc, s) => acc + s.wipWeight, 0);

    // 4. Tổng khối lượng tăng trọng (ngâm quay tôm, tẩm bột) & hao hụt (bóc vỏ, luộc)
    const totalGain = stageWiPList.filter(s => s.isGain).reduce((acc, s) => acc + (s.outWeight - s.inWeight), 0);
    const totalLoss = stageWiPList.filter(s => s.isLoss).reduce((acc, s) => acc + (s.inWeight - s.outWeight), 0);
    const bottleneckCount = stageWiPList.filter(s => s.wipWeight > 0).length;

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
      bottleneckCount
    };
  },

  /**
   * Danh sách tóm tắt toàn diện theo từng Lô hàng (Batch)
   * Phục vụ trực tiếp 4 yêu cầu cốt lõi của ban điều hành:
   * 1. Xác định lô nào đang làm hôm nay
   * 2. Phân loại lô đang còn làm vs lô đã làm xong; hỗ trợ thêm/sửa lô
   * 3. Tính toán chính xác: Chưa làm (kg), WIP (kg), IN (kg), OUT (kg)
   *    DỰA TRÊN TỪNG CÔNG ĐOẠN, tránh tính tổng gộp làm sai lệch do Tăng trọng (Ngâm quay tôm) và Hao hụt (Bóc vỏ).
   * 4. Tính toán tỷ lệ % tiến độ hoàn thành cho thanh tiến độ
   */
  getBatchSummaries(customLogs?: ProductionWeightLog[]): BatchSummary[] {
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
    const stages = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('pb_process_stages_v3') || '[]')
      : [];

    const summaries: BatchSummary[] = [];

    allBatchIds.forEach(batchId => {
      const info = infoMap.get(batchId);
      const batchLogs = logs.filter(l => l.batch_id === batchId);

      // Phân tích chi tiết theo từng bước công đoạn của riêng lô này
      const stageList = this.getStageWiPSummaries(stages, batchId, logs);

      // 1. Đầu vào gốc (Tiếp nhận nguyên liệu ban đầu tại CD001)
      const cd001 = stageList.find(s => s.processId === 'CD001');
      let rawIn = cd001 ? cd001.inWeight : 0;
      if (rawIn === 0) {
        const firstActive = stageList.find(s => s.inWeight > 0);
        rawIn = firstActive ? firstActive.inWeight : 0;
      }

      // 2. Thành phẩm đầu ra hoàn thành xuất xưởng
      const endStages = new Set(['CD006', 'CD008', 'CD012', 'CD013', 'CD014', 'CD015']);
      let finishedOut = stageList
        .filter(s => endStages.has(s.processId))
        .reduce((acc, s) => acc + s.outWeight, 0);

      if (finishedOut === 0) {
        finishedOut = stageList.reduce((acc, s) => acc + s.outWeight, 0);
      }

      // 3. Tổng WIP trên chuyền = Tổng WIP thực tế từng công đoạn (không bị bù trừ bởi ngâm quay tăng trọng)
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
   * Phân bổ hàng dở dang (WiP), Tăng trọng và Hao hụt theo TỪNG CÔNG ĐOẠN chế biến (1..15)
   * Nhận diện chính xác bước Tăng trọng (Ngâm quay tôm CD005, Tẩm bột CD007)
   * và bước Hao hụt (Sơ chế bóc vỏ CD004, Tách vỏ CD011).
   */
  getStageWiPSummaries(stages: ProcessStage[], selectedBatch?: string, customLogs?: ProductionWeightLog[]): StageWiPSummary[] {
    const allLogs = customLogs || this.getLogs();
    const logs = selectedBatch && selectedBatch !== 'ALL'
      ? allLogs.filter(l => l.batch_id === selectedBatch)
      : allLogs;

    // Đảm bảo luôn đủ 15 công đoạn chuẩn nếu danh sách rỗng
    const actualStages = stages && stages.length > 0 ? stages : [
      { processId: 'CD001', processName: 'Tiếp nhận nguyên liệu' },
      { processId: 'CD002', processName: 'Rửa 1 & Phân cỡ sơ bộ' },
      { processId: 'CD003', processName: 'Xếp khuôn & Định lượng' },
      { processId: 'CD004', processName: 'Sơ chế (Bóc vỏ & Rút chỉ)' },
      { processId: 'CD005', processName: 'Ngâm xử lý phụ gia (Ngâm quay tôm)' },
      { processId: 'CD006', processName: 'Định hình Nobashi / Xẻ bướm' },
      { processId: 'CD007', processName: 'Tẩm bột chiên xù' },
      { processId: 'CD008', processName: 'Chiên định hình dầu nóng' },
      { processId: 'CD009', processName: 'Luộc / Hấp tôm nõn (PD)' },
      { processId: 'CD010', processName: 'Luộc / Hấp tôm vỏ (HLSO)' },
      { processId: 'CD011', processName: 'Tách vỏ sau luộc' },
      { processId: 'CD012', processName: 'Cấp đông xoắn tôm tươi' },
      { processId: 'CD013', processName: 'Cấp đông xoắn tôm chiên' },
      { processId: 'CD014', processName: 'Cấp đông IQF tôm tươi' },
      { processId: 'CD015', processName: 'Cấp đông IQF tôm chín' }
    ] as any[];

    const stageMap = new Map<string, { inWeight: number; outWeight: number; inCount: number; outCount: number }>();

    actualStages.forEach(st => {
      const sId = st.processId || st.id || '';
      stageMap.set(sId, { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 });
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
    actualStages.forEach(st => {
      const sId = st.processId || st.id || '';
      const data = stageMap.get(sId) || { inWeight: 0, outWeight: 0, inCount: 0, outCount: 0 };
      const inW = Number(data.inWeight.toFixed(3));
      const outW = Number(data.outWeight.toFixed(3));
      const weightDiff = Number((outW - inW).toFixed(3));

      // Phân loại đặc thù từng công đoạn:
      let stageType: 'RECEIVING' | 'SOAKING_GAIN' | 'BREADING_GAIN' | 'LOSS_PEEL' | 'END_PRODUCT' | 'GENERAL' = 'GENERAL';
      if (sId === 'CD001') stageType = 'RECEIVING';
      else if (sId === 'CD005') stageType = 'SOAKING_GAIN'; // Ngâm xử lý phụ gia (Ngâm quay tôm)
      else if (sId === 'CD007') stageType = 'BREADING_GAIN'; // Tẩm bột chiên xù
      else if (sId === 'CD004' || sId === 'CD011') stageType = 'LOSS_PEEL'; // Bóc vỏ, tách vỏ
      else if (['CD012', 'CD013', 'CD014', 'CD015'].includes(sId)) stageType = 'END_PRODUCT';

      let yieldRate = 0;
      let gainRate = 0;
      let lossRate = 0;
      let isGain = false;
      let isLoss = false;
      let wip = 0;
      let statusText = 'Chưa hoạt động';

      if (sId === 'CD001') {
        // 1. CÔNG ĐOẠN TIẾP NHẬN NGUYÊN LIỆU ĐẦU VÀO GỐC (Nhập từ hộ nuôi / nhà cung ứng)
        yieldRate = 100;
        isGain = false;
        isLoss = false;
        gainRate = 0;
        lossRate = 0;
        wip = 0;
        statusText = inW > 0 ? `Tiếp nhận nguyên liệu (${inW.toFixed(1)} kg)` : 'Chưa nhận nguyên liệu';
      } else if (stageType === 'END_PRODUCT' && inW === 0 && outW > 0) {
        // 2. CÔNG ĐOẠN XUẤT THÀNH PHẨM HOÀN THÀNH (Cấp đông xoắn, IQF)
        yieldRate = 100;
        isGain = false;
        isLoss = false;
        gainRate = 0;
        lossRate = 0;
        wip = 0;
        statusText = `Xuất thành phẩm (${outW.toFixed(1)} kg)`;
      } else if (inW > 0) {
        yieldRate = Number(((outW / inW) * 100).toFixed(1));

        if (outW > inW) {
          // 3. CÔNG ĐOẠN TĂNG TRỌNG (Ngâm quay tôm CD005, Tẩm bột CD007)
          isGain = true;
          gainRate = Number((((outW - inW) / inW) * 100).toFixed(1));
          isLoss = false;
          lossRate = 0;
          // Mẻ đã xuất ra hết khỏi máy và tăng thêm trọng lượng -> Không còn hàng đọng trong máy
          wip = 0;
          statusText = `Tăng trọng (+${(outW - inW).toFixed(1)} kg • +${gainRate}%)`;
        } else if (outW < inW) {
          // 4. CÔNG ĐOẠN HAO HỤT (Bóc vỏ rút chỉ CD004, Tách vỏ CD011, Luộc)
          isGain = false;
          gainRate = 0;
          isLoss = true;
          lossRate = Number((((inW - outW) / inW) * 100).toFixed(1));

          // Nếu là bóc vỏ (CD004) mà tỷ lệ thịt tôm ra đã xấp xỉ định mức chuẩn (>= 58%): mẻ đã bóc xong, phần thiếu là vỏ tôm thải bỏ
          if ((sId === 'CD004' && yieldRate >= 58) || (sId === 'CD011' && yieldRate >= 65)) {
            wip = 0;
            statusText = `Hao hụt vỏ (-${(inW - outW).toFixed(1)} kg • -${lossRate}%)`;
          } else {
            wip = Math.max(0, Number((inW - outW).toFixed(3)));
            statusText = wip > 0 ? `Đang xử lý (${wip.toFixed(1)} kg đọng)` : `Hao hụt (-${lossRate}%)`;
          }
        } else {
          // 5. BẢO TOÀN TRỌNG LƯỢNG
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
        processName: st.processName || st.name || sId,
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
        statusText
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
   * Quản lý thông tin chi tiết các Lô sản xuất (BatchInfo)
   */
  getBatchesInfo(): BatchInfo[] {
    try {
      const stored = localStorage.getItem('pb_batches_info_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    const defaultBatches: BatchInfo[] = [
      {
        batchId: 'L0001',
        batchName: 'Tôm thẻ chân trắng xuất EU',
        plannedWeight: 200000,
        startDate: '2026-11-05',
        origin: 'Cà Mau - HTX Minh Phú',
        status: 'IN_PROGRESS',
        notes: 'Quy chuẩn cấp đông IQF, độ muối 1.5%'
      },
      {
        batchId: 'L0002',
        batchName: 'Tôm sú nguyên liệu loại 1',
        plannedWeight: 150000,
        startDate: '2026-11-05',
        origin: 'Bạc Liêu - Hộ nuôi Năm Căn',
        status: 'IN_PROGRESS',
        notes: 'Size 20-25 con/kg'
      },
      {
        batchId: 'L0003',
        batchName: 'Tôm Nobashi đông lạnh',
        plannedWeight: 80000,
        startDate: '2026-11-01',
        origin: 'Sóc Trăng',
        status: 'IN_PROGRESS',
        notes: 'Định hình duỗi thẳng Nobashi xuất Nhật'
      },
      {
        batchId: 'test',
        batchName: 'Lô thử nghiệm kỹ thuật',
        plannedWeight: 50000,
        startDate: '2026-10-28',
        origin: 'Nội bộ',
        status: 'COMPLETED',
        notes: 'Dùng kiểm thử hệ thống trạm cân IoT'
      }
    ];

    try {
      localStorage.setItem('pb_batches_info_v1', JSON.stringify(defaultBatches));
    } catch {
      // ignore
    }
    return defaultBatches;
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
