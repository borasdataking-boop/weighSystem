#!/bin/bash
# ==============================================================================
# PHAN BACH WEIGH DASHBOARD - SCRIPT CẬP NHẬT MÃ NGUỒN TỰ ĐỘNG
# Dành cho PythonAnywhere và máy chủ Linux
# ==============================================================================
set -e

echo "=================================================="
echo "🚀 ĐANG CẬP NHẬT HỆ THỐNG WEIGH DASHBOARD..."
echo "=================================================="

# 1. Chuyển vào thư mục chứa script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 2. Kéo mã nguồn mới nhất từ GitHub
echo "📥 [1/4] Đang kéo mã nguồn mới từ nhánh main..."
git fetch origin main
git reset --hard origin/main

# 3. Kích hoạt môi trường ảo Python & Cập nhật thư viện
echo "🐍 [2/4] Kiểm tra môi trường Python..."
if [ -f "$HOME/.virtualenvs/weigh_env/bin/activate" ]; then
    source "$HOME/.virtualenvs/weigh_env/bin/activate"
    pip install -r backend/requirements.txt --quiet
elif [ -d "venv" ]; then
    source "venv/bin/activate"
    pip install -r backend/requirements.txt --quiet
fi

# 4. Kiểm tra và đảm bảo Database sẵn sàng
echo "📦 [3/4] Đồng bộ cơ sở dữ liệu..."
python3 -c "
from pathlib import Path
db_path = Path('database/weigh_dashboard.db')
if not db_path.exists():
    from database.seed_data import seed_sqlite
    seed_sqlite(db_path)
    print('  ✅ Đã tự động khởi tạo database SQLite')
else:
    print('  ✅ Database hiện có đã sẵn sàng')
"

# 5. Tự động Reload Web App trên PythonAnywhere
echo "🔄 [4/4] Khởi động lại ứng dụng web..."
WSGI_FILE=$(find /var/www -name "*_wsgi.py" 2>/dev/null | head -n 1)
if [ -n "$WSGI_FILE" ]; then
    touch "$WSGI_FILE"
    echo "  ✅ Đã reload Web App thành công qua: $WSGI_FILE"
else
    echo "  ℹ️  (Môi trường local: Khởi động lại service bằng 'python backend/app.py')"
fi

echo "=================================================="
echo "🎉 CẬP NHẬT THÀNH CÔNG! HỆ THỐNG ĐÃ HOẠT ĐỘNG VỚI CODE MỚI NHẤT."
echo "=================================================="
