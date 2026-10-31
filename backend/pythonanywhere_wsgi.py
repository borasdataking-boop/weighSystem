# ==============================================================================
# HƯỚNG DẪN CẤU HÌNH WSGI TRÊN PYTHONANYWHERE
# File này được cấu hình tại: /var/www/<tên_tài_khoản>_pythonanywhere_com_wsgi.py
# (Nhấp vào liên kết WSGI configuration file trong thẻ 'Web' trên PythonAnywhere)
# ==============================================================================

import sys
import os
from pathlib import Path

# 1. THAY THẾ TÊN TÀI KHOẢN PYTHONANYWHERE CỦA BẠN TẠI ĐÂY:
USERNAME = 'phanbach'  # <-- Đổi thành username PythonAnywhere của bạn

# 2. ĐƯỜNG DẪN DỰ ÁN TRÊN PYTHONANYWHERE
PROJECT_FOLDER = f'/home/{USERNAME}/webDesignUI'

if PROJECT_FOLDER not in sys.path:
    sys.path.insert(0, PROJECT_FOLDER)

# 3. THIẾT LẬP BIẾN MÔI TRƯỜNG (Tùy chọn)
# Mặc định dùng SQLite (không cần cài đặt gì thêm, chạy ngay lập tức):
os.environ['DATABASE_URL'] = f'sqlite:///{PROJECT_FOLDER}/database/weigh_dashboard.db'

# Nếu dùng PostgreSQL remote (Supabase, Neon, RDS, ElephantSQL):
# os.environ['DATABASE_URL'] = 'postgresql://user:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'

os.environ['FLASK_ENV'] = 'production'

# 4. KHỞI TẠO BIẾN APPLICATION CHO PYTHONANYWHERE WSGI
from backend.app import app as application
