#!/usr/bin/env python3
"""
FLASK BACKEND & WSGI SERVER FOR WEIGH DASHBOARD
- Cung cấp toàn bộ REST API (/api/*) tương thích 100% với Frontend React
- Tự động phục vụ Static SPA Frontend từ thư mục dist/
- Sẵn sàng triển khai trên PythonAnywhere qua WSGI và chạy local độc lập
"""

import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Đảm bảo đường dẫn import hoạt động chuẩn
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import DIST_DIR, PUBLIC_DIR, PORT, FLASK_ENV, DATABASE_URL
from backend.services import db_data_service
from backend.iot_service import iot_scale_ingest_service
from backend.protocol_parser import parse_dini_argeo

# Khởi tạo Flask App (static_folder=None để custom route quản lý cả SPA routing và file tĩnh)
app = Flask(__name__, static_folder=None)
CORS(app)

# ==========================================
# 1. HEALTH CHECK & SYSTEM STATUS
# ==========================================
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        batches = db_data_service.get_batches()
        db_type = 'PostgreSQL' if (DATABASE_URL.startswith('postgres://') or DATABASE_URL.startswith('postgresql://')) else 'SQLite'
        return jsonify({
            'status': 'ok',
            'database': 'connected',
            'database_type': db_type,
            'batchesCount': len(batches)
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ==========================================
# 2. QUY TRÌNH & MAPPINGS (process, process_mapping)
# ==========================================
@app.route('/api/processes', methods=['GET'])
def get_processes():
    try:
        data = db_data_service.get_processes()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/processes', methods=['POST'])
def add_process():
    try:
        db_data_service.add_process(request.json or {})
        data = db_data_service.get_processes()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/processes/<process_id>', methods=['DELETE'])
def delete_process(process_id):
    try:
        db_data_service.delete_process(process_id)
        data = db_data_service.get_processes()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# 3. TRẠM CÂN (station_weigh)
# ==========================================
@app.route('/api/stations', methods=['GET'])
def get_stations():
    try:
        stations = db_data_service.get_stations()
        return jsonify(stations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stations', methods=['POST'])
def add_station():
    try:
        db_data_service.add_station(request.json or {})
        stations = db_data_service.get_stations()
        return jsonify(stations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stations/<station_id>', methods=['PUT'])
def update_station(station_id):
    try:
        data = request.json or {}
        data['stationId'] = station_id
        db_data_service.update_station(data)
        stations = db_data_service.get_stations()
        return jsonify(stations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stations/<station_id>', methods=['DELETE'])
def delete_station(station_id):
    try:
        db_data_service.delete_station(station_id)
        stations = db_data_service.get_stations()
        return jsonify(stations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# 4. SẢN PHẨM (product)
# ==========================================
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = db_data_service.get_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        db_data_service.add_product(request.json or {})
        products = db_data_service.get_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        db_data_service.delete_product(product_id)
        products = db_data_service.get_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# 5. NHẬT KÝ MẺ CÂN (production_weight_logs)
# ==========================================
@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        batch_id = request.args.get('batch_id')
        logs = db_data_service.get_logs(batch_id)
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['POST'])
def create_log():
    try:
        new_log = db_data_service.create_log(request.json or {})
        return jsonify(new_log), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_log(log_id):
    try:
        db_data_service.delete_log(log_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# 6. CHỈ SỐ KPI & LÔ SẢN XUẤT (metrics, batches)
# ==========================================
@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        batch_id = request.args.get('batch_id')
        metrics = db_data_service.get_metrics(batch_id)
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/batches', methods=['GET'])
def get_batches():
    try:
        batches = db_data_service.get_batches()
        return jsonify(batches), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# 7. IOT SCALE INGESTION (STM32 & Dini Argeo)
# ==========================================
@app.route('/api/iot/weigh', methods=['POST'])
def iot_weigh():
    try:
        result = iot_scale_ingest_service.ingest_from_stm32(request.json or {})
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/iot/scale-log', methods=['POST'])
def iot_scale_log_compat():
    try:
        body = request.json or {}
        raw_str = body.get('raw_string')
        if raw_str:
            parsed = parse_dini_argeo(raw_str)
            if not parsed['is_valid']:
                return jsonify({'success': False, 'error': parsed.get('error')}), 400
            payload = {
                'station_id': body.get('station_id') or 'UNKNOWN_STATION',
                'gross_weight': parsed['weight'],
                'tare_weight': parsed['tare'],
                'is_stable': parsed['is_stable'],
                'batch_id': body.get('batch_id'),
                'product_id': body.get('product_id'),
                'employee_id': body.get('employee_id')
            }
        else:
            payload = {
                'station_id': body.get('station_id'),
                'gross_weight': float(body.get('gross_weight') or 0.0),
                'tare_weight': float(body.get('tare_weight') or 0.0),
                'is_stable': body.get('is_stable', True),
                'batch_id': body.get('batch_id'),
                'product_id': body.get('product_id'),
                'employee_id': body.get('employee_id')
            }
        
        result = iot_scale_ingest_service.ingest_from_stm32(payload)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/iot/scale-status/<station_id>', methods=['GET'])
def iot_scale_status(station_id):
    process_id = iot_scale_ingest_service.lookup_station_process(station_id)
    io_type = iot_scale_ingest_service.lookup_station_io_type(station_id)
    return jsonify({
        'status': 'ONLINE',
        'station_id': station_id,
        'assigned_process': process_id,
        'io_type': io_type,
        'active_batch': iot_scale_ingest_service.get_active_batch()
    }), 200


# ==========================================
# 8. PHỤC VỤ FRONTEND SPA (Vite / React Build)
# ==========================================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # 1. Trả về JSON 404 nếu là đường dẫn API không tồn tại
    if path.startswith('api/'):
        return jsonify({'error': f'API endpoint not found: /{path}'}), 404

    # 2. Kiểm tra nếu file tồn tại trong dist/ (e.g. assets, js, css, hình ảnh)
    file_path = DIST_DIR / path
    if path and file_path.exists() and file_path.is_file():
        return send_from_directory(str(DIST_DIR), path)
    
    # 3. Kiểm tra nếu file nằm trong public/ (e.g. logo.png, processflow.jpg)
    public_file = PUBLIC_DIR / path
    if path and public_file.exists() and public_file.is_file():
        return send_from_directory(str(PUBLIC_DIR), path)

    # 4. Mọi đường dẫn client-side routing (SPA) fallback về index.html
    index_file = DIST_DIR / 'index.html'
    if index_file.exists():
        return send_from_directory(str(DIST_DIR), 'index.html')

    return jsonify({
        'message': 'Weigh Dashboard API Server is running.',
        'notice': 'Frontend bundle (dist/) not found. Run "npm run build" to compile the React frontend.'
    }), 200


if __name__ == '__main__':
    print(f"🚀 [PYTHON BACKEND] Running at http://localhost:{PORT}")
    print(f"📁 [STATIC DIR] Serving built React SPA from: {DIST_DIR}")
    print(f"📊 [DATABASE] Configured: {DATABASE_URL}")
    app.run(host='0.0.0.0', port=PORT, debug=(FLASK_ENV == 'development'))
