import os
from pathlib import Path

# Thư mục gốc dự án (webDesignUI)
BASE_DIR = Path(__file__).resolve().parent.parent

# Tải cấu hình từ .env nếu có thư viện python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
    load_dotenv(BASE_DIR / 'backend' / '.env')
except ImportError:
    pass

# Đường dẫn thư mục static / dist (Vite build)
DIST_DIR = BASE_DIR / 'dist'
PUBLIC_DIR = BASE_DIR / 'public'
DATABASE_DIR = BASE_DIR / 'database'

# Database URL:
# Mặc định dùng SQLite để chạy ngay lập tức trên PythonAnywhere Free Tier
DEFAULT_SQLITE_PATH = DATABASE_DIR / 'weigh_dashboard.db'
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{DEFAULT_SQLITE_PATH}')

PORT = int(os.getenv('PORT', 5001))
FLASK_ENV = os.getenv('FLASK_ENV', 'production')
SECRET_KEY = os.getenv('SECRET_KEY', 'pb-weigh-dashboard-secret-2026')
