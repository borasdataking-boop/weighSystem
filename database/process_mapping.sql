-- ============================================================================
-- PMSL DATABASE SCHEMA: QUẢN LÝ QUY TRÌNH CHẾ BIẾN & BẢNG PHỤ MAPPING NODE -> NODE
-- ============================================================================
-- Triết lý thiết kế (Design Philosophy):
-- 1. TUYỆT ĐỐI KHÔNG DÙNG KHÓA NGOẠI VẬT LÝ (No Physical Foreign Keys).
--    Tránh fix cứng tầng vật lý gây crash, deadlock hoặc lỗi schema khi sửa đổi node.
-- 2. Toàn vẹn dữ liệu (Data Integrity) & quan hệ Node -> Node được kiểm soát hoàn toàn
--    bằng các hàm Soft Validation ở tầng Backend / Service Layer.
-- 3. Vẫn giữ Primary Key và Indexes để tối ưu hóa tốc độ truy vấn SELECT/JOIN.
-- ============================================================================

-- DỌN DẸP NẾU TRƯỚC ĐÓ ĐÃ TỒN TẠI KHÓA NGOẠI CŨ
ALTER TABLE IF EXISTS process_mapping DROP CONSTRAINT IF EXISTS fk_process_mapping_from;
ALTER TABLE IF EXISTS process_mapping DROP CONSTRAINT IF EXISTS fk_process_mapping_to;

-- 1. BẢNG CHÍNH: process (Danh mục các công đoạn sản xuất)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS process (
    process_id VARCHAR(50) PRIMARY KEY,              -- Mã công đoạn (Logical ID: 'CD001', 'CD002', ...)
    process_name VARCHAR(255) NOT NULL,              -- Tên tiếng Việt
    flow_title VARCHAR(255),                         -- Tiêu đề sơ đồ quy trình
    col_index INT NOT NULL DEFAULT 1,                -- Cột trên đồ thị (1..4)
    row_index INT NOT NULL DEFAULT 1,                -- Hàng trên đồ thị (1..10)
    description TEXT,                                -- Mô tả chi tiết kỹ thuật của công đoạn
    color_bg VARCHAR(20) DEFAULT '#FFFFFF',          -- Mã màu nền UI
    color_border VARCHAR(20) DEFAULT '#CBD5E1',      -- Mã màu viền UI
    color_text VARCHAR(20) DEFAULT '#1E293B',        -- Mã màu chữ UI
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         -- Trạng thái kích hoạt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE process IS 'Bảng chính lưu danh mục công đoạn (Không ràng buộc khóa ngoại)';


-- 2. BẢNG PHỤ: process_mapping (Mapping liên kết Node -> Node thuần túy logic)
-- ----------------------------------------------------------------------------
-- Lưu ý: from_process_id và to_process_id là chuỗi định danh độc lập, KHÔNG DÙNG FOREIGN KEY.
CREATE TABLE IF NOT EXISTS process_mapping (
    mapping_id VARCHAR(50) PRIMARY KEY,              -- Khóa chính: 'MAP001', 'MAP002', ...
    from_process_id VARCHAR(50) NOT NULL,            -- Node nguồn (Logical Key, không ép Foreign Key)
    to_process_id VARCHAR(50) NOT NULL,              -- Node đích (Logical Key, không ép Foreign Key)
    transition_type VARCHAR(30) NOT NULL DEFAULT 'DIRECT', -- 'DIRECT' | 'BYPASS' | 'BRANCH'
    description VARCHAR(255),                        -- Ghi chú luồng chuyển tiếp
    order_index INT NOT NULL DEFAULT 0,              -- Thứ tự ưu tiên xử lý / hiển thị
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         -- Bật / tắt luồng chuyển tiếp này
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE process_mapping IS 'Bảng phụ định nghĩa quan hệ Node -> Node (Không khóa ngoại vật lý)';
COMMENT ON COLUMN process_mapping.from_process_id IS 'Mã node nguồn (Backend tự validate logic)';
COMMENT ON COLUMN process_mapping.to_process_id IS 'Mã node đích (Backend tự validate logic)';


-- 3. CHỈ MỤC (INDEXES) TỐI ƯU HÓA TRUY VẤN
-- (Chỉ mục giúp tăng tốc JOIN & tìm kiếm mà không khóa ràng buộc bảng)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_process_mapping_from ON process_mapping(from_process_id);
CREATE INDEX IF NOT EXISTS idx_process_mapping_to ON process_mapping(to_process_id);
CREATE INDEX IF NOT EXISTS idx_process_mapping_active ON process_mapping(is_active);


-- 4. VIEW TIỆN ÍCH: v_process_flow_graph (LEFT JOIN mềm, không crash kể cả khi khuyết node)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_process_flow_graph AS
SELECT 
    pm.mapping_id,
    pm.from_process_id,
    COALESCE(p_from.process_name, pm.from_process_id) AS from_process_name,
    p_from.flow_title AS from_flow_title,
    pm.to_process_id,
    COALESCE(p_to.process_name, pm.to_process_id) AS to_process_name,
    p_to.flow_title AS to_flow_title,
    pm.transition_type,
    pm.description,
    pm.order_index,
    pm.is_active
FROM process_mapping pm
LEFT JOIN process p_from ON pm.from_process_id = p_from.process_id
LEFT JOIN process p_to ON pm.to_process_id = p_to.process_id
ORDER BY pm.order_index ASC, pm.mapping_id ASC;


-- 5. SEED DỮ LIỆU KHỞI TẠO: 15 CÔNG ĐOẠN CHUẨN
-- ----------------------------------------------------------------------------
INSERT INTO process (process_id, process_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text)
VALUES
    ('CD001', 'Tiếp nhận nguyên liệu', 'Material Receiving', 1, 1, 'Kiểm tra chất lượng và tiếp nhận tôm nguyên liệu đầu vào', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD002', 'Rửa 1 & Phân cỡ sơ bộ', 'Grading & Sizing', 1, 2, 'Rửa sạch tạp chất và phân loại tôm theo kích cỡ tiêu chuẩn', '#FCE2E6', '#DF8F9B', '#4A0814'),
    ('CD003', 'Xếp khuôn & Định lượng', 'Stacking & Batching', 1, 3, 'Xếp khuôn định hình và cân định lượng theo mẻ', '#F0E8F7', '#BFA0D8', '#3B0D59'),
    ('CD004', 'Sơ chế (Bóc vỏ & Rút chỉ)', 'Peeling & Deveining', 1, 4, 'Bóc vỏ, vặt đầu hoặc rút chỉ lưng theo quy cách', '#E3F7E3', '#8EC68E', '#0E440E'),
    ('CD005', 'Ngâm xử lý phụ gia', 'Soaking Process', 1, 5, 'Ngâm xử lý phụ gia theo quy chuẩn an toàn thực phẩm', '#FCE3DF', '#E89184', '#5C140A'),
    ('CD006', 'Định hình Nobashi / Xẻ bướm', 'Nobashi & Butterfly', 1, 6, 'Định hình tôm duỗi thẳng Nobashi hoặc xẻ bướm', '#E9F1FC', '#9BBCE8', '#0B2F5C'),
    ('CD007', 'Tẩm bột chiên xù', 'Breading Process', 1, 7, 'Tẩm bột Panko hoặc bột tẩm gia vị tiêu chuẩn', '#E4E8EF', '#8E9BB0', '#1A2634'),
    ('CD008', 'Chiên định hình dầu nóng', 'Breaded Frying', 1, 8, 'Chiên định hình qua dầu nhiệt độ cao tạo độ giòn', '#DCF7F7', '#78D1D1', '#073B3B'),
    ('CD009', 'Luộc / Hấp tôm nõn (PD)', 'PD Cooking', 2, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm thịt PD', '#BDF0F0', '#5ECACA', '#073B3B'),
    ('CD010', 'Luộc / Hấp tôm vỏ (HLSO)', 'HLSO Cooking', 3, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm còn vỏ HLSO', '#BDF0F0', '#5ECACA', '#073B3B'),
    ('CD011', 'Tách vỏ sau luộc', 'Peel After Cook', 3, 9, 'Bóc vỏ tôm sau khi luộc chín phục vụ chế biến salad', '#FDF8C7', '#DAC448', '#4D4004'),
    ('CD012', 'Cấp đông xoắn tôm tươi', 'Raw Spiral Freezer', 1, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm tươi', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD013', 'Cấp đông xoắn tôm chiên', 'Fried Spiral Freezer', 2, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm chiên', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD014', 'Cấp đông IQF tôm tươi', 'Raw IQF Freezer', 3, 10, 'Cấp đông siêu tốc rời IQF và mạ băng tôm tươi', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD015', 'Cấp đông IQF tôm chín', 'Cooked IQF Freezer', 4, 10, 'Cấp đông siêu tốc rời IQF đối với sản phẩm tôm chín', '#FFEEDB', '#DCA365', '#4A2800')
ON CONFLICT (process_id) DO UPDATE 
SET 
    process_name = EXCLUDED.process_name,
    flow_title = EXCLUDED.flow_title,
    col_index = EXCLUDED.col_index,
    row_index = EXCLUDED.row_index,
    description = EXCLUDED.description;


-- 6. SEED DỮ LIỆU KHỞI TẠO: 17 LIÊN KẾT NODE -> NODE
-- ----------------------------------------------------------------------------
INSERT INTO process_mapping (mapping_id, from_process_id, to_process_id, transition_type, description, order_index, is_active)
VALUES
    ('MAP001', 'CD001', 'CD002', 'DIRECT', 'Tiếp nhận nguyên liệu -> Rửa 1 & Phân cỡ sơ bộ', 1, TRUE),
    ('MAP002', 'CD002', 'CD003', 'DIRECT', 'Rửa 1 & Phân cỡ sơ bộ -> Xếp khuôn & Định lượng', 2, TRUE),
    ('MAP003', 'CD003', 'CD004', 'DIRECT', 'Xếp khuôn & Định lượng -> Sơ chế (Bóc vỏ & Rút chỉ)', 3, TRUE),
    ('MAP004', 'CD003', 'CD005', 'BYPASS', 'Xếp khuôn & Định lượng -> Ngâm xử lý (Vượt cấp sơ chế)', 4, TRUE),
    ('MAP005', 'CD004', 'CD005', 'DIRECT', 'Sơ chế (Bóc vỏ & Rút chỉ) -> Ngâm xử lý phụ gia', 5, TRUE),
    ('MAP006', 'CD005', 'CD006', 'DIRECT', 'Ngâm xử lý phụ gia -> Định hình Nobashi / Xẻ bướm', 6, TRUE),
    ('MAP007', 'CD005', 'CD009', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm nõn (PD)', 7, TRUE),
    ('MAP008', 'CD005', 'CD010', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm vỏ (HLSO)', 8, TRUE),
    ('MAP009', 'CD005', 'CD014', 'BRANCH', 'Ngâm xử lý phụ gia -> Cấp đông IQF tôm tươi', 9, TRUE),
    ('MAP010', 'CD006', 'CD007', 'DIRECT', 'Định hình Nobashi / Xẻ bướm -> Tẩm bột chiên xù', 10, TRUE),
    ('MAP011', 'CD007', 'CD008', 'DIRECT', 'Tẩm bột chiên xù -> Chiên định hình dầu nóng', 11, TRUE),
    ('MAP012', 'CD008', 'CD012', 'DIRECT', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm tươi', 12, TRUE),
    ('MAP013', 'CD008', 'CD013', 'BRANCH', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm chiên', 13, TRUE),
    ('MAP014', 'CD009', 'CD013', 'DIRECT', 'Luộc / Hấp tôm nõn (PD) -> Cấp đông xoắn tôm chiên', 14, TRUE),
    ('MAP015', 'CD010', 'CD011', 'DIRECT', 'Luộc / Hấp tôm vỏ (HLSO) -> Tách vỏ sau luộc', 15, TRUE),
    ('MAP016', 'CD011', 'CD014', 'DIRECT', 'Tách vỏ sau luộc -> Cấp đông IQF tôm tươi', 16, TRUE),
    ('MAP017', 'CD011', 'CD015', 'BRANCH', 'Tách vỏ sau luộc -> Cấp đông IQF tôm chín', 17, TRUE)
ON CONFLICT (mapping_id) DO UPDATE
SET 
    from_process_id = EXCLUDED.from_process_id,
    to_process_id = EXCLUDED.to_process_id,
    transition_type = EXCLUDED.transition_type,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;
