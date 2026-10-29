-- ============================================================================
-- PMSL DATABASE INITIALIZATION SCRIPT (PostgreSQL)
-- Database: weigh_dashboard
-- Design: No physical Foreign Keys (Soft Validation via Backend/Service Layer)
-- ============================================================================

-- 1. BẢNG PROCESS (Công đoạn sản xuất)
CREATE TABLE IF NOT EXISTS process (
    process_id VARCHAR(50) PRIMARY KEY,
    process_name VARCHAR(255) NOT NULL,
    flow_title VARCHAR(255),
    col_index INT NOT NULL DEFAULT 1,
    row_index INT NOT NULL DEFAULT 1,
    description TEXT,
    color_bg VARCHAR(20) DEFAULT '#FFFFFF',
    color_border VARCHAR(20) DEFAULT '#CBD5E1',
    color_text VARCHAR(20) DEFAULT '#1E293B',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PROCESS_MAPPING (Mapping luồng quy trình Node -> Node)
CREATE TABLE IF NOT EXISTS process_mapping (
    mapping_id VARCHAR(50) PRIMARY KEY,
    from_process_id VARCHAR(50) NOT NULL,
    to_process_id VARCHAR(50) NOT NULL,
    transition_type VARCHAR(30) NOT NULL DEFAULT 'DIRECT',
    description VARCHAR(255),
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
    hub_id VARCHAR(100),
    indicator_model VARCHAR(50) DEFAULT 'DINI_ARGEO',
    model VARCHAR(100) DEFAULT 'DINI ARGEO DFWL',
    status VARCHAR(20) DEFAULT 'ONLINE',
    is_active BOOLEAN DEFAULT TRUE,
    max_weight NUMERIC(10, 2) DEFAULT 150,
    division NUMERIC(10, 2) DEFAULT 10,
    protocol VARCHAR(20) DEFAULT 'TCP/IP',
    address VARCHAR(100),
    location VARCHAR(255),
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG PRODUCT (Danh mục quy cách sản phẩm theo công đoạn)
CREATE TABLE IF NOT EXISTS product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    type VARCHAR(30) DEFAULT 'SEMI',
    unit VARCHAR(20) DEFAULT 'kg',
    spec TEXT,
    is_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG BATCH (Lô sản xuất)
CREATE TABLE IF NOT EXISTS batch (
    batch_id VARCHAR(50) PRIMARY KEY,
    batch_name VARCHAR(100),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
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
CREATE INDEX IF NOT EXISTS idx_logs_time ON production_weight_logs(time_action);
CREATE INDEX IF NOT EXISTS idx_stations_process ON station_weigh(process_id);
CREATE INDEX IF NOT EXISTS idx_product_stage ON product(stage_id);
