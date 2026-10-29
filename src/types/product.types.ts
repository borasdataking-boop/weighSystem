/**
 * Model Sản phẩm khớp với bảng product và production_weight_logs trong PostgreSQL (PMSL.sql).
 */

export type ProductType = 'FINISHED' | 'SEMI' | 'BYPRODUCT';

export interface ProductItem {
  id: string;          // product_id: 'SP-TN-01', 'SP-001'...
  name: string;        // product_name
  stageId: string;     // process_id tương ứng trong quy trình: 'CD001', 'CD002'...
  type: ProductType;   // 'FINISHED' (thành phẩm), 'SEMI' (bán thành phẩm), 'BYPRODUCT' (phụ phẩm)
  unit: string;        // 'kg', 'khay', 'túi', 'thùng', 'pallet'...
  spec?: string;       // Quy cách / Ghi chú kỹ thuật
}
