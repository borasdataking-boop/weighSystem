"""
IoT Scale Ingestion Service (Python)
Xử lý bản tin cân tự động nhận từ STM32 / Đầu cân Dini Argeo
Bộ đệm chống ghi trùng lặp (Anti-Bounce / Debounce) & Tra cứu tự động công đoạn
"""

import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.db import db

# Bộ nhớ đệm chống ghi trùng lặp (Debounce Cache)
_last_recorded_scale_map: Dict[str, Dict[str, float]] = {}

STATION_PROCESS_MAP = {
    '10244156': 'CD001', 'CAN001': 'CD001', 'CAN002': 'CD001', '7779460': 'CD001',
    '10244157': 'CD002', '10244173': 'CD002',
    '10244158': 'CD003', '10244174': 'CD003',
    '10244159': 'CD004', '10244175': 'CD004',
    '10244160': 'CD005', '10244176': 'CD005',
    '10244161': 'CD006',
    '10244162': 'CD007', '10244177': 'CD007',
    '10244163': 'CD008',
    '10244164': 'CD009', '10244178': 'CD009',
    '10244165': 'CD010', '10244179': 'CD010',
    '10244166': 'CD011', '10244180': 'CD011',
    '10244167': 'CD012',
    '10244168': 'CD013',
    '10244169': 'CD014', '10244181': 'CD014',
    '10244170': 'CD015'
}

OUT_STATIONS = {
    '10244161', '10244163', '10244167', '10244168', '10244170',
    '10244173', '10244174', '10244175', '10244176', '10244177',
    '10244178', '10244179', '10244180', '10244181'
}

DEFAULT_PRODUCTS = {
    'CD001': 'TOM001',
    'CD002': 'SP-PC-01',
    'CD003': 'SP-XK-01',
    'CD004': 'SP-BV-01',
    'CD015': 'SP-IC-01'
}


class IoTScaleIngestService:
    @staticmethod
    def lookup_station_process(station_id: str) -> str:
        # Tra cứu từ DB nếu có, fallback sang bảng tĩnh
        row = db.query_one("SELECT process_id FROM station_weigh WHERE station_id = %s", [station_id])
        if row and row.get('process_id'):
            return row['process_id']
        return STATION_PROCESS_MAP.get(station_id, 'CD001')

    @staticmethod
    def lookup_station_io_type(station_id: str) -> str:
        row = db.query_one("SELECT io_type FROM station_weigh WHERE station_id = %s", [station_id])
        if row and row.get('io_type'):
            return row['io_type']
        return 'OUT' if station_id in OUT_STATIONS else 'IN'

    @staticmethod
    def get_active_batch() -> str:
        return 'L0001'

    @staticmethod
    def get_default_product_for_stage(process_id: str) -> str:
        row = db.query_one("SELECT product_id FROM product WHERE stage_id = %s LIMIT 1", [process_id])
        if row and row.get('product_id'):
            return row['product_id']
        return DEFAULT_PRODUCTS.get(process_id, 'TOM001')

    def ingest_from_stm32(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        station_id = str(payload.get('station_id', ''))
        gross_weight = float(payload.get('gross_weight', 0.0))
        tare_weight = float(payload.get('tare_weight', 0.0))
        is_stable = bool(payload.get('is_stable', True))

        # 1. Chỉ nhận khi cân ổn định (ST)
        if not is_stable:
            return {
                'success': False,
                'skipped': True,
                'message': f'Bỏ qua: Cân {station_id} đang dao động (chưa ổn định ST).'
            }

        # 2. Lọc tải rỗng (về 0)
        net = round(gross_weight - tare_weight, 3)
        if net <= 0.1:
            if station_id in _last_recorded_scale_map:
                del _last_recorded_scale_map[station_id]
            return {
                'success': True,
                'skipped': True,
                'message': f'Bàn cân {station_id} đang trống (về 0 kg). Sẵn sàng nhận mẻ mới.'
            }

        # 3. Debounce filter
        now_ts = time.time()
        last_rec = _last_recorded_scale_map.get(station_id)
        if last_rec:
            time_diff = now_ts - last_rec['timestamp']
            weight_diff = abs(net - last_rec['weight'])
            if time_diff < 8.0 and weight_diff < 0.2:
                return {
                    'success': True,
                    'skipped': True,
                    'message': f'Bỏ qua: Mẻ cân {net} kg trên cân {station_id} đã được ghi nhận trước đó.'
                }

        # 4. Tra cứu công đoạn và loại IN/OUT
        assigned_process_id = self.lookup_station_process(station_id)
        assigned_io_type = self.lookup_station_io_type(station_id)
        batch_id = payload.get('batch_id') or self.get_active_batch()
        product_id = payload.get('product_id') or self.get_default_product_for_stage(assigned_process_id)
        time_iso = datetime.now(timezone.utc).isoformat()

        # 5. Lưu vào Database
        sql = """
            INSERT INTO production_weight_logs 
            (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        record = {
            'batch_id': batch_id,
            'station_id': station_id,
            'process_id': assigned_process_id,
            'product_id': product_id,
            'type_weight': assigned_io_type,
            'value_weight': gross_weight,
            'tare_weight': tare_weight,
            'net_weight': net,
            'time_action': time_iso,
            'employee_id': payload.get('employee_id'),
            'source_method': 'STM32_DINI_IOT'
        }

        db.execute(sql, [
            record['batch_id'],
            record['station_id'],
            record['process_id'],
            record['product_id'],
            record['type_weight'],
            record['value_weight'],
            record['tare_weight'],
            record['net_weight'],
            record['time_action'],
            record['employee_id'],
            record['source_method']
        ])

        _last_recorded_scale_map[station_id] = {'weight': net, 'timestamp': now_ts}

        return {
            'success': True,
            'message': f'Đã ghi nhận thành công mẻ cân {net} kg từ trạm {station_id}.',
            'record': record
        }


iot_scale_ingest_service = IoTScaleIngestService()
