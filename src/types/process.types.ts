/**
 * Model Công đoạn khớp 100% với sơ đồ processflow.jpg (10 Steps, 15 Nodes)
 * và bảng process trong PostgreSQL (PMSL.sql).
 */

export interface ProcessStage {
  processId: string;    // @map("process_id") PK: 'CD001', 'CD002'...
  processName: string;  // Tên tiếng Việt: 'Tiếp nhận tôm', 'Phân cỡ & Phân loại'...
  flowTitle: string;    // Tiêu đề chuẩn ảnh: '1. Material Receiving', '3. Grading'...
  col: number;          // 1..4 (Cột trên sơ đồ)
  row: number;          // 1..10 (Hàng trên sơ đồ)
  desc?: string;        // Mô tả công đoạn
  color?: {
    bg: string;
    border: string;
    text: string;
  };

  // Aliases hỗ trợ tương thích UI
  id?: string;
  name?: string;
  step?: string;
}

export interface StepItem {
  step: string;
  label: string;
  bg: string;
  border: string;
  text: string;
}

export interface FlowConnection {
  from: string;
  fromPort: 'top' | 'bottom' | 'left' | 'right';
  to: string;
  toPort: 'top' | 'bottom' | 'left' | 'right';
  type: string;
}

/**
 * Bảng phụ mapping process (Node -> Node)
 * Tự tham chiếu với chính bảng process (from_process_id -> to_process_id)
 */
export interface ProcessMapping {
  id: string;               // PK: 'MAP001', 'MAP002'...
  fromProcessId: string;    // FK -> process(process_id)
  toProcessId: string;      // FK -> process(process_id)
  transitionType?: 'DIRECT' | 'BYPASS' | 'BRANCH'; // Loại kết nối
  description?: string;     // Ghi chú luồng chuyển tiếp
  orderIndex?: number;      // Thứ tự hiển thị
  isActive?: boolean;       // Trạng thái bật/tắt
  createdAt?: string;
  updatedAt?: string;
}

export type ProcessFilter = 'ALL' | 'UNASSIGNED' | string;
