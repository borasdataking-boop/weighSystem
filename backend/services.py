"""
Business & Data Service Layer (Python)
Tương thích 100% với backend/node/src/services/dbDataService.ts
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.db import db


class DBDataService:
    # ==========================================
    # 1. QUY TRÌNH & MAPPING
    # ==========================================
    def get_processes(self) -> Dict[str, Any]:
        active_cond = "is_active = TRUE" if db.is_postgres else "is_active = 1"
        stage_rows = db.query_all(
            f"SELECT * FROM process WHERE {active_cond} ORDER BY row_index ASC, col_index ASC, process_id ASC"
        )
        mapping_rows = db.query_all(
            f"SELECT * FROM process_mapping WHERE {active_cond} ORDER BY order_index ASC"
        )

        stages = []
        for r in stage_rows:
            stages.append({
                'processId': r.get('process_id'),
                'processName': r.get('process_name'),
                'id': r.get('process_id'),
                'name': r.get('process_name'),
                'flowTitle': r.get('flow_title'),
                'colIndex': r.get('col_index', 1),
                'rowIndex': r.get('row_index', 1),
                'description': r.get('description'),
                'colorBg': r.get('color_bg'),
                'colorBorder': r.get('color_border'),
                'colorText': r.get('color_text'),
                'isActive': bool(r.get('is_active', True))
            })

        mappings = []
        for m in mapping_rows:
            mappings.append({
                'mappingId': m.get('mapping_id'),
                'fromProcessId': m.get('from_process_id'),
                'toProcessId': m.get('to_process_id'),
                'transitionType': m.get('transition_type', 'DIRECT'),
                'description': m.get('description'),
                'orderIndex': m.get('order_index', 0),
                'isActive': bool(m.get('is_active', True))
            })

        return {'stages': stages, 'mappings': mappings}

    def add_process(self, p: Dict[str, Any]) -> None:
        p_id = p.get('processId') or p.get('id')
        p_name = p.get('processName') or p.get('name')
        flow_title = p.get('flowTitle')
        col_index = p.get('colIndex', 1)
        row_index = p.get('rowIndex', 1)
        description = p.get('description')
        color_bg = p.get('colorBg', '#FFEEDB')
        color_border = p.get('colorBorder', '#DCA365')
        color_text = p.get('colorText', '#4A2800')
        is_active = bool(p.get('isActive', True)) if db.is_postgres else (1 if p.get('isActive', True) else 0)

        # Kiểm tra tồn tại
        existing = db.query_one("SELECT process_id FROM process WHERE process_id = %s", [p_id])
        if existing:
            sql = """
                UPDATE process SET 
                  process_name = %s, flow_title = %s, col_index = %s, row_index = %s, 
                  description = %s, color_bg = %s, color_border = %s, color_text = %s, is_active = %s
                WHERE process_id = %s
            """
            db.execute(sql, [p_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text, is_active, p_id])
        else:
            sql = """
                INSERT INTO process 
                (process_id, process_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            db.execute(sql, [p_id, p_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text, is_active])

    def delete_process(self, process_id: str) -> None:
        db.execute("DELETE FROM process WHERE process_id = %s", [process_id])
        db.execute("DELETE FROM process_mapping WHERE from_process_id = %s OR to_process_id = %s", [process_id, process_id])

    # ==========================================
    # 2. TRẠM CÂN (station_weigh)
    # ==========================================
    def get_stations(self) -> List[Dict[str, Any]]:
        rows = db.query_all("SELECT * FROM station_weigh ORDER BY station_id ASC")
        result = []
        for r in rows:
            result.append({
                'stationId': r.get('station_id'),
                'stationName': r.get('station_name'),
                'id': r.get('station_id'),
                'name': r.get('station_name'),
                'processId': r.get('process_id'),
                'stageId': r.get('process_id'),
                'ioType': r.get('io_type'),
                'typeWeight': r.get('io_type'),
                'hubId': r.get('hub_id'),
                'indicatorModel': r.get('indicator_model'),
                'model': r.get('model'),
                'status': r.get('status'),
                'isActive': bool(r.get('is_active', True)),
                'maxWeight': float(r.get('max_weight') or 150),
                'division': float(r.get('division') or 10),
                'protocol': r.get('protocol'),
                'address': r.get('address'),
                'location': r.get('location'),
                'lastSeenAt': str(r.get('last_seen_at')) if r.get('last_seen_at') else None,
                'createdAt': str(r.get('created_at')) if r.get('created_at') else None
            })
        return result

    def add_station(self, s: Dict[str, Any]) -> None:
        s_id = s.get('stationId') or s.get('id')
        s_name = s.get('stationName') or s.get('name')
        p_id = s.get('processId') or s.get('stageId') or 'CD001'
        io_type = s.get('ioType') or s.get('typeWeight') or 'IN'
        indicator_model = s.get('indicatorModel', 'DINI_ARGEO')
        model = s.get('model', 'DINI ARGEO DFWL')
        status = s.get('status', 'ONLINE')
        is_active = bool(s.get('isActive', True)) if db.is_postgres else (1 if s.get('isActive', True) else 0)
        max_weight = float(s.get('maxWeight') or 150)
        division = float(s.get('division') or 10)
        protocol = s.get('protocol', 'TCP/IP')
        address = s.get('address', '192.168.1.100:8000')
        location = s.get('location', '')

        existing = db.query_one("SELECT station_id FROM station_weigh WHERE station_id = %s", [s_id])
        if existing:
            sql = """
                UPDATE station_weigh SET 
                  station_name = %s, process_id = %s, io_type = %s, indicator_model = %s,
                  model = %s, status = %s, is_active = %s, max_weight = %s, division = %s,
                  protocol = %s, address = %s, location = %s
                WHERE station_id = %s
            """
            db.execute(sql, [s_name, p_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location, s_id])
        else:
            sql = """
                INSERT INTO station_weigh 
                (station_id, station_name, process_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            db.execute(sql, [s_id, s_name, p_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location])

    def update_station(self, s: Dict[str, Any]) -> None:
        self.add_station(s)

    def delete_station(self, station_id: str) -> None:
        db.execute("DELETE FROM station_weigh WHERE station_id = %s", [station_id])

    # ==========================================
    # 3. SẢN PHẨM (product & product_stage_mapping)
    # ==========================================
    def _ensure_product_columns(self) -> None:
        if getattr(self, '_product_cols_checked', False):
            return
        if db.is_postgres:
            sqls = [
                "ALTER TABLE product ADD COLUMN IF NOT EXISTS io_type VARCHAR(10) DEFAULT 'OUT'",
                "ALTER TABLE product ADD COLUMN IF NOT EXISTS assignments_json TEXT",
                """
                CREATE TABLE IF NOT EXISTS product_stage_mapping (
                    id SERIAL PRIMARY KEY,
                    product_id VARCHAR(50) NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
                    process_id VARCHAR(50) NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
                    io_type VARCHAR(10) NOT NULL CHECK (io_type IN ('IN', 'OUT')),
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(product_id, process_id, io_type)
                )
                """
            ]
        else:
            sqls = [
                "ALTER TABLE product ADD COLUMN io_type TEXT DEFAULT 'OUT'",
                "ALTER TABLE product ADD COLUMN assignments_json TEXT",
                """
                CREATE TABLE IF NOT EXISTS product_stage_mapping (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id TEXT NOT NULL,
                    process_id TEXT NOT NULL,
                    io_type TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(product_id, process_id, io_type)
                )
                """
            ]
        for sql in sqls:
            try:
                db.execute(sql)
            except Exception:
                pass
        self._product_cols_checked = True

    def get_products(self) -> List[Dict[str, Any]]:
        import json
        self._ensure_product_columns()
        rows = db.query_all("SELECT * FROM product ORDER BY stage_id ASC, product_id ASC")

        # Lấy toàn bộ liên kết N-N từ bảng product_stage_mapping
        mapping_map: Dict[str, List[Dict[str, str]]] = {}
        try:
            mapping_rows = db.query_all(
                "SELECT product_id, process_id, io_type FROM product_stage_mapping ORDER BY id ASC"
            )
            for mr in mapping_rows:
                pid = str(mr.get('product_id') or '')
                proc_id = str(mr.get('process_id') or '')
                io = 'IN' if str(mr.get('io_type') or '').upper() == 'IN' else 'OUT'
                if pid and proc_id:
                    mapping_map.setdefault(pid, []).append({'stageId': proc_id, 'ioType': io})
        except Exception:
            pass

        result = []
        for r in rows:
            p_id = r.get('product_id')
            stage_id = r.get('stage_id') or 'UNASSIGNED'
            io_type = r.get('io_type') or 'OUT'

            # Ưu tiên lấy từ bảng liên kết product_stage_mapping, fallback sang assignments_json
            assignments = mapping_map.get(p_id)
            if assignments is None:
                assignments_raw = r.get('assignments_json')
                if assignments_raw:
                    try:
                        parsed = json.loads(assignments_raw)
                        if isinstance(parsed, list):
                            assignments = parsed
                    except Exception:
                        assignments = None

            if assignments is None:
                assignments = [{'stageId': stage_id, 'ioType': io_type}] if stage_id and stage_id != 'UNASSIGNED' else []

            result.append({
                'id': p_id,
                'name': r.get('product_name'),
                'stageId': assignments[0]['stageId'] if assignments else 'UNASSIGNED',
                'ioType': assignments[0]['ioType'] if assignments else io_type,
                'assignments': assignments,
                'type': r.get('type') or 'SEMI',
                'unit': r.get('unit') or 'kg',
                'spec': r.get('spec') or '',
                'isEnd': bool(r.get('is_end', False))
            })
        return result

    def add_product(self, p: Dict[str, Any]) -> None:
        import json
        self._ensure_product_columns()
        p_id = p.get('id') or p.get('product_id')
        name = p.get('name') or p.get('product_name')
        raw_assignments = p.get('assignments')
        clean_assignments = None
        if isinstance(raw_assignments, list):
            clean_assignments = []
            seen = set()
            for a in raw_assignments:
                if not isinstance(a, dict):
                    continue
                st_id = str(a.get('stageId') or '').strip()
                if not st_id or st_id == 'UNASSIGNED':
                    continue
                io = 'IN' if str(a.get('ioType') or '').upper() == 'IN' else 'OUT'
                key = f"{st_id}__{io}"
                if key not in seen:
                    seen.add(key)
                    clean_assignments.append({'stageId': st_id, 'ioType': io})

        if clean_assignments is not None and len(clean_assignments) > 0:
            stage_id = clean_assignments[0]['stageId']
            io_type = clean_assignments[0]['ioType']
        elif clean_assignments is not None and len(clean_assignments) == 0:
            stage_id = p.get('stageId') or p.get('stage_id') or 'UNASSIGNED'
            io_type = p.get('ioType') or p.get('io_type') or 'OUT'
            if stage_id != 'UNASSIGNED':
                clean_assignments = [{'stageId': stage_id, 'ioType': io_type}]
        else:
            stage_id = p.get('stageId') or p.get('stage_id') or 'CD001'
            io_type = p.get('ioType') or p.get('io_type') or 'OUT'
            clean_assignments = [{'stageId': stage_id, 'ioType': io_type}] if stage_id != 'UNASSIGNED' else []

        assignments_json = json.dumps(clean_assignments, ensure_ascii=False)
        p_type = p.get('type', 'SEMI')
        unit = p.get('unit', 'kg')
        spec = p.get('spec', '')
        is_end_flag = bool(p.get('isEnd') or p.get('is_end'))
        is_end = is_end_flag if db.is_postgres else (1 if is_end_flag else 0)

        existing = db.query_one("SELECT product_id FROM product WHERE product_id = %s", [p_id])
        if existing:
            sql = """
                UPDATE product SET 
                  product_name = %s, stage_id = %s, io_type = %s, assignments_json = %s,
                  type = %s, unit = %s, spec = %s, is_end = %s
                WHERE product_id = %s
            """
            db.execute(sql, [name, stage_id, io_type, assignments_json, p_type, unit, spec, is_end, p_id])
        else:
            sql = """
                INSERT INTO product (product_id, product_name, stage_id, io_type, assignments_json, type, unit, spec, is_end)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            db.execute(sql, [p_id, name, stage_id, io_type, assignments_json, p_type, unit, spec, is_end])

        # Đồng bộ bảng quan hệ N-N product_stage_mapping
        try:
            db.execute("DELETE FROM product_stage_mapping WHERE product_id = %s", [p_id])
            for a in clean_assignments:
                db.execute(
                    "INSERT INTO product_stage_mapping (product_id, process_id, io_type) VALUES (%s, %s, %s)",
                    [p_id, a['stageId'], a['ioType']]
                )
        except Exception:
            pass

    def delete_product(self, product_id: str) -> None:
        try:
            db.execute("DELETE FROM product_stage_mapping WHERE product_id = %s", [product_id])
        except Exception:
            pass
        db.execute("DELETE FROM product WHERE product_id = %s", [product_id])

    # ==========================================
    # 4. NHẬT KÝ MẺ CÂN (production_weight_logs)
    # ==========================================
    def get_logs(self, batch_id: Optional[str] = None) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM production_weight_logs"
        params = []
        if batch_id and batch_id != 'ALL':
            sql += " WHERE batch_id = %s"
            params.append(batch_id)
        sql += " ORDER BY time_action DESC, log_id DESC"

        rows = db.query_all(sql, params)
        result = []
        for r in rows:
            result.append({
                'log_id': int(r.get('log_id') or 0),
                'batch_id': r.get('batch_id'),
                'station_id': r.get('station_id'),
                'process_id': r.get('process_id'),
                'product_id': r.get('product_id'),
                'type_weight': r.get('type_weight'),
                'value_weight': float(r.get('value_weight') or 0),
                'tare_weight': float(r.get('tare_weight') or 0),
                'net_weight': float(r.get('net_weight') or 0),
                'time_action': str(r.get('time_action') or ''),
                'employee_id': r.get('employee_id'),
                'source_method': r.get('source_method')
            })
        return result

    def create_log(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        station_id = str(input_data.get('station_id', ''))
        val = float(input_data.get('value_weight') or 0.0)
        tare = float(input_data.get('tare_weight') or 0.0)
        net = round(val - tare, 3)

        # 1. Soft lookup từ station_weigh
        stn = db.query_one("SELECT * FROM station_weigh WHERE station_id = %s", [station_id])
        process_id = input_data.get('process_id') or (stn.get('process_id', 'CD001') if stn else 'CD001')
        type_weight = input_data.get('type_weight') or (stn.get('io_type', 'IN') if stn else 'IN')
        protocol = stn.get('protocol', 'TCP/IP') if stn else 'TCP/IP'

        # 2. Soft lookup từ product_stage_mapping & product
        product_id = input_data.get('product_id')
        if not product_id:
            try:
                prod_map = db.query_one(
                    "SELECT product_id FROM product_stage_mapping WHERE process_id = %s AND io_type = %s LIMIT 1",
                    [process_id, type_weight]
                )
                product_id = prod_map.get('product_id') if prod_map else None
            except Exception:
                product_id = None
            if not product_id:
                prod = db.query_one("SELECT product_id FROM product WHERE stage_id = %s LIMIT 1", [process_id])
                product_id = prod.get('product_id') if prod else 'TOM001'

        batch_id = input_data.get('batch_id') or 'L0001'
        employee_id = input_data.get('employee_id')
        source_method = input_data.get('source_method') or protocol
        time_iso = datetime.now(timezone.utc).isoformat()

        sql = """
            INSERT INTO production_weight_logs 
            (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """
        row = db.execute_returning(sql, [
            batch_id, station_id, process_id, product_id, type_weight, val, tare, net, time_iso, employee_id, source_method
        ])

        if row:
            return {
                'log_id': int(row.get('log_id') or 0),
                'batch_id': row.get('batch_id'),
                'station_id': row.get('station_id'),
                'process_id': row.get('process_id'),
                'product_id': row.get('product_id'),
                'type_weight': row.get('type_weight'),
                'value_weight': float(row.get('value_weight') or 0),
                'tare_weight': float(row.get('tare_weight') or 0),
                'net_weight': float(row.get('net_weight') or 0),
                'time_action': str(row.get('time_action')),
                'employee_id': row.get('employee_id'),
                'source_method': row.get('source_method')
            }
        
        return {
            'batch_id': batch_id,
            'station_id': station_id,
            'process_id': process_id,
            'product_id': product_id,
            'type_weight': type_weight,
            'value_weight': val,
            'tare_weight': tare,
            'net_weight': net,
            'time_action': time_iso,
            'employee_id': employee_id,
            'source_method': source_method
        }

    def create_logs_batch(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Xử lý chèn hàng loạt (Bulk Ingestion) cho 200 - 300 requests trong 1 transaction duy nhất"""
        if not items:
            return []

        station_rows = db.query_all("SELECT station_id, process_id, io_type, protocol FROM station_weigh")
        stn_map = {str(r['station_id']): r for r in station_rows}

        time_iso = datetime.now(timezone.utc).isoformat()
        records_to_insert = []
        result = []

        for item in items:
            station_id = str(item.get('station_id', ''))
            val = float(item.get('value_weight') or 0.0)
            tare = float(item.get('tare_weight') or 0.0)
            net = round(val - tare, 3)

            stn = stn_map.get(station_id, {})
            process_id = item.get('process_id') or stn.get('process_id', 'CD001')
            type_weight = item.get('type_weight') or stn.get('io_type', 'IN')
            protocol = stn.get('protocol', 'TCP/IP')
            product_id = item.get('product_id') or 'TOM001'
            batch_id = item.get('batch_id') or 'L0001'
            employee_id = item.get('employee_id')
            source_method = item.get('source_method') or protocol

            records_to_insert.append((
                batch_id, station_id, process_id, product_id, type_weight,
                val, tare, net, item.get('time_action') or time_iso, employee_id, source_method
            ))

            result.append({
                'batch_id': batch_id,
                'station_id': station_id,
                'process_id': process_id,
                'product_id': product_id,
                'type_weight': type_weight,
                'value_weight': val,
                'tare_weight': tare,
                'net_weight': net,
                'time_action': item.get('time_action') or time_iso,
                'employee_id': employee_id,
                'source_method': source_method
            })

        conn = db.get_connection()
        try:
            cur = conn.cursor()
            sql = """
                INSERT INTO production_weight_logs 
                (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            converted_sql = db._convert_sql(sql)
            cur.executemany(converted_sql, records_to_insert)
            conn.commit()
        finally:
            conn.close()

        return result

    def delete_log(self, log_id: int) -> None:
        db.execute("DELETE FROM production_weight_logs WHERE log_id = %s", [log_id])

    # ==========================================
    # 5. CHỈ SỐ SẢN XUẤT TÍNH TỪ DATABASE
    # ==========================================
    def get_metrics(self, batch_id: Optional[str] = None) -> Dict[str, Any]:
        logs = self.get_logs(batch_id)
        in_weight = 0.0
        out_weight = 0.0
        in_count = 0
        out_count = 0

        unique_batches = set()
        for l in logs:
            unique_batches.add(l['batch_id'])
            if l['type_weight'] == 'IN':
                in_weight += l['net_weight']
                in_count += 1
            else:
                out_weight += l['net_weight']
                out_count += 1

        wip = max(0.0, in_weight - out_weight)
        yield_rate = (out_weight / in_weight * 100) if in_weight > 0 else 0.0

        return {
            'totalInWeight': round(in_weight, 3),
            'totalOutWeight': round(out_weight, 3),
            'wipWeight': round(wip, 3),
            'yieldRate': round(yield_rate, 1),
            'inCount': in_count,
            'outCount': out_count,
            'activeBatchesCount': len(unique_batches)
        }

    def _ensure_batch_columns(self) -> None:
        if getattr(self, '_batch_cols_checked', False):
            return
        if db.is_postgres:
            sqls = [
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS planned_weight NUMERIC(12, 3) DEFAULT 0",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS start_date VARCHAR(30)",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS origin VARCHAR(150)",
                "ALTER TABLE batch ADD COLUMN IF NOT EXISTS notes TEXT"
            ]
        else:
            sqls = [
                "ALTER TABLE batch ADD COLUMN planned_weight REAL DEFAULT 0",
                "ALTER TABLE batch ADD COLUMN start_date TEXT",
                "ALTER TABLE batch ADD COLUMN origin TEXT",
                "ALTER TABLE batch ADD COLUMN notes TEXT"
            ]
        for sql in sqls:
            try:
                db.execute(sql)
            except Exception:
                pass
        self._batch_cols_checked = True

    def get_batches(self) -> List[str]:
        sql = """
            SELECT DISTINCT batch_id FROM (
                SELECT batch_id FROM batch WHERE status != 'CANCELLED'
                UNION
                SELECT batch_id FROM production_weight_logs WHERE batch_id NOT IN (
                    SELECT batch_id FROM batch WHERE status = 'CANCELLED'
                )
            ) sub ORDER BY batch_id ASC
        """
        rows = db.query_all(sql)
        return [r['batch_id'] for r in rows if r.get('batch_id')]

    def get_batches_details(self) -> List[Dict[str, Any]]:
        self._ensure_batch_columns()
        rows = db.query_all("SELECT * FROM batch ORDER BY created_at DESC, batch_id ASC")
        result = []
        for r in rows:
            status = r.get('status') or 'IN_PROGRESS'
            result.append({
                'batchId': r.get('batch_id'),
                'batchName': r.get('batch_name') or f"Lô {r.get('batch_id')}",
                'plannedWeight': float(r.get('planned_weight') or 0),
                'startDate': r.get('start_date') or '',
                'origin': r.get('origin') or '',
                'status': status,
                'notes': r.get('notes') or '',
                'isDeleted': status == 'CANCELLED'
            })
        return result

    def create_batch(
        self,
        batch_id: str,
        batch_name: str = '',
        status: str = 'IN_PROGRESS',
        planned_weight: float = 0.0,
        start_date: str = '',
        origin: str = '',
        notes: str = ''
    ) -> Dict[str, Any]:
        self._ensure_batch_columns()
        existing = db.query_one("SELECT batch_id FROM batch WHERE batch_id = %s", [batch_id])
        if existing:
            self.update_batch(batch_id, batch_name, status, planned_weight, start_date, origin, notes)
        else:
            sql = """
                INSERT INTO batch (batch_id, batch_name, planned_weight, start_date, origin, status, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            try:
                db.execute(sql, (batch_id, batch_name, float(planned_weight or 0), start_date, origin, status, notes))
            except Exception:
                pass
        return {
            'batchId': batch_id,
            'batch_id': batch_id,
            'batchName': batch_name,
            'batch_name': batch_name,
            'plannedWeight': float(planned_weight or 0),
            'startDate': start_date,
            'origin': origin,
            'status': status,
            'notes': notes
        }

    def update_batch(
        self,
        batch_id: str,
        batch_name: Optional[str] = None,
        status: Optional[str] = None,
        planned_weight: Optional[float] = None,
        start_date: Optional[str] = None,
        origin: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        self._ensure_batch_columns()
        fields = []
        params = []
        if batch_name is not None:
            fields.append("batch_name = %s")
            params.append(batch_name)
        if status is not None:
            fields.append("status = %s")
            params.append(status)
        if planned_weight is not None:
            fields.append("planned_weight = %s")
            params.append(float(planned_weight))
        if start_date is not None:
            fields.append("start_date = %s")
            params.append(start_date)
        if origin is not None:
            fields.append("origin = %s")
            params.append(origin)
        if notes is not None:
            fields.append("notes = %s")
            params.append(notes)
        if not fields:
            return True
        params.append(batch_id)
        sql = f"UPDATE batch SET {', '.join(fields)} WHERE batch_id = %s"
        try:
            db.execute(sql, tuple(params))
        except Exception:
            pass
        return True

    def delete_batch(self, batch_id: str) -> bool:
        """
        XOÁ MỀM (SOFT DELETE):
        Tuyệt đối không xoá cứng các dòng khỏi bảng batch hay production_weight_logs
        để bảo toàn toàn vẹn nhật ký mẻ cân, ngăn ngừa mồ côi dữ liệu (orphaned logs).
        """
        sql = "UPDATE batch SET status = 'CANCELLED' WHERE batch_id = %s"
        try:
            db.execute(sql, (batch_id,))
        except Exception:
            pass
        return True

    # ==========================================
    # 6. ĐỊNH MỨC CHUẨN & NGƯỠNG CẢNH BÁO (norm_settings)
    # ==========================================
    def _ensure_norm_table(self) -> None:
        if getattr(self, '_norm_table_checked', False):
            return
        sql = """
            CREATE TABLE IF NOT EXISTS norm_settings (
                scope_key VARCHAR(50) PRIMARY KEY,
                norms_json TEXT NOT NULL DEFAULT '{}',
                thresholds_json TEXT DEFAULT '{}',
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        """ if db.is_postgres else """
            CREATE TABLE IF NOT EXISTS norm_settings (
                scope_key TEXT PRIMARY KEY,
                norms_json TEXT NOT NULL DEFAULT '{}',
                thresholds_json TEXT DEFAULT '{}',
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """
        try:
            db.execute(sql)
        except Exception:
            pass
        self._norm_table_checked = True

    def get_norms(self) -> Dict[str, Any]:
        import json
        self._ensure_norm_table()
        rows = db.query_all("SELECT scope_key, norms_json, thresholds_json FROM norm_settings")
        global_norms: Dict[str, Any] = {}
        batch_norms: Dict[str, Dict[str, Any]] = {}
        thresholds: Dict[str, Any] = {}
        for r in rows:
            key = str(r.get('scope_key') or '')
            try:
                norms_val = json.loads(r.get('norms_json') or '{}')
            except Exception:
                norms_val = {}
            try:
                thresh_val = json.loads(r.get('thresholds_json') or '{}')
            except Exception:
                thresh_val = {}
            if key == 'GLOBAL':
                if isinstance(norms_val, dict):
                    global_norms = norms_val
                if isinstance(thresh_val, dict) and thresh_val:
                    thresholds = thresh_val
            elif key:
                if isinstance(norms_val, dict):
                    batch_norms[key] = norms_val
        return {
            'globalNorms': global_norms,
            'batchNorms': batch_norms,
            'thresholds': thresholds
        }

    def save_norms(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        import json
        self._ensure_norm_table()
        scope_key = str(payload.get('scopeKey') or 'GLOBAL').strip() or 'GLOBAL'
        if payload.get('deleteScope'):
            db.execute("DELETE FROM norm_settings WHERE scope_key = %s", [scope_key])
            return self.get_norms()

        norms_json = json.dumps(payload.get('norms') or {}, ensure_ascii=False)
        thresholds_json = json.dumps(payload.get('thresholds') or {}, ensure_ascii=False)
        existing = db.query_one("SELECT scope_key FROM norm_settings WHERE scope_key = %s", [scope_key])
        if existing:
            if payload.get('norms') is not None and payload.get('thresholds') is not None:
                db.execute(
                    "UPDATE norm_settings SET norms_json = %s, thresholds_json = %s WHERE scope_key = %s",
                    [norms_json, thresholds_json, scope_key]
                )
            elif payload.get('norms') is not None:
                db.execute(
                    "UPDATE norm_settings SET norms_json = %s WHERE scope_key = %s",
                    [norms_json, scope_key]
                )
            elif payload.get('thresholds') is not None:
                db.execute(
                    "UPDATE norm_settings SET thresholds_json = %s WHERE scope_key = %s",
                    [thresholds_json, scope_key]
                )
        else:
            db.execute(
                "INSERT INTO norm_settings (scope_key, norms_json, thresholds_json) VALUES (%s, %s, %s)",
                [scope_key, norms_json, thresholds_json]
            )
        return self.get_norms()


db_data_service = DBDataService()
