-- ============================================================================
-- PMSL DATABASE INITIALIZATION SCRIPT (PostgreSQL 14 - 18)
-- Chuẩn hóa 100% với Frontend React (WeighStation, Process, Product, Overview)
-- ============================================================================

-- 1. BẢNG PROCESS (Công đoạn sản xuất - 15 Nodes)
CREATE TABLE IF NOT EXISTS process (
    process_id VARCHAR(50) PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    flow_title VARCHAR(100),
    col_index INT NOT NULL DEFAULT 1,
    row_index INT NOT NULL DEFAULT 1,
    description TEXT,
    color_bg VARCHAR(20) DEFAULT '#FFEEDB',
    color_border VARCHAR(20) DEFAULT '#DCA365',
    color_text VARCHAR(20) DEFAULT '#4A2800',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PROCESS_MAPPING (Mapping luồng quy trình Node -> Node)
CREATE TABLE IF NOT EXISTS process_mapping (
    mapping_id VARCHAR(50) PRIMARY KEY,
    from_process_id VARCHAR(50) NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
    to_process_id VARCHAR(50) NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
    transition_type VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG STATION_WEIGH (Danh mục trạm cân vật lý trong xưởng)
CREATE TABLE IF NOT EXISTS station_weigh (
    station_id VARCHAR(50) PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    process_id VARCHAR(50) NOT NULL,
    io_type VARCHAR(10) NOT NULL CHECK (io_type IN ('IN', 'OUT')),
    hub_id UUID,
    indicator_model VARCHAR(50) DEFAULT 'DINI_ARGEO',
    model VARCHAR(100) DEFAULT 'DINI ARGEO DFWL',
    status VARCHAR(20) DEFAULT 'ONLINE',
    is_active BOOLEAN DEFAULT TRUE,
    max_weight NUMERIC(10, 2) DEFAULT 150,
    division NUMERIC(10, 2) DEFAULT 10,
    protocol VARCHAR(30) DEFAULT 'TCP/IP',
    address VARCHAR(100),
    location VARCHAR(255),
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG PRODUCT (Danh mục quy cách sản phẩm)
CREATE TABLE IF NOT EXISTS product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    io_type VARCHAR(10) DEFAULT 'OUT',
    assignments_json TEXT,
    type VARCHAR(30) DEFAULT 'SEMI',
    unit VARCHAR(20) DEFAULT 'kg',
    spec TEXT,
    is_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4B. BẢNG PRODUCT_STAGE_MAPPING (Liên kết N-N giữa Sản phẩm và Công đoạn Đầu vào IN / Đầu ra OUT)
CREATE TABLE IF NOT EXISTS product_stage_mapping (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    process_id VARCHAR(50) NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
    io_type VARCHAR(10) NOT NULL CHECK (io_type IN ('IN', 'OUT')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, process_id, io_type)
);

-- 5. BẢNG BATCH (Lô sản xuất)
CREATE TABLE IF NOT EXISTS batch (
    batch_id VARCHAR(50) PRIMARY KEY,
    batch_name VARCHAR(100),
    planned_weight NUMERIC(12, 3) DEFAULT 0,
    start_date VARCHAR(30),
    origin VARCHAR(150),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG PRODUCTION_WEIGHT_LOGS (Nhật ký mẻ cân từ Loadcell/STM32/Dini Argeo)
CREATE TABLE IF NOT EXISTS production_weight_logs (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL,
    process_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    type_weight VARCHAR(10) NOT NULL CHECK (type_weight IN ('IN', 'OUT')),
    value_weight NUMERIC(12, 3) NOT NULL,
    tare_weight NUMERIC(12, 3) NOT NULL,
    net_weight NUMERIC(12, 3) NOT NULL,
    time_action TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    employee_id VARCHAR(50),
    source_method VARCHAR(50)
);

-- INDEXES TĂNG TỐC TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_logs_batch ON production_weight_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_logs_station ON production_weight_logs(station_id);
CREATE INDEX IF NOT EXISTS idx_logs_process ON production_weight_logs(process_id);
CREATE INDEX IF NOT EXISTS idx_logs_product ON production_weight_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_logs_time ON production_weight_logs(time_action);
CREATE INDEX IF NOT EXISTS idx_stations_process ON station_weigh(process_id);
CREATE INDEX IF NOT EXISTS idx_product_stage ON product(stage_id);
CREATE INDEX IF NOT EXISTS idx_psm_product ON product_stage_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_psm_process ON product_stage_mapping(process_id, io_type);
