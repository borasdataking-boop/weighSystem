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
  totalInWeight: number;       // Tổng lượng nguyên liệu đầu vào (kg)
  totalOutWeight: number;      // Tổng lượng thành phẩm đầu ra (kg)
  wipWeight: number;           // Hàng dở dang trên chuyền = totalIn - totalOut (kg)
  yieldRate: number;           // Hiệu suất thu hồi = (totalOut / totalIn) * 100 (%)
  inCount: number;             // Số mẻ cân IN
  outCount: number;            // Số mẻ cân OUT
  activeBatchesCount: number;  // Số lô đang chạy
}

export interface BatchSummary {
  batchId: string;
  inWeight: number;
  outWeight: number;
  wipWeight: number;
  yieldRate: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  lastAction: string;
}

export interface StageWiPSummary {
  processId: string;
  processName: string;
  inWeight: number;
  outWeight: number;
  wipWeight: number;
  yieldRate: number;
  inCount?: number;
  outCount?: number;
  lossRate?: number;
}
