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
        stage_rows = db.query_all(
            "SELECT * FROM process WHERE is_active = 1 OR is_active = TRUE ORDER BY row_index ASC, col_index ASC, process_id ASC"
        )
        mapping_rows = db.query_all(
            "SELECT * FROM process_mapping WHERE is_active = 1 OR is_active = TRUE ORDER BY order_index ASC"
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
        is_active = 1 if p.get('isActive', True) else 0

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
        is_active = 1 if s.get('isActive', True) else 0
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
    # 3. SẢN PHẨM (product)
    # ==========================================
    def get_products(self) -> List[Dict[str, Any]]:
        rows = db.query_all("SELECT * FROM product ORDER BY stage_id ASC, product_id ASC")
        result = []
        for r in rows:
            result.append({
                'id': r.get('product_id'),
                'name': r.get('product_name'),
                'stageId': r.get('stage_id'),
                'type': r.get('type'),
                'unit': r.get('unit'),
                'spec': r.get('spec'),
                'isEnd': bool(r.get('is_end', False))
            })
        return result

    def add_product(self, p: Dict[str, Any]) -> None:
        p_id = p.get('id') or p.get('product_id')
        name = p.get('name') or p.get('product_name')
        stage_id = p.get('stageId') or p.get('stage_id') or 'CD001'
        p_type = p.get('type', 'SEMI')
        unit = p.get('unit', 'kg')
        spec = p.get('spec', '')
        is_end = 1 if p.get('isEnd') or p.get('is_end') else 0

        existing = db.query_one("SELECT product_id FROM product WHERE product_id = %s", [p_id])
        if existing:
            sql = """
                UPDATE product SET 
                  product_name = %s, stage_id = %s, type = %s, unit = %s, spec = %s, is_end = %s
                WHERE product_id = %s
            """
            db.execute(sql, [name, stage_id, p_type, unit, spec, is_end, p_id])
        else:
            sql = """
                INSERT INTO product (product_id, product_name, stage_id, type, unit, spec, is_end)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            db.execute(sql, [p_id, name, stage_id, p_type, unit, spec, is_end])

    def delete_product(self, product_id: str) -> None:
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

        # 2. Soft lookup từ product
        product_id = input_data.get('product_id')
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

    def create_batch(self, batch_id: str, batch_name: str = '', status: str = 'IN_PROGRESS') -> Dict[str, Any]:
        sql = "INSERT INTO batch (batch_id, batch_name, status) VALUES (%s, %s, %s)"
        try:
            db.execute(sql, (batch_id, batch_name, status))
        except Exception:
            pass
        return {'batch_id': batch_id, 'batch_name': batch_name, 'status': status}

    def update_batch(self, batch_id: str, batch_name: Optional[str] = None, status: Optional[str] = None) -> bool:
        fields = []
        params = []
        if batch_name is not None:
            fields.append("batch_name = %s")
            params.append(batch_name)
        if status is not None:
            fields.append("status = %s")
            params.append(status)
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


db_data_service = DBDataService()
