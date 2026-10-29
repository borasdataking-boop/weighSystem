/**
 * Model Trạm cân khớp 100% với Prisma Schema (model StationWeigh)
 * và bảng station_weigh trong PostgreSQL (PMSL.sql).
 */

export type StationProtocol = 'TCP/IP' | 'RS-232' | 'WiFi';
export type StationStatus = 'ONLINE' | 'OFFLINE' | 'CALIBRATING';
export type StationIOType = 'IN' | 'OUT'; // Cân đầu vào (IN) hoặc Cân đầu ra (OUT) của công đoạn

export interface StationWeigh {
  // --- Các trường chuẩn Database PostgreSQL & Prisma (schema.prisma) ---
  stationId: string;           // @map("station_id") @db.VarChar(50) - PK: '10244156', 'ST-01'...
  stationName: string;         // @map("station_name") @db.VarChar(100): 'Trạm cân tôm 01'
  processId: string;           // @map("process_id") @db.VarChar(50) - FK trỏ tới bảng process(process_id)
  hubId?: string | null;       // @map("hub_id") @db.Uuid - Máy Hub quản lý tại xưởng
  indicatorModel: string;      // @map("indicator_model") @db.VarChar(50) - Mặc định 'DINI_ARGEO'
  isActive: boolean;           // @map("is_active") - Trạng thái boolean chuẩn DB (true/false)
  lastSeenAt?: string | null;  // @map("last_seen_at") @db.Timestamptz
  createdAt?: string;          // @map("created_at") @db.Timestamptz

  // --- Hướng cân IN / OUT khớp với production_weight_logs.type_weight ---
  ioType: StationIOType;       // 'IN' (Đầu vào) | 'OUT' (Đầu ra)
  typeWeight?: StationIOType;  // Alias khớp trường type_weight trong PostgreSQL (PMSL.sql)

  // --- Các trường mở rộng cấu hình phần cứng hiển thị trên UI ---
  status: StationStatus;       // 'ONLINE' | 'OFFLINE' | 'CALIBRATING' (đồng bộ với isActive)
  maxWeight: number;           // Tải trọng tối đa Loadcell (kg)
  division: number;            // Độ chia bước nhảy sai số d (g)
  protocol: StationProtocol;   // Giao thức kết nối
  address: string;             // Địa chỉ IP/Port mạng LAN hoặc COM Port
  location?: string;           // Vị trí lắp đặt tại phân xưởng

  // Alias tương thích ngược
  id?: string;
  name?: string;
  model?: string;
  stageId?: string;
}

export type ViewMode = 'table' | 'pipeline';
