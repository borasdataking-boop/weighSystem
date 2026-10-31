"""
BỘ PHÂN TÍCH GIAO THỨC CHUỖI ASCII ĐẦU CÂN DINI ARGEO (DFWL, 3590E, DGT)
Chuyển đổi từ TypeScript (diniArgeoProtocolParser.ts) sang Python
"""

import re
from typing import Dict, Any

def parse_dini_argeo(raw_input: str) -> Dict[str, Any]:
    raw = (raw_input or '').strip()
    if not raw:
        return {
            'is_valid': False,
            'is_stable': False,
            'is_overload': False,
            'type_weight': 'GS',
            'weight': 0.0,
            'tare': 0.0,
            'unit': 'kg',
            'error': 'Chuỗi dữ liệu rỗng',
            'raw_string': raw_input
        }

    parts = [p.strip() for p in raw.split(',')]
    if len(parts) < 3:
        return {
            'is_valid': False,
            'is_stable': False,
            'is_overload': False,
            'type_weight': 'GS',
            'weight': 0.0,
            'tare': 0.0,
            'unit': 'kg',
            'error': f'Định dạng Dini Argeo không hợp lệ: {raw}',
            'raw_string': raw_input
        }

    status_code = parts[0].upper()
    type_code = 'NT' if parts[1].upper() == 'NT' else 'GS'
    weight_str = re.sub(r'\s+', '', parts[2])
    unit = (parts[3] if len(parts) > 3 else 'kg').lower()

    is_stable = (status_code == 'ST')
    is_overload = (status_code == 'OL')

    try:
        weight = float(weight_str)
    except ValueError:
        return {
            'is_valid': False,
            'is_stable': is_stable,
            'is_overload': is_overload,
            'type_weight': type_code,
            'weight': 0.0,
            'tare': 0.0,
            'unit': unit,
            'error': f'Không thể đọc giá trị số từ chuỗi: "{weight_str}"',
            'raw_string': raw_input
        }

    tare = 0.0
    for idx, part in enumerate(parts):
        if part.upper() == 'TR' and idx + 1 < len(parts):
            try:
                clean_tare = re.sub(r'\s+', '', parts[idx + 1])
                tare = float(clean_tare)
            except ValueError:
                pass
            break

    return {
        'is_valid': True,
        'is_stable': is_stable,
        'is_overload': is_overload,
        'type_weight': type_code,
        'weight': round(weight, 3),
        'tare': round(tare, 3),
        'unit': unit,
        'raw_string': raw_input
    }
