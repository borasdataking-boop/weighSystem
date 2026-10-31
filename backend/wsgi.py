"""
WSGI Entry point for Production (Gunicorn, uWSGI, PythonAnywhere)
Biến `application` là biến chuẩn mà uWSGI / PythonAnywhere tìm kiếm.
"""

import sys
from pathlib import Path

# Thêm root dự án vào sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app import app as application

if __name__ == "__main__":
    application.run()
