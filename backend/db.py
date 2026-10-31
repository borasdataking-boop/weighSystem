import os
import re
import sqlite3
from typing import Any, List, Dict, Optional
from pathlib import Path
from backend.config import DATABASE_URL, DEFAULT_SQLITE_PATH, BASE_DIR

is_postgres = DATABASE_URL.startswith('postgres://') or DATABASE_URL.startswith('postgresql://')

# Kiểm tra và tự động khởi tạo SQLite nếu chưa có file DB
if not is_postgres:
    if not DEFAULT_SQLITE_PATH.exists():
        from database.seed_data import seed_sqlite
        seed_sqlite(DEFAULT_SQLITE_PATH)


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
            conn = sqlite3.connect(DEFAULT_SQLITE_PATH)
            conn.row_factory = sqlite3.Row
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
