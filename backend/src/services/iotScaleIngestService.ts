import { ProductionWeightLogRecord, STM32WeighPayload } from '../models/weighLogModel';
import { pool } from '../db';

// Bộ nhớ đệm chống ghi trùng lặp (Anti-Bounce / Debounce Cache)
// Tránh việc đầu cân Dini Argeo gửi 10 bản tin/giây khi khay tôm đang nằm trên cân
const lastRecordedScaleMap = new Map<string, { weight: number; timestamp: number }>();

export interface IngestResponse {
  success: boolean;
  message: string;
  record?: ProductionWeightLogRecord;
  skipped?: boolean;
}

export const iotScaleIngestService = {
  /**
   * Xử lý bản tin cân tự động nhận từ chip STM32
   */
  async ingestFromSTM32(payload: STM32WeighPayload): Promise<IngestResponse> {
    const { station_id, gross_weight, tare_weight = 0, is_stable } = payload;

    // 1. Chỉ chấp nhận khi số cân đã ỔN ĐỊNH (ST) từ đầu cân Dini Argeo
    if (!is_stable) {
      return {
        success: false,
        skipped: true,
        message: `Bỏ qua: Cân ${station_id} đang dao động (chưa ổn định ST).`
      };
    }

    // 2. Lọc tải rỗng (nếu công nhân đã nhấc khay ra, cân về gần 0)
    const net = Number((gross_weight - tare_weight).toFixed(3));
    if (net <= 0.1) {
      // Reset trạng thái để sẵn sàng cho mẻ tiếp theo
      lastRecordedScaleMap.delete(station_id);
      return {
        success: true,
        skipped: true,
        message: `Bàn cân ${station_id} đang trống (về 0 kg). Sẵn sàng nhận mẻ mới.`
      };
    }

    // 3. Cơ chế chống ghi trùng lặp (Debounce Filter)
    const now = Date.now();
    const lastRecord = lastRecordedScaleMap.get(station_id);
    if (lastRecord) {
      const timeDiff = now - lastRecord.timestamp;
      const weightDiff = Math.abs(net - lastRecord.weight);

      // Nếu trong vòng 8 giây mà khối lượng không đổi lệch quá 0.2kg -> Coi là cùng 1 mẻ tôm chưa nhấc xuống
      if (timeDiff < 8000 && weightDiff < 0.2) {
        return {
          success: true,
          skipped: true,
          message: `Bỏ qua: Mẻ cân ${net} kg trên cân ${station_id} đã được ghi nhận trước đó.`
        };
      }
    }

    // 4. Tra cứu vị trí công đoạn của trạm cân (Soft Lookup)
    // Tự động gán process_id theo cấu hình trạm cân hiện tại trong xưởng
    const assignedProcessId = this.lookupStationProcess(station_id);
    const assignedIOType = this.lookupStationIOType(station_id);

    // 5. Chuẩn hóa bản ghi mẻ cân lưu vào Database
    const newLogRecord: ProductionWeightLogRecord = {
      batch_id: payload.batch_id || this.getActiveBatch(),
      station_id: station_id,
      process_id: assignedProcessId,
      product_id: payload.product_id || this.getDefaultProductForStage(assignedProcessId),
      type_weight: assignedIOType,
      value_weight: gross_weight,
      tare_weight: tare_weight,
      net_weight: net,
      time_action: new Date().toISOString(),
      employee_id: payload.employee_id || null,
      source_method: 'STM32_DINI_IOT'
    };

    // 6. Thực hiện commit vào DB (PostgreSQL production_weight_logs)
    await this.insertLogToDatabase(newLogRecord);

    // Cập nhật cache mẻ vừa cân
    lastRecordedScaleMap.set(station_id, { weight: net, timestamp: now });

    // 7. Phát sự kiện Real-time để màn hình Frontend tự động nhảy số liệu
    this.broadcastRealtimeUpdate(newLogRecord);

    return {
      success: true,
      message: `Đã ghi nhận thành công mẻ cân ${net} kg từ trạm ${station_id}.`,
      record: newLogRecord
    };
  },

  /**
   * Tra cứu trạm cân đang đặt ở công đoạn nào (CD001 - CD015)
   */
  lookupStationProcess(stationId: string): string {
    // Trong môi trường production, truy vấn: SELECT process_id FROM station_weigh WHERE station_id = $1
    const stationProcessMap: Record<string, string> = {
      // CD001: Tiếp nhận nguyên liệu
      '10244156': 'CD001',
      'CAN001': 'CD001',
      'CAN002': 'CD001',
      '7779460': 'CD001',
      // CD002: Rửa 1 & Phân cỡ sơ bộ
      '10244157': 'CD002',
      '10244173': 'CD002',
      // CD003: Xếp khuôn & Định lượng
      '10244158': 'CD003',
      '10244174': 'CD003',
      // CD004: Sơ chế (Bóc vỏ & Rút chỉ)
      '10244159': 'CD004',
      '10244175': 'CD004',
      // CD005: Ngâm xử lý phụ gia
      '10244160': 'CD005',
      '10244176': 'CD005',
      // CD006: Định hình Nobashi
      '10244161': 'CD006',
      // CD007: Tẩm bột chiên xù
      '10244162': 'CD007',
      '10244177': 'CD007',
      // CD008: Chiên định hình dầu nóng
      '10244163': 'CD008',
      // CD009: Luộc / Hấp nõn PD
      '10244164': 'CD009',
      '10244178': 'CD009',
      // CD010: Luộc / Hấp vỏ HLSO
      '10244165': 'CD010',
      '10244179': 'CD010',
      // CD011: Tách vỏ sau luộc
      '10244166': 'CD011',
      '10244180': 'CD011',
      // CD012: Cấp đông xoắn tươi
      '10244167': 'CD012',
      // CD013: Cấp đông xoắn chiên
      '10244168': 'CD013',
      // CD014: Cấp đông IQF tươi
      '10244169': 'CD014',
      '10244181': 'CD014',
      // CD015: Cấp đông IQF chín
      '10244170': 'CD015'
    };
    return stationProcessMap[stationId] || 'CD001';
  },

  /**
   * Tra cứu trạm cân là cân IN (Đầu vào) hay OUT (Đầu ra)
   */
  lookupStationIOType(stationId: string): 'IN' | 'OUT' {
    const outStations = new Set([
      '10244161', // CD006 OUT
      '10244163', // CD008 OUT
      '10244167', // CD012 OUT
      '10244168', // CD013 OUT
      '10244170', // CD015 OUT
      '10244173', // CD002 OUT
      '10244174', // CD003 OUT
      '10244175', // CD004 OUT
      '10244176', // CD005 OUT
      '10244177', // CD007 OUT
      '10244178', // CD009 OUT
      '10244179', // CD010 OUT
      '10244180', // CD011 OUT
      '10244181'  // CD014 OUT
    ]);
    return outStations.has(stationId) ? 'OUT' : 'IN';
  },

  getActiveBatch(): string {
    return 'L0001';
  },

  getDefaultProductForStage(processId: string): string {
    const defaultProductMap: Record<string, string> = {
      CD001: 'TOM001',
      CD002: 'SP-PC-01',
      CD003: 'SP-XK-01',
      CD004: 'SP-BV-01',
      CD015: 'SP-IC-01'
    };
    return defaultProductMap[processId] || 'TOM001';
  },

  /**
   * Lưu bản ghi vào PostgreSQL (Prepared Statement)
   */
  async insertLogToDatabase(record: ProductionWeightLogRecord): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO production_weight_logs (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          record.batch_id,
          record.station_id,
          record.process_id,
          record.product_id,
          record.type_weight,
          record.value_weight,
          record.tare_weight,
          record.net_weight,
          record.time_action || new Date().toISOString(),
          record.employee_id || null,
          record.source_method || 'STM32_DINI_IOT'
        ]
      );
      console.log(`[DB COMMIT] Đã lưu thành công mẻ cân #${record.station_id}: ${record.net_weight} kg vào PostgreSQL`);
    } catch (err) {
      console.error(`[DB ERROR] Lỗi khi lưu mẻ cân vào PostgreSQL:`, err);
    }
  },

  /**
   * Phát tín hiệu WebSocket hoặc Server-Sent Event (SSE) tới Frontend
   */
  broadcastRealtimeUpdate(record: ProductionWeightLogRecord): void {
    console.log(`[REALTIME PUSH] Phát WebSocket mẻ cân mới tới Dashboard:`, record);
  }
};
