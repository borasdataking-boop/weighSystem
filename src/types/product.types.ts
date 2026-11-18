/**
 * Model Sản phẩm khớp với bảng product và production_weight_logs trong PostgreSQL (PMSL.sql).
 */

export type ProductType = 'FINISHED' | 'SEMI' | 'BYPRODUCT';
export type ProductIOType = 'IN' | 'OUT';

/**
 * Gán sản phẩm vào một công đoạn cụ thể với vai trò Đầu vào (IN) hoặc Đầu ra (OUT).
 * Một sản phẩm có thể được gán cho 1 hoặc nhiều công đoạn (ở đầu vào hoặc đầu ra)
 * mà không bị ràng buộc cứng 1 sản phẩm chỉ thuộc 1 đầu ra.
 */
export interface ProductStageAssignment {
  stageId: string;       // Mã công đoạn: 'CD001', 'CD002'...
  ioType: ProductIOType; // 'IN' (Đầu vào) | 'OUT' (Đầu ra)
}

export interface ProductItem {
  id: string;                             // product_id: 'SP-TN-01', 'SP-001', 'TOM001'...
  name: string;                           // product_name: 'Tôm nguyên liệu tươi sống', 'Tôm HLSO'...
  stageId: string;                        // process_id chính trong quy trình: 'CD001', 'CD002'... hoặc 'UNASSIGNED'
  ioType?: ProductIOType;                 // 'IN' (Đầu vào) | 'OUT' (Đầu ra)
  assignments?: ProductStageAssignment[]; // Danh sách các công đoạn + đầu vào/đầu ra mà sản phẩm được gán
  type: ProductType;                      // 'FINISHED' (thành phẩm), 'SEMI' (bán thành phẩm), 'BYPRODUCT' (phụ phẩm)
  unit: string;                           // 'kg', 'khay', 'túi', 'thùng', 'pallet'...
  spec?: string;                          // Quy cách / Ghi chú kỹ thuật
  isEnd?: boolean;                        // Đánh dấu sản phẩm cuối quy trình
}

