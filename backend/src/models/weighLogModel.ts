/**
 * Model và Kiểu dữ liệu khớp 100% với PostgreSQL: public.production_weight_logs
 */
export interface ProductionWeightLogRecord {
  log_id?: number;              // BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  batch_id: string;             // VARCHAR(50) NOT NULL
  station_id: string;           // VARCHAR(50) NOT NULL (Mã cân phần cứng)
  process_id: string;           // VARCHAR(50) NOT NULL (Công đoạn chế biến)
  product_id: string;           // VARCHAR(50) NOT NULL (Mã sản phẩm)
  type_weight: 'IN' | 'OUT';    // VARCHAR(10) NOT NULL CHECK ('IN', 'OUT')
  value_weight: number;         // NUMERIC(12, 3) NOT NULL (Gross Weight - Khối lượng tổng)
  tare_weight: number;          // NUMERIC(12, 3) NOT NULL (Tare Weight - Khối lượng bì/khay)
  net_weight: number;           // NUMERIC(12, 3) NOT NULL (Net Weight = Gross - Tare)
  time_action?: string;         // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  employee_id?: string | null;  // VARCHAR(50)
  source_method: string;        // VARCHAR(50) (e.g. 'STM32_DINI_TCP', 'STM32_DINI_HTTP')
}

export interface STM32WeighPayload {
  station_id: string;           // Mã trạm cân (e.g. '10244156')
  gross_weight: number;         // Số cân tổng từ Dini Argeo
  tare_weight?: number;         // Khối lượng bì (mặc định 0 nếu Dini tự trừ bì)
  net_weight?: number;          // Khối lượng tịnh (nếu Dini Argeo đã tính)
  unit?: string;                // 'kg' | 'g'
  is_stable: boolean;           // Cờ ổn định ST (True = Cân đã dừng dao động)
  batch_id?: string;            // Mã lô đang chạy tại line
  product_id?: string;          // Mã mặt hàng
  employee_id?: string;         // Thẻ RFID công nhân quẹt tại trạm (nếu có)
  raw_telegram?: string;        // Chuỗi ASCII gốc từ Dini Argeo (lưu vết đối soát)
}
