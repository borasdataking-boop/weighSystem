-- ============================================================================
-- PMSL DATABASE INITIALIZATION SCRIPT (SQLite)
-- Sẵn sàng cho PythonAnywhere Free Tier và Local Lightweight Testing
-- ============================================================================

-- 1. BẢNG PROCESS (Công đoạn sản xuất)
CREATE TABLE IF NOT EXISTS process (
    process_id TEXT PRIMARY KEY,
    process_name TEXT NOT NULL,
    flow_title TEXT,
    col_index INTEGER NOT NULL DEFAULT 1,
    row_index INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    color_bg TEXT DEFAULT '#FFEEDB',
    color_border TEXT DEFAULT '#DCA365',
    color_text TEXT DEFAULT '#4A2800',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PROCESS_MAPPING (Mapping luồng quy trình Node -> Node)
CREATE TABLE IF NOT EXISTS process_mapping (
    mapping_id TEXT PRIMARY KEY,
    from_process_id TEXT NOT NULL,
    to_process_id TEXT NOT NULL,
    transition_type TEXT NOT NULL DEFAULT 'DIRECT',
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG STATION_WEIGH (Danh mục trạm cân vật lý trong xưởng)
CREATE TABLE IF NOT EXISTS station_weigh (
    station_id TEXT PRIMARY KEY,
    station_name TEXT NOT NULL,
    process_id TEXT NOT NULL,
    io_type TEXT NOT NULL CHECK (io_type IN ('IN', 'OUT')),
    hub_id TEXT,
    indicator_model TEXT DEFAULT 'DINI_ARGEO',
    model TEXT DEFAULT 'DINI ARGEO DFWL',
    status TEXT DEFAULT 'ONLINE',
    is_active INTEGER DEFAULT 1,
    max_weight REAL DEFAULT 150,
    division REAL DEFAULT 10,
    protocol TEXT DEFAULT 'TCP/IP',
    address TEXT,
    location TEXT,
    last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG PRODUCT (Danh mục quy cách sản phẩm theo công đoạn)
CREATE TABLE IF NOT EXISTS product (
    product_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    stage_id TEXT NOT NULL,
    type TEXT DEFAULT 'SEMI',
    unit TEXT DEFAULT 'kg',
    spec TEXT,
    is_end INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG BATCH (Lô sản xuất)
CREATE TABLE IF NOT EXISTS batch (
    batch_id TEXT PRIMARY KEY,
    batch_name TEXT,
    status TEXT DEFAULT 'IN_PROGRESS',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG PRODUCTION_WEIGHT_LOGS (Nhật ký mẻ cân từ Loadcell/STM32/Dini Argeo)
CREATE TABLE IF NOT EXISTS production_weight_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    station_id TEXT NOT NULL,
    process_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    type_weight TEXT NOT NULL CHECK (type_weight IN ('IN', 'OUT')),
    value_weight REAL NOT NULL,
    tare_weight REAL NOT NULL,
    net_weight REAL NOT NULL,
    time_action TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    employee_id TEXT,
    source_method TEXT
);

-- INDEXES TĂNG TỐC TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_logs_batch ON production_weight_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_logs_station ON production_weight_logs(station_id);
CREATE INDEX IF NOT EXISTS idx_logs_process ON production_weight_logs(process_id);
CREATE INDEX IF NOT EXISTS idx_logs_time ON production_weight_logs(time_action);
CREATE INDEX IF NOT EXISTS idx_stations_process ON station_weigh(process_id);
CREATE INDEX IF NOT EXISTS idx_product_stage ON product(stage_id);
