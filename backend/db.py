import os
import re
import sqlite3
from typing import Any, List, Dict, Optional
from pathlib import Path
from backend.config import DATABASE_URL, DEFAULT_SQLITE_PATH, BASE_DIR

is_postgres = DATABASE_URL.startswith('postgres://') or DATABASE_URL.startswith('postgresql://')

# Kiểm tra và tự động khởi tạo / cập nhật Schema Database khi khởi động
if not is_postgres:
    if not DEFAULT_SQLITE_PATH.exists():
        from database.seed_data import seed_sqlite
        seed_sqlite(DEFAULT_SQLITE_PATH)
else:
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        # Kiểm tra xem DB đã có bảng process chưa; nếu là DB mới tinh thì tự động chạy init + seed
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'process'
            );
        """)
        has_tables = cur.fetchone()[0]
        if not has_tables:
            conn.close()
            from database.seed_data import seed_postgres
            seed_postgres(DATABASE_URL)
        else:
            # Nếu DB đã có sẵn trên máy: tự động cập nhật schema/cột mới (không ghi đè dữ liệu cũ)
            init_sql_path = BASE_DIR / 'database' / 'init_db.sql'
            if init_sql_path.exists():
                with open(init_sql_path, 'r', encoding='utf-8') as f:
                    cur.execute(f.read())
            for alter_sql in [
                "ALTER TABLE product ADD COLUMN IF NOT EXISTS io_type VARCHAR(10) DEFAULT 'OUT'",
                "ALTER TABLE product ADD COLUMN IF NOT EXISTS assignments_json TEXT",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS planned_weight NUMERIC(12, 3) DEFAULT 0",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS start_date VARCHAR(30)",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS origin VARCHAR(150)",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS notes TEXT"
            ]:
                cur.execute(alter_sql)
            conn.commit()
            conn.close()
    except Exception as _pg_init_err:
        print(f"⚠️ [PostgreSQL Auto-Check] Không thể tự động kiểm tra schema: {_pg_init_err}")


class Database:
    def __init__(self):
        self.is_postgres = is_postgres
        self.db_url = DATABASE_URL

    def get_connection(self):
        if self.is_postgres:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            conn = psycopg2.connect(self.db_url)
            return conn
        else:
            conn = sqlite3.connect(DEFAULT_SQLITE_PATH, timeout=10.0)
            conn.row_factory = sqlite3.Row
            # Kích hoạt WAL mode và busy timeout để hỗ trợ 200 - 300 requests ghi đồng thời không bị lỗi database locked
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA busy_timeout = 5000;")
            conn.execute("PRAGMA synchronous = NORMAL;")
            return conn

    def _convert_sql(self, sql: str) -> str:
        """Chuẩn hóa cú pháp tham số giữa PostgreSQL ($1, %s) và SQLite (?)"""
        if self.is_postgres:
            # Chuyển $1, $2 -> %s cho psycopg2 nếu có
            return re.sub(r'\$\d+', '%s', sql)
        else:
            # Chuyển %s hoặc $1 -> ? cho SQLite
            sql_converted = re.sub(r'\$\d+', '?', sql)
            sql_converted = sql_converted.replace('%s', '?')
            # SQLite không hỗ trợ CURRENT_TIMESTAMP với múi giờ, giữ nguyên cú pháp
            sql_converted = sql_converted.replace('TIMESTAMPTZ', 'TEXT')
            return sql_converted

    def query_all(self, sql: str, params: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            converted_sql = self._convert_sql(sql)
            if self.is_postgres:
                from psycopg2.extras import RealDictCursor
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(converted_sql, params or [])
                    rows = cur.fetchall()
                    return [dict(r) for r in rows]
            else:
                cur = conn.cursor()
                cur.execute(converted_sql, params or [])
                rows = cur.fetchall()
                return [dict(r) for r in rows]
        finally:
            conn.close()

    def query_one(self, sql: str, params: Optional[List[Any]] = None) -> Optional[Dict[str, Any]]:
        rows = self.query_all(sql, params)
        return rows[0] if rows else None

    def execute(self, sql: str, params: Optional[List[Any]] = None) -> None:
        conn = self.get_connection()
        try:
            converted_sql = self._convert_sql(sql)
            cur = conn.cursor()
            cur.execute(converted_sql, params or [])
            conn.commit()
        finally:
            conn.close()

    def execute_returning(self, sql: str, params: Optional[List[Any]] = None) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            converted_sql = self._convert_sql(sql)
            if self.is_postgres:
                from psycopg2.extras import RealDictCursor
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(converted_sql, params or [])
                    row = cur.fetchone()
                    conn.commit()
                    return dict(row) if row else None
            else:
                cur = conn.cursor()
                try:
                    cur.execute(converted_sql, params or [])
                    row = cur.fetchone()
                    conn.commit()
                    return dict(row) if row else None
                except Exception:
                    # Fallback cho SQLite cũ không hỗ trợ RETURNING
                    clean_sql = re.sub(r'\s+RETURNING\s+.*$', '', converted_sql, flags=re.IGNORECASE | re.DOTALL).strip()
                    cur.execute(clean_sql, params or [])
                    last_id = cur.lastrowid
                    conn.commit()
                    if last_id:
                        cur.execute("SELECT * FROM production_weight_logs WHERE log_id = ?", [last_id])
                        row = cur.fetchone()
                        return dict(row) if row else None
                    return None
        finally:
            conn.close()


db = Database()
