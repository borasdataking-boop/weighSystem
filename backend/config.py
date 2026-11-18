import os
import json
from pathlib import Path

# Thư mục gốc dự án (webDesignUI)
BASE_DIR = Path(__file__).resolve().parent.parent

# 1. Tải cấu hình từ .env nếu có thư viện python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
    load_dotenv(BASE_DIR / 'backend' / '.env')
except ImportError:
    pass

# 2. Đọc cấu hình ngoài luồng từ db_config.json (ưu tiên cao nhất để team chỉ cần dán link DB)
DB_CONFIG_PATH = BASE_DIR / 'db_config.json'
_external_db_url = ''
if DB_CONFIG_PATH.exists():
    try:
        with open(DB_CONFIG_PATH, 'r', encoding='utf-8') as f:
            _cfg = json.load(f)
            if isinstance(_cfg, dict) and _cfg.get('DATABASE_URL'):
                _external_db_url = str(_cfg['DATABASE_URL']).strip()
    except Exception:
        pass

# Đường dẫn thư mục static / dist (Vite build)
DIST_DIR = BASE_DIR / 'dist'
PUBLIC_DIR = BASE_DIR / 'public'
DATABASE_DIR = BASE_DIR / 'database'

# Database URL:
# Thứ tự ưu tiên: db_config.json -> biến môi trường DATABASE_URL -> PostgreSQL mặc định
DEFAULT_SQLITE_PATH = DATABASE_DIR / 'weigh_dashboard.db'
DATABASE_URL = _external_db_url or os.getenv('DATABASE_URL', 'postgresql://phanbach@localhost:5432/weigh_dashboard')

PORT = int(os.getenv('PORT', 5001))
FLASK_ENV = os.getenv('FLASK_ENV', 'production')
SECRET_KEY = os.getenv('SECRET_KEY', 'pb-weigh-dashboard-secret-2026')
