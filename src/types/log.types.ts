/**
 * Model Nhật ký cân sản xuất khớp 100% với PostgreSQL table production_weight_logs (PBT Database)
 */

export type WeightIOType = 'IN' | 'OUT';

export interface ProductionWeightLog {
  log_id: number;              // [PK] bigint GENERATED ALWAYS AS IDENTITY
  batch_id: string;            // character varying(50): 'L0001', 'L0002', 'test', 'loconc'...
  station_id: string;          // character varying(50): '10244156', 'CAN001', '7779460'...
  process_id: string;          // character varying(50): 'CD001', 'CD002', 'CD005'...
  product_id: string;          // character varying(50): 'TOM001', 'TP001', 'SP-TN-01'...
  type_weight: WeightIOType;   // character varying(10) CHECK (type_weight IN ('IN', 'OUT'))
  value_weight: number;        // numeric(12,3): Trọng lượng tổng (Gross) tính bằng kg
  tare_weight: number;         // numeric(12,3): Trọng lượng bì/khay (Tare) tính bằng kg
  net_weight?: number;         // Trọng lượng tịnh = value_weight - tare_weight (kg)
  time_action: string;         // timestamptz: Thời điểm cân
  employee_id?: string | null; // character varying(50): 'NV001', 'NV002', '123441'...
  source_method?: string | null; // character varying(50): 'TCP/IP', 'SIM_f7422', 'TEST-PC-01', '7779460-2'...
}

export interface ProductionMetrics {
  totalInWeight: number;       // Khối lượng nguyên liệu đầu vào tiếp nhận gốc (kg)
  totalOutWeight: number;      // Khối lượng thành phẩm đầu ra hoàn thành xuất xưởng (kg)
  wipWeight: number;           // Hàng dở dang thực tế trên chuyền = Tổng WIP các công đoạn (kg)
  yieldRate: number;           // Hiệu suất thu hồi toàn chuyền = (totalOut / totalIn) * 100 (%)
  inCount: number;             // Số mẻ cân IN
  outCount: number;            // Số mẻ cân OUT
  activeBatchesCount: number;  // Số lô đang chạy
  plannedWeight?: number;      // Khối lượng theo kế hoạch ban đầu (kg)
  remainingWeight?: number;    // Số kg nguyên liệu còn lại chưa nạp (kg)
  totalGainWeight?: number;    // Tổng khối lượng tăng trọng từ các bước ngâm quay tôm, tẩm bột (kg)
  totalLossWeight?: number;    // Tổng khối lượng hao hụt vỏ tôm, tạp chất từ các bước sơ chế (kg)
  bottleneckCount?: number;    // Số công đoạn đang có hàng đọng
  bottleneckStages?: string[]; // Tên các công đoạn đang đọng hàng để quản lý nắm bắt ngay
}

export interface BatchSummary {
  batchId: string;
  batchName: string;
  plannedWeight: number;       // Khối lượng kế hoạch ban đầu (kg)
  inWeight: number;            // Khối lượng nguyên liệu đầu vào tiếp nhận gốc (kg)
  outWeight: number;           // Khối lượng thành phẩm đầu ra hoàn thành (kg)
  wipWeight: number;           // Tổng hàng dở dang thực tế = Tổng WIP từng công đoạn (kg)
  remainingWeight: number;     // Số kg nguyên liệu còn lại chưa làm = max(0, plannedWeight - inWeight) (kg)
  yieldRate: number;           // Tỷ lệ thu hồi = (outWeight / inWeight) * 100 (%)
  progressPercent: number;     // Phần trăm tiến độ hoàn thành theo kế hoạch (%)
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  origin?: string;             // Xuất xứ / Nhà cung ứng
  startDate?: string;          // Ngày bắt đầu sản xuất
  notes?: string;              // Ghi chú
  lastAction?: string;         // Thời điểm phát sinh mẻ cân gần nhất
  isToday: boolean;            // Lô có đang hoạt động/làm trong ngày hôm nay không
  todayInWeight: number;       // Khối lượng đầu vào (IN) đã cân hôm nay (kg)
  todayOutWeight: number;      // Khối lượng đầu ra (OUT) đã cân hôm nay (kg)
  todayLogCount: number;       // Số mẻ cân đã thực hiện hôm nay
  inCount: number;             // Tổng số mẻ cân IN
  outCount: number;            // Tổng số mẻ cân OUT
  totalGainWeight?: number;    // Tổng khối lượng tăng trọng (ngâm quay tôm, tẩm bột...) (kg)
  totalLossWeight?: number;    // Tổng khối lượng hao hụt (bóc vỏ, luộc...) (kg)
  activeStagesCount?: number;  // Số công đoạn đang tham gia xử lý
}

export interface BatchInfo {
  batchId: string;
  batchName: string;
  plannedWeight?: number;        // Khối lượng kế hoạch ban đầu (kg)
  startDate?: string;            // Ngày bắt đầu sản xuất
  origin?: string;               // Xuất xứ nguyên liệu / Nhà cung ứng
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  isDeleted?: boolean;           // Đánh dấu xoá mềm (Soft Delete) - Bảo toàn dữ liệu lịch sử
  deletedAt?: string;            // Thời điểm xoá mềm
  notes?: string;
  createdAt?: string;
}

export interface StageWiPSummary {
  processId: string;           // Mã công đoạn: CD001, CD002...
  processName: string;         // Tên công đoạn: Tiếp nhận, Ngâm xử lý phụ gia, Tẩm bột...
  inWeight: number;            // Khối lượng nạp vào công đoạn (kg)
  outWeight: number;           // Khối lượng lấy ra khỏi công đoạn (kg)
  wipWeight: number;           // Hàng dở dang còn đọng tại công đoạn (kg) >= 0
  yieldRate: number;           // Tỷ lệ thu hồi / định mức công đoạn = (outWeight / inWeight) * 100 (%)
  weightDiff: number;          // Biến thiên khối lượng = outWeight - inWeight (kg) (+ là tăng trọng, - là hao hụt)
  gainRate: number;            // Tỷ lệ tăng trọng (%) nếu OUT > IN (vd: Ngâm quay tôm +5%)
  lossRate: number;            // Tỷ lệ hao hụt (%) nếu OUT < IN (vd: Bóc vỏ sơ chế -20.2%)
  isGain: boolean;             // Có hiện tượng tăng trọng không (OUT > IN)
  isLoss: boolean;             // Có hiện tượng hao hụt không (OUT < IN)
  inCount: number;             // Số mẻ cân nạp vào công đoạn
  outCount: number;            // Số mẻ cân lấy ra khỏi công đoạn
  stageType: 'RECEIVING' | 'SOAKING_GAIN' | 'BREADING_GAIN' | 'LOSS_PEEL' | 'END_PRODUCT' | 'GENERAL';
  statusText: string;          // Trạng thái: 'Tăng trọng (+5kg)', 'Hao hụt (-8.5kg)', 'Đang xử lý', 'Thông suốt'
  isStartStage?: boolean;      // Công đoạn đầu vào tiếp nhận
  isEndStage?: boolean;        // Công đoạn hoàn tất xuất xưởng
}
